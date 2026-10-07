import { existsSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { c11Timelapse } from "../content/chapters/c11";
import { OUT, TIMELAPSES } from "../../tools/bake-plates";
import { TimelapseView } from "./PitWalls";

describe("pedogenesis time-lapse", () => {
  it("shows the time-compression label at every frame, playing or stepped, baked or painted", () => {
    const n = c11Timelapse.frames.length;
    for (let frame = 0; frame < n; frame++)
      for (const playing of [true, false])
        for (const srcs of [[], c11Timelapse.frames.map((f) => `plates/${f.recipe}.avif`)]) {
          const html = renderToStaticMarkup(
            createElement(TimelapseView, { tl: c11Timelapse, frame, srcs, playing }),
          );
          const label = html.match(/<p class="timelapse-label"[^>]*>(.*?)<\/p>/)?.[1];
          expect(label, `frame ${frame} playing ${playing}`).toContain(c11Timelapse.compression);
        }
  });

  it("is baked by the plate baker from the same frames", () => {
    const t = TIMELAPSES[c11Timelapse.id]!;
    expect(t.compression).toBe(c11Timelapse.compression);
    expect(t.frames).toEqual(c11Timelapse.frames);
    for (let i = 0; i < t.frames.length; i++)
      expect(existsSync(join(OUT, `timelapse/${c11Timelapse.id}/${i}.avif`))).toBe(true);
  });
});
