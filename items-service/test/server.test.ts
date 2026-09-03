import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import request from "supertest";
import { createServer } from "../src/server";
import { ITEM_NAME_MAX_LENGTH } from "../src/validate";

const DATA_FILE = path.join(process.cwd(), "data", "items.json");
const app = createServer();

async function restoreDataFile(original: string | null): Promise<void> {
  if (original !== null) {
    await fs.writeFile(DATA_FILE, original, "utf-8");
  } else {
    await fs.rm(DATA_FILE, { force: true });
  }
}

async function seedDataFile(
  items: { id: string; name: string; createdAt: string }[]
): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(items), "utf-8");
}

async function assertItemsOrder(expectedIds: string[]): Promise<void> {
  const res = await request(app).get("/items");
  assert.deepEqual(
    res.body.items.map((i: { id: string }) => i.id),
    expectedIds
  );
}

describe("items-service HTTP API", () => {
  let originalData: string | null;

  before(async () => {
    originalData = await fs.readFile(DATA_FILE, "utf-8").catch(() => null);
  });

  afterEach(async () => {
    await restoreDataFile(originalData);
  });

  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
  });

  it("GET /items returns 200 and a list", async () => {
    const res = await request(app).get("/items");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.items));
  });

  it("POST /items with a valid body returns 201 and the created item", async () => {
    const res = await request(app).post("/items").send({ name: "Chair" });
    assert.equal(res.status, 201);
    assert.equal(res.body.item.name, "Chair");
  });

  it("POST /items with an empty name returns 400", async () => {
    const res = await request(app).post("/items").send({ name: "" });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /non-empty string/);
  });

  it("POST /items with a non-string name returns 400", async () => {
    const res = await request(app).post("/items").send({ name: 42 });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /non-empty string/);
  });

  it("POST /items with a missing name field returns 400", async () => {
    const res = await request(app).post("/items").send({});
    assert.equal(res.status, 400);
    assert.match(res.body.error, /non-empty string/);
  });

  it("POST /items with an over-long name returns 400", async () => {
    const res = await request(app)
      .post("/items")
      .send({ name: "x".repeat(ITEM_NAME_MAX_LENGTH + 1) });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /200 characters or fewer/);
  });

  it("POST /items with malformed JSON returns 400", async () => {
    const res = await request(app)
      .post("/items")
      .set("Content-Type", "application/json")
      .send("not-json");
    assert.equal(res.status, 400);
    assert.equal(res.body.error, "Invalid JSON body");
  });

  it("returns items newest-first", async () => {
    await seedDataFile([
      { id: "a", name: "Older", createdAt: "2024-01-01T00:00:00.000Z" },
      { id: "b", name: "Newer", createdAt: "2024-06-01T00:00:00.000Z" },
    ]);
    await assertItemsOrder(["b", "a"]);
  });

  it("leaves an already-sorted file unchanged (comparator isn't a blind reversal)", async () => {
    await seedDataFile([
      { id: "b", name: "Newer", createdAt: "2024-06-01T00:00:00.000Z" },
      { id: "a", name: "Older", createdAt: "2024-01-01T00:00:00.000Z" },
    ]);
    await assertItemsOrder(["b", "a"]);
  });

  it("returns an empty array when the data file is missing (ENOENT)", async () => {
    await fs.rm(DATA_FILE, { force: true });
    const res = await request(app).get("/items");
    assert.deepEqual(res.body.items, []);
  });

  it("propagates non-ENOENT read errors as a 500 instead of an empty list", async () => {
    // Replace the data file with a directory of the same name: reading it
    // fails with EISDIR, not ENOENT, so getItems() must propagate the
    // error rather than treating it like a missing file.
    await fs.rm(DATA_FILE, { force: true, recursive: true });
    await fs.mkdir(DATA_FILE, { recursive: true });
    try {
      const res = await request(app).get("/items");
      assert.equal(res.status, 500);
    } finally {
      await fs.rm(DATA_FILE, { force: true, recursive: true });
    }
  });
});
