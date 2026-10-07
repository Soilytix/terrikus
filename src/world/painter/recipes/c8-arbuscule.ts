/**
 * Chapter 8, c8-arbuscule: root cortex cells laid like bricks, an arbuscular
 * mycorrhizal hypha running between them and out into the soil, and in one
 * cell an arbuscule, a small glowing tree where sugar and phosphate change
 * hands (`smith-2003`). AM hyphae have no cross-walls, so none are drawn. The
 * plant membrane around the arbuscule is not drawn.
 */
import { W } from "../../../styles/scene";
import { UI } from "../../../styles/ui";
import { blob, blurDef, linear, paperGrain, range, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor, type Rng } from "../noise";
import { Svg, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";

/** Plate units; portrait keeps subjects above the phone sheet. Scene anchors follow these. */
const LANDSCAPE = { arb: [0.5, 0.48] as Pt, hypha: [0.16, 0.84] as Pt };
const PORTRAIT: typeof LANDSCAPE = { arb: [0.5, 0.3], hypha: [0.2, 0.6] };

const TREE = mix(W.pale, W.film, 0.45);

/** Dichotomous branching from `p` along angle `a`; returns the branch tips. */
function branch(s: Svg, r: Rng, p: Pt, a: number, len: number, width: number, depth: number, tips: Pt[]) {
  const q: Pt = [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len];
  const mid: Pt = [
    (p[0] + q[0]) / 2 + range(r, -0.15, 0.15) * len,
    (p[1] + q[1]) / 2 + range(r, -0.15, 0.15) * len,
  ];
  s.path(
    smoothOpen([p, mid, q]),
    `fill="none" stroke="${TREE}" stroke-width="${width}" stroke-linecap="round"`,
  );
  if (depth === 0) {
    tips.push(q);
    return;
  }
  for (const d of [-1, 1])
    branch(
      s,
      r,
      q,
      a + d * range(r, 0.35, 0.7),
      len * range(r, 0.62, 0.78),
      Math.max(1, width * 0.7),
      depth - 1,
      tips,
    );
}

export function c8Arbuscule(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 19);
  const L = h > w ? PORTRAIT : LANDSCAPE;
  const [ax, ay] = [L.arb[0] * w, L.arb[1] * h];

  // Cortex cells: rows of rounded bricks down to the host cell's row; soil below.
  const cw = u * 0.3;
  const ch = u * 0.2;
  const soilY = ay + ch * 0.6;

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.humus, W.dark, 0.4)],
      [soilY / h, mix(W.dark, W.humus, 0.2)],
      [1, mix(W.topsoil, W.dark, 0.3)],
    ])})"`,
  );

  const cells = new Svg(w, h);
  const host = { rx: cw * 0.52, ry: ch * 0.52 };
  const wall = `stroke="${mix(W.sand, W.clay, 0.4)}" stroke-width="${u * 0.006}"`;
  for (let k = 0; ay + k * ch > -ch; k--) {
    const y = ay + k * ch;
    const off = (-k % 2) * (cw / 2);
    for (let x = ax + off - Math.ceil((ax + off + cw) / cw) * cw; x < w + cw; x += cw) {
      if (k === 0 && Math.abs(x - ax) < 1) continue;
      const cx = x + range(r, -0.03, 0.03) * cw;
      const cy = y + range(r, -0.03, 0.03) * ch;
      cells.path(
        blob(r, cx, cy, cw * 0.46, ch * 0.44, 0.05, 12),
        `fill="${mix(W.pale, W.sand, 0.25)}" fill-opacity="0.14" ${wall}`,
      );
      // A nucleus, the one detail per cell.
      if (r() < 0.5)
        cells.circle(
          cx + range(r, -0.2, 0.2) * cw,
          cy + range(r, -0.2, 0.2) * ch,
          u * 0.018,
          `fill="${mix(W.sand, W.pale, 0.4)}" opacity="0.3"`,
        );
    }
  }
  cells.path(
    blob(r, ax, ay, host.rx, host.ry, 0.04, 14),
    `fill="${mix(W.pale, W.sand, 0.2)}" fill-opacity="0.2" ${wall}`,
  );

  // The hypha: up from the soil into the host cell, and along the gap between rows. No cross-walls.
  const fungus = new Svg(w, h);
  const [hx, hy] = [L.hypha[0] * w, L.hypha[1] * h];
  const entry: Pt = [ax - host.rx * 0.55, ay + host.ry * 0.6];
  const tube = (d: string, thick: number, attrs = "") => {
    fungus.path(
      d,
      `fill="none" stroke="${UI.ink}" stroke-width="${thick + 3}" stroke-linecap="round" ${attrs}`,
    );
    fungus.path(d, `fill="none" stroke="${TREE}" stroke-width="${thick}" stroke-linecap="round" ${attrs}`);
  };
  tube(
    smoothOpen([[-0.05 * w, hy + u * 0.06], [hx, hy], [entry[0] - u * 0.08, soilY + u * 0.05], entry]),
    u * 0.014,
  );
  tube(
    smoothOpen([
      entry,
      [ax - host.rx * 1.02, ay - ch * 0.5],
      [ax, ay - ch * 0.52],
      [w * 1.05, ay - ch * 0.5],
    ]),
    u * 0.01,
    `opacity="0.8"`,
  );

  // The arbuscule: a trunk from the entry point, branching into a fine tree that fills the host cell.
  const tree = new Svg(w, h);
  const glow = blurDef(tree, u * 0.012);
  tree.circle(ax, ay, host.ry * 1.1, `fill="${TREE}" opacity="0.18" filter="url(#${glow})"`);
  const tips: Pt[] = [];
  tree.open(`filter="url(#${glow})" opacity="0.6"`);
  branch(tree, rngFor(c.seed, 23), entry, -0.6, host.rx * 0.42, u * 0.012, 5, []);
  tree.close();
  branch(tree, rngFor(c.seed, 23), entry, -0.6, host.rx * 0.42, u * 0.012, 5, tips);
  for (const t of tips) tree.circle(t[0], t[1], u * 0.004, `fill="${W.pale}" opacity="0.8"`);

  const grainTex = new Svg(w, h);
  paperGrain(grainTex, c.seed, 0.05);

  return {
    ground: W.dark,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.15, motion: "none" },
      { id: "cells", svg: cells.toString(scale), parallax: 0.5, motion: "none" },
      { id: "fungus", svg: fungus.toString(scale), parallax: 0.6, motion: "none" },
      { id: "tree", svg: tree.toString(scale), parallax: 0.6, motion: "breathe", blend: "screen" },
      { id: "grain", svg: grainTex.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites: [],
    particles: [
      {
        id: "sugar",
        kind: "mote",
        count: 22,
        colour: mix(W.sand, W.pale, 0.5),
        region: { x0: L.arb[0] - 0.14, y0: L.arb[1] - 0.14, x1: L.arb[0] + 0.14, y1: L.arb[1] + 0.12 },
        size: [1.2, 2.6],
        alpha: [0.3, 0.7],
        vx: 0,
        vy: 0,
        parallax: 0.6,
      },
      {
        id: "phosphate",
        kind: "mote",
        count: 16,
        colour: W.film,
        region: { x0: L.hypha[0] - 0.1, y0: L.arb[1], x1: L.arb[0], y1: L.hypha[1] + 0.04 },
        size: [1, 2],
        alpha: [0.3, 0.6],
        vx: 2,
        vy: -1,
        parallax: 0.6,
      },
    ],
  };
}
