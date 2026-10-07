/**
 * Food-web bench (T20, chapter 6). Grazing rules over a small web: microbes
 * eat dissolved food, grazers eat microbes, predators eat grazers. Every meal
 * is an integer transfer of C and N; a grazer keeps part of the carbon, breathes
 * the rest and excretes the nitrogen its body cannot use as ammonium, which the
 * root takes up (the microbial loop, `clarholm-1985`, `bonkowski-2004`).
 * Rates and body C:N are teaching values: they get direction right, not numbers.
 *
 * Simplifications: one pool per group; no encystment, no phages; drying only
 * slows movement in water films; plant uptake is NH₄⁺ only, at a fixed rate.
 */
import { ConservationError } from "./ledger";

export const WEB_ORGANISMS = [
  "bacteria-copio",
  "fungi-sap",
  "amoeba",
  "nematode-bact",
  "nematode-fung",
  "springtail",
  "nematode-pred",
  "mite",
] as const;
export type WebOrganism = (typeof WEB_ORGANISMS)[number];
/** `supply` is the root's exudate reservoir; `food` is dissolved organic matter. */
export type WebPool = WebOrganism | "supply" | "food";
export type WebChannel = "bacterial" | "fungal";

export interface WebLink {
  eater: WebOrganism;
  eaten: WebOrganism | "food";
  channel: WebChannel;
  /** Per-day teaching rate at full movement. */
  k: number;
}

/** Who eats whom. A link is a teaching rule, not a measured feeding rate. */
export const WEB_LINKS: WebLink[] = [
  { eater: "bacteria-copio", eaten: "food", channel: "bacterial", k: 0.6 },
  { eater: "fungi-sap", eaten: "food", channel: "fungal", k: 0.15 },
  { eater: "amoeba", eaten: "bacteria-copio", channel: "bacterial", k: 0.5 },
  { eater: "nematode-bact", eaten: "bacteria-copio", channel: "bacterial", k: 0.25 },
  { eater: "nematode-fung", eaten: "fungi-sap", channel: "fungal", k: 0.25 },
  { eater: "springtail", eaten: "fungi-sap", channel: "fungal", k: 0.2 },
  { eater: "nematode-pred", eaten: "nematode-bact", channel: "bacterial", k: 0.2 },
  { eater: "nematode-pred", eaten: "nematode-fung", channel: "fungal", k: 0.2 },
  { eater: "mite", eaten: "springtail", channel: "fungal", k: 0.2 },
  { eater: "mite", eaten: "nematode-fung", channel: "fungal", k: 0.1 },
];

export const linkId = (l: Pick<WebLink, "eater" | "eaten">) => `${l.eater}>${l.eaten}`;

/** Body C:N, teaching values: bacteria are N-rich, fungi less so, grazers in between. */
export const WEB_CN: Record<WebOrganism, number> = {
  "bacteria-copio": 5,
  "fungi-sap": 10,
  amoeba: 8,
  "nematode-bact": 9,
  "nematode-fung": 9,
  springtail: 8,
  "nematode-pred": 9,
  mite: 8,
};

/**
 * How much each eater still moves when the soil dries. Protists and nematodes
 * swim in water films; springtails and mites walk through air-filled pores.
 */
export const MOVES_WHEN_DRY: Record<WebOrganism, number> = {
  "bacteria-copio": 0.6,
  "fungi-sap": 0.9,
  amoeba: 0.15,
  "nematode-bact": 0.2,
  "nematode-fung": 0.2,
  springtail: 0.8,
  "nematode-pred": 0.2,
  mite: 0.8,
};

export const WEB_RATES = {
  supply: 0.04, // exudate reservoir → dissolved food
  eff: 0.35, // share of eaten C kept as body
  half: 400, // eater biomass at half its maximum appetite
  resp: 0.01, // maintenance respiration
  death: 0.03, // death → dissolved food
  uptake: 0.15, // root uptake of NH₄⁺
} as const;

export type WebWater = "moist" | "dry";

export interface WebSettings {
  water: WebWater;
  /** Organisms taken out of the web before the run. */
  removed?: WebOrganism[];
  /** An exudate pulse at day 0 (C), at food C:N. */
  pulse?: number;
}

const FOOD_CN = 20;
const START: Record<WebOrganism, number> = {
  "bacteria-copio": 300,
  "fungi-sap": 400,
  amoeba: 40,
  "nematode-bact": 30,
  "nematode-fung": 30,
  springtail: 30,
  "nematode-pred": 15,
  mite: 15,
};

export type WebPools = Record<WebPool | "co2" | "nh4" | "plant", number>;
export interface WebLedger {
  C: WebPools;
  N: WebPools;
}
export interface WebTransfer {
  element: "C" | "N";
  from: string;
  to: string;
  amount: number;
  rule: string;
}
export interface WebSnapshot {
  day: number;
  ledger: WebLedger;
  transfers: WebTransfer[];
}

const POOLS = ["supply", "food", ...WEB_ORGANISMS, "co2", "nh4", "plant"] as const;
const zero = () => Object.fromEntries(POOLS.map((p) => [p, 0])) as WebPools;
const sum = (p: WebPools) => Object.values(p).reduce((a, b) => a + b, 0);

export function webInitial(s: WebSettings): WebLedger {
  const l: WebLedger = { C: zero(), N: zero() };
  l.C.supply = 20_000;
  l.N.supply = 20_000 / FOOD_CN;
  l.C.food = s.pulse ?? 0;
  l.N.food = Math.round((s.pulse ?? 0) / FOOD_CN);
  for (const o of WEB_ORGANISMS) {
    if (s.removed?.includes(o)) continue;
    l.C[o] = START[o];
    l.N[o] = Math.round(START[o] / WEB_CN[o]);
  }
  l.N.nh4 = 20;
  return l;
}

/** Run the web day by day; throws if C or N is not conserved exactly. */
export function runWeb(s: WebSettings, days: number): WebSnapshot[] {
  const l = webInitial(s);
  const expected = { C: sum(l.C), N: sum(l.N) };
  const carries: Record<string, number> = {};
  const flux = (key: string, amount: number) => {
    const raw = amount + (carries[key] ?? 0);
    const whole = Math.max(0, Math.floor(raw));
    carries[key] = raw - whole;
    return whole;
  };
  const snaps: WebSnapshot[] = [{ day: 0, ledger: clone(l), transfers: [] }];
  for (let day = 1; day <= days; day++) {
    const start = clone(l);
    const out: WebTransfer[] = [];
    const move = (e: "C" | "N", from: string, to: string, amount: number, rule: string) => {
      const k = from as keyof WebPools;
      const moved = Math.max(0, Math.min(amount, l[e][k]));
      if (moved <= 0) return 0;
      l[e][k] -= moved;
      l[e][to as keyof WebPools] += moved;
      out.push({ element: e, from, to, amount: moved, rule });
      return moved;
    };
    const ratio = (p: WebPool) => (start.C[p] > 0 ? start.N[p] / start.C[p] : 0);

    move("C", "supply", "food", flux("supply-c", start.C.supply * WEB_RATES.supply), "exudation");
    move("N", "supply", "food", flux("supply-n", start.N.supply * WEB_RATES.supply), "exudation");

    for (const link of WEB_LINKS) {
      const eater = start.C[link.eater];
      const prey = start.C[link.eaten];
      if (eater <= 0 || prey <= 0) continue;
      const moves = s.water === "dry" ? MOVES_WHEN_DRY[link.eater] : 1;
      const rule = `eat:${linkId(link)}`;
      const appetite = (link.k * moves * eater) / (eater + WEB_RATES.half);
      const ateC = move("C", link.eaten, link.eater, flux(`${rule}:c`, prey * appetite), rule);
      const ateN = move("N", link.eaten, link.eater, flux(`${rule}:n`, ateC * ratio(link.eaten)), rule);
      // Keep part of the carbon; the body sets how much N it can hold. The rest leaves.
      const cn = WEB_CN[link.eater];
      const keepC = Math.min(flux(`${rule}:eff`, ateC * WEB_RATES.eff), Math.floor((ateN + l.N.nh4) * cn));
      move("C", link.eater, "co2", ateC - keepC, "respiration");
      const needN = Math.ceil(keepC / cn);
      if (ateN > needN) move("N", link.eater, "nh4", ateN - needN, `excretion:${link.eater}`);
      else move("N", "nh4", link.eater, needN - ateN, "immobilisation");
    }

    for (const o of WEB_ORGANISMS) {
      const c = start.C[o];
      if (c <= 0) continue;
      const resp = move("C", o, "co2", flux(`resp:${o}`, c * WEB_RATES.resp), "respiration");
      move("N", o, "nh4", flux(`resp-n:${o}`, resp * ratio(o)), `excretion:${o}`);
      const dead = move("C", o, "food", flux(`death:${o}`, c * WEB_RATES.death), "death");
      move("N", o, "food", flux(`death-n:${o}`, dead * ratio(o)), "death");
    }
    move("N", "nh4", "plant", flux("uptake", start.N.nh4 * WEB_RATES.uptake), "root-uptake");

    for (const e of ["C", "N"] as const) {
      if (sum(l[e]) !== expected[e]) throw new ConservationError(`${e} total ${sum(l[e])} ≠ ${expected[e]}`);
      for (const [p, v] of Object.entries(l[e]))
        if (v < 0 || !Number.isInteger(v)) throw new ConservationError(`${e}.${p} = ${v}`);
    }
    snaps.push({ day, ledger: clone(l), transfers: out });
  }
  return snaps;
}

function clone(l: WebLedger): WebLedger {
  return { C: { ...l.C }, N: { ...l.N } };
}

/** Links seen feeding during the run, optionally only those that involve `watched`. */
export function observedLinks(snaps: WebSnapshot[], watched?: WebOrganism): string[] {
  const seen = new Set<string>();
  for (const s of snaps)
    for (const t of s.transfers) {
      if (!t.rule.startsWith("eat:") || t.element !== "C" || t.amount <= 0) continue;
      const id = t.rule.slice(4);
      const [eater, eaten] = id.split(">");
      if (!watched || eater === watched || eaten === watched) seen.add(id);
    }
  return WEB_LINKS.map(linkId).filter((id) => seen.has(id));
}

/** Relative abundance (share of total biomass C) of the listed organisms: what a sequencing readout shows. */
export function relative(l: WebLedger, taxa: readonly WebOrganism[]): Record<string, number> {
  const all = taxa.reduce((a, t) => a + l.C[t], 0);
  return Object.fromEntries(taxa.map((t) => [t, all > 0 ? l.C[t] / all : 0]));
}
