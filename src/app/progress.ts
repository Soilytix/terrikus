/**
 * Game progress as pure functions over the save: what is visible, which step
 * is next, and what completing a step writes into the notebook. No React here,
 * so every rule has a direct test.
 */
import { CHAPTERS, mission, scene as sceneById } from "../content";
import type { Mission, Scene, SceneObject, Step } from "../content/schema";
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

/** Side effects of a step becoming current. */
function enter(save: Save, step: Step | undefined): Save {
  if (step?.kind === "bench") return { ...save, flags: add(save.flags, "c2-bench-open") };
  return save;
}

/** Side effects of finishing a step. */
function complete(save: Save, step: Step): Save {
  if (step.kind === "discover") {
    const cards = { ...save.cards };
    for (const c of step.cards ?? []) cards[c] = "full";
    const rumors = { ...save.rumors };
    if (step.discoveries.includes("d-c2-conserved")) rumors["r-c2-leaf"] = "explained";
    return {
      ...save,
      discoveries: add(save.discoveries, ...step.discoveries),
      codex: add(save.codex, ...(step.codex ?? [])),
      cards,
      rumors,
    };
  }
  if (step.kind === "rumor") {
    return { ...save, rumors: { ...save.rumors, [step.rumor]: save.rumors[step.rumor] ?? "glimpsed" } };
  }
  return save;
}

function finishMission(save: Save, m: Mission): Save {
  let next: Save = { ...save, flags: add(save.flags, `${m.id}-done`) };
  const ch = CHAPTERS.find((c) => c.id === m.chapter);
  if (ch && ch.missions.every((id) => next.missions[id]?.done)) {
    next = { ...next, chaptersComplete: add(next.chaptersComplete, ch.id) };
    for (const c of CHAPTERS) {
      if (!c.playable || next.chaptersUnlocked.includes(c.id)) continue;
      if (c.after.every((a) => next.chaptersComplete.includes(a))) {
        next = { ...next, chaptersUnlocked: add(next.chaptersUnlocked, c.id) };
        const hook = `r-${c.id}`;
        // A newly opened chapter arrives as the rumor it starts from.
        const rumor = c.id === "leaf" ? "r-c2-leaf" : hook;
        next = { ...next, rumors: { [rumor]: "glimpsed", ...next.rumors } };
      }
    }
  }
  return next;
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
  if (done) return finishMission(next, m);
  return enter(next, m.steps[i + 1]);
}

/** Make sure the first step of a mission has had its entry effects. */
export function begin(save: Save, missionId: string): Save {
  const m = mission(missionId);
  if (!m || save.missions[missionId]) return save;
  return enter(
    { ...save, missions: { ...save.missions, [missionId]: { step: 0, done: false } } },
    m.steps[0],
  );
}

/** Arriving in a scene: a scale stamp, and any `go` step that pointed here. */
export function visit(save: Save, sceneId: string): Save {
  const s = sceneById(sceneId);
  if (!s) return save;
  let next: Save = { ...save, stamps: add(save.stamps, s.scale) };
  if (s.chapter !== "valley") {
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

export function setFlag(save: Save, flag: string): Save {
  return save.flags.includes(flag) ? save : { ...save, flags: add(save.flags, flag) };
}
