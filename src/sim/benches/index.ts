/** Every bench, by id. Content bench steps and `#/bench/:id` routes name these. */
import { LEAF_JAR } from "./leaf-jar";

export interface BenchDef {
  /** Lever name → the settings it accepts. */
  levers: Record<string, string[]>;
}

export const BENCHES = { "leaf-jar": LEAF_JAR } satisfies Record<string, BenchDef>;
export type BenchId = keyof typeof BENCHES;
export const isBenchId = (id: string): id is BenchId => Object.hasOwn(BENCHES, id);
