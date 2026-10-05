/**
 * Writes tests/denylist-hashes.json from a plain list kept OUTSIDE the repo:
 *   SW_DENYLIST_FILE=~/somewhere/denylist.txt mise exec -- pnpm exec tsx tools/hash-denylist.ts
 * One token or two-word phrase per line, any case; blank lines and # comments ignored.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { sha256 } from "./denylist";

const file = process.env.SW_DENYLIST_FILE;
if (!file) {
  console.error("SW_DENYLIST_FILE is not set; it must point at the plain list outside the repo.");
  process.exit(4);
}
const lines = readFileSync(file, "utf8")
  .split("\n")
  .map((l) => l.replace(/#.*/, "").trim().toLowerCase())
  .filter(Boolean);
const hashes = [...new Set(lines.map(sha256))].sort();
writeFileSync("tests/denylist-hashes.json", JSON.stringify(hashes, null, 2) + "\n");
console.log(`wrote ${hashes.length} hashes`);
