/**
 * The pilot log (T33): opt-in, local-only, exported by an explicit user action.
 * It lives under its own key beside the save and never touches the network;
 * `pilot.test.ts` asserts both.
 */
import type { MisconceptionId } from "../content/schema";
import { MISCONCEPTIONS } from "../content/misconceptions";
import type { StorageLike } from "../save/storage";
import type { PilotConfig } from "./config";

export const PILOT_KEY = "soilworlds:pilot:v1";

export type Phase = "pre" | "post";
/** Every item states a misconception, so "false" is the expected answer. */
export type Answer = "true" | "false" | "not-sure";

export interface PilotResponse {
  phase: Phase;
  item: MisconceptionId;
  answer: Answer;
  confidence: 1 | 2 | 3;
  at: string;
}

export interface PilotLog {
  version: 1;
  instrument: string;
  optedIn: boolean;
  events: { kind: "opt-in" | "opt-out"; at: string }[];
  responses: PilotResponse[];
}

export const emptyLog = (config: PilotConfig): PilotLog => ({
  version: 1,
  instrument: config.version,
  optedIn: false,
  events: [],
  responses: [],
});

export function loadLog(storage: StorageLike | undefined, config: PilotConfig): PilotLog {
  try {
    const raw = storage?.getItem(PILOT_KEY);
    const log = raw ? (JSON.parse(raw) as PilotLog) : null;
    return log?.version === 1 && Array.isArray(log.responses) ? log : emptyLog(config);
  } catch {
    return emptyLog(config);
  }
}

/** False when storage is blocked or full; the log then lasts as long as the page. */
export function saveLog(storage: StorageLike | undefined, log: PilotLog): boolean {
  try {
    storage?.setItem(PILOT_KEY, JSON.stringify(log));
    return !!storage;
  } catch {
    return false;
  }
}

export function setOptIn(log: PilotLog, on: boolean, now = new Date().toISOString()): PilotLog {
  if (log.optedIn === on) return log;
  return { ...log, optedIn: on, events: [...log.events, { kind: on ? "opt-in" : "opt-out", at: now }] };
}

export const phaseDone = (log: PilotLog, phase: Phase) => log.responses.some((r) => r.phase === phase);

export function postOpen(log: PilotLog, config: PilotConfig, chaptersComplete: number): boolean {
  const after = config.thresholds.postAfterChapters;
  return phaseDone(log, "pre") && (after === null || chaptersComplete >= after);
}

/** Records one full set of answers. Each phase is answered once, pre before post, and only when opted in. */
export function recordPhase(
  log: PilotLog,
  config: PilotConfig,
  phase: Phase,
  answers: Partial<Record<MisconceptionId, { answer: Answer; confidence: 1 | 2 | 3 }>>,
  now = new Date().toISOString(),
): PilotLog {
  if (!log.optedIn) throw new Error("pilot: not opted in");
  if (phaseDone(log, phase)) throw new Error(`pilot: ${phase} already answered`);
  if (phase === "post" && !phaseDone(log, "pre")) throw new Error("pilot: post before pre");
  const rows = config.items.map((item) => {
    const a = answers[item];
    if (!a) throw new Error(`pilot: ${item} unanswered`);
    return { phase, item, answer: a.answer, confidence: a.confidence, at: now };
  });
  return { ...log, responses: [...log.responses, ...rows] };
}

const correct = (log: PilotLog, phase: Phase, item: MisconceptionId) =>
  log.responses.find((r) => r.phase === phase && r.item === item)?.answer === "false";

/** Per-item pre/post, for the export only: the player is never shown a score. */
export function summarise(log: PilotLog, config: PilotConfig) {
  const items = config.items.map((id) => ({
    id,
    misconception: MISCONCEPTIONS.find((m) => m.id === id)?.misconception ?? id,
    pre: log.responses.find((r) => r.phase === "pre" && r.item === id)?.answer ?? null,
    post: log.responses.find((r) => r.phase === "post" && r.item === id)?.answer ?? null,
    shifted: phaseDone(log, "post") && !correct(log, "pre", id) && correct(log, "post", id),
  }));
  const shifted = items.filter((i) => i.shifted).length;
  const need = config.thresholds.itemsShiftedForGain;
  return {
    items,
    shifted,
    gain: need === null ? "threshold pending OD-13" : phaseDone(log, "post") ? shifted >= need : null,
  };
}

/** The export file. Nothing identifying: no save, no route history, only this log. */
export function exportLog(log: PilotLog, config: PilotConfig, now = new Date().toISOString()): string {
  return JSON.stringify(
    {
      exportedAt: now,
      instrument: { id: config.id, version: config.version, reviewStatus: config.reviewStatus },
      thresholds: config.thresholds,
      summary: summarise(log, config),
      log,
    },
    null,
    2,
  );
}
