import { readFileSync, writeFileSync } from "fs";
import path from "path";

const masterJson = JSON.parse(
  readFileSync(path.join(process.cwd(), "whitebox_parsed_master.json"), "utf-8")
);

console.log(`Loaded ${masterJson.length} parsed whitebox rows.\n`);

const cleanMetrics = [];

for (const m of masterJson) {
  if (!m.l1 || m.l1 === "L1 Strategy" || m.l1.includes("▶")) continue;
  
  cleanMetrics.push({
    id: `WB-${String(cleanMetrics.length + 1).padStart(3, "0")}`,
    l1Strategy: m.l1,
    l2TestingType: m.l2,
    l3Technique: m.l3,
    l4Classification: m.l4,
    l5Metric: m.l5,
    description: m.description,
    rawFormula: m.formula,
    slaThreshold: m.slaThreshold,
    scoreFormula: m.normalizedScoreFormula,
    frequency: m.frequency
  });
}

console.log(`Cleaned valid metrics count: ${cleanMetrics.length}\n`);

writeFileSync(
  path.join(process.cwd(), "whitebox_clean_105_metrics.json"),
  JSON.stringify(cleanMetrics, null, 2)
);

// Group by L2 Testing Type
const groups = {};
for (const m of cleanMetrics) {
  const g = `${m.l1Strategy} > ${m.l2TestingType}`;
  if (!groups[g]) groups[g] = [];
  groups[g].push(m);
}

console.log("=== WHITE BOX TAXONOMY BREAKDOWN ===");
for (const [group, items] of Object.entries(groups)) {
  console.log(`\n📌 ${group} (${items.length} metrics):`);
  for (const item of items) {
    console.log(`   • [${item.id}] ${item.l5Metric} (${item.l3Technique} > ${item.l4Classification})`);
  }
}
