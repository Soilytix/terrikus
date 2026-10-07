/**
 * Chapter 5 charged landscape: a swelling 2:1 stack and a tight 1:1 stack
 * edge-on in soil water, cations hovering over their charges, nitrate drifting
 * down to the drain. Positions match the `c5-platelet` scene anchors.
 */
import { W } from "../../../styles/scene";
import { INK, linear, range, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg } from "../svg";
import type { RecipeOut } from "./index";

/** Plate-unit centres: smectite, kaolinite, the scanned calcium ion, the scanned nitrate. */
const LAYOUT = {
  land: { sm: [0.24, 0.44], ka: [0.56, 0.44], ca: [0.24, 0.32], no3: [0.42, 0.76], width: 0.26 },
  port: { sm: [0.5, 0.3], ka: [0.5, 0.45], ca: [0.72, 0.25], no3: [0.62, 0.54], width: 0.7 },
} as const;

export function c5Platelet(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 17);
  const L = h > w ? LAYOUT.port : LAYOUT.land;
  const pw = L.width * w;
  const ionR = u * 0.016;

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.film, W.pale, 0.3)],
      [0.7, mix(W.film, W.water, 0.35)],
      [1, mix(W.water, W.deep, 0.45)],
    ])})"`,
  );

  const clay = new Svg(w, h);
  const ions = new Svg(w, h);
  const ion = (x: number, y: number, fill: string, rad = ionR) => {
    ions.circle(x, y, rad, `fill="${fill}" stroke="${INK}" stroke-width="${u * 0.002}"`);
    ions.circle(x - rad * 0.3, y - rad * 0.3, rad * 0.3, `fill="${W.pale}" opacity="0.5"`);
  };

  /** A stack of `n` layers, each `bands` sheets thick, `gap` apart; returns its top edge. */
  const stack = (cx: number, cy: number, n: number, bands: number, gap: number, charges: number) => {
    const band = u * 0.011;
    const layer = band * bands;
    const total = n * layer + (n - 1) * gap;
    const top = cy - total / 2;
    for (let k = 0; k < n; k++) {
      const y0 = top + k * (layer + gap);
      const x0 = cx - pw / 2 + range(r, -1, 1) * u * 0.01;
      for (let b = 0; b < bands; b++) {
        // Silica sheets pale, the aluminium sheet (the second band) darker: 1:1 and 2:1 read in the bands.
        const al = b === 1;
        clay.rect(
          x0,
          y0 + b * band,
          pw,
          band,
          `fill="${al ? mix(W.clay, W.dark, 0.25) : mix(W.clay, W.pale, 0.25)}" stroke="${INK}" stroke-width="${u * 0.0015}"`,
        );
      }
      // Water and hydrated cations between swelling layers.
      if (gap > 0 && k < n - 1) {
        const gy = y0 + layer + gap / 2;
        for (let j = 0; j < 6; j++) ion(x0 + ((j + 0.5) / 6) * pw, gy, mix(W.pale, W.film, 0.3), gap * 0.32);
      }
    }
    // Negative charges along the top surface, cations hovering over them.
    for (let j = 0; j < charges; j++) {
      const x = cx - pw / 2 + ((j + 0.5) / charges) * pw;
      clay.path(
        `M${x - u * 0.006},${top + u * 0.004}L${x + u * 0.006},${top + u * 0.004}`,
        `stroke="${W.pale}" stroke-width="${u * 0.0025}"`,
      );
    }
    return top;
  };

  const smTop = stack(L.sm[0] * w, L.sm[1] * h, 3, 3, u * 0.03, 8);
  const kaTop = stack(L.ka[0] * w, L.ka[1] * h, 3, 2, 0, 2);

  // Cations over the 2:1 surface; the scanned calcium sits at its anchor.
  const caX = L.ca[0] * w;
  const caY = L.ca[1] * h;
  const smY = Math.min(caY, smTop - ionR * 1.8);
  for (let j = 0; j < 8; j++) {
    const x = L.sm[0] * w - pw / 2 + ((j + 0.5) / 8) * pw;
    if (Math.abs(x - caX) < ionR * 2.2) continue;
    ion(x, smY + range(r, -0.4, 0.4) * ionR, j % 3 === 0 ? mix(W.sand, W.pale, 0.4) : W.pale);
  }
  ion(caX, caY, W.pale, ionR * 1.25);
  for (let j = 0; j < 2; j++) ion(L.ka[0] * w - pw / 2 + ((j + 0.5) / 2) * pw, kaTop - ionR * 1.8, W.pale);

  // Nitrate drifting down, each with a faint trail.
  const nx = L.no3[0] * w;
  const ny = L.no3[1] * h;
  const nitrate: [number, number][] = [[nx, ny]];
  for (let j = 0; j < 5; j++) nitrate.push([nx + range(r, -0.25, 0.25) * w, ny + range(r, -0.08, 0.18) * h]);
  for (const [x, y] of nitrate) {
    ions.path(
      `M${x},${y - ionR * 1.5}L${x},${y - ionR * 5}`,
      `stroke="${W.deep}" stroke-width="${u * 0.003}" stroke-dasharray="${u * 0.006} ${u * 0.008}" opacity="0.4"`,
    );
    ion(x, y, mix(W.deep, W.stone2, 0.4));
  }

  return {
    ground: mix(W.film, W.pale, 0.3),
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0, motion: "none" },
      { id: "clay", svg: clay.toString(scale), parallax: 0.2, motion: "none" },
      { id: "ions", svg: ions.toString(scale), parallax: 0.3, motion: "none" },
    ],
    sprites: [],
    particles: [],
  };
}
