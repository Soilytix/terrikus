/** Aggregate scale: mineral grains, water films and air gaps (prologue p-pore and chapter 2). */
import { W } from "../../../styles/scene";
import {
  blob,
  blurDef,
  grain as grainPath,
  linear,
  paperGrain,
  radial,
  range,
  shaded,
  type Ctx,
} from "../brush";
import { mix } from "../color";
import { rngFor, type Rng } from "../noise";
import { amoeba, bacterium, hypha } from "../sprites";
import { Svg, smoothClosed, type Pt } from "../svg";
import type { SpriteSpec } from "../types";
import type { RecipeOut } from "./index";

interface Grain {
  x: number;
  y: number;
  rad: number;
  tone: string;
  d: string;
}

/** Pack grains with rejection sampling; `keep` are clearings (plate units) left open as pores. */
function pack(c: Ctx, r: Rng, keep: { x: number; y: number; r: number }[], force: Grain[] = []): Grain[] {
  const { w, h, u } = c;
  const tones = [
    W.sand,
    mix(W.sand, W.subsoil, 0.5),
    W.subsoil,
    mix(W.loam, W.subsoil, 0.4),
    mix(W.clay, W.sand, 0.3),
    mix(W.sand, W.pale, 0.3),
  ];
  const out: Grain[] = [...force];
  for (let tries = 0; tries < 2400 && out.length < 60; tries++) {
    const x = range(r, -0.08, 1.08) * w;
    const y = range(r, -0.08, 1.08) * h;
    const rad = u * range(r, 0.05, 0.14);
    if (keep.some((k) => Math.hypot(x - k.x * w, y - k.y * h) < rad + k.r * u)) continue;
    if (out.some((g) => Math.hypot(x - g.x, y - g.y) < (rad + g.rad) * 0.92)) continue;
    out.push({ x, y, rad, tone: tones[Math.floor(r() * tones.length)]!, d: grainPath(r, x, y, rad) });
  }
  return out;
}

function drawGrains(s: Svg, film: Svg, c: Ctx, r: Rng, grains: Grain[]): void {
  const { u } = c;
  const glow = blurDef(film, u * 0.006);
  for (const g of grains) {
    // Film first, on its own layer, so it can shimmer: a water coat hugging every grain.
    film.path(
      g.d,
      `fill="none" stroke="${W.film}" stroke-width="${u * 0.012}" opacity="0.35" filter="url(#${glow})"`,
    );
    film.path(
      g.d,
      `fill="none" stroke="${mix(W.film, W.water, 0.3)}" stroke-width="${u * 0.0035}" opacity="0.7"`,
    );
    shaded(s, g.d, g.tone, mix(g.tone, W.pale, 0.45), mix(g.tone, W.dark, 0.55));
    // Two facet strokes and a specular glint.
    for (let k = 0; k < 2; k++) {
      const a = r() * Math.PI * 2;
      s.path(
        `M${g.x + Math.cos(a) * g.rad * 0.2},${g.y + Math.sin(a) * g.rad * 0.2}L${g.x + Math.cos(a + 0.9) * g.rad * 0.75},${g.y + Math.sin(a + 0.9) * g.rad * 0.7}`,
        `stroke="${mix(g.tone, W.pale, 0.35)}" stroke-width="${u * 0.002}" opacity="0.5"`,
      );
    }
    s.path(
      blob(r, g.x + g.rad * 0.35, g.y - g.rad * 0.38, g.rad * 0.18, g.rad * 0.08, 0.2),
      `fill="${W.pale}" opacity="0.55"`,
    );
    // Silt and clay specks stuck to the grain.
    for (let k = 0; k < 10; k++) {
      const a = r() * Math.PI * 2;
      const d = g.rad * range(r, 0.2, 0.85);
      s.circle(
        g.x + Math.cos(a) * d,
        g.y + Math.sin(a) * d,
        u * range(r, 0.0015, 0.004),
        `fill="${mix(g.tone, W.dark, 0.35)}" opacity="0.5"`,
      );
    }
  }
}

/** Water bridges (menisci) between grains that almost touch. */
function menisci(film: Svg, c: Ctx, grains: Grain[]): void {
  for (let i = 0; i < grains.length; i++) {
    for (let j = i + 1; j < grains.length; j++) {
      const a = grains[i]!;
      const b = grains[j]!;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > (a.rad + b.rad) * 1.12) continue;
      const nx = (b.x - a.x) / d;
      const ny = (b.y - a.y) / d;
      const k = c.u * 0.03 * (1.12 - d / (a.rad + b.rad));
      film.path(
        `M${a.x + nx * a.rad * 0.85},${a.y + ny * a.rad * 0.85}L${b.x - nx * b.rad * 0.85},${b.y - ny * b.rad * 0.85}`,
        `stroke="${mix(W.water, W.film, 0.35)}" stroke-width="${(k * 5 + c.u * 0.012).toFixed(1)}" stroke-linecap="round" opacity="0.42"`,
      );
    }
  }
}

function deep(c: Ctx, r: Rng, ground: string): Svg {
  const { w, h, u } = c;
  const s = new Svg(w, h);
  s.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(
      s,
      [
        [0, mix(ground, W.topsoil, 0.35)],
        [1, ground],
      ],
      0.5,
      0.45,
      0.8,
    )})"`,
  );
  const b = blurDef(s, u * 0.02);
  s.open(`filter="url(#${b})"`);
  for (let i = 0; i < 26; i++) {
    s.path(
      blob(r, range(r, 0, 1) * w, range(r, 0, 1) * h, u * range(r, 0.05, 0.12), u * range(r, 0.04, 0.1), 0.3),
      `fill="${mix(W.loam, W.dark, range(r, 0.45, 0.75))}" opacity="0.8"`,
    );
  }
  s.close();
  return s;
}

/** Where the pore's subjects sit, in plate units. */
const PORE_LANDSCAPE = {
  big: { x: 0.16, y: 0.8 },
  bacterium: { x: 0.46, y: 0.6 },
  amoeba: { x: 0.7, y: 0.42 },
  hypha: { x: 0.27, y: 0.24 },
  film: { x: 0.56, y: 0.75 },
};
const PORE_PORTRAIT: typeof PORE_LANDSCAPE = {
  big: { x: 0.2, y: 0.72 },
  bacterium: { x: 0.7, y: 0.5 },
  amoeba: { x: 0.3, y: 0.42 },
  hypha: { x: 0.6, y: 0.24 },
  film: { x: 0.56, y: 0.63 },
};

export function pore(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 5);
  // Portrait (phones): hypha, amoeba and bacterium in the upper half, clear of the
  // ladder and the mission sheet. The prologue's `portrait` anchors follow `at`.
  const at = h > w ? PORE_PORTRAIT : PORE_LANDSCAPE;
  const back = deep(c, r, W.dark);
  const grains = new Svg(w, h);
  const film = new Svg(w, h);
  const big: Grain = { x: at.big.x * w, y: at.big.y * h, rad: u * 0.17, tone: W.sand, d: "" };
  big.d = grainPath(r, big.x, big.y, big.rad);
  const g = pack(
    c,
    r,
    [
      { ...at.bacterium, r: 0.06 },
      { ...at.amoeba, r: 0.13 },
      { x: at.hypha.x, y: at.hypha.y + 0.06, r: 0.1 },
      { x: at.film.x + 0.02, y: at.film.y + 0.03, r: 0.03 },
    ],
    [big],
  );
  // A water-filled pore around the amoeba; the hypha's gap stays air.
  const pb = blurDef(film, u * 0.025);
  film.path(
    blob(r, at.amoeba.x * w, (at.amoeba.y + 0.01) * h, u * 0.2, u * 0.17, 0.25),
    `fill="url(#${radial(film, [
      [0, mix(W.water, W.deep, 0.3), 0.8],
      [1, mix(W.water, W.deep, 0.6), 0.4],
    ])})" filter="url(#${pb})"`,
  );
  menisci(film, c, g);
  drawGrains(grains, film, c, r, g);
  film.path(
    blob(r, at.film.x * w, at.film.y * h, u * 0.08, u * 0.025, 0.2),
    `fill="${mix(W.water, W.film, 0.4)}" opacity="0.55"`,
  );

  const sprites: SpriteSpec[] = [
    bacterium(
      {
        id: "bacterium",
        x: at.bacterium.x * w,
        y: at.bacterium.y * h,
        motion: "breathe",
        phase: 0.1,
        parallax: 0.6,
        scale: scale * 2,
        rotation: -0.4,
      },
      u * 0.02,
      true,
    ),
    amoeba(
      {
        id: "amoeba",
        x: at.amoeba.x * w,
        y: at.amoeba.y * h,
        motion: "wiggle",
        phase: 0.4,
        parallax: 0.6,
        scale: scale * 2,
      },
      r,
      u * 0.075,
    ),
    hypha(
      { id: "hypha", x: at.hypha.x * w, y: at.hypha.y * h, motion: "sway", phase: 0.7, parallax: 0.6, scale },
      [
        [0, u * 0.32],
        [u * 0.12, u * 0.1],
        [u * 0.28, u * 0.04],
        [u * 0.44, u * 0.14],
        [u * 0.56, u * 0.06],
      ],
      u * 0.58,
      u * 0.36,
      u * 0.014,
    ),
  ];
  for (let k = 0; k < 5; k++) {
    sprites.push(
      bacterium(
        {
          id: `sleeper-${k}`,
          x: range(r, 0.1, 0.95) * w,
          y: range(r, 0.1, 0.95) * h,
          motion: "breathe",
          phase: r(),
          parallax: 0.6,
          scale: scale * 2,
          rotation: r() * 3,
          alpha: 0.75,
        },
        u * 0.016,
        true,
      ),
    );
  }

  const light = new Svg(w, h);
  light.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(
      light,
      [
        [0, W.film, 0.12],
        [0.5, W.film, 0],
        [1, W.dark, 0.3],
      ],
      0.2,
      0,
      0.8,
      1,
    )})"`,
  );
  const grainTex = new Svg(w, h);
  paperGrain(grainTex, c.seed, 0.06);

  return {
    ground: W.dark,
    layers: [
      { id: "deep", svg: back.toString(scale), parallax: 0.15, motion: "drift" },
      { id: "film", svg: film.toString(scale), parallax: 0.6, motion: "shimmer" },
      { id: "grains", svg: grains.toString(scale), parallax: 0.6, motion: "none" },
      { id: "light", svg: light.toString(scale), parallax: 0, motion: "none", blend: "screen" },
      { id: "grain", svg: grainTex.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites,
    particles: [
      {
        id: "colloids",
        kind: "colloid",
        count: 70,
        colour: mix(W.clay, W.pale, 0.4),
        region: { x0: 0, y0: 0, x1: 1, y1: 1 },
        size: [0.6, 1.6],
        alpha: [0.25, 0.6],
        vx: 0,
        vy: 0,
        parallax: 0.6,
      },
    ],
  };
}

export function poreLeaf(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 6);
  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.deep, W.water, 0.3)],
      [0.6, W.deep],
      [1, mix(W.deep, W.dark, 0.5)],
    ])})"`,
  );
  const bb = blurDef(back, u * 0.02);
  back.open(`filter="url(#${bb})"`);
  for (let i = 0; i < 14; i++) {
    back.path(
      blob(
        r,
        range(r, 0.4, 1.1) * w,
        range(r, 0, 0.7) * h,
        u * range(r, 0.06, 0.14),
        u * range(r, 0.05, 0.12),
        0.3,
      ),
      `fill="${mix(W.loam, W.deep, 0.6)}" opacity="0.6"`,
    );
  }
  back.close();
  // Caustic light from above, through water.
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(
      back,
      [
        [0, W.film, 0.22],
        [1, W.film, 0],
      ],
      0.65,
      0.05,
      0.6,
    )})"`,
  );

  // The leaf fragment: a dark slab with plant cell walls.
  const frag = new Svg(w, h);
  const fragPts: Pt[] = [
    [-0.05, 0.12],
    [0.18, 0.18],
    [0.3, 0.32],
    [0.36, 0.5],
    [0.32, 0.68],
    [0.22, 0.8],
    [-0.05, 0.86],
  ].map(([x, y]) => [x! * w, y! * h] as Pt);
  const fd = smoothClosed(fragPts);
  const clip = frag.id("fc");
  frag.def(`<clipPath id="${clip}"><path d="${fd}"/></clipPath>`);
  shaded(frag, fd, mix(W.humus, W.loam, 0.35), mix(W.subsoil, W.humus, 0.3), mix(W.humus, W.dark, 0.5), -0.4);
  frag.open(`clip-path="url(#${clip})"`);
  const cell = u * 0.055;
  for (let y = 0; y < h; y += cell * 0.7) {
    for (let x = 0; x < 0.4 * w; x += cell) {
      const ox = (Math.floor(y / (cell * 0.7)) % 2) * cell * 0.5;
      frag.path(
        blob(r, x + ox, y, cell * 0.46, cell * 0.32, 0.12, 6),
        `fill="none" stroke="${mix(W.subsoil, W.sand, 0.3)}" stroke-width="${u * 0.003}" opacity="${range(r, 0.25, 0.55).toFixed(2)}"`,
      );
    }
  }
  frag.close();
  // Frayed edge where enzymes work.
  for (let i = 0; i < 40; i++) {
    const t = range(r, 0.25, 0.75);
    const x = (0.33 + (0.5 - Math.abs(t - 0.5)) * 0.08) * w;
    frag.circle(
      x + range(r, -0.02, 0.03) * w,
      t * h,
      u * range(r, 0.003, 0.009),
      `fill="${mix(W.humus, W.subsoil, 0.4)}" opacity="0.8"`,
    );
  }

  // Clay below: platelet stacks with an organic coating.
  const clay = new Svg(w, h);
  for (let row = 0; row < 14; row++) {
    for (let k = 0; k < 14; k++) {
      const x = (k / 13) * w + range(r, -0.03, 0.03) * w;
      const y = (0.8 + row * 0.015) * h + range(r, -0.004, 0.004) * h;
      const len = u * range(r, 0.08, 0.16);
      const a = range(r, -0.08, 0.08);
      clay.path(
        `M${x - (Math.cos(a) * len) / 2},${y - (Math.sin(a) * len) / 2}L${x + (Math.cos(a) * len) / 2},${y + (Math.sin(a) * len) / 2}`,
        `stroke="${mix(W.clay, row % 2 ? W.pale : W.dark, range(r, 0.05, 0.25))}" stroke-width="${u * 0.008}" stroke-linecap="round"`,
      );
    }
  }
  clay.path(
    `M0,${0.79 * h}C${0.3 * w},${0.775 * h} ${0.6 * w},${0.8 * h} ${w},${0.785 * h}`,
    `fill="none" stroke="${mix(W.humus, W.loam, 0.4)}" stroke-width="${u * 0.008}" opacity="0.85"`,
  );

  // Grains at the right edge.
  const grains = new Svg(w, h);
  const film = new Svg(w, h);
  const g = pack(c, r, [
    { x: 0.2, y: 0.5, r: 0.5 },
    { x: 0.6, y: 0.35, r: 0.22 },
    { x: 0.5, y: 0.95, r: 0.12 },
  ]).filter((x) => x.x > 0.7 * w);
  drawGrains(grains, film, c, r, g);

  const sprites: SpriteSpec[] = [];
  // The colony at the fragment's edge: fast growers, crowded.
  for (let k = 0; k < 24; k++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * u * 0.07;
    sprites.push(
      bacterium(
        {
          id: `colony-${k}`,
          x: 0.38 * w + Math.cos(a) * d * 0.7,
          y: 0.5 * h + Math.sin(a) * d * 1.3,
          motion: "wiggle",
          phase: r(),
          parallax: 0.6,
          scale: scale * 2,
          rotation: r() * Math.PI,
        },
        u * range(r, 0.018, 0.024),
      ),
    );
  }

  const grainTex = new Svg(w, h);
  paperGrain(grainTex, c.seed, 0.06);

  return {
    ground: W.deep,
    layers: [
      { id: "water", svg: back.toString(scale), parallax: 0.15, motion: "shimmer" },
      { id: "clay", svg: clay.toString(scale), parallax: 0.6, motion: "none" },
      { id: "film", svg: film.toString(scale), parallax: 0.6, motion: "shimmer" },
      { id: "grains", svg: grains.toString(scale), parallax: 0.6, motion: "none" },
      { id: "fragment", svg: frag.toString(scale), parallax: 0.6, motion: "none" },
      { id: "grain", svg: grainTex.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites,
    particles: [
      {
        id: "plume",
        kind: "plume",
        count: 60,
        colour: mix(W.sand, W.pale, 0.4),
        region: { x0: 0.36, y0: 0.3, x1: 0.66, y1: 0.6 },
        size: [1, 3],
        alpha: [0.2, 0.55],
        vx: 6,
        vy: -4,
        parallax: 0.6,
      },
      {
        id: "bubbles",
        kind: "bubble",
        count: 18,
        colour: W.film,
        region: { x0: 0.6, y0: 0.15, x1: 0.85, y1: 0.6 },
        size: [2, 6],
        alpha: [0.4, 0.8],
        vx: 0,
        vy: -10,
        parallax: 0.6,
      },
      {
        id: "colloids",
        kind: "colloid",
        count: 50,
        colour: mix(W.clay, W.pale, 0.4),
        region: { x0: 0, y0: 0, x1: 1, y1: 1 },
        size: [0.6, 1.4],
        alpha: [0.2, 0.5],
        vx: 0,
        vy: 0,
        parallax: 0.6,
      },
    ],
  };
}
