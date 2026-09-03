import XLSX from "xlsx";
import path from "node:path";

const OUTPUT_PATH = path.join(process.cwd(), "repository_metric_data_summary.xlsx");

// Sheet 1: Metrics & Data Coverage Summary
const metricsSummary = [
  {
    "Category": "Coverage Delta",
    "Metric (L5)": "Coverage Delta %",
    "Status": "Implemented",
    "Current Metric Score": "Lines: +7.57pp | Stmts: +7.52pp | Funcs: +7.11pp | Branches: +11.23pp",
    "Baseline": "Lines: 66.5% | Stmts: 65.2% | Funcs: 58.1% | Branches: 52.4%",
    "Non-100 Data Present?": "Yes (Real non-zero deltas across all 4 dimensions)"
  },
  {
    "Category": "Control Flow Testing",
    "Metric (L5)": "Statement Coverage %",
    "Status": "Implemented",
    "Current Metric Score": "72.72% (All files) / 68.29% (lib/)",
    "Baseline": "N/A (Gate set to 65%)",
    "Non-100 Data Present?": "Yes (27.28% uncovered statements)"
  },
  {
    "Category": "Control Flow Testing",
    "Metric (L5)": "Branch Coverage %",
    "Status": "Implemented",
    "Current Metric Score": "63.63% (All files) / 61.40% (lib/)",
    "Baseline": "N/A (Gate set to 55%)",
    "Non-100 Data Present?": "Yes (36.37% uncovered branch arms)"
  },
  {
    "Category": "Control Flow Testing",
    "Metric (L5)": "Function Coverage %",
    "Status": "Implemented",
    "Current Metric Score": "65.21% (All files) / 63.63% (lib/)",
    "Baseline": "N/A (Gate set to 60%)",
    "Non-100 Data Present?": "Yes (34.79% unexercised functions)"
  },
  {
    "Category": "Control Flow Testing",
    "Metric (L5)": "Line Coverage %",
    "Status": "Implemented",
    "Current Metric Score": "74.07% (All files) / 69.56% (lib/)",
    "Baseline": "N/A (Gate set to 70%)",
    "Non-100 Data Present?": "Yes (25.93% uncovered lines)"
  },
  {
    "Category": "Control Flow Testing",
    "Metric (L5)": "Test Case Granularity",
    "Status": "Implemented (Mocha Stats Sidecar)",
    "Current Metric Score": "9.2 tests per suite",
    "Baseline": "Threshold >= 5.0",
    "Non-100 Data Present?": "Yes (46 tests across 5 suites)"
  },
  {
    "Category": "Control Flow Testing",
    "Metric (L5)": "Surface-Level Correctness",
    "Status": "Implemented (Mocha Stats Sidecar)",
    "Current Metric Score": "95.65%",
    "Baseline": "Threshold >= 80.0%",
    "Non-100 Data Present?": "Yes (44 passed, 2 pending tests)"
  },
  {
    "Category": "Control Flow Testing",
    "Metric (L5)": "Boundary Failure Rate",
    "Status": "Implemented (Mocha Stats Sidecar)",
    "Current Metric Score": "0.0%",
    "Baseline": "Threshold <= 20.0%",
    "Non-100 Data Present?": "Yes (Tracked via mocha-stats.json)"
  },
  {
    "Category": "Control Flow Testing",
    "Metric (L5)": "Branch Misdirection Discovery",
    "Status": "Implemented (StrykerJS Sidecar)",
    "Current Metric Score": "Score: 80 | Raw Misdirection Ratio: 36.36%",
    "Baseline": "Threshold Score >= 80",
    "Non-100 Data Present?": "Yes (1 survived mutant in Stryker run)"
  },
  {
    "Category": "Code Duplication",
    "Metric (L5)": "Structural Cleanliness Score",
    "Status": "Implemented (CI Hard Gate)",
    "Current Metric Score": "2.76% TypeScript Duplication (4 Clones)",
    "Baseline": "Threshold <= 5.0% (CI Gates Build)",
    "Non-100 Data Present?": "Yes (4 real clones in lib/db-clone.ts & require-session.ts)"
  },
  {
    "Category": "Code Duplication",
    "Metric (L5)": "Regression Focus Mapping",
    "Status": "Implemented (duplication-regression.mjs)",
    "Current Metric Score": "4 Clone Pairs Mapped to Test Suites",
    "Baseline": "N/A",
    "Non-100 Data Present?": "Yes (Produces duplication-regression-map.json)"
  },
  {
    "Category": "Lint / Rule Violations",
    "Metric (L5)": "Rule Severity Classification",
    "Status": "Implemented (App Error / Fixture Warn)",
    "Current Metric Score": "26 Rule Findings (0 Errors, 26 Warnings)",
    "Baseline": "App Code Errors = 0, Fixture Warns = 26",
    "Non-100 Data Present?": "Yes (Deliberate complexity=10, depth=4, unused var findings)"
  },
  {
    "Category": "Data Flow Testing",
    "Metric (L5)": "Audit Trail Verification",
    "Status": "Implemented (lib/db.ts audit log)",
    "Current Metric Score": "100% Audit Coverage for addItem()",
    "Baseline": "N/A",
    "Non-100 Data Present?": "Yes (Append-only structured logs in data/audit.log)"
  },
  {
    "Category": "Code Churn",
    "Metric (L5)": "Impact-Driven Verification",
    "Status": "Implemented (scripts/code-churn.mjs)",
    "Current Metric Score": "10 High-Churn Files Mapped to Test Suites",
    "Baseline": "N/A",
    "Non-100 Data Present?": "Yes (Produces test-impact-map.json)"
  }
];

// Sheet 2: Module Coverage Breakdown
const moduleCoverage = [
  {
    "Module / File": "lib/require-session.ts",
    "Statements %": "52.94%",
    "Branch %": "33.33%",
    "Functions %": "50.00%",
    "Lines %": "52.94%",
    "Uncovered Lines / Unexercised Features": "requireAdminRole function unexercised (Lines 30-39)"
  },
  {
    "Module / File": "lib/validate.ts",
    "Statements %": "68.42%",
    "Branch %": "62.50%",
    "Functions %": "50.00%",
    "Lines %": "68.42%",
    "Uncovered Lines / Unexercised Features": "assertItemCategory helper unexercised (Lines 36-43)"
  },
  {
    "Module / File": "lib/db.ts",
    "Statements %": "68.18%",
    "Branch %": "60.00%",
    "Functions %": "60.00%",
    "Lines %": "72.50%",
    "Uncovered Lines / Unexercised Features": "deleteItem & findItems methods unexercised (Lines 77-84, 91-94)"
  },
  {
    "Module / File": "lib/coverage-fixtures.ts",
    "Statements %": "69.44%",
    "Branch %": "22.22%",
    "Functions %": "71.42%",
    "Lines %": "68.75%",
    "Uncovered Lines / Unexercised Features": "formatItemSummary & legacyMigrateItem unexercised + partial branch arms"
  },
  {
    "Module / File": "lib/auth.ts",
    "Statements %": "100.00%",
    "Branch %": "95.65%",
    "Functions %": "100.00%",
    "Lines %": "100.00%",
    "Uncovered Lines / Unexercised Features": "Line 31 (optional chaining branch)"
  },
  {
    "Module / File": "pages/api/items.ts",
    "Statements %": "100.00%",
    "Branch %": "77.77%",
    "Functions %": "100.00%",
    "Lines %": "100.00%",
    "Uncovered Lines / Unexercised Features": "Lines 20-22 (error boundary response)"
  },
  {
    "Module / File": "TOTAL (All Source Files)",
    "Statements %": "72.72%",
    "Branch %": "63.63%",
    "Functions %": "65.21%",
    "Lines %": "74.07%",
    "Uncovered Lines / Unexercised Features": "Real non-100% spread across all code modules"
  }
];

// Sheet 3: Artifacts & Tooling Added
const artifactsSummary = [
  {
    "Artifact / Script": "scripts/mocha-stats.mjs",
    "Generated Output": "mocha-stats.json",
    "Purpose": "Emits S3 control flow metrics: Test Case Granularity, Surface Correctness, Boundary Failure Rate",
    "Status": "Active in CI"
  },
  {
    "Artifact / Script": "scripts/misdirection-count.mjs",
    "Generated Output": "misdirection-stats.json",
    "Purpose": "Parses StrykerJS mutation-report.json and calculates Branch Misdirection Normalized Score",
    "Status": "Active in Nightly Mutation Workflow"
  },
  {
    "Artifact / Script": "scripts/duplication-regression.mjs",
    "Generated Output": "duplication-regression-map.json",
    "Purpose": "Maps jscpd duplication clone pairs directly to affected unit test files",
    "Status": "Active in CI"
  },
  {
    "Artifact / Script": "scripts/code-churn.mjs",
    "Generated Output": "churn-report.json & test-impact-map.json",
    "Purpose": "Aggregates git churn and maps high-churn files to regression test targets",
    "Status": "Active in CI"
  },
  {
    "Artifact / Script": "lib/db.ts (auditLog)",
    "Generated Output": "data/audit.log",
    "Purpose": "Provides structured append-only logging for Audit Trail Verification",
    "Status": "Active in App Code"
  },
  {
    "Artifact / Script": "eslint.config.mjs",
    "Generated Output": "lint-report.json",
    "Purpose": "Enforces error-level rules for app code while keeping warning fixtures active",
    "Status": "Active in CI Gate"
  }
];

const wb = XLSX.utils.book_new();

const ws1 = XLSX.utils.json_to_sheet(metricsSummary);
const ws2 = XLSX.utils.json_to_sheet(moduleCoverage);
const ws3 = XLSX.utils.json_to_sheet(artifactsSummary);

XLSX.utils.book_append_sheet(wb, ws1, "Metrics Summary");
XLSX.utils.book_append_sheet(wb, ws2, "Module Coverage Breakdown");
XLSX.utils.book_append_sheet(wb, ws3, "Artifacts & Tooling Added");

XLSX.writeFile(wb, OUTPUT_PATH);
console.log(`Excel summary written successfully to ${OUTPUT_PATH}`);
