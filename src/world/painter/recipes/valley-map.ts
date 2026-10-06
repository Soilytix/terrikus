/** Landscape, from above: the valley map (T16). Places sit where the `valley-map` scene anchors say. */
import { W } from "../../../styles/scene";
import { blob, linear, paperGrain, range, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg, poly, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";

/** Field patches in plate units: [x0, y0, x1, y1, tone]. */
const FIELDS: [number, number, number, number, string][] = [
  [0.08, 0.5, 0.3, 0.66, mix(W.topsoil, W.loam, 0.25)], // sugar beet
  [0.32, 0.38, 0.55, 0.66, mix(W.loam, W.topsoil, 0.4)], // spinach home field
  [0.6, 0.38, 0.86, 0.47, mix(W.sand, W.pale, 0.28)], // stubble
  [0.62, 0.47, 0.78, 0.56, mix(W.foliage, W.sand, 0.25)], // peas
  [0.74, 0.56, 0.88, 0.68, mix(W.foliage, W.sand, 0.4)], // beans
  [0.12, 0.66, 0.29, 0.8, mix(W.loam, W.subsoil, 0.25)], // two fields, side by side
  [0.29, 0.66, 0.46, 0.8, mix(W.foliage, W.sand, 0.3)],
  [0.08, 0.36, 0.3, 0.5, mix(W.foliage, W.sand, 0.4)], // pasture below the wood
];

export function valleyMap(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 21);
  const P = (x: number, y: number): Pt => [x * w, y * h];
  const sw = (k: number) => k * (u / 900);

  // Paper and hill contours.
  const ground = new Svg(w, h);
  ground.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(ground, [
      [0, mix(W.pale, W.foliage, 0.12)],
      [1, mix(W.pale, W.sand, 0.3)],
    ])})"`,
  );
  for (let k = 1; k <= 6; k++)
    ground.path(
      blob(r, 0.2 * w, 0.2 * h, 0.06 * k * w, 0.05 * k * h, 0.08, 12),
      `fill="none" stroke="${mix(W.stone1, W.pale, 0.4)}" stroke-width="${sw(1.2)}" opacity="0.5"`,
    );
  paperGrain(ground, c.seed, 0.04);

  // Fields, paddy, river and the track to the lab.
  const land = new Svg(w, h);
  for (const [x0, y0, x1, y1, tone] of FIELDS) {
    const j = () => range(r, -0.006, 0.006);
    const corners: Pt[] = [
      P(x0 + j(), y0 + j()),
      P(x1 + j(), y0 + j()),
      P(x1 + j(), y1 + j()),
      P(x0 + j(), y1 + j()),
    ];
    land.path(
      poly(corners),
      `fill="${tone}" stroke="${W.humus}" stroke-width="${sw(1)}" stroke-opacity="0.4"`,
    );
    // Drill rows, so a field reads as worked ground.
    for (let y = y0 + 0.02; y < y1 - 0.01; y += 0.02)
      land.path(
        `M${(x0 + 0.01) * w},${y * h}L${(x1 - 0.01) * w},${y * h}`,
        `stroke="${mix(tone, W.dark, 0.25)}" stroke-width="${sw(0.8)}" opacity="0.45"`,
      );
  }
  // The pit on the slope.
  land.rect(
    0.27 * w,
    0.43 * h,
    0.022 * w,
    0.02 * h,
    `fill="${W.subsoil}" stroke="${W.humus}" stroke-width="${sw(1)}"`,
  );
  // Paddy terraces.
  for (let i = 0; i < 3; i++)
    for (let k = 0; k < 2; k++)
      land.rect(
        (0.58 + i * 0.065) * w,
        (0.72 + k * 0.06) * h,
        0.06 * w,
        0.055 * h,
        `fill="${mix(W.water, W.skyLow, 0.45 + 0.08 * ((i + k) % 2))}" stroke="${mix(W.foliage, W.sand, 0.2)}" stroke-width="${sw(2)}"`,
      );
  const river = smoothOpen([P(1.02, 0.6), P(0.93, 0.72), P(0.88, 0.86), P(0.8, 0.96), P(0.74, 1.04)]);
  land.path(
    river,
    `fill="none" stroke="${mix(W.water, W.deep, 0.15)}" stroke-width="${sw(26)}" stroke-linecap="round"`,
  );
  land.path(river, `fill="none" stroke="${mix(W.water, W.film, 0.4)}" stroke-width="${sw(8)}" opacity="0.7"`);
  land.path(
    smoothOpen([P(0.52, 0.86), P(0.48, 0.76), P(0.44, 0.66), P(0.42, 0.52)]),
    `fill="none" stroke="${mix(W.sand, W.pale, 0.2)}" stroke-width="${sw(3)}" stroke-dasharray="${sw(6)} ${sw(5)}"`,
  );
  // The farm lab: a small roofed building.
  const [lx, ly] = P(0.52, 0.86);
  const s = u * 0.03;
  land.rect(
    lx - s,
    ly - s * 0.6,
    s * 2,
    s * 1.2,
    `fill="${W.pale}" stroke="${W.stone2}" stroke-width="${sw(1.5)}"`,
  );
  land.path(
    poly([
      [lx - s * 1.15, ly - s * 0.6],
      [lx, ly - s * 1.3],
      [lx + s * 1.15, ly - s * 0.6],
    ]),
    `fill="${W.oxide}"`,
  );

  // Woodland crowns and the hedge, seen from above.
  const trees = new Svg(w, h);
  const crown = (x: number, y: number, rad: number) => {
    const tone = mix(W.foliage, W.dark, range(r, 0.1, 0.4));
    trees.path(blob(r, x + rad * 0.2, y + rad * 0.25, rad, rad, 0.2), `fill="${W.dark}" opacity="0.18"`);
    trees.path(blob(r, x, y, rad, rad, 0.2), `fill="${tone}"`);
    trees.path(
      blob(r, x - rad * 0.25, y - rad * 0.25, rad * 0.45, rad * 0.45, 0.2),
      `fill="${mix(tone, W.sand, 0.3)}" opacity="0.7"`,
    );
  };
  for (let i = 0; i < 70; i++) {
    const x = range(r, 0.03, 0.4);
    const y = range(r, 0.04, 0.34);
    if (Math.hypot((x - 0.2) / 0.2, (y - 0.18) / 0.15) > 1) continue;
    crown(x * w, y * h, u * range(r, 0.018, 0.03));
  }
  for (let y = 0.3; y < 0.68; y += 0.018)
    crown(range(r, 0.572, 0.585) * w, y * h, u * range(r, 0.008, 0.012));

  return {
    ground: mix(W.pale, W.sand, 0.2),
    layers: [
      { id: "back", svg: ground.toString(scale), parallax: 0, motion: "none" },
      { id: "land", svg: land.toString(scale), parallax: 0, motion: "none" },
      { id: "trees", svg: trees.toString(scale), parallax: 0, motion: "none" },
    ],
    sprites: [],
    particles: [],
  };
}
