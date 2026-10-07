/**
 * Water potential for chapter 3 (world-bible §6, Water Roads). Teaching rules
 * that get the direction right, not the numbers: the capillary rule
 * d ≈ 300 / |ψ| (or-2007), films as roads on the chapter 1 film graph, the
 * Birch pulse on the integer ledger (schimel-2018), and a matrix front that
 * worm burrows bypass (blouin-2013).
 */
import type { FilmGraph, Moisture } from "./films";
import { hop } from "./films";
import { assertConserved, cloneLedger, emptyLedger, total, transfer, type Ledger } from "./ledger";

/** Matric potential, kPa: 0 is saturated, more negative is drier. */
export type Kpa = number;

/** The slider's stops, from saturation to the wilting-point convention. */
export const PSI_STEPS: readonly Kpa[] = [0, -1, -3, -10, -33, -100, -300, -1500];
/** Conventions, not constants (cornell-awc, meter-paw-note). */
export const FIELD_CAPACITY: Kpa = -33;
export const WILTING_POINT: Kpa = -1500;

/** Widest pore still full of water at ψ, µm: d ≈ 300 / |ψ| (water at about 20 °C). */
export const drainedAbove = (psi: Kpa) => (psi >= 0 ? Infinity : 300 / Math.abs(psi));

export interface Pore {
  id: string;
  label: string;
  /** Neck width, µm. */
  width: number;
  /** Plate units (0..1), shared by the `c3-drain` recipe and the panel map. */
  x: number;
  y: number;
}

/** The pores of `c3-drain`, from a crack between crumbs down to the gaps between clay platelets. */
export const DRAIN_PORES: Pore[] = [
  { id: "crack", label: "Crack between crumbs", width: 500, x: 0.18, y: 0.3 },
  { id: "macro", label: "Wide pore", width: 150, x: 0.42, y: 0.22 },
  { id: "meso", label: "Middle pore", width: 50, x: 0.68, y: 0.3 },
  { id: "small", label: "Small pore", width: 20, x: 0.8, y: 0.56 },
  { id: "fine", label: "Fine pore", width: 5, x: 0.56, y: 0.68 },
  { id: "micro", label: "Very fine pore", width: 2, x: 0.34, y: 0.62 },
  { id: "clay", label: "Gap between clay platelets", width: 0.1, x: 0.2, y: 0.72 },
];

/** Pores drained at ψ, widest first. */
export const drained = (pores: Pore[], psi: Kpa) =>
  pores
    .filter((p) => p.width > drainedAbove(psi))
    .sort((a, b) => b.width - a.width)
    .map((p) => p.id);

/**
 * S5 uniforms for ψ: film thickness falls with the log of the pull, and the
 * share of pores still full sets how far the fill reaches. Both 0..1.
 */
export function filmLook(psi: Kpa) {
  const film = 1 - Math.log10(1 + Math.abs(psi)) / Math.log10(1 - WILTING_POINT);
  const fill = 1 - drained(DRAIN_PORES, psi).length / DRAIN_PORES.length;
  return { film: Math.max(0, film), fill };
}

/** Film-graph moisture at ψ: wet films span wide necks; below about −100 kPa they break. */
export const moistureAt = (psi: Kpa): Moisture => (psi >= -10 ? "wet" : psi >= -100 ? "moist" : "dry");

/** `c3-m2` drying clock: ψ at each hop the amoeba makes, then it stays at the last. */
export const DRYING: readonly Kpa[] = [-5, -20, -60, -300, -1500];

/** The `c3-m2` network: a short road through wide pores and a longer one along films in the corners. */
export const STRANDED: FilmGraph = {
  sites: [
    { id: "start", label: "Where you start", x: 0.14, y: 0.5, width: 40 },
    { id: "hall", label: "Wide pore", x: 0.46, y: 0.3, width: 80 },
    { id: "food", label: "Bacteria to eat", x: 0.84, y: 0.46, width: 50, cells: 100, food: 20 },
    { id: "corner-a", label: "Corner film, near", x: 0.34, y: 0.72, width: 15 },
    { id: "corner-b", label: "Corner film, far", x: 0.62, y: 0.76, width: 15 },
  ],
  necks: [
    { a: "start", b: "hall", holds: "wet" },
    { a: "hall", b: "food", holds: "wet" },
    { a: "start", b: "corner-a", holds: "moist" },
    { a: "corner-a", b: "corner-b", holds: "moist" },
    { a: "corner-b", b: "food", holds: "moist" },
  ],
};

export const psiAtTick = (tick: number) => DRYING[Math.min(tick, DRYING.length - 1)]!;

/** One hop of `c3-m2` after `tick` earlier hops: the soil has dried that far. */
export const strandedHop = (at: string, to: string, tick: number) =>
  hop(STRANDED, at, to, moistureAt(psiAtTick(tick)));

/** Birch run length, days. */
export const BIRCH_DAYS = 28;
/** Old soil organic C at the start, teaching units. */
const BIRCH_O = 100_000;
/** Per mille of O per day: freed as labile C while dry (dead cells, osmolytes, exposed organic matter). */
const DRY_RELEASE = 3;
/** Per mille of O per day respired while dry and while moist. */
const DRY_RESP = 0.5;
const MOIST_RESP = 2;
/** Per cent of the stored labile C respired each moist day. */
const LABILE_RESP = 40;

/**
 * Birch pulse (`c3-m3`): `dryDays` of drought, then rewetting (or not). While
 * dry, activity is low and labile C builds up; once wet it is respired in a
 * burst that decays. Which source the labile C came from is not modelled: the
 * literature cannot yet separate them (schimel-2018).
 */
export function birch({ dryDays, rewet }: { dryDays: number; rewet: boolean }) {
  const l: Ledger = emptyLedger();
  l.C.O = BIRCH_O;
  const start = total(l, "C");
  const ledgers = [cloneLedger(l)];
  const co2: number[] = [];
  const labile: number[] = [];
  for (let d = 0; d < BIRCH_DAYS; d++) {
    const before = l.C.co2Out;
    const dry = d < dryDays || !rewet;
    if (dry) {
      transfer(l, "C", "O", "D", Math.floor((l.C.O * DRY_RELEASE) / 1000));
      transfer(l, "C", "O", "co2Out", Math.floor((l.C.O * DRY_RESP) / 1000));
    } else {
      transfer(l, "C", "D", "co2Out", Math.floor((l.C.D * LABILE_RESP) / 100));
      transfer(l, "C", "O", "co2Out", Math.floor((l.C.O * MOIST_RESP) / 1000));
    }
    assertConserved(l, { C: start, N: 0 });
    co2.push(l.C.co2Out - before);
    labile.push(l.C.D);
    ledgers.push(cloneLedger(l));
  }
  return { co2, labile, ledgers, start, rewetDay: dryDays };
}

/** Burrows in the `c3-rain-profile` column. */
export const BURROWS = 3;
/** Depth of the profile drawn, cm, and of an anecic burrow. */
export const PROFILE_CM = 120;
const BURROW_CM = 100;
/** Rain steps of ten minutes. */
export const RAIN_STEPS = 8;

/**
 * Heavy rain on the profile (`c3-m4`). The matrix front moves as √t whatever
 * the burrows do; with burrows, water also runs down them, so the deepest wet
 * soil is far below the front.
 */
export function infiltrate(burrows: number) {
  return Array.from({ length: RAIN_STEPS + 1 }, (_, t) => {
    const front = Math.floor(6 * Math.sqrt(t));
    const deepest = burrows > 0 ? Math.max(front, Math.min(BURROW_CM, 30 * t)) : front;
    return { minutes: t * 10, front, deepest };
  });
}

/** S6 uniforms: the front's depth and how far the fingers reach below it, both 0..1 of the profile. */
export function frontLook(s: { front: number; deepest: number }, burrows: number) {
  return {
    front: s.front / PROFILE_CM,
    fingering: burrows > 0 ? (s.deepest - s.front) / PROFILE_CM : 0,
  };
}
