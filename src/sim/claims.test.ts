import { describe, expect, it } from "vitest";
import { judge, placeable, strongest } from "./claims";

const LADDER = ["detection", "abundance", "activity", "controlled", "field"].map((id) => ({ id }));
const choice = (id: string, ok: boolean) => ({ id, ok });

describe("claim budget", () => {
  it("the strongest claim is the top of the unbroken run of evidence", () => {
    expect(strongest(LADDER, ["detection", "abundance"])).toBe(1);
    expect(strongest(LADDER, ["detection", "activity"])).toBe(0);
    expect(strongest(LADDER, [])).toBe(-1);
  });

  it("names the rungs an overclaim skips, and tells an underclaim from a fit", () => {
    const held = ["detection", "abundance"];
    expect(judge(LADDER, held, "abundance")).toEqual({ kind: "fits" });
    expect(judge(LADDER, held, "detection")).toEqual({ kind: "under" });
    expect(judge(LADDER, held, "controlled")).toEqual({ kind: "over", missing: ["activity", "controlled"] });
  });
});

describe("report blocks", () => {
  const block = {
    benchmark: [choice("same", true), choice("none", false)],
    confidence: [choice("moderate", true)],
    provenance: [choice("method", true), choice("lab", false)],
  };

  it("place only with an accepted benchmark, confidence and provenance", () => {
    expect(placeable(block, { benchmark: "same", confidence: "moderate", provenance: "method" })).toBe(true);
    expect(placeable(block, { benchmark: "same", confidence: "moderate" })).toBe(false);
    expect(placeable(block, { benchmark: "none", confidence: "moderate", provenance: "method" })).toBe(false);
  });
});
