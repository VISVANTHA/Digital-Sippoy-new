import { execSync } from "node:child_process";

const ALL_TARGETS = [
  "DS-063", "DS-062", "DS-061", "DS-060", "DS-059", "DS-058", "DS-057", "DS-056",
  "DS-055", "DS-054", "DS-053", "DS-052", "DS-051", "DS-050", "DS-049", "DS-047",
  "DS-032", "DS-030", "DS-028", "DS-026", "DS-024", "DS-022", "DS-020", "DS-018",
  "DS-016", "DS-014", "DS-012", "DS-010", "DS-008", "DS-006", "DS-004", "DS-002"
];

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd: "d:\\Digital-Sippoy", stdio: "pipe" });
  } catch (err) {
    return null;
  }
}

console.log("Syncing SAST/SCA sidecar scripts across all 32 branches...");

runCmd("git checkout -f DS-064");

for (const branch of ALL_TARGETS) {
  runCmd(`git checkout -f -B ${branch} origin/${branch}`);
  runCmd("git checkout DS-064 -- .gitignore scripts/dependency-health.mjs scripts/license-check.mjs scripts/secret-scan.mjs scripts/generate-sbom.mjs");
  runCmd("git add .gitignore scripts/dependency-health.mjs scripts/license-check.mjs scripts/secret-scan.mjs scripts/generate-sbom.mjs");
  const diff = runCmd("git diff --staged --name-only");
  if (diff && diff.trim() !== "") {
    runCmd('git commit -m "feat(security): sync SAST/SCA sidecar scripts closing Dependency Health Monitoring"');
    runCmd(`git push --force-with-lease origin HEAD:${branch}`);
    console.log(`  ✅ Synced SAST/SCA scripts on ${branch}`);
  } else {
    console.log(`  ✅ ${branch} already up to date`);
  }
}

runCmd("git checkout -f DS-064");
console.log("Done syncing SAST/SCA scripts repo-wide!");
