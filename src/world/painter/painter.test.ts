import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { SCENES, scene } from "../../content";
import { BAKE_SCALE, BAKE_SIZES } from "../baked";
import { composeStatic, hasRecipe, paint } from ".";
import { pow } from "./noise";

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
    // Four full plates per case; the first also pays the warm-up on a busy machine.
    20_000,
  );

  // R05: crumbs, grains, mist and plots vary per seed.
  it.each(["pore", "handful", "field-dawn", "valley"])("%s changes with the seed", (recipe) => {
    expect(hash(composeStatic(paint(recipe, 1, 800, 600)))).not.toBe(
      hash(composeStatic(paint(recipe, 2, 800, 600))),
    );
  });

  // V8's pow can round differently once the JIT warms up, so a fresh bake and the
  // baked-plate test disagreed; these recipes use the arithmetic `pow` instead.
  it.each(["pore", "handful", "field-dawn", "valley"])(
    "%s bakes the same bytes cold and after warm-up",
    (recipe) => {
      const bake = () =>
        BAKE_SIZES.map(([w, h]) => {
          const p = paint(recipe, 1, w, h, BAKE_SCALE);
          return hash(p.layers.map((l) => l.svg).join("") + composeStatic(paint(recipe, 1, w, h)));
        });
      const cold = bake();
      for (let i = 0; i < 5; i++) bake();
      expect(bake()).toEqual(cold);
    },
    60_000,
  );

  it("pow agrees with ** and is exact for integer powers", () => {
    for (const x of [0, 1e-9, 0.013, 0.5, 0.731, 0.999999, 1, 3.7])
      for (const p of [0.5, 1.3, 1.4, 1.8, 2.2, 3]) expect(pow(x, p)).toBeCloseTo(x ** p, 12);
    for (const x of [-0.37, 0.1, 2.5]) expect(pow(x, 2)).toBe(x * x);
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
