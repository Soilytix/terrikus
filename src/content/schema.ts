/**
 * Content types (spec §5). Content is typed data; code never hard-codes a fact.
 * Every Fact cites at least one source id from docs/sources.md and carries a
 * confidence; every node carries a review status (world-bible §9).
 */
import type { SourceId } from "./sources";
import type { BenchId } from "../sim/benches";
import type { Moisture } from "../sim/films";
import type { RungId } from "../sim/redox";
import type { SlopePosition } from "../sim/catena";
import type { HorizonId } from "../sim/pedogenesis";

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

export type HowWeKnow = "microscopy" | "culture" | "dna" | "process" | "hand-sorting";

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
  /** Anchor on a portrait plate (h > w), where the recipe has a portrait branch. */
  portrait?: { x: number; y: number };
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
  /** reference: a literature value the learner was shown, not something they measured. */
  evidenceTier: "observed" | "derived" | "interpreted" | "reference" | "would-do";
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
  /**
   * Each connector is the link's own causal sign. This is the net direction
   * the run observed from first card to last; an answer whose signs multiply
   * to the opposite contradicts the run.
   */
  observed: 1 | -1;
  /** The run shows the direction but cannot show this mechanism; an accepted answer stays plausible. */
  untested?: string;
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

/** One question of a flow diagram (the feel test, thien-1979). `to` is the next node, or `=Class` to finish. */
export interface FlowNode {
  id: string;
  question: string;
  /** What the player's fingers do to find out. */
  action: string;
  branches: { id: string; label: string; to: string }[];
}

/**
 * An effect split among candidate sources. Shares are per cent and sum to 100,
 * or "unresolved" when the evidence cannot yet separate them (WB ch. 3).
 */
export interface Attribution {
  effect: string;
  candidates: { id: string; label: string }[];
  shares: Record<string, number> | "unresolved";
  sources: SourceId[];
}

/** Baked frames crossfaded in order (`tools/bake-plates.ts`); `compression` is always on screen while it plays. */
export interface Timelapse {
  id: string;
  compression: string;
  frames: { label: string; recipe: string; seed: number }[];
}

/** What finishing a step or mission writes into the save, besides its own record. */
export interface OnComplete {
  flags?: string[];
  rumors?: Record<string, "glimpsed" | "investigated" | "explained">;
}

export type Step = (
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
  /** `flag` is set the first time the slider moves. */
  | { kind: "reactive-water-air"; text: string; flag: string }
  | { kind: "explain-choice"; id: string; question: string; choices: Choice[] }
  | { kind: "hand-decompose"; text: string; turns: number; cue: number }
  | {
      kind: "bench";
      text: string;
      bench: BenchId;
      /** Required comparison: jar A and jar B lever settings, by the bench's lever names. */
      a: Record<string, string>;
      b?: Record<string, string>;
      predict?: { id: string; question: string; choices: Choice[] };
    }
  | {
      kind: "chains";
      text: string;
      chains: string[];
      /** Judge at once (the evidence is already in hand) instead of keeping the chain for a later batch. */
      judgeNow?: boolean;
    }
  | {
      kind: "transfer";
      id: string;
      scenario: string;
      question: string;
      choices: Choice[];
      measure: Choice[];
    }
  | {
      kind: "discover";
      text: string;
      discoveries: string[];
      codex?: string[];
      cards?: string[];
      /** Closes the loop: the learner's saved prediction set beside what was observed. */
      recall?: { prediction: string; unit: string; observed: string };
    }
  | { kind: "rumor"; rumor: string; text: string }
  | {
      kind: "feel-test";
      text: string;
      diagram: FlowNode[];
      /** What the sample does at each node: the branch it takes and what the fingers feel. */
      sample: Record<string, { branch: string; felt: string }>;
      facts: Fact[];
    }
  /** Guided amoeba movement on the `LABYRINTH` film graph (OD-10). Each goal: try this pore at this moisture. */
  | {
      kind: "labyrinth";
      text: string;
      goals: { site: string; moisture: Moisture; outcome: "reach" | "no-film" | "too-narrow" }[];
    }
  | { kind: "grazer-week"; text: string; moisture: Moisture; resultText: string; facts: Fact[] }
  | { kind: "slake"; text: string; resultText: string; facts: Fact[] }
  | { kind: "build-crumb"; text: string; resultText: string; facts: Fact[] }
  /** Chapter 3 water benches (`src/ui/WaterRoads.tsx`) on the rules in `src/sim/water.ts`. */
  | {
      kind: "water";
      bench: "drain" | "stranded" | "birch" | "fast-lanes";
      text: string;
      resultText: string;
      facts: Fact[];
      attribution?: Attribution;
    }
  /** Chapter 5 surface (`src/sim/exchange.ts`): seat cations then add acid, or fertilise then rain. */
  | { kind: "exchange"; mode: "chairs" | "leaky"; text: string; resultText: string; facts: Fact[] }
  | { kind: "ph-dial"; text: string; resultText: string; facts: Fact[] }
  /** Chapter 4 redox benches (`src/ui/BreathRust.tsx`) on the rules in `src/sim/redox.ts`; `floors` says what each rung looks and smells like. */
  | {
      kind: "redox";
      bench: "elevator" | "microsites" | "drain";
      text: string;
      resultText: string;
      facts: Fact[];
      floors?: Partial<Record<RungId, string>>;
    }
  /** Chapter 11 pit benches (`src/ui/PitWalls.tsx`) on `src/sim/pedogenesis.ts` and `src/sim/catena.ts`. */
  | {
      kind: "pit";
      bench: "read-wall" | "timelapse" | "podzol" | "catena" | "detective" | "rates";
      text: string;
      resultText: string;
      facts: Fact[];
      /** Read the wall: each horizon's name and evidence, revealed after the player's guess. */
      horizons?: Partial<Record<HorizonId, { name: string; evidence: string }>>;
      /** Catena: example soil names, never survey results (OD-11). */
      examples?: Record<SlopePosition, string>;
      timelapse?: Timelapse;
    }
) & { onComplete?: OnComplete };

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
  onComplete?: OnComplete;
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
  /** The rumor the chapter arrives as when it opens; `r-<id>` if unset. */
  rumor?: string;
  /** Unlocking this chapter makes the scientist lens available. */
  lens?: boolean;
  /** Opens only once its rumor has been met, as well as `after` (WB§1: chapters 3–13). */
  byRumor?: boolean;
  /** Opens once this many chapters other than the prologue are complete (WB§1: chapter 14). */
  needsAny?: number;
  /** Retrieval prompts on return (WB§7.4); a card shows only once its discovery is the player's. */
  recall?: RecallCard[];
}

export interface RecallCard {
  prompt: string;
  discovery: string;
}

/** Everything one chapter contributes; `src/content/index.ts` builds the lists from these. */
export interface ChapterBundle {
  chapter: Chapter;
  scenes: Scene[];
  missions: Mission[];
  codex: CodexEntry[];
  rumors: Rumor[];
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
