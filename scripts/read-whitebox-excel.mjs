import XLSX from "xlsx";
import { readFileSync } from "fs";

const filePath = "C:\\Users\\moham\\Downloads\\Testable_Strategy_Metrics_Mapping_v0.2 (4).xlsx";
const buf = readFileSync(filePath);
const wb = XLSX.read(buf, { type: "buffer" });

console.log("Sheet Names:", wb.SheetNames);

for (const sheetName of wb.SheetNames) {
  console.log(`\n=== SHEET: ${sheetName} ===`);
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  console.log("Total rows:", data.length);
  for (let i = 0; i < Math.min(data.length, 30); i++) {
    const row = data[i];
    if (row.some(c => c !== "")) {
      console.log(`R${i}:`, JSON.stringify(row));
    }
  }
}
