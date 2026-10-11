/**
 * Piecewise-linear rate modifiers (spec §6.3). Teaching values: they give the
 * right direction and rough shape, not a calibrated prediction.
 */
import { tl } from "../i18n";

function piecewise(points: [number, number][], x: number): number {
  const first = points[0] as [number, number];
  const last = points[points.length - 1] as [number, number];
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i] as [number, number];
    const [x0, y0] = points[i - 1] as [number, number];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return last[1];
}

/** Temperature: Q₁₀ = 2 around 20 °C (davidson-janssens-2006; a rule of thumb, debated for stable SOM). */
export const fT = (celsius: number): number => 2 ** ((celsius - 20) / 10);

/** Moisture, by water-filled pore space: too dry slows everything; very wet slightly. */
export const fW = (wfps: number): number =>
  piecewise(
    [
      [0, 0],
      [0.2, 0.15],
      [0.6, 1],
      [0.95, 0.8],
      [1, 0.75],
    ],
    wfps,
  );

/** Oxygen: plentiful until pores fill with water (WFPS ≈ 0.7), then it runs short. */
export const fO2 = (wfps: number): number =>
  piecewise(
    [
      [0.7, 1],
      [0.95, 0.25],
      [1, 0.15],
    ],
    wfps,
  );

export const RESIDUE = {
  leaf: { quality: 1, cue: 0.45, label: tl("green leaf") },
  straw: { quality: 0.5, cue: 0.35, label: tl("cereal straw") },
  wood: { quality: 0.15, cue: 0.3, label: tl("woody twig") },
} as const;

export const WATER = {
  dry: { wfps: 0.2, label: tl("dry") },
  moist: { wfps: 0.6, label: tl("moist") },
  waterlogged: { wfps: 0.95, label: tl("waterlogged") },
} as const;

export const TEMPERATURE = {
  cool: { celsius: 10, label: tl("cool, 10 °C") },
  mild: { celsius: 20, label: tl("mild, 20 °C") },
} as const;
