/**
 * Coverage Test Fixture — lib/coverage-fixtures.ts
 *
 * PURPOSE: This file is deliberately designed to produce non-100% coverage
 * metrics so the metrics evaluation tool has REAL, varied data to score.
 * A tool that only sees 100% everywhere cannot prove it is measuring anything.
 *
 * Each function below is annotated with its intended coverage outcome:
 *   [FULL]    → both/all branches exercised by tests
 *   [PARTIAL] → only the happy path tested; error/edge branches NOT tested
 *   [NONE]    → function exists but zero tests call it (function coverage gap)
 *
 * Corresponding test file: test/lib/coverage-fixtures.test.ts
 * nyc includes this file (not excluded in .nycrc.json).
 *
 * Designed metric outcomes:
 *   Statement coverage  ≈ 55–65%  (many untested statements)
 *   Branch coverage     ≈ 45–55%  (uncovered else / error arms)
 *   Function coverage   ≈ 60–70%  (NONE-tagged functions unexercised)
 *   Path coverage       ≈ 30–40%  (combinatorial — far fewer than 2^n paths tested)
 */

// ─── FULLY COVERED ────────────────────────────────────────────────────────────

/**
 * [FULL] Both the valid and invalid branch are exercised by tests.
 * Demonstrates a function where the tool correctly records 100% branch hit.
 */
export function validateItemCount(count: number): boolean {
  if (count < 0) return false;
  if (count > 1000) return false;
  return true;
}

/**
 * [FULL] Sorting comparator — ascending / descending both exercised.
 * Demonstrates a simple two-branch function with full coverage.
 */
export function compareByName(a: string, b: string): number {
  return a.localeCompare(b);
}

// ─── PARTIALLY COVERED ────────────────────────────────────────────────────────

/**
 * [PARTIAL] Only the happy path (valid string input) is tested.
 * The typeof guard and empty-string branches are NEVER hit by any test.
 * Contributes 3 uncovered statements and 2 uncovered branch arms.
 */
export function parseItemId(raw: unknown): string {
  if (typeof raw !== "string") {
    // UNCOVERED BRANCH: no test passes a non-string ID
    return crypto.randomUUID();
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    // UNCOVERED BRANCH: no test passes an empty-string ID
    throw new Error("Item ID must not be empty");
  }
  return trimmed;
}

/**
 * [PARTIAL] Only tested with small arrays. The empty-array early-return
 * path and the fallback default are never hit in any test.
 * Contributes 2 uncovered statements and 2 uncovered branches.
 */
export function getTopItems(items: string[], limit: number): string[] {
  if (items.length === 0) {
    // UNCOVERED BRANCH: tests always pass non-empty arrays
    return [];
  }
  if (limit <= 0) {
    // UNCOVERED BRANCH: tests always pass limit > 0
    return items.slice(0, 1);
  }
  return items.slice(0, limit);
}

/**
 * [PARTIAL] Multi-branch priority classifier.
 * 4 paths exist (churn×duplication); tests only exercise 2 of the 4.
 * Demonstrates path-coverage gap — branch coverage alone misses this.
 */
export function classifyRegressionRisk(
  churnScore: number,
  hasDuplication: boolean,
): "critical" | "high" | "medium" | "low" {
  if (churnScore > 80) {
    if (hasDuplication) return "critical"; // COVERED by test
    return "high";                         // UNCOVERED — no test hits churn>80 + no duplication
  }
  if (hasDuplication) return "medium";    // UNCOVERED — no test hits churn≤80 + duplication
  return "low";                            // COVERED by test
}

// ─── COMPLETELY UNCOVERED ─────────────────────────────────────────────────────

/**
 * [NONE] This function is never called by any test.
 * Represents a dead helper that shipped in a PR but was never exercised.
 * Contributes to function-coverage gap (1 untested function).
 */
export function formatItemSummary(name: string, count: number): string {
  const plural = count !== 1 ? "s" : "";
  return `${name} (${count} item${plural})`;
}

/**
 * [NONE] Export for legacy compatibility — never exercised.
 * Both the positive and negative paths are completely unvisited.
 * Contributes 5 uncovered statements and 2 uncovered branches.
 */
export function legacyMigrateItem(
  raw: Record<string, unknown>,
): { id: string; name: string; createdAt: string } | null {
  if (!raw || typeof raw.name !== "string") {
    return null;
  }
  return {
    id: typeof raw.id === "string" ? raw.id : crypto.randomUUID(),
    name: (raw.name as string).trim(),
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : new Date().toISOString(),
  };
}
