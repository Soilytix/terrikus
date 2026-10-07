/**
 * Chapter 6, c6-geosmin: Streptomyces filaments on a crumb release scent
 * ribbons (geosmin) into the pore air, and a springtail turns towards them
 * (`becher-2020`). Ribbons are schematic: the molecules are invisible.
 */
import { W } from "../../../styles/scene";
import { UI } from "../../../styles/ui";
import { blob, blurDef, linear, paperGrain, radial, range, shaded, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor, type Rng } from "../noise";
import { springtail } from "../sprites";
import { Svg, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";

/** Subjects in plate units; portrait keeps them above the phone sheet. Scene anchors follow these. */
const LANDSCAPE = { strep: { x: 0.24, y: 0.58 }, ribbon: { x: 0.44, y: 0.4 }, tail: { x: 0.64, y: 0.32 } };
const PORTRAIT: typeof LANDSCAPE = {
  strep: { x: 0.32, y: 0.4 },
  ribbon: { x: 0.52, y: 0.28 },
  tail: { x: 0.78, y: 0.2 },
};

/** A branching filament from (x, y) heading at angle `a`; spore chains coil at the tips. */
function filament(s: Svg, r: Rng, x: number, y: number, a: number, len: number, depth: number, u: number) {
  const pts: Pt[] = [[x, y]];
  let [px, py, pa] = [x, y, a];
  const n = 5;
  for (let i = 0; i < n; i++) {
    pa += range(r, -0.35, 0.35);
    px += (Math.cos(pa) * len) / n;
    py += (Math.sin(pa) * len) / n;
    pts.push([px, py]);
  }
  const d = smoothOpen(pts);
  s.path(d, `fill="none" stroke="${UI.ink}" stroke-width="${u * 0.006}" stroke-linecap="round"`);
  s.path(
    d,
    `fill="none" stroke="${mix(W.pale, W.sand, 0.35)}" stroke-width="${u * 0.0035}" stroke-linecap="round"`,
  );
  if (depth > 0) {
    for (let k = 0; k < 2; k++) {
      const p = pts[2 + Math.floor(r() * 3)]!;
      filament(s, r, p[0], p[1], pa + (k ? 1 : -1) * range(r, 0.5, 1), len * 0.6, depth - 1, u);
    }
  } else {
    // Spore chain: a short coil of beads at the tip.
    for (let k = 0; k < 7; k++) {
      const t = k / 6;
      s.circle(
        px + Math.cos(pa - 1.2 + t * 4) * u * 0.012 * t + Math.cos(pa) * u * 0.006 * k,
        py + Math.sin(pa - 1.2 + t * 4) * u * 0.012 * t + Math.sin(pa) * u * 0.006 * k,
        u * 0.0045,
        `fill="${mix(W.sand, W.oxide, 0.25)}" stroke="${UI.ink}" stroke-width="0.8"`,
      );
    }
  }
}

export function c6Geosmin(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 11);
  const at = h > w ? PORTRAIT : LANDSCAPE;

  // Pore air: dark, with a cool glow where the ribbons drift.
  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.dark, W.stone2, 0.35)],
      [0.6, W.dark],
      [1, mix(W.dark, W.humus, 0.4)],
    ])})"`,
  );
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(
      back,
      [
        [0, W.film, 0.18],
        [1, W.film, 0],
      ],
      at.ribbon.x,
      at.ribbon.y,
      0.45,
    )})"`,
  );
  const bb = blurDef(back, u * 0.02);
  back.open(`filter="url(#${bb})"`);
  for (let i = 0; i < 18; i++) {
    back.path(
      blob(
        r,
        range(r, 0, 1) * w,
        range(r, 0, 0.5) * h,
        u * range(r, 0.05, 0.12),
        u * range(r, 0.03, 0.08),
        0.3,
      ),
      `fill="${mix(W.loam, W.dark, range(r, 0.5, 0.8))}" opacity="0.7"`,
    );
  }
  back.close();

  // The crumb: a mound of grains and humus along the bottom, and the colony's patch on it.
  const crumb = new Svg(w, h);
  const top = (at.strep.y + 0.08) * h;
  crumb.path(
    blob(r, 0.45 * w, top + h * 0.45, w * 0.75, h * 0.48, 0.12, 14),
    `fill="${mix(W.humus, W.topsoil, 0.4)}"`,
  );
  for (let i = 0; i < 46; i++) {
    const x = range(r, -0.05, 1.05) * w;
    const y = top + range(r, 0.02, 0.6) * h;
    const rad = u * range(r, 0.025, 0.07);
    const tone = mix(r() < 0.5 ? W.sand : W.subsoil, W.humus, range(r, 0.2, 0.55));
    shaded(
      crumb,
      blob(r, x, y, rad, rad * 0.8, 0.2, 8),
      tone,
      mix(tone, W.pale, 0.35),
      mix(tone, W.dark, 0.5),
    );
  }
  crumb.path(
    blob(r, at.strep.x * w, top, u * 0.14, u * 0.035, 0.25),
    `fill="${mix(W.pale, W.clay, 0.35)}" opacity="0.55"`,
  );

  // Streptomyces: a branching mat with spore chains at the aerial tips.
  const colony = new Svg(w, h);
  for (let k = 0; k < 5; k++) {
    filament(
      colony,
      r,
      (at.strep.x + range(r, -0.08, 0.08)) * w,
      top,
      -Math.PI / 2 + range(r, -0.7, 0.7),
      u * range(r, 0.12, 0.2),
      2,
      u,
    );
  }

  // Scent ribbons: soft bands from the colony towards the springtail.
  const scent = new Svg(w, h);
  const sb = blurDef(scent, u * 0.006);
  for (let k = 0; k < 4; k++) {
    const pts: Pt[] = [];
    const off = (k - 1.5) * 0.03;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const x = at.strep.x + (at.tail.x - 0.06 - at.strep.x) * t;
      const y = at.strep.y - 0.08 + (at.tail.y - at.strep.y + 0.08) * t + off * (1 - t * 0.6);
      pts.push([x * w, (y + Math.sin(t * 6 + k) * 0.025) * h]);
    }
    scent.path(
      smoothOpen(pts),
      `fill="none" stroke="${mix(W.film, W.pale, 0.4)}" stroke-width="${u * (0.012 - k * 0.002)}" stroke-linecap="round" opacity="${(0.4 - k * 0.07).toFixed(2)}" filter="url(#${sb})"`,
    );
  }

  const grainTex = new Svg(w, h);
  paperGrain(grainTex, c.seed, 0.06);

  return {
    ground: W.dark,
    layers: [
      { id: "air", svg: back.toString(scale), parallax: 0.15, motion: "drift" },
      { id: "scent", svg: scent.toString(scale), parallax: 0.4, motion: "shimmer", blend: "screen" },
      { id: "crumb", svg: crumb.toString(scale), parallax: 0.6, motion: "none" },
      { id: "colony", svg: colony.toString(scale), parallax: 0.6, motion: "none" },
      { id: "grain", svg: grainTex.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites: [
      springtail(
        {
          id: "springtail",
          x: at.tail.x * w,
          y: at.tail.y * h,
          motion: "wiggle",
          phase: 0.3,
          parallax: 0.6,
          scale,
          rotation: Math.PI,
        },
        u * 0.09,
      ),
    ],
    particles: [
      {
        id: "spores",
        kind: "mote",
        count: 24,
        colour: mix(W.sand, W.pale, 0.5),
        region: { x0: at.strep.x - 0.1, y0: at.strep.y - 0.3, x1: at.tail.x, y1: at.strep.y },
        size: [0.8, 1.8],
        alpha: [0.25, 0.6],
        vx: 2,
        vy: -1,
        parallax: 0.4,
      },
    ],
  };
}
