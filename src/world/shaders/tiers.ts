/**
 * Living-backdrop quality tiers (art direction §4.1, spec §8). Ids follow
 * `docs/research/visual-direction.md` §9. S4 drift is the stage's CPU particles,
 * governed on its own; S5 film fill, S6 wetting front and S8 root growth follow
 * simulation state and are wired by their chapter benches, not here.
 */
import type { Scale } from "../../content/schema";
import type { Level } from "../governor";

export type Tier = "high" | "medium" | "off";
/** S1 grain, S2 sway, S3 painterly flow, S7 scale dissolve, S9 microscope look. */
export type ShaderId = "S1" | "S2" | "S3" | "S7" | "S9";

/** Ambient shaders per scale; the cell scale is event-only (AD §4.1). */
export const AMBIENT: Record<Scale, readonly ShaderId[]> = {
  landscape: ["S1", "S2", "S3"],
  field: ["S1", "S2", "S3"],
  profile: ["S1", "S2"],
  aggregate: ["S1", "S2", "S9"],
  rhizosphere: ["S1", "S2", "S9"],
  cell: [],
};

/** Governor level 0 is high, 1 medium (S3 is high tier only), 2 and below off. */
export const tierFor = (level: Level): Tier => (level === 0 ? "high" : level === 1 ? "medium" : "off");

export function shadersFor(scale: Scale | undefined, tier: Tier): Set<ShaderId> {
  if (tier === "off") return new Set();
  const on = new Set<ShaderId>([...(scale ? AMBIENT[scale] : []), "S7"]);
  if (tier === "medium") on.delete("S3");
  return on;
}
