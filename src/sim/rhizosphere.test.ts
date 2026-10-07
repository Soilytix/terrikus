import { describe, expect, it } from "vitest";
import { runWeb, WEB_ORGANISMS, type WebOrganism } from "./food-web";
import {
  accounted,
  activeIndex,
  EXUDED_SHARE,
  rootSettings,
  runBand,
  runRoot,
  type BandEnd,
} from "./rhizosphere";

const total = (l: Record<string, number>) => Object.values(l).reduce((a, b) => a + b, 0);
const SUBSETS: WebOrganism[][] = Array.from({ length: 2 ** WEB_ORGANISMS.length }, (_, mask) =>
  WEB_ORGANISMS.filter((_, i) => mask & (1 << i)),
);
const PLOTS = [
  ["planted", "low"],
  ["planted", "high"],
  ["bare", "low"],
] as const;

describe("root bench", () => {
  it.each(PLOTS.flatMap(([plot, end]) => (["moist", "dry"] as const).map((water) => ({ plot, end, water }))))(
    "conserves C and N exactly at every tick, for every removal set: %o",
    ({ plot, end, water }) => {
      for (const removed of SUBSETS) {
        const snaps = runWeb({ ...rootSettings(plot, end), water, removed }, 30);
        const [C, N] = [total(snaps[0]!.ledger.C), total(snaps[0]!.ledger.N)];
        for (const s of snaps) {
          expect(total(s.ledger.C)).toBe(C);
          expect(total(s.ledger.N)).toBe(N);
        }
      }
    },
  );

  it("carries C and N through exudate → bloom → grazing → uptake, 100.0 % accounted", () => {
    for (const end of ["low", "high"] as BandEnd[]) {
      const snaps = runRoot("planted", end, 20);
      const rules = new Set(
        snaps.flatMap((s) => s.transfers.filter((t) => t.amount > 0).map((t) => `${t.element}:${t.rule}`)),
      );
      for (const r of [
        "C:exudation",
        "N:exudation",
        "C:eat:bacteria-copio>food",
        "N:eat:bacteria-copio>food",
        "C:eat:amoeba>bacteria-copio",
        "N:eat:amoeba>bacteria-copio",
        "N:excretion:amoeba",
        "N:root-uptake",
      ])
        expect(rules.has(r), `${end} ${r}`).toBe(true);
      expect(accounted(snaps, 20)).toEqual({ C: 100, N: 100 });
    }
  });

  it("the top of the band feeds a bloom that grazing then cuts back", () => {
    const b = runRoot("planted", "high", 30).map((s) => s.ledger.C["bacteria-copio"]);
    const peak = Math.max(...b);
    expect(peak).toBeGreaterThan(b[0]! * 2);
    expect(b[30]!).toBeLessThan(peak * 0.6);
  });

  it("planted beats bare on dissolved C, microbial activity and root N at both ends of the band", () => {
    const bare = runRoot("bare", "low", 10)[10]!;
    const band = runBand(10);
    for (const snaps of [band.low, band.high]) {
      const p = snaps[10]!;
      expect(p.ledger.C.food).toBeGreaterThan(bare.ledger.C.food);
      expect(activeIndex(p)).toBeGreaterThan(activeIndex(bare));
      expect(p.ledger.N.plant).toBeGreaterThan(bare.ledger.N.plant);
    }
    expect(bare.ledger.N.plant).toBe(0);
  });

  it("more exudate means more bacteria: the band changes size, not direction", () => {
    const band = runBand(10);
    expect(band.high[10]!.ledger.C["bacteria-copio"]).toBeGreaterThan(
      band.low[10]!.ledger.C["bacteria-copio"],
    );
    expect(EXUDED_SHARE.low).toBeLessThan(EXUDED_SHARE.high);
  });

  it("near the root the fungi's share falls while their absolute biomass is higher than in bulk soil", () => {
    const bulk = runRoot("bare", "low", 10)[10]!.ledger;
    const share = (l: typeof bulk) => l.C["fungi-sap"] / WEB_ORGANISMS.reduce((a, o) => a + l.C[o], 0);
    for (const snaps of Object.values(runBand(10))) {
      const near = snaps[10]!.ledger;
      expect(share(near)).toBeLessThan(share(bulk));
      expect(near.C["fungi-sap"]).toBeGreaterThan(bulk.C["fungi-sap"]);
    }
  });
});
