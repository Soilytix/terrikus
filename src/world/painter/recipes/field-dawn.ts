/** Field scale: the spinach seed field at first light (prologue entry). */
import { W } from "../../../styles/scene";
import {
  blob,
  blurDef,
  linear,
  paperGrain,
  radial,
  range,
  ridge,
  stipple,
  strokes,
  type Ctx,
} from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg } from "../svg";
import type { RecipeOut } from "./index";
import { crumb, rosette } from "./plants";

const HZ = 0.44;

export function fieldDawn(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 3);
  const VP = { x: 0.5 * w, y: HZ * h };
  const persp = (y: number) => (y - HZ) / (1 - HZ);
  const rowX = (xb: number, y: number) => VP.x + xb * w * persp(y);

  const sky = new Svg(w, h);
  sky.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(sky, [
      [0, mix(W.skyHigh, W.water, 0.2)],
      [0.25, W.skyHigh],
      [0.38, mix(W.skyLow, W.sand, 0.25)],
      [0.46, mix(W.skyLow, W.oxide, 0.12)],
      [1, W.skyLow],
    ])})"`,
  );
  sky.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(
      sky,
      [
        [0, W.pale, 1],
        [0.08, W.pale, 0.95],
        [0.3, mix(W.skyLow, W.sand, 0.3), 0.5],
        [1, W.skyLow, 0],
      ],
      0.7,
      0.42,
      0.55,
    )})"`,
  );
  const sb = blurDef(sky, u * 0.01);
  sky.open(`filter="url(#${sb})" opacity="0.8"`);
  for (let i = 0; i < 7; i++) {
    const y = range(r, 0.08, 0.3) * h;
    sky.path(
      blob(r, range(r, 0, 1) * w, y, u * range(r, 0.15, 0.35), u * range(r, 0.012, 0.025), 0.3),
      `fill="${mix(W.pale, W.sand, range(r, 0, 0.3))}"`,
    );
  }
  sky.close();

  // Distant tree line, blued by distance.
  const far = new Svg(w, h);
  far.path(
    ridge(c, (HZ - 0.035) * h, 0.012 * h, 3, 21, HZ * h + 2),
    `fill="${mix(W.foliage, W.skyHigh, 0.62)}"`,
  );
  for (let i = 0; i < 700; i++) {
    const x = range(r, 0, 1) * w;
    const cluster = c.noise((x / w) * 6, 3);
    const y = (HZ - range(r, 0.004, 0.012 + cluster * 0.05)) * h;
    far.path(
      blob(r, x, y, u * range(r, 0.005, 0.011), u * range(r, 0.005, 0.009), 0.25),
      `fill="${mix(W.foliage, W.skyHigh, range(r, 0.4, 0.6))}"`,
    );
  }

  // The hedge at the end of the rows.
  const hedge = new Svg(w, h);
  for (let i = 0; i < 520; i++) {
    const x = range(r, -0.02, 1.02) * w;
    const y = (HZ - range(r, -0.004, 0.02)) * h;
    const rad = u * range(r, 0.005, 0.01);
    const tone = mix(W.foliage, W.skyLow, range(r, 0.15, 0.4));
    hedge.path(blob(r, x, y, rad, rad * 0.8, 0.3), `fill="${tone}"`);
  }

  // The field: furrows and ridges converging on the vanishing point.
  const field = new Svg(w, h);
  field.rect(
    0,
    HZ * h,
    w,
    (1 - HZ) * h,
    `fill="url(#${linear(field, [
      [0, mix(W.topsoil, W.skyLow, 0.55)],
      [0.25, mix(W.loam, W.topsoil, 0.3)],
      [1, mix(W.loam, W.humus, 0.35)],
    ])})"`,
  );
  const rows = [
    -4.2, -3.5, -2.9, -2.35, -1.85, -1.4, -0.98, -0.6, -0.25, 0.25, 0.6, 0.98, 1.4, 1.85, 2.35, 2.9, 3.5, 4.2,
  ];
  for (const xb of rows) {
    // A darker furrow beside each ridge.
    const x0 = rowX(xb - 0.09, 1.05);
    const x1 = rowX(xb + 0.09, 1.05);
    field.path(
      `M${VP.x},${VP.y}L${x0},${1.05 * h}L${x1},${1.05 * h}Z`,
      `fill="${mix(W.loam, W.subsoil, 0.25)}" opacity="0.45"`,
    );
  }
  strokes(
    field,
    c,
    r,
    500,
    { x0: 0, y0: HZ + 0.02, x1: 1, y1: 1 },
    [mix(W.loam, W.sand, 0.35), mix(W.topsoil, W.humus, 0.3), W.subsoil],
    [u * 0.01, u * 0.04],
    [u * 0.002, u * 0.006],
    (x, y) => Math.atan2(y - HZ, x - 0.5) + Math.PI / 2 + (r() - 0.5) * 0.4,
    [0.1, 0.3],
  );
  // The bare patch in the foreground.
  const pb = blurDef(field, u * 0.012);
  field.path(
    blob(r, 0.5 * w, 0.8 * h, u * 0.15, u * 0.06, 0.25),
    `fill="${mix(W.topsoil, W.humus, 0.2)}" opacity="0.7" filter="url(#${pb})"`,
  );
  stipple(
    field,
    c,
    r,
    600,
    { x0: 0, y0: HZ + 0.01, x1: 1, y1: 1 },
    [W.sand, W.humus],
    [u * 0.0008, u * 0.002],
    (_x, y) => persp(y) * 0.9,
    [0.3, 0.7],
  );

  // Rosettes along every ridge, back to front.
  const plants = new Svg(w, h);
  const spots: [number, number, number][] = [];
  for (const xb of rows) {
    let p = 0.03 + r() * 0.03;
    while (p < 1.15) {
      const y = HZ * h + p * (1 - HZ) * h;
      const x = rowX(xb, y / h) + (r() - 0.5) * u * 0.01 * p;
      spots.push([x, y, u * 0.075 * p * range(r, 0.8, 1.15)]);
      p *= 1.1 + r() * 0.06;
      p += 0.008;
    }
  }
  spots.push([0.27 * w, 0.6 * h, u * 0.06]);
  spots.sort((a, b) => a[1] - b[1]);
  for (const [x, y, size] of spots) {
    if (Math.abs(x - 0.5 * w) < u * 0.17 && y > 0.68 * h) continue; // keep the bare patch bare
    rosette(plants, r, x, y, size, 1);
  }

  // Foreground crumbs on the bare patch.
  const crumbs = new Svg(w, h);
  for (let i = 0; i < 90; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const x = 0.5 * w + Math.cos(a) * d * u * 0.17;
    const y = 0.8 * h + Math.sin(a) * d * u * 0.07;
    crumb(
      crumbs,
      r,
      x,
      y,
      u * range(r, 0.004, 0.012),
      mix(W.topsoil, r() < 0.5 ? W.humus : W.loam, range(r, 0.2, 0.6)),
    );
  }

  // Mist pooled in the furrows, thickest toward the sun.
  const mist = new Svg(w, h);
  const mb = blurDef(mist, u * 0.012);
  mist.open(`filter="url(#${mb})"`);
  for (let i = 0; i < 30; i++) {
    const y = (HZ + 0.005 + Math.pow(r(), 2.2) * 0.1) * h;
    const x = range(r, 0.15, 1.1) * w;
    mist.path(
      blob(r, x, y, u * range(r, 0.2, 0.45), u * range(r, 0.005, 0.012), 0.15),
      `fill="${W.pale}" opacity="${range(r, 0.2, 0.45).toFixed(2)}"`,
    );
  }
  mist.close();

  const air = new Svg(w, h);
  air.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(
      air,
      [
        [0, W.pale, 0.4],
        [0.5, W.skyLow, 0.12],
        [1, W.skyLow, 0],
      ],
      0.7,
      0.42,
      0.6,
    )})"`,
  );
  air.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(air, [
      [0.7, W.dark, 0],
      [1, W.dark, 0.25],
    ])})"`,
  );

  const grain = new Svg(w, h);
  paperGrain(grain, c.seed, 0.05);

  return {
    ground: W.skyLow,
    layers: [
      { id: "sky", svg: sky.toString(scale), parallax: 0, motion: "none" },
      { id: "far", svg: far.toString(scale), parallax: 0.1, motion: "none" },
      { id: "hedge", svg: hedge.toString(scale), parallax: 0.2, motion: "sway" },
      { id: "field", svg: field.toString(scale), parallax: 0.5, motion: "none" },
      { id: "mist", svg: mist.toString(scale), parallax: 0.3, motion: "drift", alpha: 0.85 },
      { id: "plants", svg: plants.toString(scale), parallax: 0.6, motion: "sway" },
      { id: "crumbs", svg: crumbs.toString(scale), parallax: 0.8, motion: "none" },
      { id: "air", svg: air.toString(scale), parallax: 0, motion: "none", blend: "screen" },
      { id: "grain", svg: grain.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites: [],
    particles: [
      {
        id: "motes",
        kind: "mote",
        count: 40,
        colour: W.pale,
        region: { x0: 0.4, y0: 0.2, x1: 1, y1: 0.7 },
        size: [0.8, 2.2],
        alpha: [0.2, 0.7],
        vx: 4,
        vy: -2,
        parallax: 0.4,
      },
    ],
  };
}
