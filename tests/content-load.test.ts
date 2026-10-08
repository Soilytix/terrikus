import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CHAPTERS } from "../src/content";
import { LOADERS } from "../src/content/load";

/** Every file the entry reaches through static imports (dynamic `import()` is a separate chunk). */
function staticGraph(entry: string): Set<string> {
  const seen = new Set<string>();
  const queue = [resolve(entry)];
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const code = readFileSync(file, "utf8");
    for (const [, spec] of code.matchAll(/^(?:import|export)\s(?!type\b)[^;]*?from\s+"(\.[^"]+)"/gms)) {
      const base = join(dirname(file), spec!);
      const hit = [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find(
        (p) => /\.tsx?$/.test(p) && existsSync(p),
      );
      if (hit) queue.push(hit);
    }
  }
  return seen;
}

describe("per-chapter content loading", () => {
  it("keeps every chapter's content out of the initial chunk", () => {
    const initial = [...staticGraph("src/main.tsx")];
    expect(initial.some((f) => f.endsWith("src/content/index.ts"))).toBe(true);
    expect(initial.filter((f) => /src\/content\/chapters\/[^/]+\/index\.ts$/.test(f))).toEqual([]);
  });

  it("loads each built chapter, and its scenes are the ones its metadata lists", async () => {
    const built = CHAPTERS.filter((c) => c.scenes.length > 0);
    expect(Object.keys(LOADERS).sort()).toEqual(built.map((c) => c.id).sort());
    for (const c of built) {
      const b = await LOADERS[c.id]!();
      expect(b.chapter).toBe(c);
      expect(b.scenes.map((s) => s.id).sort()).toEqual([...c.scenes].sort());
      expect(b.missions.map((m) => m.id).sort()).toEqual([...c.missions].sort());
    }
  });
});
