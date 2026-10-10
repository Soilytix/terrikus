/**
 * The dev control surface (ported from soil-beats): an 8×8 grid, a top row and a
 * side column, laid out like a Launchpad Mini MK3. The on-screen overlay and the
 * hardware both render this one frame of palette indices.
 */
import type { Music, Mute } from "./engine";
import { KEYS, TIMES } from "./presets";

export const MUTES: Mute[] = ["kick", "snare", "hat", "keys", "bass", "lead", "texture", "tape"];
export const ACTIONS = [
  ["drums", "mutate drums"],
  ["motif", "new motif"],
  ["modulate4", "key up a 4th"],
  ["breakdown", "breakdown"],
  ["time", "time of day: scene → dawn → day → dusk → night"],
  ["rain", "rain: scene → on → off"],
  ["keys", "solo keys timbre: preset → each voice"],
  ["evolve", "auto-evolve on/off"],
] as const;
export const TOP = [
  "tempo +",
  "tempo −",
  "swing −",
  "swing +",
  "play / pause",
  "density −",
  "density +",
  "new seed",
];
export const CUTOFFS = [600, 1000, 1600, 2400, 3200, 4200, 6000, 9000];
const LANE_ROWS = [
  ["hat", 2],
  ["snare", 4],
  ["kick", 6],
] as const;
const COLORS: Record<Mute, [number, number]> = {
  kick: [5, 7],
  snare: [9, 11],
  hat: [13, 15],
  keys: [45, 47],
  bass: [53, 55],
  lead: [37, 39],
  texture: [3, 1],
  tape: [21, 23],
};
const TIME_COLOR = { dawn: 9, day: 13, dusk: 5, night: 45 } as const;

export type Press =
  { kind: "top"; col: number } | { kind: "side"; row: number } | { kind: "grid"; row: number; col: number };
export interface Frame {
  grid: number[][];
  top: number[];
  side: number[];
}

export function frame(m: Music, step: number, flash: { row: number; col: number } | null): Frame {
  const c = m.composer;
  const o = m.over;
  const grid = Array.from({ length: 8 }, () => Array<number>(8).fill(0));
  MUTES.forEach((x, i) => (grid[0]![i] = COLORS[x][o.mutes[x] ? 1 : 0]));
  const action = (a: (typeof ACTIONS)[number][0]) => {
    if (a === "evolve") return c.evolve ? 21 : 23;
    if (a === "time") return o.time ? TIME_COLOR[o.time] : 47;
    if (a === "rain") return o.rain === null ? 47 : o.rain ? 37 : 39;
    if (a === "keys") return o.keys ? 53 : 47;
    return 47;
  };
  ACTIONS.forEach(([a], i) => (grid[1]![i] = action(a)));
  for (const [lane, r0] of LANE_ROWS)
    for (let s = 0; s < 16; s++) {
      const on = c.drums[lane][s] || (lane === "hat" && c.drums.ohat[s]);
      grid[r0 + (s >> 3)]![s % 8] = s === step ? (on ? 3 : 1) : on ? COLORS[lane][0] : 0;
    }
  if (flash) grid[flash.row]![flash.col] = 3;
  const top = [1, 1, 1, 1, m.playing ? 21 : 5, 1, 1, 53];
  let level = -1;
  CUTOFFS.forEach((f, i) => f <= (o.cutoff ?? c.mood.cutoff) && (level = i));
  const side = Array.from({ length: 8 }, (_, r) => (7 - r <= level ? (o.cutoff ? 37 : 39) : 0));
  return { grid, top, side };
}

const cycle = <T>(list: readonly T[], v: T | null): T | null => {
  const i = v === null ? -1 : list.indexOf(v);
  return i + 1 < list.length ? list[i + 1]! : null;
};

/** One press on the screen or the hardware. Returns whether to flash it. */
export function press(m: Music, p: Press, toggle: () => void): boolean {
  const c = m.composer;
  const o = m.over;
  if (p.kind === "top") {
    const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
    [
      () => (o.tempo += 2),
      () => (o.tempo -= 2),
      () => (o.swing = clamp(o.swing - 0.02, -0.1, 0.15)),
      () => (o.swing = clamp(o.swing + 0.02, -0.1, 0.15)),
      toggle,
      () => (o.density = clamp(o.density - 0.1, 0, 2)),
      () => (o.density = clamp(o.density + 0.1, 0, 2)),
      () => m.reseed(),
    ][p.col]?.();
    return false;
  }
  if (p.kind === "side") {
    const f = CUTOFFS[7 - p.row]!;
    o.cutoff = o.cutoff === f ? null : f;
    return false;
  }
  if (p.row === 0) {
    const x = MUTES[p.col]!;
    o.mutes[x] = !o.mutes[x];
    return false;
  }
  if (p.row === 1) {
    const a = ACTIONS[p.col]![0];
    if (a === "evolve") c.evolve = !c.evolve;
    else if (a === "drums") c.mutateDrums(true);
    else if (a === "time") {
      o.time = cycle(TIMES, o.time);
      m.retarget();
    } else if (a === "rain") {
      o.rain = o.rain === null ? 1 : o.rain ? 0 : null;
      m.retarget();
    } else if (a === "keys") o.keys = cycle(KEYS, o.keys);
    else c.trigger(a);
    return true;
  }
  const lane = p.row < 4 ? "hat" : p.row < 6 ? "snare" : "kick";
  c.toggleStep(lane, (p.row % 2 ? 8 : 0) + p.col);
  return false;
}

export function title(p: Press): string {
  if (p.kind === "top") return TOP[p.col]!;
  if (p.kind === "side") return `filter ${CUTOFFS[7 - p.row]} Hz (again: preset)`;
  if (p.row === 0) return `mute ${MUTES[p.col]}`;
  if (p.row === 1) return ACTIONS[p.col]![1];
  return `${p.row < 4 ? "hat" : p.row < 6 ? "snare" : "kick"} step ${(p.row % 2 ? 8 : 0) + p.col + 1}`;
}
