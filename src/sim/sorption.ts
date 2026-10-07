/**
 * Phosphate sorption (T22, chapter 8; `shen-2011`, `hinsinger-2001`). P in the
 * soil water binds to iron and aluminium oxides in acid soil and to calcium in
 * alkaline soil; it is least bound near neutral. Bound P comes back slowly, and
 * faster where a root releases organic acids. Dissolved P hardly moves: beyond
 * the root's depletion zone it only creeps back. Whole units of P, every unit in
 * one pool. Teaching model: the shape over pH is right, the rates are not
 * measurements.
 */

/** pH steps of the bench. */
export const PH_STEPS = [4.5, 5.5, 6.5, 7.5, 8.5] as const;
export type Ph = (typeof PH_STEPS)[number];

/** Share of dissolved P bound per day, per mille, by pH: lowest near neutral (teaching curve). */
export const SORB_PER_MILLE: Record<Ph, number> = { 4.5: 300, 5.5: 180, 6.5: 70, 7.5: 150, 8.5: 260 };
/** Which mineral holds the P at each pH, for the readout. */
export const BINDER: Record<Ph, "iron and aluminium" | "calcium" | "little"> = {
  4.5: "iron and aluminium",
  5.5: "iron and aluminium",
  6.5: "little",
  7.5: "calcium",
  8.5: "calcium",
};

/** Bound P released per day, per mille: slow on its own, faster with organic acids from the root. */
export const RELEASE_PER_MILLE = { none: 4, acids: 10 } as const;
/** Dissolved P that creeps from beyond the depletion zone back towards the root per day, per mille. */
export const CREEP_PER_MILLE = 15;

/** P pools: dissolved near the root and beyond its depletion zone, bound to minerals, in the fungus, in the plant. */
export type PPool = "near" | "beyond" | "sorbed" | "fungus" | "plant";
export type PLedger = Record<PPool, number>;

export interface PTransfer {
  from: PPool;
  to: PPool;
  amount: number;
  rule: string;
}

const part = (x: number, perMille: number) => Math.floor((x * perMille) / 1000);

/** One day of binding, release and creep. Returns the transfers; the caller applies them. */
export function sorptionDay(l: Readonly<PLedger>, ph: Ph, acids: boolean): PTransfer[] {
  const k = SORB_PER_MILLE[ph];
  return [
    { from: "near", to: "sorbed", amount: part(l.near, k), rule: "p-sorption" },
    { from: "beyond", to: "sorbed", amount: part(l.beyond, k), rule: "p-sorption" },
    {
      from: "sorbed",
      to: "near",
      amount: part(l.sorbed, RELEASE_PER_MILLE[acids ? "acids" : "none"]),
      rule: acids ? "acid-release" : "p-desorption",
    },
    { from: "beyond", to: "near", amount: part(l.beyond, CREEP_PER_MILLE), rule: "p-diffusion" },
  ];
}
