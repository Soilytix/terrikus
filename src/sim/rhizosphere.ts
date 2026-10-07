/**
 * Root bench (T21, chapter 7): exudation rules on chapter 6's food web. The
 * root sends a share of its below-ground photosynthate out as exudate; that
 * feeds a bacterial bloom, grazers eat the bloom and release ammonium, and the
 * root takes it up. The exuded share is contested (`bais-2006` against
 * `pausch-kuzyakov-2018`), so every run is made at both ends of the band and
 * shown as a range, never one number. Teaching values: direction, not prediction.
 *
 * Simplifications: one well-mixed rhizosphere pool, no distance from the root;
 * the bare plot is the same soil with no root flow and no uptake.
 */
import { runWeb, type WebSettings, type WebSnapshot } from "./food-web";

/** Ends of the contested share of photosynthate exuded (method-dependent). */
export const EXUDED_SHARE = { low: 0.05, high: 0.21 } as const;
export type BandEnd = keyof typeof EXUDED_SHARE;
export type RootPlot = "planted" | "bare";

/** Below-ground photosynthate (C): large enough that the top of the band feeds a bloom. */
const ROOT_SUPPLY = 100_000;

export const rootSettings = (plot: RootPlot, end: BandEnd = "low"): WebSettings =>
  plot === "bare"
    ? { water: "moist", bare: true }
    : { water: "moist", supply: ROOT_SUPPLY, share: EXUDED_SHARE[end] };

export const runRoot = (plot: RootPlot, end: BandEnd, days: number) => runWeb(rootSettings(plot, end), days);

/** A planted run at each end of the band. */
export const runBand = (days: number) => ({
  low: runRoot("planted", "low", days),
  high: runRoot("planted", "high", days),
});

const MICROBES = new Set<string>(["bacteria-copio", "fungi-sap"]);

/** Active-microbe index (derived): C breathed out by bacteria and fungi that day. */
export const activeIndex = (s: WebSnapshot) =>
  s.transfers
    .filter((t) => t.element === "C" && t.to === "co2" && MICROBES.has(t.from))
    .reduce((a, t) => a + t.amount, 0);

/** Exudate C released up to and including `day`. */
export const exudedC = (snaps: WebSnapshot[], day: number) =>
  snaps
    .slice(1, day + 1)
    .flatMap((s) => s.transfers)
    .filter((t) => t.element === "C" && t.rule === "exudation")
    .reduce((a, t) => a + t.amount, 0);

/** Share of each element still accounted for against day 0, in per cent. */
export function accounted(snaps: WebSnapshot[], day: number) {
  const total = (p: Record<string, number>) => Object.values(p).reduce((a, b) => a + b, 0);
  const [a, b] = [snaps[0]!.ledger, snaps[day]!.ledger];
  return { C: (100 * total(b.C)) / total(a.C), N: (100 * total(b.N)) / total(a.N) };
}
