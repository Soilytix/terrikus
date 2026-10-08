/**
 * Heavy wheels (T28, chapter 12, `c12-m4`): one pass of a loaded wheel over a
 * wet or a dry soil, and the next rain. Wet soil deforms more under the same
 * load, so its macropores collapse; resistance in the pan rises past about
 * 2 MPa, where root elongation is strongly restricted (`bengough-2011`).
 * Teaching values: direction, not prediction.
 *
 * Simplifications: one pass, one load, one pan depth; recovery is a fixed
 * number of years per depth rather than freeze–thaw, roots and worms.
 */
export type Wetness = "dry" | "wet";

export const ROOT_LIMIT_MPA = 2;
/** Rain of the next storm, mm/h. */
export const STORM_MM_H = 20;
export const BEFORE = { macropores: 12, resistance: 1.1, infiltration: 60 } as const;

export interface Pass {
  /** Air-filled big pores, % of soil volume. */
  macropores: number;
  /** Penetrometer resistance in the pan, MPa. */
  resistance: number;
  /** mm/h the surface can take in. */
  infiltration: number;
  /** The next storm rains faster than the soil takes it in. */
  ponds: boolean;
  rootsBend: boolean;
  /** Years until the damage is gone, topsoil and subsoil. */
  recovery: { topsoil: number; subsoil: number };
}

export function wheel(wetness: Wetness): Pass {
  const macropores = wetness === "wet" ? 4 : 10;
  const resistance = wetness === "wet" ? 2.8 : 1.5;
  // Infiltration follows the big pores, which carry most of the flow.
  const infiltration = Math.round(BEFORE.infiltration * (macropores / BEFORE.macropores) ** 2);
  return {
    macropores,
    resistance,
    infiltration,
    ponds: infiltration < STORM_MM_H,
    rootsBend: resistance > ROOT_LIMIT_MPA,
    recovery: wetness === "wet" ? { topsoil: 4, subsoil: 30 } : { topsoil: 1, subsoil: 0 },
  };
}
