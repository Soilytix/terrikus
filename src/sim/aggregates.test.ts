import { describe, expect, it } from "vitest";
import { AGENTS, SLAKE_TIMES, crumb, slake, type Agent } from "./aggregates";

describe("slake test", () => {
  it("starts whole and only falls apart over time", () => {
    for (const plot of ["grassland", "ploughed"] as const) {
      const curve = SLAKE_TIMES.map((t) => slake(plot, t));
      expect(curve[0]).toBe(100);
      for (let i = 1; i < curve.length; i++) expect(curve[i]).toBeLessThanOrEqual(curve[i - 1]!);
    }
  });

  it("the grassland aggregate holds together better than the ploughed one", () => {
    for (const t of SLAKE_TIMES.slice(1)) expect(slake("grassland", t)).toBeGreaterThan(slake("ploughed", t));
  });
});

describe("build a crumb", () => {
  const all = Object.keys(AGENTS) as Agent[];

  it("every agent binds while fresh and undisturbed", () => {
    expect(crumb(all, false, 0)).toEqual({ holding: all, macro: true, micro: true });
  });

  it("tillage breaks root and hyphal binding; time eats the glue; clay–organic binding persists", () => {
    expect(crumb(all, true, 12)).toEqual({ holding: ["clay-om"], macro: false, micro: true });
    expect(crumb(all, false, 12).holding).toEqual(["roots", "hyphae", "clay-om"]);
    expect(crumb(["glue"], false, 1).macro).toBe(true);
  });

  it("without a persistent agent nothing is left after tillage and a season", () => {
    expect(crumb(["roots", "hyphae", "glue"], true, 12)).toEqual({ holding: [], macro: false, micro: false });
  });
});
