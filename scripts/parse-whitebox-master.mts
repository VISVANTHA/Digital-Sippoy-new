import XLSX from "xlsx";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const filePath = "C:\\Users\\moham\\Downloads\\Testable_Strategy_Metrics_Mapping_v0.2 (4).xlsx";
const buf = readFileSync(filePath);
const wb = XLSX.read(buf, { type: "buffer" });

const ws = wb.Sheets["White Box"];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

console.log(`Total rows in White Box sheet: ${rows.length}\n`);

const parsedMetrics = [];
let header = null;

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  if (!row || !row.some(c => String(c).trim() !== "")) continue;
  
  // Find header row
  if (row[0] === "L1 Strategy" || row[0] === "Category") {
    header = row;
    console.log("HEADER ROW:", JSON.stringify(header));
    continue;
  }

  // Header banner rows (e.g. ▶ STATEMENT COVERAGE)
  if (String(row[0]).includes("▶") || String(row[0]).includes("§") || String(row[0]).includes("BRD")) {
    console.log(`[SECTION] ${row[0]}`);
    continue;
  }

  if (row.length >= 5 && row[0] !== "L1 Strategy") {
    parsedMetrics.push({
      rowIndex: i,
      l1: row[0],
      l2: row[1],
      l3: row[2],
      l4: row[3],
      l5: row[4],
      description: row[5] || "",
      primaryTool: row[6] || "",
      directMetric: row[7] || "",
      derivation: row[8] || "",
      validationType: row[9] || "",
      requiresLiveApp: row[10] || "",
      formula: row[13] || row[12] || "",
      slaThreshold: row[14] || "",
      normalizedScoreFormula: row[15] || "",
      frequency: row[16] || ""
    });
  }
}

console.log(`\nExtracted ${parsedMetrics.length} whitebox metric definitions!\n`);

writeFileSync(
  path.join(process.cwd(), "whitebox_parsed_master.json"),
  JSON.stringify(parsedMetrics, null, 2)
);

// Print out first 15 metrics to verify format
for (let i = 0; i < Math.min(parsedMetrics.length, 15); i++) {
  const m = parsedMetrics[i];
  console.log(`${i + 1}. [${m.l2} > ${m.l3} > ${m.l4} > ${m.l5}]`);
  console.log(`   Tool: ${m.primaryTool} | Formula: ${m.normalizedScoreFormula}`);
}
