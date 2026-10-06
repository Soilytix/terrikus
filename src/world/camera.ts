/**
 * Camera maths shared by the Pixi stage and the DOM hotspot layer, so both
 * always agree where a plate point is on screen (spec §4.2). Pure; tested.
 */
export interface View {
  /** Zoom within the current scale node, 1 = whole plate. */
  z: number;
  /** Camera centre in plate units (0..1). */
  cx: number;
  cy: number;
}

export const MIN_Z = 1;
export const MAX_Z = 3;
export const HOME: View = { z: 1, cx: 0.5, cy: 0.5 };

/** Keep the plate covering the viewport at every zoom. */
export function clampView(v: View): View {
  const z = Math.min(MAX_Z, Math.max(MIN_Z, v.z));
  const half = 0.5 / z;
  return { z, cx: Math.min(1 - half, Math.max(half, v.cx)), cy: Math.min(1 - half, Math.max(half, v.cy)) };
}

/** CSS transform (translate then scale, origin top-left) that maps plate px to screen px. */
export function viewTransform(v: View, w: number, h: number): { s: number; tx: number; ty: number } {
  return { s: v.z, tx: w / 2 - v.cx * w * v.z, ty: h / 2 - v.cy * h * v.z };
}

/** Log-space interpolation of zoom: a ×100 jump feels as even as a ×10 one (art-direction §5.2). */
export function logLerp(a: number, b: number, t: number): number {
  return Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t);
}

export const easeChart = (t: number): number => 1 - Math.pow(1 - t, 3);
