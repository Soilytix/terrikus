import { describe, expect, it } from "vitest";
import {
  AVAILABILITY,
  CATIONS,
  CHARGE,
  add,
  aluminium,
  assertBalanced,
  availability,
  heldCharge,
  hRelative,
  rain,
  surface,
  type Ion,
} from "./exchange";

const IONS = Object.keys(CHARGE) as Ion[];

describe("cation exchange", () => {
  it("holds cations up to the surface's charge and never an anion", () => {
    const s = add(add(add(surface(8), "Ca", 2), "K", 6), "NO3", 3);
    expect(heldCharge(s)).toBe(8);
    expect(s.held.Ca).toBe(2);
    expect(s.held.K).toBe(4);
    expect(s.water.K).toBe(2);
    expect(s.held.NO3).toBe(0);
    expect(s.water.NO3).toBe(3);
    assertBalanced(s);
  });

  it("acid displaces the weakest-held cation first, calcium last", () => {
    let s = add(add(add(surface(8), "Ca", 2), "Mg", 1), "K", 2);
    expect(s.water).toMatchObject({ Ca: 0, Mg: 0, K: 0 });
    s = add(s, "H", 2);
    expect(s.water).toMatchObject({ Ca: 0, Mg: 0, K: 2 });
    s = add(s, "H", 2);
    expect(s.water).toMatchObject({ Ca: 0, Mg: 1, K: 2 });
    s = add(s, "H", 2);
    expect(s.water).toMatchObject({ Ca: 1, Mg: 1, K: 2 });
    assertBalanced(s);
  });

  it("rain leaches the nitrate and keeps the ammonium (T24 acceptance)", () => {
    let s = add(add(surface(8), "NH4", 4), "NO3", 4);
    for (let i = 0; i < 4; i++) s = rain(s, 50);
    expect(s.drained.NO3).toBe(4);
    expect(s.drained.NH4).toBe(0);
    expect(s.held.NH4).toBe(4);
    assertBalanced(s);
  });

  it("calcium knocked off by acid leaves with the rain", () => {
    let s = add(surface(8), "Ca", 4);
    for (let i = 0; i < 3; i++) s = rain(s, 50);
    expect(s.drained.Ca).toBe(0);
    s = add(s, "H", 4);
    for (let i = 0; i < 3; i++) s = rain(s, 50);
    expect(s.drained.Ca).toBe(2);
    assertBalanced(s);
  });

  it("conserves every ion over any sequence of inputs and rain", () => {
    let seed = 7;
    const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let run = 0; run < 50; run++) {
      let s = surface(1 + Math.floor(r() * 20));
      for (let k = 0; k < 30; k++) {
        s =
          r() < 0.6
            ? add(s, IONS[Math.floor(r() * IONS.length)]!, Math.floor(r() * 5))
            : rain(s, Math.floor(r() * 101));
        assertBalanced(s);
        expect(heldCharge(s)).toBeLessThanOrEqual(s.sites);
      }
    }
  });

  it("refuses a fractional ion", () => {
    expect(() => add(surface(4), "K", 1.5)).toThrow();
  });

  it("lists cations strongest-held first", () => {
    expect(CATIONS[0]).toBe("H");
    expect(CATIONS.indexOf("Ca")).toBeLessThan(CATIONS.indexOf("K"));
  });
});

describe("pH dial", () => {
  it("is logarithmic: one unit is ten times the H⁺", () => {
    expect(hRelative(6) / hRelative(7)).toBeCloseTo(10, 9);
    expect(hRelative(5) / hRelative(7)).toBeCloseTo(100, 9);
  });

  it("brings aluminium in only below about pH 5.5", () => {
    expect(aluminium(5.5)).toBe(0);
    expect(aluminium(7)).toBe(0);
    expect(aluminium(5)).toBeGreaterThan(0);
    expect(aluminium(4.5)).toBeGreaterThan(aluminium(5));
  });

  it("puts phosphorus at its most available between pH 6 and 7", () => {
    const peak = [4, 5, 6, 6.5, 7, 8, 9].reduce((a, b) =>
      availability("P", b) > availability("P", a) ? b : a,
    );
    expect(peak).toBeGreaterThanOrEqual(6);
    expect(peak).toBeLessThanOrEqual(7);
  });

  it("gives every nutrient a share between 0 and 100 across the dial", () => {
    for (const n of Object.keys(AVAILABILITY) as (keyof typeof AVAILABILITY)[])
      for (let ph = 4; ph <= 9; ph += 0.25) {
        expect(availability(n, ph)).toBeGreaterThanOrEqual(0);
        expect(availability(n, ph)).toBeLessThanOrEqual(100);
      }
  });
});
