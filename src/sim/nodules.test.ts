import { describe, expect, it } from "vitest";
import { fixAccount, knock, NITRATE_STEPS, nodulesAt, RHIZOBIA, runFix, slice } from "./nodules";
import { CROPS } from "./trade";

const sum = (l: Record<string, number>) => Object.values(l).reduce((a, b) => a + b, 0);

describe("nodules and N fixation", () => {
  it("partners are specific: pea and bean rhizobia are not interchangeable", () => {
    expect(knock("pea-rhizobia", "pea")).toBe("nodule");
    expect(knock("bean-rhizobia", "bean")).toBe("nodule");
    expect(knock("pea-rhizobia", "bean")).toBe("refused");
    expect(knock("bean-rhizobia", "pea")).toBe("refused");
  });

  it("spinach and sugar beet show no partner: no rhizobium forms a nodule", () => {
    for (const crop of ["spinach", "sugarbeet"] as const)
      for (const r of RHIZOBIA) {
        expect(knock(r, crop)).toBe("no-host");
        const a = fixAccount(runFix({ crop, rhizobia: r, nitrate: 0 }, 20));
        expect(a.fixed).toBe(0);
      }
  });

  it("a refused rhizobium fixes nothing", () => {
    const snaps = runFix({ crop: "bean", rhizobia: "pea-rhizobia", nitrate: 0 }, 20);
    expect(snaps[0]!.nodules).toBe(0);
    expect(fixAccount(snaps).fixed).toBe(0);
  });

  it("conserves N and C exactly at every tick for every crop, partner, nitrate and nodule", () => {
    for (const crop of CROPS)
      for (const rhizobia of RHIZOBIA)
        for (const nitrate of NITRATE_STEPS)
          for (const effective of [true, false]) {
            const snaps = runFix({ crop, rhizobia, nitrate, effective }, 30);
            const [N, C] = [sum(snaps[0]!.N), sum(snaps[0]!.C)];
            for (const s of snaps) {
              expect(sum(s.N)).toBe(N);
              expect(sum(s.C)).toBe(C);
            }
          }
  });

  it("pink means working: a white nodule has O₂ inside and fixes nothing", () => {
    expect(slice(true)).toEqual({ colour: "pink", oxygen: "low", fixing: true });
    expect(slice(false)).toEqual({ colour: "white", oxygen: "high", fixing: false });
    const white = runFix({ crop: "pea", rhizobia: "pea-rhizobia", nitrate: 0, effective: false }, 20);
    expect(white[0]!.nodules).toBeGreaterThan(0);
    expect(fixAccount(white).fixed).toBe(0);
    expect(
      fixAccount(runFix({ crop: "pea", rhizobia: "pea-rhizobia", nitrate: 0 }, 20)).fixed,
    ).toBeGreaterThan(0);
  });

  it("nitrate switches fixation down: fewer nodules, less fixed, less carbon spent", () => {
    const runs = NITRATE_STEPS.map((nitrate) =>
      fixAccount(runFix({ crop: "pea", rhizobia: "pea-rhizobia", nitrate }, 20)),
    );
    for (let i = 1; i < NITRATE_STEPS.length; i++) {
      expect(nodulesAt(NITRATE_STEPS[i]!)).toBeLessThan(nodulesAt(NITRATE_STEPS[i - 1]!));
      expect(runs[i]!.fixed).toBeLessThanOrEqual(runs[i - 1]!.fixed);
      expect(runs[i]!.cFix + runs[i]!.cUptake).toBeLessThanOrEqual(runs[i - 1]!.cFix + runs[i - 1]!.cUptake);
    }
    expect(runs.at(-1)!.fixed).toBeLessThan(runs[0]!.fixed);
  });

  it("a nodule count is not a fixation rate: same nodules, pink or white, differ", () => {
    const pink = runFix({ crop: "pea", rhizobia: "pea-rhizobia", nitrate: 0 }, 20);
    const white = runFix({ crop: "pea", rhizobia: "pea-rhizobia", nitrate: 0, effective: false }, 20);
    expect(pink[0]!.nodules).toBe(white[0]!.nodules);
    expect(fixAccount(pink).fixed).not.toBe(fixAccount(white).fixed);
  });
});
