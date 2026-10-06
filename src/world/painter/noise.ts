/** Seeded value noise and fBm, deterministic across browser and Node. */
import { hashSeed, mulberry32 } from "../../sim/rng";

export type Rng = () => number;
export const rngFor = (seed: number, ...salt: number[]): Rng => mulberry32(hashSeed(seed, ...salt));

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
