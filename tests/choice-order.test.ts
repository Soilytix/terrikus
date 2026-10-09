import { describe, expect, it } from "vitest";
import type { Choice } from "../src/content/schema";
import { seededOrder } from "../src/sim/rng";

const chapters = import.meta.glob("../src/content/chapters/*/index.ts", { eager: true });

function choiceLists(o: unknown, seen = new Set<unknown>(), out: Choice[][] = []): Choice[][] {
  if (!o || typeof o !== "object" || seen.has(o)) return out;
  seen.add(o);
  for (const [k, v] of Object.entries(o))
    if (k === "choices" && Array.isArray(v) && v.every((c) => c && typeof c === "object" && "ok" in c))
      out.push(v);
    else choiceLists(v, seen, out);
  return out;
}

describe("choice order", () => {
  it("is a stable permutation", () => {
    const items = ["a", "b", "c", "d"].map((id) => ({ id }));
    expect(seededOrder(items)).toEqual(seededOrder(items));
    expect(
      seededOrder(items)
        .map((i) => i.id)
        .sort(),
    ).toEqual(["a", "b", "c", "d"]);
  });

  it("does not put the only accepted answer first most of the time", () => {
    const single = choiceLists(chapters).filter((l) => l.filter((c) => c.ok).length === 1);
    expect(single.length).toBeGreaterThan(20);
    const first = single.filter((l) => seededOrder(l)[0]!.ok).length;
    expect(first / single.length).toBeLessThan(0.6);
  });
});
