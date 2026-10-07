import { describe, expect, it } from "vitest";
import { MOISTURES, hop, neighbours } from "./films";
import {
  BURROWS,
  DRAIN_PORES,
  DRYING,
  PSI_STEPS,
  STRANDED,
  birch,
  drained,
  drainedAbove,
  filmLook,
  frontLook,
  infiltrate,
  moistureAt,
  strandedHop,
} from "./water";
import { total } from "./ledger";

describe("matric potential and pore drainage", () => {
  it("d ≈ 300 / |ψ|: at −33 kPa pores wider than about 9 µm have drained", () => {
    expect(Math.round(drainedAbove(-33))).toBe(9);
    expect(drainedAbove(-1500)).toBeCloseTo(0.2);
    expect(drainedAbove(0)).toBe(Infinity);
  });

  it("drainage empties the largest pores first", () => {
    const widest = [...DRAIN_PORES].sort((a, b) => b.width - a.width).map((p) => p.id);
    let before = 0;
    for (const psi of PSI_STEPS) {
      const gone = drained(DRAIN_PORES, psi);
      // Whatever has drained is always the widest pores, never a narrow one before a wider.
      expect(gone, `${psi} kPa`).toEqual(widest.slice(0, gone.length));
      expect(gone.length).toBeGreaterThanOrEqual(before);
      before = gone.length;
    }
    expect(drained(DRAIN_PORES, 0)).toEqual([]);
    expect(drained(DRAIN_PORES, -1)[0]).toBe(widest[0]);
    // At the wilting-point convention the finest pores still hold water.
    expect(drained(DRAIN_PORES, -1500).length).toBeLessThan(DRAIN_PORES.length);
  });

  it("the film look thins as the soil dries, and only darkens or fills", () => {
    const looks = PSI_STEPS.map(filmLook);
    for (let i = 1; i < looks.length; i++) {
      expect(looks[i]!.film).toBeLessThanOrEqual(looks[i - 1]!.film);
      expect(looks[i]!.fill).toBeLessThanOrEqual(looks[i - 1]!.fill);
    }
    for (const l of looks) for (const v of Object.values(l)) expect(v).toBeGreaterThanOrEqual(0);
  });
});

describe("stranded: films are roads that drying cuts", () => {
  it("moisture follows potential and the drying clock only gets drier", () => {
    const levels = DRYING.map((p) => MOISTURES.indexOf(moistureAt(p)));
    for (let i = 1; i < levels.length; i++) expect(levels[i]!).toBeLessThanOrEqual(levels[i - 1]!);
    expect(moistureAt(DRYING.at(-1)!)).toBe("dry");
  });

  const walk = (path: string[]) => {
    let at = path[0]!;
    let tick = 0;
    for (const next of path.slice(1)) {
      const moved = strandedHop(at, next, tick);
      if (moved === at) break;
      at = moved;
      tick++;
    }
    return at;
  };

  it("the short road through the wide pores breaks before you arrive", () => {
    expect(walk(["start", "hall", "food"])).toBe("hall");
  });

  it("the longer road along thin films in the corners still reaches the food", () => {
    expect(walk(["start", "corner-a", "corner-b", "food"])).toBe("food");
  });

  it("below the film threshold nothing moves anywhere", () => {
    const dry = moistureAt(DRYING.at(-1)!);
    for (const s of STRANDED.sites) expect(neighbours(STRANDED, s.id, dry), s.id).toEqual([]);
    for (const s of STRANDED.sites)
      for (const t of STRANDED.sites) expect(hop(STRANDED, s.id, t.id, dry)).toBe(s.id);
  });
});

describe("the Birch pulse", () => {
  it("conserves carbon exactly, every day, in integers", () => {
    for (const dryDays of [0, 3, 7, 14])
      for (const rewet of [true, false]) {
        const run = birch({ dryDays, rewet });
        for (const l of run.ledgers) {
          expect(total(l, "C")).toBe(run.start);
          for (const v of Object.values(l.C)) expect(Number.isInteger(v) && v >= 0).toBe(true);
        }
      }
  });

  it("rewetting a dried soil makes CO₂ jump above the soil kept moist, then fall back", () => {
    const dry = birch({ dryDays: 7, rewet: true });
    const moist = birch({ dryDays: 0, rewet: true });
    const day = dry.rewetDay;
    // During the drought the dry soil breathes less than the moist one.
    expect(dry.co2[day - 1]!).toBeLessThan(moist.co2[day - 1]!);
    // On rewetting it breathes out a burst well above the moist control and its own drought rate.
    expect(dry.co2[day]!).toBeGreaterThan(moist.co2[day]! * 2);
    expect(dry.co2[day]!).toBe(Math.max(...dry.co2));
    // The pulse decays.
    expect(dry.co2[day + 3]!).toBeLessThan(dry.co2[day]!);
  });

  it("no rewetting, no pulse; a longer drought, a bigger pulse", () => {
    const kept = birch({ dryDays: 7, rewet: false });
    expect(Math.max(...kept.co2.slice(kept.rewetDay))).toBeLessThanOrEqual(kept.co2[0]!);
    const peak = (d: number) => birch({ dryDays: d, rewet: true }).co2[d]!;
    expect(peak(14)).toBeGreaterThan(peak(7));
    expect(peak(7)).toBeGreaterThan(peak(3));
  });

  it("is deterministic", () => {
    expect(birch({ dryDays: 7, rewet: true })).toEqual(birch({ dryDays: 7, rewet: true }));
  });
});

describe("fast lanes: rain with and without worm burrows", () => {
  it("water through a burrow reaches deeper sooner than the matrix front", () => {
    const with_ = infiltrate(BURROWS);
    const without = infiltrate(0);
    for (let t = 1; t < with_.length; t++) {
      expect(with_[t]!.deepest).toBeGreaterThan(without[t]!.deepest);
      // The matrix front itself is the same: water bypasses it, it does not speed it up.
      expect(with_[t]!.front).toBe(without[t]!.front);
    }
    for (const run of [with_, without])
      for (let t = 1; t < run.length; t++) expect(run[t]!.front).toBeGreaterThanOrEqual(run[t - 1]!.front);
  });

  it("the front look fingers only where burrows are", () => {
    expect(frontLook(infiltrate(0).at(-1)!, 0).fingering).toBe(0);
    expect(frontLook(infiltrate(BURROWS).at(-1)!, BURROWS).fingering).toBeGreaterThan(0);
  });
});
