/**
 * The chapter 13 storm as a darkening wash, not lightning (art-direction §8):
 * the wash's opacity is piecewise linear through these phases, and the panel
 * sets it from `washAt` every frame. `flashes` counts WCAG 2.3.1
 * general flashes so the test can hold the storm to at most three a second.
 */
import { W } from "../styles/scene";

export type StormPhase = "calm" | "darkening" | "raining" | "clearing" | "after";

/** Each phase: how long it lasts and the wash opacity it ends at. */
export const STORM: { phase: StormPhase; ms: number; wash: number }[] = [
  { phase: "darkening", ms: 2400, wash: 0.5 },
  { phase: "raining", ms: 3000, wash: 0.5 },
  { phase: "clearing", ms: 2400, wash: 0 },
];
export const STORM_MS = STORM.reduce((n, p) => n + p.ms, 0);

/** Wash opacity `t` ms after the storm is summoned. */
export function washAt(t: number): number {
  let start = 0;
  let from = 0;
  for (const p of STORM) {
    if (t < start + p.ms) return from + ((p.wash - from) * Math.max(0, t - start)) / p.ms;
    start += p.ms;
    from = p.wash;
  }
  return from;
}

export function phaseAt(t: number): StormPhase {
  if (t <= 0) return "calm";
  let start = 0;
  for (const p of STORM) {
    if (t < start + p.ms) return p.phase;
    start += p.ms;
  }
  return "after";
}

const channel = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const rgb = (hex: string) =>
  [16, 8, 0].map((k) => (parseInt(hex.slice(1), 16) >> k) & 255) as [number, number, number];

/** Relative luminance of the sky under the wash (the wash is `W.dark`). */
export function skyLuminance(wash: number, sky = W.skyLow): number {
  const [a, b] = [rgb(sky), rgb(W.dark)];
  const [r, g, bl] = a.map((v, i) => v + (b[i]! - v) * wash) as [number, number, number];
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(bl);
}

/**
 * WCAG 2.3.1: a general flash is a pair of opposing luminance changes of 10 %
 * or more of the brighter value, where the darker is below 0.80. Returns the
 * most flashes in any one-second window of `lum`, sampled every `dtMs`.
 */
export function maxFlashesPerSecond(lum: number[], dtMs: number): number {
  // Turning points: the luminance swings between local extremes.
  const ext: { i: number; v: number }[] = [];
  for (let i = 0; i < lum.length; i++) {
    const v = lum[i]!;
    const prev = ext.at(-1);
    if (!prev) ext.push({ i, v });
    else if (ext.length === 1) {
      if (v !== prev.v) ext.push({ i, v });
    } else {
      const dir = Math.sign(prev.v - ext.at(-2)!.v);
      if (Math.sign(v - prev.v) === dir) ext[ext.length - 1] = { i, v };
      else if (v !== prev.v) ext.push({ i, v });
    }
  }
  const swings = ext.slice(1).flatMap((e, k) => {
    const a = ext[k]!.v;
    const [hi, lo] = [Math.max(a, e.v), Math.min(a, e.v)];
    return hi - lo >= 0.1 * hi && lo < 0.8 ? [e.i] : [];
  });
  // A flash is two opposing swings; count swings in each window and halve.
  const window = Math.round(1000 / dtMs);
  let most = 0;
  for (let k = 0; k < swings.length; k++) {
    const n = swings.filter((i) => i >= swings[k]! && i < swings[k]! + window).length;
    most = Math.max(most, Math.floor(n / 2));
  }
  return most;
}
