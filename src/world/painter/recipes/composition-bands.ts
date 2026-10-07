/**
 * The handful separated by volume (R02, p-m1): an overlay that settles the
 * handful into stacked bands at the idealised 45/5/25/25 of a moist loam.
 * Schematic, like the panel's figure; no text, world register only.
 */
import { W } from "../../../styles/scene";
import { radial, range } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg } from "../svg";

export type Band = "mineral" | "organic" | "water" | "air";

/** Bottom to top, percent of the volume (world-bible prologue, p-m1). */
export const BANDS: readonly [Band, number][] = [
  ["mineral", 45],
  ["organic", 5],
  ["water", 25],
  ["air", 25],
];

/** Recipes whose plate holds the handful the overlay settles out of. */
export const SEPARATES = new Set(["handful"]);

export interface BandsLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The column stands where the handful's heap lies (geometry as in `handful.ts`). */
export function bandsLayout(w: number, h: number): BandsLayout {
  const portrait = h > w;
  const u = Math.min(w, h);
  const R = portrait ? w * 0.42 : Math.min(w * 0.36, u * 0.48);
  const base = (portrait ? 0.36 : 0.58) * h + R * 0.42;
  const ch = R * (portrait ? 1.45 : 1.2);
  const cw = R * (portrait ? 0.7 : 0.55);
  return { x: w / 2 - cw / 2, y: base - ch, w: cw, h: ch };
}

/** Water band tint and opacity for a water share of 0–50 % of the volume (the p-m1 slider). */
export function waterLook(water: number): { colour: string; alpha: number } {
  const k = Math.max(0, Math.min(1, water / 50));
  return { colour: mix(mix(W.film, W.water, k), W.deep, k * 0.35), alpha: 0.2 + 0.7 * k };
}

/** One band as its own small SVG, `bw` × `bh` CSS pixels. The water band is pale: the stage tints it. */
function bandSvg(band: Band, bw: number, bh: number, seed: number, water: string): Svg {
  const s = new Svg(bw, bh);
  const r = rngFor(seed, 41 + BANDS.findIndex(([b]) => b === band));
  const area = bw * bh;
  if (band === "mineral") {
    s.rect(0, 0, bw, bh, `fill="${mix(W.sand, W.subsoil, 0.35)}"`);
    for (let i = 0; i < area / 60; i++) {
      const tone = mix(r() < 0.5 ? W.sand : W.stone1, W.subsoil, range(r, 0, 0.5));
      s.circle(range(r, 0, bw), range(r, 0, bh), range(r, 0.8, 2.6), `fill="${tone}" opacity="0.85"`);
    }
  } else if (band === "organic") {
    s.rect(0, 0, bw, bh, `fill="${W.humus}"`);
    for (let i = 0; i < area / 90; i++) {
      s.circle(range(r, 0, bw), range(r, 0, bh), range(r, 0.6, 1.8), `fill="${W.loam}" opacity="0.7"`);
    }
  } else if (band === "water") {
    s.rect(0, 0, bw, bh, `fill="${water}"`);
    s.rect(0, 0, bw, Math.max(1, bh * 0.04), `fill="${W.pale}" opacity="0.7"`);
  } else {
    s.rect(0, 0, bw, bh, `fill="${W.pale}" opacity="0.16"`);
    for (let i = 0; i < area / 900; i++) {
      s.circle(
        range(r, 0, bw),
        range(r, 0, bh),
        range(r, 1.5, 4),
        `fill="none" stroke="${W.pale}" stroke-width="0.8" opacity="0.45"`,
      );
    }
  }
  return s;
}

export interface BandsPlate {
  layout: BandsLayout;
  /** Full plate: a soft dark veil the handful recedes behind. */
  veil: string;
  /** Full plate: the column's glass edge. */
  edge: string;
  bands: { id: Band; svg: string; y: number; h: number }[];
}

/** The overlay in parts, for the stage to ease in. `scale` sets the raster size. */
export function compositionBands(w: number, h: number, seed: number, scale = 1): BandsPlate {
  const L = bandsLayout(w, h);
  const veil = new Svg(w, h);
  veil.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(
      veil,
      [
        [0, W.dark, 0.72],
        [1, W.dark, 0.5],
      ],
      0.5,
      (L.y + L.h / 2) / h,
      0.6,
    )})"`,
  );
  // The column's inside is opaque, so the heap never shows through water and air.
  veil.rect(L.x, L.y, L.w, L.h, `fill="${mix(W.dark, W.stone2, 0.4)}"`);
  const edge = new Svg(w, h);
  const lip = L.w * 0.06;
  edge.rect(L.x, L.y, L.w, L.h, `fill="none" stroke="${W.pale}" stroke-width="1.5" opacity="0.6"`);
  edge.rect(L.x - lip, L.y - 1, L.w + lip * 2, 2, `fill="${W.pale}" opacity="0.6"`);
  let top = L.y + L.h;
  const bands = BANDS.map(([id, pct]) => {
    const bh = (pct / 100) * L.h;
    top -= bh;
    const svg = bandSvg(id, L.w, bh, seed, W.pale).toString(scale);
    return { id, svg, y: top, h: bh };
  });
  return { layout: L, veil: veil.toString(1), edge: edge.toString(scale), bands };
}

/** The end state as one flat SVG: the static fallback's second plate. */
export function compositionPlate(w: number, h: number, seed: number, water: number): string {
  const p = compositionBands(w, h, seed);
  const look = waterLook(water);
  const nest = (svg: string, x: number, y: number, bw: number, bh: number, extra = "") =>
    svg.replace(
      /^<svg [^>]*?width="\d+" height="\d+"/,
      `<svg x="${x}" y="${y}" width="${bw}" height="${bh}"${extra}`,
    );
  const parts = [
    nest(p.veil, 0, 0, w, h),
    ...p.bands.map((b) =>
      b.id === "water"
        ? nest(
            bandSvg("water", p.layout.w, b.h, seed, look.colour).toString(),
            p.layout.x,
            b.y,
            p.layout.w,
            b.h,
            ` opacity="${look.alpha.toFixed(2)}"`,
          )
        : nest(b.svg, p.layout.x, b.y, p.layout.w, b.h),
    ),
    nest(p.edge, 0, 0, w, h),
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${parts.join("")}</svg>`;
}
