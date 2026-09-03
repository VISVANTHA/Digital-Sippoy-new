import XLSX from "xlsx";
import { readFileSync, existsSync } from "fs";

const files = [
  "C:\\Users\\moham\\Downloads\\digital_sippoy_monolith_RECHECK_v5.xlsx",
  "C:\\Users\\moham\\Downloads\\Digital-Sippoy_SAST-SCA_Rescan_v2.xlsx",
  "C:\\Users\\moham\\Downloads\\Digital_Sippoy_CodeChurn_Coverage_Delta_Update_v2 1.xlsx",
];

console.log("=== PARSING NEW 3 RECHECK EXCEL FILES ===\n");

for (let idx = 0; idx < files.length; idx++) {
  const filePath = files[idx];
  console.log(`\n======================================================`);
  console.log(`FILE [${idx + 1}/${files.length}]: ${filePath}`);
  console.log(`======================================================`);

  if (!existsSync(filePath)) {
    console.error("File does not exist:", filePath);
    continue;
  }

  const buf = readFileSync(filePath);
  const wb = XLSX.read(buf, { type: "buffer" });
  console.log("Sheet Names:", wb.SheetNames);

  for (const sName of wb.SheetNames) {
    console.log(`\n--- Sheet: "${sName}" ---`);
    const ws = wb.Sheets[sName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    console.log(`Total Rows: ${rows.length}`);

    for (let r = 0; r < Math.min(rows.length, 25); r++) {
      const row = rows[r];
      if (row.some(c => String(c).trim() !== "")) {
        console.log(`  Row ${r}:`, JSON.stringify(row));
      }
    }
  }
}
