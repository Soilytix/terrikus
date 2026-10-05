import { describe, expect, it } from "vitest";
import { run } from "./engine";
import { total, transfer, emptyLedger, assertConserved, ConservationError } from "./ledger";
import { DAYS, INITIAL_LITTER, leafJar, type LeverSettings } from "./benches/leaf-jar";
import { measureCo2Flux } from "./measure";

const WATERS = ["dry", "moist", "waterlogged"] as const;
const TEMPS = ["cool", "mild"] as const;
const RESIDUES = ["leaf", "straw", "wood"] as const;
const ALL: LeverSettings[] = WATERS.flatMap((water) =>
  TEMPS.flatMap((temperature) => RESIDUES.map((residue) => ({ water, temperature, residue }))),
);

const litterLost = (levers: LeverSettings, day = 180) =>
  INITIAL_LITTER - (run(leafJar(levers), day)[day]?.ledger.C.L ?? NaN);
const base: LeverSettings = { water: "moist", temperature: "mild", residue: "leaf" };

describe("ledger", () => {
  it("clamps transfers to what the pool holds and refuses fractions", () => {
    const l = emptyLedger();
    l.C.L = 5;
    expect(transfer(l, "C", "L", "D", 9)).toBe(5);
    expect(l.C.L).toBe(0);
    expect(() => transfer(l, "C", "D", "B", 0.5)).toThrow(ConservationError);
  });

  it("detects a leak", () => {
    const l = emptyLedger();
    l.C.L = 10;
    l.C.co2Out -= 1;
    expect(() => assertConserved(l, { C: 10, N: 0 })).toThrow(ConservationError);
  });
});

describe("leaf jar", () => {
  it("has 18 lever combinations", () => expect(ALL).toHaveLength(18));

  it.each(ALL)("conserves carbon exactly at every tick: %o", (levers) => {
    const snaps = run(leafJar(levers), DAYS);
    for (const s of snaps) {
      expect(total(s.ledger, "C")).toBe(INITIAL_LITTER);
      for (const v of Object.values(s.ledger.C)) expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it.each(ALL)("heat only grows and organic energy only falls: %o", (levers) => {
    const snaps = run(leafJar(levers), DAYS);
    for (let i = 1; i < snaps.length; i++) {
      const [prev, now] = [snaps[i - 1]!, snaps[i]!];
      expect(now.energy.heat).toBeGreaterThanOrEqual(prev.energy.heat);
      expect(now.energy.organic).toBeLessThanOrEqual(prev.energy.organic);
    }
  });

  it("is deterministic: identical levers give identical trajectories", () => {
    for (const levers of ALL) expect(run(leafJar(levers), DAYS)).toEqual(run(leafJar(levers), DAYS));
  });

  it("noise lives only in measurement: seeds change the reading, not the state", () => {
    const snaps = run(leafJar(base), DAYS);
    const seeds = Array.from({ length: 10 }, (_, i) => i + 1);
    const readings = new Set(seeds.map((s) => measureCo2Flux(snaps, 60, s).value.toFixed(6)));
    expect(readings.size).toBeGreaterThan(1);
    expect(run(leafJar(base), DAYS)).toEqual(snaps);
  });

  it("moist decomposes faster than dry", () => {
    expect(litterLost(base)).toBeGreaterThan(litterLost({ ...base, water: "dry" }));
  });

  it("waterlogged decomposes slower than moist (oxygen runs short)", () => {
    expect(litterLost({ ...base, water: "waterlogged" })).toBeLessThan(litterLost(base));
  });

  it("leaf > straw > wood", () => {
    const [leaf, straw, wood] = RESIDUES.map((residue) => litterLost({ ...base, residue }));
    expect(leaf).toBeGreaterThan(straw!);
    expect(straw).toBeGreaterThan(wood!);
  });

  it("mild > cool", () => {
    expect(litterLost(base)).toBeGreaterThan(litterLost({ ...base, temperature: "cool" }));
  });

  it("most lost carbon leaves as CO₂, some persists on minerals", () => {
    const end = run(leafJar(base), DAYS)[DAYS]!.ledger.C;
    const lost = INITIAL_LITTER - end.L;
    expect(end.co2Out / lost).toBeGreaterThan(0.5);
    expect(end.M).toBeGreaterThan(0);
  });
});
