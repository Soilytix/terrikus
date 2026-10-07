/**
 * Game progress as pure functions over the save: what is visible, which step
 * is next, and what completing a step writes into the notebook. No React here,
 * so every rule has a direct test.
 */
import {
  CHAPTERS,
  DISCOVERIES,
  RUMORS,
  chapter as chapterById,
  mission,
  scene as sceneById,
} from "../content";
import type {
  Chapter,
  Discovery,
  Mission,
  OnComplete,
  RecallCard,
  Rumor,
  Scene,
  SceneObject,
  Step,
} from "../content/schema";
import type { Save } from "../save/schema";

const add = (list: string[], ...items: string[]) => [...new Set([...list, ...items])];

export function flags(save: Save): Set<string> {
  return new Set([...save.flags, ...save.chaptersUnlocked.map((c) => `chapter:${c}`)]);
}

export function visibleObjects(s: Scene, save: Save): SceneObject[] {
  const f = flags(save);
  return s.objects.filter((o) => (!o.requires || f.has(o.requires)) && !(o.hiddenBy && f.has(o.hiddenBy)));
}

export function isScanned(save: Save, sceneId: string, objectId: string): boolean {
  return save.scanned.includes(`${sceneId}/${objectId}`);
}

/** First mission in the chapter not yet done. */
export function activeMission(chapterId: string, save: Save): Mission | undefined {
  const ch = CHAPTERS.find((c) => c.id === chapterId);
  if (!ch || !save.chaptersUnlocked.includes(ch.id)) return undefined;
  return ch.missions.map((id) => mission(id)).find((m): m is Mission => !!m && !save.missions[m.id]?.done);
}

export function stepIndex(save: Save, missionId: string): number {
  return save.missions[missionId]?.step ?? 0;
}

export function currentStep(save: Save, m: Mission): Step | undefined {
  return m.steps[stepIndex(save, m.id)];
}

/** The flags and rumors a step or mission names in its `onComplete`. */
function apply(save: Save, on: OnComplete | undefined): Save {
  if (!on) return save;
  return { ...save, flags: add(save.flags, ...(on.flags ?? [])), rumors: { ...save.rumors, ...on.rumors } };
}

/** Side effects of finishing a step. */
function complete(save: Save, step: Step): Save {
  if (step.kind === "discover") {
    const cards = { ...save.cards };
    for (const c of step.cards ?? []) cards[c] = "full";
    save = {
      ...save,
      discoveries: add(save.discoveries, ...step.discoveries),
      codex: add(save.codex, ...(step.codex ?? [])),
      cards,
    };
  }
  if (step.kind === "rumor") {
    save = { ...save, rumors: { ...save.rumors, [step.rumor]: save.rumors[step.rumor] ?? "glimpsed" } };
  }
  return apply(save, step.onComplete);
}

/** WB§1: the valley map opens once chapters 1 and 2 are both done. */
export const MAP_AFTER = ["c1", "leaf"];

export const rumorOf = (c: Chapter) => c.rumor ?? `r-${c.id}`;

/** Whether WB§1 progression lets a chapter open, built or not. */
export function canOpen(c: Chapter, save: Save): boolean {
  const done = save.chaptersComplete;
  if (!c.after.every((a) => done.includes(a))) return false;
  if (c.needsAny && done.filter((id) => id !== "prologue").length < c.needsAny) return false;
  return !c.byRumor || !!save.rumors[rumorOf(c)];
}

/** Open the map and every built chapter progression now allows. */
function unlock(save: Save): Save {
  let next = MAP_AFTER.every((id) => save.chaptersComplete.includes(id)) ? setFlag(save, "map-open") : save;
  for (const c of CHAPTERS) {
    if (!c.playable || next.chaptersUnlocked.includes(c.id) || !canOpen(c, next)) continue;
    // A newly opened chapter arrives as the rumor it starts from.
    next = {
      ...next,
      chaptersUnlocked: add(next.chaptersUnlocked, c.id),
      rumors: { [rumorOf(c)]: "glimpsed", ...next.rumors },
    };
  }
  return next;
}

export type ChapterState = "complete" | "open" | "ready" | "locked" | "planned";

/** Contents and map state; `ready` is a chapter progression allows that is not built yet. */
export function chapterState(c: Chapter, save: Save): ChapterState {
  if (save.chaptersComplete.includes(c.id)) return "complete";
  if (save.chaptersUnlocked.includes(c.id)) return "open";
  if (!c.playable) return canOpen(c, save) ? "ready" : "planned";
  return "locked";
}

/** Meeting a later chapter's opening rumor, e.g. on the valley map. */
export function glimpse(save: Save, chapterId: string): Save {
  const c = chapterById(chapterId);
  if (!c || save.rumors[rumorOf(c)]) return save;
  return unlock({ ...save, rumors: { ...save.rumors, [rumorOf(c)]: "glimpsed" } });
}

function finishMission(save: Save, m: Mission): Save {
  const next: Save = apply({ ...save, flags: add(save.flags, `${m.id}-done`) }, m.onComplete);
  const ch = CHAPTERS.find((c) => c.id === m.chapter);
  if (!ch || !ch.missions.every((id) => next.missions[id]?.done)) return next;
  return unlock({ ...next, chaptersComplete: add(next.chaptersComplete, ch.id) });
}

/** Finish the current step of a mission and enter the next. */
export function advance(save: Save, missionId: string): Save {
  const m = mission(missionId);
  if (!m) return save;
  const i = stepIndex(save, missionId);
  const step = m.steps[i];
  if (!step || save.missions[missionId]?.done) return save;
  let next = complete(save, step);
  const done = i + 1 >= m.steps.length;
  next = { ...next, missions: { ...next.missions, [missionId]: { step: done ? i : i + 1, done } } };
  return done ? finishMission(next, m) : next;
}

/** Start a mission's record at its first step. */
export function begin(save: Save, missionId: string): Save {
  if (!mission(missionId) || save.missions[missionId]) return save;
  return { ...save, missions: { ...save.missions, [missionId]: { step: 0, done: false } } };
}

/** Arriving in a scene: a scale stamp, and any `go` step that pointed here. */
export function visit(save: Save, sceneId: string): Save {
  const s = sceneById(sceneId);
  if (!s) return save;
  let next: Save = { ...save, stamps: add(save.stamps, s.scale) };
  if (s.chapter !== "valley") {
    // Being in a chapter investigates the rumors that pointed at it.
    const rumors = { ...next.rumors };
    for (const r of RUMORS)
      if (r.hintsAt.includes(s.chapter) && rumors[r.id] === "glimpsed") rumors[r.id] = "investigated";
    next = { ...next, rumors };
    const m = activeMission(s.chapter, next);
    const step = m && currentStep(next, m);
    if (m && step?.kind === "go" && step.scene === sceneId) next = advance(next, m.id);
  }
  return next;
}

/** Scanning an object: remember it, open its card partially, finish a scan step when all are in. */
export function scan(save: Save, sceneId: string, objectId: string): Save {
  const s = sceneById(sceneId);
  const o = s?.objects.find((x) => x.id === objectId);
  if (!s || !o) return save;
  let next: Save = { ...save, scanned: add(save.scanned, `${sceneId}/${objectId}`) };
  if (o.card && next.cards[o.card] !== "full")
    next = { ...next, cards: { ...next.cards, [o.card]: "partial" } };
  if (s.chapter !== "valley") {
    const m = activeMission(s.chapter, next);
    const step = m && currentStep(next, m);
    if (
      m &&
      step?.kind === "scan" &&
      m.scene === sceneId &&
      step.objects.every((id) => isScanned(next, sceneId, id))
    )
      next = advance(next, m.id);
  }
  return next;
}

/** The first active mission in a chapter that uses this bench: the bench runs on its behalf. */
export function benchMission(bench: string, save: Save): Mission | undefined {
  const uses = (id: string) => mission(id)?.steps.some((s) => s.kind === "bench" && s.bench === bench);
  return CHAPTERS.filter((c) => c.missions.some(uses))
    .map((c) => activeMission(c.id, save))
    .find((m) => !!m);
}

/** The scientist lens is open once a chapter that brings it is unlocked. */
export function lensAvailable(save: Save): boolean {
  return CHAPTERS.some((c) => c.lens && save.chaptersUnlocked.includes(c.id));
}

/** Review shortcut (`?unlock`, internal profile only): every built chapter and the map open. */
export function unlockAll(save: Save): Save {
  const built = CHAPTERS.filter((c) => c.playable);
  const rumors = Object.fromEntries(built.map((c) => [rumorOf(c), "glimpsed" as const]));
  return setFlag(
    {
      ...save,
      chaptersUnlocked: add(save.chaptersUnlocked, ...built.map((c) => c.id)),
      rumors: { ...rumors, ...save.rumors },
    },
    "map-open",
  );
}

export function setFlag(save: Save, flag: string): Save {
  return save.flags.includes(flag) ? save : { ...save, flags: add(save.flags, flag) };
}

/**
 * Recall on return (WB§7.4): entering a chapter from elsewhere asks up to two
 * questions whose answers the player has already found there.
 */
export function recallOnReturn(
  save: Save,
  sceneId: string,
  fromChapter: string | undefined,
): (RecallCard & { answer: Discovery })[] {
  const s = sceneById(sceneId);
  if (!s || s.chapter === "valley" || s.chapter === fromChapter) return [];
  return (chapterById(s.chapter)?.recall ?? [])
    .filter((r) => save.discoveries.includes(r.discovery))
    .map((r) => ({ ...r, answer: DISCOVERIES.find((d) => d.id === r.discovery)! }))
    .slice(0, 2);
}

/** Opening the Rumor Map counts a view of each rumor in its current state. */
export function viewRumors(save: Save): Save {
  const views = { ...save.rumorViews };
  for (const [id, state] of Object.entries(save.rumors)) {
    const v = views[id];
    views[id] = v?.state === state ? { state, n: v.n + 1 } : { state, n: 1 };
  }
  return { ...save, rumorViews: views };
}

/** WB§7.1: after two views without progress, an unexplained rumor offers where to look. */
export function whereToLook(save: Save, r: Rumor): string | undefined {
  const state = save.rumors[r.id];
  const v = save.rumorViews[r.id];
  if (!state || state === "explained" || !v || v.state !== state || v.n < 3) return undefined;
  const c = chapterById(r.hintsAt[0] ?? r.chapter);
  if (!c) return undefined;
  if (save.chaptersUnlocked.includes(c.id))
    return `Go to ${sceneById(c.entry)?.title.toLowerCase() ?? "the valley"}: chapter ${c.number}, ${c.title}, starts there.`;
  if (c.playable)
    return `Chapter ${c.number}, ${c.title}, opens when you finish ${c.after.map((a) => chapterById(a)?.title).join(" and ")}.`;
  return `Chapter ${c.number}, ${c.title}, is not built yet. The question stays open in your notebook.`;
}
