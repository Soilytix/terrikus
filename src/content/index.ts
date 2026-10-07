/** One place to look content up. */
import { c1Bundle } from "./chapters/c1";
import { c3Bundle } from "./chapters/c3";
import { c4Bundle } from "./chapters/c4";
import { c5Bundle } from "./chapters/c5";
import { c11Bundle } from "./chapters/c11";
import { c6Bundle, C6_DISCOVERIES } from "./chapters/c6";
import { c7Bundle, C7_DISCOVERIES } from "./chapters/c7";
import { leafBundle } from "./chapters/leaf";
import { prologueBundle } from "./chapters/prologue";
import { MATERIALS, PROCESSES } from "./processes";
import { ORGANISMS } from "./organisms";
import type { Chapter, ChapterBundle, CodexEntry, Mission, Rumor, Scene } from "./schema";
import { DISCOVERIES as VALLEY_DISCOVERIES, LATER_BUNDLES, valleyMapScene, valleyScene } from "./valley";

/** Every chapter, once. A new chapter is one more bundle here. */
const BUNDLES: ChapterBundle[] = [
  prologueBundle,
  c1Bundle,
  leafBundle,
  c3Bundle,
  c4Bundle,
  c5Bundle,
  c6Bundle,
  c7Bundle,
  c11Bundle,
  ...LATER_BUNDLES,
];

export const CHAPTERS: Chapter[] = BUNDLES.map((b) => b.chapter).sort(
  (a, b) => order(a.number) - order(b.number),
);
function order(n: string) {
  return n === "P" ? 0 : Number(n);
}

export const SCENES: Scene[] = [valleyScene, valleyMapScene, ...BUNDLES.flatMap((b) => b.scenes)];
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
export const DISCOVERIES = [...VALLEY_DISCOVERIES, ...C6_DISCOVERIES, ...C7_DISCOVERIES];
