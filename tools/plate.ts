/**
 * Dev tool: paint one plate to a static SVG file, for looking at a recipe
 * without a browser. `tsx tools/plate.ts <recipe> <seed> <w> <h> <out.svg>`
 */
import { writeFileSync } from "node:fs";
import { composeStatic, paint } from "../src/world/painter";

const [recipe = "valley", seed = "7", w = "1440", h = "900", out = "plate.svg"] = process.argv.slice(2);
const t = performance.now();
const plate = paint(recipe, Number(seed), Number(w), Number(h));
const svg = composeStatic(plate);
writeFileSync(out, svg);
console.log(`${recipe}: ${(svg.length / 1024).toFixed(0)} KB in ${(performance.now() - t).toFixed(0)} ms`);
