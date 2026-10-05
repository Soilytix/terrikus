/**
 * Integer double-entry ledger (spec §6.1). Every change is a transfer between
 * two pools of the same element, so the per-element total over all pools,
 * boundary sinks included, never changes. `assertConserved` checks it.
 */
export type Element = "C" | "N";

/** Carbon pools of the leaf jar; nitrogen pools exist but no N rules ship yet (T18). */
export const POOLS = {
  C: ["L", "D", "B", "M", "co2Out"],
  N: ["L", "D", "B", "M", "NH4", "NO3", "n2Out"],
} as const;

export type PoolOf<E extends Element> = (typeof POOLS)[E][number];
export type Ledger = { [E in Element]: Record<PoolOf<E>, number> };

export interface Transfer {
  element: Element;
  from: string;
  to: string;
  amount: number;
  rule: string;
}

export class ConservationError extends Error {}

export function emptyLedger(): Ledger {
  return {
    C: { L: 0, D: 0, B: 0, M: 0, co2Out: 0 },
    N: { L: 0, D: 0, B: 0, M: 0, NH4: 0, NO3: 0, n2Out: 0 },
  };
}

export function cloneLedger(l: Ledger): Ledger {
  return { C: { ...l.C }, N: { ...l.N } };
}

export function total(l: Ledger, e: Element): number {
  return Object.values(l[e]).reduce((a: number, b) => a + (b as number), 0);
}

/**
 * Move `amount` units between two pools. The amount is clamped to [0, from]
 * (invariant 3) and must be an integer; returns the amount actually moved.
 */
export function transfer<E extends Element>(
  l: Ledger,
  element: E,
  from: PoolOf<E>,
  to: PoolOf<E>,
  amount: number,
): number {
  if (!Number.isInteger(amount)) throw new ConservationError(`non-integer transfer ${amount}`);
  const pools = l[element] as Record<string, number>;
  const available = pools[from] ?? 0;
  const moved = Math.max(0, Math.min(amount, available));
  pools[from] = available - moved;
  pools[to] = (pools[to] ?? 0) + moved;
  return moved;
}

export function assertConserved(l: Ledger, expected: { [E in Element]: number }): void {
  for (const e of ["C", "N"] as const) {
    const t = total(l, e);
    if (t !== expected[e]) throw new ConservationError(`${e} total ${t} ≠ ${expected[e]}`);
    for (const [pool, v] of Object.entries(l[e])) {
      if ((v as number) < 0 || !Number.isInteger(v)) throw new ConservationError(`${e}.${pool} = ${v}`);
    }
  }
}
