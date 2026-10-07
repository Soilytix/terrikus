/**
 * The catena for chapter 11: three pits down one hill under one climate.
 * Position sets how high the water table rises, and with vegetation and parent
 * material, which soil forms (nrcs-soil-survey-manual). Iron is reduced and
 * goes grey where soil stays saturated, and is reoxidised into rust mottles
 * where the water table rises and falls (nrcs-field-book). Teaching values.
 */
import { DEPTH_CM, type Factors } from "./pedogenesis";

export type SlopePosition = "summit" | "midslope" | "toeslope";

export interface CatenaPit {
  id: SlopePosition;
  land: "woodland" | "field" | "paddy";
  factors: Factors;
  /** Water table, cm below the surface: highest (wet season) and lowest (dry season). */
  waterTable: [number, number];
  /** Plate x (0..1) of the pit on the `c11-catena` recipe. */
  x: number;
}

const YEARS = 10_000;

/** Ground line of the `c11-catena` plate, plate units: high on the left, down to the paddy on the right. */
export const groundY = (x: number) => {
  const t = Math.min(1, Math.max(0, (x - 0.14) / 0.42));
  return 0.3 + 0.38 * t * t * (3 - 2 * t);
};
/** Where the detective pit is cut on the plate, and how deep each pit window is (plate units). */
export const DETECTIVE_X = 0.47;
export const PIT_WINDOW = 0.24;

export const CATENA: CatenaPit[] = [
  {
    id: "summit",
    land: "woodland",
    factors: { climate: "temperate", litter: "conifer", parent: "sand", years: YEARS },
    waterTable: [400, 600],
    x: 0.21,
  },
  {
    id: "midslope",
    land: "field",
    factors: { climate: "temperate", litter: "grass", parent: "loam", years: YEARS },
    waterTable: [150, 300],
    x: 0.35,
  },
  {
    id: "toeslope",
    land: "paddy",
    factors: { climate: "temperate", litter: "grass", parent: "clay", years: YEARS },
    waterTable: [20, 70],
    x: 0.6,
  },
];

/** Redox features in a pit, cm: rust mottles over a grey (gleyed) matrix. */
export interface Redox {
  mottles?: [number, number];
  greyFrom?: number;
}

/** Mottles where the water table rises and falls; grey below its dry-season level, where it never leaves. */
export function redox(p: Pick<CatenaPit, "waterTable">): Redox {
  const [high, low] = p.waterTable;
  const out: Redox = {};
  if (high < DEPTH_CM) out.mottles = [high, Math.min(low, DEPTH_CM)];
  if (low < DEPTH_CM) out.greyFrom = low;
  return out;
}

/** What a pit shows, plus one fact about its present: has the land been drained since? */
export interface RedoxObs extends Redox {
  drainedNow: boolean;
}

/** Drainage histories a reader can defend from the colours. */
export type Reading = "never-wet" | "always-wet" | "seasonal" | "relict" | "measure";

/** The detective pit: a field at the foot of the slope, now drained by a ditch. */
export const DETECTIVE: RedoxObs = { mottles: [35, 70], greyFrom: 70, drainedNow: true };

/**
 * Colour alone cannot date the wetness. Mottles mean the water table rose and
 * fell at some time; where the land has since been drained they may be relict;
 * and a year of water-table readings would tell them apart.
 */
export function defensibleReadings(o: RedoxObs): Reading[] {
  if (o.mottles) return ["seasonal", ...(o.drainedNow ? (["relict"] as const) : []), "measure"];
  if (o.greyFrom !== undefined && o.greyFrom <= 10) return ["always-wet"];
  return ["never-wet"];
}
