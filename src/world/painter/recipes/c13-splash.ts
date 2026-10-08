/**
 * Chapter 13 splash plot, seen close: bare crusted soil with loose crumbs on
 * the left, straw residue over the same soil on the right, and raindrops
 * caught in mid-fall with splash crowns where they hit bare ground.
 */
import { W } from "../../../styles/scene";
import { blob, linear, range, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg } from "../svg";
import type { RecipeOut } from "./index";

/** Where the ground starts, and the line between the bare and the covered plot, plate units. */
export const SPLASH_GROUND = 0.42;
export const SPLASH_SPLIT = 0.5;

export function c13Splash(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 17);
  const g = SPLASH_GROUND * h;

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.stone1, W.skyHigh, 0.5)],
      [SPLASH_GROUND, W.skyLow],
    ])})"`,
  );

  const soil = new Svg(w, h);
  soil.rect(
    0,
    g,
    w,
    h - g,
    `fill="url(#${linear(soil, [
      [0, mix(W.subsoil, W.loam, 0.4)],
      [1, mix(W.loam, W.topsoil, 0.5)],
    ])})"`,
  );
  // Bare side: crumbs, some already broken to fine grains.
  for (let i = 0; i < 70; i++) {
    const x = range(r, 0.02, SPLASH_SPLIT - 0.02) * w;
    const y = range(r, SPLASH_GROUND + 0.04, 0.98) * h;
    const rad = u * range(r, 0.008, 0.02) * (y / h);
    soil.path(blob(r, x, y, rad, rad * 0.7), `fill="${mix(W.loam, W.subsoil, range(r, 0, 0.6))}"`);
  }
  stipple(
    soil,
    c,
    r,
    260,
    { x0: 0, y0: SPLASH_GROUND, x1: SPLASH_SPLIT, y1: 1 },
    [W.sand, W.subsoil],
    [u * 0.0015, u * 0.003],
  );

  // Covered side: straw lying across the soil.
  const straw = new Svg(w, h);
  for (let i = 0; i < 160; i++) {
    const x = range(r, SPLASH_SPLIT, 1.02) * w;
    const y = range(r, SPLASH_GROUND + 0.02, 1) * h;
    const len = u * range(r, 0.04, 0.1) * (0.5 + y / h);
    const a = range(r, -0.5, 0.5);
    straw.path(
      `M${x},${y}l${Math.cos(a) * len},${Math.sin(a) * len}`,
      `stroke="${mix(W.sand, W.pale, range(r, 0.1, 0.5))}" stroke-width="${u * 0.004 * (0.5 + y / h)}" stroke-linecap="round"`,
    );
  }

  // Raindrops in mid-fall over both halves; crowns only where they strike bare soil.
  const rain = new Svg(w, h);
  for (let i = 0; i < 46; i++) {
    const x = range(r, 0, 1) * w;
    const y = range(r, 0.02, 0.9) * h;
    rain.path(
      `M${x},${y}l${-u * 0.004},${u * 0.03}`,
      `stroke="${W.film}" stroke-width="${u * 0.003}" stroke-linecap="round" opacity="0.7"`,
    );
  }
  for (let i = 0; i < 9; i++) {
    const x = range(r, 0.05, SPLASH_SPLIT - 0.05) * w;
    const y = range(r, SPLASH_GROUND + 0.1, 0.9) * h;
    const s = u * 0.02 * (y / h);
    let d = "";
    for (let k = 0; k < 5; k++) {
      const a = Math.PI * (1.15 + k * 0.175);
      d += `M${x},${y}l${Math.cos(a) * s},${Math.sin(a) * s}`;
    }
    rain.path(d, `stroke="${W.film}" stroke-width="${u * 0.0025}" stroke-linecap="round" opacity="0.8"`);
    rain.circle(x, y - s * 1.3, u * 0.003, `fill="${W.subsoil}"`);
  }

  return {
    ground: mix(W.loam, W.topsoil, 0.5),
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.1, motion: "none" },
      { id: "soil", svg: soil.toString(scale), parallax: 0.4, motion: "none" },
      { id: "straw", svg: straw.toString(scale), parallax: 0.45, motion: "none" },
      { id: "rain", svg: rain.toString(scale), parallax: 0.6, motion: "none" },
    ],
    sprites: [],
    particles: [],
  };
}
