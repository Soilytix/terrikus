import { describe, expect, it } from "vitest";
import { RUMORS, chapter, scene } from "../src/content";
import { freshSave, type Save } from "../src/save/schema";
import {
  activeMission,
  advance,
  begin,
  canOpen,
  chapterState,
  currentStep,
  glimpse,
  recallOnReturn,
  scan,
  viewRumors,
  visibleObjects,
  visit,
  whereToLook,
} from "../src/app/progress";

const finish = (save: Save, id: string): Save => {
  let s = begin(save, id);
  for (let i = 0; i < 20 && !s.missions[id]?.done; i++) s = advance(s, id);
  return s;
};

describe("progress", () => {
  it("starts in the prologue with p-m1 active", () => {
    const s = freshSave();
    expect(activeMission("prologue", s)?.id).toBe("p-m1");
    expect(activeMission("leaf", s)).toBeUndefined();
  });

  it("hides the pore portal until p-m1 is done", () => {
    const handful = scene("p-handful")!;
    const ids = (s: Save) => visibleObjects(handful, s).map((o) => o.id);
    expect(ids(freshSave())).not.toContain("pore-portal");
    expect(ids(finish(freshSave(), "p-m1"))).toContain("pore-portal");
  });

  it("writes discoveries, codex and full cards when a discover step completes", () => {
    const s = finish(freshSave(), "p-m1");
    expect(s.discoveries).toContain("d-p-half-space");
    expect(s.codex).toContain("cx-p-handful");
    expect(s.cards["pore-space"]).toBe("full");
  });

  it("completes a go step on arrival and a scan step when every object is scanned", () => {
    let s = finish(freshSave(), "p-m1");
    s = begin(s, "p-m2");
    expect(currentStep(s, activeMission("prologue", s)!)?.kind).toBe("go");
    s = visit(s, "p-pore");
    expect(s.stamps).toContain("aggregate");
    expect(currentStep(s, activeMission("prologue", s)!)?.kind).toBe("scan");
    s = scan(s, "p-pore", "bacterium");
    s = scan(s, "p-pore", "amoeba");
    expect(s.cards.amoeba).toBe("partial");
    expect(currentStep(s, activeMission("prologue", s)!)?.kind).toBe("scan");
    s = scan(s, "p-pore", "hypha");
    expect(currentStep(s, activeMission("prologue", s)!)?.kind).toBe("discover");
  });

  it("unlocks chapters 1 and 2 when the prologue is complete, with their rumors", () => {
    let s = finish(freshSave(), "p-m1");
    s = finish(s, "p-m2");
    expect(s.chaptersComplete).toContain("prologue");
    expect(s.chaptersUnlocked).toContain("leaf");
    expect(s.rumors["r-c2-leaf"]).toBe("glimpsed");
    expect(s.rumors["r-p-starving"]).toBe("glimpsed");
    expect(visibleObjects(scene("valley")!, s).map((o) => o.id)).toContain("hedge");
    expect(s.chaptersUnlocked).toContain("c1");
    expect(s.rumors["r-c1"]).toBe("glimpsed");
    expect(visibleObjects(scene("valley")!, s).map((o) => o.id)).toContain("crumb");
    // Later chapters are not playable, so they stay locked.
    expect(s.chaptersUnlocked).not.toContain("c3");
  });

  it("opens the bench when a bench step becomes current", () => {
    let s = finish(finish(freshSave(), "p-m1"), "p-m2");
    s = begin(s, "c2-m1");
    expect(s.flags).not.toContain("c2-bench-open");
    for (let i = 0; i < 3; i++) s = advance(s, "c2-m1");
    expect(currentStep(s, activeMission("leaf", s)!)?.kind).toBe("bench");
    expect(s.flags).toContain("c2-bench-open");
  });

  it("explains the leaf rumor with the conservation discovery", () => {
    let s = finish(finish(freshSave(), "p-m1"), "p-m2");
    s = finish(s, "c2-m1");
    expect(s.rumors["r-c2-leaf"]).toBe("explained");
  });

  describe("WB§1 progression and the valley map", () => {
    const prologue = () => finish(finish(freshSave(), "p-m1"), "p-m2");
    const both = () =>
      ["c1-m1", "c1-m2", "c1-m3", "c1-m4", "c2-m1", "c2-m2", "c2-m3", "c2-m4", "c2-m5"].reduce(
        finish,
        prologue(),
      );
    const mapIds = (s: Save) => visibleObjects(scene("valley")!, s).map((o) => o.id);

    it("keeps the map shut until chapters 1 and 2 are both done", () => {
      const one = ["c1-m1", "c1-m2", "c1-m3", "c1-m4"].reduce(finish, prologue());
      expect(one.chaptersComplete).toContain("c1");
      expect(mapIds(one)).not.toContain("map");
      const s = both();
      expect(s.chaptersComplete).toEqual(expect.arrayContaining(["c1", "leaf"]));
      expect(mapIds(s)).toContain("map");
    });

    it("opens chapters 3–13 only once the map is open and their rumor is met", () => {
      const c4 = chapter("c4")!;
      const early = glimpse(prologue(), "c4");
      expect(early.rumors["r-c4"]).toBe("glimpsed");
      expect(canOpen(c4, early)).toBe(false);
      const s = both();
      expect(canOpen(c4, s)).toBe(false);
      expect(chapterState(c4, s)).toBe("planned");
      const met = glimpse(s, "c4");
      expect(canOpen(c4, met)).toBe(true);
      // Not built yet, so it is ready rather than unlocked.
      expect(chapterState(c4, met)).toBe("ready");
      expect(met.chaptersUnlocked).not.toContain("c4");
    });

    it("opens chapter 3 from the dry patch on the map, and its rumor is explained by the Birch pulse", () => {
      const s = both();
      const ids = (x: Save) => visibleObjects(scene("valley-map")!, x).map((o) => o.id);
      expect(ids(s)).toContain("dry-patch");
      expect(ids(s)).not.toContain("dry-patch-portal");
      const met = glimpse(s, "c3");
      expect(met.chaptersUnlocked).toContain("c3");
      expect(activeMission("c3", met)?.id).toBe("c3-m1");
      expect(ids(met)).toContain("dry-patch-portal");
      expect(ids(met)).not.toContain("dry-patch");
      const done = ["c3-m1", "c3-m2", "c3-m3", "c3-m4"].reduce(finish, met);
      expect(done.rumors["r-c3"]).toBe("explained");
      expect(done.chaptersComplete).toContain("c3");
    });

    it("opens chapter 14 after any four completed chapters, with no rumor needed", () => {
      const c14 = chapter("c14")!;
      const s = both();
      expect(canOpen(c14, s)).toBe(false);
      expect(canOpen(c14, { ...s, chaptersComplete: [...s.chaptersComplete, "c3", "c9"] })).toBe(true);
      // The prologue does not count as one of the four.
      expect(canOpen(c14, { ...s, chaptersComplete: ["prologue", "c1", "leaf", "c3"] })).toBe(false);
    });
  });

  describe("recall on return and the Rumor Map", () => {
    it("asks up to two recall cards when entering a chapter from elsewhere, never in the same chapter", () => {
      const s = finish(finish(freshSave(), "p-m1"), "p-m2");
      const cards = recallOnReturn(s, "p-handful", "leaf");
      expect(cards.map((c) => c.discovery)).toEqual(["d-p-half-space", "d-p-sleepers"]);
      expect(cards[0]!.answer.statement).toMatch(/half of soil is space/);
      expect(recallOnReturn(s, "p-handful", "prologue")).toEqual([]);
      expect(recallOnReturn(s, "valley-map", "leaf")).toEqual([]);
      // Nothing found yet in chapter 2: nothing to recall.
      expect(recallOnReturn(s, "c2-hedge-edge", "prologue")).toEqual([]);
    });

    it("investigates a rumor on entering the chapter it hints at", () => {
      const s = finish(finish(freshSave(), "p-m1"), "p-m2");
      expect(s.rumors["r-p-starving"]).toBe("glimpsed");
      expect(visit(s, "c1-grain-ruler").rumors["r-p-starving"]).toBe("investigated");
    });

    it("offers where to look after two Rumor Map views without progress", () => {
      const r = RUMORS.find((x) => x.id === "r-c4")!;
      let s = glimpse(freshSave(), "c4");
      s = viewRumors(viewRumors(s));
      expect(whereToLook(s, r)).toBeUndefined();
      s = viewRumors(s);
      expect(whereToLook(s, r)).toMatch(/not built yet/);
      // Progress resets the count.
      s = viewRumors({ ...s, rumors: { ...s.rumors, "r-c4": "investigated" } });
      expect(whereToLook(s, r)).toBeUndefined();
    });
  });
});
