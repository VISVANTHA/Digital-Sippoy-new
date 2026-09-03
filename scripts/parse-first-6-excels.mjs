import XLSX from "xlsx";
import { readFileSync, existsSync } from "fs";

const files = [
  "C:\\Users\\moham\\Downloads\\Lint_And_Duplication_Sheet.xlsx",
  "C:\\Users\\moham\\Downloads\\digital_sippoy_monolith_lint_duplication_v4_current.xlsx",
  "C:\\Users\\moham\\Downloads\\Digital_Sippoy_CodeChurn_Coverage_Delta_Update_v2.xlsx",
  "C:\\Users\\moham\\Downloads\\digital_sippoy_control_flow_mutation_update_v4.xlsx",
  "C:\\Users\\moham\\Downloads\\Coverage_Delta_And_All_Defs_Sheet.xlsx",
  "C:\\Users\\moham\\Downloads\\digital_sippoy_control_flow_testing_rescan.xlsx",
];

for (let idx = 0; idx < files.length; idx++) {
  const filePath = files[idx];
  console.log(`\n======================================================`);
  console.log(`FILE [${idx + 1}/${files.length}]: ${filePath}`);
  console.log(`======================================================`);

  if (!existsSync(filePath)) continue;

  const buf = readFileSync(filePath);
  const wb = XLSX.read(buf, { type: "buffer" });

  for (const sName of wb.SheetNames) {
    console.log(`\n--- Sheet: "${sName}" ---`);
    const ws = wb.Sheets[sName];
    const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
    console.log(`Total Objects: ${json.length}`);
    if (json.length > 0) {
      console.log("Sample Headers:", Object.keys(json[0]));
      console.log("First 3 rows:", JSON.stringify(json.slice(0, 3), null, 2));
    }
  }
}
