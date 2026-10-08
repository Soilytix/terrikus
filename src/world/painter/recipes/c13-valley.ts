/**
 * Chapter 13 valley: the hill from the side, woodland on top, crop and bare
 * ploughed strips down the slope, a grass strip at its foot and the river
 * below. The river glints; the storm itself is a wash in the mission panel,
 * never a flash on the plate.
 */
import { W } from "../../../styles/scene";
import { linear, range, ridge, strokes, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";

/** Ground line in plate units: the slope runs down to the floodplain at x ≈ 0.68. */
export const valleyGround = (x: number) =>
  x < 0.68 ? 0.3 + 0.52 * (0.5 - 0.5 * Math.cos((x / 0.68) * Math.PI)) : 0.82 + (x - 0.68) * 0.02;
/** The river's band on the floodplain, plate units. */
export const RIVER = { x0: 0.7, x1: 1, y0: 0.86, y1: 0.93 };

export function c13Valley(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 13);
  const gy = (x: number) => valleyGround(x) * h;

  const sky = new Svg(w, h);
  sky.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(sky, [
      [0, W.skyHigh],
      [0.6, W.skyLow],
    ])})"`,
  );
  sky.path(ridge(c, 0.24 * h, u * 0.04, 1.4, 5), `fill="${mix(W.stone2, W.skyHigh, 0.55)}"`);

  const hill = new Svg(w, h);
  const line: Pt[] = Array.from({ length: 51 }, (_, i) => [(i / 50) * w, gy(i / 50)]);
  const body = smoothOpen(line) + `L${w},${h}L0,${h}Z`;
  hill.path(
    body,
    `fill="url(#${linear(hill, [
      [0.3, mix(W.foliage, W.loam, 0.3)],
      [0.8, mix(W.foliage, W.sand, 0.35)],
      [1, mix(W.loam, W.dark, 0.25)],
    ])})"`,
  );
  const clip = hill.id("clip");
  hill.def(`<clipPath id="${clip}"><path d="${body}"/></clipPath>`).open(`clip-path="url(#${clip})"`);
  // Strips down the slope, alternating crop and bare ploughed soil.
  for (let k = 0; k < 7; k++) {
    const x0 = 0.24 + k * 0.05;
    const bare = k % 2 === 1;
    const pts: Pt[] = [
      [x0 * w, gy(x0) - u * 0.004],
      [(x0 + 0.05) * w, gy(x0 + 0.05) - u * 0.004],
      [(x0 + 0.05) * w, gy(x0 + 0.05) + u * 0.05],
      [x0 * w, gy(x0) + u * 0.05],
    ];
    hill.path(
      "M" + pts.map((p) => p.join(",")).join("L") + "Z",
      `fill="${bare ? mix(W.subsoil, W.loam, 0.4) : mix(W.foliage, W.sand, 0.25)}" opacity="0.9"`,
    );
  }
  strokes(
    hill,
    c,
    r,
    140,
    { x0: 0.24, y0: 0.32, x1: 0.6, y1: 0.86 },
    [mix(W.foliage, W.sand, 0.4), mix(W.subsoil, W.sand, 0.3)],
    [u * 0.02, u * 0.05],
    [u * 0.002, u * 0.004],
    () => 0.6,
  );
  // The grass strip at the foot of the slope.
  strokes(
    hill,
    c,
    r,
    80,
    { x0: 0.6, y0: 0.76, x1: 0.68, y1: 0.86 },
    [W.foliage, mix(W.foliage, W.dark, 0.3)],
    [u * 0.008, u * 0.018],
    [u * 0.002, u * 0.003],
    () => -1.4,
    [0.6, 0.9],
  );
  hill.close();

  const wood = new Svg(w, h);
  for (let i = 0; i < 30; i++) {
    const x = range(r, 0, 0.23) * w;
    const y = gy(x / w) + u * 0.004;
    const rad = u * range(r, 0.025, 0.045);
    wood.circle(x, y - rad * 0.8, rad, `fill="${mix(W.foliage, W.dark, range(r, 0.15, 0.45))}"`);
  }

  const river = new Svg(w, h);
  const bank: Pt[] = Array.from({ length: 13 }, (_, i) => {
    const x = RIVER.x0 + ((RIVER.x1 - RIVER.x0) * i) / 12;
    return [x * w, (RIVER.y0 + Math.sin(i * 0.9) * 0.008) * h];
  });
  const far: Pt[] = bank.map(([x], i) => [x, (RIVER.y1 + Math.sin(i * 0.9 + 1) * 0.008) * h]);
  river.path(
    smoothOpen(bank) + "L" + smoothOpen([...far].reverse()).slice(1) + "Z",
    `fill="url(#${linear(river, [
      [0, mix(W.water, W.skyHigh, 0.3)],
      [1, mix(W.water, W.deep, 0.3)],
    ])})"`,
  );

  return {
    ground: mix(W.foliage, W.loam, 0.3),
    layers: [
      { id: "sky", svg: sky.toString(scale), parallax: 0.05, motion: "none" },
      { id: "hill", svg: hill.toString(scale), parallax: 0.4, motion: "none" },
      { id: "wood", svg: wood.toString(scale), parallax: 0.45, motion: "sway" },
      { id: "river", svg: river.toString(scale), parallax: 0.5, motion: "shimmer" },
    ],
    sprites: [],
    particles: [
      {
        id: "glint",
        kind: "glint",
        count: 16,
        colour: W.pale,
        region: RIVER,
        size: [1, 2],
        alpha: [0.2, 0.5],
        vx: 3,
        vy: 0,
        parallax: 0.5,
      },
    ],
  };
}
