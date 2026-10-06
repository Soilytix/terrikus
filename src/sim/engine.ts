/**
 * Tick loop (spec §6). A bench supplies an initial ledger and a step function;
 * the engine runs it day by day, asserts conservation after every tick and
 * keeps one snapshot per day so the UI can scrub without re-running.
 */
import { assertConserved, cloneLedger, ConservationError, total, type Ledger, type Transfer } from "./ledger";

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
    const start = cloneLedger(ledger);
    const transfers = model.step(ledger, state, day);
    assertConserved(ledger, expected);
    assertNoOverdraw(start, transfers);
    snapshots.push({ day, ledger: cloneLedger(ledger), transfers, energy: model.energy(ledger) });
  }
  return snapshots;
}

/** `transfer` clamps silently, so a pool asked for more than it held would lose intended flux unseen. */
function assertNoOverdraw(start: Ledger, transfers: Transfer[]): void {
  const out = new Map<string, number>();
  for (const t of transfers) {
    const key = `${t.element}.${t.from}`;
    const sum = (out.get(key) ?? 0) + t.amount;
    out.set(key, sum);
    const held = (start[t.element] as Record<string, number>)[t.from] ?? 0;
    if (sum > held) throw new ConservationError(`${key} outflow ${sum} > start-of-tick ${held}`);
  }
}
