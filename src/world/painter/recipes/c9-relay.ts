/**
 * Chapter 9, c9-relay: the nitrogen relay in a section of a sugar beet field.
 * Ploughed-in straw near the surface with decomposers on it, a beet taproot,
 * a waterlogged crumb where denitrifiers work, a field drain below and NH₃
 * leaving the surface. Schematic: the stages of the relay are drawn side by
 * side; in a real field they overlap in the same millimetres.
 */
import { W } from "../../../styles/scene";
import { UI } from "../../../styles/ui";
import { blob, blurDef, linear, paperGrain, range, shaded, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { amoeba, bacterium } from "../sprites";
import { Svg, f, smoothClosed, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";

/** Subjects in plate units; portrait keeps them above the phone sheet. Scene anchors follow these. */
const LANDSCAPE = {
  surface: 0.16,
  straw: { x: 0.62, y: 0.26 },
  root: { x: 0.3, y: 0.8 },
  nitrifiers: { x: 0.47, y: 0.5 },
  microsite: { x: 0.66, y: 0.6 },
  drain: { x: 0.62, y: 0.9 },
  amoeba: { x: 0.5, y: 0.74 },
};
const PORTRAIT: typeof LANDSCAPE = {
  surface: 0.24,
  straw: { x: 0.66, y: 0.3 },
  root: { x: 0.24, y: 0.64 },
  nitrifiers: { x: 0.5, y: 0.44 },
  microsite: { x: 0.74, y: 0.52 },
  drain: { x: 0.6, y: 0.67 },
  amoeba: { x: 0.44, y: 0.56 },
};

export function c9Relay(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 19);
  const at = h > w ? PORTRAIT : LANDSCAPE;
  const top = at.surface * h;

  // Air above a wavy surface, then soil darkening with depth.
  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    top + u * 0.02,
    `fill="url(#${linear(back, [
      [0, W.skyHigh],
      [1, W.skyLow],
    ])})"`,
  );
  const surface: Pt[] = Array.from({ length: 13 }, (_, i) => [
    (i / 12) * w * 1.1 - w * 0.05,
    top + Math.sin(i * 1.7) * u * 0.008,
  ]);
  back.path(
    `${smoothOpen(surface)}L${w * 1.05},${h}L${-w * 0.05},${h}Z`,
    `fill="url(#${linear(back, [
      [0, mix(W.topsoil, W.loam, 0.3)],
      [0.6, mix(W.topsoil, W.dark, 0.3)],
      [1, mix(W.dark, W.humus, 0.2)],
    ])})"`,
  );

  // The taproot: a thick tapering cone from the crown at the surface, with fine laterals.
  const crown: Pt = [at.root.x * w, top - u * 0.04];
  const tipY = at.root.y * h;
  const axis: Pt[] = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    return [crown[0] + Math.sin(t * 2.4) * u * 0.02, crown[1] + (tipY - crown[1]) * t];
  });
  const halfAt = (t: number) => u * 0.11 * (1 - t) ** 1.3 + u * 0.004;
  const root = new Svg(w, h);
  for (let k = 0; k < 9; k++) {
    const t = range(r, 0.25, 0.85);
    const p = axis[Math.floor(t * 8)]!;
    const side = k % 2 ? 1 : -1;
    const len = u * range(r, 0.12, 0.22);
    const from: Pt = [p[0] + side * halfAt(t), p[1]];
    root.path(
      smoothOpen([
        from,
        [from[0] + side * len * 0.5, from[1] + len * 0.15],
        [from[0] + side * len, from[1] + len * range(r, 0.2, 0.5)],
      ]),
      `fill="none" stroke="${mix(W.pale, W.sand, 0.45)}" stroke-width="${u * 0.006}" stroke-linecap="round"`,
    );
  }
  const left = axis.map((p, i): Pt => [p[0] - halfAt(i / 8), p[1]]);
  const right = axis.map((p, i): Pt => [p[0] + halfAt(i / 8), p[1]]).reverse();
  root.path(
    smoothClosed([...left, ...right]),
    `fill="${mix(W.pale, W.sand, 0.3)}" stroke="${UI.ink}" stroke-width="1.5" stroke-linejoin="round"`,
  );
  for (let k = 1; k < 7; k++) {
    const y = crown[1] + (tipY - crown[1]) * (k / 9);
    const half = halfAt(k / 9) * 0.8;
    root.path(
      `M${axis[k]![0] - half},${y}q${half},${u * 0.012} ${half * 2},0`,
      `fill="none" stroke="${mix(W.sand, W.clay, 0.4)}" stroke-width="1" opacity="0.6"`,
    );
  }
  // Leaf stalks above the crown.
  for (let k = 0; k < 5; k++) {
    const a = -Math.PI / 2 + (k - 2) * 0.32;
    root.path(
      `M${crown[0]},${crown[1]}q${Math.cos(a) * u * 0.05},${-u * 0.06} ${Math.cos(a) * u * 0.1},${Math.sin(a) * u * 0.11}`,
      `fill="none" stroke="${W.foliage}" stroke-width="${u * 0.012}" stroke-linecap="round"`,
    );
  }

  // Grains, kept clear of the root, the crumb and the drain.
  const grains = new Svg(w, h);
  const clear = (p: Pt, rad: number) =>
    Math.abs(p[0] - at.root.x * w) > halfAt(Math.max(0, (p[1] - crown[1]) / (tipY - crown[1]))) + rad &&
    Math.hypot(p[0] - at.microsite.x * w, p[1] - at.microsite.y * h) > u * 0.14 + rad &&
    Math.abs(p[1] - at.drain.y * h) > u * 0.06 + rad;
  for (let i = 0; i < 60; i++) {
    const p: Pt = [range(r, -0.05, 1.05) * w, range(r, at.surface + 0.03, 1.05) * h];
    const rad = u * range(r, 0.02, 0.05);
    if (!clear(p, rad)) continue;
    const tone = mix(r() < 0.5 ? W.sand : W.subsoil, W.humus, range(r, 0.3, 0.65));
    shaded(
      grains,
      blob(r, p[0], p[1], rad, rad * 0.8, 0.2, 8),
      tone,
      mix(tone, W.pale, 0.3),
      mix(tone, W.dark, 0.5),
    );
  }

  // The waterlogged crumb: a dense aggregate whose pores are full of water; its core is anoxic.
  const crumb = new Svg(w, h);
  const [mx, my] = [at.microsite.x * w, at.microsite.y * h];
  const cb = blurDef(crumb, u * 0.01);
  crumb.path(
    blob(r, mx, my, u * 0.15, u * 0.12, 0.15, 11),
    `fill="${W.film}" opacity="0.35" filter="url(#${cb})"`,
  );
  shaded(
    crumb,
    blob(r, mx, my, u * 0.12, u * 0.095, 0.18, 11),
    mix(W.clay, W.dark, 0.3),
    mix(W.clay, W.pale, 0.2),
    mix(W.clay, W.dark, 0.6),
  );
  crumb.path(blob(r, mx, my, u * 0.055, u * 0.045, 0.2, 9), `fill="${W.gley}" opacity="0.85"`);

  // Ploughed-in straw: pale hollow stems at and just under the surface.
  const straw = new Svg(w, h);
  for (let k = 0; k < 9; k++) {
    const x = at.straw.x * w + range(r, -0.16, 0.16) * w;
    const y = k < 3 ? top - u * 0.008 : at.straw.y * h + range(r, -0.06, 0.06) * h;
    const len = u * range(r, 0.12, 0.22);
    const a = k < 3 ? range(r, -0.06, 0.06) : range(r, -0.5, 0.5);
    const [dx, dy] = [Math.cos(a) * len, Math.sin(a) * len];
    const sw = u * 0.016;
    straw.path(
      `M${f(x - dx / 2)},${f(y - dy / 2)}l${f(dx)},${f(dy)}`,
      `stroke="${UI.ink}" stroke-width="${sw + 2.5}" stroke-linecap="round"`,
    );
    straw.path(
      `M${f(x - dx / 2)},${f(y - dy / 2)}l${f(dx)},${f(dy)}`,
      `stroke="${mix(W.sand, W.pale, 0.45)}" stroke-width="${sw}" stroke-linecap="round"`,
    );
    straw.path(
      `M${f(x - dx / 2)},${f(y - dy / 2)}l${f(dx)},${f(dy)}`,
      `stroke="${mix(W.sand, W.subsoil, 0.4)}" stroke-width="${sw * 0.25}" stroke-linecap="round" opacity="0.7"`,
    );
  }

  // The field drain: a perforated pipe across the bottom.
  const drain = new Svg(w, h);
  const dy0 = at.drain.y * h;
  const dr = u * 0.035;
  drain.rect(
    -u * 0.1,
    dy0 - dr,
    w + u * 0.2,
    dr * 2,
    `rx="${dr}" fill="${mix(W.stone2, W.stone1, 0.3)}" stroke="${UI.ink}" stroke-width="1.5"`,
  );
  drain.rect(
    -u * 0.1,
    dy0 - dr * 0.25,
    w + u * 0.2,
    dr * 0.5,
    `fill="${mix(W.water, W.deep, 0.3)}" opacity="0.8"`,
  );
  for (let x = u * 0.05; x < w; x += u * 0.09)
    drain.circle(x, dy0 - dr * 0.6, u * 0.006, `fill="${W.dark}" opacity="0.7"`);

  const sprites = [];
  // Decomposers on the buried straw.
  for (let k = 0; k < 12; k++)
    sprites.push(
      bacterium(
        {
          id: `decomposer-${k}`,
          x: (at.straw.x + range(r, -0.08, 0.08)) * w,
          y: (at.straw.y + range(r, -0.035, 0.05)) * h,
          motion: "breathe",
          phase: r(),
          parallax: 0.6,
          scale: scale * 2,
          rotation: r() * 3,
        },
        u * 0.024,
      ),
    );
  // Ammonia oxidisers: a small, slow colony between the straw and the root.
  for (let k = 0; k < 7; k++)
    sprites.push(
      bacterium(
        {
          id: `nitrifier-${k}`,
          x: (at.nitrifiers.x + range(r, -0.025, 0.025)) * w,
          y: (at.nitrifiers.y + range(r, -0.025, 0.025)) * h,
          motion: "breathe",
          phase: r(),
          parallax: 0.6,
          scale: scale * 2,
          rotation: r() * 3,
        },
        u * 0.022,
      ),
    );
  // Denitrifiers inside the wet crumb.
  for (let k = 0; k < 6; k++)
    sprites.push(
      bacterium(
        {
          id: `denitrifier-${k}`,
          x: mx + range(r, -0.04, 0.04) * u,
          y: my + range(r, -0.03, 0.03) * u,
          motion: "breathe",
          phase: r(),
          parallax: 0.6,
          scale: scale * 2,
          rotation: r() * 3,
        },
        u * 0.018,
      ),
    );
  sprites.push(
    amoeba(
      {
        id: "amoeba",
        x: at.amoeba.x * w,
        y: at.amoeba.y * h,
        motion: "wiggle",
        phase: 0.3,
        parallax: 0.6,
        scale: scale * 2,
      },
      r,
      u * 0.045,
    ),
  );

  const grainTex = new Svg(w, h);
  paperGrain(grainTex, c.seed, 0.06);

  return {
    ground: W.dark,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.15, motion: "none" },
      { id: "grains", svg: grains.toString(scale), parallax: 0.6, motion: "none" },
      { id: "crumb", svg: crumb.toString(scale), parallax: 0.6, motion: "none" },
      { id: "drain", svg: drain.toString(scale), parallax: 0.6, motion: "none" },
      { id: "root", svg: root.toString(scale), parallax: 0.6, motion: "none" },
      { id: "straw", svg: straw.toString(scale), parallax: 0.6, motion: "none" },
      { id: "grain", svg: grainTex.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites,
    particles: [
      {
        id: "ammonia",
        kind: "plume",
        count: 18,
        colour: mix(W.pale, W.skyHigh, 0.5),
        region: { x0: at.straw.x - 0.15, y0: at.surface - 0.1, x1: at.straw.x + 0.15, y1: at.surface },
        size: [1, 2.2],
        alpha: [0.15, 0.4],
        vx: 0,
        vy: -1,
        parallax: 0.6,
      },
      {
        id: "gas",
        kind: "bubble",
        count: 8,
        colour: W.film,
        region: {
          x0: at.microsite.x - 0.04,
          y0: at.microsite.y - 0.12,
          x1: at.microsite.x + 0.04,
          y1: at.microsite.y - 0.04,
        },
        size: [1.5, 3],
        alpha: [0.3, 0.6],
        vx: 0,
        vy: -1,
        parallax: 0.6,
      },
    ],
  };
}
