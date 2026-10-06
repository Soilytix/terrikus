import { describe, expect, it } from "vitest";
import { clampView, logLerp, viewTransform } from "./camera";

describe("camera", () => {
  it("keeps the plate covering the viewport", () => {
    expect(clampView({ z: 1, cx: 0.9, cy: 0.1 })).toEqual({ z: 1, cx: 0.5, cy: 0.5 });
    const v = clampView({ z: 2, cx: 0.95, cy: 0.5 });
    expect(v.cx).toBeCloseTo(0.75);
    expect(clampView({ z: 9, cx: 0.5, cy: 0.5 }).z).toBe(3);
  });

  it("maps the centre of the view to the centre of the screen", () => {
    const t = viewTransform({ z: 2, cx: 0.25, cy: 0.5 }, 800, 600);
    expect(0.25 * 800 * t.s + t.tx).toBeCloseTo(400);
    expect(0.5 * 600 * t.s + t.ty).toBeCloseTo(300);
  });

  it("interpolates zoom in log space", () => {
    expect(logLerp(1, 100, 0.5)).toBeCloseTo(10);
    expect(logLerp(1, 0.01, 0.5)).toBeCloseTo(0.1);
  });
});
