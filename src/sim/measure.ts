/**
 * Minimal measurement layer for the Scientist lens (full instruments are T26).
 * Reads the true state and adds seeded noise; the noise is labelled as such.
 */
import type { Snapshot } from "./engine";
import { hashSeed, mulberry32 } from "./rng";

export interface Measured {
  value: number;
  /** Half-width of the ± band. */
  band: number;
}

/** Daily CO₂-C flux (units per day) averaged over a week, ±10 % seeded noise; null before the first week. */
export function measureCo2Flux(snapshots: Snapshot[], day: number, seed: number): Measured | null {
  if (day < 7) return null;
  const d = Math.min(day, snapshots.length - 1);
  const now = snapshots[d]?.ledger.C.co2Out ?? 0;
  const before = snapshots[d - 7]?.ledger.C.co2Out ?? 0;
  const trueFlux = (now - before) / 7;
  const rng = mulberry32(hashSeed(seed, d));
  const noise = (rng() - 0.5) * 0.2;
  return { value: trueFlux * (1 + noise), band: Math.max(0.5, trueFlux * 0.1) };
}

/** Derived, not measured: litter mass loss ÷ time, from two weighings. */
export function decompositionRate(snapshots: Snapshot[], day: number): number {
  const d = Math.max(1, Math.min(day, snapshots.length - 1));
  const start = snapshots[0]?.ledger.C.L ?? 0;
  const now = snapshots[d]?.ledger.C.L ?? 0;
  return (start - now) / d;
}
