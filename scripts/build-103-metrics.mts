import XLSX from "xlsx";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const files = [
  "C:\\Users\\moham\\Downloads\\digital_sippoy_coverage_delta_update.xlsx",
  "C:\\Users\\moham\\Downloads\\digital_sippoy_control_flow_testing_update.xlsx",
  "C:\\Users\\moham\\Downloads\\digital_sippoy_lint_duplication_metrics_v2 1.xlsx",
  "C:\\Users\\moham\\Downloads\\digital_sippoy_monolith_lint_duplication_v2_CORRECTED_1.xlsx",
  "C:\\Users\\moham\\Downloads\\Digital_Sippoy_CodeChurn_Coverage_Delta_Update.xlsx",
];

const metricSet = new Map();

for (const filePath of files) {
  try {
    const buf = readFileSync(filePath);
    const wb = XLSX.read(buf, { type: "buffer" });
    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      for (const row of rows) {
        if (!row || !row.some(c => c !== "")) continue;
        // Search for rows that describe L1..L5 metrics
        const line = row.map(c => String(c).trim()).filter(Boolean);
        if (line.length >= 3) {
          const key = line.slice(0, 5).join(" > ");
          if (!key.includes("Branch") && !key.includes("Bundler") && !key.includes("Status") && !key.includes("DS-") && !key.includes("Header")) {
            metricSet.set(key, row);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
}

console.log(`Total extracted raw metric signatures: ${metricSet.size}`);
for (const [k, v] of [...metricSet.entries()].slice(0, 20)) {
  console.log(`KEY: ${k}`);
}
