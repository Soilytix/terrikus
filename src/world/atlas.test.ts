import { TextureSource } from "pixi.js";
import { describe, expect, it } from "vitest";
import { ATLAS } from "./atlas-frames";
import { ATLAS_RESOLUTION, MAX_TEXTURE_PX, sliceAtlas } from "./atlas";

describe("organism atlas draw-call budget", () => {
  const frames = Object.values(ATLAS.frames);

  it("is one page: every frame inside the sheet, none overlapping", () => {
    for (const f of frames) {
      expect(f.x + f.w).toBeLessThanOrEqual(ATLAS.w);
      expect(f.y + f.h).toBeLessThanOrEqual(ATLAS.h);
    }
    for (const a of frames)
      for (const b of frames)
        if (a !== b)
          expect(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y).toBe(true);
  });

  it("fits one guaranteed GPU texture at a 2x-or-better raster", () => {
    expect(ATLAS_RESOLUTION).toBeGreaterThanOrEqual(2);
    expect(Math.max(ATLAS.w, ATLAS.h) * ATLAS_RESOLUTION).toBeLessThanOrEqual(MAX_TEXTURE_PX);
  });

  it("a layer of every organism binds one texture source: at most one draw call", () => {
    const textures = Object.values(sliceAtlas(new TextureSource({ width: ATLAS.w, height: ATLAS.h })));
    expect(textures.length).toBe(frames.length);
    expect(new Set(textures.map((t) => t.source)).size).toBeLessThanOrEqual(1);
  });
});
