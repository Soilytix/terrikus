/**
 * Seeded RNG for the music: one named stream per layer, so one layer's
 * randomness never shifts another's. Same seed and same scene sequence, same music.
 */
function hash(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

export function rng(seed: string, stream = "") {
  let a = hash(`${seed}:${stream}`);
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (lo: number, hi: number) => lo + next() * (hi - lo),
    int: (n: number) => Math.floor(next() * n),
    chance: (p: number) => next() < p,
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)]!,
    weighted<K extends string>(weights: Partial<Record<K, number>>): K {
      const entries = Object.entries(weights) as [K, number][];
      let r = next() * entries.reduce((s, [, w]) => s + w, 0);
      for (const [k, w] of entries) if ((r -= w) < 0) return k;
      return entries[entries.length - 1]![0];
    },
  };
}

export type Rng = ReturnType<typeof rng>;
