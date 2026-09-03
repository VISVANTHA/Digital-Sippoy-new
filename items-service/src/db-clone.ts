/**
 * Deliberate duplication fixture for jscpd (Code Duplication metrics).
 *
 * Moved here from the web gateway's lib/db-clone.ts when the
 * microservices split happened: items-service is now the component that
 * actually owns file I/O, so this is the natural home for the clone-pair
 * fixture jscpd is meant to detect. Never imported by any real code --
 * see jscpd.json for scan config.
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { Item } from "./db";

const DATA_FILE = path.join(process.cwd(), "data", "items.json");

async function readAllClone(): Promise<Item[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Item[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

async function writeAllClone(items: Item[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function addItemCopy(name: string): Promise<Item> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Item name must not be empty");
  }
  const items = await readAllClone();
  const item: Item = {
    id: crypto.randomUUID(),
    name: trimmed,
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  await writeAllClone(items);
  return item;
}
