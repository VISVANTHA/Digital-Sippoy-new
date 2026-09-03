import XLSX from "xlsx";
import { readFileSync, existsSync } from "fs";

const files = [
  "C:\\Users\\moham\\Downloads\\Lint_And_Duplication_Sheet.xlsx",
  "C:\\Users\\moham\\Downloads\\digital_sippoy_monolith_lint_duplication_v4_current.xlsx",
  "C:\\Users\\moham\\Downloads\\Digital_Sippoy_CodeChurn_Coverage_Delta_Update_v2.xlsx",
  "C:\\Users\\moham\\Downloads\\digital_sippoy_control_flow_mutation_update_v4.xlsx",
  "C:\\Users\\moham\\Downloads\\Coverage_Delta_And_All_Defs_Sheet.xlsx",
  "C:\\Users\\moham\\Downloads\\digital_sippoy_control_flow_testing_rescan.xlsx",
  "C:\\Users\\moham\\Downloads\\digital_sippoy_lizard_sonarjs_metrics_derivation (1).xlsx",
  "C:\\Users\\moham\\Downloads\\digital_sippoy_lizard_sonarjs_metrics_derivation.xlsx",
];

console.log("=== DEEP ANALYSIS OF ALL 8 DOWNLOADED EXCEL FILES ===\n");

for (let idx = 0; idx < files.length; idx++) {
  const filePath = files[idx];
  console.log(`\n======================================================`);
  console.log(`FILE [${idx + 1}/${files.length}]: ${filePath}`);
  console.log(`======================================================`);

  if (!existsSync(filePath)) {
    console.log("❌ File does not exist!");
    continue;
  }

  try {
    const buf = readFileSync(filePath);
    const wb = XLSX.read(buf, { type: "buffer" });
    console.log("Sheet Names:", wb.SheetNames);

    for (const sName of wb.SheetNames) {
      console.log(`\n--- Sheet: "${sName}" ---`);
      const ws = wb.Sheets[sName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      console.log(`Total Rows: ${rows.length}`);
      
      // Print first 15 non-empty rows
      let count = 0;
      for (let r = 0; r < rows.length && count < 15; r++) {
        const row = rows[r];
        if (row.some(c => String(c).trim() !== "")) {
          console.log(`  Row ${r}:`, JSON.stringify(row));
          count++;
        }
      }
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
}
