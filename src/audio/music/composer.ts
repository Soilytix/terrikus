/**
 * The symbolic layer of the music, ported from soil-beats: Markov harmony,
 * voice leading, drum grammar, bass, motif lead and a slow conductor. It makes
 * one bar of note events at a time and never touches audio, so it runs in tests.
 * The scene's preset steers it through `mood` (glides) and `shape` (switches).
 */
import type { Groove, Mode, Mood, Shape } from "./presets";
import { rng, type Rng } from "./rng";

const NOTE = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
type Quality = "maj7" | "m7" | "dom7" | "m7b5";
// Rootless voicings (the bass plays the root): 3rd, 5th, 7th, 9th above it.
const UPPER: Record<Quality, number[]> = {
  maj7: [4, 7, 11, 14],
  m7: [3, 7, 10, 14],
  dom7: [4, 7, 10, 14],
  m7b5: [3, 6, 10, 14],
};
const SUFFIX: Record<Quality, string> = { maj7: "maj9", m7: "m9", dom7: "9", m7b5: "m7♭5" };

interface ModeDef {
  home: string;
  pent: number[];
  chords: Record<string, [number, Quality]>;
  next: Record<string, Record<string, number>>;
}
// Markov chains over roman numerals: ii–V–I, I–vi–ii–V, borrowed iv; two modal vamps.
const MODES: Record<Mode, ModeDef> = {
  major: {
    home: "I",
    pent: [0, 2, 4, 7, 9],
    chords: {
      I: [0, "maj7"],
      ii: [2, "m7"],
      iii: [4, "m7"],
      IV: [5, "maj7"],
      iv: [5, "m7"],
      V: [7, "dom7"],
      vi: [9, "m7"],
      bVII: [10, "dom7"],
    },
    next: {
      I: { ii: 3, vi: 3, IV: 3, iii: 1, iv: 1 },
      ii: { V: 6, bVII: 1, iii: 1 },
      iii: { vi: 4, IV: 1, ii: 1 },
      IV: { iii: 2, iv: 2, V: 2, I: 1, ii: 1 },
      iv: { I: 4, bVII: 2 },
      V: { I: 6, vi: 2, iii: 1 },
      vi: { ii: 4, IV: 3, V: 1 },
      bVII: { I: 4 },
    },
  },
  minor: {
    home: "i",
    pent: [0, 3, 5, 7, 10],
    chords: {
      i: [0, "m7"],
      ii0: [2, "m7b5"],
      III: [3, "maj7"],
      iv: [5, "m7"],
      v: [7, "m7"],
      V: [7, "dom7"],
      VI: [8, "maj7"],
      VII: [10, "dom7"],
    },
    next: {
      i: { iv: 3, VI: 3, ii0: 1, VII: 2, III: 1 },
      ii0: { V: 5, v: 1 },
      III: { VI: 3, iv: 2 },
      iv: { v: 2, V: 2, VII: 2, i: 1 },
      v: { i: 3, VI: 2 },
      V: { i: 5, VI: 1 },
      VI: { ii0: 2, VII: 2, iv: 1, V: 1 },
      VII: { III: 3, i: 2 },
    },
  },
  // i–IV7, back and forth.
  dorian: {
    home: "i",
    pent: [0, 3, 5, 7, 10],
    chords: { i: [0, "m7"], IV: [5, "dom7"] },
    next: { i: { IV: 1 }, IV: { i: 1 } },
  },
  // Imaj7–II7: the raised fourth that floats.
  lydian: {
    home: "I",
    pent: [0, 2, 4, 6, 9],
    chords: { I: [0, "maj7"], II: [2, "dom7"], vii: [11, "m7"] },
    next: { I: { II: 3, vii: 1 }, II: { I: 1 }, vii: { I: 1 } },
  },
};

/** Keys rhythms, [step, length] in 16ths. 4 and 5 are arpeggios (one note per hit). */
const COMP: [number, number][][] = [
  [[0, 15]],
  [
    [0, 7],
    [10, 5],
  ],
  [
    [0, 3],
    [6, 3],
    [11, 4],
  ],
  [
    [0, 6],
    [8, 6],
  ],
  [0, 2, 4, 6, 8, 10, 12, 14].map((s) => [s, 2]),
  [0, 3, 6, 10].map((s) => [s, 6]),
];
const ARP = new Set([4, 5]);

export type Lane = "kick" | "snare" | "hat" | "ohat" | "keys" | "bass" | "lead" | "chirp" | "drop" | "click";
export interface NoteEvent {
  lane: Lane;
  step: number;
  vel: number;
  len?: number;
  note?: number;
  notes?: number[];
  strum?: number;
  jitter?: number;
}
export interface Bar {
  bar: number;
  events: NoteEvent[];
  chord: string;
  key: string;
  bpm: number;
  filterMul: number;
  breakdown: boolean;
}

interface Chord {
  sym: string;
  key: number;
  mode: Mode;
  root: number;
  q: Quality;
  name: string;
  bars: number;
}
type Pattern = Record<"kick" | "snare" | "hat" | "ohat", number[]>;
const DRUM_LANES = new Set<Lane>(["kick", "snare", "hat", "ohat"]);

const PERMS = (function perms(a: number[]): number[][] {
  return a.length <= 1
    ? [a]
    : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
})([0, 1, 2, 3]);

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Nearest midi note with pitch class `pc` to `ref`. */
function nearest(pc: number, ref: number): number {
  const below = ref - ((((ref - pc) % 12) + 12) % 12);
  return ref - below > 6 ? below + 12 : below;
}

/** Each voice moves to the nearest chord tone; the assignment with least total motion wins. */
function voiceLead(prev: number[] | null, chord: Chord): number[] {
  const pcs = UPPER[chord.q].map((i) => (chord.root + i) % 12);
  if (!prev) {
    let n = 55;
    return pcs.map((pc) => {
      while (n % 12 !== pc) n++;
      return n++;
    });
  }
  let best = prev;
  let bestCost = Infinity;
  for (const perm of PERMS) {
    const v = perm.map((pi, k) => nearest(pcs[pi]!, prev[k]!)).sort((a, b) => a - b);
    const centre = v.reduce((a, b) => a + b) / 4;
    const cost =
      v.reduce((s, x, k) => s + Math.abs(x - prev[k]!), 0) +
      Math.max(0, Math.abs(centre - 62) - 5) * 2 +
      (v[3]! - v[0]! > 16 ? 4 : 0);
    if (cost < bestCost) [best, bestCost] = [v, cost];
  }
  return best;
}

function setHats(hat: number[], style: string) {
  for (let s = 0; s < 16; s++) {
    const eighth = s % 2 === 0 ? (s % 4 === 0 ? 0.7 : 0.5) : 0;
    hat[s] = style === "sparse" ? (s % 4 === 2 ? 0.6 : 0) : style === "16ths" && s % 4 === 3 ? 0.3 : eighth;
  }
}

/** The groove grammar: one base pattern per groove, mutated a little at a time. */
function basePattern(r: Rng, groove: Groove): Pattern {
  const z = () => Array<number>(16).fill(0);
  const p: Pattern = { kick: z(), snare: z(), hat: z(), ohat: z() };
  switch (groove) {
    case "none":
      setHats(p.hat, "sparse");
      break;
    case "boombap":
      p.kick[0] = 1;
      p.kick[10] = 0.85;
      if (r.chance(0.4)) p.kick[r.pick([7, 13, 14])] = 0.6;
      p.snare[4] = p.snare[12] = 0.9;
      setHats(p.hat, r.pick(["8ths", "8ths", "16ths", "sparse"]));
      break;
    case "halftime":
      p.kick[0] = 1;
      if (r.chance(0.6)) p.kick[r.pick([11, 14])] = 0.7;
      p.snare[8] = 0.9;
      setHats(p.hat, r.pick(["8ths", "sparse"]));
      break;
    case "steady":
      for (const s of [0, 4, 8, 12]) p.kick[s] = 0.8;
      p.snare[4] = p.snare[12] = 0.5;
      for (let s = 2; s < 16; s += 4) p.hat[s] = 0.6;
      if (r.chance(0.5)) for (let s = 1; s < 16; s += 2) p.hat[s] = 0.25;
      break;
    case "broken":
      p.kick[0] = 1;
      p.kick[6] = 0.7;
      p.kick[r.pick([10, 11])] = 0.8;
      p.snare[4] = 0.85;
      p.snare[13] = 0.8;
      setHats(p.hat, "16ths");
      break;
  }
  return p;
}

const LAYERS = ["harmony", "keys", "bass", "drums", "melody", "human", "form", "nature"] as const;

export class Composer {
  readonly seed: string;
  r: Record<(typeof LAYERS)[number], Rng>;
  mood: Mood;
  shape: Shape;
  /** Live overrides from the dev surface. */
  evolve = true;
  bar = 0;
  chord: Chord;
  nextChord: Chord;
  drums: Pattern;
  log: string[] = [];
  private chordBarsLeft = 0;
  private voicing: number[] | null = null;
  private lockedUntil = 0;
  private nextMutation: number;
  private motif: { step: number; idx: number; len: number }[];
  private comp = 0;
  private harmP = 0.5;
  private leadOn = true;
  private tempoNudge = 0;
  private breakdownUntil = -1;
  private sweep: { from: number; len: number; kind: "rise" | "dip" } | null = null;
  private nextEvent: number;

  constructor(seed: string, mood: Mood, shape: Shape) {
    this.seed = seed;
    this.mood = mood;
    this.shape = shape;
    this.r = Object.fromEntries(LAYERS.map((s) => [s, rng(seed, s)])) as Composer["r"];
    const key = this.r.form.int(12);
    this.comp = this.r.form.pick(shape.comp);
    this.chord = this.nextChord = this.makeChord(MODES[shape.mode].home, key, shape.mode);
    this.drums = basePattern(this.r.drums, shape.groove);
    this.nextMutation = 4 + this.r.drums.int(5);
    this.motif = this.newMotif();
    this.nextEvent = 16 + 8 * this.r.form.int(3);
  }

  get density() {
    return clamp(this.mood.density, 0, 1);
  }

  get bpm() {
    return clamp(this.mood.tempo + this.tempoNudge, 48, 104);
  }

  /** A new categorical shape: a mode change lands on the next chord, keeping the key. */
  setShape(shape: Shape) {
    const was = this.shape;
    this.shape = shape;
    if (shape.mode !== was.mode) {
      this.nextChord = this.makeChord(MODES[shape.mode].home, this.nextChord.key, shape.mode);
      this.say(`mode → ${shape.mode}`);
    }
    if (shape.groove !== was.groove) {
      this.drums = basePattern(this.r.drums, shape.groove);
      this.say(`groove → ${shape.groove}`);
    }
    if (!shape.comp.includes(this.comp)) this.comp = this.r.form.pick(shape.comp);
  }

  private makeChord(sym: string, key: number, mode: Mode): Chord {
    const [deg, q] = MODES[mode].chords[sym]!;
    const root = (key + deg) % 12;
    const bars = this.r.harmony.chance(this.harmP) ? 2 : 1;
    return { sym, key, mode, root, q, name: NOTE[root]! + SUFFIX[q], bars };
  }

  get keyName() {
    return `${NOTE[this.chord.key]} ${this.chord.mode}`;
  }

  nextBar(): Bar {
    const bar = this.bar++;
    if (this.evolve) this.conduct(bar);

    let chordStart = false;
    if (this.chordBarsLeft <= 0) {
      this.chord = this.nextChord;
      const def = MODES[this.chord.mode];
      this.nextChord = this.makeChord(
        this.r.harmony.weighted(def.next[this.chord.sym] ?? { [def.home]: 1 }),
        this.chord.key,
        this.chord.mode,
      );
      this.chordBarsLeft = this.chord.bars;
      this.voicing = voiceLead(this.voicing, this.chord);
      chordStart = true;
    }
    const lastBarOfChord = this.chordBarsLeft === 1;
    this.chordBarsLeft--;

    if (bar >= this.nextMutation) {
      this.mutateDrums();
      this.nextMutation = bar + 4 + this.r.drums.int(5);
    }

    const events = [
      ...this.drumEvents(bar),
      ...this.keysEvents(chordStart),
      ...this.bassEvents(chordStart, lastBarOfChord),
      ...this.leadEvents(bar),
      ...this.natureEvents(),
    ];
    events.sort((a, b) => a.step - b.step);
    const h = this.r.human;
    for (const ev of events) {
      ev.jitter = (h.next() * 2 - 1) * (DRUM_LANES.has(ev.lane) ? 0.015 : 0.01);
      ev.vel = clamp(ev.vel * (0.88 + h.next() * 0.24), 0.05, 1);
    }
    return {
      bar,
      events,
      chord: this.chord.name,
      key: this.keyName,
      bpm: this.bpm,
      filterMul: this.filterMul(bar),
      breakdown: bar < this.breakdownUntil,
    };
  }

  // --- drums ---------------------------------------------------------------

  private drumEvents(bar: number): NoteEvent[] {
    const d = this.r.drums;
    const p = this.drums;
    const dens = this.density;
    const presence = bar < this.breakdownUntil || this.shape.groove === "none" ? 0 : this.mood.drums;
    const out = presence < 0.15;
    const full = presence > 0.7;
    const backbeat = clamp(presence, 0, 1);
    const ev: NoteEvent[] = [];
    for (let s = 0; s < 16; s++) {
      const ghost = d.next();
      const hatRoll = d.next();
      const extra = d.next();
      if (!out) {
        if (p.kick[s]) ev.push({ lane: "kick", step: s, vel: p.kick[s]! * (0.6 + 0.4 * backbeat) });
        if (p.snare[s]) ev.push({ lane: "snare", step: s, vel: p.snare[s]! * backbeat });
        else if (full && [3, 7, 9, 15].includes(s) && ghost < 0.3 * dens)
          ev.push({ lane: "snare", step: s, vel: 0.12 + ghost * 0.4 });
      }
      if (p.ohat[s] && full) ev.push({ lane: "ohat", step: s, vel: p.ohat[s]! });
      else if (p.hat[s] && hatRoll < (out ? 0.25 : 0.92)) ev.push({ lane: "hat", step: s, vel: p.hat[s]! });
      else if (s % 2 && !out && extra < 0.2 * dens) ev.push({ lane: "hat", step: s, vel: 0.22 });
    }
    if (full && bar % 8 === 7 && d.chance(0.4))
      ev.push({ lane: "snare", step: 14, vel: 0.45 }, { lane: "snare", step: 15, vel: 0.3 });
    return ev;
  }

  /** Change one element of the groove instead of regenerating it. */
  mutateDrums(force = false) {
    if (!force && this.bar < this.lockedUntil) return;
    const d = this.r.drums;
    const p = this.drums;
    const op = d.pick(["kickGhost", "kickShift", "hats", "ohat", "snareGhost"] as const);
    if (op === "kickGhost") {
      const s = d.pick([3, 7, 13, 14]);
      p.kick[s] = p.kick[s] ? 0 : 0.6;
    } else if (op === "kickShift") {
      [p.kick[10], p.kick[11]] = p.kick[10] ? [0, 0.85] : [0.85, 0];
    } else if (op === "hats") {
      setHats(p.hat, d.pick(["8ths", "16ths", "sparse"]));
    } else if (op === "ohat") {
      const s = d.pick([6, 14]);
      p.ohat[s] = p.ohat[s] ? 0 : 0.4;
    } else {
      p.snare[7] = p.snare[7] ? 0 : 0.25;
    }
  }

  toggleStep(lane: "kick" | "snare" | "hat", s: number) {
    const p = this.drums;
    if (lane === "hat" && p.ohat[s]) p.ohat[s] = p.hat[s] = 0;
    else p[lane][s] = p[lane][s] ? 0 : { kick: 0.85, snare: 0.8, hat: 0.5 }[lane];
    this.lockedUntil = this.bar + 16; // hold off auto-mutation after a manual edit
  }

  // --- keys, bass, lead ----------------------------------------------------

  private keysEvents(chordStart: boolean): NoteEvent[] {
    const k = this.r.keys;
    const voicing = this.voicing!;
    const arp = ARP.has(this.comp);
    return COMP[this.comp]!.map(([step, len], i) => ({
      roll: k.next(),
      strum: 0.008 + k.next() * 0.02,
      step,
      len,
      i,
    }))
      .filter(({ roll, i }) =>
        arp ? roll < 0.35 + 0.6 * this.density : chordStart ? i === 0 || roll < 0.75 : roll < 0.45,
      )
      .map(({ step, len, strum, i }) =>
        arp
          ? { lane: "keys" as const, step, len, notes: [voicing[i % 4]! + (i >= 4 ? 12 : 0)], vel: 0.5 }
          : { lane: "keys" as const, step, len, strum, notes: voicing, vel: 0.55 + (step === 0 ? 0.1 : 0) },
      );
  }

  private bassEvents(chordStart: boolean, lastBarOfChord: boolean): NoteEvent[] {
    const b = this.r.bass;
    const low = (pc: number) => 33 + ((pc - 9 + 12) % 12); // A1..G#2
    const root = low(this.chord.root);
    const ev: NoteEvent[] = [];
    const r0 = b.next();
    const r10 = b.next();
    const rApp = b.next();
    const up = b.next();
    if (chordStart || r0 < 0.7)
      ev.push({ lane: "bass", step: 0, len: 6 + Math.floor(r0 * 4), note: root, vel: 0.85 });
    if (r10 < 0.55)
      ev.push({
        lane: "bass",
        step: 10,
        len: 3,
        note: r10 < 0.15 ? root + 7 : r10 < 0.25 ? root + 12 : root,
        vel: 0.7,
      });
    if (lastBarOfChord && rApp < 0.5)
      ev.push({
        lane: "bass",
        step: 14,
        len: 2,
        note: low(this.nextChord.root) + (up < 0.5 ? 1 : -1),
        vel: 0.6,
      });
    return ev;
  }

  private newMotif() {
    const m = this.r.melody;
    const slots = [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14];
    const steps: number[] = [];
    const n = 3 + m.int(3);
    while (steps.length < n) {
      const s = m.pick(slots);
      if (!steps.includes(s)) steps.push(s);
    }
    let idx = 2 + m.int(3);
    return steps
      .sort((a, b) => a - b)
      .map((step) => {
        idx = clamp(idx + m.pick([-2, -1, -1, 0, 1, 1, 2]), 0, 7);
        return { step, idx, len: Math.min(m.pick([2, 2, 3, 4, 6]), 16 - step) };
      });
  }

  private leadEvents(bar: number): NoteEvent[] {
    const m = this.r.melody;
    if (bar > 0 && bar % 8 === 0 && m.chance(0.5)) this.motif = this.newMotif();
    const breath = m.next();
    const vary = m.next();
    const plays = m.next();
    const vi = m.int(this.motif.length);
    const vd = m.pick([-1, 1, -2, 2]);
    const rolls = this.motif.map(() => m.next());
    if (!this.leadOn || plays >= this.mood.lead || (bar % 4 === 3 && breath < 0.7)) return [];

    const notes = this.motif.map((n) => ({ ...n }));
    if (vary < 0.4) notes[vi]!.idx = clamp(notes[vi]!.idx + vd, 0, 7);
    const { key, mode, root, q } = this.chord;
    const pent = MODES[mode].pent;
    const tonic = 64 + ((key - 4 + 12) % 12);
    const chordPcs = [root, ...UPPER[q].map((i) => (root + i) % 12)];
    const restP = 0.4 - this.density * 0.3;
    return notes
      .filter((_, i) => rolls[i]! >= restP)
      .map(({ step, idx, len }) => {
        let note = tonic + pent[idx % 5]! + 12 * Math.floor(idx / 5);
        if (step % 8 === 0) note += [0, 1, -1, 2, -2].find((d) => chordPcs.includes((note + d) % 12)) ?? 0;
        return { lane: "lead" as const, step, len, note, vel: 0.6 };
      });
  }

  /** Bird chirps, water drops and micro-clicks; drops and clicks are chord tones, so they stay in key. */
  private natureEvents(): NoteEvent[] {
    const n = this.r.nature;
    const mood = this.mood;
    const chirp = n.next();
    const chirpAt = n.int(14);
    const chirps = 1 + n.int(3);
    const chirpNote = 84 + n.int(12);
    const drop = n.next();
    const dropAt = n.int(16);
    const dropIdx = n.int(5);
    const click = n.next();
    const clickAt = n.int(12);
    const clickN = 3 + n.int(5);
    const ev: NoteEvent[] = [];
    const { root, q } = this.chord;
    const pcs = [root, ...UPPER[q].map((i) => (root + i) % 12)];
    if (chirp < mood.birds)
      for (let i = 0; i < chirps; i++)
        ev.push({ lane: "chirp", step: chirpAt + i, note: chirpNote + 2 * i, vel: 0.5 });
    if (drop < mood.drops) ev.push({ lane: "drop", step: dropAt, note: 84 + pcs[dropIdx]!, vel: 0.5 });
    if (click < mood.clicks)
      for (let i = 0; i < clickN && clickAt + i < 16; i++)
        ev.push({
          lane: "click",
          step: clickAt + i,
          note: 96 + pcs[(dropIdx + i) % 5]!,
          vel: 0.5 - i * 0.05,
        });
    return ev;
  }

  // --- macro form ----------------------------------------------------------

  private conduct(bar: number) {
    if (bar === this.breakdownUntil) this.sweep = { from: bar, len: 4, kind: "rise" };
    if (bar < this.nextEvent) return;
    const f = this.r.form;
    this.nextEvent = bar + f.pick([16, 16, 24, 32, 32, 48, 64]);
    const tonal = this.chord.mode === "major" || this.chord.mode === "minor";
    this.trigger(
      f.weighted({
        modulate4: 2,
        relative: tonal ? 2 : 0,
        tempo: 2,
        breakdown: this.mood.drums > 0.5 ? 2 : 0,
        comp: 2,
        lead: 1,
        sweep: 2,
        drums: 1,
      }),
      bar,
    );
  }

  private say(msg: string, bar = this.bar) {
    this.log.push(`bar ${bar}: ${msg}`);
    if (this.log.length > 8) this.log.shift();
  }

  /** Macro actions, shared by the conductor and the dev surface. */
  trigger(action: string, bar = this.bar) {
    const f = this.r.form;
    const c = this.nextChord;
    const modulate = (key: number, mode: Mode) => {
      this.nextChord = this.makeChord(MODES[mode].home, key % 12, mode);
      return `→ ${NOTE[key % 12]} ${mode}`;
    };
    let msg = action;
    switch (action) {
      case "modulate4":
        msg = modulate(c.key + 5, c.mode);
        break;
      case "relative":
        if (c.mode === "major") msg = modulate(c.key + 9, "minor");
        else if (c.mode === "minor") msg = modulate(c.key + 3, "major");
        break;
      case "tempo":
        this.tempoNudge = Math.round(f.range(-3, 3));
        msg = `tempo → ${this.bpm}`;
        break;
      case "breakdown":
        this.breakdownUntil = bar + f.pick([4, 8]);
        msg = `drums out until bar ${this.breakdownUntil}`;
        break;
      case "comp":
        this.comp = f.pick(this.shape.comp);
        this.harmP = f.pick([0.3, 0.5, 0.8]);
        msg = `comping style ${this.comp + 1}`;
        break;
      case "lead":
        this.leadOn = !this.leadOn;
        msg = `lead ${this.leadOn ? "in" : "out"}`;
        break;
      case "sweep":
        this.sweep = { from: bar, len: 8, kind: "dip" };
        msg = "filter sweep";
        break;
      case "drums":
        this.drums = basePattern(this.r.drums, this.shape.groove);
        msg = "new groove";
        break;
      case "motif":
        this.motif = this.newMotif();
        msg = "new motif";
        break;
    }
    this.say(msg, bar);
  }

  private filterMul(bar: number): number {
    if (bar < this.breakdownUntil) return 0.35;
    const s = this.sweep;
    if (s && bar < s.from + s.len) {
      const p = (bar - s.from) / s.len;
      return s.kind === "rise" ? 0.35 + 0.65 * p : 1 - 0.6 * Math.sin(Math.PI * p);
    }
    return 1;
  }
}
