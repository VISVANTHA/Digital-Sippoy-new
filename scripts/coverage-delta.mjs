#!/usr/bin/env node
// Coverage Delta / Regression Testing Monitoring: compares the coverage
// summary from the most recent `npm run test:coverage` run against a
// committed baseline, and reports the change per metric. Informational
// only (matches this repo's "warn, don't block" policy for classification
// tooling) -- it prints a delta table and exits 0 regardless of direction;
// use `--update` to write the current run as the new baseline.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const SUMMARY_PATH = path.join(process.cwd(), "nyc-mocha", "coverage-summary.json");
const BASELINE_PATH = path.join(process.cwd(), "coverage-baseline.json");
const METRICS = ["lines", "statements", "functions", "branches"];

function loadJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

function extractTotals(summary) {
  const total = summary.total;
  const totals = {};
  for (const metric of METRICS) {
    totals[metric] = total[metric].pct;
  }
  return totals;
}

function main() {
  if (!existsSync(SUMMARY_PATH)) {
    console.error(
      `No coverage summary found at ${SUMMARY_PATH}. Run \`npm run test:coverage\` first.`,
    );
    process.exit(1);
  }

  const current = extractTotals(loadJson(SUMMARY_PATH));
  const shouldUpdate = process.argv.includes("--update");

  if (!existsSync(BASELINE_PATH)) {
    writeFileSync(BASELINE_PATH, JSON.stringify(current, null, 2) + "\n");
    console.log("No baseline found -- current coverage saved as the new baseline:");
    console.table(current);
    return;
  }

  const baseline = loadJson(BASELINE_PATH);
  const rows = METRICS.map((metric) => {
    const before = baseline[metric] ?? 0;
    const after = current[metric] ?? 0;
    const delta = Math.round((after - before) * 100) / 100;
    return { metric, baseline: before, current: after, delta: delta >= 0 ? `+${delta}` : `${delta}` };
  });

  console.log("Coverage Delta (percentage points, baseline -> current):");
  console.table(rows);

  const regressed = rows.filter((r) => Number(r.delta) < 0);
  if (regressed.length > 0) {
    const names = regressed.map((r) => r.metric).join(", ");
    console.warn(`Coverage regressed on: ${names} (informational -- not a build failure).`);
  }

  if (shouldUpdate) {
    writeFileSync(BASELINE_PATH, JSON.stringify(current, null, 2) + "\n");
    console.log("Baseline updated to the current run.");
  }
}

main();
