/** Seeded value noise and fBm, deterministic across browser and Node. */
import { hashSeed, mulberry32 } from "../../sim/rng";

export type Rng = () => number;
export const rngFor = (seed: number, ...salt: number[]): Rng => mulberry32(hashSeed(seed, ...salt));

/**
 * `x ** p` from + − × ÷ only, so every engine and JIT tier rounds it the same way
 * (V8's own pow does not, and baked plates must match the runtime painter).
 * Integer `p` takes any `x`; fractional `p` needs `x >= 0`.
 */
export function pow(x: number, p: number): number {
  let n = Math.trunc(p);
  let out = 1;
  for (let b = n < 0 ? 1 / x : x, k = Math.abs(n); k > 0; k--) out *= b;
  const f = p - n;
  if (f === 0) return out;
  if (x <= 0) return x === 0 && p > 0 ? 0 : NaN;
  // ln x = n ln 2 + 2 atanh((m − 1)/(m + 1)), m in [1, 2).
  let m = x;
  n = 0;
  for (; m >= 2; n++) m /= 2;
  for (; m < 1; n--) m *= 2;
  const s = (m - 1) / (m + 1);
  let ln = 0;
  for (let i = 1, t = s; i < 40; i += 2, t *= s * s) ln += t / i;
  // e^y = 2^j e^t, |t| <= ln 2 / 2.
  const y = f * (n * Math.LN2 + 2 * ln);
  const j = Math.round(y / Math.LN2);
  const t = y - j * Math.LN2;
  let e = 1;
  for (let i = 30; i > 0; i--) e = 1 + (t * e) / i;
  for (let k = Math.abs(j); k > 0; k--) e = j < 0 ? e / 2 : e * 2;
  return out * e;
}

export function noise2(seed: number): (x: number, y: number) => number {
  const size = 256;
  const r = rngFor(seed, 0x9e37);
  const values = Float32Array.from({ length: size * size }, () => r());
  const at = (ix: number, iy: number) =>
    values[(((iy % size) + size) % size) * size + (((ix % size) + size) % size)] ?? 0;
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x, y) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = smooth(x - ix);
    const fy = smooth(y - iy);
    const a = at(ix, iy);
    const b = at(ix + 1, iy);
    const c = at(ix, iy + 1);
    const d = at(ix + 1, iy + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

/** Fractal noise in [0, 1). */
export function fbm(seed: number, octaves = 4): (x: number, y: number) => number {
  const n = noise2(seed);
  return (x, y) => {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    let f = 1;
    for (let o = 0; o < octaves; o++) {
      sum += n(x * f + o * 17.3, y * f - o * 9.1) * amp;
      norm += amp;
      amp *= 0.5;
      f *= 2;
    }
    return sum / norm;
  };
}
