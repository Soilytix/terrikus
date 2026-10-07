/**
 * WebAudio mixer (T32). Off by default: no AudioContext exists until `enable()`,
 * which the UI calls only from the learner's own gesture. Every sound is
 * synthesised here (filtered noise and short tones); no audio files ship.
 * Each sound announces a caption to subscribers so the text shows when it plays.
 */
import type { Scale } from "../content/schema";

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

/** Per-scale bed: a low-passed noise wash. Captions say it is made up, not a field recording. */
export const AMBIENCE: Record<Scale, { label: string; cutoff: number }> = {
  landscape: { label: "wind-like hush over the valley", cutoff: 900 },
  field: { label: "breezy hush over the field", cutoff: 1200 },
  profile: { label: "muffled hush below ground", cutoff: 400 },
  aggregate: { label: "close, muffled hush inside the crumb", cutoff: 300 },
  rhizosphere: { label: "faint, muffled hush beside the root", cutoff: 250 },
  cell: { label: "very faint hush at the scale of cells", cutoff: 180 },
};

export const ambienceCaption = (s: Scale) =>
  `Background sound: ${AMBIENCE[s].label} (${s} scale; synthesised, not a recording).`;

const BED_GAIN = 0.05;
const CUE_GAIN = 0.12;

export function createMixer(make: () => Ctx = () => new AudioContext()) {
  let ctx: Ctx | null = null;
  let master: GainNode | null = null;
  let bed: { stop: () => void } | null = null;
  let on = false;
  let want: { scale: Scale | null; drift: boolean } = { scale: null, drift: false };
  const listeners = new Set<(c: Caption) => void>();
  const say = (c: Caption) => listeners.forEach((f) => f(c));

  function stopBed() {
    bed?.stop();
    bed = null;
  }

  function startBed(scale: Scale, drift: boolean) {
    const c = ctx!;
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = AMBIENCE[scale].cutoff;
    const gain = c.createGain();
    gain.gain.value = BED_GAIN;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master!);
    // A slow swell in the wash; held still under reduced motion.
    let lfo: OscillatorNode | null = null;
    if (drift) {
      lfo = c.createOscillator();
      lfo.frequency.value = 0.07;
      const depth = c.createGain();
      depth.gain.value = BED_GAIN * 0.6;
      lfo.connect(depth);
      depth.connect(gain.gain);
      lfo.start();
    }
    src.start();
    bed = {
      stop() {
        src.stop();
        lfo?.stop();
        gain.disconnect();
      },
    };
  }

  function applyBed() {
    stopBed();
    if (!on) return;
    if (want.scale) startBed(want.scale, want.drift);
    say({ kind: "ambience", text: want.scale ? ambienceCaption(want.scale) : null });
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
      stopBed();
      say({ kind: "ambience", text: null });
      void ctx?.suspend();
    },
    /** Which bed should play: `null` for none (no scene, or the ambient toggle is off). */
    ambience(scale: Scale | null, drift: boolean) {
      if (scale === want.scale && drift === want.drift) return;
      want = { scale, drift };
      applyBed();
    },
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
