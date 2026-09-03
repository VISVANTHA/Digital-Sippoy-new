import { execSync } from "node:child_process";
import { appendFileSync, writeFileSync } from "node:fs";

const PROGRESS_LOG = "C:\\Users\\moham\\.gemini\\antigravity\\brain\\54d11d41-0391-4789-9ca1-f426a5d8cbd4\\excel_removal_progress.log";
writeFileSync(PROGRESS_LOG, "=== REPO-WIDE EXCEL REMOVAL PROGRESS LOG ===\n");

// 32 Target branches to sync (15 Monolith + 17 Microservices)
const MONOLITH_BRANCHES = [
  "DS-063", "DS-062", "DS-061", "DS-060", "DS-059", "DS-058", "DS-057",
  "DS-056", "DS-055", "DS-054", "DS-053", "DS-052", "DS-051", "DS-050", "DS-049"
];

const MICROSERVICES_BRANCHES = [
  "DS-047", "DS-032", "DS-030", "DS-028", "DS-026", "DS-024", "DS-022", "DS-020",
  "DS-018", "DS-016", "DS-014", "DS-012", "DS-010", "DS-008", "DS-006", "DS-004", "DS-002"
];

const ALL_TARGETS = [...MONOLITH_BRANCHES, ...MICROSERVICES_BRANCHES];

function logMsg(msg) {
  console.log(msg);
  appendFileSync(PROGRESS_LOG, msg + "\n");
}

function runCmd(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd: "d:\\Digital-Sippoy", stdio: "pipe" });
  } catch (err) {
    return null;
  }
}

logMsg(`Starting Excel removal across ${ALL_TARGETS.length} branches...`);

runCmd("git checkout -f DS-064");

let syncedCount = 0;

for (let i = 0; i < ALL_TARGETS.length; i++) {
  const branch = ALL_TARGETS[i];
  const type = MONOLITH_BRANCHES.includes(branch) ? "Monolith" : "Microservice";

  // Force checkout branch matching origin
  const coRes = runCmd(`git checkout -f -B ${branch} origin/${branch}`);
  if (!coRes) {
    logMsg(`[${i + 1}/${ALL_TARGETS.length}] ❌ ${branch} (${type}): Checkout failed`);
    continue;
  }

  // Sync .gitignore from DS-064
  runCmd("git checkout DS-064 -- .gitignore");

  // Remove tracked Excel files if any
  runCmd("git rm -f *.xlsx");

  runCmd("git add .gitignore");

  // Check staged diff
  const statusOut = runCmd("git status --porcelain");
  if (!statusOut || statusOut.trim() === "") {
    logMsg(`[${i + 1}/${ALL_TARGETS.length}] ✅ ${branch} (${type}): Clean (No Excels Tracked)`);
    syncedCount++;
    continue;
  }

  // Commit changes if dirty
  const commitRes = runCmd(`git commit -m "fix(git): remove all Excel files from git tracking and add *.xlsx to .gitignore"`);
  if (!commitRes) {
    logMsg(`[${i + 1}/${ALL_TARGETS.length}] ⚠️ ${branch} (${type}): Commit skipped`);
    syncedCount++;
    continue;
  }
  
  // Push HEAD to origin/<branch> with --force-with-lease
  const pushRes = runCmd(`git push --force-with-lease origin HEAD:${branch}`);
  if (!pushRes) {
    logMsg(`[${i + 1}/${ALL_TARGETS.length}] ❌ ${branch} (${type}): Push failed`);
    continue;
  }

  logMsg(`[${i + 1}/${ALL_TARGETS.length}] ✅ ${branch} (${type}): Excels Removed & Pushed to origin`);
  syncedCount++;
}

// Return to DS-064
runCmd("git checkout -f DS-064");

logMsg(`\n=== EXCEL REMOVAL COMPLETE: ${syncedCount + 1} / 33 Branches Cleaned on GitHub ===`);
