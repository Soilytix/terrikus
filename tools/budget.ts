/**
 * Size budget (spec §8.2). Fails the build when the gzipped initial JS (the
 * entry chunk and its static imports) or the lazily loaded world chunk (Pixi
 * plus the renderer) grows past its budget.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const KB = 1024;
const BUDGET = { initial: 200 * KB, world: 400 * KB };
const dist = "dist";
const assets = join(dist, "assets");

const html = readFileSync(join(dist, "index.html"), "utf8");
const initialFiles = [...html.matchAll(/(?:src|href)="\.\/assets\/([^"]+\.js)"/g)].map((m) => m[1] as string);
const gz = (file: string) => gzipSync(readFileSync(join(assets, file))).length;

const allJs = readdirSync(assets).filter((f) => f.endsWith(".js"));
const initial = initialFiles.reduce((sum, f) => sum + gz(f), 0);
const world = allJs.filter((f) => !initialFiles.includes(f)).reduce((sum, f) => sum + gz(f), 0);

const rows = [
  ["initial JS (gz)", initial, BUDGET.initial],
  ["lazy chunks (gz)", world, BUDGET.world],
] as const;
let failed = false;
for (const [name, size, limit] of rows) {
  const ok = size <= limit;
  failed ||= !ok;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${name.padEnd(18)} ${(size / KB).toFixed(1).padStart(7)} KB / ${limit / KB} KB`,
  );
}
if (failed) process.exit(1);
