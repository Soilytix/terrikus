import { describe, expect, it } from "vitest";
import { ROOT_LIMIT_MPA, wheel } from "./compaction";
import {
  CARBON,
  DEFAULT_PRACTICES,
  PRACTICES,
  correlation,
  noTillEffect,
  runField,
  sameSeed,
  type Context,
  type Practices,
} from "./twin-fields";

const combos = <T extends Record<string, readonly string[]>>(o: T) =>
  Object.entries(o).reduce<Record<string, string>[]>(
    (acc, [k, vs]) => acc.flatMap((a) => vs.map((v) => ({ ...a, [k]: v }))),
    [{}],
  );
const CONTEXTS = combos({ climate: ["dry", "humid"], texture: ["sand", "clay"], drainage: ["good", "poor"] });
const ALL = combos(PRACTICES) as Practices[];

describe("twin-fields", () => {
  it("conserves carbon exactly for every practice set in every context", () => {
    for (const ctx of CONTEXTS as unknown as Context[])
      for (const p of ALL)
        for (const y of runField(p, ctx)) {
          expect(Number.isInteger(y.shallow) && Number.isInteger(y.deep)).toBe(true);
          expect(y.shallow + y.deep + y.air).toBe(CARBON.shallow0 + CARBON.deep0 + y.added);
        }
  });

  it("flips the sign of the no-till yield effect between a dry and a humid context", () => {
    expect(noTillEffect({ climate: "dry", texture: "sand", drainage: "good" })).toBeGreaterThan(0);
    expect(noTillEffect({ climate: "humid", texture: "clay", drainage: "good" })).toBeLessThan(0);
  });

  it("finds reduced-tillage carbon in a shallow sample that the whole profile mostly does not", () => {
    const end = (p: Practices) => runField(p).at(-1)!;
    const plough = end(DEFAULT_PRACTICES);
    const reduced = end({ ...DEFAULT_PRACTICES, tillage: "reduced" });
    const shallow = reduced.shallow - plough.shallow;
    const whole = reduced.shallow + reduced.deep - (plough.shallow + plough.deep);
    expect(shallow).toBeGreaterThan(0);
    expect(Math.abs(whole)).toBeLessThan(shallow / 3);
  });

  it("moves each readout in its teaching direction", () => {
    const end = (p: Partial<Practices>) => runField({ ...DEFAULT_PRACTICES, ...p }).at(-1)!;
    const base = end({});
    expect(end({ tillage: "reduced" }).aggregates).toBeGreaterThan(base.aggregates);
    expect(end({ cover: "grass" }).nitrate).toBeLessThan(base.nitrate);
    expect(end({ rotation: "2-year" }).disease).toBeGreaterThan(base.disease);
    expect(end({ traffic: "wet-season" }).aggregates).toBeLessThan(base.aggregates);
  });
});

describe("same seed, two fields", () => {
  const zones = sameSeed();

  it("is reproducible from its seed", () => {
    expect(sameSeed()).toEqual(zones);
  });

  it("shows a strong association that drainage explains", () => {
    expect(correlation(zones)).toBeLessThan(-0.7);
    for (const d of ["good", "poor"] as const)
      expect(Math.abs(correlation(zones.filter((z) => z.drainage === d)))).toBeLessThan(0.6);
  });

  it("leaves no field effect once drainage is held equal", () => {
    const mean = (f: string) => {
      const zs = zones.filter((z) => z.field === f && z.drainage === "good");
      return zs.reduce((a, z) => a + z.yield, 0) / zs.length;
    };
    expect(Math.abs(mean("north") - mean("south"))).toBeLessThan(1.2);
  });
});

describe("heavy wheels", () => {
  it("collapses macropores, ponds the next rain and bends roots only when the soil is wet", () => {
    const [wet, dry] = [wheel("wet"), wheel("dry")];
    expect(wet.macropores).toBeLessThan(dry.macropores);
    expect(wet.ponds && !dry.ponds).toBe(true);
    expect(wet.resistance).toBeGreaterThan(ROOT_LIMIT_MPA);
    expect(dry.resistance).toBeLessThan(ROOT_LIMIT_MPA);
    expect(wet.recovery.subsoil).toBeGreaterThan(wet.recovery.topsoil);
  });
});
