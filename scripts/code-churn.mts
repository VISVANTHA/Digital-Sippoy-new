#!/usr/bin/env node
// Code Churn / Risk-Based Testing Prioritization: aggregates git
// add+delete line counts per tracked source file across this branch's
// commit history, as a proxy for defect/regression risk (files that
// change often and heavily are more likely to need focused testing).
// Reads real `git log --numstat` output -- no synthetic data.
//
// Component 6 (Impact-Driven Verification): also emits test-impact-map.json
// — the top-10 highest-churn source files mapped to their test file
// counterparts, giving CI a concrete list of which tests to prioritize.

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const TRACKED_DIRS = ["app/", "pages/", "components/", "lib/", "test/", "items-service/src/"];
const REPORT_PATH      = path.join(process.cwd(), "churn-report.json");
const IMPACT_MAP_PATH  = path.join(process.cwd(), "test-impact-map.json");
const TOP_N_FILES      = 10;

function isTracked(filePath) {
  return TRACKED_DIRS.some((dir) => filePath.startsWith(dir));
}

/**
 * Map a source file path to its test file counterpart.
 * Returns null if the file is already a test or has no known counterpart.
 */
function resolveTestFile(filePath) {
  if (filePath.startsWith("test/")) return null; // already a test

  const libMatch = filePath.match(/^lib\/(.+)\.(ts|tsx)$/);
  if (libMatch) return `test/lib/${libMatch[1]}.test.ts`;

  const pagesApiMatch = filePath.match(/^pages\/api\/(.+)\.(ts|tsx)$/);
  if (pagesApiMatch) return `test/api/${pagesApiMatch[1]}.test.ts`;

  const appApiMatch = filePath.match(/^app\/api\/(.+)\/route\.(ts|tsx)$/);
  if (appApiMatch) return `test/api/${appApiMatch[1]}.test.ts`;

  const svcMatch = filePath.match(/^items-service\/src\/(.+)\.(ts|js)$/);
  if (svcMatch) return `items-service/test/${svcMatch[1]}.test.ts`;

  return null; // pages/, components/, app/ pages — no direct unit test
}

function main() {
  const log = execFileSync("git", ["log", "--numstat", "--pretty=format:--commit--"], {
    encoding: "utf-8",
    maxBuffer: 1024 * 1024 * 32,
  });

  const churn = new Map();
  let commitCount = 0;

  for (const line of log.split("\n")) {
    if (line === "--commit--") {
      commitCount += 1;
      continue;
    }
    if (!line.trim()) continue;

    const [addedRaw, deletedRaw, filePath] = line.split("\t");
    if (!filePath || !isTracked(filePath)) continue;

    const added = addedRaw === "-" ? 0 : Number(addedRaw);
    const deleted = deletedRaw === "-" ? 0 : Number(deletedRaw);

    const entry = churn.get(filePath) ?? { file: filePath, commits: 0, added: 0, deleted: 0 };
    entry.commits += 1;
    entry.added += added;
    entry.deleted += deleted;
    churn.set(filePath, entry);
  }

  const rows = [...churn.values()]
    .map((r) => ({ ...r, churn: r.added + r.deleted }))
    .sort((a, b) => b.churn - a.churn);

  writeFileSync(
    REPORT_PATH,
    JSON.stringify({ commitsScanned: commitCount, files: rows }, null, 2) + "\n",
  );

  // --- Component 6: Build test-impact-map.json ---
  const topFiles = rows.slice(0, TOP_N_FILES);
  const impactMap = topFiles
    .map((r) => {
      const testFile = resolveTestFile(r.file);
      return {
        sourceFile: r.file,
        churn: r.churn,
        commits: r.commits,
        testFile: testFile ?? "(no direct test — manual review)",
        mapped: testFile !== null,
      };
    });

  const prioritizedTests = [
    ...new Set(impactMap.filter((r) => r.mapped).map((r) => r.testFile)),
  ];

  writeFileSync(
    IMPACT_MAP_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        commitsScanned: commitCount,
        topChurnFiles: impactMap,
        prioritizedTests,
        note:
          "Run these tests first on any PR — they cover the highest-churn files " +
          "and are most likely to catch regressions introduced by recent changes.",
      },
      null,
      2,
    ) + "\n",
  );

  console.log(`Code churn (${commitCount} commits scanned) -- top files by churn:`);
  console.table(rows.slice(0, 15));
  console.log(`Full report written to ${REPORT_PATH}`);
  console.log(`\nTest Impact Map (top ${TOP_N_FILES} churned files → tests):`);
  console.table(impactMap.map((r) => ({ source: r.sourceFile, churn: r.churn, test: r.testFile })));
  console.log(`Prioritized tests: ${prioritizedTests.join(", ")}`);
  console.log(`Impact map written to ${IMPACT_MAP_PATH}`);
}

main();
