import http from "node:http";
import type { AddressInfo } from "node:net";

export type FakeItem = { id: string; name: string; createdAt: string };

/**
 * A real, listening HTTP server standing in for items-service in web's
 * own tests -- so lib/db.ts is exercised making genuine network calls,
 * not a mocked fetch. items-service has its own full test suite for its
 * own logic (test/server.test.ts in items-service/); this double only
 * needs to be faithful enough for web's request/response-shaping tests.
 */
export function startFakeItemsService(initialItems: FakeItem[] = []) {
  let items = [...initialItems];
  let nextId = items.length + 1;

  const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/items") {
      // Mirrors items-service's own newest-first sort, so this double
      // stays faithful to what callers actually observe.
      const sorted = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ items: sorted }));
      return;
    }

    if (req.method === "POST" && req.url === "/items") {
      let body = "";
      req.on("data", (chunk: Buffer) => {
        body += chunk.toString("utf-8");
      });
      req.on("end", () => {
        handlePost(body, res, () => items, (next) => (items = next), () => nextId++);
      });
      return;
    }

    res.writeHead(404).end();
  });

  return new Promise<{
    url: string;
    close: () => Promise<void>;
    reset: (nextItems: FakeItem[]) => void;
      }>((resolve) => {
        server.listen(0, "127.0.0.1", () => {
          const { port } = server.address() as AddressInfo;
          resolve({
            url: `http://127.0.0.1:${port}`,
            close: () => new Promise((r) => server.close(() => r())),
            reset: (nextItems) => {
              items = [...nextItems];
            },
          });
        });
      });
}

function handlePost(
  body: string,
  res: http.ServerResponse,
  getItems: () => FakeItem[],
  setItems: (items: FakeItem[]) => void,
  takeId: () => number
): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body || "{}");
  } catch {
    respond(res, 400, { error: "Invalid JSON body" });
    return;
  }

  const name = (parsed as { name?: unknown })?.name;
  if (typeof name !== "string" || name.trim().length === 0) {
    respond(res, 400, { error: "`name` is required and must be a non-empty string" });
    return;
  }
  if (name.trim().length > 200) {
    respond(res, 400, { error: "`name` must be 200 characters or fewer" });
    return;
  }

  const item: FakeItem = {
    id: String(takeId()),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  setItems([...getItems(), item]);
  respond(res, 201, { item });
}

function respond(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

/**
 * The before/afterEach/after wiring below was previously copy-pasted
 * between test/api/items.test.ts and test/lib/db.test.ts (jscpd caught
 * it as a real, accidental clone -- not a fixture). Both files should
 * call this once inside their describe() block instead.
 */
export function useFakeItemsService(seed: FakeItem[]) {
  let fake: Awaited<ReturnType<typeof startFakeItemsService>>;
  let originalUrl: string | undefined;

  before(async () => {
    originalUrl = process.env.ITEMS_SERVICE_URL;
    fake = await startFakeItemsService(seed);
    process.env.ITEMS_SERVICE_URL = fake.url;
  });

  afterEach(() => {
    fake.reset(seed);
  });

  after(async () => {
    await fake.close();
    process.env.ITEMS_SERVICE_URL = originalUrl;
  });

  return {
    get url(): string {
      return fake.url;
    },
  };
}

/**
 * Points ITEMS_SERVICE_URL at a minimal, custom HTTP server for the
 * duration of `run`, then restores it. Takes `req` as well as `res` so
 * it covers both "items-service returns a bad response" tests (which
 * only need `res`) and "assert on what we sent" tests (which need
 * `req`) -- the two shapes were near-identical without this (also
 * jscpd-flagged).
 */
export async function withBrokenServer(
  respond: (res: http.ServerResponse, req: http.IncomingMessage) => void,
  restoreUrl: string,
  run: () => Promise<void>
): Promise<void> {
  const server = http.createServer((req, res) => respond(res, req));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  process.env.ITEMS_SERVICE_URL = `http://127.0.0.1:${port}`;
  try {
    await run();
  } finally {
    process.env.ITEMS_SERVICE_URL = restoreUrl;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
