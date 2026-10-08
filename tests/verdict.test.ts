import { describe, expect, it } from "vitest";
import { chainTemplate } from "../src/content/chains";
import { freshSave, type LabEntry, type Save } from "../src/save/schema";
import { judge, observed } from "../src/app/verdict";

const run = (a: Partial<LabEntry["a"]>, b: Partial<LabEntry["a"]>): LabEntry => ({
  id: "x",
  at: "2026-01-01",
  bench: "leaf-jar",
  ruleset: "leaf-jar@1",
  a: { water: "moist", temperature: "mild", residue: "leaf", ...a },
  b: { water: "moist", temperature: "mild", residue: "leaf", ...b },
  result: "",
  tier: "observed",
});
const withRun = (e: LabEntry): Save => ({ ...freshSave(), labBook: [e] });
const moisture = chainTemplate("c2-chain-moisture")!;
const good = {
  cards: ["c-moisture-up", "a-microbial-activity", "p-decomposition", "o-co2"],
  connectors: ["enables", "increases", "increases"] as const,
};

describe("verdicts", () => {
  it("needs the named comparison in the lab book", () => {
    expect(observed("dry vs moist", freshSave())).toBe(false);
    expect(observed("dry vs moist", withRun(run({}, { water: "dry" })))).toBe(true);
    expect(observed("dry vs moist", withRun(run({}, { water: "waterlogged" })))).toBe(false);
    expect(observed("leaf vs straw", withRun(run({}, { residue: "straw" })))).toBe(true);
  });

  it("supports an accepted chain only once the run backs it", () => {
    const a = { cards: good.cards, connectors: [...good.connectors] };
    expect(judge(moisture, a, freshSave()).verdict).toBe("plausible");
    expect(judge(moisture, a, withRun(run({}, { water: "dry" }))).verdict).toBe("supported");
  });

  it("contradicts an inverted connector and says why", () => {
    const a = { cards: good.cards, connectors: ["limits", "increases", "increases"] as never };
    const j = judge(moisture, a, withRun(run({}, { water: "dry" })));
    expect(j.verdict).toBe("contradicted");
    expect(j.messages[0]).toMatch(/other way/);
  });

  it("treats the slider as the evidence for the worked prologue chain", () => {
    const t = chainTemplate("p-water-air")!;
    const a = { cards: ["c-more-water", "o-air"], connectors: ["decreases"] as never };
    expect(judge(t, a, freshSave()).verdict).toBe("plausible");
    expect(judge(t, a, { ...freshSave(), flags: ["p-m1-slider"] }).verdict).toBe("supported");
  });

  it("reads connectors as causal signs, so a correct link is never contradicted", () => {
    const t = chainTemplate("c2-chain-waterlogged")!;
    const cards = ["c-waterlogging", "c-o2", "a-microbial-activity", "p-decomposition"];
    const save = withRun(run({}, { water: "waterlogged" }));
    expect(judge(t, { cards, connectors: ["limits", "enables", "increases"] }, save).verdict).toBe(
      "supported",
    );
    expect(judge(t, { cards, connectors: ["limits", "limits", "decreases"] }, save).verdict).not.toBe(
      "supported",
    );
    expect(judge(t, { cards, connectors: ["limits", "limits", "increases"] }, save).verdict).toBe(
      "contradicted",
    );
  });

  it("keeps a mechanism the run cannot show at plausible", () => {
    const t = chainTemplate("c2-chain-quality")!;
    const cards = ["c-cn-high", "a-microbial-growth", "p-decomposition-rate"];
    const j = judge(
      t,
      { cards, connectors: ["limits", "increases"] },
      withRun(run({}, { residue: "straw" })),
    );
    expect(j.verdict).toBe("plausible");
    expect(j.messages.join(" ")).toMatch(/interpretation/);
  });

  it("present is not sick: detection → disease is contradicted by the triangle toggles (M19)", () => {
    const t = chainTemplate("c10-chain-triangle")!;
    const ran = { ...freshSave(), flags: ["c10-triangle-run"] };
    for (const c of ["enables", "increases"] as const) {
      const j = judge(t, { cards: ["c-pathogen-detected", "o-disease"], connectors: [c] }, ran);
      expect(j.verdict).toBe("contradicted");
      expect(j.messages.join(" ")).toMatch(/Present is not sick/);
    }
    expect(judge(t, { cards: ["c-triangle", "o-disease"], connectors: ["enables"] }, ran).verdict).toBe(
      "supported",
    );
    const before = judge(
      t,
      { cards: ["c-pathogen-detected", "o-disease"], connectors: ["enables"] },
      freshSave(),
    );
    expect(before.verdict).toBe("plausible");
  });
});
