/** One place to look content up. */
import { leafBundle } from "./chapters/leaf";
import { prologueBundle } from "./chapters/prologue";
import { MATERIALS, PROCESSES } from "./processes";
import { ORGANISMS } from "./organisms";
import type { Chapter, ChapterBundle, CodexEntry, Mission, Rumor, Scene } from "./schema";
import { LATER_BUNDLES, valleyScene } from "./valley";

/** Every chapter, once. A new chapter is one more bundle here. */
const BUNDLES: ChapterBundle[] = [prologueBundle, leafBundle, ...LATER_BUNDLES];

export const CHAPTERS: Chapter[] = BUNDLES.map((b) => b.chapter).sort(
  (a, b) => order(a.number) - order(b.number),
);
function order(n: string) {
  return n === "P" ? 0 : Number(n);
}

export const SCENES: Scene[] = [valleyScene, ...BUNDLES.flatMap((b) => b.scenes)];
export const MISSIONS: Mission[] = BUNDLES.flatMap((b) => b.missions);
export const CODEX: CodexEntry[] = BUNDLES.flatMap((b) => b.codex);
export const RUMORS: Rumor[] = BUNDLES.flatMap((b) => b.rumors);

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
