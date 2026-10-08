/**
 * Twin-fields bench (T28, chapter 12): two fields under one weather, run year
 * by year over a compressed decade. Four practices act through earlier
 * chapters' mechanisms (aggregates, residue placement, cover uptake, rotation
 * build-up of pathogens, wheel compaction) inside a site context. Teaching
 * values: direction, not prediction.
 *
 * Simplifications: one carbon account in two depths (0–10 cm and 10–60 cm,
 * the second standing for the rest of the sampled profile), first-order loss
 * to the air, indices that ease toward a target each year, and a yield index
 * relative to ploughed, unrotated management in the same context.
 */
import { gaussian } from "./measure";
import { hashSeed, mulberry32 } from "./rng";

export const PRACTICES = {
  tillage: ["plough", "reduced"],
  cover: ["none", "legume", "grass"],
  rotation: ["2-year", "4-year"],
  traffic: ["dry-season", "wet-season"],
} as const;
export type Practices = { [K in keyof typeof PRACTICES]: (typeof PRACTICES)[K][number] };
export const DEFAULT_PRACTICES: Practices = {
  tillage: "plough",
  cover: "none",
  rotation: "4-year",
  traffic: "dry-season",
};

export interface Context {
  climate: "dry" | "humid";
  texture: "sand" | "clay";
  drainage: "good" | "poor";
}
export const DEFAULT_CONTEXT: Context = { climate: "humid", texture: "clay", drainage: "good" };

export const YEARS = 10;
export const RULESET_VERSION = "twin-fields@1";

/** Teaching values, kg C per hectare and per-year fractions. */
export const CARBON = {
  shallow0: 30_000, // 0–10 cm at the start
  deep0: 60_000, // 10–60 cm at the start
  crop: 1_500, // crop residue returned each year
  cover: { none: 0, legume: 600, grass: 900 },
  /** Share of the year's residue that stays in the top 10 cm. */
  shallowShare: { plough: 0.3, reduced: 0.85 },
  /** Loss to the air per year; ploughing breaks aggregates and exposes protected carbon. */
  kShallow: { plough: 0.034, reduced: 0.026 },
  kDeep: 0.012,
} as const;

export interface Year {
  year: number;
  /** kg C/ha in 0–10 cm and 10–60 cm, and all carbon lost to the air so far. */
  shallow: number;
  deep: number;
  air: number;
  /** All residue carbon added so far. */
  added: number;
  /** 0–100: stable crumbs. */
  aggregates: number;
  /** kg N/ha leached this year. */
  nitrate: number;
  /** 0–100: pathogen build-up. */
  disease: number;
  /** Relative to 100 = ploughed, 4-year rotation, no cover, dry-season traffic here. */
  yield: number;
}

const ease = (x: number, target: number) => Math.round(x + 0.35 * (target - x));

/** The tillage effect on yield in this context: positive where residue keeps water in (pittelkow-2015). */
export function tillageYield(ctx: Context): number {
  if (ctx.climate === "dry") return ctx.texture === "sand" ? 5 : 3;
  return -(ctx.texture === "clay" ? 9 : 5) - (ctx.drainage === "poor" ? 3 : 0);
}

function aggregateTarget(p: Practices, ctx: Context) {
  return (
    60 +
    (p.tillage === "plough" ? -15 : 0) +
    { none: 0, legume: 6, grass: 10 }[p.cover] +
    (p.rotation === "4-year" ? 4 : 0) +
    (p.traffic === "wet-season" ? (ctx.texture === "clay" ? -14 : -8) : 0)
  );
}

function nitrate(p: Practices, ctx: Context) {
  const base = (ctx.climate === "humid" ? 50 : 15) * (ctx.texture === "sand" ? 1.5 : 0.8);
  const cover = { none: 1, legume: 0.6, grass: 0.3 }[p.cover]; // non-legumes cut more (`tonitto-2006`)
  const drained = ctx.drainage === "poor" ? 0.8 : 1;
  return Math.round(base * cover * drained * (p.tillage === "plough" ? 1.1 : 1));
}

function yieldIndex(p: Practices, ctx: Context, disease: number) {
  const coverEffect =
    ctx.climate === "dry" ? { none: 0, legume: -2, grass: -4 } : { none: 0, legume: 3, grass: 0 };
  return Math.round(
    100 +
      (p.tillage === "reduced" ? tillageYield(ctx) : 0) +
      coverEffect[p.cover] -
      (disease - 25) * 0.2 +
      (p.traffic === "wet-season" ? (ctx.texture === "clay" ? -8 : -5) : 0),
  );
}

/** One field, year by year; carbon in whole kilograms, conserved exactly. */
export function runField(p: Practices, ctx: Context = DEFAULT_CONTEXT): Year[] {
  const climate = ctx.climate === "humid" ? 1.1 : 0.9;
  const clay = ctx.texture === "clay" ? 0.8 : 1;
  const coverGrowth = ctx.climate === "dry" ? 0.5 : 1;
  let shallow: number = CARBON.shallow0;
  let deep: number = CARBON.deep0;
  let air = 0;
  let added = 0;
  let aggregates = 50;
  let disease = 30;
  const years: Year[] = [];
  for (let year = 1; year <= YEARS; year++) {
    const input = CARBON.crop + Math.round(CARBON.cover[p.cover] * coverGrowth);
    const top = Math.round(input * CARBON.shallowShare[p.tillage]);
    shallow += top;
    deep += input - top;
    added += input;
    const lostTop = Math.round(shallow * CARBON.kShallow[p.tillage] * climate * clay);
    const lostDeep = Math.round(deep * CARBON.kDeep * climate * clay);
    shallow -= lostTop;
    deep -= lostDeep;
    air += lostTop + lostDeep;
    aggregates = ease(aggregates, aggregateTarget(p, ctx));
    disease = ease(disease, (p.rotation === "2-year" ? 70 : 25) + (ctx.drainage === "poor" ? 10 : 0));
    years.push({
      year,
      shallow,
      deep,
      air,
      added,
      aggregates,
      nitrate: nitrate(p, ctx),
      disease,
      yield: yieldIndex(p, ctx, disease),
    });
  }
  return years;
}

/** Mean yield difference, reduced tillage minus plough, other practices at their defaults. */
export function noTillEffect(ctx: Context): number {
  const mean = (ys: Year[]) => ys.reduce((a, y) => a + y.yield, 0) / ys.length;
  return (
    mean(runField({ ...DEFAULT_PRACTICES, tillage: "reduced" }, ctx)) - mean(runField(DEFAULT_PRACTICES, ctx))
  );
}

/** Practices that differ between two fields. */
export const differ = (a: Practices, b: Practices) =>
  (Object.keys(PRACTICES) as (keyof Practices)[]).filter((k) => a[k] !== b[k]);

/**
 * "Same seed, two fields" (c12-m5): one spinach variety in two fields, eight
 * zones each. North was ploughed, South under reduced tillage, but the zones
 * that matter are those with poor drainage: drainage raises a microbial signal
 * (the share of reads from an anaerobe-associated group) and lowers yield.
 * True values are deterministic; the readings carry seeded measurement noise.
 */
export interface Zone {
  id: string;
  field: "north" | "south";
  drainage: Context["drainage"];
  /** Share of reads, %, measured (± `SIGNAL_BAND`). */
  signal: number;
  /** t/ha, measured (± `YIELD_BAND`). */
  yield: number;
}
export const SIGNAL_BAND = 1.5;
export const YIELD_BAND = 1.2;

export function sameSeed(seed = 12): Zone[] {
  const zones: Zone[] = [];
  for (const field of ["north", "south"] as const)
    for (let i = 0; i < 8; i++) {
      // South lies lower: five of its eight zones drain poorly, against two of North's.
      const drainage = i < (field === "north" ? 2 : 5) ? "poor" : "good";
      const rng = mulberry32(hashSeed(seed, field === "north" ? 1 : 2, i));
      const signal = (drainage === "poor" ? 9 : 3) + gaussian(rng) * (SIGNAL_BAND / 2);
      const yld = (drainage === "poor" ? 22 : 30) + gaussian(rng) * (YIELD_BAND / 2);
      zones.push({
        id: `${field}-${i + 1}`,
        field,
        drainage,
        signal: Math.round(signal * 10) / 10,
        yield: Math.round(yld * 10) / 10,
      });
    }
  return zones;
}

/** Pearson correlation of signal and yield across the zones given. */
export function correlation(zones: Zone[]): number {
  const n = zones.length;
  const mx = zones.reduce((a, z) => a + z.signal, 0) / n;
  const my = zones.reduce((a, z) => a + z.yield, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const z of zones) {
    sxy += (z.signal - mx) * (z.yield - my);
    sxx += (z.signal - mx) ** 2;
    syy += (z.yield - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
}
