/**
 * Chapter 8, c8-nodule: a pea root with hairs; one hair curled around
 * rhizobia with an infection thread back into the root (`oldroyd-2013`); two
 * sliced nodules, one pink with leghaemoglobin and one white (`ott-2005`); and
 * an oxygen band fading from the soil towards the nodule's centre. The band is
 * a diagram; curl, thread and nodules are drawn side by side though they form
 * over days.
 */
import { W } from "../../../styles/scene";
import { UI } from "../../../styles/ui";
import { blob, blurDef, linear, paperGrain, range, shaded, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { bacterium } from "../sprites";
import { Svg, smoothClosed, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";

type Layout = {
  axis: Pt[];
  curl: Pt;
  pink: Pt;
  white: Pt;
  oxygen: Pt;
};
/** Plate units; portrait keeps subjects above the phone sheet. Scene anchors follow these. */
const LANDSCAPE: Layout = {
  axis: [
    [0.5, -0.05],
    [0.54, 0.35],
    [0.53, 0.6],
    [0.51, 1.05],
  ],
  curl: [0.3, 0.34],
  pink: [0.62, 0.56],
  white: [0.42, 0.74],
  oxygen: [0.8, 0.48],
};
const PORTRAIT: Layout = {
  axis: [
    [0.5, -0.05],
    [0.55, 0.3],
    [0.54, 0.5],
    [0.52, 1.05],
  ],
  curl: [0.26, 0.24],
  pink: [0.66, 0.42],
  white: [0.36, 0.58],
  oxygen: [0.84, 0.32],
};

/** Pink of leghaemoglobin, from the world register (no new hex). */
export const NODULE_PINK = mix(W.oxide, W.pale, 0.45);

export function c8Nodule(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 17);
  const L = h > w ? PORTRAIT : LANDSCAPE;
  const px = ([x, y]: Pt): Pt => [x * w, y * h];
  const axis = L.axis.map(px);
  /** Root centre x at plate height y, along the axis polyline. */
  const rootX = (y: number) => {
    for (let i = 1; i < axis.length; i++) {
      const [a, b] = [axis[i - 1]!, axis[i]!];
      if (y <= b[1]) return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]);
    }
    return axis.at(-1)![0];
  };
  const half = u * 0.04;
  const nodR = u * 0.085;

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.topsoil, W.dark, 0.25)],
      [1, mix(W.dark, W.humus, 0.35)],
    ])})"`,
  );

  // Grains, kept off the root and the nodules.
  const grains = new Svg(w, h);
  const clear = [px(L.pink), px(L.white), px(L.curl)];
  for (let i = 0; i < 60; i++) {
    const p: Pt = [range(r, -0.05, 1.05) * w, range(r, -0.05, 1.05) * h];
    const rad = u * range(r, 0.03, 0.075);
    if (Math.abs(p[0] - rootX(p[1])) < rad + half + u * 0.03) continue;
    if (clear.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < rad + nodR + u * 0.02)) continue;
    const tone = mix(r() < 0.5 ? W.sand : W.subsoil, W.humus, range(r, 0.3, 0.6));
    shaded(
      grains,
      blob(r, p[0], p[1], rad, rad * 0.8, 0.2, 8),
      tone,
      mix(tone, W.pale, 0.3),
      mix(tone, W.dark, 0.5),
    );
  }

  // The root, its hairs, the curled hair and its thread.
  const root = new Svg(w, h);
  const hairStroke = `stroke="${mix(W.pale, W.sand, 0.4)}" stroke-width="${u * 0.003}" stroke-linecap="round" fill="none"`;
  for (let k = 0; k < 34; k++) {
    const y = range(r, 0.05, 0.95) * h;
    const side = r() < 0.5 ? -1 : 1;
    const x = rootX(y) + side * half;
    const len = u * range(r, 0.04, 0.09);
    root.path(
      `M${x},${y}q${side * len * 0.5},${range(r, -0.2, 0.2) * len} ${side * len},${range(r, -0.3, 0.3) * len}`,
      `${hairStroke} opacity="0.5"`,
    );
  }
  const [cx, cy] = px(L.curl);
  const hairY = cy + u * 0.04;
  const hairStart: Pt = [rootX(hairY) - half, hairY];
  const curlR = u * 0.035;
  root.path(
    `${smoothOpen([hairStart, [(hairStart[0] + cx) / 2, hairY - u * 0.01], [cx + curlR, cy + curlR * 0.6]])}` +
      `A${curlR},${curlR} 0 1 1 ${cx + curlR * 0.6},${cy - curlR * 0.4}`,
    `stroke="${mix(W.pale, W.sand, 0.25)}" stroke-width="${u * 0.006}" stroke-linecap="round" fill="none"`,
  );
  // Infection thread: a dashed tube from the curl back along the hair into the cortex.
  root.path(
    smoothOpen([
      [cx + curlR * 0.2, cy + curlR * 0.4],
      [(hairStart[0] + cx) / 2, hairY - u * 0.005],
      [hairStart[0] + half * 0.8, hairY + u * 0.01],
    ]),
    `fill="none" stroke="${mix(W.oxide, W.sand, 0.5)}" stroke-width="${u * 0.004}" stroke-dasharray="${u * 0.008} ${u * 0.005}" stroke-linecap="round"`,
  );

  // Body of the root.
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const y = -0.05 * h + (1.1 * h * i) / 12;
    left.push([rootX(y) - half, y]);
    right.push([rootX(y) + half, y]);
  }
  root.path(
    smoothClosed([...left, ...right.reverse()]),
    `fill="${mix(W.pale, W.sand, 0.35)}" stroke="${UI.ink}" stroke-width="1.5" stroke-linejoin="round"`,
  );
  // The water-carrying core, faint.
  root.path(
    smoothOpen(axis.slice(0)),
    `fill="none" stroke="${mix(W.sand, W.loam, 0.3)}" stroke-width="${u * 0.008}" opacity="0.45"`,
  );

  // Nodules: two whole ones, and two sliced to show their interiors.
  const nodules = new Svg(w, h);
  const glow = blurDef(nodules, u * 0.01);
  const whole: Pt[] = [
    [0, 0.3],
    [1, 0.82],
  ].map(([side, y]) => [rootX(y! * h) + (side ? 1 : -1) * (half + nodR * 0.5), y! * h]);
  for (const [x, y] of whole) {
    nodules.path(
      blob(r, x, y, nodR * 0.6, nodR * 0.55, 0.12, 10),
      `fill="${mix(W.sand, W.pale, 0.2)}" stroke="${UI.ink}" stroke-width="1.5"`,
    );
  }
  const sliced = (at: Pt, inner: string) => {
    const [x, y] = px(at);
    const toward = Math.sign(rootX(y) - x);
    // A broad neck to the root.
    nodules.path(
      smoothClosed([
        [x + toward * nodR * 0.4, y - nodR * 0.55],
        [rootX(y) - toward * half * 0.5, y - nodR * 0.35],
        [rootX(y) - toward * half * 0.5, y + nodR * 0.35],
        [x + toward * nodR * 0.4, y + nodR * 0.55],
      ]),
      `fill="${mix(W.sand, W.pale, 0.25)}" stroke="${UI.ink}" stroke-width="1.5"`,
    );
    nodules.path(
      blob(r, x, y, nodR, nodR * 0.92, 0.08, 12),
      `fill="${mix(W.sand, W.pale, 0.3)}" stroke="${UI.ink}" stroke-width="1.5"`,
    );
    nodules.path(
      blob(r, x, y, nodR * 0.68, nodR * 0.62, 0.1, 12),
      `fill="${inner}" stroke="${mix(UI.ink, inner, 0.5)}" stroke-width="1"`,
    );
    // Infected cells: a soft speckle inside the slice.
    for (let k = 0; k < 18; k++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * nodR * 0.55;
      nodules.circle(
        x + Math.cos(a) * d,
        y + Math.sin(a) * d * 0.9,
        u * 0.006,
        `fill="${mix(inner, W.dark, 0.15)}" opacity="0.5"`,
      );
    }
  };
  nodules.circle(...px(L.pink), nodR * 0.75, `fill="${NODULE_PINK}" opacity="0.35" filter="url(#${glow})"`);
  sliced(L.pink, NODULE_PINK);
  sliced(L.white, mix(W.pale, W.film, 0.2));

  // Oxygen band: light (soil, oxygen-rich) to dark (nodule centre, almost none).
  const [ox, oy] = px(L.oxygen);
  const bw = u * 0.2;
  const bh = u * 0.035;
  const g = linear(
    nodules,
    [
      [0, mix(W.dark, W.deep, 0.4)],
      [0.5, W.water],
      [1, W.film],
    ],
    0,
    0,
    1,
    0,
  );
  nodules.rect(
    ox - bw / 2,
    oy - bh / 2,
    bw,
    bh,
    `rx="${bh / 2}" fill="url(#${g})" stroke="${UI.ink}" stroke-width="1.5"`,
  );
  for (let k = 0; k <= 4; k++)
    nodules.path(
      `M${ox - bw / 2 + (bw * k) / 4},${oy + bh / 2}v${u * 0.01}`,
      `stroke="${W.pale}" stroke-width="1" opacity="0.7"`,
    );

  // Rhizobia: a few caught in the curl, a few free in the soil.
  const sprites = [];
  for (let k = 0; k < 10; k++) {
    const free = k >= 4;
    const x = free ? cx + range(r, -0.12, 0.08) * w : cx + range(r, -0.6, 0.6) * curlR;
    const y = free ? cy + range(r, -0.14, 0.2) * h : cy + range(r, -0.6, 0.6) * curlR;
    sprites.push(
      bacterium(
        {
          id: `rhizobium-${k}`,
          x,
          y,
          motion: free ? "wiggle" : "breathe",
          phase: r(),
          parallax: 0.6,
          scale: scale * 2,
          rotation: r() * 3,
        },
        u * 0.022,
      ),
    );
  }

  const grainTex = new Svg(w, h);
  paperGrain(grainTex, c.seed, 0.06);

  return {
    ground: W.dark,
    layers: [
      { id: "bulk", svg: back.toString(scale), parallax: 0.15, motion: "none" },
      { id: "grains", svg: grains.toString(scale), parallax: 0.6, motion: "none" },
      { id: "root", svg: root.toString(scale), parallax: 0.6, motion: "none" },
      { id: "nodules", svg: nodules.toString(scale), parallax: 0.6, motion: "none" },
      { id: "grain", svg: grainTex.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites,
    particles: [
      {
        id: "flavonoids",
        kind: "plume",
        count: 18,
        colour: mix(W.pale, W.sand, 0.3),
        region: { x0: L.curl[0] - 0.05, y0: L.curl[1] - 0.08, x1: L.curl[0] + 0.15, y1: L.curl[1] + 0.12 },
        size: [1, 2.2],
        alpha: [0.2, 0.45],
        vx: -1,
        vy: 0,
        parallax: 0.6,
      },
    ],
  };
}
