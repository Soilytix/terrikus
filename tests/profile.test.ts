import { describe, expect, it } from "vitest";
import { ASSETS } from "../src/assets/manifest";
import { allNodes, profileViolations } from "../tools/profile";

describe("build profiles", () => {
  it("internal ships everything (review badges show instead)", () => {
    expect(profileViolations("internal", allNodes(), ASSETS)).toEqual([]);
  });

  it("public refuses a draft node and a non-public asset (fixture)", () => {
    const v = profileViolations(
      "public",
      [{ id: "n", reviewStatus: "draft" }],
      [{ id: "a", publicOk: false }],
    );
    expect(v).toHaveLength(2);
  });

  it.runIf(process.env.SW_PROFILE === "public")("public: every shipped node is approved", () => {
    expect(profileViolations("public", allNodes(), ASSETS)).toEqual([]);
  });
});
