/**
 * One place to look content up. Chapter metadata, rumors and discoveries load
 * with the shell; a chapter's scenes, missions and codex join these lists when
 * `./load` brings its chunk in.
 */
import { c1, c1Rumors } from "./chapters/c1/chapter";
import { c3, c3Rumors } from "./chapters/c3/chapter";
import { c4, c4Rumors } from "./chapters/c4/chapter";
import { c5, c5Rumors } from "./chapters/c5/chapter";
import { c11, c11Rumors } from "./chapters/c11/chapter";
import { c6, c6Rumors, C6_DISCOVERIES } from "./chapters/c6/chapter";
import { c7, c7Rumors, C7_DISCOVERIES } from "./chapters/c7/chapter";
import { c8, c8Rumors, C8_DISCOVERIES } from "./chapters/c8/chapter";
import { c9, c9Rumors, C9_DISCOVERIES } from "./chapters/c9/chapter";
import { c10, c10Rumors, C10_DISCOVERIES } from "./chapters/c10/chapter";
import { leaf, leafRumors } from "./chapters/leaf/chapter";
import { prologue, prologueRumors } from "./chapters/prologue/chapter";
import { MATERIALS, PROCESSES } from "./processes";
import { ORGANISMS } from "./organisms";
import type { Chapter, CodexEntry, Mission, Rumor, Scene } from "./schema";
import { DISCOVERIES as VALLEY_DISCOVERIES, LATER_BUNDLES, valleyMapScene, valleyScene } from "./valley";

/** Every chapter's metadata, once. A new chapter is one more entry here and one loader in `./load`. */
const META: { chapter: Chapter; rumors: Rumor[] }[] = [
  { chapter: prologue, rumors: prologueRumors },
  { chapter: c1, rumors: c1Rumors },
  { chapter: leaf, rumors: leafRumors },
  { chapter: c3, rumors: c3Rumors },
  { chapter: c4, rumors: c4Rumors },
  { chapter: c5, rumors: c5Rumors },
  { chapter: c6, rumors: c6Rumors },
  { chapter: c7, rumors: c7Rumors },
  { chapter: c8, rumors: c8Rumors },
  { chapter: c9, rumors: c9Rumors },
  { chapter: c10, rumors: c10Rumors },
  { chapter: c11, rumors: c11Rumors },
  ...LATER_BUNDLES,
];

export const CHAPTERS: Chapter[] = META.map((b) => b.chapter).sort(
  (a, b) => order(a.number) - order(b.number),
);
function order(n: string) {
  return n === "P" ? 0 : Number(n);
}

/** Filled per chapter by `./load`; until then only the valley's scenes are here. */
export const VALLEY_SCENES: Scene[] = [valleyScene, valleyMapScene];
export const SCENES: Scene[] = [...VALLEY_SCENES];
export const MISSIONS: Mission[] = [];
export const CODEX: CodexEntry[] = [];
export const RUMORS: Rumor[] = META.flatMap((b) => b.rumors);

export const scene = (id: string) => SCENES.find((s) => s.id === id);
export const chapter = (id: string) => CHAPTERS.find((c) => c.id === id);
export const mission = (id: string) => MISSIONS.find((m) => m.id === id);
export const codex = (id: string) => CODEX.find((c) => c.id === id);

/** The chapter a scene belongs to, known before the chapter's content has loaded. */
export const sceneChapter = (id: string) =>
  VALLEY_SCENES.some((s) => s.id === id) ? "valley" : CHAPTERS.find((c) => c.scenes.includes(id))?.id;

/** Field cards: organisms, processes and materials share one namespace. */
export type FieldCard =
  | { kind: "organism"; item: (typeof ORGANISMS)[number] }
  | { kind: "process"; item: (typeof PROCESSES)[number] }
  | { kind: "material"; item: (typeof MATERIALS)[number] };

export const FIELD_CARDS: FieldCard[] = [
  ...ORGANISMS.map((item) => ({ kind: "organism" as const, item })),
  ...PROCESSES.map((item) => ({ kind: "process" as const, item })),
  ...MATERIALS.map((item) => ({ kind: "material" as const, item })),
];
export const fieldCard = (id: string) => FIELD_CARDS.find((c) => c.item.id === id);

export { ORGANISMS, PROCESSES, MATERIALS };
export const DISCOVERIES = [
  ...VALLEY_DISCOVERIES,
  ...C6_DISCOVERIES,
  ...C7_DISCOVERIES,
  ...C8_DISCOVERIES,
  ...C9_DISCOVERIES,
  ...C10_DISCOVERIES,
];
