/** One place to look content up. */
import { leaf, leafCodex, leafMissions, leafRumors, leafScenes } from "./chapters/leaf";
import {
  prologue,
  prologueCodex,
  prologueMissions,
  prologueRumors,
  prologueScenes,
} from "./chapters/prologue";
import { MATERIALS, PROCESSES } from "./processes";
import { ORGANISMS } from "./organisms";
import type { Chapter, CodexEntry, Mission, Rumor, Scene } from "./schema";
import { LATER_CHAPTERS, valleyScene } from "./valley";

export const CHAPTERS: Chapter[] = [prologue, leaf, ...LATER_CHAPTERS].sort(
  (a, b) => order(a.number) - order(b.number),
);
function order(n: string) {
  return n === "P" ? 0 : Number(n);
}

export const SCENES: Scene[] = [valleyScene, ...prologueScenes, ...leafScenes];
export const MISSIONS: Mission[] = [...prologueMissions, ...leafMissions];
export const CODEX: CodexEntry[] = [...prologueCodex, ...leafCodex];
export const RUMORS: Rumor[] = [
  ...prologueRumors,
  ...leafRumors,
  ...LATER_CHAPTERS.map((c) => ({ id: `r-${c.id}`, text: c.hook, chapter: c.id, hintsAt: [c.id] })),
];

export const scene = (id: string) => SCENES.find((s) => s.id === id);
export const chapter = (id: string) => CHAPTERS.find((c) => c.id === id);
export const mission = (id: string) => MISSIONS.find((m) => m.id === id);
export const codex = (id: string) => CODEX.find((c) => c.id === id);

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
export { DISCOVERIES } from "./valley";
