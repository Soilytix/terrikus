/**
 * Measurement layer (spec §6.5): instruments read the true state and add
 * seeded noise; the noise is labelled as such. True-state rules never call it.
 */
import type { Snapshot } from "./engine";
import { hashSeed, mulberry32 } from "./rng";

export interface Measured {
  value: number;
  /** Half-width of the ± band. */
  band: number;
}

/** Daily CO₂-C flux (units per day) averaged over a week, ±10 % seeded noise; null before the first week. */
export function measureCo2Flux(snapshots: Snapshot[], day: number, seed: number): Measured | null {
  if (day < 7) return null;
  const d = Math.min(day, snapshots.length - 1);
  const now = snapshots[d]?.ledger.C.co2Out ?? 0;
  const before = snapshots[d - 7]?.ledger.C.co2Out ?? 0;
  const trueFlux = (now - before) / 7;
  const rng = mulberry32(hashSeed(seed, d));
  const noise = (rng() - 0.5) * 0.2;
  return { value: trueFlux * (1 + noise), band: Math.max(0.5, trueFlux * 0.1) };
}

/** Derived, not measured: litter mass loss ÷ time, from two weighings. */
export function decompositionRate(snapshots: Snapshot[], day: number): number {
  const d = Math.max(1, Math.min(day, snapshots.length - 1));
  const start = snapshots[0]?.ledger.C.L ?? 0;
  const now = snapshots[d]?.ledger.C.L ?? 0;
  return (start - now) / d;
}

/* ── Lab-bench instruments (T26, spec §6.5) ─────────────────────────────────
 * A sample travels core → extraction → PCR → sequencer. Each step reads the
 * true community and loses or adds something; every random draw comes from a
 * mulberry32 stream seeded by the caller, so a seed replays a run exactly.
 */

/** One taxon's true state in the field (teaching values, per gram of soil). */
export interface TrueTaxon {
  id: string;
  /** Living cells. */
  cells: number;
  /** Extracellular DNA from dead cells, in cell-equivalents (carini-2016). */
  relic: number;
  /** 16S gene copies per genome; about 1 to 15 across bacteria (louca-2018). */
  copies: number;
  /** What a reference database assumes for `copies`; often wrong (louca-2018). */
  dbCopies: number;
  /** Share of cells the extraction breaks open. */
  lysis: number;
  /** Core-to-core coefficient of variation: how patchy the taxon is in the field. */
  patchiness: number;
}

export interface Protocol {
  /** Cores pooled into one sample. */
  cores: number;
  /** Treat the sample so free DNA is not amplified (PMA-style). */
  removeRelic: boolean;
  /** Synthetic gene copies added per gram before extraction, or null for none. */
  spikeIn: number | null;
  /** Reads the sequencer returns: a fixed-size jar. */
  depth: number;
  /** A taxon expected below this many reads is not detected. */
  detectionLimit: number;
  /** Divide reads by the database copy number before reporting. */
  copyCorrection: boolean;
}

export const SPIKE = "spike";
/** Share of the spike the extraction recovers: the spike has its own bias (smets-2016). */
export const SPIKE_RECOVERY = 0.85;
/** PCR and sequencing: multiplicative noise on each taxon's share. */
export const PCR_CV = 0.05;

export type Rng = () => number;

/** Standard normal draw (Box–Muller) from the seeded stream. */
export function gaussian(rng: Rng): number {
  const u = Math.max(rng(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

/** Log-normal factor with mean 1 and the given coefficient of variation. */
function lognormal(rng: Rng, cv: number): number {
  const s2 = Math.log(1 + cv * cv);
  return Math.exp(Math.sqrt(s2) * gaussian(rng) - s2 / 2);
}

/**
 * Compositional closure: split `total` integer units in proportion to
 * `weights` by largest remainder. The parts always sum to `total` exactly
 * (gloor-2017); ties go to the earlier key, so the split is deterministic.
 */
export function closure(weights: Record<string, number>, total: number): Record<string, number> {
  const keys = Object.keys(weights);
  const sum = keys.reduce((a, k) => a + Math.max(0, weights[k] ?? 0), 0);
  const out: Record<string, number> = {};
  if (sum <= 0 || keys.length === 0) {
    for (const k of keys) out[k] = 0;
    return out;
  }
  const raw = keys.map((k) => (Math.max(0, weights[k] ?? 0) / sum) * total);
  keys.forEach((k, i) => (out[k] = Math.floor(raw[i]!)));
  let left = total - keys.reduce((a, k) => a + out[k]!, 0);
  const order = keys.map((k, i) => ({ k, r: raw[i]! - out[k]! })).sort((a, b) => b.r - a.r);
  for (let i = 0; left > 0; i = (i + 1) % order.length, left--) out[order[i]!.k]! += 1;
  return out;
}

/** Step 1, sampling: the mean of `cores` patchy cores, for living cells and relic DNA. */
export function sampleCores(
  taxa: TrueTaxon[],
  cores: number,
  rng: Rng,
): Record<string, { cells: number; relic: number }> {
  const out: Record<string, { cells: number; relic: number }> = {};
  for (const t of taxa) out[t.id] = { cells: 0, relic: 0 };
  for (let c = 0; c < cores; c++)
    for (const t of taxa) {
      // Living and dead cells of one taxon share a patch.
      const f = lognormal(rng, t.patchiness);
      out[t.id]!.cells += (t.cells * f) / cores;
      out[t.id]!.relic += (t.relic * f) / cores;
    }
  return out;
}

/** Step 2, extraction: gene copies recovered. Lysis misses some cells; relic DNA comes along unless removed. */
export function extract(
  taxa: TrueTaxon[],
  sample: Record<string, { cells: number; relic: number }>,
  protocol: Pick<Protocol, "removeRelic" | "spikeIn">,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of taxa) {
    const s = sample[t.id]!;
    out[t.id] = (s.cells * t.lysis + (protocol.removeRelic ? 0 : s.relic)) * t.copies;
  }
  if (protocol.spikeIn !== null) out[SPIKE] = protocol.spikeIn * SPIKE_RECOVERY;
  return out;
}

/**
 * Step 3, PCR and sequencing: every share is jittered, taxa expected below the
 * detection limit drop out, and the rest are closed to exactly `depth` reads.
 */
export function sequence(
  copies: Record<string, number>,
  protocol: Pick<Protocol, "depth" | "detectionLimit">,
  rng: Rng,
): Record<string, number> {
  const amplified: Record<string, number> = {};
  for (const [k, v] of Object.entries(copies)) amplified[k] = v * lognormal(rng, PCR_CV);
  const sum = Object.values(amplified).reduce((a, b) => a + b, 0);
  const seen: Record<string, number> = {};
  for (const [k, v] of Object.entries(amplified))
    seen[k] = sum > 0 && (v / sum) * protocol.depth >= protocol.detectionLimit ? v : 0;
  return closure(seen, protocol.depth);
}

export interface LabReading {
  /** Raw reads per taxon, spike included; integers summing to `depth`. */
  reads: Record<string, number>;
  /** Relative abundance of soil taxa in tenths of a percent; integers summing to 1000. */
  permille: Record<string, number>;
  /** Taxa with at least one read (spike excluded). */
  richness: number;
  /** Derived from the spike: estimated copies (or cells, with correction) per gram; null without a spike. */
  absolute: Record<string, number> | null;
}

/** The whole pipeline over a true community. Same taxa, protocol and seed give the same reading. */
export function labRun(taxa: TrueTaxon[], protocol: Protocol, seed: number): LabReading {
  const rng = mulberry32(seed);
  const sample = sampleCores(taxa, protocol.cores, rng);
  const reads = sequence(extract(taxa, sample, protocol), protocol, rng);
  const per = (t: TrueTaxon) => (reads[t.id] ?? 0) / (protocol.copyCorrection ? t.dbCopies : 1);
  const weights = Object.fromEntries(taxa.map((t) => [t.id, per(t)]));
  const spikeReads = reads[SPIKE] ?? 0;
  return {
    reads,
    permille: closure(weights, 1000),
    richness: taxa.filter((t) => (reads[t.id] ?? 0) > 0).length,
    absolute:
      protocol.spikeIn !== null && spikeReads > 0
        ? Object.fromEntries(taxa.map((t) => [t.id, (per(t) / spikeReads) * protocol.spikeIn!]))
        : null,
  };
}
