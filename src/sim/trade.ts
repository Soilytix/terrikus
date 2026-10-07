/**
 * The root exchange (T22, chapter 8; `smith-2003`, `brundrett-tedersoo-2018`).
 * A root takes the P it can reach from its depletion zone; an arbuscular
 * mycorrhizal fungus reaches past it with hyphae and swaps that P for the
 * plant's carbon inside a cortex cell. The plant takes from its own roots first
 * and from the fungus only what it still lacks, but it keeps the fungus fed
 * either way: at low soil P the trade pays, at high P the fungus is a cost.
 * Spinach and sugar beet typically form no mycorrhiza, so no fungus ever joins
 * them; they reach with root hairs or release P with organic acids instead.
 *
 * Integer ledger: P and C are conserved exactly at every tick. Teaching values:
 * direction, not prediction. Simplifications: one plant, one fungus, a fixed
 * daily P demand; real plants also cut colonisation back at high P.
 */
import { sorptionDay, type Ph, type PLedger, type PPool } from "./sorption";

export const CROPS = ["pea", "bean", "spinach", "sugarbeet"] as const;
export type Crop = (typeof CROPS)[number];
/** Arbuscular mycorrhizal hosts. Amaranthaceae (spinach, sugar beet) typically are not. */
export const AM_HOST: Record<Crop, boolean> = { pea: true, bean: true, spinach: false, sugarbeet: false };

export type SoilP = "low" | "medium" | "high";
export type Strategy = "hairs" | "fungus" | "acids";
export type CPool = "plant" | "fungus" | "roots";

export interface TradeSettings {
  crop: Crop;
  soilP: SoilP;
  ph: Ph;
  strategies: Strategy[];
}

export interface TradeTransfer {
  element: "P" | "C";
  from: string;
  to: string;
  amount: number;
  rule: string;
}
export interface TradeSnapshot {
  day: number;
  P: PLedger;
  C: Record<CPool, number>;
  transfers: TradeTransfer[];
}

export class ConservationError extends Error {}

/** Starting P by soil P status: dissolved near the root, dissolved beyond it, bound. */
export const SOIL_P: Record<SoilP, Pick<PLedger, "near" | "beyond" | "sorbed">> = {
  low: { near: 10, beyond: 150, sorbed: 1500 },
  medium: { near: 60, beyond: 600, sorbed: 1500 },
  high: { near: 120, beyond: 1800, sorbed: 1500 },
};

/** Per day, per mille unless named otherwise. */
export const RATES = {
  /** P the plant can use in a day. */
  demand: 12,
  /** Share of near P the root takes. */
  root: 300,
  /** Share of beyond P root hairs reach. */
  hairs: 40,
  /** Share of beyond P hyphae reach. */
  hyphae: 120,
  /** P a fungus holds before it stops taking more. */
  fungusHold: 40,
  /** C the plant feeds a colonising fungus each day, trade or no trade. */
  upkeep: 30,
  /** C paid per unit of P handed over in the arbuscule. */
  price: 4,
  /** C spent growing hairs, or released as organic acids, each day. */
  hairCost: 10,
  acidCost: 20,
} as const;

const PLANT_C = 20_000;
const part = (x: number, perMille: number) => Math.floor((x * perMille) / 1000);

/** Does a mycorrhizal fungus colonise this crop at all? */
export const hasFungus = (s: Pick<TradeSettings, "crop" | "strategies">) =>
  AM_HOST[s.crop] && s.strategies.includes("fungus");

export function tradeInitial(s: TradeSettings): TradeSnapshot {
  return {
    day: 0,
    P: { ...SOIL_P[s.soilP], fungus: 0, plant: 0 },
    C: { plant: PLANT_C, fungus: 0, roots: 0 },
    transfers: [],
  };
}

export function runTrade(s: TradeSettings, days: number): TradeSnapshot[] {
  const snaps = [tradeInitial(s)];
  const totalP = Object.values(snaps[0]!.P).reduce((a, b) => a + b, 0);
  const totalC = Object.values(snaps[0]!.C).reduce((a, b) => a + b, 0);
  const fungus = hasFungus(s);
  const acids = s.strategies.includes("acids");
  const hairs = s.strategies.includes("hairs");

  for (let day = 1; day <= days; day++) {
    const prev = snaps[day - 1]!;
    const P = { ...prev.P };
    const C = { ...prev.C };
    const transfers: TradeTransfer[] = [];
    const moveP = (from: PPool, to: PPool, amount: number, rule: string) => {
      const a = Math.max(0, Math.min(amount, P[from]));
      P[from] -= a;
      P[to] += a;
      transfers.push({ element: "P", from, to, amount: a, rule });
      return a;
    };
    const moveC = (from: CPool, to: CPool, amount: number, rule: string) => {
      const a = Math.max(0, Math.min(amount, C[from]));
      C[from] -= a;
      C[to] += a;
      transfers.push({ element: "C", from, to, amount: a, rule });
      return a;
    };

    for (const t of sorptionDay(prev.P, s.ph, acids)) moveP(t.from, t.to, t.amount, t.rule);
    if (acids) moveC("plant", "roots", RATES.acidCost, "acid-release");
    if (hairs) moveC("plant", "roots", RATES.hairCost, "root-hairs");

    let got = moveP("near", "plant", Math.min(RATES.demand, part(P.near, RATES.root)), "root-uptake");
    if (hairs)
      got += moveP(
        "beyond",
        "plant",
        Math.min(RATES.demand - got, part(P.beyond, RATES.hairs)),
        "root-hairs",
      );

    if (fungus) {
      moveC("plant", "fungus", RATES.upkeep, "myco-upkeep");
      moveP(
        "beyond",
        "fungus",
        Math.min(RATES.fungusHold - P.fungus, part(P.beyond, RATES.hyphae)),
        "hyphae",
      );
      const handed = moveP("fungus", "plant", RATES.demand - got, "myco-trade");
      moveC("plant", "fungus", handed * RATES.price, "myco-trade");
    }

    const sumP = Object.values(P).reduce((a, b) => a + b, 0);
    const sumC = Object.values(C).reduce((a, b) => a + b, 0);
    if (sumP !== totalP) throw new ConservationError(`P total ${sumP} ≠ ${totalP}`);
    if (sumC !== totalC) throw new ConservationError(`C total ${sumC} ≠ ${totalC}`);
    snaps.push({ day, P, C, transfers });
  }
  return snaps;
}

const total = (snaps: TradeSnapshot[], element: "P" | "C", rule: string) =>
  snaps
    .flatMap((s) => s.transfers)
    .reduce((a, t) => a + (t.element === element && t.rule === rule ? t.amount : 0), 0);

/** Over a run: P the fungus handed over, C the plant paid for it (upkeep and price), and P per 100 C. */
export function tradeAccount(snaps: TradeSnapshot[]) {
  const pReceived = total(snaps, "P", "myco-trade");
  const cPaid = total(snaps, "C", "myco-upkeep") + total(snaps, "C", "myco-trade");
  return { pReceived, cPaid, perHundredC: cPaid ? Math.round((1000 * pReceived) / cPaid) / 10 : 0 };
}
