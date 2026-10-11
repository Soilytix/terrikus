/**
 * Verdicts on a cause chain (world-bible §7.2): supported by the player's own
 * run, plausible but untested, or contradicted by the run. Never "wrong".
 */
import type { ChainTemplate, Connector, Verdict } from "../content/schema";
import type { LabEntry, Save } from "../save/schema";
import { RESIDUE, WATER } from "../sim/modifiers";
import { tl } from "../i18n";

export interface Answer {
  cards: string[];
  connectors: Connector[];
}

export interface Judgement {
  verdict: Verdict;
  messages: string[];
  /** The run the verdict points at, when there is one. */
  evidence: string;
}

const same = (a: Answer, b: Answer) =>
  a.cards.length === b.cards.length &&
  a.cards.every((c, i) => c === b.cards[i]) &&
  a.connectors.every((c, i) => c === b.connectors[i]);

function compared(e: LabEntry, x: string, y: string): boolean {
  if (!e.b) return false;
  const pair = (u: string, v: string) => (u === x && v === y) || (u === y && v === x);
  if (x in WATER && y in WATER) return pair(e.a.water, e.b.water);
  if (x in RESIDUE && y in RESIDUE) return pair(e.a.residue, e.b.residue);
  return false;
}

/** Evidence that is a mission bench rather than a jar comparison, and the flag its run sets. */
export const FLAG_EVIDENCE: Record<string, string> = {
  "your water/air slider": "p-m1-slider",
  "your triangle toggles": "c10-triangle-run",
  "your rotation wheel": "c10-rotation-run",
};

/** Has the player observed the evidence this chain names ("dry vs moist", or a bench flag)? */
export function observed(evidence: string, save: Save): boolean {
  const flag = FLAG_EVIDENCE[evidence];
  if (flag) return save.flags.includes(flag);
  const m = /^(\w+) vs (\w+)$/.exec(evidence);
  if (!m?.[1] || !m[2]) return false;
  const [, x, y] = m as unknown as [string, string, string];
  return save.labBook.some((e) => compared(e, x, y));
}

const SIGN: Partial<Record<Connector, 1 | -1>> = { increases: 1, enables: 1, decreases: -1, limits: -1 };

/** Net sign of a chain whose connectors are each a causal sign; 0 when a link has no sign. */
export function netSign(connectors: Connector[]): number {
  return connectors.reduce((n, c) => n * (SIGN[c] ?? 0), 1);
}

export function judge(t: ChainTemplate, answer: Answer, save: Save): Judgement {
  const matched = t.diagnostics.filter((d) =>
    d.when.every(
      (w) =>
        (!w.card || answer.cards[w.card[0]] === w.card[1]) &&
        (!w.connector || answer.connectors[w.connector[0]] === w.connector[1]),
    ),
  );
  const contradicted = netSign(answer.connectors) === -t.observed || matched.some((d) => d.contradicts);
  const messages = matched.map((d) => d.message);
  const seen = observed(t.evidence, save);
  let verdict: Verdict = "plausible";
  if (contradicted && seen) verdict = "contradicted";
  else if (seen && t.accepted.some((a) => same(a, answer))) {
    if (t.untested) messages.push(t.untested);
    else verdict = "supported";
  }
  return { verdict, messages, evidence: t.evidence };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  supported: tl("Supported by your run"),
  plausible: tl("Plausible but untested"),
  contradicted: tl("Contradicted by your run"),
};
