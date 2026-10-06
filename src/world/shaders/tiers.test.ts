import { describe, expect, it } from "vitest";
import { shadersFor, tierFor } from "./tiers";

describe("living-backdrop tiers", () => {
  it("drops the painterly flow first, then every shader", () => {
    expect([...shadersFor("field", tierFor(0))].sort()).toEqual(["S1", "S2", "S3", "S7"]);
    expect([...shadersFor("field", tierFor(1))].sort()).toEqual(["S1", "S2", "S7"]);
    for (const level of [2, 3, 4] as const) expect(shadersFor("field", tierFor(level)).size).toBe(0);
  });

  it("gives micro scales the microscope look and the cell scale no ambient shader", () => {
    expect(shadersFor("aggregate", "high").has("S9")).toBe(true);
    expect([...shadersFor("cell", "high")]).toEqual(["S7"]);
  });
});
