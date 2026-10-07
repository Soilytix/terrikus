import { describe, expect, it } from "vitest";
import { run } from "./engine";
import { total } from "./ledger";
import { measureNitrateProduction } from "./measure";
import { mineralN } from "./nitrogen";
import {
  accountedN,
  DAYS,
  DEFAULT_STRAW,
  handoffs,
  incubation,
  INCUBATION_DAY,
  LEVERS,
  lostN,
  strawN,
  type StrawLevers,
} from "./benches/straw-n";

const keys = <K extends keyof typeof LEVERS>(k: K) => Object.keys(LEVERS[k]) as StrawLevers[K][];
const ALL: StrawLevers[] = keys("residue").flatMap((residue) =>
  keys("mineral").flatMap((mineral) =>
    keys("rain").flatMap((rain) => keys("cover").map((cover) => ({ residue, mineral, rain, cover }))),
  ),
);
const at = (levers: Partial<StrawLevers>, days = DAYS) => run(strawN({ ...DEFAULT_STRAW, ...levers }), days);

describe("straw-n bench", () => {
  it.each(ALL)("conserves C and N at every tick and accounts for 100.0 % of N: %o", (levers) => {
    const snaps = run(strawN(levers), DAYS);
    const first = snaps[0]!.ledger;
    for (const s of snaps) {
      expect(total(s.ledger, "C")).toBe(total(first, "C"));
      expect(total(s.ledger, "N")).toBe(total(first, "N"));
    }
    expect(accountedN(first, snaps[DAYS]!.ledger).toFixed(1)).toBe("100.0");
  });

  it("most soil N is organic, not available", () => {
    const l = at({})[0]!.ledger;
    expect(mineralN(l)).toBeLessThan(total(l, "N") * 0.05);
  });

  it("straw dips plant-available N and the crop's uptake against beet tops, then the dip eases", () => {
    const straw = at({ residue: "straw" });
    const tops = at({ residue: "beet-tops" });
    const uptake = (s: typeof straw, d: number) => s[d]!.ledger.N.plant - s[d - 30]!.ledger.N.plant;
    expect(mineralN(straw[60]!.ledger)).toBeLessThan(mineralN(straw[0]!.ledger));
    expect(mineralN(straw[60]!.ledger)).toBeLessThan(mineralN(tops[60]!.ledger));
    expect(uptake(straw, 60)).toBeLessThan(uptake(tops, 60));
    // Immobilised N sits in microbes (borrowed), and the crop's uptake picks up again.
    expect(straw[60]!.ledger.N.B).toBeGreaterThan(straw[0]!.ledger.N.B);
    const low = Math.min(...[60, 90, 120].map((d) => uptake(straw, d)));
    expect(uptake(straw, DAYS)).toBeGreaterThan(low);
  });

  it("heavy rain on bare soil loses N three ways: drain, gas and NH₃", () => {
    const wet = at({ rain: "wet", cover: "bare", mineral: "some" });
    const h = handoffs(wet.map((s) => s.transfers));
    expect(h.leaching).toBeGreaterThan(0);
    expect(h.denitrification).toBeGreaterThan(0);
    expect(h.volatilisation).toBeGreaterThan(0);
    const dry = at({ rain: "dry", cover: "bare", mineral: "some" });
    expect(lostN(wet[DAYS]!.ledger)).toBeGreaterThan(lostN(dry[DAYS]!.ledger));
  });

  it("a crop takes up nitrate and leaves less to leach", () => {
    const bare = at({ rain: "wet", cover: "bare", mineral: "some" })[DAYS]!.ledger;
    const crop = at({ rain: "wet", cover: "crop", mineral: "some" })[DAYS]!.ledger;
    expect(crop.N.plant).toBeGreaterThan(0);
    expect(bare.N.plant).toBe(0);
    expect(crop.N.drainage).toBeLessThan(bare.N.drainage);
  });

  it("gene ≠ rate: the incubations differ in rate though the qPCR readings overlap", () => {
    const rate = (residue: StrawLevers["residue"]) =>
      measureNitrateProduction(run(strawN(incubation(residue)), 60), INCUBATION_DAY, 9);
    const [straw, tops] = [rate("straw"), rate("beet-tops")];
    expect(straw.value + straw.band).toBeLessThan(tops.value - tops.band);
    expect(straw.value).toBeLessThan(0.5);
  });

  it("is deterministic", () => {
    expect(at({ rain: "wet" })).toEqual(at({ rain: "wet" }));
  });
});
