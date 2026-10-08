/**
 * Chapter 10 rules (world-bible §6, ch. 10): the disease triangle, resting
 * inoculum across a rotation, the suppressive-soil transfer and the evidence
 * ladder's gate. Integer teaching values: they show direction, not the
 * behaviour of any real pathogen, soil or field.
 */

/** The three vertices (`scholthof-2007`); suppression is the microbiome's fourth. */
export interface Triangle {
  host: boolean;
  pathogen: boolean;
  conducive: boolean;
  suppressive?: boolean;
}

/** Detection needs only the pathogen; disease needs all three vertices, and no suppression. */
export function triangle(t: Triangle): { detected: boolean; disease: boolean } {
  return {
    detected: t.pathogen,
    disease: t.host && t.pathogen && t.conducive && !t.suppressive,
  };
}

/** A season's crop. Pea and bean host the generic legume root-rot pathogen; the rest do not. */
export type Crop = "pea" | "bean" | "cereal" | "sugarbeet";
export type Cover = "none" | "vetch" | "oat";
export type Rotation = "short" | "long";

export const HOSTS: Record<Crop | Exclude<Cover, "none">, boolean> = {
  pea: true,
  bean: true,
  cereal: false,
  sugarbeet: false,
  // Vetch is a legume and can host the same pathogen; oat cannot.
  vetch: true,
  oat: false,
};

export const ROTATIONS: Record<Rotation, Crop[]> = {
  short: ["pea", "bean", "pea", "bean", "pea", "bean"],
  long: ["pea", "cereal", "sugarbeet", "bean", "cereal", "sugarbeet"],
};

/** Wet springs are conducive; the same weather for every rotation, so only the crops differ. */
export const WET: boolean[] = [true, false, true, true, false, true];

/** Resting structures (oospores, sclerotia, cysts) per unit of soil, teaching units. */
export const START_INOCULUM = 10;
/** A host season multiplies resting inoculum; a non-host season lets it decay. */
const HOST_GAIN = 3;
const DECAY_KEEP = 6; // tenths kept per non-host season
const COVER_GAIN = 15; // a host cover adds a little; tenths
/** Disease shows only above this much inoculum (and with a host in a wet season). */
export const DISEASE_THRESHOLD = 20;
export const DETECTION_LIMIT = 1;
/** Resting structures stop piling up once the soil holds this many. */
const CAP = 500;

export interface Season {
  season: number;
  crop: Crop;
  wet: boolean;
  /** Inoculum at sowing. */
  inoculum: number;
  detected: boolean;
  disease: boolean;
}

/** Inoculum season by season: host crops build it, non-hosts let it decay. Integer throughout. */
export function rotate(rotation: Rotation, cover: Cover = "none"): Season[] {
  let inoculum = START_INOCULUM;
  return ROTATIONS[rotation].map((crop, i) => {
    const wet = WET[i] ?? false;
    const host = HOSTS[crop];
    const t = triangle({ host, pathogen: inoculum >= DISEASE_THRESHOLD, conducive: wet });
    const season: Season = {
      season: i + 1,
      crop,
      wet,
      inoculum,
      detected: inoculum >= DETECTION_LIMIT,
      disease: t.disease,
    };
    inoculum = host ? inoculum * HOST_GAIN : Math.floor((inoculum * DECAY_KEEP) / 10);
    if (cover !== "none")
      inoculum = HOSTS[cover]
        ? Math.floor((inoculum * COVER_GAIN) / 10)
        : Math.floor((inoculum * DECAY_KEEP) / 10);
    inoculum = Math.min(CAP, inoculum);
    return season;
  });
}

/**
 * The suppressive transfer (`weller-2002`, `schlatter-2017`). Suppression is
 * general (bulk microbial activity: the soil's own, not moved by a pinch) plus
 * specific (a few organisms that establish from a small inoculum). Both are
 * biological, so heat kills both.
 */
export type Pot =
  | { soil: "conducive" | "suppressive"; sterilised?: boolean }
  | { soil: "mix"; percent: number; sterilised?: boolean };

const GENERAL = 30;
const SPECIFIC = 60;
/** At this share of suppressive soil, w/w, the specific community establishes fully (1–10 %: an estimate). */
const ESTABLISH_PERCENT = 1;
/** Of 100 seedlings, how many get sick with no suppression at all. */
const BASE_SICK = 90;

export function suppression(p: Pot): { general: number; specific: number } {
  if (p.sterilised) return { general: 0, specific: 0 };
  if (p.soil !== "mix") return { general: GENERAL, specific: p.soil === "suppressive" ? SPECIFIC : 0 };
  // A mix: the conducive soil's own general activity, plus what the pinch establishes.
  const share = Math.min(1, p.percent / ESTABLISH_PERCENT);
  return { general: GENERAL, specific: Math.round(SPECIFIC * share) };
}

/** Sick seedlings out of 100 in a pot test with the pathogen added. */
export function sickSeedlings(p: Pot): number {
  const s = suppression(p);
  return Math.max(0, BASE_SICK - s.general - s.specific);
}

/** The evidence ladder, bottom to top. Each rung is a different claim. */
export const LADDER = ["outcome", "hypothesis", "candidate", "assay", "plant-test", "field"] as const;
export type Rung = (typeof LADDER)[number];

/** A rung's claim is open only once that rung and every rung below it is in hand. */
export function claimable(rung: Rung, held: readonly Rung[]): boolean {
  return LADDER.slice(0, LADDER.indexOf(rung) + 1).every((r) => held.includes(r));
}

/** The next rung to climb, or undefined at the top. Rungs are climbed in order. */
export const nextRung = (held: readonly Rung[]): Rung | undefined => LADDER.find((r) => !held.includes(r));
