/** What the painter hands to the renderer (Pixi) and to the static fallback alike. */
/** `fall`: straight down at `vx`/`vy`, back to the top past `floor` (rain). */
export type Motion = "none" | "sway" | "drift" | "breathe" | "wiggle" | "shimmer" | "fall";

export interface PlateLayer {
  id: string;
  /** Complete SVG document, rastered at `scale` device pixels per CSS pixel. */
  svg: string;
  /** 0 = fixed to the sky, 1 = moves with the foreground. */
  parallax: number;
  motion: Motion;
  blend?: "normal" | "multiply" | "screen";
  alpha?: number;
}

/** A drawn actor (organism, leaf, cloud shadow): its own small SVG, placed in plate pixels. */
export interface SpriteSpec {
  id: string;
  svg: string;
  /** Centre, CSS pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
  motion: Motion;
  /** Seeded phase so nothing moves in unison. */
  phase: number;
  parallax: number;
  rotation?: number;
  alpha?: number;
  blend?: "normal" | "multiply" | "screen";
  /** Drift velocity in px/s for `drift` sprites (wraps around the plate). */
  vx?: number;
  vy?: number;
  /** `fall` sprites wrap back to the top once they pass this y (px); default the plate bottom. */
  floor?: number;
}

/** Ambient particles: motes, bubbles, colloids, falling leaves. Never information. */
export interface ParticleSpec {
  id: string;
  kind: "mote" | "bubble" | "colloid" | "glint" | "plume" | "leaf";
  count: number;
  colour: string;
  /** Region in plate units (0..1). */
  region: { x0: number; y0: number; x1: number; y1: number };
  size: [number, number];
  alpha: [number, number];
  /** Mean velocity, px/s. */
  vx: number;
  vy: number;
  parallax: number;
}

export interface Plate {
  recipe: string;
  seed: number;
  w: number;
  h: number;
  /** Solid colour behind every layer (also the static fallback's background). */
  ground: string;
  layers: PlateLayer[];
  sprites: SpriteSpec[];
  particles: ParticleSpec[];
}
