import { describe, expect, it } from "vitest";
import { mission } from "../..";

describe("chapter 5 missions (T24 acceptance)", () => {
  it("the pH predictor accepts association-not-cause and not a causal claim", () => {
    const step = mission("c5-m3")!.steps.find((s) => s.kind === "explain-choice" && s.id === "c5-m3-cause");
    if (step?.kind !== "explain-choice") throw new Error("c5-m3 has no causation question");
    const ok = step.choices.filter((c) => c.ok);
    expect(ok.map((c) => c.id)).toEqual(["association"]);
    expect(ok[0]!.label).toMatch(/association/);
    expect(step.choices.find((c) => c.id === "cause")?.misconception).toBe("M25");
  });

  it("leaky nitrate runs the fertilise-and-rain surface", () => {
    expect(mission("c5-m2")!.steps.some((s) => s.kind === "exchange" && s.mode === "leaky")).toBe(true);
  });
});
