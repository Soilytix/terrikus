import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { ASSETS } from "../src/assets/manifest";
import { C13_SATELLITE } from "../src/content/chapters/c13";

const asset = ASSETS.find((a) => a.id === C13_SATELLITE.asset)!;

describe("chapter 13: the satellite inset", () => {
  it("is labelled a reflectance measurement, tagged measured and credited to Copernicus", () => {
    expect(C13_SATELLITE.label).toMatch(/^Measurement: reflectance/);
    expect(asset.truthStatus).toBe("measured");
    expect(asset.source).toBe("img-sentinel-2");
    expect(asset.attribution).toMatch(/^Contains modified Copernicus Sentinel data \d{4}$/);
    expect(C13_SATELLITE.credit).toBe(asset.attribution);
  });

  it("each probe's values are the 9 × 9 mean of the bundled image at its place", async () => {
    const img = sharp(join("src/assets", asset.path)).removeAlpha();
    const { width, height } = await img.metadata();
    const px = await img.raw().toBuffer();
    for (const p of C13_SATELLITE.probes) {
      const [cx, cy] = [Math.round(p.x * width!), Math.round(p.y * height!)];
      const sum = [0, 0, 0];
      for (let x = cx - 4; x <= cx + 4; x++)
        for (let y = cy - 4; y <= cy + 4; y++)
          for (let k = 0; k < 3; k++) sum[k]! += px[(y * width! + x) * 3 + k]!;
      sum.forEach((s, k) => expect(Math.abs(s / 81 - p.rgb[k]!), `${p.id}[${k}]`).toBeLessThan(3));
    }
  });
});
