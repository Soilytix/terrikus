/**
 * Chapter 12 twin fields: two spinach fields split by a grass track, the left
 * ploughed bare, the right under a cover-crop mulch, with one cutaway running
 * under both: broken crumbs and cut worm channels on the left, loose crumbs
 * and unbroken channels on the right.
 */
import { W } from "../../../styles/scene";
import { linear, range, ridge, strokes, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";
import { crumb, rosette } from "./plants";

/** Surface line and the top of the cutaway, as fractions of the plate height. */
const SURFACE = 0.52;
const CUT = 0.6;
const PLOUGH = 0.76;

export function c12TwinFields(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 12);

  const sky = new Svg(w, h);
  sky.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(sky, [
      [0, W.skyHigh],
      [0.5, W.skyLow],
    ])})"`,
  );
  sky.path(ridge(c, 0.3 * h, u * 0.025, 1.1, 5), `fill="${mix(W.foliage, W.skyHigh, 0.55)}"`);
  sky.path(ridge(c, 0.36 * h, u * 0.02, 1.7, 9), `fill="${mix(W.foliage, W.skyLow, 0.35)}"`);

  // Both fields recede to the hedge line; the track runs up the middle.
  const fields = new Svg(w, h);
  const top = 0.38 * h;
  fields.rect(0, top, w, SURFACE * h - top + u * 0.02, `fill="${mix(W.loam, W.sand, 0.15)}"`);
  fields.rect(w / 2, top, w / 2, SURFACE * h - top + u * 0.02, `fill="${mix(W.loam, W.subsoil, 0.35)}"`);
  // Furrows on the left: long dark ridges converging on the horizon.
  for (let i = 0; i < 18; i++) {
    const y = top + ((i + 1) / 19) ** 1.6 * (SURFACE * h - top);
    fields.path(
      `M0,${y}L${w * 0.48},${y - u * 0.004}`,
      `stroke="${mix(W.humus, W.loam, 0.4)}" stroke-width="${u * (0.002 + 0.006 * (i / 18))}" opacity="0.7"`,
    );
  }
  // Mulch on the right: brown stems lying every way, spinach coming through.
  strokes(
    fields,
    c,
    r,
    420,
    { x0: 0.52, y0: 0.39, x1: 1, y1: SURFACE },
    [mix(W.subsoil, W.sand, 0.4), mix(W.clay, W.sand, 0.3), mix(W.foliage, W.subsoil, 0.6)],
    [u * 0.015, u * 0.04],
    [u * 0.002, u * 0.004],
    () => range(r, -0.4, 0.4),
  );
  for (let i = 0; i < 14; i++) {
    const t = range(r, 0.15, 1);
    rosette(fields, r, range(r, 0.55, 0.98) * w, top + t * (SURFACE * h - top), u * 0.012 * (0.5 + t), 0.6);
  }
  // The grass track between them.
  fields.path(
    `M${w * 0.495},${top}L${w * 0.505},${top}L${w * 0.53},${SURFACE * h + u * 0.02}L${w * 0.47},${SURFACE * h + u * 0.02}Z`,
    `fill="${mix(W.foliage, W.sand, 0.25)}"`,
  );

  // The cutaway: one block of soil under both fields.
  const below = new Svg(w, h);
  below.rect(
    0,
    CUT * h,
    w,
    h - CUT * h,
    `fill="url(#${linear(below, [
      [0, W.topsoil],
      [0.6, mix(W.topsoil, W.subsoil, 0.4)],
      [1, mix(W.subsoil, W.dark, 0.2)],
    ])})"`,
  );
  below.rect(0, (SURFACE + 0.02) * h, w, (CUT - SURFACE - 0.02) * h, `fill="${mix(W.topsoil, W.loam, 0.4)}"`);
  // Plough sole on the left: a sharp change where the slice stopped.
  below.path(
    `M0,${PLOUGH * h}L${w * 0.48},${PLOUGH * h}`,
    `stroke="${mix(W.subsoil, W.stone1, 0.5)}" stroke-width="${u * 0.012}" opacity="0.8"`,
  );
  // Crumbs: small and broken on the left, rounded and loose on the right.
  for (let i = 0; i < 70; i++) {
    const left = i % 2 === 0;
    const x = (left ? range(r, 0.02, 0.46) : range(r, 0.54, 0.98)) * w;
    const y = range(r, CUT + 0.02, left ? PLOUGH - 0.01 : 0.94) * h;
    const base = mix(W.topsoil, W.humus, left ? 0.1 : 0.45);
    crumb(below, r, x, y, u * (left ? range(r, 0.006, 0.012) : range(r, 0.012, 0.024)), base);
  }
  // Worm channels: cut at the plough sole on the left, unbroken from the surface on the right.
  const channel = (x: number, y0: number, y1: number) => {
    const pts: Pt[] = Array.from({ length: 7 }, (_, k) => [
      x + Math.sin(k * 1.3 + x) * u * 0.012,
      y0 + ((y1 - y0) * k) / 6,
    ]);
    below.path(
      smoothOpen(pts),
      `fill="none" stroke="${W.dark}" stroke-width="${u * 0.008}" stroke-linecap="round" opacity="0.75"`,
    );
  };
  for (const x of [0.12, 0.3, 0.41]) channel(x * w, PLOUGH * h + u * 0.01, range(r, 0.88, 0.98) * h);
  for (const x of [0.6, 0.74, 0.9]) channel(x * w, (SURFACE + 0.01) * h, range(r, 0.9, 0.99) * h);
  // Roots under the spinach on the right.
  for (let i = 0; i < 6; i++) {
    const x = range(r, 0.56, 0.97) * w;
    below.path(
      smoothOpen([
        [x, (SURFACE + 0.01) * h],
        [x + range(r, -1, 1) * u * 0.02, range(r, 0.68, 0.74) * h],
        [x + range(r, -1, 1) * u * 0.03, range(r, 0.8, 0.9) * h],
      ]),
      `fill="none" stroke="${mix(W.pale, W.sand, 0.4)}" stroke-width="${u * 0.003}" opacity="0.8"`,
    );
  }

  return {
    ground: W.topsoil,
    layers: [
      { id: "sky", svg: sky.toString(scale), parallax: 0.05, motion: "none" },
      { id: "fields", svg: fields.toString(scale), parallax: 0.35, motion: "none" },
      { id: "below", svg: below.toString(scale), parallax: 0.5, motion: "none" },
    ],
    sprites: [],
    particles: [],
  };
}
