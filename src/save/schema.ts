/** Save schema (spec §7). Plain JSON; versioned; migrated forward one step at a time. */
import type { Connector, Verdict } from "../content/schema";
import type { LeverSettings } from "../sim/benches/leaf-jar";

export const SAVE_KEY = "terrikus:v1";
/** Keys from before the renames, newest first; read once if the current key is empty, then left behind. */
export const LEGACY_SAVE_KEYS = ["pedologicus:v1", "soilworlds:v1"];
export const SCHEMA_VERSION = 1;
export const LAB_BOOK_CAP = 200;

export type Motion = "system" | "reduced" | "full";

export interface LabEntry {
  id: string;
  at: string;
  bench: "leaf-jar";
  ruleset: string;
  mission?: string;
  prediction?: string;
  a: LeverSettings;
  b?: LeverSettings;
  /** Plain summary of what was observed, e.g. litter left at day 365. */
  result: string;
  tier: "observed" | "derived" | "interpreted" | "would-do";
  confidence?: 1 | 2 | 3;
}

export interface ChainAnswer {
  cards: string[];
  connectors: Connector[];
  confidence: 1 | 2 | 3;
  verdict?: Verdict;
}

export interface SaveV1 {
  schemaVersion: 1;
  createdAt: string;
  /** `ambient`: living backdrops move (OD-8 interim toggle). `sound`: the T32 mixer, on by default (it still waits for the first gesture). */
  settings: { motion: Motion; lens: boolean; ambient: boolean; sound: boolean };
  chaptersUnlocked: string[];
  chaptersComplete: string[];
  rumors: Record<string, "glimpsed" | "investigated" | "explained">;
  cards: Record<string, "partial" | "full">;
  codex: string[];
  discoveries: string[];
  stamps: string[];
  labBook: LabEntry[];
  chains: Record<string, ChainAnswer>;
  predictions: Record<string, string | number | string[]>;
  missions: Record<string, { step: number; done: boolean }>;
  /** Scene objects scanned, as `sceneId/objectId`. */
  scanned: string[];
  flags: string[];
  /** Rumor Map views per rumor while its state stood still (WB§7.1 "where to look" hint). */
  rumorViews: Record<string, { state: string; n: number }>;
  lastSession: { route: string; at: string } | null;
}

export type Save = SaveV1;

export function freshSave(now = new Date().toISOString()): Save {
  return {
    schemaVersion: 1,
    createdAt: now,
    settings: { motion: "system", lens: false, ambient: true, sound: true },
    chaptersUnlocked: ["prologue"],
    chaptersComplete: [],
    rumors: {},
    cards: {},
    codex: [],
    discoveries: [],
    stamps: [],
    labBook: [],
    chains: {},
    predictions: {},
    missions: {},
    scanned: [],
    flags: [],
    rumorViews: {},
    lastSession: null,
  };
}

/** Append to the lab book, dropping the oldest beyond the cap. */
export function appendLab(labBook: LabEntry[], entry: LabEntry): LabEntry[] {
  const next = [...labBook, entry];
  return next.length > LAB_BOOK_CAP ? next.slice(next.length - LAB_BOOK_CAP) : next;
}
