import { describe, expect, it } from "vitest";
import { run, type BenchModel } from "./engine";
import { total } from "./ledger";
import { leafJar, type LeverSettings } from "./benches/leaf-jar";
import { fO2, TEMPERATURE, WATER } from "./modifiers";
import { FO2_ANOXIC, mineralN, RAIN, RESIDUE_CN, withNitrogen, type NitrogenSettings } from "./nitrogen";

const WATERS = ["dry", "moist", "waterlogged"] as const;
const TEMPS = ["cool", "mild"] as const;
const RESIDUES = ["leaf", "straw", "wood"] as const;
const ALL: LeverSettings[] = WATERS.flatMap((water) =>
  TEMPS.flatMap((temperature) => RESIDUES.map((residue) => ({ water, temperature, residue }))),
);
const base: LeverSettings = { water: "moist", temperature: "mild", residue: "leaf" };

const settings = (levers: LeverSettings, extra: Partial<NitrogenSettings> = {}): NitrogenSettings => ({
  wfps: WATER[levers.water].wfps,
  celsius: TEMPERATURE[levers.temperature].celsius,
  rain: RAIN.dry,
  residueCN: RESIDUE_CN[levers.residue],
  mineralN: { NH4: 100, NO3: 100 },
  ...extra,
});
const jar = (levers: LeverSettings, extra?: Partial<NitrogenSettings>) =>
  withNitrogen(leafJar(levers), settings(levers, extra));
const withSugar = (model: BenchModel<unknown>, sugar: number): BenchModel<unknown> => ({
  ...model,
  initial() {
    const l = model.initial();
    l.C.D += sugar;
    return l;
  },
});

describe("nitrogen engine", () => {
  const full = { oldSom: { C: 20_000, cn: 12 }, grazers: 200 };
  it.each(ALL.flatMap((levers) => [RAIN.dry, RAIN.wet].map((rain) => ({ ...levers, rain }))))(
    "conserves C and N exactly at every tick: %o",
    ({ rain, ...levers }) => {
      const snaps = run(jar(levers, { ...full, rain }), 730);
      const [C, N] = [total(snaps[0]!.ledger, "C"), total(snaps[0]!.ledger, "N")];
      expect(N).toBeGreaterThan(0);
      for (const s of snaps) {
        expect(total(s.ledger, "C")).toBe(C);
        expect(total(s.ledger, "N")).toBe(N);
      }
    },
  );

  it("high C:N straw dips plant-available N, then gives it back; green leaf releases N", () => {
    const straw = run(jar({ ...base, residue: "straw" }), 1825).map((s) => mineralN(s.ledger));
    const leaf = run(jar(base), 1825).map((s) => mineralN(s.ledger));
    const low = Math.min(...straw);
    expect(low).toBeLessThan(straw[0]!);
    expect(straw[1825]!).toBeGreaterThan(low);
    expect(leaf[60]!).toBeGreaterThan(leaf[0]!);
    expect(straw[60]!).toBeLessThan(leaf[60]!);
  });

  it.each(WATERS)("denitrifies only when fO2 is low: %s", (water) => {
    const snaps = run(jar({ ...base, water }), 365);
    const lost = snaps[365]!.ledger.N.n2Out + snaps[365]!.ledger.N.n2oOut;
    if (fO2(WATER[water].wfps) < FO2_ANOXIC) expect(lost).toBeGreaterThan(0);
    else expect(lost).toBe(0);
  });

  it("leaches nitrate in the rain and never ammonium", () => {
    const wet = run(jar(base, { rain: RAIN.wet }), 365);
    expect(wet[365]!.ledger.N.drainage).toBeGreaterThan(0);
    expect(run(jar(base), 365)[365]!.ledger.N.drainage).toBe(0);
    const drained = wet.flatMap((s) => s.transfers).filter((t) => t.to === "drainage");
    expect(drained.every((t) => t.from === "NO3")).toBe(true);
  });

  it("grazers release ammonium from microbial biomass (microbial loop)", () => {
    const grazed = run(jar(base, { grazers: 200 }), 90)[90]!.ledger;
    const ungrazed = run(jar(base), 90)[90]!.ledger;
    expect(mineralN(grazed)).toBeGreaterThan(mineralN(ungrazed));
  });

  it("priming: a sugar pulse speeds the loss of old carbon when N is scarce", () => {
    const scarce = { mineralN: { NH4: 20, NO3: 20 }, oldSom: { C: 20_000, cn: 12 } };
    const plain = run(withNitrogen(leafJar(base), settings(base, scarce)), 30)[30]!.ledger.C.co2Old;
    const pulsed = run(withNitrogen(withSugar(leafJar(base), 3000), settings(base, scarce)), 30)[30]!.ledger.C
      .co2Old;
    expect(pulsed).toBeGreaterThan(plain);
    expect(run(withSugar(jar(base), 3000), 30)[30]!.ledger.C.co2Old).toBe(0);
  });

  it("is deterministic", () => {
    const opts = { ...full, rain: RAIN.wet };
    expect(run(jar(base, opts), 365)).toEqual(run(jar(base, opts), 365));
  });
});
