import { readFileSync, readdirSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MISCONCEPTIONS } from "../content/misconceptions";
import type { StorageLike } from "../save/storage";
import { PILOT, type PilotConfig } from "./config";
import {
  PILOT_KEY,
  exportLog,
  loadLog,
  postOpen,
  recordPhase,
  saveLog,
  setOptIn,
  summarise,
  type Answer,
} from "./log";

const memory = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
};
const all = (answer: Answer, config: PilotConfig = PILOT) =>
  Object.fromEntries(config.items.map((id) => [id, { answer, confidence: 2 as const }]));

afterEach(() => vi.unstubAllGlobals());

describe("pilot instrumentation (T33)", () => {
  it("keys every item to a misconception in the bank", () => {
    const ids = new Set(MISCONCEPTIONS.map((m) => m.id));
    expect(PILOT.items.filter((id) => !ids.has(id))).toEqual([]);
  });

  it("leaves thresholds pending OD-13 and the instrument a draft", () => {
    expect(PILOT.thresholds).toEqual({ postAfterChapters: null, itemsShiftedForGain: null });
    expect(PILOT.reviewStatus).toBe("draft");
  });

  it("records nothing until the player opts in, and pre before post", () => {
    const log = loadLog(memory(), PILOT);
    expect(() => recordPhase(log, PILOT, "pre", all("true"))).toThrow(/not opted in/);
    const on = setOptIn(log, true);
    expect(() => recordPhase(on, PILOT, "post", all("false"))).toThrow(/post before pre/);
    const pre = recordPhase(on, PILOT, "pre", all("true"));
    expect(() => recordPhase(pre, PILOT, "pre", all("true"))).toThrow(/already answered/);
    expect(() => recordPhase(on, PILOT, "pre", {})).toThrow(/unanswered/);
  });

  it("opens the closing questions on the configured threshold", () => {
    const pre = recordPhase(setOptIn(loadLog(undefined, PILOT), true), PILOT, "pre", all("true"));
    expect(postOpen(pre, PILOT, 0)).toBe(true);
    const gated = { ...PILOT, thresholds: { ...PILOT.thresholds, postAfterChapters: 2 } };
    expect(postOpen(pre, gated, 1)).toBe(false);
    expect(postOpen(pre, gated, 2)).toBe(true);
  });

  it("judges gain only once a threshold is configured", () => {
    const pre = recordPhase(setOptIn(loadLog(undefined, PILOT), true), PILOT, "pre", all("not-sure"));
    const post = recordPhase(pre, PILOT, "post", all("false"));
    expect(summarise(post, PILOT)).toMatchObject({
      shifted: PILOT.items.length,
      gain: "threshold pending OD-13",
    });
    const set = { ...PILOT, thresholds: { ...PILOT.thresholds, itemsShiftedForGain: 3 } };
    expect(summarise(post, set).gain).toBe(true);
    expect(summarise(pre, set).gain).toBeNull();
  });

  it("round-trips through storage and survives corrupt data", () => {
    const s = memory();
    const log = recordPhase(setOptIn(loadLog(s, PILOT), true), PILOT, "pre", all("true"));
    expect(saveLog(s, log)).toBe(true);
    expect(loadLog(s, PILOT)).toEqual(log);
    s.setItem(PILOT_KEY, "{not json");
    expect(loadLog(s, PILOT).responses).toEqual([]);
    expect(saveLog(undefined, log)).toBe(false);
  });

  it("reads a log left under the pre-rename key", () => {
    const s = memory();
    const log = setOptIn(loadLog(s, PILOT), true);
    s.setItem("soilworlds:pilot:v1", JSON.stringify(log));
    expect(loadLog(s, PILOT)).toEqual(log);
  });

  it("makes no network call across opt-in, answers, storage and export", () => {
    const net = { fetch: vi.fn(), XMLHttpRequest: vi.fn(), WebSocket: vi.fn(), EventSource: vi.fn() };
    const beacon = vi.fn();
    for (const [k, v] of Object.entries(net)) vi.stubGlobal(k, v);
    vi.stubGlobal("navigator", { sendBeacon: beacon });
    const s = memory();
    let log = setOptIn(loadLog(s, PILOT), true);
    log = recordPhase(log, PILOT, "pre", all("true"));
    log = recordPhase(log, PILOT, "post", all("false"));
    saveLog(s, log);
    const out = JSON.parse(exportLog(loadLog(s, PILOT), PILOT));
    expect(out.log.responses).toHaveLength(PILOT.items.length * 2);
    for (const f of [...Object.values(net), beacon]) expect(f).not.toHaveBeenCalled();
  });

  it("names no network API in the pilot code or its UI", () => {
    const files = [
      ...readdirSync("src/pilot")
        .filter((f) => !f.endsWith(".test.ts"))
        .map((f) => `src/pilot/${f}`),
      ...readdirSync("src/ui")
        .filter((f) => /^Pilot.*\.tsx$/.test(f))
        .map((f) => `src/ui/${f}`),
    ];
    expect(files.length).toBeGreaterThan(2);
    const re = /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource|navigator)\b|https?:\/\//;
    expect(files.filter((f) => re.test(readFileSync(f, "utf8")))).toEqual([]);
  });
});
