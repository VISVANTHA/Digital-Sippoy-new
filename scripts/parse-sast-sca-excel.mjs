import XLSX from "xlsx";
import { readFileSync, existsSync } from "fs";

const filePath = "C:\\Users\\moham\\Downloads\\Digital-Sippoy_SAST-SCA_Rescan.xlsx";

console.log("=== PARSING DIGITAL-SIPPOY SAST-SCA RESCAN EXCEL ===\n");

if (!existsSync(filePath)) {
  console.error("File does not exist:", filePath);
  process.exit(1);
}

const buf = readFileSync(filePath);
const wb = XLSX.read(buf, { type: "buffer" });
console.log("Sheet Names:", wb.SheetNames);

for (const sName of wb.SheetNames) {
  console.log(`\n=================== SHEET: "${sName}" ===================`);
  const ws = wb.Sheets[sName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  console.log(`Total Rows: ${rows.length}`);
  
  for (let r = 0; r < Math.min(rows.length, 30); r++) {
    const row = rows[r];
    if (row.some(c => String(c).trim() !== "")) {
      console.log(`R${r}:`, JSON.stringify(row));
    }
  }
}
