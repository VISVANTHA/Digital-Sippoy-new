import express, { type Request, type Response, type NextFunction } from "express";
import { addItem, getItems } from "./db";

/**
 * No auth here: the trust boundary is the web gateway, which already
 * checks the user's session before ever calling this service (see the
 * gateway's lib/db.ts / ITEMS_SERVICE_URL). items-service only needs to
 * be reachable from the gateway's network, not from the public internet
 * directly -- documented in COMPLIANCE.md alongside the gateway's V4
 * row.
 */
export function createServer() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.get("/items", async (_req: Request, res: Response, next: NextFunction) => {
    // Express 4 does not catch rejections from async handlers itself --
    // without this catch, a thrown error here (e.g. a non-ENOENT read
    // failure) leaves the request hanging with no response at all,
    // rather than failing fast. Caught by a real test, not by inspection.
    try {
      const items = await getItems();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  app.post("/items", async (req: Request, res: Response) => {
    try {
      const item = await addItem((req.body as { name?: unknown })?.name);
      res.status(201).json({ item });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Invalid `name`" });
    }
  });

  // Malformed JSON bodies reach here via express.json()'s own parse error.
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
    next(err);
  });

  // Final fallback: any other unhandled error (e.g. a non-ENOENT read
  // failure from GET /items) becomes a real 500 response instead of a
  // hung connection.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
