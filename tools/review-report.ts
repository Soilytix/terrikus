/** Every content node by review status and reviewer, as Markdown (backlog T31). Read-only. */
import { REVIEW_ROWS, REVIEW_STATUSES, type ReviewRow } from "../src/content/review";

export function reviewReport(rows: ReviewRow[]): string {
  const out = [`# Review status: ${rows.length} nodes`, ""];
  for (const status of REVIEW_STATUSES) {
    const group = rows.filter((r) => r.reviewStatus === status);
    out.push(`## ${status} (${group.length})`, "");
    if (!group.length) continue;
    out.push("| Kind | Id | Title | Reviewer |", "| --- | --- | --- | --- |");
    for (const r of group) out.push(`| ${r.kind} | \`${r.id}\` | ${r.title} | ${r.reviewer ?? "—"} |`);
    out.push("");
  }
  return out.join("\n");
}

if (process.argv[1]?.endsWith("review-report.ts")) console.log(reviewReport(REVIEW_ROWS));
