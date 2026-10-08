/**
 * Chapter 12 under the wheel: loose crumbs and wide pores beside the track,
 * the same soil pressed into flat plates under the tyre, and a dense pan below
 * where a root turns sideways: the direction of `src/sim/compaction.ts` after
 * a wet pass, not its numbers.
 */
import { W } from "../../../styles/scene";
import { blob, linear, range, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg, smoothOpen } from "../svg";
import type { RecipeOut } from "./index";
import { crumb } from "./plants";

const TRACK = 0.46;
const PAN: [number, number] = [0.68, 0.78];

export function c12Wheel(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 41);

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.dark, W.topsoil, 0.4)],
      [1, W.dark],
    ])})"`,
  );

  // Beside the track: rounded crumbs with dark pores between.
  const soil = new Svg(w, h);
  for (let i = 0; i < 60; i++)
    crumb(
      soil,
      r,
      range(r, 0, TRACK - 0.02) * w,
      range(r, 0.05, PAN[0] - 0.02) * h,
      u * range(r, 0.025, 0.05),
      mix(W.topsoil, W.loam, range(r, 0.1, 0.5)),
    );
  // Under the tyre: the same soil as flat, tight plates.
  for (let y = 0.24; y < PAN[0]; y += 0.035)
    for (let x = TRACK; x < 1.02; x += range(r, 0.06, 0.11))
      soil.path(
        blob(r, x * w, y * h, u * range(r, 0.045, 0.07), u * 0.012, 0.15),
        `fill="${mix(W.topsoil, W.loam, range(r, 0.2, 0.45))}" stroke="${W.dark}" stroke-width="${u * 0.002}" opacity="0.95"`,
      );
  // The pan: a pale dense band, stippled tight.
  soil.rect(0, PAN[0] * h, w, (PAN[1] - PAN[0]) * h, `fill="${mix(W.subsoil, W.stone1, 0.45)}"`);
  stipple(
    soil,
    c,
    r,
    500,
    { x0: 0, y0: PAN[0], x1: 1, y1: PAN[1] },
    [mix(W.subsoil, W.pale, 0.2), mix(W.stone2, W.subsoil, 0.4)],
    [u * 0.002, u * 0.004],
  );
  for (let i = 0; i < 26; i++)
    crumb(soil, r, range(r, 0, 1) * w, range(r, PAN[1] + 0.03, 1) * h, u * range(r, 0.02, 0.04), W.subsoil);

  // A root down through the loose soil, turning along the top of the pan.
  const root = new Svg(w, h);
  const rx = 0.3 * w;
  root.path(
    smoothOpen([
      [rx - u * 0.02, 0],
      [rx + u * 0.01, 0.3 * h],
      [rx - u * 0.01, (PAN[0] - 0.05) * h],
      [rx + u * 0.05, (PAN[0] - 0.012) * h],
      [rx + u * 0.25, (PAN[0] - 0.01) * h],
    ]),
    `fill="none" stroke="${mix(W.pale, W.sand, 0.3)}" stroke-width="${u * 0.012}" stroke-linecap="round"`,
  );

  // The tyre pressing down from above the track.
  const tyre = new Svg(w, h);
  const cx = 0.74 * w;
  const rad = Math.max(0.3 * w, 0.42 * h);
  const cy = 0.22 * h - rad;
  tyre.circle(
    cx,
    cy,
    rad,
    `fill="${mix(W.stone2, W.stone1, 0.3)}" stroke="${W.dark}" stroke-width="${u * 0.006}"`,
  );
  for (let k = -8; k <= 8; k++) {
    const a = Math.PI / 2 + k * 0.05;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    tyre.rect(x - u * 0.012, y - u * 0.02, u * 0.024, u * 0.02, `fill="${W.dark}"`);
  }
  tyre.circle(cx, cy, rad * 0.62, `fill="${mix(W.stone1, W.pale, 0.25)}"`);

  return {
    ground: W.dark,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.15, motion: "none" },
      { id: "soil", svg: soil.toString(scale), parallax: 0.5, motion: "none" },
      { id: "root", svg: root.toString(scale), parallax: 0.5, motion: "none" },
      { id: "tyre", svg: tyre.toString(scale), parallax: 0.55, motion: "none" },
    ],
    sprites: [],
    particles: [],
  };
}
