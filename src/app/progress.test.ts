import { describe, expect, it } from "vitest";
import { scene } from "../content";
import { freshSave, type Save } from "../save/schema";
import { activeMission, advance, begin, currentStep, scan, visibleObjects, visit } from "./progress";

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

  it("unlocks chapter 2 when the prologue is complete, with its rumor", () => {
    let s = finish(freshSave(), "p-m1");
    s = finish(s, "p-m2");
    expect(s.chaptersComplete).toContain("prologue");
    expect(s.chaptersUnlocked).toContain("leaf");
    expect(s.rumors["r-c2-leaf"]).toBe("glimpsed");
    expect(s.rumors["r-p-starving"]).toBe("glimpsed");
    expect(visibleObjects(scene("valley")!, s).map((o) => o.id)).toContain("hedge");
    // Later chapters are not playable, so they stay locked.
    expect(s.chaptersUnlocked).not.toContain("c1");
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
});
