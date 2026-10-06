import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { SCENES, scene } from "../../content";
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

  // R04: on a phone the mission sheet takes the lower 45 %, so the subject sits above it.
  it("keeps portrait subjects above the phone sheet, where their anchors say", () => {
    for (const id of ["p-handful", "p-pore"]) {
      for (const o of scene(id)!.objects) {
        if (["grain", "film"].includes(o.id)) continue;
        expect(o.portrait?.y, `${id} ${o.id}`).toBeLessThan(0.55);
      }
    }
    const plate = paint("pore", 37, 390, 844);
    for (const id of ["hypha", "amoeba", "bacterium"]) {
      const s = plate.sprites.find((x) => x.id === id)!;
      const a = scene("p-pore")!.objects.find((o) => o.id === id)!.portrait!;
      expect(Math.abs(s.x / plate.w - a.x), id).toBeLessThan(0.02);
      expect(Math.abs(s.y / plate.h - a.y), id).toBeLessThan(0.05);
    }
  });
});
