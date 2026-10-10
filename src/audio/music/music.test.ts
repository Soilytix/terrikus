import { describe, expect, it } from "vitest";
import { SCENES } from "../../content";
import { CHAPTERS } from "../../content";
import { loadChapters } from "../../content/load";
import type { Scale } from "../../content/schema";
import { Composer } from "./composer";
import { SCALE_LAYERS, SCENE_MUSIC, TIMES, lerpMood, musicCaption, presetFor } from "./presets";

await loadChapters(CHAPTERS.map((c) => c.id));

function play(seed: string, scenes: [string, Scale][], bars = 64) {
  const first = presetFor(...scenes[0]!);
  const c = new Composer(seed, first.mood, first.shape);
  const out: string[] = [];
  for (const [id, scale] of scenes) {
    const p = presetFor(id, scale);
    c.mood = p.mood;
    c.setShape(p.shape);
    for (let i = 0; i < bars; i++) {
      const b = c.nextBar();
      out.push(`${b.chord}|${b.events.map((e) => `${e.lane}${e.step}${e.note ?? ""}`).join(",")}`);
    }
  }
  return out;
}

describe("music", () => {
  it("every scene has a preset, and every preset id is a scene", () => {
    const ids = SCENES.map((s) => s.id);
    expect(ids.filter((id) => !SCENE_MUSIC[id])).toEqual([]);
    expect(Object.keys(SCENE_MUSIC).filter((id) => !ids.includes(id))).toEqual([]);
  });

  it("same seed and same scenes, same music", () => {
    const path: [string, Scale][] = [
      ["valley", "landscape"],
      ["p-field-dawn", "field"],
      ["p-pore", "aggregate"],
      ["c5-platelet", "cell"],
    ];
    expect(play("abc", path)).toEqual(play("abc", path));
    expect(play("abc", path)).not.toEqual(play("abd", path));
  });

  it("every scene and time of day plays notes in range", () => {
    for (const s of SCENES)
      for (const time of TIMES) {
        const p = presetFor(s.id, s.scale, { time });
        const c = new Composer(s.id, p.mood, p.shape);
        const events = Array.from({ length: 32 }, () => c.nextBar().events).flat();
        expect(events.length, `${s.id} ${time}`).toBeGreaterThan(0);
        for (const e of events) {
          expect(e.step).toBeGreaterThanOrEqual(0);
          expect(e.step).toBeLessThan(16);
          expect(e.vel).toBeGreaterThan(0);
        }
        expect(c.bpm).toBeGreaterThanOrEqual(56);
      }
  });

  it("the deeper scales close the filter and muffle the surface", () => {
    expect(SCALE_LAYERS.field.mood.muffle).toBeGreaterThan(SCALE_LAYERS.profile.mood.muffle);
    expect(SCALE_LAYERS.profile.mood.muffle).toBeGreaterThan(SCALE_LAYERS.cell.mood.muffle);
    expect(presetFor("p-pore", "aggregate", { time: "dawn" }).mood.beds.birds ?? 0).toBeLessThan(
      presetFor("p-field-dawn", "field").mood.beds.birds ?? 0,
    );
  });

  it("rain and night show in the preset and the caption", () => {
    const wet = presetFor("c13-splash", "field");
    expect(wet.mood.beds.rain).toBeGreaterThan(0.5);
    expect(musicCaption(wet, "field")).toContain("field recordings of rain");
    const night = presetFor("p-field-dawn", "field", { time: "night" });
    expect(night.mood.beds.crickets).toBeGreaterThan(0.5);
    expect(night.mood.tempo).toBeLessThan(presetFor("p-field-dawn", "field", { time: "day" }).mood.tempo);
    expect(musicCaption(presetFor("p-pore", "aggregate"), "aggregate")).toContain(
      "synthesised, not a recording.",
    );
  });

  it("a glide lands exactly on the target and crossfades instruments", () => {
    const a = presetFor("p-field-dawn", "field").mood;
    const b = presetFor("c5-platelet", "cell").mood;
    expect(lerpMood(a, b, 1)).toMatchObject({ tempo: b.tempo, cutoff: b.cutoff });
    const half = lerpMood(a, b, 0.5);
    expect(half.keys.kalimba).toBeCloseTo((a.keys.kalimba ?? 0) / 2);
    expect(half.keys.glass).toBeCloseTo((b.keys.glass ?? 0) / 2);
  });
});
