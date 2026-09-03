import XLSX from "xlsx";
import path from "node:path";
import { readFileSync } from "node:fs";

const OUTPUT_PATH = path.join(process.cwd(), "digital_sippoy_metrics_with_line_numbers.xlsx");

// Detailed Data Sheet: Function & Feature Coverage Breakdown (File & Line Numbers)
const functionBreakdown = [
  {
    "Module": "lib/coverage-fixtures.ts",
    "Function / Feature Name": "validateItemCount",
    "File Location": "lib/coverage-fixtures.ts",
    "Line Number Range": "L24–L28",
    "Required Statements / Paths": 3,
    "Achieved (Covered)": 3,
    "Score / Coverage %": "100.0%",
    "Coverage Status": "FULL (Tested)",
    "Evidence / Uncovered Lines": "Both positive & negative branches tested (L25, L26)"
  },
  {
    "Module": "lib/coverage-fixtures.ts",
    "Function / Feature Name": "compareByName",
    "File Location": "lib/coverage-fixtures.ts",
    "Line Number Range": "L34–L36",
    "Required Statements / Paths": 2,
    "Achieved (Covered)": 2,
    "Score / Coverage %": "100.0%",
    "Coverage Status": "FULL (Tested)",
    "Evidence / Uncovered Lines": "Ascending & descending paths tested (L35)"
  },
  {
    "Module": "lib/coverage-fixtures.ts",
    "Function / Feature Name": "parseItemId",
    "File Location": "lib/coverage-fixtures.ts",
    "Line Number Range": "L45–L56",
    "Required Statements / Paths": 6,
    "Achieved (Covered)": 4,
    "Score / Coverage %": "66.7%",
    "Coverage Status": "PARTIAL",
    "Evidence / Uncovered Lines": "Uncovered error branches: L53 (typeof guard), L58 (empty string)"
  },
  {
    "Module": "lib/coverage-fixtures.ts",
    "Function / Feature Name": "getTopItems",
    "File Location": "lib/coverage-fixtures.ts",
    "Line Number Range": "L64–L76",
    "Required Statements / Paths": 6,
    "Achieved (Covered)": 4,
    "Score / Coverage %": "66.7%",
    "Coverage Status": "PARTIAL",
    "Evidence / Uncovered Lines": "Uncovered edge cases: L71 (empty array return), L75 (limit <= 0)"
  },
  {
    "Module": "lib/coverage-fixtures.ts",
    "Function / Feature Name": "classifyRegressionRisk",
    "File Location": "lib/coverage-fixtures.ts",
    "Line Number Range": "L84–L95",
    "Required Statements / Paths": 4,
    "Achieved (Covered)": 2,
    "Score / Coverage %": "50.0%",
    "Coverage Status": "PARTIAL",
    "Evidence / Uncovered Lines": "Uncovered paths: L91 (churn>80 without duplication), L93 (churn<=80 with duplication)"
  },
  {
    "Module": "lib/coverage-fixtures.ts",
    "Function / Feature Name": "formatItemSummary",
    "File Location": "lib/coverage-fixtures.ts",
    "Line Number Range": "L103–L106",
    "Required Statements / Paths": 3,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "NONE (Untested)",
    "Evidence / Uncovered Lines": "Uncovered function: L105-106 (plural string formatting)"
  },
  {
    "Module": "lib/coverage-fixtures.ts",
    "Function / Feature Name": "legacyMigrateItem",
    "File Location": "lib/coverage-fixtures.ts",
    "Line Number Range": "L114–L127",
    "Required Statements / Paths": 6,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "NONE (Untested)",
    "Evidence / Uncovered Lines": "Uncovered function: L117-120 (legacy data migration)"
  },

  // lib/db.ts
  {
    "Module": "lib/db.ts",
    "Function / Feature Name": "readAll",
    "File Location": "lib/db.ts",
    "Line Number Range": "L14–L24",
    "Required Statements / Paths": 5,
    "Achieved (Covered)": 5,
    "Score / Coverage %": "100.0%",
    "Coverage Status": "FULL (Tested)",
    "Evidence / Uncovered Lines": "File read & ENOENT catch path tested (L19-20)"
  },
  {
    "Module": "lib/db.ts",
    "Function / Feature Name": "writeAll",
    "File Location": "lib/db.ts",
    "Line Number Range": "L26–L29",
    "Required Statements / Paths": 3,
    "Achieved (Covered)": 3,
    "Score / Coverage %": "100.0%",
    "Coverage Status": "FULL (Tested)",
    "Evidence / Uncovered Lines": "Directory creation & JSON writeFile tested (L27-28)"
  },
  {
    "Module": "lib/db.ts",
    "Function / Feature Name": "auditLog",
    "File Location": "lib/db.ts",
    "Line Number Range": "L38–L52",
    "Required Statements / Paths": 4,
    "Achieved (Covered)": 3,
    "Score / Coverage %": "75.0%",
    "Coverage Status": "PARTIAL",
    "Evidence / Uncovered Lines": "Unreachable error catch: L47 (swallowed write failure for dead code metric)"
  },
  {
    "Module": "lib/db.ts",
    "Function / Feature Name": "getItems",
    "File Location": "lib/db.ts",
    "Line Number Range": "L54–L57",
    "Required Statements / Paths": 3,
    "Achieved (Covered)": 3,
    "Score / Coverage %": "100.0%",
    "Coverage Status": "FULL (Tested)",
    "Evidence / Uncovered Lines": "Reads & sorts items newest-first (L55-56)"
  },
  {
    "Module": "lib/db.ts",
    "Function / Feature Name": "addItem",
    "File Location": "lib/db.ts",
    "Line Number Range": "L59–L69",
    "Required Statements / Paths": 8,
    "Achieved (Covered)": 8,
    "Score / Coverage %": "100.0%",
    "Coverage Status": "FULL (Tested)",
    "Evidence / Uncovered Lines": "Trims name, generates UUID, writes JSON, logs audit entry (L60-68)"
  },
  {
    "Module": "lib/db.ts",
    "Function / Feature Name": "deleteItem",
    "File Location": "lib/db.ts",
    "Line Number Range": "L74–L82",
    "Required Statements / Paths": 8,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "NONE (Untested)",
    "Evidence / Uncovered Lines": "Unexercised CRUD operation: L77-84 (filter & write item deletion)"
  },
  {
    "Module": "lib/db.ts",
    "Function / Feature Name": "findItems",
    "File Location": "lib/db.ts",
    "Line Number Range": "L87–L92",
    "Required Statements / Paths": 6,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "NONE (Untested)",
    "Evidence / Uncovered Lines": "Unexercised search method: L91-94 (case-insensitive query filtering)"
  },

  // lib/require-session.ts
  {
    "Module": "lib/require-session.ts",
    "Function / Feature Name": "requireSession",
    "File Location": "lib/require-session.ts",
    "Line Number Range": "L15–L21",
    "Required Statements / Paths": 5,
    "Achieved (Covered)": 5,
    "Score / Coverage %": "100.0%",
    "Coverage Status": "FULL (Tested)",
    "Evidence / Uncovered Lines": "Valid JWT token check & 401 response path tested (L17-19)"
  },
  {
    "Module": "lib/require-session.ts",
    "Function / Feature Name": "requireAdminRole",
    "File Location": "lib/require-session.ts",
    "Line Number Range": "L27–L37",
    "Required Statements / Paths": 8,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "NONE (Untested)",
    "Evidence / Uncovered Lines": "Unexercised role guard: L30-39 (401 auth & 403 forbidden checks)"
  },

  // lib/validate.ts
  {
    "Module": "lib/validate.ts",
    "Function / Feature Name": "assertItemName",
    "File Location": "lib/validate.ts",
    "Line Number Range": "L17–L27",
    "Required Statements / Paths": 7,
    "Achieved (Covered)": 7,
    "Score / Coverage %": "100.0%",
    "Coverage Status": "FULL (Tested)",
    "Evidence / Uncovered Lines": "Valid string, empty string, null, and over-max-length tested (L21-24)"
  },
  {
    "Module": "lib/validate.ts",
    "Function / Feature Name": "assertItemCategory",
    "File Location": "lib/validate.ts",
    "Line Number Range": "L33–L42",
    "Required Statements / Paths": 6,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "NONE (Untested)",
    "Evidence / Uncovered Lines": "Unexercised category validation: L36-43 (type check & allowed list lookup)"
  },

  // lib/lint-fixtures.ts
  {
    "Module": "lib/lint-fixtures.ts",
    "Function / Feature Name": "unusedBindingExample",
    "File Location": "lib/lint-fixtures.ts",
    "Line Number Range": "L13–L16",
    "Required Statements / Paths": 2,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "FIXTURE (Unimported)",
    "Evidence / Uncovered Lines": "L14: unusedScratch binding (trips @typescript-eslint/no-unused-vars)"
  },
  {
    "Module": "lib/lint-fixtures.ts",
    "Function / Feature Name": "Get_Legacy_Items",
    "File Location": "lib/lint-fixtures.ts",
    "Line Number Range": "L19–L21",
    "Required Statements / Paths": 1,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "FIXTURE (Unimported)",
    "Evidence / Uncovered Lines": "L19: Snake_case naming convention violation"
  },
  {
    "Module": "lib/lint-fixtures.ts",
    "Function / Feature Name": "overNestedExample",
    "File Location": "lib/lint-fixtures.ts",
    "Line Number Range": "L25–L39",
    "Required Statements / Paths": 6,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "FIXTURE (Unimported)",
    "Evidence / Uncovered Lines": "L29: Nesting depth level 4 (trips max-depth rule)"
  },
  {
    "Module": "lib/lint-fixtures.ts",
    "Function / Feature Name": "highComplexityExample",
    "File Location": "lib/lint-fixtures.ts",
    "Line Number Range": "L45–L82",
    "Required Statements / Paths": 18,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "FIXTURE (Unimported)",
    "Evidence / Uncovered Lines": "L45: Cyclomatic complexity 10 & Cognitive complexity 19"
  },

  // lib/db-clone.ts
  {
    "Module": "lib/db-clone.ts",
    "Function / Feature Name": "readAllClone",
    "File Location": "lib/db-clone.ts",
    "Line Number Range": "L17–L27",
    "Required Statements / Paths": 5,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "CLONE FIXTURE",
    "Evidence / Uncovered Lines": "L17-27: Duplicated copy of lib/db.ts readAll method (jscpd clone 1)"
  },
  {
    "Module": "lib/db-clone.ts",
    "Function / Feature Name": "writeAllClone",
    "File Location": "lib/db-clone.ts",
    "Line Number Range": "L29–L32",
    "Required Statements / Paths": 3,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "CLONE FIXTURE",
    "Evidence / Uncovered Lines": "L29-32: Duplicated copy of lib/db.ts writeAll method (jscpd clone 2)"
  },
  {
    "Module": "lib/db-clone.ts",
    "Function / Feature Name": "addItemCopy",
    "File Location": "lib/db-clone.ts",
    "Line Number Range": "L34–L48",
    "Required Statements / Paths": 8,
    "Achieved (Covered)": 0,
    "Score / Coverage %": "0.0%",
    "Coverage Status": "CLONE FIXTURE",
    "Evidence / Uncovered Lines": "L34-48: Duplicated copy of lib/db.ts addItem method (jscpd clone 3)"
  }
];

// Metric Wise Master Table with Exact Line Numbers & File Locations
const metricWiseLocations = [
  {
    "Metric ID": "M001",
    "Metric Name": "Test Case Granularity",
    "Category": "Control Flow Testing",
    "File Location": "scripts/mocha-stats.mjs",
    "Line Number Range": "L35–L62",
    "Required Target Count": "5.0 tests/suite",
    "Achieved Count": "9.2 tests/suite",
    "Score / Value out of 100": "92.0",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "mocha-stats.json (46 tests / 5 suites)"
  },
  {
    "Metric ID": "M002",
    "Metric Name": "Unreachable Logic Identification",
    "Category": "Control Flow Testing",
    "File Location": "lib/db.ts",
    "Line Number Range": "L47–L50",
    "Required Target Count": "<= 20% skipped",
    "Achieved Count": "1 skipped catch block",
    "Score / Value out of 100": "100.0",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "lib/db.ts (auditLog istanbul ignore branch)"
  },
  {
    "Metric ID": "M003",
    "Metric Name": "Surface-Level Correctness",
    "Category": "Control Flow Testing",
    "File Location": "test/lib/coverage-fixtures.test.ts",
    "Line Number Range": "L104–L112",
    "Required Target Count": "46 total tests",
    "Achieved Count": "44 passed, 2 pending",
    "Score / Value out of 100": "95.65",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "test/lib/coverage-fixtures.test.ts (2 pending tests)"
  },
  {
    "Metric ID": "M004",
    "Metric Name": "Statement Coverage Percentage",
    "Category": "Control Flow Testing",
    "File Location": "lib/coverage-fixtures.ts",
    "Line Number Range": "L24–L127",
    "Required Target Count": "121 total statements",
    "Achieved Count": "88 statements covered",
    "Score / Value out of 100": "72.72",
    "Status": "Implemented (Gate 65%)",
    "Exact Fixture Code / Artifact": "nyc-mocha/coverage-summary.json"
  },
  {
    "Metric ID": "M005",
    "Metric Name": "Boolean Accuracy Verification",
    "Category": "Control Flow Testing",
    "File Location": "lib/coverage-fixtures.ts",
    "Line Number Range": "L45–L95",
    "Required Target Count": "55 total branches",
    "Achieved Count": "35 branches covered",
    "Score / Value out of 100": "63.63",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "lib/coverage-fixtures.ts (uncovered if/else arms)"
  },
  {
    "Metric ID": "M006",
    "Metric Name": "Sequence Integrity Verification",
    "Category": "Control Flow Testing",
    "File Location": "nyc-mocha/coverage-summary.json",
    "Line Number Range": "L1–L100",
    "Required Target Count": "108 total lines",
    "Achieved Count": "80 lines visited",
    "Score / Value out of 100": "74.07",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "nyc-mocha/coverage-summary.json"
  },
  {
    "Metric ID": "M007",
    "Metric Name": "Loop Boundary Check",
    "Category": "Control Flow Testing",
    "File Location": "lib/lint-fixtures.ts",
    "Line Number Range": "L48–L64",
    "Required Target Count": "Loop n=0, n=1, n>1",
    "Achieved Count": "Loop n=0, n>0 tested",
    "Score / Value out of 100": "66.7",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "lib/lint-fixtures.ts (highComplexityExample loop)"
  },
  {
    "Metric ID": "M008",
    "Metric Name": "Boundary Failure Identification",
    "Category": "Control Flow Testing",
    "File Location": "scripts/mocha-stats.mjs",
    "Line Number Range": "L40–L55",
    "Required Target Count": "46 total tests",
    "Achieved Count": "0 failed boundary tests",
    "Score / Value out of 100": "0.0",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "mocha-stats.json"
  },
  {
    "Metric ID": "M009",
    "Metric Name": "Branch Misdirection Discovery",
    "Category": "Control Flow Testing",
    "File Location": "scripts/misdirection-count.mjs",
    "Line Number Range": "L30–L65",
    "Required Target Count": "121 total mutants",
    "Achieved Count": "1 survived mutant",
    "Score / Value out of 100": "80.0",
    "Status": "Implemented (StrykerJS)",
    "Exact Fixture Code / Artifact": "misdirection-stats.json (1 misdirection mutant)"
  },
  {
    "Metric ID": "M010",
    "Metric Name": "Branch Coverage Percentage",
    "Category": "Control Flow Testing",
    "File Location": "lib/coverage-fixtures.ts",
    "Line Number Range": "L1–L127",
    "Required Target Count": "55 total branches",
    "Achieved Count": "35 branches covered",
    "Score / Value out of 100": "63.63",
    "Status": "Implemented (Gate 55%)",
    "Exact Fixture Code / Artifact": "nyc-mocha/coverage-summary.json"
  },
  {
    "Metric ID": "M011",
    "Metric Name": "Unused Variable Detection",
    "Category": "Static Code Analysis",
    "File Location": "lib/lint-fixtures.ts",
    "Line Number Range": "L14",
    "Required Target Count": "0 unused variables",
    "Achieved Count": "1 unused variable",
    "Score / Value out of 100": "0.0",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "lib/lint-fixtures.ts (unusedScratch assigned but never read)"
  },
  {
    "Metric ID": "M012",
    "Metric Name": "Naming Convention Validation",
    "Category": "Static Code Analysis",
    "File Location": "lib/lint-fixtures.ts",
    "Line Number Range": "L19",
    "Required Target Count": "camelCase/PascalCase",
    "Achieved Count": "1 snake_case violation",
    "Score / Value out of 100": "0.0",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "lib/lint-fixtures.ts (Get_Legacy_Items)"
  },
  {
    "Metric ID": "M013",
    "Metric Name": "Complexity Rule Detection",
    "Category": "Static Code Analysis",
    "File Location": "lib/lint-fixtures.ts",
    "Line Number Range": "L29, L45",
    "Required Target Count": "Complexity <= 8, Depth <= 3",
    "Achieved Count": "Complexity = 10, Depth = 4",
    "Score / Value out of 100": "0.0",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "lib/lint-fixtures.ts (overNestedExample & highComplexityExample)"
  },
  {
    "Metric ID": "M014",
    "Metric Name": "Code Duplication Cleanliness",
    "Category": "Static Code Analysis",
    "File Location": "lib/db-clone.ts & require-session.ts",
    "Line Number Range": "L17–L48 & L29–L35",
    "Required Target Count": "<= 5.0% duplication",
    "Achieved Count": "2.76% (4 clone pairs)",
    "Score / Value out of 100": "97.24",
    "Status": "Implemented (CI Gate)",
    "Exact Fixture Code / Artifact": "jscpd-report/jscpd-report.json (373 duplicated tokens)"
  },
  {
    "Metric ID": "M015",
    "Metric Name": "Regression Focus Mapping",
    "Category": "Static Code Analysis",
    "File Location": "scripts/duplication-regression.mjs",
    "Line Number Range": "L1–L120",
    "Required Target Count": "4 clone pairs",
    "Achieved Count": "4 clone pairs mapped",
    "Score / Value out of 100": "100.0",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "duplication-regression-map.json (3 test file targets mapped)"
  },
  {
    "Metric ID": "M016",
    "Metric Name": "Audit Trail Verification",
    "Category": "Data Flow Testing",
    "File Location": "lib/db.ts",
    "Line Number Range": "L38–L52",
    "Required Target Count": "100% addItem audit logs",
    "Achieved Count": "100% audit log coverage",
    "Score / Value out of 100": "100.0",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "data/audit.log (structured JSON entries)"
  },
  {
    "Metric ID": "M017",
    "Metric Name": "Impact-Driven Verification",
    "Category": "Code Churn",
    "File Location": "scripts/code-churn.mjs",
    "Line Number Range": "L50–L105",
    "Required Target Count": "10 top churn files",
    "Achieved Count": "10 top churn files mapped",
    "Score / Value out of 100": "100.0",
    "Status": "Implemented",
    "Exact Fixture Code / Artifact": "test-impact-map.json (prioritized regression test list)"
  }
];

const wb = XLSX.utils.book_new();

const ws1 = XLSX.utils.json_to_sheet(functionBreakdown);
const ws2 = XLSX.utils.json_to_sheet(metricWiseLocations);

XLSX.utils.book_append_sheet(wb, ws1, "Function & File Line Coverage");
XLSX.utils.book_append_sheet(wb, ws2, "Metric Locations & Line Numbers");

XLSX.writeFile(wb, OUTPUT_PATH);
console.log(`Metrics Excel with line numbers written successfully to ${OUTPUT_PATH}`);
