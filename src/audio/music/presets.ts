/**
 * Music presets: every scene is a set of musical parameters. A preset is built
 * from three layers — the zoom level (style and instruments), the time of day
 * and rain (mood and beds), then the scene's own overrides — and the engine
 * glides between presets when the scene changes. Pure data: no audio here.
 */
import type { Scale } from "../../content/schema";

export type TimeOfDay = "dawn" | "day" | "dusk" | "night";
export const TIMES: TimeOfDay[] = ["dawn", "day", "dusk", "night"];
export type Mode = "major" | "minor" | "dorian" | "lydian";
export type Groove = "none" | "boombap" | "halftime" | "steady" | "broken";

export const KEYS = ["rhodes", "felt", "kalimba", "marimba", "moss", "glass", "pluck"] as const;
export const LEADS = ["flute", "whistle", "triangle", "bell", "hum"] as const;
export const BASSES = ["sub", "round", "dub"] as const;
export const KITS = ["lofi", "forest", "micro", "soft"] as const;
/** Synthesised beds, then the CC0 field recordings (src/assets/ambience/). */
export const SYNTH_BEDS = ["vinyl", "leaves", "drizzle", "water", "night", "myco", "drone"] as const;
export const SAMPLE_BEDS = ["birds", "brook", "rain", "crickets", "frogs", "wind"] as const;
export type KeysVoice = (typeof KEYS)[number];
export type LeadVoice = (typeof LEADS)[number];
export type BassVoice = (typeof BASSES)[number];
export type KitId = (typeof KITS)[number];
export type SampleBed = (typeof SAMPLE_BEDS)[number];
export type BedId = (typeof SYNTH_BEDS)[number] | SampleBed;

/** What a field recording is, for the caption. */
export const RECORDING: Record<SampleBed, string> = {
  birds: "birdsong",
  brook: "a brook",
  rain: "rain",
  crickets: "crickets",
  frogs: "frogs",
  wind: "wind in leaves",
};

/** The numeric half of a preset: everything here glides. Weights crossfade instruments. */
export interface Mood {
  tempo: number;
  swing: number;
  density: number;
  /** Drum presence: 0 none, ~0.4 light backbeat, 1 full. */
  drums: number;
  /** Chance per bar that the lead plays. */
  lead: number;
  /** Per-bar chances of a synth bird chirp, an in-key water drop and a burst of micro-clicks. */
  birds: number;
  drops: number;
  clicks: number;
  cutoff: number;
  reverb: number;
  crush: number;
  wow: number;
  delay: number;
  /** Low-pass on the beds: the surface heard from below ground is muffled. */
  muffle: number;
  /** Semitones added to keys and lead. */
  register: number;
  keys: Partial<Record<KeysVoice, number>>;
  leads: Partial<Record<LeadVoice, number>>;
  bass: Partial<Record<BassVoice, number>>;
  kit: Partial<Record<KitId, number>>;
  beds: Partial<Record<BedId, number>>;
}

/** The categorical half: switched once, halfway through a glide. */
export interface Shape {
  mode: Mode;
  groove: Groove;
  /** Comping patterns the keys may use (composer COMP indices; 4 and 5 are arpeggios). */
  comp: number[];
}

export interface Preset {
  time: TimeOfDay;
  rain: number;
  /** A few words for the caption. */
  style: string;
  mood: Mood;
  shape: Shape;
}

interface Layer {
  style: string;
  /** How much of the surface's sounds reach this scale (birds, crickets, rain). */
  surface: number;
  mood: Mood;
  shape: Shape;
}

/** Zoom level: the style. Going deeper slows the light, closes the filter and changes the instruments. */
export const SCALE_LAYERS: Record<Scale, Layer> = {
  landscape: {
    style: "wide, slow pastoral",
    surface: 1,
    mood: {
      tempo: 72,
      swing: 0.56,
      density: 0.5,
      drums: 0.4,
      lead: 0.8,
      birds: 0.2,
      drops: 0,
      clicks: 0,
      cutoff: 6000,
      reverb: 0.35,
      crush: 0.03,
      wow: 0.3,
      delay: 0.35,
      muffle: 16000,
      register: 0,
      keys: { moss: 0.7, felt: 0.5 },
      leads: { flute: 1 },
      bass: { sub: 1 },
      kit: { soft: 0.8, forest: 0.3 },
      beds: { drone: 0.15 },
    },
    shape: { mode: "major", groove: "halftime", comp: [1, 3] },
  },
  field: {
    style: "lo-fi beat",
    surface: 1,
    mood: {
      tempo: 82,
      swing: 0.58,
      density: 0.75,
      drums: 1,
      lead: 0.7,
      birds: 0.15,
      drops: 0.05,
      clicks: 0,
      cutoff: 4200,
      reverb: 0.18,
      crush: 0.08,
      wow: 0.3,
      delay: 0.3,
      muffle: 14000,
      register: 0,
      keys: { kalimba: 0.8, rhodes: 0.4 },
      leads: { flute: 0.8 },
      bass: { round: 1 },
      kit: { forest: 0.8, lofi: 0.5 },
      beds: { vinyl: 0.25, leaves: 0.2 },
    },
    shape: { mode: "major", groove: "boombap", comp: [0, 1, 2, 3] },
  },
  profile: {
    style: "deep, dubby",
    surface: 0.6,
    mood: {
      tempo: 76,
      swing: 0.6,
      density: 0.6,
      drums: 0.8,
      lead: 0.5,
      birds: 0,
      drops: 0.15,
      clicks: 0.1,
      cutoff: 1800,
      reverb: 0.3,
      crush: 0.1,
      wow: 0.4,
      delay: 0.5,
      muffle: 1400,
      register: -5,
      keys: { marimba: 0.8, felt: 0.4 },
      leads: { hum: 0.7 },
      bass: { dub: 1 },
      kit: { forest: 1 },
      beds: { drone: 0.35, myco: 0.2 },
    },
    shape: { mode: "minor", groove: "halftime", comp: [0, 3] },
  },
  aggregate: {
    style: "close, clicking minimal",
    surface: 0.25,
    mood: {
      tempo: 88,
      swing: 0.54,
      density: 0.85,
      drums: 0.7,
      lead: 0.4,
      birds: 0,
      drops: 0.2,
      clicks: 0.5,
      cutoff: 2600,
      reverb: 0.22,
      crush: 0.2,
      wow: 0.15,
      delay: 0.4,
      muffle: 900,
      register: 0,
      keys: { pluck: 0.8, marimba: 0.3 },
      leads: { whistle: 0.5 },
      bass: { round: 0.6, sub: 0.4 },
      kit: { micro: 1, forest: 0.3 },
      beds: { myco: 0.5, water: 0.15 },
    },
    shape: { mode: "dorian", groove: "steady", comp: [4, 2] },
  },
  rhizosphere: {
    style: "warm, bubbling",
    surface: 0.2,
    mood: {
      tempo: 84,
      swing: 0.6,
      density: 0.8,
      drums: 0.75,
      lead: 0.6,
      birds: 0,
      drops: 0.25,
      clicks: 0.25,
      cutoff: 3400,
      reverb: 0.25,
      crush: 0.06,
      wow: 0.25,
      delay: 0.35,
      muffle: 1100,
      register: 2,
      keys: { kalimba: 0.7, moss: 0.4 },
      leads: { bell: 0.5, flute: 0.3 },
      bass: { round: 0.8 },
      kit: { forest: 0.7, micro: 0.4 },
      beds: { myco: 0.3, drone: 0.2 },
    },
    shape: { mode: "major", groove: "broken", comp: [4, 1] },
  },
  cell: {
    style: "glassy, floating",
    surface: 0,
    mood: {
      tempo: 64,
      swing: 0.5,
      density: 0.4,
      drums: 0.1,
      lead: 0.5,
      birds: 0,
      drops: 0.1,
      clicks: 0.3,
      cutoff: 5000,
      reverb: 0.55,
      crush: 0.02,
      wow: 0.1,
      delay: 0.55,
      muffle: 700,
      register: 7,
      keys: { glass: 0.8, moss: 0.5 },
      leads: { bell: 0.7 },
      bass: { sub: 0.6 },
      kit: { micro: 0.5 },
      beds: { drone: 0.4 },
    },
    shape: { mode: "lydian", groove: "none", comp: [5, 1] },
  },
};

/** One scene's overrides on top of its scale layer. */
export interface SceneMusic {
  time: TimeOfDay;
  /** 0 dry … 1 heavy rain. */
  rain?: number;
  style?: string;
  mood?: Partial<Omit<Mood, "beds">>;
  /** Added to the layered beds. */
  beds?: Partial<Record<BedId, number>>;
  shape?: Partial<Shape>;
}

/** Every scene's preset (tests/music: one per scene). Times and rain follow the scene's description. */
export const SCENE_MUSIC: Record<string, SceneMusic> = {
  valley: { time: "dawn", beds: { brook: 0.35 } },
  "valley-map": { time: "day", style: "light, map-like", beds: { brook: 0.15 }, mood: { lead: 0.5 } },
  "p-field-dawn": { time: "dawn", beds: { wind: 0.2 }, mood: { drums: 0.6 } },
  "p-handful": {
    time: "day",
    style: "close lo-fi",
    mood: { cutoff: 3200, register: 2 },
    beds: { leaves: 0.2 },
  },
  "p-pore": { time: "day" },
  "c1-grain-ruler": {
    time: "day",
    style: "tidy, counting",
    mood: { reverb: 0.12, crush: 0.1 },
    shape: { comp: [4] },
  },
  "c1-aggregate-cut": { time: "day", mood: { keys: { marimba: 0.6, pluck: 0.5 } } },
  "c1-labyrinth": {
    time: "night",
    style: "dark cave",
    mood: { drops: 0.45, reverb: 0.45 },
    beds: { water: 0.25 },
  },
  "c2-hedge-edge": {
    time: "dusk",
    style: "autumn lo-fi",
    beds: { wind: 0.5, leaves: 0.3 },
    mood: { keys: { felt: 0.6, kalimba: 0.4 } },
  },
  "c2-litter": {
    time: "dusk",
    beds: { leaves: 0.3, myco: 0.2 },
    mood: { keys: { marimba: 0.5, kalimba: 0.4 } },
  },
  "c2-aggregate": { time: "dusk", mood: { keys: { pluck: 0.6, kalimba: 0.4 } } },
  "c3-drain": {
    time: "day",
    style: "dry, cracking",
    mood: { drops: 0.05, crush: 0.3, clicks: 0.6 },
    beds: { water: -0.15 },
  },
  "c3-rain-profile": { time: "day", rain: 1, style: "rain heard from below" },
  "c4-paddy": {
    time: "dusk",
    style: "still water",
    beds: { frogs: 0.5, crickets: 0.2, water: 0.1 },
    shape: { mode: "lydian" },
  },
  "c4-elevator": {
    time: "night",
    style: "sinking, waterlogged",
    beds: { frogs: 0.15 },
    mood: { drops: 0.35, cutoff: 1300 },
  },
  "c5-platelet": { time: "night", style: "charged, sparkling", mood: { clicks: 0.5 } },
  "c6-gallery": { time: "day", mood: { leads: { whistle: 0.4, flute: 0.3 } } },
  "c6-geosmin": { time: "dusk", style: "after rain", mood: { drops: 0.3, keys: { moss: 0.5, pluck: 0.4 } } },
  "c7-root-tip": { time: "day" },
  "c8-nodule": { time: "day", style: "bubbling trade", mood: { drops: 0.35 } },
  "c8-arbuscule": { time: "day", style: "glowing, branching", mood: { keys: { glass: 0.7, kalimba: 0.4 } } },
  "c9-relay": { time: "dawn", style: "spring relay", mood: { keys: { kalimba: 0.6, marimba: 0.4 } } },
  "c10-triangle": { time: "day", rain: 0.5, style: "wet, uneasy", shape: { mode: "minor" } },
  "c10-shield": { time: "dusk", shape: { mode: "dorian" } },
  "c11-pit": { time: "dusk", style: "woodland folk", beds: { wind: 0.4 }, shape: { mode: "dorian" } },
  "c11-catena": { time: "day", beds: { brook: 0.2, wind: 0.2 } },
  "c12-twin-fields": { time: "day", beds: { wind: 0.15 } },
  "c12-wheel": {
    time: "day",
    style: "pressed, heavy",
    mood: { tempo: 78, cutoff: 1800, crush: 0.3 },
    shape: { groove: "halftime" },
  },
  "c13-valley": { time: "day", rain: 0.7, beds: { brook: 0.45 } },
  "c13-splash": { time: "day", rain: 1, style: "rain on bare soil" },
  "c13-salt": {
    time: "day",
    style: "dry, hot",
    mood: { birds: 0, reverb: 0.1 },
    beds: { wind: 0.3, leaves: -0.2 },
    shape: { mode: "dorian" },
  },
  "c14-bench": {
    time: "day",
    style: "clean lab",
    mood: { birds: 0, keys: { rhodes: 0.6, felt: 0.3 }, crush: 0.04 },
    beds: { leaves: -0.2 },
    shape: { groove: "steady" },
  },
};

const add = <K extends string>(a: Partial<Record<K, number>>, b: Partial<Record<K, number>>, k = 1) => {
  const out = { ...a };
  for (const [key, v] of Object.entries(b) as [K, number][]) out[key] = Math.max(0, (out[key] ?? 0) + v * k);
  return out;
};

/** Build a scene's preset; `time` and `rain` overrides come from the dev surface. */
export function presetFor(
  sceneId: string,
  scale: Scale,
  over: { time?: TimeOfDay | undefined; rain?: number | undefined } = {},
): Preset {
  const layer = SCALE_LAYERS[scale];
  const sc = SCENE_MUSIC[sceneId] ?? { time: "day" };
  const time = over.time ?? sc.time;
  const rain = over.rain ?? sc.rain ?? 0;
  const s = layer.surface;
  const m: Mood = { ...layer.mood, ...sc.mood, beds: { ...layer.mood.beds } };
  const shape: Shape = { ...layer.shape, ...sc.shape };

  // Time of day: the light sets tempo, brightness and the surface's chorus.
  const T = {
    dawn: {
      tempo: -4,
      density: 0.8,
      drums: 0.6,
      cutoff: 0.85,
      reverb: 0.05,
      birds: 0.5,
      beds: { birds: 0.7 },
    },
    day: { tempo: 0, density: 1, drums: 1, cutoff: 1, reverb: 0, birds: 0.15, beds: { birds: 0.2 } },
    dusk: {
      tempo: -3,
      density: 0.85,
      drums: 0.9,
      cutoff: 0.8,
      reverb: 0.05,
      birds: 0.05,
      beds: { crickets: 0.3 },
    },
    night: {
      tempo: -7,
      density: 0.55,
      drums: 0.35,
      cutoff: 0.6,
      reverb: 0.12,
      birds: 0,
      beds: { crickets: 0.8 },
    },
  }[time];
  m.tempo += T.tempo;
  m.density *= T.density;
  m.drums *= T.drums;
  m.cutoff *= T.cutoff;
  m.reverb += T.reverb;
  m.birds = sc.mood?.birds ?? Math.max(m.birds, T.birds) * s;
  m.beds = add(m.beds, T.beds, s);
  if (time === "night") {
    m.beds = add(m.beds, { drone: 0.2 });
    if (shape.mode === "major") shape.mode = "dorian";
  }

  // Rain: drops in key, the lead steps back, the birds go quiet.
  m.density *= 1 - 0.2 * rain;
  m.lead *= 1 - 0.5 * rain;
  m.drops += 0.5 * rain;
  m.cutoff *= 1 - 0.3 * rain;
  m.birds *= 1 - rain;
  m.beds = add(m.beds, { rain: 0.9 * rain, drizzle: 0.3 * rain * (1 - s), birds: -rain }, 1);

  m.beds = add(m.beds, sc.beds ?? {});
  const style = sc.style ?? layer.style;
  return { time, rain, style, mood: m, shape };
}

/** The caption that announces a preset (T32: every sound has a text equivalent). */
export function musicCaption(p: Preset, scale: Scale): string {
  const heard = SAMPLE_BEDS.filter((b) => (p.mood.beds[b] ?? 0) > 0.05).map((b) => RECORDING[b]);
  const weather = p.rain > 0.6 ? ", rain" : p.rain > 0 ? ", light rain" : "";
  const base = `Background music: ${p.style} (${scale} scale, ${p.time}${weather}); synthesised, not a recording`;
  if (!heard.length) return `${base}.`;
  const list = heard.length > 1 ? `${heard.slice(0, -1).join(", ")} and ${heard.at(-1)}` : heard[0];
  return `${base}. Behind it, field recordings of ${list} (CC0, Freesound).`;
}

const lerpRec = <K extends string>(
  a: Partial<Record<K, number>>,
  b: Partial<Record<K, number>>,
  k: number,
) => {
  const out: Partial<Record<K, number>> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)]) as Set<K>)
    out[key] = (a[key] ?? 0) + ((b[key] ?? 0) - (a[key] ?? 0)) * k;
  return out;
};

/** A fraction `k` of the way from mood `a` to mood `b`. */
export function lerpMood(a: Mood, b: Mood, k: number): Mood {
  const out = { ...a };
  for (const key of Object.keys(b) as (keyof Mood)[]) {
    const x = a[key];
    const y = b[key];
    // Each key's type is fixed by Mood: numbers lerp, records lerp per instrument.
    (out as Record<string, unknown>)[key] =
      typeof x === "number" && typeof y === "number"
        ? x + (y - x) * k
        : lerpRec(x as Record<string, number>, y as Record<string, number>, k);
  }
  return out;
}
