/**
 * Baked plates (backlog T14): `tools/bake-plates.ts` runs the painter in Node
 * and writes AVIF rasters of each scene's layers, plus one flat plate for the
 * static view, under `public/plates/`. The runtime uses them when one was baked
 * for the scene at about the viewport's shape, and paints otherwise.
 */
import type { Plate } from "./painter";

/** Layers the stage rasters at 1×: soft gradients gain nothing from more pixels. */
export const SOFT = new Set([
  "sky",
  "far",
  "air",
  "grain",
  "mist",
  "deep",
  "water",
  "back",
  "light",
  "vignette",
]);
/** Raster scale of the crisp layers, the stage's own cap for painted plates. */
export const BAKE_SCALE = 1.5;
/** Reference viewports: desktop and phone, the two e2e projects. */
export const BAKE_SIZES = [
  [1440, 900],
  [390, 844],
] as const;
/** At most this far in log aspect from the viewport (≈ 10 %); further, the layout would shift. */
const MAX_ASPECT = 0.1;

export interface BakedLayer {
  id: string;
  file: string;
  /** SHA-256 of the layer SVG the painter gave at bake time. */
  sha: string;
}
export interface BakedPlate {
  w: number;
  h: number;
  layers: BakedLayer[];
  /** `composeStatic` of the same plate, for the static view. */
  flat: string;
  /** The plate's ground colour, behind the flat plate while it loads. */
  ground: string;
}
export interface TimelapseFrame {
  label: string;
  file: string;
}
export interface BakedTimelapse {
  /** Always shown while it plays (art-direction §5). */
  compression: string;
  w: number;
  h: number;
  frames: TimelapseFrame[];
}
export interface PlateManifest {
  /** Keyed by `recipe:seed`. */
  plates: Record<string, BakedPlate[]>;
  timelapses: Record<string, BakedTimelapse>;
}

export const plateKey = (recipe: string, seed: number) => `${recipe}:${seed}`;

/** The baked plate closest in shape to a `w`×`h` viewport, if any is close enough. */
export function pickBaked(m: PlateManifest, recipe: string, seed: number, w: number, h: number) {
  const aspect = (p: { w: number; h: number }) => Math.abs(Math.log(p.w / p.h / (w / h)));
  const best = [...(m.plates[plateKey(recipe, seed)] ?? [])].sort((a, b) => aspect(a) - aspect(b))[0];
  return best && aspect(best) <= MAX_ASPECT ? best : undefined;
}

/** A baked plate stands in for a painted one only when it has the same layers in the same order. */
export const sameLayers = (baked: BakedPlate, plate: Plate) =>
  baked.layers.length === plate.layers.length && baked.layers.every((l, i) => l.id === plate.layers[i]!.id);

let manifest: Promise<PlateManifest | null> | undefined;

/** `public/plates/manifest.json`, fetched once; null when none was baked or it cannot load. */
export function loadManifest(): Promise<PlateManifest | null> {
  manifest ??= fetch("plates/manifest.json")
    .then((r) => (r.ok ? (r.json() as Promise<PlateManifest>) : null))
    .catch(() => null);
  return manifest;
}

export const plateUrl = (file: string) => `plates/${file}`;
