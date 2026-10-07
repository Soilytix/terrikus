/**
 * Straw-and-nitrogen bench (T23, chapter 9): a sugar beet field after a residue
 * is ploughed in. Leaf-jar carbon rules under T18's nitrogen engine, plus two
 * rules of its own: the crop takes up mineral N, and a little ammonium escapes
 * from the surface as NH₃. Teaching values: direction, not prediction.
 *
 * Simplifications: rain is a whole-run setting, not a storm; heavy rain is the
 * engine's waterlogged soil, so denitrification stands in for anoxic
 * microsites; the crop's uptake ramps up linearly while it grows; NH₃ loss
 * ignores pH, wind and incorporation.
 */
import type { BenchModel } from "../engine";
import { cloneLedger, transfer, type Ledger, type PoolOf, type Transfer } from "../ledger";
import { RAIN, RESIDUE_CN, withNitrogen, type NitrogenState } from "../nitrogen";
import { TEMPERATURE, WATER } from "../modifiers";
import type { BenchDef } from ".";
import { leafJar, type Carries } from "./leaf-jar";

export const LEVERS = {
  /** Beet tops are the leaf jar's green leaf (C:N ≈ 15); cereal straw ≈ 80 (`nrcs-cn-ratios`, verify). */
  residue: { "beet-tops": "leaf", straw: "straw" },
  /** Mineral N in the soil at the start; "some" adds ammonium fertiliser. */
  mineral: { none: { NH4: 20, NO3: 20 }, some: { NH4: 170, NO3: 20 } },
  rain: { dry: { water: "moist", rain: RAIN.dry }, wet: { water: "waterlogged", rain: RAIN.wet } },
  cover: { crop: true, bare: false },
} as const;

export type StrawLevers = { [K in keyof typeof LEVERS]: keyof (typeof LEVERS)[K] };

export const DEFAULT_STRAW: StrawLevers = { residue: "straw", mineral: "none", rain: "dry", cover: "crop" };

/** Registry entry (benches/index.ts). */
export const STRAW_N: BenchDef = {
  levers: Object.fromEntries(Object.entries(LEVERS).map(([k, v]) => [k, Object.keys(v)])),
};

export const DAYS = 180;
export const RULESET_VERSION = "straw-n@1";

/** Old soil organic matter: most of the field's N, and organic. Teaching values. */
export const SOIL_ORGANIC = { C: 20_000, cn: 12 } as const;

/** Per-day teaching rates for the bench's own rules. */
export const STRAW_RATES = {
  kUptake: 0.04, // crop uptake of NH₄⁺ and NO₃⁻ once grown
  rampDays: 60, // days for the crop's uptake to reach full rate
  kVol: 0.01, // NH₃ volatilisation of NH₄⁺
} as const;

export interface StrawState {
  inner: NitrogenState<Carries>;
  carries: Carries;
}

const whole = (carries: Carries, key: string, amount: number) => {
  const raw = amount + (carries[key] ?? 0);
  const n = Math.max(0, Math.floor(raw));
  carries[key] = raw - n;
  return n;
};

export function strawN(levers: StrawLevers): BenchModel<StrawState> {
  const residue = LEVERS.residue[levers.residue];
  const { water, rain } = LEVERS.rain[levers.rain];
  const crop = LEVERS.cover[levers.cover];
  const inner = withNitrogen(leafJar({ water, temperature: "mild", residue }), {
    wfps: WATER[water].wfps,
    celsius: TEMPERATURE.mild.celsius,
    rain,
    residueCN: RESIDUE_CN[residue],
    mineralN: { ...LEVERS.mineral[levers.mineral] },
    oldSom: SOIL_ORGANIC,
  });
  return {
    initial: () => inner.initial(),
    initialState: () => ({ inner: inner.initialState(), carries: {} }),
    energy: (l) => inner.energy(l),
    step(l, state, day) {
      const start = cloneLedger(l);
      const out = inner.step(l, state.inner, day);
      // What each N pool may still give this tick: outflow ≤ start-of-tick value.
      const left = { ...start.N } as Record<string, number>;
      for (const t of out) if (t.element === "N") left[t.from]! -= t.amount;
      const move = (from: PoolOf<"N">, to: PoolOf<"N">, amount: number, rule: string) => {
        const moved = transfer(l, "N", from, to, Math.min(amount, left[from]!));
        left[from]! -= moved;
        if (moved > 0) out.push({ element: "N", from, to, amount: moved, rule } satisfies Transfer);
      };
      const { carries } = state;
      move(
        "NH4",
        "nh3Out",
        whole(carries, "volatilisation", start.N.NH4 * STRAW_RATES.kVol),
        "volatilisation",
      );
      if (crop) {
        const k = STRAW_RATES.kUptake * Math.min(1, day / STRAW_RATES.rampDays);
        move("NO3", "plant", whole(carries, "uptake-no3", start.N.NO3 * k), "plant-uptake");
        move("NH4", "plant", whole(carries, "uptake-nh4", start.N.NH4 * k), "plant-uptake");
      }
      return out;
    },
  };
}

/** Losses to air and water so far. */
export const lostN = (l: Ledger) => l.N.n2Out + l.N.n2oOut + l.N.drainage + l.N.nh3Out;

/** All organic N: residue, dissolved, microbes, mineral-bound, old organic matter, grazers. */
export const organicN = (l: Ledger) => l.N.L + l.N.D + l.N.B + l.N.M + l.N.O + l.N.G;

/** Share of N still accounted for against day 0, in per cent. */
export function accountedN(first: Ledger, now: Ledger): number {
  const sum = (l: Ledger) => Object.values(l.N).reduce((a, b) => a + b, 0);
  return (100 * sum(now)) / sum(first);
}

/** The relay's handoffs: rule → N moved so far, summed over the days given. */
export const HANDOFFS = {
  mineralisation: "Organic N → NH₄⁺",
  immobilisation: "NH₄⁺ / NO₃⁻ → microbes",
  nitrification: "NH₄⁺ → NO₃⁻",
  "plant-uptake": "→ beet",
  denitrification: "NO₃⁻ → N₂O / N₂",
  leaching: "NO₃⁻ → drain",
  volatilisation: "NH₄⁺ → NH₃",
} as const;
export type Handoff = keyof typeof HANDOFFS;

export function handoffs(transfers: Transfer[][]): Record<Handoff, number> {
  const sums = Object.fromEntries(Object.keys(HANDOFFS).map((k) => [k, 0])) as Record<Handoff, number>;
  for (const t of transfers.flat())
    if (t.element === "N" && Object.hasOwn(sums, t.rule)) sums[t.rule as Handoff] += t.amount;
  return sums;
}

/**
 * The gene ≠ rate reading (chapter 9, `c9-m4`): *amoA* gene copies per gram of
 * dry soil, one qPCR run per plot 20 days after the residue went in. Teaching
 * values, about the same in both plots; archaea outnumber bacteria as in
 * `leininger-2006` (there up to ~3,000×), here about 200×.
 */
export const AMOA_READING = {
  straw: { archaeal: { value: 2.4e7, band: 0.6e7 }, bacterial: { value: 1.2e5, band: 0.4e5 } },
  "beet-tops": { archaeal: { value: 2.2e7, band: 0.6e7 }, bacterial: { value: 1.1e5, band: 0.4e5 } },
} as const;

/** The incubation for gene ≠ rate: soil from each plot on `INCUBATION_DAY`, in a jar, no crop, no rain. */
export const incubation = (residue: StrawLevers["residue"]): StrawLevers => ({
  residue,
  mineral: "none",
  rain: "dry",
  cover: "bare",
});
export const INCUBATION_DAY = 20;
