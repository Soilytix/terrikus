/**
 * Dev tool: paint one plate to a static SVG file, for looking at a recipe
 * without a browser. `tsx tools/plate.ts <recipe> <seed> <w> <h> <out.svg>`
 *
 * `tsx tools/plate.ts --bench [w] [h] [scale]` instead prints the median paint
 * time of every recipe (the work the paint worker takes off the main thread).
 */
import { writeFileSync } from "node:fs";
import { composeStatic, paint } from "../src/world/painter";
import { RECIPES } from "../src/world/painter/recipes";

const args = process.argv.slice(2);
if (args[0] === "--bench") {
  const [w = "1440", h = "900", scale = "1.5"] = args.slice(1);
  const RUNS = 9;
  console.log(`paint() at ${w}×${h}, scale ${scale}, median of ${RUNS} after one warm-up`);
  for (const recipe of Object.keys(RECIPES)) {
    paint(recipe, 7, Number(w), Number(h), Number(scale));
    const times: number[] = [];
    let bytes = 0;
    for (let i = 0; i < RUNS; i++) {
      const t = performance.now();
      const plate = paint(recipe, 7, Number(w), Number(h), Number(scale));
      times.push(performance.now() - t);
      bytes =
        plate.layers.reduce((n, l) => n + l.svg.length, 0) +
        plate.sprites.reduce((n, s) => n + s.svg.length, 0);
    }
    times.sort((a, b) => a - b);
    const ms = times[RUNS >> 1]!;
    console.log(
      `${recipe.padEnd(11)} ${ms.toFixed(1).padStart(6)} ms  ${(bytes / 1024).toFixed(0).padStart(5)} KB`,
    );
  }
} else {
  const [recipe = "valley", seed = "7", w = "1440", h = "900", out = "plate.svg"] = args;
  const t = performance.now();
  const plate = paint(recipe, Number(seed), Number(w), Number(h));
  const svg = composeStatic(plate);
  writeFileSync(out, svg);
  console.log(`${recipe}: ${(svg.length / 1024).toFixed(0)} KB in ${(performance.now() - t).toFixed(0)} ms`);
}
