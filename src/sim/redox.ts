/**
 * Redox rules for chapter 4 (Breath and Rust). Microbes hand the electrons of
 * organic matter to the acceptor that yields most energy first, and move down
 * the ladder only when it is spent (`borch-2010`). Electrons are integer and
 * conserved: donor + reduced products + re-oxidised = start. Rates and pool
 * sizes are teaching values: they get the order and direction right, not the
 * numbers.
 *
 * Simplifications: one well-mixed column, no Eh gradient with depth; Mn and Fe
 * share one elevator floor on screen; CH₄ is counted as made, not as emitted
 * (no oxidation in the surface film or transport through rice aerenchyma);
 * nitrate's rung is a fixed stock here, while the N₂O curve comes from the
 * nitrogen engine (`nitrogen.ts`) running beside it.
 */
import { run } from "./engine";
import { leafJar, type LeverSettings } from "./benches/leaf-jar";
import type { Ledger } from "./ledger";
import { WATER } from "./modifiers";
import { RAIN, RESIDUE_CN, withNitrogen } from "./nitrogen";

export type RungId = "O2" | "NO3" | "Mn" | "Fe" | "SO4" | "CO2";
/** Rungs with a finite stock; CO₂ for methanogenesis never runs out here. */
export type Acceptor = Exclude<RungId, "CO2">;

export interface Rung {
  id: RungId;
  acceptor: string;
  product: string;
  process: string;
  /** Approximate Eh at pH 7, mV (`borch-2010`, estimate). */
  eh: number;
}

/** In order of falling energy yield. Mn and Fe span +100 to −100 mV together. */
export const LADDER: readonly Rung[] = [
  { id: "O2", acceptor: "O₂", product: "H₂O", process: "aerobic respiration", eh: 350 },
  { id: "NO3", acceptor: "NO₃⁻", product: "N₂O and N₂", process: "denitrification", eh: 250 },
  { id: "Mn", acceptor: "Mn(IV)", product: "Mn²⁺", process: "manganese reduction", eh: 100 },
  { id: "Fe", acceptor: "Fe(III)", product: "Fe²⁺", process: "iron reduction", eh: -100 },
  { id: "SO4", acceptor: "SO₄²⁻", product: "H₂S", process: "sulfate reduction", eh: -150 },
  { id: "CO2", acceptor: "CO₂", product: "CH₄", process: "methanogenesis", eh: -250 },
];
const RUNGS = LADDER.map((r) => r.id);
const ACCEPTORS = RUNGS.filter((id): id is Acceptor => id !== "CO2");

/** Acceptor stock of a freshly aerated column, electron units (teaching values; iron is the largest). */
export const CAPACITY: Record<Acceptor, number> = { O2: 300, NO3: 300, Mn: 600, Fe: 2400, SO4: 900 };
/** Electrons in organic matter at the start of a season. */
export const DONOR = 40_000;

export interface Column {
  donor: number;
  stock: Record<Acceptor, number>;
  /** Electrons each rung has taken so far. */
  reduced: Record<RungId, number>;
  /** Electrons that left reduced products when air came back. */
  reoxidised: number;
}

export function column(donor = DONOR): Column {
  return {
    donor,
    stock: { ...CAPACITY },
    reduced: { O2: 0, NO3: 0, Mn: 0, Fe: 0, SO4: 0, CO2: 0 },
    reoxidised: 0,
  };
}

export const conserved = (c: Column) =>
  c.donor + RUNGS.reduce((n, id) => n + c.reduced[id], 0) + c.reoxidised;

/** The rung microbes use now: the highest with acceptor left. */
export const activeRung = (c: Column): RungId => ACCEPTORS.find((id) => c.stock[id] > 0) ?? "CO2";

/** The acceptor card that comes after those already collected, if any. */
export const nextCard = (collected: RungId[]): RungId | undefined => RUNGS[collected.length];

/** Oxidise up to `electrons` of organic matter, top rung first; returns what each rung took. */
export function respire(c: Column, electrons: number): Record<RungId, number> {
  const used: Record<RungId, number> = { O2: 0, NO3: 0, Mn: 0, Fe: 0, SO4: 0, CO2: 0 };
  let left = Math.min(electrons, c.donor);
  c.donor -= left;
  for (const id of ACCEPTORS) {
    const take = Math.min(left, c.stock[id]);
    c.stock[id] -= take;
    used[id] = take;
    left -= take;
  }
  used.CO2 = left;
  for (const id of RUNGS) c.reduced[id] += used[id];
  return used;
}

/**
 * Air returns: O₂ refills, and `share` of the reduced Mn, Fe and S is oxidised
 * back, so the ladder starts again from the top with more acceptor below it.
 * Nitrate is not remade here (that is nitrification, in the nitrogen engine);
 * CH₄ already made is gone.
 */
export function aerate(c: Column, share = 1): void {
  c.stock.O2 = CAPACITY.O2;
  for (const id of ["Mn", "Fe", "SO4"] as const) {
    const back = Math.min(Math.floor(c.reduced[id] * share), CAPACITY[id] - c.stock[id]);
    c.stock[id] += back;
    c.reduced[id] -= back;
    c.reoxidised += back;
  }
}

/**
 * Anaerobic microsites (`keiluweit-2017`): O₂ reaches only so far into an
 * aggregate before respiration uses it up, and far less far once pores fill
 * with water, where it diffuses about 10⁴ times more slowly. Depths and radii
 * are teaching values, millimetres.
 */
export const ANOXIC_WATER = { moist: 3, wet: 1, flooded: 0.1 } as const;
export const AGGREGATE = { small: 0.25, large: 4 } as const;
export type Wetness = keyof typeof ANOXIC_WATER;
export type AggregateSize = keyof typeof AGGREGATE;

/** Per cent of a round aggregate's volume beyond O₂'s reach. */
export function anoxicShare(water: Wetness, size: AggregateSize): number {
  const r = AGGREGATE[size];
  const core = Math.max(0, r - ANOXIC_WATER[water]);
  return Math.round(100 * (core / r) ** 3);
}

export const REGIMES = ["flooded", "intermittent"] as const;
export type Regime = (typeof REGIMES)[number];
export const PADDY_DAYS = 100;
/** Electrons of organic matter oxidised per day (teaching value). */
const RATE = 300;
/** Share of reduced Mn, Fe and S oxidised back on each drained day (teaching value). */
const REOX = 0.05;

/** Intermittent: flooded to settle the crop, then 5 days drained in every 14. */
export const isFlooded = (regime: Regime, day: number) =>
  regime === "flooded" || day <= 20 || (day - 21) % 14 >= 5;

export interface PaddyDay {
  day: number;
  flooded: boolean;
  rung: RungId;
  /** CH₄ made that day, teaching units. */
  ch4: number;
  /** N₂O-N lost that day, teaching units: the nitrogen engine's n2oOut. */
  n2o: number;
}

const paddyLevers = (water: LeverSettings["water"]): LeverSettings => ({
  water,
  temperature: "mild",
  residue: "straw",
});
const paddyN = (water: LeverSettings["water"]) =>
  withNitrogen(leafJar(paddyLevers(water)), {
    wfps: WATER[water].wfps,
    celsius: 20,
    rain: RAIN.dry,
    residueCN: RESIDUE_CN.straw,
    mineralN: { NH4: 4000, NO3: 200 },
  });

/** One season of a paddy under a water regime: the methane and nitrous-oxide curves, nothing summed. */
export function paddySeason(regime: Regime): { days: PaddyDay[]; ledger: { first: Ledger; last: Ledger } } {
  const wet = paddyN("waterlogged");
  const dry = paddyN("moist");
  const snaps = run(
    { ...wet, step: (l, s, day) => (isFlooded(regime, day) ? wet : dry).step(l, s, day) },
    PADDY_DAYS,
  );
  const c = column();
  const days = snaps.slice(1).map((s): PaddyDay => {
    const flooded = isFlooded(regime, s.day);
    if (!flooded) aerate(c, REOX);
    const rung = activeRung(c);
    const used = respire(c, RATE);
    const n2o = s.transfers.filter((t) => t.to === "n2oOut").reduce((n, t) => n + t.amount, 0);
    return { day: s.day, flooded, rung, ch4: used.CO2, n2o };
  });
  return { days, ledger: { first: snaps[0]!.ledger, last: snaps[PADDY_DAYS]!.ledger } };
}
