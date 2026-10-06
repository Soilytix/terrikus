/**
 * Lab bench (world bible ch. 14, `c14-bench` / `c14-jar`): one field sampled
 * before and after a drought, read through the instruments in `../measure`.
 * The community is a teaching set, not data: copy numbers sit inside the
 * 1–15 range (louca-2018) and relic DNA near the ~40 % average (carini-2016).
 */
import type { BenchDef } from ".";
import type { Protocol, TrueTaxon } from "../measure";

export const TAXA_LABELS = {
  spore: "Spore formers",
  fast: "Fast growers",
  slow: "Slow growers",
  ammonia: "Ammonia oxidisers",
  ghost: "Last season's bloom",
} as const;
export type TaxonId = keyof typeof TAXA_LABELS;

type Community = (TrueTaxon & { id: TaxonId })[];

/** Before: a moist field. Cells per gram are teaching values (×10⁶). */
export const BEFORE: Community = [
  { id: "spore", cells: 120, relic: 60, copies: 9, dbCopies: 7, lysis: 0.4, patchiness: 0.25 },
  { id: "fast", cells: 300, relic: 150, copies: 10, dbCopies: 6, lysis: 0.9, patchiness: 0.25 },
  { id: "slow", cells: 500, relic: 300, copies: 1, dbCopies: 2, lysis: 0.8, patchiness: 0.25 },
  { id: "ammonia", cells: 6, relic: 3, copies: 1, dbCopies: 1, lysis: 0.8, patchiness: 0.25 },
  // Gone from the living community; only its DNA is left (carini-2016).
  { id: "ghost", cells: 0, relic: 40, copies: 4, dbCopies: 4, lysis: 0.9, patchiness: 0.25 },
];

/**
 * After the drought every group has fewer living cells, spore formers least.
 * The dead leave DNA behind, so relic DNA rises.
 */
export const AFTER: Community = BEFORE.map((t) => {
  const keep = t.id === "spore" ? 0.6 : 0.2;
  return { ...t, cells: t.cells * keep, relic: t.relic + t.cells * (1 - keep) * 0.3 };
});

export const LEVERS = {
  cores: { one: 1, five: 5 },
  relic: { keep: false, remove: true },
  spike: { none: null, added: 2000 },
  depth: { shallow: 2_000, deep: 20_000 },
  correction: { off: false, on: true },
} as const;

export type LabLevers = { [K in keyof typeof LEVERS]: keyof (typeof LEVERS)[K] };

export const DEFAULT_LAB: LabLevers = {
  cores: "one",
  relic: "keep",
  spike: "none",
  depth: "shallow",
  correction: "off",
};

export function protocol(l: LabLevers): Protocol {
  return {
    cores: LEVERS.cores[l.cores],
    removeRelic: LEVERS.relic[l.relic],
    spikeIn: LEVERS.spike[l.spike],
    depth: LEVERS.depth[l.depth],
    detectionLimit: 5,
    copyCorrection: LEVERS.correction[l.correction],
  };
}

/** Registry entry (benches/index.ts). */
export const LAB_BENCH: BenchDef = {
  levers: Object.fromEntries(Object.entries(LEVERS).map(([k, v]) => [k, Object.keys(v)])),
};
