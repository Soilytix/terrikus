import { describe, expect, it } from "vitest";
import { CODEX, MISSIONS } from "../src/content";
import { DEFAULT_PRACTICES, runField } from "../src/sim/twin-fields";

const step = (mission: string, id: string) =>
  MISSIONS.find((m) => m.id === mission)!.steps.find((s) => "id" in s && s.id === id);

describe("chapter 12", () => {
  it("the confounder mission accepts only naming drainage", () => {
    const s = step("c12-m5", "c12-m5-cause");
    const choices = s && "choices" in s ? s.choices : [];
    expect(choices.filter((c) => c.ok).map((c) => c.id)).toEqual(["drainage"]);
  });

  it("shows the contested cover-crop SOC pair, both sides cited", () => {
    const cover = CODEX.find((c) => c.id === "cx-c12-cover")!;
    expect(cover.openQuestion?.sources).toEqual(["poeplau-don-2015", "chaplot-smith-2023"]);
    expect(cover.facts.every((f) => f.confidence === "contested")).toBe(true);
    const sort = MISSIONS.find((m) => m.id === "c12-m3")!.steps.find((s) => s.kind === "claim-sort");
    expect(sort && "evidence" in sort && sort.evidence).toEqual(cover.openQuestion);
  });

  it("the depth mission's numbers are the model's", () => {
    const end = (tillage: "plough" | "reduced") => runField({ ...DEFAULT_PRACTICES, tillage }).at(-1)!;
    const [p, r] = [end("plough"), end("reduced")];
    expect(Math.round((r.shallow - p.shallow) / 1000)).toBe(9);
    expect(Math.round((r.shallow + r.deep - p.shallow - p.deep) / 1000)).toBe(1);
  });
});
