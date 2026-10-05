/**
 * Content types (spec §5). Content is typed data; code never hard-codes a fact.
 * Every Fact cites at least one source id from docs/sources.md and carries a
 * confidence; every node carries a review status (world-bible §9).
 */
import type { SourceId } from "./sources";
import type { LeverSettings } from "../sim/benches/leaf-jar";

export type { SourceId };
export type Confidence = "firm" | "estimate" | "contested";
export type EvidenceKind = "measured" | "derived" | "inferred";
export type ReviewStatus = "draft" | "in-review" | "approved" | "needs-changes";
export type Scale = "landscape" | "field" | "profile" | "aggregate" | "rhizosphere" | "cell";
export type TruthTag = "reference-drawn" | "schematic" | "decorative";
export type MisconceptionId = `M${number}`;
export type ChapterId = "prologue" | "leaf" | `c${number}`;

export interface Fact {
  id: string;
  text: string;
  confidence: Confidence;
  evidence?: EvidenceKind;
  sources: SourceId[];
  simplification?: string;
}

/** A node a reviewer signs off. */
export interface Reviewed {
  reviewStatus: ReviewStatus;
  reviewer?: string;
}

/** Group badge: shape + text, never colour alone (art-direction §6.2). */
export type GroupBadge =
  "decomposer" | "grazer" | "transformer" | "mutualist" | "pathogen" | "engineer" | "shredder";

export type HowWeKnow = "microscopy" | "culture" | "dna" | "process";

export interface Organism extends Reviewed {
  id: string;
  name: string;
  /** One-line role in context; never "good" or "bad". */
  role: string;
  group: GroupBadge;
  /** True size range, metres. */
  sizeRange: [number, number];
  scales: Scale[];
  eats: string[];
  eatenBy: string[];
  transforms: string[];
  needs: string[];
  howWeKnow: HowWeKnow[];
  facts: Fact[];
  /** Asset id from src/assets/manifest.ts, if the card has hero art. */
  art?: string;
  truthTag: TruthTag;
  misconceptions: MisconceptionId[];
}

export type PoolId = "L" | "D" | "B" | "M" | "co2Out";

export interface Process extends Reviewed {
  id: string;
  name: string;
  summary: string;
  inputs: PoolId[];
  outputs: PoolId[];
  conditions: string[];
  ruleId?: string;
  facts: Fact[];
}

export interface Misconception {
  id: MisconceptionId;
  misconception: string;
  correctIdea: string;
}

/** A clickable or scannable thing in a scene. Anchor is in plate units (0..1). */
export interface SceneObject {
  id: string;
  label: string;
  kind: "scan" | "portal" | "action" | "glimpse";
  anchor: { x: number; y: number };
  /** Scan text: what the naturalist notices. */
  scan?: string;
  /** Field card unlocked (partially) by scanning. */
  card?: string;
  facts?: Fact[];
  /** Portal target: a scene id, or a route like `#/bench/leaf-jar`. */
  to?: string;
  /** Only visible once a flag is set (e.g. a mission step). */
  requires?: string;
  /** Hidden once a flag is set. */
  hiddenBy?: string;
}

export interface Scene extends Reviewed {
  id: string;
  chapter: ChapterId | "valley";
  title: string;
  scale: Scale;
  /** Painter recipe id (src/world/painter/recipes). */
  recipe: string;
  seed: number;
  /** Scale bar: true length the bar represents, and its label. */
  scaleBar: { metres: number; label: string };
  /** Enlargement badge when actors are drawn bigger than true size. */
  notToScale?: number;
  /** Scene alt text: read by the outline and used as the static plate's description. */
  description: string;
  /** "What is real here?" truth panel (world-bible §7.5). */
  truth: { drawnFrom: string[]; schematic: string[]; invented: string[]; notSimulated: string[] };
  objects: SceneObject[];
  /** The scene the Esc key / "up" goes to. */
  up?: string;
}

export interface Rumor {
  id: string;
  text: string;
  chapter: ChapterId;
  /** Rumor-map edges. */
  hintsAt: string[];
  explainedBy?: string;
}

export interface Discovery {
  id: string;
  statement: string;
  evidenceTier: "observed" | "derived" | "interpreted" | "would-do";
}

export interface CodexEntry extends Reviewed {
  id: string;
  title: string;
  chapter: ChapterId;
  /** Paragraphs; each references facts so sources show inline. */
  body: string[];
  facts: Fact[];
  realWorld?: Fact[];
  simplification?: string;
  /** Contested items get the open-question treatment (art-direction §6.5). */
  openQuestion?: { claim: string; sides: string[]; sources: SourceId[] };
  /** Historical idea shown struck through. */
  revised?: { old: string; now: string; sources: SourceId[] };
}

export type CardKind = "condition" | "actor" | "process" | "outcome";
export type Connector =
  "increases" | "decreases" | "enables" | "limits" | "only-if" | "releases" | "is-associated-with";

export interface CauseCard {
  id: string;
  kind: CardKind;
  label: string;
}

/**
 * A chain template: alternating cards and connectors. A slot is fixed (one
 * option) or a blank with several options. Accepted lists every full answer
 * that counts as supported (variants included).
 */
export interface ChainTemplate {
  id: string;
  title: string;
  cards: string[][];
  connectors: Connector[][];
  accepted: { cards: string[]; connectors: Connector[] }[];
  /** Diagnostics keyed by a pattern on the answer (world-bible ch. 2 table). */
  diagnostics: ChainDiagnostic[];
  sequencingOnly?: boolean;
  /** Which bench runs back this chain (so a verdict can point at a run). */
  evidence: string;
}

export interface ChainDiagnostic {
  /** Matches when every listed slot holds the listed value. */
  when: { card?: [number, string]; connector?: [number, Connector] }[];
  message: string;
  misconception: MisconceptionId;
}

export type Verdict = "supported" | "plausible" | "contradicted";

export interface Choice {
  id: string;
  label: string;
  /** Feedback shown after commit; never "wrong!", always an observation or a question. */
  feedback: string;
  /** Accepted as a defensible answer. */
  ok: boolean;
  misconception?: MisconceptionId;
}

export type Step =
  | { kind: "notice"; text: string; cta?: string; goto?: string }
  | { kind: "go"; text: string; scene: string; object?: string }
  | { kind: "scan"; text: string; objects: string[] }
  | {
      kind: "predict-slider";
      id: string;
      question: string;
      min: number;
      max: number;
      unit: string;
    }
  | { kind: "predict-choice"; id: string; question: string; choices: Choice[]; multi?: boolean }
  | { kind: "observe-composition"; text: string; resultText: string; facts: Fact[] }
  | { kind: "reactive-water-air"; text: string }
  | { kind: "explain-choice"; id: string; question: string; choices: Choice[] }
  | { kind: "hand-decompose"; text: string; turns: number; cue: number }
  | {
      kind: "bench";
      text: string;
      /** Required comparison: jar A and jar B settings. */
      a: Partial<LeverSettings>;
      b?: Partial<LeverSettings>;
      predict?: { id: string; question: string; choices: Choice[] };
    }
  | { kind: "chains"; text: string; chains: string[] }
  | {
      kind: "transfer";
      id: string;
      scenario: string;
      question: string;
      choices: Choice[];
      measure: Choice[];
    }
  | { kind: "discover"; text: string; discoveries: string[]; codex?: string[]; cards?: string[] }
  | { kind: "rumor"; rumor: string; text: string };

export type { LeverSettings };

export interface Mission extends Reviewed {
  id: string;
  chapter: ChapterId;
  title: string;
  tier: "T1" | "T2" | "T3" | "T4";
  learningObjective: string;
  misconceptionsTargeted: MisconceptionId[];
  /** Scene the mission panel belongs to. */
  scene: string;
  steps: Step[];
  sources: SourceId[];
  simplificationNotes: string[];
}

export interface Chapter extends Reviewed {
  id: ChapterId;
  number: string;
  title: string;
  hook: string;
  scales: Scale[];
  world: WorldId;
  scenes: string[];
  missions: string[];
  entry: string;
  sources: SourceId[];
  /** Chapters that must be complete first; empty means open from the start. */
  after: ChapterId[];
  playable: boolean;
}

export type WorldId = "spinach" | "pea" | "bean" | "sugarbeet" | "rice" | "forest" | "bare";

export interface World {
  id: WorldId;
  name: string;
  teaches: string;
  rootArchitecture: "tap" | "fibrous" | "none";
  mycorrhizal: "AM" | "ECM" | "none";
  partner?: string;
  residueCN?: [number, number];
  sources: SourceId[];
}

export type Licence = "soilytix" | "pd" | "cc0" | "cc-by" | "cc-by-sa" | "ofl" | "internal-only";

export interface Asset {
  id: string;
  /** Path inside src/assets/. */
  path: string;
  source: SourceId;
  licence: Licence;
  owner: string;
  truthStatus: TruthTag;
  publicOk: boolean;
  attribution?: string;
  referenceUrl?: string;
  provenance: string;
}

export interface Material extends Reviewed {
  id: string;
  name: string;
  summary: string;
  /** True size range, metres, where it has one. */
  sizeRange?: [number, number];
  facts: Fact[];
}
