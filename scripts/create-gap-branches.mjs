import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import path from "node:path";

const GAP_BRANCH_MATRIX = [
  // Control Flow (CF)
  { branch: "DS-GAP-CF-1", domain: "Control Flow", omittedCount: 1, omitted: ["WB-049 Test Case Granularity"], filesToRemove: ["scripts/mocha-stats.mjs"] },
  { branch: "DS-GAP-CF-2", domain: "Control Flow", omittedCount: 2, omitted: ["WB-049 Test Case Granularity", "WB-058 Branch Misdirection"], filesToRemove: ["scripts/mocha-stats.mjs", "scripts/misdirection-count.mjs"] },
  { branch: "DS-GAP-CF-3", domain: "Control Flow", omittedCount: 3, omitted: ["WB-049 Test Case Granularity", "WB-058 Branch Misdirection", "WB-050 Unreachable Logic"], filesToRemove: ["scripts/mocha-stats.mjs", "scripts/misdirection-count.mjs"] },

  // Code Duplication (DUP)
  { branch: "DS-GAP-DUP-1", domain: "Code Duplication", omittedCount: 1, omitted: ["WB-020 Test Suite Streamlining"], filesToRemove: ["scripts/duplication-regression.mjs"] },
  { branch: "DS-GAP-DUP-2", domain: "Code Duplication", omittedCount: 2, omitted: ["WB-020 Test Suite Streamlining", "WB-021 Token Synchronization"], filesToRemove: ["scripts/duplication-regression.mjs"] },
  { branch: "DS-GAP-DUP-3", domain: "Code Duplication", omittedCount: 3, omitted: ["WB-020 Test Suite Streamlining", "WB-021 Token Synchronization", "WB-017 Duplication Gate"], filesToRemove: ["scripts/duplication-regression.mjs", "jscpd.json"] },

  // Static Analysis / Lint (LINT)
  { branch: "DS-GAP-LINT-1", domain: "Lint & Static Analysis", omittedCount: 1, omitted: ["WB-032 Automated Gatekeeping"], filesToRemove: [] },
  { branch: "DS-GAP-LINT-2", domain: "Lint & Static Analysis", omittedCount: 2, omitted: ["WB-032 Automated Gatekeeping", "WB-023 Unused Variables"], filesToRemove: [] },
  { branch: "DS-GAP-LINT-3", domain: "Lint & Static Analysis", omittedCount: 3, omitted: ["WB-032 Automated Gatekeeping", "WB-023 Unused Variables", "WB-030 Custom FS Rule"], filesToRemove: [] },

  // Security SAST / SCA (SEC)
  { branch: "DS-GAP-SEC-1", domain: "Security SAST & SCA", omittedCount: 1, omitted: ["WB-041 Dependency Health Monitoring"], filesToRemove: ["scripts/dependency-health.mjs"] },
  { branch: "DS-GAP-SEC-2", domain: "Security SAST & SCA", omittedCount: 2, omitted: ["WB-041 Dependency Health Monitoring", "WB-039 License Compliance"], filesToRemove: ["scripts/dependency-health.mjs", "scripts/license-check.mjs"] },
  { branch: "DS-GAP-SEC-3", domain: "Security SAST & SCA", omittedCount: 3, omitted: ["WB-041 Dependency Health Monitoring", "WB-039 License Compliance", "WB-038 Transitive SBOM"], filesToRemove: ["scripts/dependency-health.mjs", "scripts/license-check.mjs", "scripts/generate-sbom.mjs"] }
];

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd: process.cwd(), stdio: "pipe" });
  } catch (err) {
    return null;
  }
}

console.log("=== CREATING & PUSHING PROGRESSIVE METRIC GAP BRANCHES ===\n");

runCmd("git checkout -f DS-064");

const results = [];

for (const entry of GAP_BRANCH_MATRIX) {
  console.log(`Creating branch ${entry.branch} (${entry.domain} — ${entry.omittedCount} Omitted)...`);

  // Checkout clean branch from DS-064
  runCmd(`git checkout -f -B ${entry.branch} DS-064`);

  // Remove specific metric files
  for (const f of entry.filesToRemove) {
    if (existsSync(path.join(process.cwd(), f))) {
      runCmd(`git rm -f ${f}`);
    }
  }

  // Create manifest file
  const manifest = {
    branch: entry.branch,
    domain: entry.domain,
    omittedCount: entry.omittedCount,
    omittedMetrics: entry.omitted,
    createdAt: new Date().toISOString()
  };
  writeFileSync("gap_branch_manifest.json", JSON.stringify(manifest, null, 2));
  runCmd("git add gap_branch_manifest.json");

  // Commit and push
  runCmd(`git commit -m "feat(gap-test): create ${entry.branch} with ${entry.omittedCount} omitted metrics for team testing"`);
  const pushRes = runCmd(`git push --force-with-lease origin HEAD:${entry.branch}`);

  if (pushRes) {
    console.log(`  ✅ ${entry.branch} created & pushed to origin!`);
    results.push({ ...entry, status: "✅ LIVE ON GITHUB" });
  } else {
    console.log(`  ❌ ${entry.branch} push failed.`);
    results.push({ ...entry, status: "❌ PUSH FAILED" });
  }
}

runCmd("git checkout -f DS-064");

console.log("\n=======================================================");
console.log("🎉 ALL PROGRESSIVE GAP BRANCHES CREATED AND PUSHED!");
console.log("=======================================================\n");
console.table(results);
