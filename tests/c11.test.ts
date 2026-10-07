import { describe, expect, it } from "vitest";
import { MISSIONS } from "../src/content";
import { PIT_ANCHORS, SUMMIT } from "../src/content/chapters/c11";
import { CATENA, DETECTIVE, DETECTIVE_X, PIT_WINDOW, defensibleReadings, groundY } from "../src/sim/catena";
import { pitY, profileAt } from "../src/sim/pedogenesis";

describe("chapter 11: detective pit", () => {
  const step = MISSIONS.find((m) => m.id === "c11-m3")!.steps.find(
    (s) => s.kind === "explain-choice" && s.id === "c11-m3-history",
  );

  it("accepts several defensible answers, exactly those the colours support", () => {
    expect(step?.kind).toBe("explain-choice");
    const choices = step && "choices" in step ? step.choices : [];
    const ok = choices.filter((c) => c.ok).map((c) => c.id);
    expect(ok.length).toBeGreaterThan(1);
    expect(new Set(ok)).toEqual(new Set(defensibleReadings(DETECTIVE)));
  });
});

describe("chapter 11: content literals match the model", () => {
  it("the woodland pit's horizons are the summit profile", () => {
    const model = profileAt(CATENA[0]!.factors);
    expect(SUMMIT.map(({ id, top, bottom }) => ({ id, top, bottom }))).toEqual(
      model.map(({ id, top, bottom }) => ({ id, top, bottom })),
    );
    for (const h of SUMMIT) expect(h.y).toBeCloseTo(pitY((h.top + Math.min(h.bottom, h.top + 30)) / 2), 2);
  });

  it("the catena pit anchors sit on the plate's pits", () => {
    const xs = [...CATENA.map((c) => c.x), DETECTIVE_X];
    PIT_ANCHORS.forEach((a, i) => {
      expect(a.x).toBe(xs[i]);
      expect(a.y).toBeCloseTo(groundY(a.x) + PIT_WINDOW / 2, 2);
    });
  });
});
