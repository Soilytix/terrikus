import { describe, expect, it } from "vitest";
import { WORLDS } from "../content/worlds";
import { PH_STEPS } from "./sorption";
import {
  AM_HOST,
  CROPS,
  runTrade,
  tradeAccount,
  type SoilP,
  type Strategy,
  type TradeSettings,
} from "./trade";

const STRATS: Strategy[][] = [[], ["hairs"], ["fungus"], ["acids"], ["hairs", "fungus", "acids"]];
const LEVELS: SoilP[] = ["low", "medium", "high"];
const sum = (l: Record<string, number>) => Object.values(l).reduce((a, b) => a + b, 0);
const run = (s: Partial<TradeSettings>, days = 20) =>
  runTrade({ crop: "pea", soilP: "low", ph: 6.5, strategies: [], ...s }, days);
const plantP = (s: Partial<TradeSettings>) => run(s).at(-1)!.P.plant;

describe("root exchange and P sorption", () => {
  it("conserves P and C exactly at every tick for every crop, soil P, pH and strategy", () => {
    const bad: string[] = [];
    for (const crop of CROPS)
      for (const soilP of LEVELS)
        for (const ph of PH_STEPS)
          for (const strategies of STRATS) {
            const snaps = run({ crop, soilP, ph, strategies }, 30);
            const [P, C] = [sum(snaps[0]!.P), sum(snaps[0]!.C)];
            for (const s of snaps)
              if (
                sum(s.P) !== P ||
                sum(s.C) !== C ||
                !Object.values(s.P).every((x) => Number.isInteger(x) && x >= 0)
              )
                bad.push(`${crop} ${soilP} pH ${ph} ${strategies.join("+")} day ${s.day}`);
          }
    expect(bad).toEqual([]);
  });

  it("spinach and sugar beet show no partner: no fungus, no hyphae, no trade, whatever is asked", () => {
    for (const crop of ["spinach", "sugarbeet"] as const) {
      const snaps = run({ crop, strategies: ["fungus"] });
      expect(snaps.every((s) => s.P.fungus === 0 && s.C.fungus === 0)).toBe(true);
      expect(snaps.flatMap((s) => s.transfers).some((t) => t.amount > 0 && /hyphae|myco/.test(t.rule))).toBe(
        false,
      );
      expect(plantP({ crop, strategies: ["fungus"] })).toBe(plantP({ crop }));
    }
  });

  it("agrees with the world presets on who is mycorrhizal", () => {
    for (const crop of CROPS)
      expect(AM_HOST[crop], crop).toBe(WORLDS.find((w) => w.id === crop)!.mycorrhizal === "AM");
  });

  it("the trade pays at low soil P and becomes a cost at high P", () => {
    const ratio = LEVELS.map((soilP) => tradeAccount(run({ soilP, strategies: ["fungus"] })).perHundredC);
    expect(ratio[0]!).toBeGreaterThan(ratio[1]!);
    expect(ratio[1]!).toBeGreaterThan(ratio[2]!);
    expect(plantP({ soilP: "low", strategies: ["fungus"] })).toBeGreaterThan(plantP({ soilP: "low" }));
    const high = tradeAccount(run({ soilP: "high", strategies: ["fungus"] }));
    expect(plantP({ soilP: "high", strategies: ["fungus"] })).toBe(plantP({ soilP: "high" }));
    expect(high.cPaid).toBeGreaterThan(0);
  });

  it("P stays freest near neutral pH and binds in acid and alkaline soil", () => {
    const free = (ph: (typeof PH_STEPS)[number]) => {
      const p = run({ crop: "spinach", ph }, 20).at(-1)!.P;
      return p.near + p.beyond;
    };
    expect(free(6.5)).toBeGreaterThan(free(5.5));
    expect(free(5.5)).toBeGreaterThan(free(4.5));
    expect(free(6.5)).toBeGreaterThan(free(7.5));
    expect(free(7.5)).toBeGreaterThan(free(8.5));
  });

  it("without a fungus, hairs reach and acids release: each beats doing nothing", () => {
    for (const crop of ["spinach", "sugarbeet"] as const)
      for (const ph of [4.5, 6.5, 8.5] as const) {
        const none = plantP({ crop, ph });
        expect(plantP({ crop, ph, strategies: ["hairs"] }), `${crop} ${ph} hairs`).toBeGreaterThan(none);
        expect(plantP({ crop, ph, strategies: ["acids"] }), `${crop} ${ph} acids`).toBeGreaterThan(none);
      }
  });

  it("dissolved P barely moves: beyond the depletion zone it outlasts the root's own reach", () => {
    const snaps = run({ crop: "spinach", soilP: "medium" }, 20);
    const creep = snaps.flatMap((s) => s.transfers).filter((t) => t.rule === "p-diffusion");
    expect(creep.every((t) => t.amount < 0.05 * snaps[0]!.P.beyond)).toBe(true);
  });
});
