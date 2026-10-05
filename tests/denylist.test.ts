import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findDenied, sha256 } from "../tools/denylist";

const hashes = new Set<string>(JSON.parse(readFileSync("tests/denylist-hashes.json", "utf8")));
const TEXT = /\.(ts|tsx|css|html|md|json|svg|txt)$/;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("customer denylist", () => {
  it("is non-empty", () => expect(hashes.size).toBeGreaterThan(0));

  it("no customer or variety token in src/, docs/, README or AGENTS", () => {
    const files = [...walk("src"), ...walk("docs"), "README.md", "AGENTS.md", "index.html"].filter((p) =>
      TEXT.test(p),
    );
    const hits = files.flatMap((f) => findDenied(readFileSync(f, "utf8"), hashes).map(() => f));
    // Report the file, never the token: the names must not reach a log either.
    expect([...new Set(hits)]).toEqual([]);
  });

  it("catches a hashed token and a hashed two-word phrase (fixture)", () => {
    const fixture = new Set([sha256("zzfixture"), sha256("acme seeds")]);
    expect(findDenied("Grown by ZZFixture in a trial", fixture)).toHaveLength(1);
    expect(findDenied("for Acme Seeds", fixture)).toHaveLength(1);
    expect(findDenied("for acme and seeds", fixture)).toHaveLength(0);
  });
});
