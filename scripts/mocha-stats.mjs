#!/usr/bin/env node
/**
 * Component 1: Mocha Stats Emitter
 *
 * Closes 3 Control Flow "S3 Schema Gap" metrics by running mocha with
 * the built-in JSON reporter, then computing and writing mocha-stats.json:
 *
 *  - Test Case Granularity  = TotalTests / TestSuites  (threshold >= 5)
 *  - Surface-Level Correctness = PassedTests / TotalTests  (threshold >= 80)
 *  - Boundary Failure Rate  = FailedTests / TotalTests  (threshold <= 20)
 *
 * These fields are not emitted by nyc's coverage-summary.json, so the
 * scanner previously had to derive them from mocha's raw stdout.
 * This script writes a machine-readable JSON sidecar that S3 can ingest
 * alongside coverage-summary.json.
 */

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const REPORT_PATH = path.join(process.cwd(), "mocha-stats.json");

function main() {
  let rawOutput;
  try {
    // Write mocha JSON output to a temp file to avoid stdout buffering issues;
    // cross-platform: uses the npm-installed mocha bin via npx.
    rawOutput = execSync(
      `npx mocha --reporter json 2>/dev/null || npx mocha --reporter json`,
      { encoding: "utf-8", cwd: process.cwd(), shell: true }
    );
  } catch (err) {
    // mocha exits non-zero when tests fail; the JSON is still on stdout
    rawOutput = (err.stdout ?? "") + (err.output?.[1] ?? "");
  }

  let report;
  try {
    report = JSON.parse(rawOutput);
  } catch {
    console.error("mocha-stats: could not parse mocha JSON output.");
    console.error("Run `npm test` first to confirm tests work.");
    process.exit(1);
  }

  const stats = report.stats ?? {};
  const totalTests   = stats.tests    ?? 0;
  const passedTests  = stats.passes   ?? 0;
  const failedTests  = stats.failures ?? 0;
  const pendingTests = stats.pending  ?? 0;

  // Count unique describe() suite names from the suite titles
  const suiteNames = new Set();
  (report.tests ?? []).forEach((t) => {
    const parts = (t.fullTitle ?? "").split(" ");
    if (parts.length > 1) suiteNames.add(parts[0]);
  });
  // Fallback: count top-level suites from report.suites if present
  const testSuites =
    suiteNames.size > 0 ? suiteNames.size : (report.suites ?? 1);

  const testCaseGranularity    = testSuites > 0 ? +(totalTests / testSuites).toFixed(2) : 0;
  const surfaceLevelCorrectness = totalTests > 0 ? +(passedTests / totalTests * 100).toFixed(2) : 0;
  const boundaryFailureRate     = totalTests > 0 ? +(failedTests / totalTests * 100).toFixed(2) : 0;

  const output = {
    generatedAt: new Date().toISOString(),
    totalTests,
    passedTests,
    failedTests,
    pendingTests,
    testSuites,
    // Derived metrics for S3 scanner
    testCaseGranularity,        // threshold >= 5  (higher is better)
    surfaceLevelCorrectness,    // threshold >= 80 (higher is better, %)
    boundaryFailureRate,        // threshold <= 20 (lower is better, %)
    // Thresholds for reference
    thresholds: {
      testCaseGranularity:    { min: 5,   direction: "higher" },
      surfaceLevelCorrectness: { min: 80, direction: "higher" },
      boundaryFailureRate:    { max: 20,  direction: "lower"  },
    },
    // Pass/fail per threshold
    gates: {
      testCaseGranularity:    testCaseGranularity    >= 5,
      surfaceLevelCorrectness: surfaceLevelCorrectness >= 80,
      boundaryFailureRate:    boundaryFailureRate     <= 20,
    },
  };

  writeFileSync(REPORT_PATH, JSON.stringify(output, null, 2) + "\n");
  console.log("Mocha Stats:");
  console.table({
    "Test Case Granularity": {
      value: testCaseGranularity,
      threshold: ">= 5",
      pass: output.gates.testCaseGranularity,
    },
    "Surface-Level Correctness (%)": {
      value: surfaceLevelCorrectness,
      threshold: ">= 80%",
      pass: output.gates.surfaceLevelCorrectness,
    },
    "Boundary Failure Rate (%)": {
      value: boundaryFailureRate,
      threshold: "<= 20%",
      pass: output.gates.boundaryFailureRate,
    },
  });
  console.log(`\nFull report written to ${REPORT_PATH}`);
}

main();
