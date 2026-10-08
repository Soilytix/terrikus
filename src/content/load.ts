/**
 * Per-chapter content loading (spec §8.2): each chapter's scenes, missions and
 * codex live in their own chunk, fetched when the chapter is needed and then
 * merged into the lists in `./index` in chapter order.
 */
import { CODEX, MISSIONS, SCENES, VALLEY_SCENES } from "./index";
import type { ChapterBundle } from "./schema";

/** Every built chapter, in the order its content joins the lists. */
export const LOADERS: Record<string, () => Promise<ChapterBundle>> = {
  prologue: () => import("./chapters/prologue").then((m) => m.prologueBundle),
  c1: () => import("./chapters/c1").then((m) => m.c1Bundle),
  leaf: () => import("./chapters/leaf").then((m) => m.leafBundle),
  c3: () => import("./chapters/c3").then((m) => m.c3Bundle),
  c4: () => import("./chapters/c4").then((m) => m.c4Bundle),
  c5: () => import("./chapters/c5").then((m) => m.c5Bundle),
  c6: () => import("./chapters/c6").then((m) => m.c6Bundle),
  c7: () => import("./chapters/c7").then((m) => m.c7Bundle),
  c8: () => import("./chapters/c8").then((m) => m.c8Bundle),
  c9: () => import("./chapters/c9").then((m) => m.c9Bundle),
  c10: () => import("./chapters/c10").then((m) => m.c10Bundle),
  c11: () => import("./chapters/c11").then((m) => m.c11Bundle),
  c12: () => import("./chapters/c12").then((m) => m.c12Bundle),
  c13: () => import("./chapters/c13").then((m) => m.c13Bundle),
  c14: () => import("./chapters/c14").then((m) => m.c14Bundle),
};

const loaded = new Map<string, ChapterBundle>();
const pending = new Map<string, Promise<void>>();

/** Whether a chapter's content is in the lists; chapters with no content chunk always are. */
export const isLoaded = (id: string) => !(id in LOADERS) || loaded.has(id);

function load(id: string): Promise<void> {
  if (isLoaded(id)) return Promise.resolve();
  let p = pending.get(id);
  if (!p) {
    p = LOADERS[id]!().then((b) => {
      loaded.set(id, b);
      const bundles = Object.keys(LOADERS).flatMap((k) => loaded.get(k) ?? []);
      SCENES.splice(0, SCENES.length, ...VALLEY_SCENES, ...bundles.flatMap((x) => x.scenes));
      MISSIONS.splice(0, MISSIONS.length, ...bundles.flatMap((x) => x.missions));
      CODEX.splice(0, CODEX.length, ...bundles.flatMap((x) => x.codex));
    });
    pending.set(id, p);
  }
  return p;
}

export const loadChapters = (ids: Iterable<string>) => Promise.all([...ids].map(load)).then(() => {});
