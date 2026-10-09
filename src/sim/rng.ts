/**
 * mulberry32: a tiny seeded PRNG. Used by the measurement layer, the painter and
 * particle jitter, never by true-state rules (spec §6.1 invariant 5).
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mix several integers into one seed (for per-day or per-object streams). */
export function hashSeed(...parts: number[]): number {
  let h = 2166136261 >>> 0;
  for (const p of parts) {
    h ^= p >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
    h ^= h >>> 13;
  }
  return h >>> 0;
}

/** A fixed shuffle seeded by the items' ids, so authored order (answer first) never shows but each list always looks the same. */
export function seededOrder<T extends { id: string }>(items: readonly T[]): T[] {
  let seed = 0;
  for (const it of items) for (let i = 0; i < it.id.length; i++) seed = hashSeed(seed, it.id.charCodeAt(i));
  const rand = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
