# Compliance mapping — DS-002

Short, honest mapping of this branch against **OWASP ASVS** (Application
Security Verification Standard), the natural fit for a web app. Scope is
this branch's small "items" CRUD fixture, not a production system — see
[README.md](README.md) for what the fixture actually does. This document
gets copied and re-verified per-branch as Phase 6 of the [remediation
plan](https://github.com/Mohammed-shihaf/Digital-Sippoy) rolls out, the
same way `eslint.config.mjs`, `.nycrc.json`, and the rest of the tooling
added in Phases 1–5 does.

This branch is now a **real two-service split**, not a label: `web` (this
branch, the gateway — UI, login, session auth) and
[`items-service/`](items-service/) (a separate Node/Express service owning
`data/items.json`, called over HTTP). `items-service` has no authentication
of its own — the trust boundary is the gateway's network, not a second
auth check, which is the standard pattern for an internal-only service and
is called out explicitly in the V4 row below.

Target: **ASVS Level 1** (the baseline level, appropriate for a reference
fixture with no real user data). Status values: **Met**, **Accepted gap**
(deliberately not addressed, with a reason), **Open** (needs an owner
decision before it can be closed).

| ASVS area | Status | Notes |
|---|---|---|
| V5 — Validation, Sanitization | Met | `lib/validate.ts` (zod schema): required, non-empty after trim, 200-char max. Applied at the one entry point (`POST /api/items`). |
| V7 — Error Handling, Logging | Met | Errors return structured JSON with a specific status code; no stack traces or internals leak to the client. |
| V10 — Malicious/Dead Code | Met | `lib/lint-fixtures.ts` and `items-service/src/db-clone.ts` are the intentional exceptions — clearly-labeled, unimported scanner fixtures (Phases 1–2), not reachable app code. |
| V14 — Configuration | Met | `.gitignore` keeps every generated report (lint, coverage, mutation, duplication) out of the repo; dependency versions are pinned in `package.json` + lockfile. |
| V1 — Architecture, Threat Modeling | Accepted gap | No formal threat model exists for a fixture this small; the attack surface is one API route over a JSON file, documented in the README instead of a separate model. |
| V4 — Access Control | Met | `GET`/`POST /api/items` on the gateway require a valid session (`lib/require-session.ts`, checked via `next-auth/jwt`'s `getToken()`); unauthenticated requests get 401 and `items-service` is never called. `items-service` itself has no auth check — it trusts the gateway's network, the standard internal-service trust-boundary pattern, not a gap. Verified with real signed JWTs in tests, plus a live two-process end-to-end smoke test (gateway + items-service both actually running): login → cookie → 200 with real data; no cookie → 401; wrong password → rejected; an authenticated POST through the gateway confirmed to land in items-service's own store by querying it directly. |
| V3 — Session Management | Met | NextAuth.js, JWT strategy, `httpOnly` session cookie. Single demo user (Credentials provider) — a real user store/sign-up flow is out of scope for a minimal CRUD fixture; see README.md's Auth section for how to override the demo credentials and secret. |
| Known-vulnerable dependencies | Partially met, one item still **Open** | Bumped `next@15.5.12` → `15.5.24` repo-wide per the repo owner's decision, fixing the 3 direct Next.js advisories (SSRF via rewrites, image-optimization DoS, internal Server Function disclosure). `npm audit` now reports 3 *different*, smaller findings (1 moderate, 2 high) against transitive `postcss`/`sharp` that `next@15.5.24` still pulls in — full resolution needs **Next.js 16**, a major version jump well beyond the approved patch bump, so that's a separate open decision, not folded into this one silently. |

## Deliberately accepted, not tracked as gaps

A few findings from the team's gap-analysis reports describe the *absence*
of a flaw, not a missing control — "fixing" them would mean introducing a
bug on purpose:

- **Data-flow "Not Covered" metrics** (Partial Uses Coverage, Multiple
  Definitions Handling, Unreachable Use Detection) — the fixture has no
  data-flow gap, redundant reassignment, or dead code for these detectors
  to find. Documented in the remediation plan's flagged decisions.
- **A few mutation-testing survivors** (documented in each phase's commit
  message) — file-encoding string literals with no observable effect on
  ASCII JSON content, and defensive `undefined`-guard branches (e.g.
  `issue?.code` in `lib/validate.ts`) that zod's own contract makes
  unreachable in practice.

## Test-classification taxonomy coverage

Against the team's White-Box testing taxonomy (Structural Analysis, Code
Duplication, Lint, Security SAST/SCA, Control Flow, Mutation, Coverage
Delta, Data Flow, Code Churn), this branch now covers:

| L2 Testing Type | Tool | Status |
|---|---|---|
| Cyclomatic Complexity | ESLint `complexity` rule (`eslint.config.mjs`) | Met — `lib/lint-fixtures.ts`'s `highComplexityExample` trips it (warn, non-blocking) |
| Cognitive Complexity | `eslint-plugin-sonarjs`'s `sonarjs/cognitive-complexity` | Met — same fixture function, real finding |
| Code Duplication | jscpd | Met (Phase 2) |
| Lint / Rule Violations | ESLint 9 flat config + `eslint-plugin-security` | Met (Phase 1) |
| Static Vulnerabilities (SAST) | CodeQL, Semgrep | Met (Phase 5) |
| Dependency Risk (SCA) | Dependabot, `npm audit` in CI | Met (Phase 5) |
| Statement / Branch Coverage | nyc (`test:coverage:gate`) | Met (Phase 3) |
| Mutation Score | StrykerJS | Met (Phase 4) |
| Coverage Delta | `scripts/coverage-delta.mjs` (`npm run coverage:delta`) | Met — compares the current `nyc-mocha/coverage-summary.json` against a committed `coverage-baseline.json`, informational only |
| Code Churn | `scripts/code-churn.mjs` (`npm run churn`) | Met — aggregates real `git log --numstat` per tracked file into `churn-report.json` |

Two categories from the taxonomy are **accepted gaps**, not silently
skipped:

- **Path Coverage** (as a metric distinct from branch coverage) — no
  mainstream Istanbul/nyc-based tool computes true path coverage for
  TypeScript; branch coverage (already gated at ≥85%) is the closest
  practical proxy this stack supports. Treating nyc's branch % as "path
  coverage" would be a mislabeled number, not a real metric, so it isn't
  reported under that name.
- **Data Flow Testing — All-Defs / All-Uses coverage** — this is a
  1980s academic C-testing technique (Rapps–Weyuker); no maintained
  TypeScript/JavaScript tool computes def-use path coverage today. The
  data-flow-adjacent findings that *are* real and already tracked (dead
  code / unreachable branches via ESLint, `no-unused-vars`, and
  TypeScript's own unreachable-code checks) are the practical substitute
  in this ecosystem. See also "Data-flow 'Not Covered' metrics" above.

## How this file is used

- CI (`.github/workflows/ci.yml`, `codeql.yml`, `semgrep.yml`) supplies
  the automated half of V5/V7/V10/V14 verification on every push.
- The remaining **Open** item — `postcss`/`sharp`'s transitive CVEs,
  which need Next.js 16 — is intentionally left for a future decision
  rather than a silent major-version jump.
