# items-service

Standalone Node/Express HTTP service owning `data/items.json`. Introduced when the 16
`Microservices`-labelled `DS-0xx` branches moved from a label-only architecture note to a real
service split — see [`../COMPLIANCE.md`](../COMPLIANCE.md) and the branch's own `README.md`.

Built **once, uniformly** on `npm` across all 16 branches: it isn't part of the original bundler ×
package-manager × router build matrix (that matrix describes the `web` gateway, which keeps its own
per-branch identity).

## API

| Method | Path | Response |
|---|---|---|
| `GET` | `/health` | `{ "status": "ok" }` |
| `GET` | `/items` | `{ "items": Item[] }`, newest first |
| `POST` | `/items` | `{ "item": Item }` (201) or `{ "error": string }` (400) |

No authentication here — the trust boundary is the `web` gateway, which already checks the caller's
session before ever making a request to this service. `items-service` only needs to be reachable
from the gateway's network (see `../docker-compose.yml`), not from the public internet directly.

## Run

```bash
npm install
npm run dev      # ts-node, :4000 by default (PORT env var to override)
npm run build && npm start   # compiled
```

## Quality tooling

Same shape as the `web` gateway's Phases 1–4: `npm run lint`, `npm run dup` (jscpd —
`src/db-clone.ts` is the one deliberate exception, same pattern as the gateway's), `npm test` /
`npm run test:coverage` / `npm run test:coverage:gate` (mocha + supertest + nyc).
