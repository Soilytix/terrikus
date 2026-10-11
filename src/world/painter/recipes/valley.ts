/** Landscape: the river valley at first light (art-direction §4.1, landscape row). */
import { W } from "../../../styles/scene";
import {
  blob,
  blurDef,
  linear,
  paperGrain,
  pick,
  radial,
  range,
  ridge,
  stipple,
  strokes,
  type Ctx,
} from "../brush";
import { mix } from "../color";
import { pow, rngFor } from "../noise";
import { bird, cloudShadow, prop } from "../sprites";
import { Svg, poly, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";

const VP = { x: 0.52, y: 0.33 };
// Plots sized to the 500 m scale bar: a mid-ground field is a few hundred metres
// across, and drill lines are tramline texture, not individual crop rows.
const ROWS = [0.445, 0.47, 0.5, 0.53, 0.565, 0.6, 0.645, 0.69, 0.745, 0.8, 0.87, 0.95, 1.05];
const COLS = [
  -3.2, -2.6, -2, -1.55, -1.1, -0.8, -0.5, -0.25, 0, 0.22, 0.45, 0.67, 0.89, 1.12, 1.35, 1.67, 2, 2.5, 3, 3.6,
  4.2,
];

type Crop = "spinach" | "beet" | "peas" | "stubble" | "tilled" | "pasture" | "paddy" | "meadow";

export function valley(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 2);
  const persp = (y: number) => (y - VP.y) / (1 - VP.y);
  const colX = (xb: number, y: number) => (VP.x + (xb - VP.x) * persp(y)) * w;

  // 0 sky
  const sky = new Svg(w, h);
  sky.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(sky, [
      [0, mix(W.skyHigh, W.water, 0.14)],
      [0.22, W.skyHigh],
      [0.4, W.skyLow],
      [0.46, mix(W.skyLow, W.sand, 0.22)],
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
        [0.12, W.pale, 0.9],
        [0.4, mix(W.skyLow, W.sand, 0.2), 0.45],
        [1, W.skyLow, 0],
      ],
      0.74,
      0.34,
      0.5,
    )})"`,
  );
  const thin = blurDef(sky, u * 0.006);
  sky.open(`filter="url(#${thin})"`);
  for (let i = 0; i < 9; i++) {
    const y = range(r, 0.06, 0.24) * h;
    const x = range(r, -0.1, 1) * w;
    sky.path(
      `M${x},${y}q${w * 0.08},${-u * 0.01} ${w * range(r, 0.15, 0.3)},${u * 0.004}`,
      `fill="none" stroke="${W.pale}" stroke-width="${range(r, 2, 6) * (u / 600)}" stroke-linecap="round" opacity="0.7"`,
    );
  }
  sky.close();

  // 1 far ridges, fading into the sky (aerial perspective)
  const far = new Svg(w, h);
  const fb = blurDef(far, u * 0.002);
  far.path(
    ridge(c, 0.315 * h, 0.035 * h, 0.9, 11),
    `fill="${mix(W.stone2, W.skyHigh, 0.72)}" filter="url(#${fb})"`,
  );
  far.path(ridge(c, 0.355 * h, 0.03 * h, 1.4, 12), `fill="${mix(W.stone2, W.skyHigh, 0.58)}"`);
  far.path(ridge(c, 0.385 * h, 0.02 * h, 2.2, 13), `fill="${mix(W.foliage, W.skyHigh, 0.6)}"`);
  far.rect(
    0,
    0.3 * h,
    w,
    0.14 * h,
    `fill="url(#${linear(far, [
      [0, W.skyLow, 0],
      [0.6, W.skyLow, 0.45],
      [1, W.skyLow, 0],
    ])})"`,
  );

  // 2 the wooded hill on the left, the far slope on the right
  const hill = new Svg(w, h);
  const hillPts: Pt[] = [
    [-0.02, 0.29],
    [0.07, 0.215],
    [0.17, 0.185],
    [0.27, 0.205],
    [0.36, 0.25],
    [0.46, 0.33],
    [0.56, 0.4],
    [0.68, 0.43],
    [0.84, 0.425],
    [1.02, 0.41],
  ].map(([x, y]) => [x! * w, y! * h] as Pt);
  hill.path(
    smoothOpen(hillPts) + `L${w + 2},${h}L-2,${h}Z`,
    `fill="url(#${linear(hill, [
      [0, mix(W.foliage, W.dark, 0.25)],
      [0.5, mix(W.foliage, W.topsoil, 0.3)],
      [1, W.topsoil],
    ])})"`,
  );
  const ySurf = (x: number) => {
    for (let i = 1; i < hillPts.length; i++) {
      const a = hillPts[i - 1]!;
      const b = hillPts[i]!;
      if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]);
    }
    return hillPts[hillPts.length - 1]![1];
  };
  // Woodland crowns, back to front, lit from the upper right.
  const crowns: [number, number, number][] = [];
  for (let i = 0; i < 1100; i++) {
    const x = range(r, -0.03, 0.62) * w;
    const top = ySurf(x);
    const depth = pow(r(), 1.3) * (0.46 * h - top);
    if (top + depth > 0.46 * h) continue;
    crowns.push([x, top + depth + u * 0.006, u * range(r, 0.014, 0.026) * (0.75 + (1.4 * depth) / h)]);
  }
  crowns.sort((a, b) => a[1] - b[1]);
  for (const [x, y, rad] of crowns) {
    const tone = r();
    const autumn = r() < 0.1 ? range(r, 0.25, 0.5) : 0;
    const base = mix(mix(W.foliage, W.dark, 0.2 + tone * 0.3), W.subsoil, autumn);
    hill.path(
      blob(r, x - rad * 0.1, y + rad * 0.15, rad * 1.05, rad * 0.9, 0.2),
      `fill="${mix(base, W.dark, 0.45)}"`,
    );
    hill.path(blob(r, x, y, rad, rad * 0.85, 0.22), `fill="${base}"`);
    hill.path(
      blob(r, x + rad * 0.28, y - rad * 0.3, rad * 0.55, rad * 0.42, 0.25),
      `fill="${mix(base, W.sand, 0.3)}" opacity="0.75"`,
    );
  }
  // A village and a farm on the far slope, hazed by distance.
  hill.open(`opacity="0.8"`);
  for (const [x, id, size, flip] of [
    [0.74, "conifer", 0.045, false],
    [0.775, "village", 0.045, false],
    [0.83, "tree-rounded", 0.03, true],
    [0.9, "tree-broadleaf", 0.035, false],
    [0.93, "farmhouse", 0.026, true],
    [0.965, "tree-rounded", 0.028, false],
  ] as const)
    prop(hill, id, x * w, ySurf(x * w) + u * 0.006, u * size, flip);
  hill.close();
  hill.rect(
    0,
    0.15 * h,
    w,
    0.33 * h,
    `fill="url(#${linear(hill, [
      [0, W.skyLow, 0.1],
      [1, W.skyLow, 0],
    ])})"`,
  );

  // 3 fields: a perspective patchwork with hedgerows
  const fields = new Svg(w, h);
  const cellAt = (x: number, y: number): [number, number] | null => {
    for (let i = 0; i < ROWS.length - 1; i++) {
      if (y < ROWS[i]! || y >= ROWS[i + 1]!) continue;
      for (let j = 0; j < COLS.length - 1; j++) {
        if (x * w >= colX(COLS[j]!, y) && x * w < colX(COLS[j + 1]!, y)) return [i, j];
      }
    }
    return null;
  };
  const forced = new Map<string, Crop>();
  const force = (x: number, y: number, crop: Crop) => {
    const cell = cellAt(x, y);
    if (cell) forced.set(cell.join(","), crop);
  };
  force(0.44, 0.62, "spinach");
  force(0.2, 0.66, "beet");
  force(0.83, 0.58, "peas");
  for (let x = 0.48; x < 0.98; x += 0.04) for (const y of [0.76, 0.84]) force(x, y, "paddy");
  const wob = (i: number, j: number) => (c.noise(i * 3.1, j * 2.7) - 0.5) * 0.03 * persp(ROWS[i]!);
  const corner = (i: number, j: number): Pt => {
    const y = ROWS[i]! + (i > 0 && i < ROWS.length - 1 ? wob(i, j) : 0);
    return [colX(COLS[j]!, y), y * h];
  };
  const pool: Crop[] = ["stubble", "tilled", "pasture", "spinach", "beet", "stubble", "tilled", "pasture"];
  const base: Record<Crop, string> = {
    spinach: mix(W.loam, W.topsoil, 0.4),
    beet: mix(W.topsoil, W.loam, 0.25),
    peas: mix(W.foliage, W.sand, 0.25),
    stubble: mix(W.sand, W.pale, 0.28),
    tilled: mix(W.loam, W.subsoil, 0.25),
    pasture: mix(W.foliage, W.sand, 0.4),
    paddy: mix(W.water, W.skyLow, 0.5),
    meadow: mix(W.foliage, W.sand, 0.3),
  };
  for (let i = 0; i < ROWS.length - 1; i++) {
    for (let j = 0; j < COLS.length - 1; j++) {
      const crop: Crop = forced.get(`${i},${j}`) ?? (ROWS[i]! >= 0.87 ? "meadow" : pick(r, pool));
      const pts = [corner(i, j), corner(i, j + 1), corner(i + 1, j + 1), corner(i + 1, j)];
      const d = poly(pts);
      const clip = fields.id("cl");
      fields.def(`<clipPath id="${clip}"><path d="${d}"/></clipPath>`);
      const tint =
        crop === "paddy" ? base[crop] : mix(base[crop], r() < 0.5 ? W.dark : W.sand, range(r, 0, 0.14));
      fields.path(d, `fill="${tint}"`);
      fields.open(`clip-path="url(#${clip})"`);
      const yTop = ROWS[i]!;
      const yBot = ROWS[i + 1]!;
      const p = persp((yTop + yBot) / 2);
      const across = crop === "paddy" || crop === "stubble" ? true : r() < 0.3;
      const lines: string[] = [];
      if (across) {
        const n = Math.max(4, Math.round(((yBot - yTop) * h) / (u * 0.01 * p + 1)));
        for (let k = 0; k <= n; k++) {
          const y = (yTop + ((yBot - yTop) * k) / n) * h;
          lines.push(`M${colX(COLS[j]! - 0.1, y / h)},${y}L${colX(COLS[j + 1]! + 0.1, y / h)},${y}`);
        }
      } else {
        const step = 0.012 + r() * 0.006;
        for (let xb = COLS[j]!; xb <= COLS[j + 1]!; xb += step) {
          const y0 = yTop - 0.02;
          const y1 = yBot + 0.02;
          lines.push(
            `M${colX(xb, y0).toFixed(1)},${(y0 * h).toFixed(1)}L${colX(xb, y1).toFixed(1)},${(y1 * h).toFixed(1)}`,
          );
        }
      }
      const path = lines.join("");
      const sw = (k: number) => ((k * u) / 900).toFixed(2);
      if (crop === "spinach") {
        fields.path(
          path,
          `stroke="${mix(W.foliage, W.sand, 0.15)}" stroke-width="${sw(2.4)}" stroke-dasharray="${sw(2)} ${sw(2.5)}" fill="none"`,
        );
      } else if (crop === "beet") {
        fields.path(
          path,
          `stroke="${mix(W.foliage, W.dark, 0.2)}" stroke-width="${sw(3)}" stroke-dasharray="${sw(4)} ${sw(1.5)}" fill="none"`,
        );
      } else if (crop === "peas") {
        fields.path(
          path,
          `stroke="${mix(W.foliage, W.dark, 0.1)}" stroke-width="${sw(3.4)}" fill="none" opacity="0.8"`,
        );
      } else if (crop === "stubble") {
        fields.path(
          path,
          `stroke="${mix(W.subsoil, W.sand, 0.5)}" stroke-width="${sw(0.8)}" fill="none" opacity="0.7"`,
        );
      } else if (crop === "tilled") {
        fields.path(path, `stroke="${W.humus}" stroke-width="${sw(1.2)}" fill="none" opacity="0.55"`);
      } else if (crop === "paddy") {
        fields.rect(
          0,
          yTop * h,
          w,
          (yBot - yTop) * h,
          `fill="url(#${linear(fields, [
            [0, mix(W.skyLow, W.water, 0.35)],
            [1, mix(W.water, W.gley, 0.3)],
          ])})"`,
        );
        fields.path(
          path,
          `stroke="${mix(W.foliage, W.sand, 0.2)}" stroke-width="${sw(2.2)}" stroke-dasharray="${sw(1.4)} ${sw(2.6)}" fill="none"`,
        );
        // Bunds: raised earth walls that hold the water in.
        for (let k = 1; k < 3; k++) {
          const y = (yTop + ((yBot - yTop) * k) / 3) * h;
          fields.path(
            `M0,${y}L${w},${y}`,
            `stroke="${mix(W.loam, W.foliage, 0.35)}" stroke-width="${sw(3)}"`,
          );
        }
      } else {
        stipple(
          fields,
          c,
          r,
          ROWS[i]! >= 0.87 ? 225 : 40,
          { x0: 0, y0: yTop, x1: 1, y1: yBot },
          [mix(W.foliage, W.dark, 0.2), mix(W.foliage, W.sand, 0.5)],
          [u * 0.0012, u * 0.003],
        );
      }
      if (crop !== "paddy")
        strokes(
          fields,
          c,
          r,
          5,
          { x0: 0, y0: yTop, x1: 1, y1: yBot },
          [mix(tint, W.dark, 0.25), mix(tint, W.pale, 0.25)],
          [u * 0.02, u * 0.06],
          [u * 0.004, u * 0.01],
          () => range(r, -0.05, 0.05),
          [0.12, 0.25],
        );
      // Light from the upper right; a thin bank along each field's lower edge.
      fields.path(
        d,
        `fill="url(#${linear(
          fields,
          [
            [0, W.dark, 0.12],
            [1, W.pale, 0.1],
          ],
          0,
          1,
          1,
          0,
        )})"`,
      );
      fields.close();
      fields.path(
        poly([corner(i + 1, j), corner(i + 1, j + 1)]).replace("Z", ""),
        `stroke="${mix(base[crop], W.dark, 0.3)}" stroke-width="${sw(0.8)}" fill="none" opacity="0.5"`,
      );
    }
  }
  // Hedgerows along some boundaries; the chapter-2 hedge is always there.
  const hedge = (xb: number, y0: number, y1: number, size: number) => {
    const n = Math.round(((y1 - y0) * h) / (u * 0.006));
    for (let k = 0; k < n; k++) {
      const y = y0 + ((y1 - y0) * k) / n;
      const x = colX(xb, y);
      const rad = u * size * persp(y) * range(r, 0.7, 1.2);
      const tone = mix(W.foliage, W.dark, range(r, 0.25, 0.5));
      fields.path(blob(r, x, y * h - rad * 0.6, rad, rad * 0.8, 0.3), `fill="${tone}"`);
      fields.path(
        blob(r, x + rad * 0.3, y * h - rad, rad * 0.5, rad * 0.4, 0.3),
        `fill="${mix(tone, W.sand, 0.3)}" opacity="0.8"`,
      );
    }
  };
  hedge(0.89, ROWS[0]!, ROWS[6]!, 0.03);
  hedge(-0.5, ROWS[2]!, ROWS[8]!, 0.022);
  hedge(2, ROWS[0]!, ROWS[8]!, 0.02);
  for (const xb of [-1.1, 0.45, 1.35]) if (r() < 0.7) hedge(xb, ROWS[0]!, ROWS[6]!, 0.014);
  // A few field trees by the chapter-2 hedge.
  for (let k = 0; k < 3; k++) {
    const y = range(r, ROWS[0]!, ROWS[4]!);
    const x = colX(0.89, y);
    const rad = u * 0.04 * persp(y);
    const tone = mix(W.foliage, W.dark, 0.3);
    fields.path(`M${x},${y * h}l0,${-rad * 1.2}`, `stroke="${W.humus}" stroke-width="${rad * 0.15}"`);
    fields.path(blob(r, x, y * h - rad * 1.5, rad, rad * 0.9, 0.25), `fill="${tone}"`);
    fields.path(
      blob(r, x + rad * 0.3, y * h - rad * 1.8, rad * 0.55, rad * 0.45, 0.25),
      `fill="${mix(tone, W.sand, 0.35)}"`,
    );
  }

  // 4 the river, winding across the valley floor
  const river = new Svg(w, h);
  const bank: Pt[] = [
    [0.3, 1.04],
    [0.45, 0.97],
    [0.62, 0.935],
    [0.8, 0.9],
    [0.92, 0.875],
    [1.04, 0.86],
  ].map(([x, y]) => [x! * w, y! * h] as Pt);
  const bank2: Pt[] = [
    [1.04, 0.905],
    [0.92, 0.925],
    [0.8, 0.95],
    [0.64, 0.99],
    [0.52, 1.04],
  ].map(([x, y]) => [x! * w, y! * h] as Pt);
  const riverD = smoothOpen(bank) + smoothOpen(bank2).replace(/^M/, "L") + "Z";
  river.path(
    riverD,
    `fill="url(#${linear(
      river,
      [
        [0, mix(W.skyLow, W.water, 0.55)],
        [0.5, W.water],
        [1, mix(W.water, W.deep, 0.45)],
      ],
      1,
      0,
      0,
      1,
    )})"`,
  );
  river.path(
    smoothOpen(bank),
    `fill="none" stroke="${mix(W.foliage, W.dark, 0.35)}" stroke-width="${u * 0.008}" opacity="0.6"`,
  );
  strokes(
    river,
    c,
    r,
    60,
    { x0: 0.5, y0: 0.88, x1: 1, y1: 0.97 },
    [W.pale, W.film],
    [u * 0.01, u * 0.04],
    [0.6, 1.4],
    () => -0.12,
    [0.25, 0.6],
  );
  // Reeds along the near bank.
  for (let k = 0; k < 70; k++) {
    const t = r();
    const x = (0.42 + t * 0.6) * w;
    const y = (1.02 - t * 0.14) * h + range(r, -0.01, 0.01) * h;
    river.path(
      `M${x},${y}q${range(r, -2, 2)},${-u * 0.02} ${range(r, -4, 4)},${-u * range(r, 0.02, 0.04)}`,
      `fill="none" stroke="${mix(W.foliage, W.sand, range(r, 0, 0.5))}" stroke-width="1.2" stroke-linecap="round"`,
    );
  }

  // 5 foreground framing hedge (sways)
  const fore = new Svg(w, h);
  const foreBlobs: [number, number, number][] = [];
  for (let k = 0; k < 60; k++) {
    const t = r();
    foreBlobs.push([
      (-0.04 + t * 0.2) * w,
      (0.9 + (1 - t) * 0.12 + range(r, -0.02, 0.04)) * h,
      u * range(r, 0.025, 0.05),
    ]);
  }
  // A field tree framing the right edge.
  fore.path(
    `M${0.975 * w},${h}C${0.97 * w},${0.85 * h} ${0.985 * w},${0.72 * h} ${0.97 * w},${0.6 * h}`,
    `fill="none" stroke="${W.humus}" stroke-width="${u * 0.024}" stroke-linecap="round"`,
  );
  for (let k = 0; k < 46; k++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * u * 0.13;
    foreBlobs.push([
      0.97 * w + Math.cos(a) * d * 1.1,
      0.56 * h + Math.sin(a) * d * 0.8,
      u * range(r, 0.025, 0.045),
    ]);
  }
  foreBlobs.sort((a, b) => a[1] - b[1]);
  for (const [x, y, rad] of foreBlobs) {
    const tone = mix(W.foliage, W.dark, range(r, 0.35, 0.6));
    fore.path(blob(r, x, y, rad, rad * 0.8, 0.3), `fill="${tone}"`);
    fore.path(
      blob(r, x + rad * 0.3, y - rad * 0.3, rad * 0.5, rad * 0.4, 0.3),
      `fill="${mix(tone, W.sand, 0.25)}" opacity="0.7"`,
    );
  }

  // 6 light and haze
  const air = new Svg(w, h);
  air.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(
      air,
      [
        [0, W.pale, 0.28],
        [1, W.pale, 0],
      ],
      0.76,
      0.3,
      0.5,
    )})"`,
  );
  air.rect(
    0,
    0.38 * h,
    w,
    0.12 * h,
    `fill="url(#${linear(air, [
      [0, W.skyLow, 0],
      [0.4, W.skyLow, 0.18],
      [1, W.skyLow, 0],
    ])})"`,
  );
  air.rect(
    0,
    0.86 * h,
    w,
    0.12 * h,
    `fill="url(#${linear(air, [
      [0, W.pale, 0],
      [0.5, W.pale, 0.14],
      [1, W.pale, 0],
    ])})"`,
  );

  const grain = new Svg(w, h);
  paperGrain(grain, c.seed, 0.05);

  const sprites = [
    ...[0, 1, 2].map((k) =>
      cloudShadow(
        {
          id: `cloud-${k}`,
          x: range(r, 0, 1) * w,
          y: range(r, 0.5, 0.85) * h,
          motion: "drift",
          phase: r(),
          parallax: 0.5,
          scale,
          alpha: 0.2,
          blend: "multiply",
          vx: u * 0.006,
          vy: 0,
        },
        r,
        u * range(r, 0.5, 0.8),
        u * range(r, 0.18, 0.26),
      ),
    ),
    ...[0, 1, 2, 3].map((k) =>
      bird(
        {
          id: `bird-${k}`,
          x: range(r, 0.5, 0.9) * w,
          y: range(r, 0.12, 0.22) * h,
          motion: "drift",
          phase: r(),
          parallax: 0.2,
          scale,
          vx: u * range(r, 0.008, 0.014),
          vy: 0,
        },
        u * range(r, 0.012, 0.018),
      ),
    ),
  ];

  return {
    ground: W.skyLow,
    layers: [
      { id: "sky", svg: sky.toString(scale), parallax: 0, motion: "none" },
      { id: "far", svg: far.toString(scale), parallax: 0.12, motion: "none" },
      { id: "hill", svg: hill.toString(scale), parallax: 0.25, motion: "sway" },
      { id: "fields", svg: fields.toString(scale), parallax: 0.5, motion: "none" },
      { id: "river", svg: river.toString(scale), parallax: 0.6, motion: "shimmer" },
      { id: "fore", svg: fore.toString(scale), parallax: 0.9, motion: "sway" },
      { id: "air", svg: air.toString(scale), parallax: 0, motion: "drift", blend: "screen" },
      { id: "grain", svg: grain.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites,
    particles: [
      {
        id: "glint",
        kind: "glint",
        count: 26,
        colour: W.pale,
        region: { x0: 0.5, y0: 0.87, x1: 1, y1: 0.97 },
        size: [1, 2.4],
        alpha: [0.3, 0.9],
        vx: 3,
        vy: 0,
        parallax: 0.6,
      },
      {
        id: "paddy-glint",
        kind: "glint",
        count: 14,
        colour: W.pale,
        region: { x0: 0.55, y0: 0.75, x1: 1, y1: 0.86 },
        size: [0.8, 1.8],
        alpha: [0.2, 0.7],
        vx: 0,
        vy: 0,
        parallax: 0.5,
      },
    ],
  };
}
