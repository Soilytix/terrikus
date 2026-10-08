/**
 * Chapter 14 rules for claims: the evidence ladder (detection → absolute
 * abundance → activity → effect in a controlled test → effect in field trials
 * across environments) and the honest report, whose blocks are placed only
 * with a benchmark, a confidence and a provenance.
 */

export type Judgement =
  | { kind: "fits" }
  /** Claims more than the evidence holds; `missing` are the rungs it skipped. */
  | { kind: "over"; missing: string[] }
  /** True, but smaller than the evidence allows. */
  | { kind: "under" };

/** The strongest rung the evidence holds: the top of the unbroken run from the bottom of the ladder, or -1. */
export function strongest(ladder: readonly { id: string }[], held: readonly string[]): number {
  let i = -1;
  while (i + 1 < ladder.length && held.includes(ladder[i + 1]!.id)) i++;
  return i;
}

/** Judge a claim (a rung id) against the evidence in hand. */
export function judge(ladder: readonly { id: string }[], held: readonly string[], claim: string): Judgement {
  const top = strongest(ladder, held);
  const at = ladder.findIndex((r) => r.id === claim);
  if (at > top)
    return {
      kind: "over",
      missing: ladder
        .slice(top + 1, at + 1)
        .map((r) => r.id)
        .filter((id) => !held.includes(id)),
    };
  return at === top ? { kind: "fits" } : { kind: "under" };
}

export const REPORT_FIELDS = ["benchmark", "confidence", "provenance"] as const;
export type ReportField = (typeof REPORT_FIELDS)[number];

/** A block can be placed once every field carries an accepted choice. */
export function placeable(
  block: Record<ReportField, readonly { id: string; ok: boolean }[]>,
  picks: Partial<Record<ReportField, string>>,
): boolean {
  return REPORT_FIELDS.every((f) => block[f].some((c) => c.ok && c.id === picks[f]));
}
