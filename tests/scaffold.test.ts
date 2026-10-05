import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("scaffold", () => {
  it("builds with a relative base so dist/ works under any path prefix", () => {
    expect(readFileSync("vite.config.ts", "utf8")).toMatch(/base: "\.\/"/);
  });
});
