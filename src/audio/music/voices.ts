/**
 * The instruments, synthesised in plain WebAudio: every note builds its own
 * short-lived nodes and lets them go. No samples play here — field recordings
 * are beds (engine.ts), never notes.
 */
import type { BassVoice, KeysVoice, KitId, LeadVoice } from "./presets";

export const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

type Noise = "white" | "pink" | "brown";

export interface Voices {
  keys(v: KeysVoice, notes: number[], t: number, dur: number, vel: number, strum: number): void;
  lead(v: LeadVoice, note: number, t: number, dur: number, vel: number): void;
  bass(v: BassVoice, note: number, t: number, dur: number, vel: number): void;
  drum(kit: KitId, lane: "kick" | "snare" | "hat" | "ohat", t: number, vel: number): void;
  chirp(note: number, t: number, vel: number): void;
  drop(note: number, t: number, vel: number): void;
  click(note: number, t: number, vel: number): void;
}

/** `music` and `drums` feed the lo-fi chain; `send` is the lead's echo. */
export function createVoices(
  ctx: BaseAudioContext,
  out: { music: AudioNode; drums: AudioNode; send: AudioNode },
): Voices {
  const noise: Record<Noise, AudioBuffer> = {
    white: noiseBuffer(ctx, "white"),
    pink: noiseBuffer(ctx, "pink"),
    brown: noiseBuffer(ctx, "brown"),
  };
  let bassFreq = 0;

  const gain = (to: AudioNode | AudioParam, v = 1) => {
    const g = ctx.createGain();
    g.gain.value = v;
    if (to instanceof AudioParam) g.connect(to);
    else g.connect(to);
    return g;
  };
  const filter = (to: AudioNode, type: BiquadFilterType, f: number, q = 0.7) => {
    const b = ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    b.Q.value = q;
    b.connect(to);
    return b;
  };
  /** Attack–decay–sustain envelope, released at `t + dur` (percussive when `s` is 0); returns when it is silent. */
  function adsr(
    p: AudioParam,
    t: number,
    peak: number,
    a: number,
    d: number,
    s: number,
    r: number,
    dur: number,
  ) {
    p.setValueAtTime(0, t);
    p.linearRampToValueAtTime(peak, t + a);
    p.setTargetAtTime(peak * s, t + a, d / 3);
    if (s === 0) return t + a + d * 1.5;
    const off = Math.max(t + a, t + dur);
    p.setTargetAtTime(0, off, r / 3);
    return off + r * 1.5;
  }
  function osc(type: OscillatorType, f: number, to: AudioNode, t: number, end: number, detune = 0) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    o.connect(to);
    o.start(t);
    o.stop(end);
    return o;
  }
  /** Two-operator FM: a modulator at `ratio × f` with its own decaying index. */
  function fm(
    f: number,
    to: AudioNode,
    t: number,
    end: number,
    ratio: number,
    index: number,
    modDecay: number,
  ) {
    const car = osc("sine", f, to, t, end);
    const mg = ctx.createGain();
    mg.gain.setValueAtTime(index * f * ratio, t);
    mg.gain.setTargetAtTime(index * f * ratio * 0.05, t, modDecay / 3);
    mg.connect(car.frequency);
    osc("sine", f * ratio, mg, t, end);
    return car;
  }
  function burst(kind: Noise, to: AudioNode, t: number, peak: number, a: number, d: number) {
    const src = ctx.createBufferSource();
    src.buffer = noise[kind];
    const g = gain(to, 0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(0, t + a, d / 3);
    src.connect(g);
    src.start(t, Math.random() * 1.5);
    src.stop(t + a + d * 2);
  }
  /** A pitched drum: sine falling from `f × 2^octaves` to `f`. */
  function membrane(
    f: number,
    to: AudioNode,
    t: number,
    peak: number,
    octaves: number,
    pitchDecay: number,
    decay: number,
  ) {
    const g = gain(to, 0);
    const end = adsr(g.gain, t, peak, 0.001, decay, 0, 0.05, 0);
    const o = osc("sine", f * 2 ** octaves, g, t, end);
    o.frequency.setTargetAtTime(f, t, pitchDecay / 3);
  }
  function ping(f: number, to: AudioNode, t: number, peak: number, decay: number, sweep = 1) {
    const g = gain(to, 0);
    g.gain.setValueAtTime(peak, t);
    g.gain.setTargetAtTime(0, t, decay / 3);
    const o = osc("sine", f, g, t, t + decay * 2.5);
    if (sweep !== 1) o.frequency.exponentialRampToValueAtTime(f * sweep, t + decay);
  }

  function keyNote(v: KeysVoice, f: number, t: number, dur: number, vel: number) {
    const v0 = vel * 0.22;
    switch (v) {
      case "rhodes": {
        const g = gain(out.music, 0);
        fm(f, g, t, adsr(g.gain, t, v0, 0.005, 1.5, 0.25, 1.2, dur), 1, 2.2, 0.4);
        return;
      }
      case "felt": {
        const lp = filter(out.music, "lowpass", 1600);
        const g = gain(lp, 0);
        const end = adsr(g.gain, t, v0, 0.008, 1.2, 0.15, 0.8, dur);
        osc("triangle", f, g, t, end);
        osc("sine", f * 2, gain(g, 0.25), t, end);
        return;
      }
      case "kalimba": {
        const g = gain(out.music, 0);
        fm(f, g, t, adsr(g.gain, t, v0 * 1.2, 0.002, 1.4, 0, 1.2, 0), 5.4, 0.8, 0.08);
        return;
      }
      case "marimba": {
        const g = gain(out.music, 0);
        fm(f, g, t, adsr(g.gain, t, v0 * 1.2, 0.002, 0.7, 0, 0.5, 0), 4, 1.5, 0.04);
        return;
      }
      case "moss": {
        const g = gain(out.music, 0);
        const end = adsr(g.gain, t, v0 * 0.45, 0.9, 1.5, 0.7, 3, dur);
        for (const c of [-9, 0, 9]) osc("sine", f, g, t, end, c);
        return;
      }
      case "glass": {
        const g = gain(out.music, 0);
        const end = adsr(g.gain, t, v0 * 0.8, 0.002, 2.5, 0, 2, 0);
        fm(f, g, t, end, 3.5, 1.2, 0.6);
        osc("sine", f * 2, gain(g, 0.15), t, end);
        return;
      }
      case "pluck": {
        const lp = filter(out.music, "lowpass", 3000, 2);
        lp.frequency.setValueAtTime(3500, t);
        lp.frequency.setTargetAtTime(350, t, 0.05);
        const g = gain(lp, 0);
        osc("sawtooth", f, g, t, adsr(g.gain, t, v0 * 0.6, 0.002, 0.3, 0, 0.2, 0));
        return;
      }
    }
  }

  return {
    keys(v, notes, t, dur, vel, strum) {
      notes.forEach((n, i) => keyNote(v, midi(n), t + i * strum, dur, vel));
    },

    lead(v, note, t, dur, vel) {
      const f = midi(note);
      const v0 = vel * 0.16;
      const g = gain(out.send, 0);
      switch (v) {
        case "flute":
        case "whistle": {
          const end = adsr(g.gain, t, v === "flute" ? v0 : v0 * 0.7, 0.07, 0.3, 0.6, 0.6, dur);
          const o = osc("sine", v === "flute" ? f : f * 2, g, t, end);
          osc(
            "sine",
            v === "flute" ? 5 : 6.5,
            gain(o.frequency, f * (v === "flute" ? 0.006 : 0.012)),
            t,
            end,
          );
          if (v === "flute") burst("pink", filter(out.send, "bandpass", 1800), t, vel * 0.03, 0.03, 0.12);
          return;
        }
        case "triangle":
          osc("triangle", f, g, t, adsr(g.gain, t, v0, 0.02, 0.4, 0.3, 0.8, dur));
          return;
        case "bell":
          fm(f, g, t, adsr(g.gain, t, v0 * 1.1, 0.002, 1.6, 0, 1.4, 0), 2.76, 1.5, 0.5);
          return;
        case "hum": {
          const lp = filter(g, "lowpass", 900, 1);
          const end = adsr(g.gain, t, v0 * 0.8, 0.12, 0.5, 0.7, 0.8, dur);
          osc("sawtooth", f / 2, lp, t, end);
          osc("sawtooth", f / 2, lp, t, end, 7);
          return;
        }
      }
    },

    bass(v, note, t, dur, vel) {
      const f = midi(note);
      const from = bassFreq || f;
      bassFreq = f;
      const v0 = vel * 0.5;
      const glide = (o: OscillatorNode, mul = 1) => {
        o.frequency.setValueAtTime(from * mul, t);
        o.frequency.exponentialRampToValueAtTime(f * mul, t + 0.04);
      };
      switch (v) {
        case "sub": {
          const g = gain(out.music, 0);
          glide(osc("sine", f, g, t, adsr(g.gain, t, v0, 0.03, 0.4, 0.8, 0.4, dur)));
          return;
        }
        case "round": {
          const lp = filter(out.music, "lowpass", 400, 1);
          lp.frequency.setValueAtTime(800, t);
          lp.frequency.setTargetAtTime(300, t, 0.1);
          const g = gain(lp, 0);
          glide(osc("triangle", f, g, t, adsr(g.gain, t, v0 * 1.1, 0.01, 0.3, 0.7, 0.3, dur)));
          return;
        }
        case "dub": {
          const lp = filter(out.music, "lowpass", 380, 2);
          const g = gain(lp, 0);
          const end = adsr(g.gain, t, v0 * 1.2, 0.02, 0.6, 0.85, 0.5, dur);
          glide(osc("sine", f, g, t, end));
          glide(osc("square", f, gain(g, 0.12), t, end));
          return;
        }
      }
    },

    drum(kit, lane, t, vel) {
      const d = out.drums;
      switch (`${kit}:${lane}`) {
        case "lofi:kick":
          return membrane(49, d, t, vel * 0.9, 5, 0.05, 0.35);
        case "lofi:snare":
          burst("pink", filter(d, "bandpass", 1800), t, vel * 0.5, 0.001, 0.18);
          if (vel > 0.4) membrane(185, d, t, vel * 0.15, 0, 0.01, 0.08);
          return;
        case "lofi:hat":
          return burst("white", filter(d, "highpass", 7000), t, vel * 0.12, 0.001, 0.04);
        case "lofi:ohat":
          return burst("white", filter(d, "highpass", 7000), t, vel * 0.08, 0.001, 0.25);
        case "forest:kick":
          membrane(41, d, t, vel, 3, 0.03, 0.28);
          return burst("brown", filter(d, "lowpass", 300), t, vel * 0.3, 0.001, 0.07);
        case "forest:snare":
          if (vel < 0.4) return membrane(220, d, t, vel * 0.5, 1.5, 0.01, 0.06);
          burst("white", filter(d, "bandpass", 3200, 1.5), t, vel * 0.5, 0.001, 0.035);
          burst("white", filter(d, "bandpass", 3200, 1.5), t + 0.009, vel * 0.2, 0.001, 0.012);
          burst("white", filter(d, "bandpass", 3200, 1.5), t + 0.021, vel * 0.12, 0.001, 0.012);
          return membrane(294, d, t, vel * 0.25, 1.5, 0.01, 0.06);
        case "forest:hat":
          return burst("white", filter(d, "bandpass", 6500, 0.8), t, vel * 0.16, 0.008, 0.05);
        case "forest:ohat":
          return burst("pink", filter(d, "bandpass", 2500, 0.6), t, vel * 0.12, 0.04, 0.3);
        case "micro:kick":
          return membrane(58, d, t, vel * 0.7, 1, 0.01, 0.12);
        case "micro:snare":
          ping(2600, d, t, vel * 0.18, 0.004);
          return burst("white", filter(d, "highpass", 4000), t, vel * 0.08, 0.001, 0.02);
        case "micro:hat":
          return ping(8200, d, t, vel * 0.1, 0.0015);
        case "micro:ohat":
          return burst("white", filter(d, "bandpass", 9000, 2), t, vel * 0.08, 0.001, 0.08);
        case "soft:kick":
          return membrane(50, d, t, vel * 0.6, 1.5, 0.04, 0.4);
        case "soft:snare":
          return burst("pink", filter(d, "bandpass", 1200, 0.7), t, vel * 0.3, 0.02, 0.25);
        case "soft:hat":
          return burst("white", filter(d, "bandpass", 5000), t, vel * 0.08, 0.01, 0.06);
        case "soft:ohat":
          return burst("pink", filter(d, "bandpass", 4000), t, vel * 0.08, 0.05, 0.4);
      }
    },

    chirp(note, t, vel) {
      ping(midi(note), out.send, t, vel * 0.05, 0.07, 1.5);
    },
    drop(note, t, vel) {
      ping(midi(note), out.send, t, vel * 0.08, 0.12, 0.92);
    },
    click(note, t, vel) {
      ping(midi(note), out.music, t, vel * 0.08, 0.004);
    },
  };
}

/** Two seconds of noise; pink and brown by simple one-pole filtering. */
export function noiseBuffer(ctx: BaseAudioContext, kind: Noise, seconds = 2): AudioBuffer {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === "white") d[i] = w;
    else if (kind === "pink") d[i] = b = 0.9 * b + 0.1 * w * 3;
    else d[i] = b = 0.98 * b + 0.02 * w * 8;
  }
  return buf;
}
