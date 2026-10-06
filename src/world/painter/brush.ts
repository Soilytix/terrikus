/**
 * Brush primitives for the seeded painter (art-direction §6.1): stroke fields,
 * stipple, irregular blobs and paper grain. Pure string output, no DOM.
 */
import { W } from "../../styles/scene";
import { mix } from "./color";
import { fbm, rngFor, type Rng } from "./noise";
import { Svg, smoothClosed, smoothOpen, type Pt } from "./svg";

export interface Ctx {
  w: number;
  h: number;
  /** min(w, h): sizes scale with it so plates look right on phones and desktops. */
  u: number;
  seed: number;
  rng: Rng;
  noise: (x: number, y: number) => number;
}

export function ctx(seed: number, w: number, h: number): Ctx {
  return { w, h, u: Math.min(w, h), seed, rng: rngFor(seed, 1), noise: fbm(seed, 4) };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const pick = <T>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length) % xs.length] as T;
export const range = (r: Rng, a: number, b: number) => a + (b - a) * r();

/** An irregular, smooth closed blob (grain, crumb, leaf mass). */
export function blob(r: Rng, cx: number, cy: number, rx: number, ry: number, rough = 0.25, n = 9): string {
  const pts: Pt[] = [];
  const rot = r() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * 2 * rough;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smoothClosed(pts);
}

/** A faceted grain: fewer, sharper points, then smoothed a little. */
export function grain(r: Rng, cx: number, cy: number, rad: number): string {
  const n = 6 + Math.floor(r() * 4);
  return blob(r, cx, cy, rad * range(r, 0.85, 1.15), rad * range(r, 0.7, 1), 0.18, n);
}

/** A ridge line across the plate, as a closed fill down to `bottom`. */
export function ridge(c: Ctx, y0: number, amp: number, freq: number, salt: number, bottom = c.h): string {
  const n = fbm(c.seed + salt, 5);
  const pts: Pt[] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * c.w;
    pts.push([x, y0 + (n(i * freq * 0.1, salt) - 0.5) * 2 * amp]);
  }
  return (
    smoothOpen([[-2, pts[0]![1]], ...pts, [c.w + 2, pts[pts.length - 1]![1]]]) +
    `L${c.w + 2},${bottom}L-2,${bottom}Z`
  );
}

/** Paper grain overlay (4–6 %), via SVG turbulence: rastered once per plate. */
export function paperGrain(s: Svg, seed: number, opacity = 0.05): void {
  const id = s.id("grain");
  s.def(
    `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed % 997}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="${opacity * 12}"/></feComponentTransfer></filter>`,
  );
  s.rect(0, 0, s.w, s.h, `filter="url(#${id})" opacity="${opacity * 6}"`);
}

/** Gaussian blur filter id. */
export function blurDef(s: Svg, sd: number): string {
  const id = s.id("blur");
  s.def(
    `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${sd}"/></filter>`,
  );
  return id;
}

export function linear(s: Svg, stops: [number, string, number?][], x1 = 0, y1 = 0, x2 = 0, y2 = 1): string {
  const id = s.id("lg");
  s.def(
    `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` +
      stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join("") +
      "</linearGradient>",
  );
  return id;
}

export function radial(s: Svg, stops: [number, string, number?][], cx = 0.5, cy = 0.5, r = 0.5): string {
  const id = s.id("rg");
  s.def(
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">` +
      stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join("") +
      "</radialGradient>",
  );
  return id;
}

/** Stipple: dots whose density follows `density(x, y)` in 0..1. Organic matter reads as density. */
export function stipple(
  s: Svg,
  c: Ctx,
  r: Rng,
  n: number,
  region: { x0: number; y0: number; x1: number; y1: number },
  colours: string[],
  size: [number, number],
  density: (x: number, y: number) => number = () => 1,
  opacity: [number, number] = [0.5, 0.9],
): void {
  let placed = 0;
  for (let tries = 0; placed < n && tries < n * 4; tries++) {
    const x = lerp(region.x0, region.x1, r()) * c.w;
    const y = lerp(region.y0, region.y1, r()) * c.h;
    if (r() > density(x / c.w, y / c.h)) continue;
    s.circle(
      x,
      y,
      range(r, size[0], size[1]),
      `fill="${pick(r, colours)}" opacity="${range(r, opacity[0], opacity[1]).toFixed(2)}"`,
    );
    placed++;
  }
}

/** Short painterly strokes along a flow angle field. */
export function strokes(
  s: Svg,
  c: Ctx,
  r: Rng,
  n: number,
  region: { x0: number; y0: number; x1: number; y1: number },
  colours: string[],
  len: [number, number],
  width: [number, number],
  angle: (x: number, y: number) => number,
  opacity: [number, number] = [0.25, 0.6],
): void {
  for (let i = 0; i < n; i++) {
    const x = lerp(region.x0, region.x1, r()) * c.w;
    const y = lerp(region.y0, region.y1, r()) * c.h;
    const a = angle(x / c.w, y / c.h);
    const l = range(r, len[0], len[1]);
    const bend = (r() - 0.5) * l * 0.3;
    const dx = Math.cos(a) * l;
    const dy = Math.sin(a) * l;
    const mx = x + dx / 2 - Math.sin(a) * bend;
    const my = y + dy / 2 + Math.cos(a) * bend;
    s.path(
      `M${x.toFixed(1)},${y.toFixed(1)}Q${mx.toFixed(1)},${my.toFixed(1)} ${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`,
      `fill="none" stroke="${pick(r, colours)}" stroke-width="${range(r, width[0], width[1]).toFixed(1)}" stroke-linecap="round" opacity="${range(r, opacity[0], opacity[1]).toFixed(2)}"`,
    );
  }
}

/** A shaded body: base fill, a light rim toward the sun (upper right), a shadow below. */
export function shaded(
  s: Svg,
  d: string,
  base: string,
  light: string,
  shadow: string,
  lightAngle = -0.8,
): void {
  const gid = s.id("sh");
  const dx = Math.cos(lightAngle);
  const dy = Math.sin(lightAngle);
  s.def(
    `<linearGradient id="${gid}" x1="${(0.5 - dx / 2).toFixed(2)}" y1="${(0.5 - dy / 2).toFixed(2)}" x2="${(0.5 + dx / 2).toFixed(2)}" y2="${(0.5 + dy / 2).toFixed(2)}"><stop offset="0" stop-color="${shadow}"/><stop offset="0.55" stop-color="${base}"/><stop offset="1" stop-color="${light}"/></linearGradient>`,
  );
  s.path(d, `fill="url(#${gid})"`);
}

/** Ink outline in the illustration register: 1.5 px, deep shadow tone (art-direction §6.2). */
export const INK = mix(W.dark, W.topsoil, 0.35);
