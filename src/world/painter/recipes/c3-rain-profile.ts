/**
 * Chapter 3 rain on the profile: a cut through the spinach field mid-storm.
 * The matrix front and the burrow fingers are drawn where `infiltrate` puts
 * them after half an hour of rain; wet soil is darker (Munsell value).
 */
import { BURROWS, PROFILE_CM, infiltrate } from "../../../sim/water";
import { W } from "../../../styles/scene";
import { blurDef, linear, range, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg, smoothOpen, type Pt } from "../svg";
import { raindrop } from "../sprites";
import type { SpriteSpec } from "../types";
import type { RecipeOut } from "./index";

/** The surface line, plate units; the profile below it is `PROFILE_CM` deep. */
const SURFACE = 0.16;
/** Burrow centres, plate units. */
const BURROW_X = [0.48, 0.62, 0.8].slice(0, BURROWS);

export function c3RainProfile(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 19);
  const state = infiltrate(BURROWS)[3]!;
  const depthY = (cm: number) => (SURFACE + (cm / PROFILE_CM) * (1 - SURFACE)) * h;
  const edge = (y: number, salt: number, amp = 0.012): Pt[] =>
    Array.from({ length: 31 }, (_, i) => [(i / 30) * w, y + (c.noise(i * 0.5, salt) - 0.5) * amp * h]);

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.skyHigh, W.stone1, 0.55)],
      [SURFACE, mix(W.stone1, W.topsoil, 0.5)],
      [SURFACE + 0.01, W.topsoil],
      [0.55, mix(W.loam, W.subsoil, 0.5)],
      [1, W.subsoil],
    ])})"`,
  );

  // Horizons and stipple, dry colours.
  const face = new Svg(w, h);
  stipple(
    face,
    c,
    r,
    900,
    { x0: 0, y0: SURFACE, x1: 1, y1: 1 },
    [W.sand, W.stone1, mix(W.loam, W.pale, 0.2)],
    [u * 0.002, u * 0.006],
  );
  face.path(
    smoothOpen(edge(0.5 * h, 4)) + `L${w},${h}L0,${h}Z`,
    `fill="${mix(W.subsoil, W.loam, 0.2)}" opacity="0.35"`,
  );

  // Wet soil: the matrix front, then fingers down each burrow.
  const wet = new Svg(w, h);
  const soft = blurDef(wet, u * 0.006);
  const front = depthY(state.front);
  wet.path(
    `M0,${SURFACE * h}L${w},${SURFACE * h}` + "L" + smoothOpen(edge(front, 7).reverse()).slice(1) + "Z",
    `fill="${W.humus}" opacity="0.55" filter="url(#${soft})"`,
  );
  const deepest = depthY(state.deepest);
  for (const bx of BURROW_X) {
    const x = bx * w;
    const pts: Pt[] = Array.from({ length: 9 }, (_, k) => [
      x + (c.noise(k * 0.7, bx * 10) - 0.5) * u * 0.04,
      SURFACE * h + (k / 8) * (depthY(100) - SURFACE * h),
    ]);
    const path = smoothOpen(pts);
    wet.path(
      path,
      `fill="none" stroke="${W.humus}" stroke-width="${u * 0.04}" opacity="0.5" filter="url(#${soft})"`,
    );
    wet.path(path, `fill="none" stroke="${W.dark}" stroke-width="${u * 0.014}" stroke-linecap="round"`);
    // The finger reaches as deep as the water has run.
    const finger = pts.filter(([, y]) => y <= deepest);
    wet.path(
      smoothOpen(finger),
      `fill="none" stroke="${mix(W.water, W.deep, 0.4)}" stroke-width="${u * 0.006}" opacity="0.8"`,
    );
  }

  // Crop at the surface and rain above it.
  const top = new Svg(w, h);
  for (let i = 0; i < 18; i++) {
    const x = range(r, 0.02, 0.98) * w;
    const y = SURFACE * h;
    const ht = u * range(r, 0.04, 0.08);
    top.path(
      `M${x},${y}Q${x - ht * 0.4},${y - ht * 0.6} ${x - ht * 0.7},${y - ht}M${x},${y}Q${x + ht * 0.4},${y - ht * 0.6} ${x + ht * 0.7},${y - ht}`,
      `fill="none" stroke="${W.foliage}" stroke-width="${u * 0.008}" stroke-linecap="round"`,
    );
  }
  // Rain: falling streaks that stop at the surface; still where motion is off.
  const drops: SpriteSpec[] = [];
  for (let i = 0; i < 70; i++) {
    const x = range(r, 0, 1) * w;
    const y = range(r, 0, SURFACE - 0.02) * h;
    const vy = u * (0.7 + (0.3 * ((i * 7) % 5)) / 5);
    const place = {
      id: `drop-${i}`,
      x,
      y,
      motion: "fall" as const,
      phase: 0,
      parallax: 0.6,
      scale,
      vx: -vy * 0.2,
      vy,
    };
    drops.push(raindrop(place, u * 0.03, (SURFACE - 0.01) * h));
  }

  return {
    ground: W.topsoil,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.2, motion: "none" },
      { id: "face", svg: face.toString(scale), parallax: 0.5, motion: "none" },
      { id: "wet", svg: wet.toString(scale), parallax: 0.5, motion: "none" },
      { id: "top", svg: top.toString(scale), parallax: 0.55, motion: "sway" },
    ],
    sprites: drops,
    particles: [],
  };
}
