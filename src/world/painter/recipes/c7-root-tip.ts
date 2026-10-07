/**
 * Chapter 7, c7-root-tip: a spinach root tip pushes down between grains,
 * wrapped in exudate halos (sugars narrow, organic acids wider, volatiles
 * widest; `kuzyakov-razavi-2019`), with bacteria crowding the inner halo and
 * an amoeba at its edge. Halos are schematic; real gradients fade smoothly.
 */
import { W } from "../../../styles/scene";
import { UI } from "../../../styles/ui";
import { blob, blurDef, linear, paperGrain, range, shaded, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { amoeba, bacterium } from "../sprites";
import { Svg, smoothClosed, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";

/** Subjects in plate units; portrait keeps them above the phone sheet. Scene anchors follow these. */
const LANDSCAPE = { tip: { x: 0.5, y: 0.62 }, bloom: { x: 0.36, y: 0.52 }, amoeba: { x: 0.3, y: 0.34 } };
const PORTRAIT: typeof LANDSCAPE = {
  tip: { x: 0.5, y: 0.48 },
  bloom: { x: 0.28, y: 0.38 },
  amoeba: { x: 0.26, y: 0.22 },
};

/** Halo half-widths in units of u, inner to outer: sugars, organic acids, volatiles. */
const HALOS = [
  { r: 0.24, colour: mix(W.pale, W.sand, 0.3), alpha: 0.3 },
  { r: 0.38, colour: mix(W.sand, W.oxide, 0.3), alpha: 0.2 },
  { r: 0.56, colour: W.film, alpha: 0.12 },
] as const;

const dist = (p: Pt, a: Pt, b: Pt) => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
};

export function c7RootTip(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 13);
  const at = h > w ? PORTRAIT : LANDSCAPE;

  // The root's axis: from above the plate down to the tip, gently wandering.
  const axis: Pt[] = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const y = -0.08 * h + (at.tip.y * h + 0.08 * h) * t;
    axis.push([at.tip.x * w + Math.sin(t * 3 + 1) * u * 0.03 * (1 - t), y]);
  }
  const near = (p: Pt) => Math.min(...axis.slice(1).map((b, i) => dist(p, axis[i]!, b)));

  // Bulk soil: dark, warmer towards the root.
  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.topsoil, W.dark, 0.3)],
      [1, mix(W.dark, W.humus, 0.3)],
    ])})"`,
  );

  // Halos: soft outlines around the root, closed by a half-circle beyond the tip.
  const halos = new Svg(w, h);
  const hb = blurDef(halos, u * 0.015);
  for (const halo of [...HALOS].reverse()) {
    const R = u * halo.r;
    const arc: Pt[] = Array.from({ length: 7 }, (_, k) => {
      const a = Math.PI - (k / 6) * Math.PI;
      return [at.tip.x * w + Math.cos(a) * R, at.tip.y * h + Math.sin(a) * R * 0.8];
    });
    const outline: Pt[] = [
      ...axis.slice(0, -1).map(([x, y]): Pt => [x - R, y]),
      ...arc,
      ...axis
        .slice(0, -1)
        .reverse()
        .map(([x, y]): Pt => [x + R, y]),
    ];
    halos.path(smoothClosed(outline), `fill="${halo.colour}" opacity="${halo.alpha}" filter="url(#${hb})"`);
  }

  // Grains, kept clear of the root itself.
  const grains = new Svg(w, h);
  for (let i = 0; i < 70; i++) {
    const p: Pt = [range(r, -0.05, 1.05) * w, range(r, -0.05, 1.05) * h];
    const rad = u * range(r, 0.03, 0.08);
    if (near(p) < rad + u * 0.06) continue;
    const tone = mix(r() < 0.5 ? W.sand : W.subsoil, W.humus, range(r, 0.25, 0.6));
    shaded(
      grains,
      blob(r, p[0], p[1], rad, rad * 0.8, 0.2, 8),
      tone,
      mix(tone, W.pale, 0.3),
      mix(tone, W.dark, 0.5),
    );
  }

  // The root: a tapered body with a cap at the tip and hairs a little way behind it.
  const root = new Svg(w, h);
  const left: Pt[] = [];
  const right: Pt[] = [];
  axis.forEach((p, i) => {
    const q = axis[Math.min(i + 1, n)]!;
    const o = axis[Math.max(i - 1, 0)]!;
    const [dx, dy] = [q[0] - o[0], q[1] - o[1]];
    const len = Math.hypot(dx, dy) || 1;
    const half = u * (0.05 - 0.02 * (i / n));
    left.push([p[0] - (dy / len) * half, p[1] + (dx / len) * half]);
    right.push([p[0] + (dy / len) * half, p[1] - (dx / len) * half]);
  });
  const tip: Pt = [at.tip.x * w, at.tip.y * h + u * 0.035];
  const body = smoothClosed([...left, tip, ...right.reverse()]);
  for (let k = 0; k < 26; k++) {
    const t = range(r, 0.35, 0.8);
    const i = Math.floor(t * n);
    const [a, b] = [axis[i]!, axis[i + 1]!];
    const side = r() < 0.5 ? -1 : 1;
    const half = u * (0.05 - 0.02 * t);
    const [x, y] = [a[0] + (b[0] - a[0]) * (t * n - i), a[1] + (b[1] - a[1]) * (t * n - i)];
    const len = u * range(r, 0.03, 0.07);
    root.path(
      `M${x + side * half},${y}l${side * len},${range(r, -0.3, 0.3) * len}`,
      `stroke="${mix(W.pale, W.sand, 0.4)}" stroke-width="${u * 0.0025}" stroke-linecap="round" opacity="0.55"`,
    );
  }
  root.path(
    body,
    `fill="${mix(W.pale, W.sand, 0.35)}" stroke="${UI.ink}" stroke-width="1.5" stroke-linejoin="round"`,
  );
  root.path(
    smoothOpen(axis.slice(1)),
    `fill="none" stroke="${mix(W.sand, W.loam, 0.3)}" stroke-width="${u * 0.008}" opacity="0.5"`,
  );
  root.path(
    blob(r, tip[0], tip[1] - u * 0.03, u * 0.033, u * 0.04, 0.08, 10),
    `fill="${mix(W.sand, W.clay, 0.4)}" stroke="${UI.ink}" stroke-width="1.5"`,
  );
  // Cells sloughed from the cap.
  for (let k = 0; k < 6; k++)
    root.circle(
      tip[0] + range(r, -1, 1) * u * 0.06,
      tip[1] + range(r, 0, 1) * u * 0.05,
      u * range(r, 0.005, 0.009),
      `fill="${mix(W.sand, W.pale, 0.4)}" stroke="${UI.ink}" stroke-width="0.8" opacity="0.8"`,
    );

  // The bloom: active rods crowding the inner halo on both sides of the root.
  const sprites = [];
  for (let k = 0; k < 26; k++) {
    const other = k >= 16;
    const x = other
      ? at.tip.x + (at.tip.x - at.bloom.x) * range(r, 0.5, 1)
      : at.bloom.x + range(r, -0.045, 0.045);
    const y = (other ? at.bloom.y + range(r, -0.12, 0.08) : at.bloom.y + range(r, -0.07, 0.07)) * h;
    sprites.push(
      bacterium(
        {
          id: `rod-${k}`,
          x: x * w,
          y,
          motion: "breathe",
          phase: r(),
          parallax: 0.6,
          scale: scale * 2,
          rotation: r() * 3,
        },
        u * 0.03,
      ),
    );
  }
  sprites.push(
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
      u * 0.06,
    ),
  );

  const grainTex = new Svg(w, h);
  paperGrain(grainTex, c.seed, 0.06);

  return {
    ground: W.dark,
    layers: [
      { id: "bulk", svg: back.toString(scale), parallax: 0.15, motion: "none" },
      { id: "halos", svg: halos.toString(scale), parallax: 0.6, motion: "breathe", blend: "screen" },
      { id: "grains", svg: grains.toString(scale), parallax: 0.6, motion: "none" },
      { id: "root", svg: root.toString(scale), parallax: 0.6, motion: "none" },
      { id: "grain", svg: grainTex.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites,
    particles: [
      {
        id: "exudate",
        kind: "plume",
        count: 30,
        colour: mix(W.pale, W.sand, 0.3),
        region: { x0: at.tip.x - 0.12, y0: at.tip.y - 0.25, x1: at.tip.x + 0.12, y1: at.tip.y + 0.08 },
        size: [1, 2.4],
        alpha: [0.2, 0.5],
        vx: 0,
        vy: 1,
        parallax: 0.6,
      },
    ],
  };
}
