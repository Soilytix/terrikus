/** Chapter 1 grain ruler: sand like marbles, silt like flour, clay as stacked platelets. */
import { W } from "../../../styles/scene";
import { blob, grain, linear, range, shaded, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg, poly, type Pt } from "../svg";
import type { RecipeOut } from "./index";

/** Tray centres in plate units; scene anchors match. */
const TRAYS = [0.2, 0.5, 0.8];
const TRAY_Y = 0.55;

export function c1GrainRuler(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 11);
  const rad = Math.min(u * 0.2, w * 0.14);

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, W.skyLow],
      [1, mix(W.pale, W.sand, 0.35)],
    ])})"`,
  );
  // The ruler: a pale strip with millimetre ticks, no numbers (text lives in the DOM).
  const ry = 0.82 * h;
  back.rect(0, ry - u * 0.03, w, u * 0.06, `fill="${mix(W.pale, W.sand, 0.15)}" stroke="${W.stone1}"`);
  for (let k = 0; k * u * 0.02 < w; k++) {
    const x = k * u * 0.02;
    const long = k % 10 === 0 ? 0.025 : k % 5 === 0 ? 0.017 : 0.01;
    back.path(
      `M${x},${ry - u * 0.03}L${x},${ry - u * (0.03 - long)}`,
      `stroke="${W.stone2}" stroke-width="1"`,
    );
  }

  const trays = new Svg(w, h);
  for (const tx of TRAYS) {
    const cx = tx * w;
    const cy = TRAY_Y * h;
    trays.path(
      blob(r, cx, cy + rad * 0.08, rad * 1.04, rad * 0.98, 0.04, 14),
      `fill="${W.stone2}" opacity="0.5"`,
    );
    shaded(
      trays,
      blob(r, cx, cy, rad, rad * 0.94, 0.04, 14),
      mix(W.topsoil, W.dark, 0.2),
      mix(W.topsoil, W.pale, 0.2),
      W.dark,
    );
  }

  const fill = new Svg(w, h);
  // Sand: a handful of rounded, shaded grains.
  const [sx, mx, cx] = TRAYS.map((t) => t * w) as [number, number, number];
  const cy = TRAY_Y * h;
  const placed: Pt[] = [];
  for (let tries = 0; tries < 400 && placed.length < 9; tries++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * rad * 0.62;
    const p: Pt = [sx + Math.cos(a) * d, cy + Math.sin(a) * d];
    if (placed.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < rad * 0.48)) continue;
    placed.push(p);
    const tone = mix(W.sand, W.subsoil, range(r, 0, 0.5));
    shaded(fill, grain(r, p[0], p[1], rad * 0.22), tone, mix(tone, W.pale, 0.5), mix(tone, W.dark, 0.5));
  }
  // Silt: flour, a fine stipple.
  stipple(
    fill,
    c,
    r,
    400,
    { x0: (mx - rad) / w, y0: (cy - rad) / h, x1: (mx + rad) / w, y1: (cy + rad) / h },
    [mix(W.sand, W.pale, 0.4), mix(W.sand, W.pale, 0.2), W.sand],
    [u * 0.002, u * 0.005],
    (x, y) => (Math.hypot(x * w - mx, y * h - cy) < rad * 0.85 ? 1 : 0),
  );
  // Clay: thin platelets in stacks, like sheets of paper.
  for (let k = 0; k < 6; k++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * rad * 0.5;
    const px = cx + Math.cos(a) * d;
    const py = cy + Math.sin(a) * d;
    const rot = range(r, -0.6, 0.6);
    const len = rad * range(r, 0.35, 0.55);
    const th = rad * 0.035;
    for (let s = 0; s < 6; s++) {
      const off = (s - 3) * th * 1.5;
      const corners: Pt[] = [
        [-len / 2, off],
        [len / 2, off],
        [len / 2, off + th],
        [-len / 2, off + th],
      ].map(([x, y]) => [
        px + x! * Math.cos(rot) - y! * Math.sin(rot),
        py + x! * Math.sin(rot) + y! * Math.cos(rot),
      ]);
      fill.path(
        poly(corners),
        `fill="${mix(W.clay, W.pale, s * 0.06)}" stroke="${mix(W.clay, W.dark, 0.5)}" stroke-width="0.6"`,
      );
    }
  }

  return {
    ground: W.skyLow,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0, motion: "none" },
      { id: "trays", svg: trays.toString(scale), parallax: 0.3, motion: "none" },
      { id: "fill", svg: fill.toString(scale), parallax: 0.3, motion: "none" },
    ],
    sprites: [],
    particles: [],
  };
}
