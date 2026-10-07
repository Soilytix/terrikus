/**
 * Pedogenesis for chapter 11 (world-bible §6, Pit Walls and Deep Time).
 * Teaching rules that get the direction right, not the numbers: horizons grow
 * from parent material under the state factors (jenny-1941), an E bleaches
 * over an enriched B where leaching, acid litter and a permeable parent meet
 * (nrcs-soil-survey-manual), and formation runs at about 0.3–1.4 t/ha/yr
 * (verheijen-2009). Rates are saturating curves with invented time constants.
 */

export const CLIMATES = ["cold-wet", "temperate", "warm-dry"] as const;
export const LITTERS = ["conifer", "broadleaf", "grass"] as const;
export const PARENTS = ["sand", "loam", "clay"] as const;
export type Climate = (typeof CLIMATES)[number];
export type Litter = (typeof LITTERS)[number];
export type Parent = (typeof PARENTS)[number];

export interface Factors {
  climate: Climate;
  litter: Litter;
  parent: Parent;
  years: number;
}

/** Master horizons, with B split by what made it: Bs (accumulated iron and humus), Bw (weathered in place). */
export type HorizonId = "O" | "A" | "E" | "Bs" | "Bw" | "C";
/** World-register pigment the horizon is painted in. */
export type HorizonColour = "humus" | "topsoil" | "loam" | "pale" | "oxide" | "subsoil" | "sand" | "clay";

export interface Horizon {
  id: HorizonId;
  /** Depth from the top of the profile, whole cm. */
  top: number;
  bottom: number;
  colour: HorizonColour;
}

/** The pit is this deep. */
export const DEPTH_CM = 120;
/** The pit wall on the `c11-pit` plate, plate units: surface and floor. Scene anchors use the same. */
export const PIT_TOP = 0.2;
export const PIT_BOTTOM = 0.97;
export const pitY = (cm: number) => PIT_TOP + (cm / DEPTH_CM) * (PIT_BOTTOM - PIT_TOP);
/** Frames of the time-lapse, years: each step ten times the last. */
export const TIMELAPSE_YEARS = [0, 100, 1_000, 10_000] as const;

const LEACH: Record<Climate, number> = { "cold-wet": 1, temperate: 0.5, "warm-dry": 0.1 };
const ACID: Record<Litter, number> = { conifer: 1, broadleaf: 0.4, grass: 0.1 };
const PERMEABLE: Record<Parent, number> = { sand: 1, loam: 0.5, clay: 0.15 };
/** Weathering in place: loam and clay brown and gain structure; quartz sand barely changes. */
const WEATHERS: Record<Parent, number> = { sand: 0, loam: 1, clay: 0.8 };
const WARMTH: Record<Climate, number> = { "cold-wet": 0.6, temperate: 1, "warm-dry": 0.4 };
const O_MAX: Record<Litter, number> = { conifer: 8, broadleaf: 4, grass: 0 };
/** Litter piles up where cold and wet slow its decay. */
const O_KEEP: Record<Climate, number> = { "cold-wet": 1, temperate: 0.7, "warm-dry": 0.4 };
const A_MAX: Record<Litter, number> = { conifer: 8, broadleaf: 15, grass: 30 };
const C_COLOUR: Record<Parent, HorizonColour> = { sand: "sand", loam: "subsoil", clay: "clay" };

/** Fraction of the way to maturity after `years` with time constant `tau`. */
const grow = (years: number, tau: number) => 1 - Math.exp(-years / tau);

/** Podzolisation, 0..1: leaching × acid litter × permeable parent × time. Below 0.1 no E forms. */
export const podzolisation = (f: Factors) =>
  LEACH[f.climate] * ACID[f.litter] * PERMEABLE[f.parent] * grow(f.years, 4_000);

export function profileAt(f: Factors): Horizon[] {
  const pod = podzolisation(f);
  const bleach = pod >= 0.1 ? pod : 0;
  const weathered = WEATHERS[f.parent] * WARMTH[f.climate] * grow(f.years, 3_000);
  const cm: [HorizonId, number, HorizonColour][] = [
    ["O", Math.round(O_MAX[f.litter] * O_KEEP[f.climate] * grow(f.years, 100)), "humus"],
    ["A", Math.round(A_MAX[f.litter] * grow(f.years, 800)), "topsoil"],
    ["E", Math.round(25 * bleach), "pale"],
    ["Bs", Math.round(30 * bleach), "oxide"],
    ["Bw", weathered >= 0.1 ? Math.round(40 * weathered) : 0, "loam"],
  ];
  const out: Horizon[] = [];
  let top = 0;
  for (const [id, t, colour] of cm) {
    if (t <= 0) continue;
    out.push({ id, top, bottom: top + t, colour });
    top += t;
  }
  out.push({ id: "C", top, bottom: DEPTH_CM, colour: C_COLOUR[f.parent] });
  return out;
}

export const thickness = (p: Horizon[], id: HorizonId) =>
  p.filter((h) => h.id === id).reduce((n, h) => n + h.bottom - h.top, 0);

/** Teaching bulk density, g/cm³ (t/m³). */
export const BULK_DENSITY = 1.3;
/** Soil formation in Europe, t/ha/yr: low, middle and high (verheijen-2009). */
export const FORMATION_RATES = [0.3, 1, 1.4] as const;
/** How many times faster plough erosion runs than formation (montgomery-2007). */
export const EROSION_FACTORS = [10, 100] as const;

/** Years to form 1 cm: 1 cm over a hectare is 100 m³, so 100 × ρ tonnes. */
export const yearsPerCm = (tPerHaYr: number, bulkDensity = BULK_DENSITY) =>
  Math.round((100 * bulkDensity) / tPerHaYr);
