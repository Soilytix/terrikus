/**
 * Content lint (spec §9, backlog T03): facts are sourced, ids resolve, nodes
 * carry a review status, copy avoids scores and good/bad labels.
 */
import { SOURCES } from "../../src/content/sources";

const known = new Set(Object.keys(SOURCES));

/** Walk any content value; report facts without sources and unknown source ids. */
export function lintSources(value: unknown, path = "content"): string[] {
  const errors: string[] = [];
  const visit = (v: unknown, p: string) => {
    if (Array.isArray(v)) return v.forEach((x, i) => visit(x, `${p}[${i}]`));
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    const isFact = typeof o.text === "string" && typeof o.confidence === "string";
    if (isFact && (!Array.isArray(o.sources) || o.sources.length === 0))
      errors.push(`${p}: fact without sources`);
    if (Array.isArray(o.sources)) {
      for (const s of o.sources)
        if (!known.has(s as string)) errors.push(`${p}: unknown source id "${String(s)}"`);
    }
    if (typeof o.source === "string" && !known.has(o.source))
      errors.push(`${p}: unknown source id "${o.source}"`);
    for (const [k, x] of Object.entries(o)) visit(x, `${p}.${k}`);
  };
  visit(value, path);
  return errors;
}

/** Every node that should be reviewable carries a status. */
export function lintReview(nodes: { id: string; reviewStatus?: unknown }[]): string[] {
  const ok = new Set(["draft", "in-review", "approved", "needs-changes"]);
  return nodes.filter((n) => !ok.has(n.reviewStatus as string)).map((n) => `${n.id}: missing reviewStatus`);
}

/** All strings in a value, for copy lint. */
export function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

export const NO_SCORES = /\bleaderboards?\b|\bstreaks?\b|\bXP\b|health score|\bhigh ?score/i;
export const NO_GOOD_BAD = /\b(good|bad|beneficial|harmful|evil|villain|hero)\b/i;
