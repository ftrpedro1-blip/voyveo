import fs from "node:fs";
import path from "node:path";

const files = [
  "data/voy-veo-db.json",
  "scripts/rebuild-db.mjs",
  "scripts/reconcile-hours.mjs",
  "public/client/app.js"
];

const shouldTryRepair = (value) => /Ã|Â|â€|â€“|â€”|â€¢|ï¿½|�/.test(value);

const score = (value) => {
  const bad = (value.match(/Ã|Â|â€|â€“|â€”|â€¢|ï¿½|�|\u001d/g) || []).length;
  const good = (value.match(/[áéíóúÁÉÍÓÚñÑüÜ¡¿–—]/g) || []).length;
  return bad * 8 - good;
};

const repairString = (value) => {
  if (!shouldTryRepair(value)) return value;
  let best = value;
  let bestScore = score(value);

  for (let index = 0; index < 3; index += 1) {
    const candidate = Buffer.from(best, "latin1").toString("utf8");
    const candidateScore = score(candidate);
    if (candidate === best || candidateScore >= bestScore) break;
    best = candidate;
    bestScore = candidateScore;
  }

  return best
    .replaceAll("Â·", "·")
    .replaceAll("Â¡", "¡")
    .replaceAll("Â¿", "¿")
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—")
    .replaceAll("â€˜", "‘")
    .replaceAll("â€™", "’")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("ï¿½\u001d", "—")
    .replaceAll("�\u001d", "—")
    .replaceAll("W—galería", "W—galería")
    .replaceAll("Voy Veo", "VoyVeo");
};

const repairJsonValue = (value) => {
  if (Array.isArray(value)) return value.map(repairJsonValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, repairJsonValue(entry)]));
  }
  return typeof value === "string" ? repairString(value) : value;
};

for (const relativePath of files) {
  const filePath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) continue;
  const original = fs.readFileSync(filePath, "utf8");
  let repaired;

  if (relativePath.endsWith(".json")) {
    repaired = `${JSON.stringify(repairJsonValue(JSON.parse(original)), null, 2)}\n`;
  } else {
    repaired = repairString(original);
  }

  if (repaired !== original) {
    fs.writeFileSync(filePath, repaired, "utf8");
    console.log(`fixed ${relativePath}`);
  }
}
