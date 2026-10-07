/**
 * Nodules and symbiotic N fixation (T22, chapter 8; `oldroyd-2013`,
 * `ott-2005`, `hoffman-2014`). Partners are specific: a legume answers only
 * the rhizobia whose signal it recognises, so pea and bean rhizobia are not
 * interchangeable, and spinach and sugar beet form no nodule at all. Inside an
 * effective nodule leghaemoglobin keeps oxygen low and the interior pink;
 * without it nitrogenase is destroyed and the nodule is white and fixes
 * nothing. Fixing is costly, so a plant with nitrate to hand makes fewer
 * nodules and fixes less.
 *
 * Integer ledger: N and C are conserved exactly at every tick. Teaching values:
 * direction, not prediction. Simplifications: one nodule count set at sowing,
 * fixed per-unit costs, a fixed daily N demand.
 */
import type { Crop } from "./trade";

export const RHIZOBIA = ["pea-rhizobia", "bean-rhizobia"] as const;
export type Rhizobia = (typeof RHIZOBIA)[number];
/** The rhizobia each crop answers; null where no nodule ever forms. */
export const NODULE_PARTNER: Record<Crop, Rhizobia | null> = {
  pea: "pea-rhizobia",
  bean: "bean-rhizobia",
  spinach: null,
  sugarbeet: null,
};

export type Knock = "nodule" | "refused" | "no-host";

/** A rhizobium meets a root: a nodule forms only between matched partners. */
export function knock(r: Rhizobia, crop: Crop): Knock {
  const partner = NODULE_PARTNER[crop];
  if (!partner) return "no-host";
  return partner === r ? "nodule" : "refused";
}

/** Inside a sliced nodule: leghaemoglobin keeps O₂ low and the interior pink; without it, white and idle. */
export function slice(effective: boolean) {
  return effective
    ? ({ colour: "pink", oxygen: "low", fixing: true } as const)
    : ({ colour: "white", oxygen: "high", fixing: false } as const);
}

/** Nitrate steps of the bench, teaching units of N in the root zone. */
export const NITRATE_STEPS = [0, 50, 100, 200, 400] as const;

export const NOD_RATES = {
  /** Nodules on a plant with no nitrate to hand. */
  maxNodules: 40,
  /** Nitrate at which the plant makes half as many. */
  halfNitrate: 60,
  /** N the plant can use in a day. */
  demand: 20,
  /** Share of soil nitrate the root takes per day, per mille. */
  nitrateUptake: 200,
  /** N one effective nodule fixes per day. */
  perNodule: 1,
  /** C spent per unit of N: fixing costs far more than taking up nitrate. */
  fixCost: 6,
  uptakeCost: 1,
} as const;

/** Nodules the plant makes at this much nitrate: fewer as nitrate rises. */
export const nodulesAt = (nitrate: number) =>
  Math.round((NOD_RATES.maxNodules * NOD_RATES.halfNitrate) / (NOD_RATES.halfNitrate + nitrate));

export interface FixSettings {
  crop: Crop;
  rhizobia: Rhizobia;
  nitrate: number;
  /** Nodules with leghaemoglobin (pink). Default true. */
  effective?: boolean;
}

export type NPool = "air" | "soil" | "plant";
export type FixCPool = "plant" | "co2";
export interface FixSnapshot {
  day: number;
  N: Record<NPool, number>;
  C: Record<FixCPool, number>;
  nodules: number;
  transfers: { element: "N" | "C"; from: string; to: string; amount: number; rule: string }[];
}

export class ConservationError extends Error {}

const AIR_N = 1_000_000;
const PLANT_C = 20_000;

export function runFix(s: FixSettings, days: number): FixSnapshot[] {
  const nodules = knock(s.rhizobia, s.crop) === "nodule" ? nodulesAt(s.nitrate) : 0;
  const fixing = nodules > 0 && slice(s.effective ?? true).fixing;
  const first: FixSnapshot = {
    day: 0,
    N: { air: AIR_N, soil: s.nitrate, plant: 0 },
    C: { plant: PLANT_C, co2: 0 },
    nodules,
    transfers: [],
  };
  const snaps = [first];
  const totals = { N: AIR_N + s.nitrate, C: PLANT_C };
  for (let day = 1; day <= days; day++) {
    const prev = snaps[day - 1]!;
    const N = { ...prev.N };
    const C = { ...prev.C };
    const transfers: FixSnapshot["transfers"] = [];
    const move = <P extends string>(
      e: "N" | "C",
      l: Record<P, number>,
      from: P,
      to: P,
      amount: number,
      rule: string,
    ) => {
      const a = Math.max(0, Math.min(amount, l[from]));
      l[from] -= a;
      l[to] += a;
      transfers.push({ element: e, from, to, amount: a, rule });
      return a;
    };
    const taken = move(
      "N",
      N,
      "soil",
      "plant",
      Math.min(NOD_RATES.demand, Math.floor((N.soil * NOD_RATES.nitrateUptake) / 1000)),
      "nitrate-uptake",
    );
    move("C", C, "plant", "co2", taken * NOD_RATES.uptakeCost, "nitrate-uptake");
    if (fixing) {
      const fixed = move(
        "N",
        N,
        "air",
        "plant",
        Math.min(NOD_RATES.demand - taken, nodules * NOD_RATES.perNodule),
        "bnf",
      );
      move("C", C, "plant", "co2", fixed * NOD_RATES.fixCost, "bnf");
    }
    const sum = (l: Record<string, number>) => Object.values(l).reduce((a, b) => a + b, 0);
    if (sum(N) !== totals.N) throw new ConservationError(`N total ${sum(N)} ≠ ${totals.N}`);
    if (sum(C) !== totals.C) throw new ConservationError(`C total ${sum(C)} ≠ ${totals.C}`);
    snaps.push({ day, N, C, nodules, transfers });
  }
  return snaps;
}

/** Over a run: N fixed, nitrate taken up, and C spent on each. */
export function fixAccount(snaps: FixSnapshot[]) {
  const sum = (e: "N" | "C", rule: string) =>
    snaps
      .flatMap((s) => s.transfers)
      .reduce((a, t) => a + (t.element === e && t.rule === rule ? t.amount : 0), 0);
  return {
    fixed: sum("N", "bnf"),
    nitrate: sum("N", "nitrate-uptake"),
    cFix: sum("C", "bnf"),
    cUptake: sum("C", "nitrate-uptake"),
  };
}
