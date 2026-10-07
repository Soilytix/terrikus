import { describe, expect, it } from "vitest";
import {
  CLIMATES,
  DEPTH_CM,
  FORMATION_RATES,
  LITTERS,
  PARENTS,
  TIMELAPSE_YEARS,
  profileAt,
  thickness,
  yearsPerCm,
  type Factors,
} from "./pedogenesis";

const podzol: Factors = { climate: "cold-wet", litter: "conifer", parent: "sand", years: 10_000 };
const every = CLIMATES.flatMap((climate) =>
  LITTERS.flatMap((litter) =>
    PARENTS.flatMap((parent) => TIMELAPSE_YEARS.map((years) => ({ climate, litter, parent, years }))),
  ),
);

describe("pedogenesis: horizons from the state factors", () => {
  it("every profile is whole-centimetre horizons, contiguous, in O-A-E-B-C order, filling the pit", () => {
    const order = ["O", "A", "E", "Bs", "Bw", "C"];
    for (const f of every) {
      const p = profileAt(f);
      expect(p[0]!.top).toBe(0);
      expect(p.at(-1)!.bottom).toBe(DEPTH_CM);
      for (const [i, h] of p.entries()) {
        expect(Number.isInteger(h.top) && Number.isInteger(h.bottom)).toBe(true);
        expect(h.bottom).toBeGreaterThan(h.top);
        if (i > 0) expect(h.top).toBe(p[i - 1]!.bottom);
        if (i > 0) expect(order.indexOf(h.id)).toBeGreaterThan(order.indexOf(p[i - 1]!.id));
      }
    }
  });

  it("at time zero there is only parent material", () => {
    for (const f of every.filter((x) => x.years === 0)) expect(profileAt(f).map((h) => h.id)).toEqual(["C"]);
  });

  it("time only deepens a profile: topsoil, bleaching and accumulation never shrink", () => {
    for (const f of every.filter((x) => x.years === 0)) {
      const runs = TIMELAPSE_YEARS.map((years) => profileAt({ ...f, years }));
      for (const id of ["A", "E", "Bs", "Bw"] as const)
        for (let i = 1; i < runs.length; i++)
          expect(thickness(runs[i]!, id), `${id} ${JSON.stringify(f)}`).toBeGreaterThanOrEqual(
            thickness(runs[i - 1]!, id),
          );
    }
  });

  it("cold wet climate, conifer litter and sand bleach an E over an enriched B", () => {
    const p = profileAt(podzol);
    expect(p.map((h) => h.id)).toEqual(["O", "A", "E", "Bs", "C"]);
    expect(p.find((h) => h.id === "E")!.colour).toBe("pale");
    expect(p.find((h) => h.id === "Bs")!.colour).toBe("oxide");
  });

  it("each podzol factor pushes the same way: change one, the E thins or vanishes", () => {
    const e = (f: Partial<Factors>) => thickness(profileAt({ ...podzol, ...f }), "E");
    expect(e({ climate: "warm-dry" })).toBeLessThan(e({}));
    expect(e({ litter: "grass" })).toBeLessThan(e({}));
    expect(e({ parent: "clay" })).toBeLessThan(e({}));
    expect(e({ years: 100 })).toBeLessThan(e({}));
    expect(e({ climate: "warm-dry", litter: "grass", parent: "clay" })).toBe(0);
  });

  it("not every soil has every horizon: grassland on loam has no O and no E", () => {
    const ids = profileAt({ climate: "temperate", litter: "grass", parent: "loam", years: 10_000 }).map(
      (h) => h.id,
    );
    expect(ids).toEqual(["A", "Bw", "C"]);
  });
});

describe("a thousand years per centimetre?", () => {
  it("1 cm over a hectare at 1.3 g/cm³ is 130 t, so 1 t/ha/yr forms a centimetre in 130 years", () => {
    expect(yearsPerCm(1)).toBe(130);
    // verheijen-2009: about 0.3–1.4 t/ha/yr; slower formation, more years.
    const years = FORMATION_RATES.map((r) => yearsPerCm(r));
    for (let i = 1; i < years.length; i++) expect(years[i]!).toBeLessThan(years[i - 1]!);
    expect(years[0]).toBeGreaterThan(400);
  });
});
