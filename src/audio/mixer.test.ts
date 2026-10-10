import { describe, expect, it, vi } from "vitest";
import { CUES, createMixer, type Ctx } from "./mixer";
import type { Music } from "./music/engine";

/** Just enough of an AudioContext to count what the mixer builds. */
function fakeCtx() {
  const node = () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    gain: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    frequency: { value: 0, setValueAtTime: vi.fn() },
    Q: { value: 0 },
    type: "",
    buffer: null,
    loop: false,
  });
  const ctx = {
    currentTime: 0,
    sampleRate: 8000,
    destination: {},
    createGain: vi.fn(node),
    createOscillator: vi.fn(node),
    createBiquadFilter: vi.fn(node),
    createBufferSource: vi.fn(node),
    createBuffer: vi.fn((_c: number, n: number) => ({ getChannelData: () => new Float32Array(n) })),
    resume: vi.fn(() => Promise.resolve()),
    suspend: vi.fn(() => Promise.resolve()),
  };
  return ctx;
}

/** The music engine stands in: the mixer only loads it and passes the scene on. */
function fakeMusic() {
  const m = { setScene: vi.fn(), stop: vi.fn() };
  return { m, load: vi.fn(() => Promise.resolve(m as unknown as Music)) };
}
const field = { id: "p-field-dawn", scale: "field" } as const;

describe("mixer", () => {
  it("is silent and creates no AudioContext until enabled", () => {
    const make = vi.fn(() => fakeCtx() as unknown as Ctx);
    const music = fakeMusic();
    const heard = vi.fn();
    const m = createMixer(make, music.load);
    m.subscribe(heard);
    expect(m.cue("scan")).toBeNull();
    m.ambience(field, true);
    expect(make).not.toHaveBeenCalled();
    expect(music.load).not.toHaveBeenCalled();
    expect(heard).not.toHaveBeenCalled();
    expect(m.enabled()).toBe(false);
  });

  it("plays with a caption once enabled, and goes quiet again when disabled", async () => {
    const ctx = fakeCtx();
    const make = vi.fn(() => ctx as unknown as Ctx);
    const music = fakeMusic();
    const heard = vi.fn();
    const m = createMixer(make, music.load);
    m.subscribe(heard);
    m.ambience(field, true);
    m.enable();
    expect(make).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(music.m.setScene).toHaveBeenCalledWith("p-field-dawn", "field", true));
    expect(heard).toHaveBeenLastCalledWith({
      kind: "ambience",
      text: expect.stringContaining("field scale, dawn"),
    });
    expect(m.cue("card")).toBe(CUES.card.caption);
    expect(heard).toHaveBeenLastCalledWith({ kind: "cue", text: CUES.card.caption });
    m.disable();
    expect(music.m.stop).toHaveBeenCalled();
    expect(ctx.suspend).toHaveBeenCalled();
    expect(m.cue("card")).toBeNull();
    m.enable();
    expect(make).toHaveBeenCalledTimes(1);
  });

  it("drops the ambience bed when ambience is off", () => {
    const m = createMixer(() => fakeCtx() as unknown as Ctx, fakeMusic().load);
    const heard = vi.fn();
    m.subscribe(heard);
    m.enable();
    m.ambience(null, false);
    expect(heard).toHaveBeenLastCalledWith({ kind: "ambience", text: null });
  });
});
