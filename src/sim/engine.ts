/**
 * Tick loop (spec §6). A bench supplies an initial ledger and a step function;
 * the engine runs it day by day, asserts conservation after every tick and
 * keeps one snapshot per day so the UI can scrub without re-running.
 */
import { assertConserved, cloneLedger, total, type Ledger, type Transfer } from "./ledger";

export interface Snapshot {
  day: number;
  ledger: Ledger;
  /** Transfers that happened during the tick that ended on this day. */
  transfers: Transfer[];
  /** Chemical energy still in organic matter, and heat released so far (same units). */
  energy: { organic: number; heat: number };
}

export interface BenchModel<S> {
  initial(): Ledger;
  /** Mutates the ledger by transfers only; returns them. `state` holds rounding carries. */
  step(ledger: Ledger, state: S, day: number): Transfer[];
  initialState(): S;
  energy(ledger: Ledger): { organic: number; heat: number };
}

/** Thrown in dev and test; the bench UI halts and says so in prod. */
export function run<S>(model: BenchModel<S>, days: number): Snapshot[] {
  if (days < 0 || days > 3650) throw new RangeError("timeline must be 0–3650 days");
  const ledger = model.initial();
  const expected = { C: total(ledger, "C"), N: total(ledger, "N") };
  const state = model.initialState();
  const snapshots: Snapshot[] = [
    { day: 0, ledger: cloneLedger(ledger), transfers: [], energy: model.energy(ledger) },
  ];
  for (let day = 1; day <= days; day++) {
    const transfers = model.step(ledger, state, day);
    assertConserved(ledger, expected);
    snapshots.push({ day, ledger: cloneLedger(ledger), transfers, energy: model.energy(ledger) });
  }
  return snapshots;
}
