import { describe, expect, it } from "vitest";
import { run, type BenchModel } from "./engine";
import { ConservationError, emptyLedger, transfer, type Transfer } from "./ledger";

/** Two rules each ask for 60 % of the litter; the second is clamped by `transfer`. */
const overDraining: BenchModel<null> = {
  initial() {
    const l = emptyLedger();
    l.C.L = 100;
    return l;
  },
  initialState: () => null,
  energy: (l) => ({ organic: l.C.L + l.C.D, heat: l.C.co2Out }),
  step(l) {
    const ask = Math.ceil(l.C.L * 0.6);
    const out: Transfer[] = [];
    for (const to of ["D", "co2Out"] as const) {
      transfer(l, "C", "L", to, ask);
      out.push({ element: "C", from: "L", to, amount: ask, rule: "fixture" });
    }
    return out;
  },
};

describe("engine", () => {
  it("throws when a pool's outflow in a tick exceeds what it held at the start", () => {
    expect(() => run(overDraining, 1)).toThrow(ConservationError);
  });
});
