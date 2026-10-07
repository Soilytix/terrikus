/** Every bench, by id. Content bench steps and `#/bench/:id` routes name these. */
import { LAB_BENCH } from "./lab-bench";
import { LEAF_JAR } from "./leaf-jar";
import { STRAW_N } from "./straw-n";

export interface BenchDef {
  /** Lever name → the settings it accepts. */
  levers: Record<string, string[]>;
}

export const BENCHES = {
  "leaf-jar": LEAF_JAR,
  "lab-bench": LAB_BENCH,
  "straw-n": STRAW_N,
} satisfies Record<string, BenchDef>;
export type BenchId = keyof typeof BENCHES;
export const isBenchId = (id: string): id is BenchId => Object.hasOwn(BENCHES, id);
