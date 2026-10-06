/** Field scale: the hawthorn hedge at the field edge in autumn (chapter 2 entry). */
import { W } from "../../../styles/scene";
import { blob, blurDef, linear, paperGrain, radial, range, stipple, strokes, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { fallingLeaf } from "../sprites";
import { Svg, smoothOpen, type Pt } from "../svg";
import type { SpriteSpec } from "../types";
import type { RecipeOut } from "./index";
import { blade, crumb } from "./plants";

const GROUND = 0.58;

export function hedgeEdge(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 7);
  const autumn = [
    mix(W.foliage, W.sand, 0.45),
    mix(W.subsoil, W.sand, 0.3),
    mix(W.oxide, W.sand, 0.25),
    W.oxide,
    mix(W.foliage, W.subsoil, 0.5),
    mix(W.sand, W.pale, 0.2),
  ];

  // Low autumn sun behind the hedge, upper left.
  const sky = new Svg(w, h);
  sky.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(sky, [
      [0, mix(W.skyHigh, W.sand, 0.15)],
      [0.45, mix(W.skyLow, W.sand, 0.35)],
      [0.6, mix(W.skyLow, W.oxide, 0.15)],
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
        [0.1, W.pale, 0.85],
        [0.45, mix(W.skyLow, W.sand, 0.4), 0.35],
        [1, W.skyLow, 0],
      ],
      0.18,
      0.3,
      0.6,
    )})"`,
  );

  // Distant field beyond the hedge gaps.
  const far = new Svg(w, h);
  far.path(
    `M0,${(GROUND - 0.06) * h}L${w},${(GROUND - 0.08) * h}L${w},${h}L0,${h}Z`,
    `fill="${mix(W.foliage, W.skyLow, 0.55)}"`,
  );

  // The hedge: branch skeleton, then leaf clusters, then berries.
  const hedge = new Svg(w, h);
  const top = (x: number) => (0.1 + 0.08 * Math.sin(x * 5.3 + 1) + 0.05 * c.noise(x * 8, 1)) * h;
  const mass: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = (0.28 + (i / 40) * 0.8) * w;
    mass.push([x, top(x / w) + u * 0.03]);
  }
  const left = (y: number) => 0.3 + 0.06 * Math.pow(Math.max(0, (GROUND - y) / GROUND), 1.5) * 4;
  for (let i = 0; i < 260; i++) {
    const x = range(r, 0.26, 1.08) * w;
    const y = range(r, top(x / w) / h + 0.03, GROUND) * h;
    if (x / w < left(y / h) - 0.04) continue;
    const rad = u * range(r, 0.04, 0.08);
    hedge.path(blob(r, x, y, rad, rad * 0.85, 0.3), `fill="${mix(W.foliage, W.dark, range(r, 0.4, 0.6))}"`);
  }
  for (let i = 0; i < 26; i++) {
    const x0 = range(r, 0.3, 1.05) * w;
    const pts: Pt[] = [[x0, (GROUND + 0.02) * h]];
    let x = x0;
    let y = (GROUND + 0.02) * h;
    for (let k = 0; k < 5; k++) {
      x += range(r, -0.05, 0.05) * w;
      y -= range(r, 0.06, 0.12) * h;
      pts.push([x, Math.max(y, top(x / w))]);
    }
    hedge.path(
      smoothOpen(pts),
      `fill="none" stroke="${mix(W.humus, W.dark, 0.3)}" stroke-width="${u * range(r, 0.003, 0.008)}" stroke-linecap="round"`,
    );
  }
  const clusters: [number, number, number][] = [];
  for (let i = 0; i < 2600; i++) {
    const x = range(r, 0.25, 1.08) * w;
    const y = range(r, top(x / w) / h, GROUND + 0.01) * h;
    if (x / w < left(y / h) - 0.06) continue;
    clusters.push([x, y, u * range(r, 0.006, 0.013)]);
  }
  clusters.sort((a, b) => a[1] - b[1]);
  for (const [x, y, rad] of clusters) {
    const backlit = Math.max(0, 1 - Math.hypot(x / w - 0.18, y / h - 0.3) * 1.6);
    const tone = mix(autumn[Math.floor(r() * autumn.length)]!, W.dark, range(r, 0.15, 0.45) - backlit * 0.2);
    hedge.path(blade(x, y, r() * Math.PI * 2, rad * 2.2, rad * 0.7), `fill="${tone}"`);
  }
  for (let i = 0; i < 90; i++) {
    const x = range(r, 0.3, 1.05) * w;
    const y = range(r, top(x / w) / h + 0.02, GROUND - 0.04) * h;
    hedge.circle(x, y, u * range(r, 0.003, 0.005), `fill="${mix(W.oxide, W.humus, 0.15)}"`);
    hedge.circle(x + u * 0.0012, y - u * 0.0012, u * 0.0012, `fill="${W.pale}" opacity="0.6"`);
  }
  // Rim light where the sun catches the hedge top.
  hedge.path(
    smoothOpen(mass),
    `fill="none" stroke="${mix(W.pale, W.sand, 0.4)}" stroke-width="${u * 0.004}" opacity="0.35"`,
  );

  // Ground: bare soil, a little crusted, with litter piling at the hedge foot.
  const ground = new Svg(w, h);
  ground.rect(
    0,
    (GROUND - 0.005) * h,
    w,
    (1 - GROUND) * h + 2,
    `fill="url(#${linear(ground, [
      [0, mix(W.topsoil, W.skyLow, 0.35)],
      [0.3, mix(W.loam, W.topsoil, 0.4)],
      [1, mix(W.humus, W.loam, 0.3)],
    ])})"`,
  );
  for (let k = -6; k <= 6; k++) {
    const xb = 0.5 + k * 0.16;
    ground.path(
      `M${(0.5 + (xb - 0.5) * 0.15) * w},${GROUND * h}L${xb * w},${h}`,
      `stroke="${mix(W.humus, W.loam, 0.3)}" stroke-width="${u * 0.012}" opacity="0.25"`,
    );
  }
  strokes(
    ground,
    c,
    r,
    400,
    { x0: 0, y0: GROUND, x1: 1, y1: 1 },
    [mix(W.loam, W.sand, 0.4), mix(W.humus, W.topsoil, 0.4), mix(W.subsoil, W.sand, 0.2)],
    [u * 0.01, u * 0.04],
    [u * 0.002, u * 0.006],
    () => range(r, -0.15, 0.15),
    [0.12, 0.3],
  );
  stipple(
    ground,
    c,
    r,
    1200,
    { x0: 0, y0: GROUND, x1: 1, y1: 1 },
    [W.sand, mix(W.pale, W.sand, 0.5), W.humus],
    [u * 0.0008, u * 0.0025],
    (_x, y) => 0.4 + (y - GROUND),
    [0.3, 0.7],
  );
  for (let i = 0; i < 60; i++) {
    crumb(
      ground,
      r,
      range(r, 0, 1) * w,
      range(r, GROUND + 0.06, 1) * h,
      u * range(r, 0.004, 0.012),
      mix(W.topsoil, W.loam, range(r, 0.2, 0.7)),
    );
  }
  // Leaves on the ground: thick at the hedge foot, thinning toward us.
  for (let i = 0; i < 420; i++) {
    const t = Math.pow(r(), 2.2);
    const y = (GROUND + t * 0.4) * h;
    const x = range(r, 0.25, 1.05) * w - t * u * 0.2;
    const len = u * (0.012 + t * 0.03) * range(r, 0.7, 1.2);
    const tone = mix(autumn[Math.floor(r() * autumn.length)]!, W.humus, range(r, 0.1, 0.5));
    ground.path(blade(x - len / 2, y, range(r, -0.5, 0.5), len, len * 0.32, 0.5), `fill="${tone}"`);
  }
  // The litter pile the portal opens.
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * u * 0.06;
    const tone = mix(autumn[Math.floor(r() * autumn.length)]!, W.humus, range(r, 0.25, 0.6));
    const len = u * range(r, 0.03, 0.05);
    ground.path(
      blade(
        0.66 * w + Math.cos(a) * d * 1.4 - len / 2,
        0.8 * h + Math.sin(a) * d * 0.4,
        r() * 6,
        len,
        len * 0.32,
        0.55,
      ),
      `fill="${tone}" stroke="${mix(tone, W.dark, 0.4)}" stroke-width="0.6"`,
    );
  }

  // The harvested spinach crown: bleached leaf stubs and the top of the taproot.
  const crown = new Svg(w, h);
  const kx = 0.25 * w;
  const ky = 0.66 * h;
  crown.path(
    blob(r, kx - u * 0.01, ky + u * 0.012, u * 0.05, u * 0.012, 0.15),
    `fill="${W.dark}" opacity="0.3"`,
  );
  crown.path(
    blob(r, kx, ky + u * 0.004, u * 0.016, u * 0.008, 0.2),
    `fill="${mix(W.pale, W.clay, 0.45)}" stroke="${mix(W.clay, W.dark, 0.3)}" stroke-width="1"`,
  );
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + range(r, -1.2, 1.2);
    const tone = mix(W.foliage, i % 2 ? W.sand : W.pale, range(r, 0.35, 0.6));
    crown.path(
      blade(kx, ky, a, u * range(r, 0.035, 0.06), u * 0.013, 0.8),
      `fill="${tone}" stroke="${mix(tone, W.dark, 0.35)}" stroke-width="0.6"`,
    );
  }

  // The fallen leaf, hero of the chapter.
  const hero = new Svg(w, h);
  const lx = 0.52 * w;
  const ly = 0.74 * h;
  const ll = u * 0.09;
  hero.path(
    blade(
      lx - ll * 0.5 * Math.cos(-0.25) - u * 0.006,
      ly - ll * 0.5 * Math.sin(-0.25) + u * 0.01,
      -0.25,
      ll,
      ll * 0.3,
    ),
    `fill="${W.dark}" opacity="0.3"`,
  );
  hero.path(
    blade(lx - ll * 0.5 * Math.cos(-0.25), ly - ll * 0.5 * Math.sin(-0.25), -0.25, ll, ll * 0.3),
    `fill="url(#${linear(
      hero,
      [
        [0, mix(W.foliage, W.sand, 0.35)],
        [0.6, mix(W.sand, W.foliage, 0.35)],
        [1, mix(W.subsoil, W.oxide, 0.3)],
      ],
      0,
      0,
      1,
      0,
    )})" stroke="${mix(W.foliage, W.dark, 0.45)}" stroke-width="1.2"`,
  );
  const vx = Math.cos(-0.25);
  const vy = Math.sin(-0.25);
  hero.path(
    `M${lx - vx * ll * 0.5 - u * 0.02 * vx},${ly - vy * ll * 0.5 - u * 0.02 * vy}L${lx + vx * ll * 0.45},${ly + vy * ll * 0.45}`,
    `stroke="${mix(W.sand, W.pale, 0.4)}" stroke-width="1.4"`,
  );
  for (let k = -3; k <= 3; k++) {
    if (k === 0) continue;
    const t = k / 4;
    const bx = lx + vx * ll * t * 0.45;
    const by = ly + vy * ll * t * 0.45;
    hero.path(
      `M${bx},${by}l${(-vy * ll * 0.2 + vx * ll * 0.1).toFixed(1)},${(vx * ll * 0.2 + vy * ll * 0.1).toFixed(1)}M${bx},${by}l${(vy * ll * 0.2 + vx * ll * 0.1).toFixed(1)},${(-vx * ll * 0.2 + vy * ll * 0.1).toFixed(1)}`,
      `stroke="${mix(W.sand, W.pale, 0.3)}" stroke-width="0.8" opacity="0.8"`,
    );
  }

  const air = new Svg(w, h);
  air.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(
      air,
      [
        [0, W.pale, 0.45],
        [0.4, W.skyLow, 0.12],
        [1, W.skyLow, 0],
      ],
      0.18,
      0.3,
      0.7,
    )})"`,
  );
  const ab = blurDef(air, u * 0.02);
  air.open(`filter="url(#${ab})" opacity="0.5"`);
  for (let k = 0; k < 5; k++) {
    const x = range(r, 0.05, 0.35) * w;
    air.path(
      `M${x},0L${x + u * 0.04},0L${x + u * 0.5},${h}L${x + u * 0.38},${h}Z`,
      `fill="${W.pale}" opacity="${range(r, 0.06, 0.14).toFixed(2)}"`,
    );
  }
  air.close();
  air.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(air, [
      [0.75, W.dark, 0],
      [1, W.dark, 0.3],
    ])})"`,
  );

  const grainTex = new Svg(w, h);
  paperGrain(grainTex, c.seed, 0.05);

  const sprites: SpriteSpec[] = [];
  for (let k = 0; k < 9; k++) {
    sprites.push(
      fallingLeaf(
        {
          id: `fall-${k}`,
          x: range(r, 0.2, 1) * w,
          y: range(r, 0, 0.9) * h,
          motion: "drift",
          phase: r(),
          parallax: 0.5,
          scale: scale * 1.5,
          rotation: r() * 6,
          vx: -u * range(r, 0.01, 0.025),
          vy: u * range(r, 0.03, 0.05),
        },
        r,
        u * range(r, 0.018, 0.03),
        r(),
      ),
    );
  }

  return {
    ground: W.skyLow,
    layers: [
      { id: "sky", svg: sky.toString(scale), parallax: 0, motion: "none" },
      { id: "far", svg: far.toString(scale), parallax: 0.15, motion: "none" },
      { id: "hedge", svg: hedge.toString(scale), parallax: 0.3, motion: "sway" },
      { id: "ground", svg: ground.toString(scale), parallax: 0.6, motion: "none" },
      { id: "crown", svg: crown.toString(scale), parallax: 0.6, motion: "none" },
      { id: "hero", svg: hero.toString(scale), parallax: 0.7, motion: "none" },
      { id: "air", svg: air.toString(scale), parallax: 0, motion: "drift", blend: "screen" },
      { id: "grain", svg: grainTex.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites,
    particles: [
      {
        id: "motes",
        kind: "mote",
        count: 40,
        colour: W.pale,
        region: { x0: 0, y0: 0.05, x1: 0.6, y1: 0.7 },
        size: [0.8, 2.2],
        alpha: [0.2, 0.7],
        vx: 3,
        vy: -1,
        parallax: 0.3,
      },
    ],
  };
}
