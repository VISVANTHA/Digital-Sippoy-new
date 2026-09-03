import XLSX from "xlsx";
import { readFileSync } from "fs";

const filePath = "C:\\Users\\moham\\Downloads\\digital_sippoy_lizard_sonarjs_metrics_derivation.xlsx";
const buf = readFileSync(filePath);
const wb = XLSX.read(buf, { type: "buffer" });

console.log("Sheet Names in digital_sippoy_lizard_sonarjs_metrics_derivation.xlsx:", wb.SheetNames);

for (const sheetName of wb.SheetNames) {
  console.log(`\n=================== SHEET: ${sheetName} ===================`);
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  console.log(`Total rows: ${rows.length}`);
  for (let i = 0; i < Math.min(rows.length, 35); i++) {
    const row = rows[i];
    if (row.some(c => String(c).trim() !== "")) {
      console.log(`R${i}:`, JSON.stringify(row));
    }
  }
}
