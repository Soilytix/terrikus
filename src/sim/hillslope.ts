/**
 * Chapter 13 (world-bible §6, Hillslope and River). Teaching rules that get the
 * direction right, not the numbers: raindrop splash on bare and covered soil,
 * a storm that moves tagged topsoil and the phosphorus bound to it down the
 * slope to the river, and decades of irrigation with and without drainage.
 * Soil, phosphorus and salt are integer units moved between named pools, so
 * each total is conserved exactly; the rates are invented teaching values.
 */

export type Cover = "bare" | "thin" | "full";
export type Rain = "gentle" | "intense";

/** Share of the ground the residue covers. */
export const COVER: Record<Cover, number> = { bare: 0, thin: 0.3, full: 0.7 };
/** Share of exposed surface crumbs one storm's drops break loose. */
const SPLASH: Record<Rain, number> = { gentle: 0.15, intense: 0.6 };
/** Surface crumbs on the splash plot. */
export const CRUMBS = 100;
/** Soil each loose crumb stands for once runoff carries it off, t per hectare. */
const T_PER_CRUMB = 0.2;
/** Bulk density, t per m³: one millimetre over a hectare is 13 t. */
const BULK = 1.3;

/** One storm on the splash plot: crumbs broken loose, soil carried off and the surface it lowered. */
export function splash(cover: Cover, rain: Rain) {
  const loose = Math.round(CRUMBS * SPLASH[rain] * (1 - COVER[cover]));
  const tPerHa = Math.round(loose * T_PER_CRUMB * 10) / 10;
  return { loose, tPerHa, mm: Math.round((tPerHa / (BULK * 10)) * 100) / 100 };
}

export type SoilPool = "slope" | "foot" | "river";
export type PPool = "slope" | "foot" | "river" | "dissolved" | "algae";
export interface Valley {
  soil: Record<SoilPool, number>;
  p: Record<PPool, number>;
}

/** Tagged topsoil on the slope fields and the phosphorus it holds. */
export const TAGGED = 100_000;
export const P_START = 2_000;
/** Share of the slope's tagged soil one intense storm moves off bare ground. */
const DETACH = 0.04;
/** Eroded soil is the fine, organic-rich top, so it carries more P per unit than the slope keeps. */
const ENRICH = 2;
/** Share of the moving soil a grass strip at the foot of the slope traps. */
const TRAP = { none: 0.3, strip: 0.7 } as const;
export type Strip = keyof typeof TRAP;
/** Share of the slope's P that leaves dissolved in drainage, per storm: small. */
const LEACH_P = 0.001;
/** River P above which, weeks later, algae bloom. */
export const BLOOM_P = 40;

export const valley = (): Valley => ({
  soil: { slope: TAGGED, foot: 0, river: 0 },
  p: { slope: P_START, foot: 0, river: 0, dissolved: 0, algae: 0 },
});

function move<K extends string>(pools: Record<K, number>, from: K, to: K, amount: number) {
  const moved = Math.max(0, Math.min(Math.floor(amount), pools[from]));
  pools[from] -= moved;
  pools[to] += moved;
  return moved;
}

/** One intense storm on the slope fields; the residue cover and the grass strip are the levers. */
export function storm(v: Valley, cover: Cover, strip: Strip): Valley {
  const next: Valley = { soil: { ...v.soil }, p: { ...v.p } };
  const conc = v.soil.slope ? v.p.slope / v.soil.slope : 0;
  const off = Math.floor(v.soil.slope * DETACH * (1 - COVER[cover]));
  const pOff = Math.min(v.p.slope, Math.floor(off * conc * ENRICH));
  const kept = Math.floor(off * TRAP[strip]);
  const pKept = Math.floor(pOff * TRAP[strip]);
  move(next.soil, "slope", "foot", kept);
  move(next.soil, "slope", "river", off - kept);
  move(next.p, "slope", "foot", pKept);
  move(next.p, "slope", "river", pOff - pKept);
  move(next.p, "slope", "dissolved", next.p.slope * LEACH_P);
  return next;
}

/** Weeks after the storm: algae take up half the P in the river once there is enough of it. */
export function weeksLater(v: Valley): Valley {
  const next: Valley = { soil: { ...v.soil }, p: { ...v.p } };
  if (next.p.river >= BLOOM_P) move(next.p, "river", "algae", next.p.river / 2);
  return next;
}

export const bloomed = (v: Valley) => v.p.algae > 0;
/** Share of the P that left the slope travelling on particles rather than dissolved, per cent. */
export function boundShare(v: Valley) {
  const bound = v.p.foot + v.p.river + v.p.algae;
  return bound + v.p.dissolved ? Math.round((bound / (bound + v.p.dissolved)) * 100) : 0;
}

export type Drainage = "none" | "drains";
export type Watering = "normal" | "extra";
export const YEARS = 30;
/** Salt the canal brings each year, by how much is applied. */
const SALT_IN: Record<Watering, number> = { normal: 100, extra: 150 };
/** Share of the root-zone salt the water passing through carries below the roots each year. */
const LEACH: Record<Watering, number> = { normal: 0.3, extra: 0.5 };
/** Metres the water table rises each year when nothing drains it, by how much is applied. */
const RISE: Record<Watering, number> = { normal: 0.08, extra: 0.14 };
const TABLE_START = 3;
const TABLE_FLOOR = 0.5;
/** Within this depth, capillary rise lifts groundwater salt back into the root zone. */
export const CAPILLARY_M = 1.5;
const CAPILLARY = 0.25;
/** Root-zone salt units per dS/m of saturated-paste EC. */
const UNITS_PER_DS = 50;
/** Sodium's share of the salt, and the exchange sites it competes for, in salt units. */
const NA_SHARE = 0.5;
const SITES = 1_000;
/** Classic thresholds (usda-hb60). */
export const SALINE_EC = 4;
export const SODIC_ESP = 15;

export type SaltPool = "canal" | "root" | "ground" | "drainOut";
export interface SaltYear {
  year: number;
  pools: Record<SaltPool, number>;
  table: number;
  ec: number;
  esp: number;
  /** Relative yield and infiltration, per cent. */
  yield: number;
  infiltration: number;
}

const ec = (root: number) => Math.round((root / UNITS_PER_DS) * 10) / 10;
const esp = (root: number) => Math.round((100 * root * NA_SHARE) / (root * NA_SHARE + SITES));

/** Thirty years of irrigation, year 0 first. With drains the leached salt leaves; without, it stays below and the water table climbs. */
export function irrigate(drainage: Drainage, watering: Watering): SaltYear[] {
  const pools: Record<SaltPool, number> = {
    canal: SALT_IN[watering] * YEARS,
    root: 0,
    ground: 0,
    drainOut: 0,
  };
  let table = TABLE_START;
  const out: SaltYear[] = [];
  const record = (year: number) => {
    const e = ec(pools.root);
    const s = esp(pools.root);
    out.push({
      year,
      pools: { ...pools },
      table: Math.round(table * 100) / 100,
      ec: e,
      esp: s,
      yield: Math.max(0, Math.min(100, Math.round(100 - 10 * (e - 2)))),
      infiltration: s > SODIC_ESP ? Math.max(10, 100 - 4 * (s - SODIC_ESP)) : 100,
    });
  };
  record(0);
  for (let y = 1; y <= YEARS; y++) {
    move(pools, "canal", "root", SALT_IN[watering]);
    const leached = pools.root * LEACH[watering];
    if (drainage === "drains") move(pools, "root", "drainOut", leached);
    else {
      move(pools, "root", "ground", leached);
      table = Math.max(TABLE_FLOOR, table - RISE[watering]);
      if (table < CAPILLARY_M) move(pools, "ground", "root", pools.ground * CAPILLARY);
    }
    record(y);
  }
  return out;
}
