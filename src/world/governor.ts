/**
 * Quality governor (spec §8), time-based: while the median frame over the last
 * 2 s stays above 33 ms, step down one level at a time — ambient shaders, then
 * particles, then the static plate. Labels and hotspots are never touched.
 */

/** 0 full, 1 no ambient shaders, 2 no particles, 3 static plate. */
export type Level = 0 | 1 | 2 | 3;

export interface Governor {
  level: Level;
  /** Frame times (ms) covering the last WINDOW_MS. */
  frames: number[];
  /** Ms of frames seen since the last step. */
  since: number;
}

export const WINDOW_MS = 2000;
export const BUDGET_MS = 33;
/** Time a step gets to take effect before the next one. */
export const HOLD_MS = 1000;
/** One long frame (a scene being painted) is not a trend. */
export const MIN_FRAMES = 5;

export const initialGovernor = (): Governor => ({ level: 0, frames: [], since: 0 });

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

export function govern(g: Governor, ms: number): Governor {
  if (g.level === 3) return g;
  const frames = [...g.frames, ms];
  let sum = frames.reduce((a, b) => a + b, 0);
  while (frames.length > MIN_FRAMES && sum - frames[0]! >= WINDOW_MS) sum -= frames.shift()!;
  const since = g.since + ms;
  if (frames.length >= MIN_FRAMES && sum >= WINDOW_MS && since >= HOLD_MS && median(frames) > BUDGET_MS) {
    return { level: (g.level + 1) as Level, frames, since: 0 };
  }
  return { level: g.level, frames, since };
}
