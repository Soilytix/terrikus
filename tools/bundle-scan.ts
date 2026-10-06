/**
 * Bundle scan (spec §9, art-direction §7). BioRender and strangespecimens art is
 * reference only and must never ship; neither may a customer-named file.
 */
import { readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { INTERNAL_ASSETS } from "../src/assets/manifest";

const FORBIDDEN = [/biorender/i, /strange-?specimens/i, /^ss-/i];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// Designer infographics are internal-only (spec OD-6): a public dist/ must not hold one.
if (process.env.SW_PROFILE === "public")
  FORBIDDEN.push(...INTERNAL_ASSETS.map((a) => new RegExp(`^${basename(a.path, extname(a.path))}-`)));

const hits = walk("dist").filter((p) => FORBIDDEN.some((re) => re.test(p.split("/").pop() ?? "")));
if (hits.length > 0) {
  console.error("Forbidden assets in dist/:\n" + hits.join("\n"));
  process.exit(1);
}
console.log(`ok   bundle scan: ${walk("dist").length} files, no reference-only art`);
