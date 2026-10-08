import { describe, expect, it } from "vitest";
import {
  BLOOM_P,
  P_START,
  SALINE_EC,
  SODIC_ESP,
  TAGGED,
  YEARS,
  bloomed,
  boundShare,
  irrigate,
  splash,
  storm,
  valley,
  weeksLater,
  type Cover,
  type Strip,
} from "./hillslope";

const COVERS: Cover[] = ["bare", "thin", "full"];
const STRIPS: Strip[] = ["none", "strip"];
const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

describe("splash", () => {
  it("cover absorbs the drops: less soil breaks loose as cover rises, under any rain", () => {
    for (const rain of ["gentle", "intense"] as const) {
      const loose = COVERS.map((c) => splash(c, rain).loose);
      expect(loose[0]).toBeGreaterThan(loose[1]!);
      expect(loose[1]).toBeGreaterThan(loose[2]!);
    }
    expect(splash("bare", "intense").loose).toBeGreaterThan(splash("bare", "gentle").loose);
  });

  it("a storm's loss off bare soil lowers the surface by under a millimetre", () => {
    const s = splash("bare", "intense");
    expect(s.tPerHa).toBeGreaterThan(10);
    expect(s.mm).toBeLessThan(1);
  });
});

describe("storm on the slope", () => {
  it("conserves soil and phosphorus exactly over three storms and the weeks after, for every lever", () => {
    for (const c of COVERS)
      for (const s of STRIPS) {
        let v = valley();
        for (let k = 0; k < 3; k++) {
          v = weeksLater(storm(v, c, s));
          expect(sum(v.soil)).toBe(TAGGED);
          expect(sum(v.p)).toBe(P_START);
          for (const n of [...Object.values(v.soil), ...Object.values(v.p)]) {
            expect(Number.isInteger(n)).toBe(true);
            expect(n).toBeGreaterThanOrEqual(0);
          }
        }
      }
  });

  it("cover keeps soil and P on the slope; a grass strip keeps them out of the river", () => {
    const river = (c: Cover, s: Strip) => storm(valley(), c, s);
    expect(river("bare", "none").soil.river).toBeGreaterThan(river("full", "none").soil.river);
    expect(river("bare", "none").p.river).toBeGreaterThan(river("full", "none").p.river);
    expect(river("bare", "strip").soil.river).toBeLessThan(river("bare", "none").soil.river);
    expect(river("bare", "strip").soil.foot).toBeGreaterThan(river("bare", "none").soil.foot);
  });

  it("P leaves the slope on particles, not dissolved like nitrate (M18)", () => {
    expect(boundShare(storm(valley(), "bare", "none"))).toBeGreaterThan(90);
  });

  it("the eroded soil is richer in P than the slope it left", () => {
    const v = storm(valley(), "bare", "none");
    expect(v.p.river / v.soil.river).toBeGreaterThan(P_START / TAGGED);
  });

  it("blooms weeks later off a bare slope, not off a covered one", () => {
    expect(storm(valley(), "bare", "none").p.river).toBeGreaterThanOrEqual(BLOOM_P);
    expect(bloomed(weeksLater(storm(valley(), "bare", "none")))).toBe(true);
    expect(bloomed(weeksLater(storm(valley(), "full", "none")))).toBe(false);
    expect(bloomed(storm(valley(), "bare", "none"))).toBe(false);
  });
});

describe("irrigating the dry valley", () => {
  const all = (["none", "drains"] as const).flatMap((d) =>
    (["normal", "extra"] as const).map((w) => [d, w, irrigate(d, w)] as const),
  );

  it("conserves salt exactly every year, for every lever", () => {
    for (const [, , run] of all) {
      expect(run).toHaveLength(YEARS + 1);
      const total = sum(run[0]!.pools);
      for (const y of run) {
        expect(sum(y.pools)).toBe(total);
        for (const n of Object.values(y.pools)) expect(Number.isInteger(n) && n >= 0).toBe(true);
      }
    }
  });

  it("without drainage salinity climbs past the saline line, the soil turns sodic and yield falls", () => {
    for (const w of ["normal", "extra"] as const) {
      const end = irrigate("none", w).at(-1)!;
      expect(end.ec).toBeGreaterThan(SALINE_EC);
      expect(end.esp).toBeGreaterThan(SODIC_ESP);
      expect(end.yield).toBeLessThan(irrigate("drains", w).at(-1)!.yield);
      expect(end.infiltration).toBeLessThan(100);
    }
  });

  it("more water lowers salinity only where it can drain away", () => {
    const at = (d: "none" | "drains", w: "normal" | "extra") => irrigate(d, w).at(-1)!.ec;
    expect(at("drains", "extra")).toBeLessThan(at("drains", "normal"));
    expect(at("drains", "extra")).toBeLessThanOrEqual(SALINE_EC);
    expect(at("none", "extra")).toBeGreaterThan(at("none", "normal"));
  });

  it("without drainage the water table rises; with drains it holds", () => {
    expect(irrigate("none", "normal").at(-1)!.table).toBeLessThan(irrigate("none", "normal")[0]!.table);
    expect(irrigate("drains", "extra").at(-1)!.table).toBe(irrigate("drains", "extra")[0]!.table);
  });
});
