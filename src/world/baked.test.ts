import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp, { type Sharp } from "sharp";
import { describe, expect, it } from "vitest";
import { SCENES } from "../content";
import { OUT, sha } from "../../tools/bake-plates";
import { BAKE_SCALE, BAKE_SIZES, UNBAKED, pickBaked, plateKey, type PlateManifest } from "./baked";
import { composeStatic, paint } from "./painter";

const manifest = JSON.parse(readFileSync(join(OUT, "manifest.json"), "utf8")) as PlateManifest;

describe("baked plates", () => {
  // Fails after a recipe or seed change: rebake with `mise run bake`.
  it.each(SCENES.filter((s) => !UNBAKED.has(s.recipe)).map((s) => [s.id, s.recipe, s.seed] as const))(
    "%s matches the runtime painter at every reference size",
    (_, recipe, seed) => {
      for (const [w, h] of BAKE_SIZES) {
        const baked = manifest.plates[plateKey(recipe, seed)]?.find((p) => p.w === w && p.h === h);
        expect(baked, `${recipe} ${w}x${h}`).toBeDefined();
        const plate = paint(recipe, seed, w, h, BAKE_SCALE);
        expect(baked!.ground).toBe(plate.ground);
        expect(baked!.layers.map((l) => [l.id, l.sha])).toEqual(plate.layers.map((l) => [l.id, sha(l.svg)]));
        for (const f of [baked!.flat, ...baked!.layers.map((l) => l.file)])
          expect(existsSync(join(OUT, f)), f).toBe(true);
      }
    },
    20_000,
  );

  it("rasters the flat plate the painter draws for the same seed", async () => {
    const [w, h] = BAKE_SIZES[1];
    const baked = manifest.plates[plateKey("pore", 37)]!.find((p) => p.w === w)!;
    const px = (img: Sharp) => img.resize(78, 168, { fit: "fill" }).removeAlpha().raw().toBuffer();
    const a = await px(sharp(join(OUT, baked.flat)));
    const b = await px(sharp(Buffer.from(composeStatic(paint("pore", 37, w, h)))));
    const other = await px(sharp(Buffer.from(composeStatic(paint("pore", 38, w, h)))));
    const diff = (x: Buffer, y: Buffer) => x.reduce((n, v, i) => n + Math.abs(v - y[i]!), 0) / x.length;
    // AVIF is lossy: close to the same seed, clearly further from another.
    expect(diff(a, b)).toBeLessThan(4);
    expect(diff(a, other)).toBeGreaterThan(diff(a, b) * 2);
  });
});

describe("unbaked recipes", () => {
  it("have no plates, so the runtime paints them", () => {
    for (const recipe of UNBAKED)
      expect(Object.keys(manifest.plates).filter((k) => k.startsWith(`${recipe}:`))).toEqual([]);
  });
});

describe("pickBaked", () => {
  const m: PlateManifest = {
    plates: {
      "pore:1": [
        { w: 1440, h: 900, layers: [], flat: "", ground: "" },
        { w: 390, h: 844, layers: [], flat: "", ground: "" },
      ],
    },
    timelapses: {},
  };

  it("takes the plate closest in shape", () => {
    expect(pickBaked(m, "pore", 1, 1280, 800)?.w).toBe(1440);
    expect(pickBaked(m, "pore", 1, 375, 812)?.w).toBe(390);
  });

  it("paints when no plate is close in shape or none was baked", () => {
    expect(pickBaked(m, "pore", 1, 1024, 1024)).toBeUndefined();
    expect(pickBaked(m, "pore", 2, 1440, 900)).toBeUndefined();
  });
});
