/**
 * WebAudio mixer (T32). No AudioContext exists until `enable()`, which the UI
 * calls only from the learner's own gesture. Cues are short tones; the bed is
 * the scene's music (src/audio/music), loaded only once sound is on. Every
 * sound announces a caption to subscribers so the text shows when it plays.
 */
import type { Scale } from "../content/schema";
import type { Music } from "./music/engine";
import { SAMPLE_BEDS, musicCaption, presetFor } from "./music/presets";

export type Ctx = Pick<
  AudioContext,
  | "currentTime"
  | "sampleRate"
  | "destination"
  | "createGain"
  | "createOscillator"
  | "createBiquadFilter"
  | "createBufferSource"
  | "createBuffer"
  | "resume"
  | "suspend"
>;

export type CueId = "scan" | "card" | "stamp" | "chapter";
export interface Caption {
  kind: "cue" | "ambience";
  /** `null` clears the line: the ambience bed stopped. */
  text: string | null;
}

export const CUES: Record<CueId, { caption: string; notes: number[] }> = {
  scan: { caption: "Soft click: you looked closely at something.", notes: [880] },
  card: { caption: "Two rising tones: a card went into your notebook.", notes: [660, 880] },
  stamp: { caption: "Low knock: a new scale stamped in your notebook.", notes: [196] },
  chapter: { caption: "Three rising tones: chapter complete.", notes: [523, 659, 784] },
};

export interface BedScene {
  id: string;
  scale: Scale;
}

export const ambienceCaption = (s: BedScene) => musicCaption(presetFor(s.id, s.scale), s.scale);

type LoadMusic = (ctx: AudioContext, out: AudioNode) => Promise<Music>;
const loadMusic: LoadMusic = async (ctx, out) => {
  const [{ createMusic }, { assetUrl }] = await Promise.all([
    import("./music/engine"),
    import("../assets/urls"),
  ]);
  return createMusic(ctx, out, (b) => assetUrl(`ambience-${b}`));
};

/** Resolves once the engine is loaded; the scene's field recordings keep fetching behind it and fade in when ready. */
async function preloadMusic(scene: BedScene) {
  const [, { assetUrl }] = await Promise.all([import("./music/engine"), import("../assets/urls")]);
  const beds = Object.keys(presetFor(scene.id, scene.scale).mood.beds);
  SAMPLE_BEDS.filter((b) => beds.includes(b))
    .flatMap((b) => assetUrl(`ambience-${b}`) ?? [])
    .forEach((u) => void fetch(u).catch(() => undefined));
}

const CUE_GAIN = 0.12;

export function createMixer(make: () => Ctx = () => new AudioContext(), load: LoadMusic = loadMusic) {
  let ctx: Ctx | null = null;
  let master: GainNode | null = null;
  let music: Promise<Music> | null = null;
  let live: Music | null = null;
  let on = false;
  let want: { scene: BedScene | null; drift: boolean } = { scene: null, drift: false };
  const listeners = new Set<(c: Caption) => void>();
  const say = (c: Caption) => listeners.forEach((f) => f(c));

  function applyBed() {
    if (!on) return live?.stop();
    const { scene } = want;
    if (scene) {
      music ??= load(ctx as AudioContext, master!).then((m) => (live = m));
      void music.then((m) => {
        // Only the latest wish plays: sound or the scene may have changed while loading.
        if (on && want.scene) m.setScene(want.scene.id, want.scene.scale, want.drift);
      });
    } else live?.stop();
    say({ kind: "ambience", text: scene ? ambienceCaption(scene) : null });
  }

  return {
    enabled: () => on,
    subscribe(f: (c: Caption) => void) {
      listeners.add(f);
      return () => void listeners.delete(f);
    },
    /** Call only from a learner gesture (the sound toggle, or a click after reload). */
    enable() {
      if (on) return;
      if (!ctx) {
        ctx = make();
        master = ctx.createGain();
        master.gain.value = 1;
        master.connect(ctx.destination);
      }
      void ctx.resume();
      on = true;
      applyBed();
    },
    disable() {
      if (!on) return;
      on = false;
      live?.stop();
      say({ kind: "ambience", text: null });
      void ctx?.suspend();
    },
    /** Which scene's music should play: `null` for none (no scene, or the ambient toggle is off). */
    ambience(scene: BedScene | null, drift: boolean) {
      if (scene?.id === want.scene?.id && scene?.scale === want.scene?.scale && drift === want.drift) return;
      want = { scene, drift };
      applyBed();
    },
    /** Warm the cache for a scene's music; creates no AudioContext. */
    preload: preloadMusic,
    /** The running music engine, for the dev surface (`?beats`). */
    music: () => live,
    /** Play an event cue; returns its caption, or `null` while sound is off. */
    cue(id: CueId): string | null {
      if (!on || !ctx) return null;
      const t0 = ctx.currentTime;
      CUES[id].notes.forEach((f, i) => {
        const osc = ctx!.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;
        const g = ctx!.createGain();
        const t = t0 + i * 0.12;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(CUE_GAIN, t + 0.01);
        g.gain.linearRampToValueAtTime(0, t + 0.25);
        osc.connect(g);
        g.connect(master!);
        osc.start(t);
        osc.stop(t + 0.3);
      });
      const caption = CUES[id].caption;
      say({ kind: "cue", text: caption });
      return caption;
    },
  };
}

export type Mixer = ReturnType<typeof createMixer>;

/** The app's one mixer. Building it creates no AudioContext. */
export const mixer = createMixer();
