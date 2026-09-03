export type Item = {
  id: string;
  name: string;
  createdAt: string;
};

/**
 * items-service now owns the actual JSON-file store (see
 * ../items-service/src/db.ts). This is a thin HTTP client, not a
 * function-level const, so tests can point it at a fake server per-test
 * without needing a module reload.
 */
function itemsServiceUrl(): string {
  return process.env.ITEMS_SERVICE_URL ?? "http://localhost:4000";
}

export async function getItems(): Promise<Item[]> {
  const res = await fetch(`${itemsServiceUrl()}/items`);
  if (!res.ok) {
    throw new Error(`items-service returned ${res.status} for GET /items`);
  }
  const data = (await res.json()) as { items: Item[] };
  return data.items;
}

export async function addItem(name: string): Promise<Item> {
  const res = await fetch(`${itemsServiceUrl()}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = (await res.json().catch(() => ({}))) as { item?: Item; error?: string };
  if (!res.ok || !data.item) {
    throw new Error(data.error ?? `items-service returned ${res.status} for POST /items`);
  }
  return data.item;
}
