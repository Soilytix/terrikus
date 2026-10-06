import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { SCENES } from "../../content";
import { composeStatic, hasRecipe, paint } from ".";

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

describe("painter", () => {
  it("has a recipe for every scene", () => {
    for (const s of SCENES) expect(hasRecipe(s.recipe), s.id).toBe(true);
  });

  it.each(SCENES.map((s) => [s.id, s.recipe, s.seed] as const))(
    "%s paints deterministically",
    (_, recipe, seed) => {
      for (const [w, h] of [
        [1440, 900],
        [390, 844],
      ] as const) {
        const a = composeStatic(paint(recipe, seed, w, h));
        const b = composeStatic(paint(recipe, seed, w, h));
        expect(hash(a)).toBe(hash(b));
        // Every url(#id) a plate references is defined in the same document.
        const refs = new Set([...a.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]));
        const ids = new Set([...a.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
        for (const r of refs) expect(ids.has(r), `${recipe} ${w}x${h} #${r}`).toBe(true);
      }
    },
  );

  it("changes with the seed", () => {
    expect(hash(composeStatic(paint("pore", 1, 800, 600)))).not.toBe(
      hash(composeStatic(paint("pore", 2, 800, 600))),
    );
  });
});
