/**
 * Chapter 4 rice paddy: rows of rice in still water that mirrors the sky, a
 * low earth bund in the corner, the hill pale behind. Methane bubbles and a
 * water shimmer are ambient particles (living backdrop, OD-8).
 */
import { W } from "../../../styles/scene";
import { linear, range, ridge, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";

/** Far bund, where the water starts, plate units. */
const SHORE = 0.4;
/** Vanishing point of the rice rows. */
const VP: Pt = [0.5, 0.34];

export function c4Paddy(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 23);

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, W.skyHigh],
      [SHORE, W.skyLow],
    ])})"`,
  );
  back.path(ridge(c, 0.27 * h, 0.04 * h, 1.2, 3), `fill="${W.stone2}" opacity="0.35"`);
  back.path(ridge(c, 0.31 * h, 0.025 * h, 2.4, 5), `fill="${W.foliage}" opacity="0.4"`);

  // Water: the sky's colours, darker toward the viewer.
  const water = new Svg(w, h);
  water.rect(
    0,
    SHORE * h,
    w,
    (1 - SHORE) * h,
    `fill="url(#${linear(water, [
      [0, mix(W.skyLow, W.water, 0.25)],
      [1, mix(W.water, W.deep, 0.35)],
    ])})"`,
  );
  const shore: Pt[] = Array.from({ length: 25 }, (_, i) => [
    (i / 24) * w,
    SHORE * h + (c.noise(i * 0.4, 9) - 0.5) * u * 0.01,
  ]);
  water.path(
    smoothOpen(shore) + `L${w},${(SHORE - 0.02) * h}L0,${(SHORE - 0.02) * h}Z`,
    `fill="${mix(W.loam, W.foliage, 0.3)}"`,
  );
  // Sky reflected as soft horizontal streaks.
  for (let i = 0; i < 40; i++) {
    const y = range(r, SHORE + 0.02, 0.98) * h;
    const x = range(r, 0, 1) * w;
    const len = u * range(r, 0.05, 0.2) * (y / h);
    water.path(
      `M${x - len / 2},${y}L${x + len / 2},${y}`,
      `stroke="${W.film}" stroke-width="${u * 0.002}" opacity="0.45" stroke-linecap="round"`,
    );
  }

  // Rice: rows converging on the vanishing point, tufts growing toward the viewer.
  const rice = new Svg(w, h);
  const [vx, vy] = [VP[0] * w, VP[1] * h];
  for (let row = -9; row <= 9; row++) {
    const baseX = w * 0.5 + row * w * 0.12;
    for (let k = 1; k <= 14; k++) {
      const t = (k / 14) ** 1.6;
      const y = vy + (h * 1.02 - vy) * t;
      if (y < SHORE * h + u * 0.01) continue;
      const x = vx + (baseX - vx) * t + (r() - 0.5) * u * 0.01;
      if (x < -u * 0.05 || x > w + u * 0.05) continue;
      const ht = u * (0.015 + 0.11 * t);
      const blades = 4 + Math.floor(t * 4);
      const tone = mix(W.foliage, W.pale, range(r, 0, 0.25) + (1 - t) * 0.25);
      let d = "";
      for (let b = 0; b < blades; b++) {
        const lean = (b / (blades - 1) - 0.5) * ht * 0.7 + (r() - 0.5) * ht * 0.15;
        d += `M${x},${y}Q${x + lean * 0.3},${y - ht * 0.6} ${x + lean},${y - ht * range(r, 0.85, 1.05)}`;
      }
      rice.path(
        d,
        `fill="none" stroke="${tone}" stroke-width="${Math.max(0.6, u * 0.0035 * (0.4 + t))}" stroke-linecap="round"`,
      );
      // The tuft's reflection, faint.
      rice.path(
        `M${x},${y}L${x},${y + ht * 0.3}`,
        `stroke="${W.foliage}" stroke-width="${u * 0.004 * t}" opacity="0.25"`,
      );
    }
  }

  // Near bund in the corner: the bank you stand on to smell the mud.
  const bund = new Svg(w, h);
  bund.path(
    `M${0.62 * w},${h}Q${0.78 * w},${0.8 * h} ${w},${0.74 * h}L${w},${h}Z`,
    `fill="${mix(W.loam, W.topsoil, 0.4)}"`,
  );
  stipple(
    bund,
    c,
    r,
    160,
    { x0: 0.66, y0: 0.76, x1: 1, y1: 1 },
    [W.subsoil, W.humus, mix(W.gley, W.dark, 0.3)],
    [u * 0.002, u * 0.006],
    (x, y) => (y > 0.74 + (1 - x) * 0.6 ? 1 : 0),
  );

  return {
    ground: W.skyLow,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.1, motion: "none" },
      { id: "water", svg: water.toString(scale), parallax: 0.3, motion: "none" },
      { id: "rice", svg: rice.toString(scale), parallax: 0.5, motion: "sway" },
      { id: "bund", svg: bund.toString(scale), parallax: 0.6, motion: "none" },
    ],
    sprites: [],
    particles: [
      {
        id: "methane",
        kind: "bubble",
        count: 24,
        colour: W.film,
        region: { x0: 0.05, y0: 0.5, x1: 0.95, y1: 0.95 },
        size: [1.5, 3.5],
        alpha: [0.4, 0.8],
        vx: 0,
        vy: -6,
        parallax: 0.4,
      },
      {
        id: "shimmer",
        kind: "glint",
        count: 18,
        colour: W.pale,
        region: { x0: 0, y0: SHORE, x1: 1, y1: 1 },
        size: [1, 2],
        alpha: [0.2, 0.5],
        vx: 4,
        vy: 0,
        parallax: 0.3,
      },
    ],
  };
}
