/**
 * Plate budget (spec §8.2): the baked AVIF plates of every scene at one scale,
 * all reference sizes together, stay within 2.5 MB. Runs beside tools/budget.ts.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { SCENES } from "../src/content";
import { LOADERS, loadChapters } from "../src/content/load";
import { plateKey, type PlateManifest } from "../src/world/baked";

// Every chapter's scenes, missions and codex, not just the ones a page has loaded.
await loadChapters(Object.keys(LOADERS));

const MB = 1024 * 1024;
const BUDGET = 2.5 * MB;
const dir = "public/plates";
const path = join(dir, "manifest.json");

if (!existsSync(path)) {
  console.log("ok   plates: none baked, the painter draws every scene");
  process.exit(0);
}
const manifest = JSON.parse(readFileSync(path, "utf8")) as PlateManifest;
const bytes = new Map<string, number>();
const seen = new Set<string>();
for (const s of SCENES) {
  const key = plateKey(s.recipe, s.seed);
  if (seen.has(key)) continue;
  seen.add(key);
  const files = (manifest.plates[key] ?? []).flatMap((p) => [p.flat, ...p.layers.map((l) => l.file)]);
  const size = files.reduce((n, f) => n + statSync(join(dir, f)).size, 0);
  bytes.set(s.scale, (bytes.get(s.scale) ?? 0) + size);
}
let failed = false;
for (const [scale, size] of bytes) {
  const ok = size <= BUDGET;
  failed ||= !ok;
  console.log(
    `${ok ? "ok  " : "FAIL"} plates: ${scale.padEnd(11)} ${(size / MB).toFixed(2).padStart(5)} MB / ${BUDGET / MB} MB`,
  );
}
if (failed) process.exit(1);
