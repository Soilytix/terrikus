import { describe, expect, it } from "vitest";
import { CODEX, MISSIONS, SCENES, chapter } from "../src/content";
import type { Step } from "../src/content/schema";
import { canOpen } from "../src/app/progress";
import { freshSave } from "../src/save/schema";
import { AFTER, BEFORE, protocol } from "../src/sim/benches/lab-bench";
import { REPORT_FIELDS, judge, strongest } from "../src/sim/claims";
import { labRun } from "../src/sim/measure";

const steps = MISSIONS.filter((m) => m.chapter === "c14").flatMap((m) => m.steps);
const bench = (b: string) =>
  steps.find((s): s is Extract<Step, { kind: "sample" }> => s.kind === "sample" && s.bench === b)!;

describe("chapter 14", () => {
  it("opens after any four chapters other than the prologue, with no rumor", () => {
    const c14 = chapter("c14")!;
    expect(c14.playable).toBe(true);
    const done = (ids: string[]) => ({ ...freshSave(), chaptersComplete: ids });
    expect(canOpen(c14, done(["prologue", "c1", "leaf", "c3"]))).toBe(false);
    expect(canOpen(c14, done(["c1", "leaf", "c5", "c12"]))).toBe(true);
  });

  it("every report block needs a benchmark, a confidence and a provenance, each with an accepted choice", () => {
    const blocks = bench("report").blocks!;
    expect(blocks.map((b) => b.tier)).toEqual(["measured", "derived", "interpreted", "would-measure"]);
    for (const b of blocks)
      for (const f of REPORT_FIELDS)
        expect(
          b[f].some((c) => c.ok),
          `${b.id}.${f}`,
        ).toBe(true);
  });

  it("labels the report as a teaching mock-up and depicts no Soilytix product", () => {
    const text = JSON.stringify([
      steps,
      SCENES.filter((s) => s.chapter === "c14"),
      CODEX.filter((c) => c.chapter === "c14"),
    ]);
    expect(text).not.toMatch(/soilytix|loam\b/i);
    expect(MISSIONS.find((m) => m.id === "c14-m5")!.simplificationNotes.join(" ")).toMatch(
      /teaching mock-up/,
    );
  });

  it("sorts twelve statements into all five layers", () => {
    const layers = bench("layers").statements!.map((s) => s.layer);
    expect(layers).toHaveLength(12);
    expect(new Set(layers).size).toBe(5);
  });

  it("each budget case allows a claim below field trials, so an overclaim is always possible", () => {
    const { ladder, cases } = bench("budget");
    for (const c of cases!) {
      const top = strongest(ladder!, c.held);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(judge(ladder!, c.held, "field").kind).toBe("over");
    }
  });

  it("in the jar, the spore formers' share rises while their amount falls", () => {
    const p = protocol({ cores: "five", relic: "remove", spike: "added", depth: "deep", correction: "off" });
    for (const seed of [14, 1, 2, 3]) {
      const [before, after] = [labRun(BEFORE, p, seed), labRun(AFTER, p, seed + 1000)];
      expect(after.permille.spore!).toBeGreaterThan(before.permille.spore!);
      expect(after.absolute!.spore!).toBeLessThan(before.absolute!.spore!);
    }
  });

  it("the ghost group is in the reads only while free DNA is amplified", () => {
    const run = (relic: "keep" | "remove") =>
      labRun(
        BEFORE,
        protocol({ cores: "one", relic, spike: "none", depth: "shallow", correction: "off" }),
        14,
      );
    expect(run("keep").reads.ghost).toBeGreaterThan(0);
    expect(run("remove").reads.ghost ?? 0).toBe(0);
    expect(run("remove").richness).toBeLessThan(run("keep").richness);
  });
});
