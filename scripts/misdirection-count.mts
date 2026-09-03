#!/usr/bin/env node
/**
 * Component 2: Branch Misdirection Count
 *
 * Closes the "Branch Misdirection Discovery" Partial gap by deriving
 * Misdirection_Count from the StrykerJS mutation report (mutation-report.json)
 * and computing the full normalized formula required by the metric:
 *
 *   BranchMisdirection = MAX(0, 100 - (Misdirection_Count × 20))
 *   (threshold <= 20, lower is better)
 *
 * Misdirection_Count = survived mutants in operators that alter control-flow
 * direction (conditions, equality, logical, switch cases).
 *
 * Also emits rawBranchMisdirectionRatio = 1 - (branches_covered / branches_total)
 * from nyc coverage-summary.json as a complementary signal.
 *
 * Usage:
 *   node scripts/misdirection-count.mjs [--coverage-summary path]
 *
 * Reads:  mutation-report.json  (from `npm run mutation`)
 *         nyc-mocha/coverage-summary.json  (from `npm run test:coverage`)
 * Writes: misdirection-stats.json
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const MUTATION_REPORT  = path.join(process.cwd(), "mutation-report.json");
const COVERAGE_SUMMARY = path.join(process.cwd(), "nyc-mocha", "coverage-summary.json");
const REPORT_PATH      = path.join(process.cwd(), "misdirection-stats.json");

// Stryker mutator names that represent branch direction changes
const MISDIRECTION_MUTATORS = new Set([
  "ConditionalExpression",
  "EqualityOperator",
  "LogicalOperator",
  "SwitchCaseRemoval",
  "BooleanSubstitution",
  "StringLiteralMutation",   // can flip falsy/truthy checks
]);

function loadJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function countSurvivedMisdirections(mutationReport) {
  // Stryker JSON report structure: { files: { [path]: { mutants: [...] } } }
  const files = mutationReport.files ?? {};
  let count = 0;
  for (const fileData of Object.values(files)) {
    for (const mutant of fileData.mutants ?? []) {
      if (
        mutant.status === "Survived" &&
        MISDIRECTION_MUTATORS.has(mutant.mutatorName)
      ) {
        count++;
      }
    }
  }
  return count;
}

function rawBranchRatio(coverageSummary) {
  const total = coverageSummary.total?.branches;
  if (!total) return null;
  const covered = total.covered ?? 0;
  const totalB  = total.total   ?? 0;
  if (totalB === 0) return null;
  return 1 - covered / totalB;
}

function main() {
  const result = {
    generatedAt: new Date().toISOString(),
    misdirectionCount: null,
    normalizedScore: null,
    rawBranchMisdirectionRatio: null,
    branchMisdirectionPercent: null,
    gates: {},
    notes: [],
  };

  // --- Mutation report ---
  if (!existsSync(MUTATION_REPORT)) {
    result.notes.push(
      "mutation-report.json not found. Run `npm run mutation` first. " +
      "Misdirection_Count will be null until then."
    );
    console.warn("misdirection-count: mutation-report.json not found.");
  } else {
    const mutReport = loadJson(MUTATION_REPORT);
    const count = countSurvivedMisdirections(mutReport);
    const normalized = Math.max(0, 100 - count * 20);
    result.misdirectionCount  = count;
    result.normalizedScore    = normalized;
    result.gates.normalizedScore = normalized <= 20; // threshold <= 20
    console.log(`Survived misdirection mutants: ${count}`);
    console.log(`Normalized score: MAX(0, 100 - ${count}×20) = ${normalized}`);
  }

  // --- Coverage summary ---
  if (!existsSync(COVERAGE_SUMMARY)) {
    result.notes.push(
      "nyc-mocha/coverage-summary.json not found. Run `npm run test:coverage` first."
    );
    console.warn("misdirection-count: coverage-summary.json not found.");
  } else {
    const covSummary = loadJson(COVERAGE_SUMMARY);
    const ratio = rawBranchRatio(covSummary);
    if (ratio !== null) {
      result.rawBranchMisdirectionRatio = +ratio.toFixed(4);
      result.branchMisdirectionPercent  = +(ratio * 100).toFixed(2);
      result.gates.rawBranchMisdirection = ratio * 100 <= 20;
      console.log(`Raw branch misdirection ratio: ${(ratio * 100).toFixed(2)}%`);
    }
  }

  result.thresholds = {
    normalizedScore:        { max: 20, direction: "lower", formula: "MAX(0, 100 - Misdirection_Count × 20)" },
    rawBranchMisdirection:  { max: 20, direction: "lower", formula: "1 - (branches_covered / branches_total)" },
  };

  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2) + "\n");
  console.log(`\nMisdirection stats written to ${REPORT_PATH}`);
}

main();
