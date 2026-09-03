import assert from "node:assert/strict";
import { GET, POST } from "../../app/api/items/route";
import { ITEM_NAME_MAX_LENGTH } from "../../lib/validate";
import { authenticatedRequest, anonymousRequest } from "../helpers/session";
import { useFakeItemsService, type FakeItem } from "../helpers/fake-items-service";

const ITEMS_URL = "http://localhost/api/items";
const SEED: FakeItem[] = [
  { id: "1", name: "Existing item", createdAt: "2024-01-01T00:00:00.000Z" },
];

async function authedPost(body: unknown) {
  const request = await authenticatedRequest(ITEMS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return POST(request);
}

async function assertPostRejects(body: unknown, expectedError: RegExp): Promise<void> {
  const res = await authedPost(body);
  assert.equal(res.status, 400);
  const responseBody = (await res.json()) as { error: string };
  assert.match(responseBody.error, expectedError);
}

async function assertUnauthorized(res: Response): Promise<void> {
  assert.equal(res.status, 401);
  const body = (await res.json()) as { error: string };
  assert.equal(body.error, "Authentication required");
}

describe("items API route (App Router)", () => {
  const service = useFakeItemsService(SEED);

  it("GET without a session returns 401 with an explanatory message", async () => {
    const res = await GET(anonymousRequest(ITEMS_URL));
    await assertUnauthorized(res);
  });

  it("POST without a session returns 401 and never reaches items-service", async () => {
    const res = await POST(
      anonymousRequest(ITEMS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Should not be created" }),
      })
    );
    await assertUnauthorized(res);

    const afterRes = await GET(await authenticatedRequest(ITEMS_URL));
    const afterBody = (await afterRes.json()) as { items: unknown[] };
    assert.equal(afterBody.items.length, SEED.length);
  });

  it("GET with a valid session returns 200 and items-service's items", async () => {
    const res = await GET(await authenticatedRequest(ITEMS_URL));
    assert.equal(res.status, 200);
    const body = (await res.json()) as { items: unknown[] };
    assert.deepEqual(body.items, SEED);
  });

  it("POST with a valid session and body returns 201 and the created item", async () => {
    const res = await authedPost({ name: "Chair" });
    assert.equal(res.status, 201);
    const body = (await res.json()) as { item: { name: string } };
    assert.equal(body.item.name, "Chair");
  });

  it("POST with an empty name returns 400 with the validation message", async () => {
    await assertPostRejects({ name: "" }, /non-empty string/);
  });

  it("POST with a missing name field returns 400 with the validation message", async () => {
    await assertPostRejects({}, /non-empty string/);
  });

  it("POST with a null body returns 400 via the validation message, not a crash", async () => {
    // Exercises the `(body as {...})?.name` optional chain. Without it,
    // reading `.name` off a null body throws a TypeError that the same
    // catch block also turns into a 400 -- so the status code alone can't
    // tell them apart; the message can, since only the real validation
    // path produces "non-empty string".
    await assertPostRejects(null, /non-empty string/);
  });

  it("POST with an over-long name returns 400 (a cap the old manual check lacked)", async () => {
    const overLong = "x".repeat(ITEM_NAME_MAX_LENGTH + 1);
    await assertPostRejects({ name: overLong }, /200 characters or fewer/);
  });

  it("POST with malformed JSON returns 400 with the parse-error message", async () => {
    await assertPostRejects("not-json", /^Invalid JSON body$/);
  });

  it("GET surfaces an items-service outage as a 502, not a crash", async () => {
    process.env.ITEMS_SERVICE_URL = "http://127.0.0.1:47999";
    try {
      const res = await GET(await authenticatedRequest(ITEMS_URL));
      assert.equal(res.status, 502);
    } finally {
      process.env.ITEMS_SERVICE_URL = service.url;
    }
  });
});
