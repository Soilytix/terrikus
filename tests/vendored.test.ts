import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Golden rule 7: src/design-system/ is a byte-for-byte copy of the platform
// token sheet. VENDORED.md records each file's SHA-256 at the source commit.
const DIR = "src/design-system";
const recorded = new Map(
  [...readFileSync(`${DIR}/VENDORED.md`, "utf8").matchAll(/^\| `([^`]+)` +\| `([0-9a-f]{64})` \|$/gm)].map(
    (m) => [m[1], m[2]] as const,
  ),
);
const vendored = readdirSync(DIR).filter((f) => f !== "VENDORED.md");

describe("vendored design system", () => {
  it("records a hash for every vendored file and no other", () => {
    expect(recorded.size).toBeGreaterThan(0);
    expect([...recorded.keys()].sort()).toEqual([...vendored].sort());
  });

  it.each(vendored)("%s matches the hash in VENDORED.md", (f) => {
    const actual = createHash("sha256")
      .update(readFileSync(`${DIR}/${f}`))
      .digest("hex");
    expect(actual).toBe(recorded.get(f));
  });
});
