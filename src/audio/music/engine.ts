/**
 * The music engine: the lo-fi chain, the bar scheduler and the beds, in plain
 * WebAudio on the mixer's context. The scene sets a preset; the engine glides
 * the mood toward it over a few bars and switches the shape halfway, so moving
 * between scenes and zoom levels is a crossfade, not a cut.
 */
import type { Scale } from "../../content/schema";
import { Composer, type Bar, type NoteEvent } from "./composer";
import {
  BASSES,
  KEYS,
  KITS,
  LEADS,
  SAMPLE_BEDS,
  lerpMood,
  presetFor,
  type BedId,
  type KeysVoice,
  type Mood,
  type Preset,
  type SampleBed,
  type TimeOfDay,
} from "./presets";
import { rng } from "./rng";
import { createVoices } from "./voices";

export const MUTES = ["kick", "snare", "hat", "keys", "bass", "lead", "texture", "tape"] as const;
export type Mute = (typeof MUTES)[number];

/** Dev-surface overrides on top of the scene's preset. */
export interface Overrides {
  time: TimeOfDay | null;
  rain: number | null;
  tempo: number;
  swing: number;
  density: number;
  cutoff: number | null;
  keys: KeysVoice | null;
  mutes: Record<Mute, boolean>;
}

/** Bars a scene change takes to glide in. */
const GLIDE = 3;
const LEVEL = 0.32;

type Listener = { bar: (b: Bar) => void; step: (s: number) => void; note: (e: NoteEvent) => void };

export function createMusic(ctx: AudioContext, out: AudioNode, bedUrl: (b: SampleBed) => string | undefined) {
  const node = <T extends AudioNode>(n: T, ...to: (AudioNode | AudioParam)[]) => {
    for (const x of to) {
      if (x instanceof AudioParam) n.connect(x);
      else n.connect(x);
    }
    return n;
  };
  const gainNode = (v: number, ...to: (AudioNode | AudioParam)[]) => {
    const g = ctx.createGain();
    g.gain.value = v;
    return node(g, ...to);
  };
  const shaper = (curve: (x: number) => number, to: AudioNode) => {
    const w = ctx.createWaveShaper();
    const c = new Float32Array(4096);
    for (let i = 0; i < c.length; i++) c[i] = curve((i / (c.length - 1)) * 2 - 1);
    w.curve = c;
    return node(w, to);
  };
  const lowpass = (f: number, to: AudioNode, q = 0.5) => {
    const b = ctx.createBiquadFilter();
    b.type = "lowpass";
    b.frequency.value = f;
    b.Q.value = q;
    return node(b, to);
  };

  // --- the chain: lowpass → wow → saturation → crush → room → glue → limiter ------
  const master = gainNode(0, out);
  const limiter = node(ctx.createDynamicsCompressor(), master);
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.1;
  const glue = node(ctx.createDynamicsCompressor(), limiter);
  glue.threshold.value = -20;
  glue.ratio.value = 3;
  const room = ctx.createConvolver();
  room.buffer = impulse(ctx, 2.8);
  const roomWet = gainNode(0.2, glue);
  node(room, roomWet);
  const pre = gainNode(1, glue, room);
  const crushWet = gainNode(0.08, pre);
  const crushDry = gainNode(1, pre);
  const post = gainNode(1, crushDry);
  const crusher = shaper((x) => Math.round(x * 32) / 32, crushWet);
  post.connect(crusher);
  const satWet = gainNode(0.3, post);
  const dry = gainNode(0.85, post);
  const sat = shaper((x) => Math.tanh(2.5 * x) / Math.tanh(2.5), satWet);
  const wow = node(ctx.createDelay(0.1), dry, sat);
  wow.delayTime.value = 0.012;
  const wowDepth = gainNode(0, wow.delayTime);
  const flutterDepth = gainNode(0, wow.delayTime);
  for (const [f, d] of [
    [0.4, wowDepth],
    [6, flutterDepth],
  ] as const) {
    const o = ctx.createOscillator();
    o.frequency.value = f;
    o.connect(d);
    o.start();
  }
  const lp2 = lowpass(4200, wow);
  const lp1 = lowpass(4200, lp2);
  const music = gainNode(1, lp1); // ducked by the kick
  const drums = gainNode(1, lp1);
  // The lead's echo: dotted eighths, darkening as they repeat.
  const echo = ctx.createDelay(2);
  const echoFb = gainNode(0.35, echo);
  const echoWet = gainNode(0.3, music);
  node(echo, lowpass(2500, echoFb), echoWet);
  const send = gainNode(1, music, echo);
  // Beds skip the wobble and crush, through their own low-pass: muffled below ground.
  const muffle = lowpass(14000, glue, 0.3);
  const texture = gainNode(1, muffle);
  const voices = createVoices(ctx, { music, drums, send });

  // --- beds -------------------------------------------------------------------
  const beds = new Map<
    BedId,
    { gain: GainNode; tick?: () => void; setKey?: (pc: number, t: number) => void }
  >();
  function bed(id: BedId) {
    let b = beds.get(id);
    if (b) return b;
    const gain = gainNode(0, texture);
    b = { gain };
    beds.set(id, b);
    if (id === "drone") {
      const trem = gainNode(0.7, gain);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      node(lfo, gainNode(0.3, trem.gain)).start();
      const oscs = [55, 82.4].map((f, i) => {
        const o = ctx.createOscillator();
        o.frequency.value = f;
        node(o, gainNode(i ? 0.2 : 0.5, trem)).start();
        return o;
      });
      b.setKey = (pc, t) => {
        const f = 55 * 2 ** (((pc - 9 + 12) % 12) / 12);
        oscs[0]!.frequency.setTargetAtTime(f, t, 1.3);
        oscs[1]!.frequency.setTargetAtTime(f * 1.5, t, 1.3);
      };
    } else if ((SAMPLE_BEDS as readonly string[]).includes(id)) {
      const url = bedUrl(id as SampleBed);
      if (url)
        void fetch(url)
          .then((r) => r.arrayBuffer())
          .then((a) => ctx.decodeAudioData(a))
          .then((buf) => (b.tick = looper(buf, gain)))
          .catch(() => undefined);
    } else {
      const src = ctx.createBufferSource();
      src.buffer = TEXTURES[id as keyof typeof TEXTURES](ctx);
      src.loop = true;
      node(src, gain).start();
    }
    return b;
  }
  /** Overlapping plays with a 3 s crossfade, so a recording loops without a seam. */
  function looper(buf: AudioBuffer, to: AudioNode) {
    const XF = 3;
    let next = ctx.currentTime + 0.05;
    return () => {
      while (next < ctx.currentTime + 2) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g = gainNode(0, to);
        src.connect(g);
        const end = next + buf.duration;
        g.gain.setValueAtTime(0, next);
        g.gain.linearRampToValueAtTime(1, next + XF);
        g.gain.setValueAtTime(1, end - XF);
        g.gain.linearRampToValueAtTime(0, end);
        src.start(next);
        src.stop(end);
        next = end - XF;
      }
    };
  }

  // --- state ------------------------------------------------------------------
  const listeners: { [K in keyof Listener]: Set<Listener[K]> } = {
    bar: new Set(),
    step: new Set(),
    note: new Set(),
  };
  const emit = <K extends keyof Listener>(k: K, v: Parameters<Listener[K]>[0]) =>
    listeners[k].forEach((f) => (f as (x: typeof v) => void)(v));
  const over: Overrides = {
    time: null,
    rain: null,
    tempo: 0,
    swing: 0,
    density: 1,
    cutoff: null,
    keys: null,
    mutes: Object.fromEntries(MUTES.map((m) => [m, false])) as Record<Mute, boolean>,
  };
  let scene: { id: string; scale: Scale } = { id: "valley", scale: "landscape" };
  let preset: Preset = presetFor(scene.id, scene.scale);
  let from: Mood = preset.mood;
  let mood: Mood = preset.mood;
  let glide = GLIDE;
  let drift = true;
  let playing = false;
  let nextBar = 0;
  let composer = new Composer(Math.random().toString(36).slice(2, 8), mood, preset.shape);

  function retarget() {
    preset = presetFor(scene.id, scene.scale, {
      time: over.time ?? undefined,
      rain: over.rain ?? undefined,
    });
    from = mood;
    glide = 0;
  }

  /** The mood this bar plays: the glide's position, then the dev overrides. */
  function effective(): Mood {
    if (glide < GLIDE) {
      glide++;
      mood = lerpMood(from, preset.mood, glide / GLIDE);
      if (glide === Math.ceil(GLIDE / 2)) composer.setShape(preset.shape);
    }
    const m = { ...mood };
    m.tempo += over.tempo;
    m.swing += over.swing;
    m.density *= over.density;
    if (over.cutoff) m.cutoff = over.cutoff;
    if (over.keys) m.keys = { [over.keys]: 1 };
    return m;
  }

  const ramp = (p: AudioParam, v: number, t: number, len: number) => p.setTargetAtTime(v, t, len / 3);

  function scheduleBar(time: number) {
    const m = effective();
    composer.mood = m;
    const bar = composer.nextBar();
    const s16 = 60 / bar.bpm / 4;
    const len = s16 * 16;
    const mute = over.mutes;

    const cutoff = Math.min(16000, m.cutoff * bar.filterMul);
    ramp(lp1.frequency, cutoff, time, len);
    ramp(lp2.frequency, cutoff, time, len);
    ramp(roomWet.gain, m.reverb, time, len);
    ramp(crushWet.gain, m.crush, time, len);
    ramp(crushDry.gain, 1 - m.crush * 0.5, time, len);
    ramp(echoWet.gain, m.delay, time, len);
    echo.delayTime.setValueAtTime(s16 * 3, time);
    const tape = drift && !mute.tape ? m.wow : 0;
    ramp(wowDepth.gain, tape * 0.003, time, len);
    ramp(flutterDepth.gain, tape * 0.0003, time, len);
    ramp(muffle.frequency, m.muffle, time, len);
    for (const id of new Set([...beds.keys(), ...(Object.keys(m.beds) as BedId[])])) {
      const level = mute.texture ? 0 : (m.beds[id] ?? 0);
      if (level < 0.01 && !beds.has(id)) continue;
      ramp(bed(id).gain.gain, level * 0.6, time, len);
    }
    beds.get("drone")?.setKey?.(composer.chord.key, time);

    const swing = (m.swing - 0.5) * 2 * s16;
    const at = (step: number, jitter = 0) =>
      Math.max(time, time + step * s16 + (step % 2 ? swing : 0) + jitter);
    const later = (fn: () => void, t: number) => setTimeout(fn, (t - ctx.currentTime) * 1000);
    const weighted = <K extends string>(
      w: Partial<Record<K, number>>,
      ids: readonly K[],
      play: (k: K, v: number) => void,
    ) => {
      for (const k of ids) if ((w[k] ?? 0) > 0.03) play(k, w[k]!);
    };
    const reg = Math.round(m.register);

    for (const ev of bar.events) {
      if (mute[ev.lane === "ohat" ? "hat" : (ev.lane as Mute)]) continue;
      const t = at(ev.step, ev.jitter);
      const dur = (ev.len ?? 1) * s16;
      switch (ev.lane) {
        case "kick":
        case "snare":
        case "hat":
        case "ohat": {
          const lane = ev.lane;
          weighted(m.kit, KITS, (k, w) => voices.drum(k, lane, t, ev.vel * w));
          if (lane === "kick") {
            const g = music.gain;
            g.cancelScheduledValues(t);
            g.setTargetAtTime(0.5, t, 0.008);
            g.setTargetAtTime(1, t + 0.04, 0.09);
          }
          break;
        }
        case "keys":
          weighted(m.keys, KEYS, (k, w) =>
            voices.keys(
              k,
              ev.notes!.map((n) => n + reg),
              t,
              dur,
              ev.vel * w,
              (ev.strum ?? 0) * 2,
            ),
          );
          break;
        case "lead":
          weighted(m.leads, LEADS, (k, w) => voices.lead(k, ev.note! + reg, t, dur, ev.vel * w));
          break;
        case "bass":
          weighted(m.bass, BASSES, (k, w) => voices.bass(k, ev.note!, t, dur, ev.vel * w));
          break;
        case "chirp":
          voices.chirp(ev.note!, t, ev.vel);
          break;
        case "drop":
          voices.drop(ev.note!, t, ev.vel);
          break;
        case "click":
          voices.click(ev.note!, t, ev.vel);
          break;
      }
      if (listeners.note.size) later(() => emit("note", ev), t);
    }
    if (listeners.bar.size) later(() => emit("bar", bar), time);
    if (listeners.step.size) for (let i = 0; i < 16; i++) later(() => emit("step", i), at(i));
    return len;
  }

  // A hidden tab throttles timers to about a second, so it schedules further ahead.
  const timer = setInterval(() => {
    for (const b of beds.values()) b.tick?.();
    if (!playing) return;
    const horizon = document.hidden ? 1.5 : 0.25;
    while (nextBar < ctx.currentTime + horizon)
      nextBar += scheduleBar(Math.max(nextBar, ctx.currentTime + 0.05));
  }, 50);

  return {
    over,
    get composer() {
      return composer;
    },
    get preset() {
      return preset;
    },
    get scene() {
      return scene;
    },
    get playing() {
      return playing;
    },
    on<K extends keyof Listener>(k: K, f: Listener[K]) {
      listeners[k].add(f);
      return () => void listeners[k].delete(f);
    },
    /** Play a scene's preset; the first call starts the music, later ones glide. */
    setScene(id: string, scale: Scale, withDrift: boolean) {
      drift = withDrift;
      const fresh = !playing;
      if (id !== scene.id || scale !== scene.scale || fresh) {
        scene = { id, scale };
        retarget();
      }
      if (fresh) {
        if (composer.bar === 0) {
          mood = from = preset.mood;
          glide = GLIDE;
          composer = new Composer(composer.seed, mood, preset.shape);
        }
        playing = true;
        nextBar = ctx.currentTime + 0.1;
        master.gain.setTargetAtTime(LEVEL, ctx.currentTime, 0.5);
      }
    },
    /** Re-read the preset after a dev override changed time or rain. */
    retarget,
    stop() {
      playing = false;
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    },
    reseed(seed = Math.random().toString(36).slice(2, 8)) {
      composer = new Composer(seed, mood, preset.shape);
    },
    dispose() {
      clearInterval(timer);
      master.disconnect();
    },
  };
}

export type Music = ReturnType<typeof createMusic>;

/** A room: decaying stereo noise. */
function impulse(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const n = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3;
  }
  return buf;
}

// --- generated texture beds (ported from soil-beats) ------------------------------

function loopBuffer(
  ctx: BaseAudioContext,
  seconds: number,
  name: string,
  fill: (d: Float32Array, sr: number, r: ReturnType<typeof rng>) => void,
) {
  const sr = ctx.sampleRate;
  const buf = ctx.createBuffer(1, Math.floor(sr * seconds), sr);
  const d = buf.getChannelData(0);
  fill(d, sr, rng("texture", name));
  const fade = Math.floor(sr * 0.02); // soften the loop seam
  for (let i = 0; i < fade; i++) {
    d[i]! *= i / fade;
    d[d.length - 1 - i]! *= i / fade;
  }
  return buf;
}

/** A decaying sine ping at sample `at`. */
function ping(d: Float32Array, sr: number, at: number, freq: number, amp: number, decay: number, sweep = 1) {
  const n = Math.min(d.length - at, Math.floor(sr * decay * 6));
  let phase = 0;
  for (let k = 0; k < n; k++) {
    phase += (2 * Math.PI * freq * (1 + (sweep - 1) * Math.min(1, k / (sr * decay)))) / sr;
    d[at + k]! += amp * Math.sin(phase) * Math.exp(-k / (sr * decay));
  }
}

const TEXTURES = {
  vinyl: (ctx: BaseAudioContext) =>
    loopBuffer(ctx, 6, "vinyl", (d, sr, r) => {
      let b = 0;
      for (let i = 0; i < d.length; i++) d[i] = (b = 0.97 * b + 0.03 * (r.next() * 2 - 1)) * 0.25;
      for (let n = 0; n < (d.length / sr) * 12; n++) {
        const at = r.int(d.length - 200);
        const amp = r.next() ** 3 * 0.9 * (r.chance(0.5) ? 1 : -1);
        for (let k = 0; k < 120; k++) d[at + k]! += amp * Math.exp(-k / (2 + r.next() * 6));
      }
    }),
  // Leaf litter: soft hiss swelling in gusts, crinkly grains inside each gust.
  leaves: (ctx: BaseAudioContext) =>
    loopBuffer(ctx, 9, "leaves", (d, _sr, r) => {
      let b = 0;
      let gust = 0;
      let target = 0;
      for (let i = 0; i < d.length; i++) {
        if (i % 2000 === 0) target = r.next() ** 2;
        gust += (target - gust) * 0.0004;
        b = 0.9 * b + 0.1 * (r.next() * 2 - 1);
        d[i] = b * (0.05 + 0.4 * gust);
        if (r.next() < gust * 0.004)
          for (let k = 0; k < 60 && i + k < d.length; k++)
            d[i + k]! += (r.next() * 2 - 1) * 0.3 * gust * Math.exp(-k / 12);
      }
    }),
  // Rain on soil: a dense patter of tiny drops over a low hiss.
  drizzle: (ctx: BaseAudioContext) =>
    loopBuffer(ctx, 7, "drizzle", (d, sr, r) => {
      let b = 0;
      for (let i = 0; i < d.length; i++) d[i] = (b = 0.8 * b + 0.2 * (r.next() * 2 - 1)) * 0.06;
      for (let n = 0; n < (d.length / sr) * 260; n++) {
        const at = r.int(d.length - 400);
        const amp = 0.05 + r.next() ** 2 * 0.35;
        for (let k = 0; k < 300; k++)
          d[at + k]! += amp * (r.next() * 2 - 1) * Math.exp(-k / (8 + r.next() * 30));
      }
    }),
  // Water in the pores: a low wash and bubbles rising in pitch.
  water: (ctx: BaseAudioContext) =>
    loopBuffer(ctx, 8, "water", (d, sr, r) => {
      let b = 0;
      for (let i = 0; i < d.length; i++) d[i] = (b = 0.95 * b + 0.05 * (r.next() * 2 - 1)) * 0.3;
      for (let n = 0; n < (d.length / sr) * 18; n++)
        ping(d, sr, r.int(d.length), 300 + r.next() * 900, 0.08 + r.next() * 0.1, 0.012, 1.6);
    }),
  // Night: two crickets at different pitch and rate, and a little air.
  night: (ctx: BaseAudioContext) =>
    loopBuffer(ctx, 10, "night", (d, sr, r) => {
      for (let i = 0; i < d.length; i++) d[i] = (r.next() * 2 - 1) * 0.01;
      for (const [freq, every, amp] of [
        [4400, 0.62, 0.12],
        [5200, 0.81, 0.07],
      ] as const)
        for (let t = r.next() * every; t < d.length / sr - 0.2; t += every * (0.9 + r.next() * 0.2))
          for (let p = 0; p < 4; p++) ping(d, sr, Math.floor((t + p * 0.022) * sr), freq, amp, 0.004);
    }),
  // Hyphae: sparse bursts of tiny pitched clicks that speed up as they spread.
  myco: (ctx: BaseAudioContext) =>
    loopBuffer(ctx, 13, "myco", (d, sr, r) => {
      for (let t = r.next(); t < d.length / sr - 1; t += 0.6 + r.next() * 1.8) {
        const n = 4 + r.int(14);
        const base = 2000 + r.next() * 3000;
        let gap = 0.09;
        for (let k = 0, at = t; k < n; k++, at += gap, gap *= 0.85)
          ping(d, sr, Math.floor(at * sr), base * (1 + r.next() * 0.3), 0.06 + r.next() * 0.05, 0.0015);
      }
    }),
};
