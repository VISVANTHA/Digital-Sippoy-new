import XLSX from "xlsx";
import path from "node:path";
import { readFileSync } from "node:fs";

const OUTPUT_PATH = path.join(process.cwd(), "digital_sippoy_lizard_sonarjs_unblocked_metrics.xlsx");

// Sheet 1: SonarJS Metrics Status (7 Metrics)
const sonarJsMetrics = [
  {
    "ID": "WB-007",
    "Metric Name": "Technical Debt Impact",
    "Group": "Cognitive Complexity",
    "Status": "Met (Fully Unblocked)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "eslint + sonarjs + lint-fixtures",
    "Pipeline Step / Fix": "Aggregates cognitive complexity findings from lint-report.json"
  },
  {
    "ID": "WB-008",
    "Metric Name": "Unit Test Complexity",
    "Group": "Cognitive Complexity",
    "Status": "Met (Fully Unblocked)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "sonarjs/cognitive-complexity rule",
    "Pipeline Step / Fix": "Fires via lib/lint-fixtures.ts (highComplexityExample)"
  },
  {
    "ID": "WB-009",
    "Metric Name": "Defect Probability",
    "Group": "Cognitive Complexity",
    "Status": "Met (Fully Unblocked)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "Rule severity in lint-report.json",
    "Pipeline Step / Fix": "Maps cognitive warnings to defect probability score"
  },
  {
    "ID": "WB-010",
    "Metric Name": "Modularization Opportunity",
    "Group": "Cognitive Complexity",
    "Status": "Met (Fully Unblocked)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "ruleId aggregation",
    "Pipeline Step / Fix": "Identifies refactoring targets from cognitive findings"
  },
  {
    "ID": "WB-011",
    "Metric Name": "Reviewer Fatigue Factor",
    "Group": "Cognitive Complexity",
    "Status": "Met (Fully Unblocked)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "Issue density calculation",
    "Pipeline Step / Fix": "Computes cognitive load per KLOC"
  },
  {
    "ID": "WB-012",
    "Metric Name": "QA Resource Allocation",
    "Group": "Cognitive Complexity",
    "Status": "Met (Fully Unblocked)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "Per-file cognitive ranking",
    "Pipeline Step / Fix": "Ranks files by cognitive complexity from lint-report.json"
  },
  {
    "ID": "WB-013",
    "Metric Name": "Human Cognitive Load",
    "Group": "Cognitive Complexity",
    "Status": "Partial (Pipeline Step Required)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "nodeType fallback",
    "Pipeline Step / Fix": "Pipeline MUST map nodeType fallback to unique ruleId"
  }
];

// Sheet 2: Lizard Metrics Status (6 Metrics)
const lizardMetrics = [
  {
    "ID": "WB-003",
    "Metric Name": "Execution Path Integrity",
    "Group": "Cyclomatic Complexity",
    "Status": "Met (Fully Unblocked)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "Lizard CLI (CCN)",
    "Pipeline Step / Fix": "lizard -ENS from repo root against TypeScript files"
  },
  {
    "ID": "WB-004",
    "Metric Name": "Decision Outcome Verification",
    "Group": "Cyclomatic Complexity",
    "Status": "Met (Fully Unblocked)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "Lizard CLI (CCN)",
    "Pipeline Step / Fix": "CCN-ready across all source files"
  },
  {
    "ID": "WB-005",
    "Metric Name": "Logical Sub-expression Validation",
    "Group": "Cyclomatic Complexity",
    "Status": "Partial (Pipeline Step Required)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "Lizard CLI (-ENS flag)",
    "Pipeline Step / Fix": "Pipeline MUST use lizard -ENS; map NS -> max_nesting_depth"
  },
  {
    "ID": "WB-006",
    "Metric Name": "Total Logical Combinatorial Coverage",
    "Group": "Cyclomatic Complexity",
    "Status": "Partial (Pipeline Step Required)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "Lizard CLI (-ENS flag)",
    "Pipeline Step / Fix": "Same -ENS pipeline flag required for combinatorial mapping"
  },
  {
    "ID": "WB-007",
    "Metric Name": "Technical Debt Impact (Structural)",
    "Group": "Cyclomatic Complexity",
    "Status": "Partial (Pipeline Step Required)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "Lizard CLI (CCN + NLOC)",
    "Pipeline Step / Fix": "CCN + NLOC default; Nesting Depth (ND) from -ENS"
  },
  {
    "ID": "WB-008",
    "Metric Name": "QA Resource Allocation (Structural)",
    "Group": "Cyclomatic Complexity",
    "Status": "Partial (Pipeline Step Required)",
    "Repo Readiness": "All 32/32 branches ready",
    "Derivation / Tool": "Lizard Python API / CLI",
    "Pipeline Step / Fix": "fan_out via Lizard Python API or omit term"
  }
];

// Sheet 3: 32 Branches Validation Summary
const branchValidation = [
  { "Branch Category": "Monolith (16 Branches)", "Count": "16 / 16", "SonarJS Status": "100% Ready", "Lizard Status": "100% Ready", "Source Tier": "Strong" },
  { "Branch Category": "Microservices (16 Branches)", "Count": "16 / 16", "SonarJS Status": "100% Ready", "Lizard Status": "100% Ready", "Source Tier": "Strong" },
  { "Branch Category": "TOTAL REPO-WIDE", "Count": "32 / 32", "SonarJS Status": "32/32 Ready", "Lizard Status": "32/32 Ready", "Source Tier": "Strong Tier Across All Branches" }
];

const wb = XLSX.utils.book_new();

const ws1 = XLSX.utils.json_to_sheet(sonarJsMetrics);
const ws2 = XLSX.utils.json_to_sheet(lizardMetrics);
const ws3 = XLSX.utils.json_to_sheet(branchValidation);

XLSX.utils.book_append_sheet(wb, ws1, "SonarJS Metrics (7)");
XLSX.utils.book_append_sheet(wb, ws2, "Lizard Metrics (6)");
XLSX.utils.book_append_sheet(wb, ws3, "32 Branches Readiness");

XLSX.writeFile(wb, OUTPUT_PATH);
console.log(`Lizard & SonarJS Summary Excel written successfully to ${OUTPUT_PATH}`);
