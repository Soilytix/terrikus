/**
 * Chapter 10 plates. c10-triangle: a pea root in wet soil with a water mould
 * reaching for it, oospores, a cyst and a sclerotium waiting for a host.
 * c10-shield: a sugar beet root with a film of bacteria along it (drawn
 * dashed: a hypothesis) and Rhizoctonia threads stopping short. Schematic:
 * pathogens that rarely share a centimetre are drawn side by side.
 */
import { W } from "../../../styles/scene";
import { UI } from "../../../styles/ui";
import { blob, linear, range, shaded, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor, type Rng } from "../noise";
import { bacterium } from "../sprites";
import { Svg, poly, smoothClosed, smoothOpen, type Pt } from "../svg";
import type { SpriteSpec } from "../types";
import type { RecipeOut } from "./index";

const OUT = `stroke="${UI.ink}" stroke-width="1.5" stroke-linejoin="round"`;

/** Dark, wet soil filling the plate. */
function soil(w: number, h: number, wet: number): Svg {
  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.topsoil, W.loam, 0.25)],
      [1, mix(W.dark, W.humus, 0.3 + wet * 0.2)],
    ])})"`,
  );
  return back;
}

/** Grains scattered where `clear` allows. */
function grains(r: Rng, w: number, h: number, u: number, n: number, clear: (p: Pt, rad: number) => boolean) {
  const s = new Svg(w, h);
  for (let i = 0; i < n; i++) {
    const p: Pt = [range(r, -0.05, 1.05) * w, range(r, -0.05, 1.05) * h];
    const rad = u * range(r, 0.025, 0.06);
    if (!clear(p, rad)) continue;
    const tone = mix(r() < 0.5 ? W.sand : W.subsoil, W.humus, range(r, 0.3, 0.65));
    shaded(
      s,
      blob(r, p[0], p[1], rad, rad * 0.8, 0.2, 8),
      tone,
      mix(tone, W.pale, 0.3),
      mix(tone, W.dark, 0.5),
    );
  }
  return s;
}

/** A pale thread with an ink outline, along `pts` in plate px. */
function thread(s: Svg, pts: Pt[], thick: number, tone: string) {
  const d = smoothOpen(pts);
  s.path(d, `fill="none" stroke="${UI.ink}" stroke-width="${thick + 2.5}" stroke-linecap="round"`);
  s.path(d, `fill="none" stroke="${tone}" stroke-width="${thick}" stroke-linecap="round"`);
}

/** A wandering line from `from` towards `to`, ending `stop` of the way there. */
function reach(r: Rng, from: Pt, to: Pt, stop: number, n = 6): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * stop;
    const wob = i === 0 ? 0 : range(r, -1, 1) * Math.hypot(to[0] - from[0], to[1] - from[1]) * 0.06;
    return [from[0] + (to[0] - from[0]) * t + wob, from[1] + (to[1] - from[1]) * t + wob];
  });
}

const TRIANGLE_L = {
  root: 0.45,
  oomycete: { x: 0.58, y: 0.5 },
  oospores: { x: 0.66, y: 0.66 },
  cyst: { x: 0.26, y: 0.66 },
  sclerotium: { x: 0.68, y: 0.24 },
  wet: { x: 0.18, y: 0.38 },
};
const TRIANGLE_P: typeof TRIANGLE_L = {
  root: 0.46,
  oomycete: { x: 0.62, y: 0.44 },
  oospores: { x: 0.7, y: 0.55 },
  cyst: { x: 0.24, y: 0.56 },
  sclerotium: { x: 0.78, y: 0.27 },
  wet: { x: 0.18, y: 0.32 },
};

export function c10Triangle(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 23);
  const at = h > w ? TRIANGLE_P : TRIANGLE_L;
  const back = soil(w, h, 1);
  const P = (q: { x: number; y: number }): Pt => [q.x * w, q.y * h];

  // Water-filled pores: the conducive vertex.
  const water = new Svg(w, h);
  const [wx, wy] = P(at.wet);
  for (let k = 0; k < 5; k++)
    water.path(
      blob(r, wx + range(r, -0.08, 0.08) * u, wy + range(r, -0.1, 0.12) * u, u * 0.05, u * 0.035, 0.25, 9),
      `fill="${W.water}" opacity="0.55" ${OUT}`,
    );

  // The pea root: a straight pale axis with fine laterals.
  const root = new Svg(w, h);
  const rx = at.root * w;
  const half = u * 0.035;
  for (let k = 0; k < 8; k++) {
    const y = range(r, 0.08, 0.92) * h;
    const side = k % 2 ? 1 : -1;
    const len = u * range(r, 0.1, 0.2);
    thread(
      root,
      [
        [rx + side * half, y],
        [rx + side * (half + len * 0.5), y + len * 0.2],
        [rx + side * (half + len), y + len * range(r, 0.3, 0.6)],
      ],
      u * 0.006,
      mix(W.pale, W.sand, 0.35),
    );
  }
  const axis: Pt[] = Array.from({ length: 7 }, (_, i) => [
    rx + Math.sin(i * 1.3) * u * 0.01,
    (i / 6) * h * 1.1 - h * 0.05,
  ]);
  root.path(
    smoothClosed([
      ...axis.map((p): Pt => [p[0] - half, p[1]]),
      ...axis.map((p): Pt => [p[0] + half, p[1]]).reverse(),
    ]),
    `fill="${mix(W.pale, W.sand, 0.25)}" ${OUT}`,
  );
  // A browning lesion where the water mould meets the root.
  root.path(
    blob(r, rx + half * 0.4, at.oomycete.y * h, half * 0.7, u * 0.05, 0.2, 8),
    `fill="${mix(W.clay, W.oxide, 0.3)}" opacity="0.7"`,
  );

  const grain = grains(r, w, h, u, 55, (p, rad) => {
    const near = (q: { x: number; y: number }, d: number) =>
      Math.hypot(p[0] - q.x * w, p[1] - q.y * h) < u * d + rad;
    return (
      Math.abs(p[0] - rx) > half + rad + u * 0.03 &&
      !near(at.oospores, 0.08) &&
      !near(at.cyst, 0.08) &&
      !near(at.sclerotium, 0.08) &&
      !near(at.wet, 0.14)
    );
  });

  // Pathogens and their resting structures.
  const path = new Svg(w, h);
  const [ox, oy] = P(at.oomycete);
  for (let k = 0; k < 3; k++)
    thread(
      path,
      reach(r, [ox + u * 0.2, oy + range(r, -0.1, 0.1) * u], [rx + half, oy + (k - 1) * u * 0.03], 1),
      u * 0.006,
      mix(W.pale, W.film, 0.4),
    );
  const [sx, sy] = P(at.oospores);
  for (let k = 0; k < 7; k++) {
    const x = sx + range(r, -0.05, 0.05) * u;
    const y = sy + range(r, -0.04, 0.04) * u;
    const rad = u * range(r, 0.012, 0.017);
    path.circle(x, y, rad, `fill="${mix(W.sand, W.oxide, 0.3)}" ${OUT}`);
    path.circle(x, y, rad * 0.55, `fill="${mix(W.sand, W.pale, 0.5)}" stroke="${UI.ink}" stroke-width="0.8"`);
  }
  const [cx, cy] = P(at.cyst);
  path.path(
    smoothClosed([
      [cx - u * 0.06, cy],
      [cx - u * 0.02, cy - u * 0.035],
      [cx + u * 0.04, cy - u * 0.03],
      [cx + u * 0.07, cy],
      [cx + u * 0.04, cy + u * 0.03],
      [cx - u * 0.02, cy + u * 0.035],
    ]),
    `fill="${mix(W.loam, W.oxide, 0.35)}" ${OUT}`,
  );
  for (let k = 0; k < 4; k++)
    path.circle(
      cx - u * 0.025 + k * u * 0.018,
      cy + range(r, -0.01, 0.01) * u,
      u * 0.007,
      `fill="${W.pale}" opacity="0.6"`,
    );
  const [kx, ky] = P(at.sclerotium);
  shaded(path, blob(r, kx, ky, u * 0.05, u * 0.04, 0.3, 10), W.humus, mix(W.humus, W.loam, 0.5), W.dark);
  for (let k = 0; k < 3; k++)
    thread(
      path,
      reach(r, [kx, ky], [kx + range(r, -0.15, 0.15) * u, ky + range(r, -0.12, 0.12) * u], 1, 4),
      u * 0.004,
      mix(W.pale, W.sand, 0.4),
    );

  return {
    ground: W.dark,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.15, motion: "none" },
      { id: "water", svg: water.toString(scale), parallax: 0.6, motion: "none" },
      { id: "grains", svg: grain.toString(scale), parallax: 0.6, motion: "none" },
      { id: "root", svg: root.toString(scale), parallax: 0.6, motion: "none" },
      { id: "pathogens", svg: path.toString(scale), parallax: 0.6, motion: "none" },
    ],
    sprites: [],
    particles: [
      {
        id: "zoospores",
        kind: "mote",
        count: 10,
        colour: W.film,
        region: {
          x0: at.oomycete.x - 0.05,
          y0: at.oomycete.y - 0.08,
          x1: at.oomycete.x + 0.1,
          y1: at.oomycete.y + 0.08,
        },
        size: [1, 2],
        alpha: [0.3, 0.6],
        vx: -0.3,
        vy: 0,
        parallax: 0.6,
      },
    ],
  };
}

const SHIELD_L = {
  edge: 0.36,
  biofilm: { x: 0.42, y: 0.46 },
  rhizoctonia: { x: 0.72, y: 0.4 },
  bacillus: { x: 0.62, y: 0.74 },
};
const SHIELD_P: typeof SHIELD_L = {
  edge: 0.4,
  biofilm: { x: 0.46, y: 0.4 },
  rhizoctonia: { x: 0.74, y: 0.32 },
  bacillus: { x: 0.64, y: 0.58 },
};

export function c10Shield(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 29);
  const at = h > w ? SHIELD_P : SHIELD_L;
  const back = soil(w, h, 0.4);
  const ex = at.edge * w;
  const edgeX = (y: number) => ex + Math.sin((y / h) * 3) * u * 0.02;

  // The beet root's surface: a wall of cells from the left edge to `edge`.
  const root = new Svg(w, h);
  const edge: Pt[] = Array.from({ length: 25 }, (_, i): Pt => {
    const y = (i / 24) * (h + u * 0.2) - u * 0.1;
    return [edgeX(y), y];
  });
  root.path(
    poly([...edge, [-u * 0.1, h + u * 0.1], [-u * 0.1, -u * 0.1]]),
    `fill="${mix(W.pale, W.sand, 0.3)}" ${OUT}`,
  );
  const cell = u * 0.07;
  for (let y = 0; y < h + cell; y += cell * 0.6)
    for (let x = ((y / (cell * 0.6)) % 2) * cell * 0.5; x < edgeX(y) - cell * 0.6; x += cell)
      root.path(
        blob(r, x, y, cell * 0.45, cell * 0.27, 0.08, 8),
        `fill="none" stroke="${mix(W.sand, W.clay, 0.4)}" stroke-width="1" opacity="0.6"`,
      );

  const grain = grains(r, w, h, u, 45, (p, rad) => {
    const near = (q: { x: number; y: number }, d: number) =>
      Math.hypot(p[0] - q.x * w, p[1] - q.y * h) < u * d + rad;
    return p[0] - rad > edgeX(p[1]) + u * 0.06 && !near(at.rhizoctonia, 0.1) && !near(at.bacillus, 0.04);
  });

  // The film along the root: dashed, because it is a hypothesis.
  const film = new Svg(w, h);
  const filmPts = edge.filter((_, i) => i % 3 === 0).map((p): Pt => [p[0] + u * 0.03, p[1]]);
  film.path(
    smoothOpen(filmPts),
    `fill="none" stroke="${W.film}" stroke-width="${u * 0.03}" stroke-linecap="round" opacity="0.25"`,
  );
  film.path(smoothOpen(filmPts), `fill="none" stroke="${UI.ink}" stroke-width="1.5" stroke-dasharray="6 6"`);

  // Rhizoctonia: branching threads from the right that stop short of the film.
  const fungus = new Svg(w, h);
  const fy = at.rhizoctonia.y * h;
  for (let k = 0; k < 4; k++) {
    const start: Pt = [w + u * 0.05, fy + (k - 1.5) * u * 0.12];
    const pts = reach(r, start, [edgeX(fy) + u * 0.12, fy + (k - 1.5) * u * 0.06], 1, 6);
    thread(fungus, pts, u * 0.008, mix(W.sand, W.loam, 0.35));
    // Right-angle branches, the textbook Rhizoctonia mark.
    const b = pts[3]!;
    thread(
      fungus,
      [b, [b[0] - u * 0.01, b[1] + (k % 2 ? 1 : -1) * u * 0.08]],
      u * 0.006,
      mix(W.sand, W.loam, 0.35),
    );
  }

  // Bacillus on a grain below.
  const [bx, by] = [at.bacillus.x * w, at.bacillus.y * h];
  shaded(
    fungus,
    blob(r, bx, by + u * 0.06, u * 0.09, u * 0.05, 0.2, 9),
    W.sand,
    mix(W.sand, W.pale, 0.3),
    mix(W.sand, W.dark, 0.4),
  );

  const sprites: SpriteSpec[] = [];
  for (let k = 0; k < 14; k++) {
    const p = filmPts[1 + (k % 7)]!;
    sprites.push(
      bacterium(
        {
          id: `film-${k}`,
          x: p[0] + range(r, -0.015, 0.015) * u,
          y: p[1] + range(r, -0.05, 0.05) * u,
          motion: "breathe",
          phase: r(),
          parallax: 0.6,
          scale: scale * 2,
          rotation: Math.PI / 2 + range(r, -0.4, 0.4),
        },
        u * 0.02,
      ),
    );
  }
  for (let k = 0; k < 6; k++)
    sprites.push(
      bacterium(
        {
          id: `bacillus-${k}`,
          x: bx + range(r, -0.04, 0.04) * u,
          y: by + range(r, -0.015, 0.015) * u,
          motion: "breathe",
          phase: r(),
          parallax: 0.6,
          scale: scale * 2,
          rotation: r() * 3,
        },
        u * 0.024,
      ),
    );

  return {
    ground: W.dark,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.15, motion: "none" },
      { id: "grains", svg: grain.toString(scale), parallax: 0.6, motion: "none" },
      { id: "root", svg: root.toString(scale), parallax: 0.6, motion: "none" },
      { id: "film", svg: film.toString(scale), parallax: 0.6, motion: "none" },
      { id: "fungus", svg: fungus.toString(scale), parallax: 0.6, motion: "none" },
    ],
    sprites,
    particles: [],
  };
}
