/** Profile scale: a cut through the top five centimetres, litter to topsoil (chapter 2). */
import { W } from "../../../styles/scene";
import { blob, blurDef, linear, paperGrain, radial, range, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { hypha, springtail } from "../sprites";
import { Svg, f, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";
import { crumb } from "./plants";

export function litter(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 8);
  const leafTones = [
    mix(W.foliage, W.sand, 0.4),
    mix(W.sand, W.subsoil, 0.4),
    mix(W.oxide, W.sand, 0.3),
    mix(W.subsoil, W.loam, 0.3),
  ];

  // Behind the cut: daylight above the litter, darkness below.
  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.skyLow, W.sand, 0.3)],
      [0.1, mix(W.subsoil, W.dark, 0.3)],
      [0.3, mix(W.humus, W.dark, 0.4)],
      [1, W.dark],
    ])})"`,
  );

  // The cut face: horizons as stacked bands, darkening with depth.
  const face = new Svg(w, h);
  const band = (y0: number, y1: number, top: string, bottom: string, salt: number) => {
    const n = c.noise;
    const edge = (y: number, k: number) => {
      const pts: Pt[] = [];
      for (let i = 0; i <= 30; i++) pts.push([(i / 30) * w, (y + (n(i * 0.4, salt + k) - 0.5) * 0.03) * h]);
      return pts;
    };
    const a = edge(y0, 0);
    const b = edge(y1, 1).reverse();
    face.path(
      smoothOpen(a) + "L" + smoothOpen(b).slice(1) + "Z",
      `fill="url(#${linear(face, [
        [0, top],
        [1, bottom],
      ])})"`,
    );
  };
  band(0.3, 0.58, mix(W.subsoil, W.humus, 0.55), mix(W.humus, W.topsoil, 0.4), 3);
  band(0.55, 1.05, mix(W.topsoil, W.humus, 0.3), mix(W.topsoil, W.dark, 0.3), 5);

  // L: whole leaves, cut edge-on: wavy strips with air between.
  const lyr = new Svg(w, h);
  for (let i = 0; i < 46; i++) {
    const y = range(r, 0.1, 0.32) * h;
    const x0 = range(r, -0.2, 0.9) * w;
    const len = u * range(r, 0.25, 0.6);
    const pts: Pt[] = [];
    for (let k = 0; k <= 6; k++) pts.push([x0 + (k / 6) * len, y + Math.sin(k * 1.1 + r() * 2) * u * 0.012]);
    const tone = leafTones[Math.floor(r() * leafTones.length)]!;
    const d = smoothOpen(pts);
    lyr.path(
      d,
      `fill="none" stroke="${mix(tone, W.dark, 0.5)}" stroke-width="${u * 0.011}" stroke-linecap="round"`,
    );
    lyr.path(d, `fill="none" stroke="${tone}" stroke-width="${u * 0.007}" stroke-linecap="round"`);
  }
  // F: fragments, darker and smaller.
  for (let i = 0; i < 220; i++) {
    const y = range(r, 0.3, 0.56) * h;
    const x = range(r, 0, 1) * w;
    const len = u * range(r, 0.02, 0.08) * (1.4 - y / h);
    const a = range(r, -0.4, 0.4);
    const tone = mix(leafTones[Math.floor(r() * leafTones.length)]!, W.humus, range(r, 0.35, 0.75));
    lyr.path(
      `M${f(x)},${f(y)}l${f(Math.cos(a) * len)},${f(Math.sin(a) * len)}`,
      `stroke="${tone}" stroke-width="${u * range(r, 0.004, 0.009)}" stroke-linecap="round"`,
    );
  }
  // The leaf skeleton at the cut: lace, veins without tissue.
  const sk = { x: 0.36 * w, y: 0.36 * h, l: u * 0.13 };
  lyr.path(
    blob(r, sk.x, sk.y, sk.l * 0.55, sk.l * 0.3, 0.12, 12),
    `fill="${mix(W.humus, W.dark, 0.3)}" opacity="0.7"`,
  );
  const lace = (x: number, y: number, a: number, len: number, depth: number) => {
    if (depth === 0 || len < 2) return;
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;
    lyr.path(
      `M${x.toFixed(1)},${y.toFixed(1)}L${x2.toFixed(1)},${y2.toFixed(1)}`,
      `stroke="${mix(W.sand, W.pale, 0.35)}" stroke-width="${(depth * 0.45).toFixed(1)}" stroke-linecap="round" opacity="0.85"`,
    );
    lace(x2, y2, a + range(r, 0.3, 0.7), len * 0.62, depth - 1);
    lace(x2, y2, a - range(r, 0.3, 0.7), len * 0.62, depth - 1);
  };
  lace(sk.x - sk.l * 0.5, sk.y, 0, sk.l * 0.4, 5);
  lace(sk.x, sk.y, 0.15, sk.l * 0.3, 4);
  lace(sk.x, sk.y, -0.15, sk.l * 0.3, 4);

  // A–horizon crumbs, with dark pores between; roots run through.
  const soil = new Svg(w, h);
  for (let i = 0; i < 760; i++) {
    const x = range(r, -0.02, 1.02) * w;
    const y = range(r, 0.56, 1.03) * h;
    crumb(
      soil,
      r,
      x,
      y,
      u * range(r, 0.008, 0.024),
      mix(mix(W.topsoil, W.humus, range(r, 0.2, 0.7)), W.loam, range(r, 0, 0.3)),
    );
  }
  soil.path(blob(r, 0.52 * w, 0.72 * h, u * 0.03, u * 0.022, 0.3), `fill="${W.dark}"`);
  soil.path(
    blob(r, 0.52 * w, 0.72 * h, u * 0.03, u * 0.022, 0.3),
    `fill="none" stroke="${W.film}" stroke-width="1.2" opacity="0.45"`,
  );
  for (let i = 0; i < 4; i++) {
    const x0 = range(r, 0.05, 0.95) * w;
    const pts: Pt[] = [[x0, 0.5 * h]];
    let x = x0;
    for (let k = 1; k <= 5; k++) {
      x += range(r, -0.015, 0.015) * w;
      pts.push([x, (0.5 + k * 0.11) * h]);
    }
    soil.path(
      smoothOpen(pts),
      `fill="none" stroke="${mix(W.pale, W.clay, 0.35)}" stroke-width="${u * range(r, 0.002, 0.004)}" stroke-linecap="round" opacity="0.75"`,
    );
  }
  stipple(
    soil,
    c,
    r,
    800,
    { x0: 0, y0: 0.55, x1: 1, y1: 1 },
    [W.sand, mix(W.pale, W.sand, 0.5)],
    [0.4, 1.2],
    () => 1,
    [0.3, 0.7],
  );

  // Hyphae webbing the fragments.
  const web = new Svg(w, h);
  const wb = blurDef(web, u * 0.002);
  web.open(`filter="url(#${wb})"`);
  for (let i = 0; i < 60; i++) {
    const x0 = (0.6 + range(r, -0.25, 0.25)) * w;
    const y0 = (0.46 + range(r, -0.1, 0.08)) * h;
    const a = r() * Math.PI * 2;
    const len = u * range(r, 0.04, 0.12);
    const bend = range(r, -0.6, 0.6);
    web.path(
      `M${f(x0)},${f(y0)}q${f(Math.cos(a + bend) * len * 0.6)},${f(Math.sin(a + bend) * len * 0.6)} ${f(Math.cos(a) * len)},${f(Math.sin(a) * len)}`,
      `fill="none" stroke="${W.pale}" stroke-width="${range(r, 0.4, 1).toFixed(1)}" opacity="${range(r, 0.3, 0.7).toFixed(2)}"`,
    );
  }
  web.close();

  const light = new Svg(w, h);
  light.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(
      light,
      [
        [0, W.pale, 0.25],
        [1, W.pale, 0],
      ],
      0.4,
      0,
      0.6,
    )})"`,
  );
  const grainTex = new Svg(w, h);
  paperGrain(grainTex, c.seed, 0.06);

  return {
    ground: W.dark,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0, motion: "none" },
      { id: "face", svg: face.toString(scale), parallax: 0.4, motion: "none" },
      { id: "soil", svg: soil.toString(scale), parallax: 0.5, motion: "none" },
      { id: "litter", svg: lyr.toString(scale), parallax: 0.5, motion: "none" },
      { id: "web", svg: web.toString(scale), parallax: 0.5, motion: "sway" },
      { id: "light", svg: light.toString(scale), parallax: 0, motion: "drift", blend: "screen" },
      { id: "grain", svg: grainTex.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites: [
      springtail(
        {
          id: "springtail",
          x: 0.24 * w,
          y: 0.28 * h,
          motion: "breathe",
          phase: 0.3,
          parallax: 0.5,
          scale: scale * 2,
        },
        u * 0.07,
      ),
      hypha(
        { id: "hypha-main", x: 0.62 * w, y: 0.47 * h, motion: "sway", phase: 0.2, parallax: 0.5, scale },
        [
          [0, u * 0.1],
          [u * 0.08, u * 0.02],
          [u * 0.2, u * 0.06],
          [u * 0.3, u * 0.01],
        ],
        u * 0.32,
        u * 0.12,
        u * 0.0035,
      ),
    ],
    particles: [
      {
        id: "motes",
        kind: "mote",
        count: 20,
        colour: W.pale,
        region: { x0: 0, y0: 0, x1: 1, y1: 0.12 },
        size: [0.6, 1.6],
        alpha: [0.2, 0.6],
        vx: 2,
        vy: 0,
        parallax: 0.2,
      },
    ],
  };
}
