/**
 * Offline plate baker (backlog T14, spec D-8). Runs the seeded painter in Node
 * for every scene at the reference sizes and writes AVIF rasters under
 * public/plates/: one per layer (the stage swaps them in for its own SVG
 * rasters) and one flat plate (the static view), plus manifest.json. Also bakes
 * time-lapse frame sets. Run after changing a recipe or a scene's seed:
 *   mise run bake
 * src/world/baked.test.ts fails when a baked plate no longer matches the painter.
 */
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { SCENES } from "../src/content";
import {
  BAKE_SCALE,
  BAKE_SIZES,
  SOFT,
  plateKey,
  type BakedPlate,
  type BakedTimelapse,
  type PlateManifest,
} from "../src/world/baked";
import { composeStatic, paint, type PlateLayer } from "../src/world/painter";

export const OUT = "public/plates";
const QUALITY = 55;

/**
 * Time-lapse frame sets: each frame a recipe and seed, crossfaded in order.
 * Empty until a recipe takes a time parameter (ch. 2 compressed year, ch. 11
 * pedogenesis); a frame set of unrelated plates would show change that is not there.
 */
export const TIMELAPSES: Record<
  string,
  {
    compression: string;
    size: readonly [number, number];
    frames: { label: string; recipe: string; seed: number }[];
  }
> = {};

export const sha = (s: string) => createHash("sha256").update(s).digest("hex");

/** The layer's SVG as the stage rasters it: soft layers at 1×, the rest at `BAKE_SCALE`. */
export function layerSvg(l: PlateLayer, w: number, h: number): string {
  return SOFT.has(l.id)
    ? l.svg.replace(/^(<svg [^>]*?)width="\d+" height="\d+"/, `$1width="${w}" height="${h}"`)
    : l.svg;
}

const avif = (svg: string, density = 72) =>
  sharp(Buffer.from(svg), { density }).avif({ quality: QUALITY, effort: 6 }).toBuffer();

export async function bakePlate(recipe: string, seed: number, w: number, h: number): Promise<BakedPlate> {
  const plate = paint(recipe, seed, w, h, BAKE_SCALE);
  const dir = `${recipe}-${seed}/${w}x${h}`;
  mkdirSync(join(OUT, dir), { recursive: true });
  const layers = await Promise.all(
    plate.layers.map(async (l, i) => {
      const file = `${dir}/${i}-${l.id}.avif`;
      writeFileSync(join(OUT, file), await avif(layerSvg(l, w, h)));
      return { id: l.id, file, sha: sha(l.svg) };
    }),
  );
  const flat = `${dir}/flat.avif`;
  // composeStatic sizes by its viewBox (CSS pixels): density raises it to BAKE_SCALE.
  writeFileSync(join(OUT, flat), await avif(composeStatic(paint(recipe, seed, w, h)), 72 * BAKE_SCALE));
  return { w, h, layers, flat, ground: plate.ground };
}

async function bakeTimelapse(id: string, t: (typeof TIMELAPSES)[string]): Promise<BakedTimelapse> {
  const [w, h] = t.size;
  mkdirSync(join(OUT, "timelapse", id), { recursive: true });
  const frames = await Promise.all(
    t.frames.map(async (f, i) => {
      const file = `timelapse/${id}/${i}.avif`;
      writeFileSync(
        join(OUT, file),
        await avif(composeStatic(paint(f.recipe, f.seed, w, h)), 72 * BAKE_SCALE),
      );
      return { label: f.label, file };
    }),
  );
  return { compression: t.compression, w, h, frames };
}

if (process.argv[1]?.endsWith("bake-plates.ts")) {
  rmSync(OUT, { recursive: true, force: true });
  const manifest: PlateManifest = { plates: {}, timelapses: {} };
  const scenes = [...new Map(SCENES.map((s) => [plateKey(s.recipe, s.seed), s])).values()];
  for (const s of scenes) {
    const t = performance.now();
    const key = plateKey(s.recipe, s.seed);
    manifest.plates[key] = [];
    for (const [w, h] of BAKE_SIZES) manifest.plates[key].push(await bakePlate(s.recipe, s.seed, w, h));
    console.log(`${key.padEnd(16)} ${((performance.now() - t) / 1000).toFixed(1)} s`);
  }
  for (const [id, t] of Object.entries(TIMELAPSES)) manifest.timelapses[id] = await bakeTimelapse(id, t);
  writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 1) + "\n");
  console.log(`wrote ${OUT}/manifest.json`);
}
