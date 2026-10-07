/**
 * Chapter 11 pit wall: the woodland pit on the hilltop, its horizons where
 * `profileAt` puts them for the summit's factors. `pitWall(years)` paints the
 * same wall at an earlier age for the pedogenesis time-lapse; the seed fixes
 * grains and roots so only the soil's own change shows between frames.
 */
import { CATENA, type Redox } from "../../../sim/catena";
import { DEPTH_CM, PIT_BOTTOM, PIT_TOP, pitY, profileAt, type Horizon } from "../../../sim/pedogenesis";
import { W } from "../../../styles/scene";
import { blob, linear, range, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor, type Rng } from "../noise";
import { Svg, smoothOpen, type Pt } from "../svg";
import type { Recipe } from "./index";

const PIGMENT: Record<Horizon["colour"], string> = {
  humus: W.humus,
  topsoil: W.topsoil,
  loam: mix(W.loam, W.subsoil, 0.4),
  pale: mix(W.pale, W.sand, 0.35),
  oxide: mix(W.oxide, W.loam, 0.25),
  subsoil: W.subsoil,
  sand: W.sand,
  clay: W.clay,
};

/**
 * Horizons as bands in a box (pixels): wavy boundaries, grain stipple, then
 * redox: a grey matrix from `greyFrom` down and rust mottles in the fluctuating zone.
 */
export function paintProfile(
  s: Svg,
  c: Ctx,
  r: Rng,
  box: { x0: number; x1: number; y0: number; y1: number },
  horizons: Horizon[],
  rx: Redox = {},
  detail = 1,
) {
  const y = (cm: number) => box.y0 + (cm / DEPTH_CM) * (box.y1 - box.y0);
  const span = box.x1 - box.x0;
  const edge = (cm: number, salt: number): Pt[] =>
    Array.from({ length: 13 }, (_, i) => [
      box.x0 + (i / 12) * span,
      y(cm) + (cm > 0 ? (c.noise(i * 0.6, salt) - 0.5) * span * 0.05 : 0),
    ]);
  for (const [k, hz] of horizons.entries()) {
    const top = edge(hz.top, k);
    const path = smoothOpen(top) + `L${box.x1},${box.y1}L${box.x0},${box.y1}Z`;
    s.path(path, `fill="${PIGMENT[hz.colour]}"`);
  }
  if (rx.greyFrom !== undefined) {
    const top = edge(rx.greyFrom, 40);
    s.path(smoothOpen(top) + `L${box.x1},${box.y1}L${box.x0},${box.y1}Z`, `fill="${W.gley}" opacity="0.85"`);
  }
  const area = span * (box.y1 - box.y0);
  stipple(
    s,
    c,
    r,
    Math.round((area / (c.w * c.h)) * 1400 * detail),
    { x0: box.x0 / c.w, y0: box.y0 / c.h, x1: box.x1 / c.w, y1: box.y1 / c.h },
    [W.sand, W.stone1, mix(W.pale, W.sand, 0.5), W.dark],
    [span * 0.002, span * 0.006],
    () => 1,
    [0.15, 0.4],
  );
  if (rx.mottles) {
    const [a, b] = rx.mottles;
    const n = Math.round(((b - a) / DEPTH_CM) * 70 * detail);
    for (let i = 0; i < n; i++) {
      const mx = range(r, box.x0 + span * 0.04, box.x1 - span * 0.04);
      const my = range(r, y(a), y(b));
      const rad = span * range(r, 0.02, 0.04);
      s.path(
        blob(r, mx, my, rad, rad * 0.7, 0.4),
        `fill="${W.oxide}" opacity="${range(r, 0.6, 0.9).toFixed(2)}"`,
      );
    }
  }
}

/** The summit pit at `years` (0 is bare parent material just exposed). */
export const pitWall =
  (years: number): Recipe =>
  (c, scale) => {
    const { w, h, u } = c;
    const summit = CATENA[0]!;
    const horizons = profileAt({ ...summit.factors, years });
    const age = years / 10_000;
    const top = PIT_TOP * h;
    const x0 = 0.06 * w;
    const x1 = 0.94 * w;

    // Behind the pit: the dark of the hole and the woodland beyond.
    const back = new Svg(w, h);
    back.rect(
      0,
      0,
      w,
      h,
      `fill="url(#${linear(back, [
        [0, mix(W.skyHigh, W.foliage, 0.25)],
        [PIT_TOP - 0.02, mix(W.skyLow, W.foliage, 0.4)],
        [PIT_TOP, mix(W.dark, W.topsoil, 0.6)],
        [1, W.dark],
      ])})"`,
    );

    const face = new Svg(w, h);
    paintProfile(face, c, rngFor(c.seed, 3), { x0, x1, y0: top, y1: PIT_BOTTOM * h }, horizons, {}, 1);
    // Pit edges in shadow (art-direction: hero-dark at 40 % behind the pit).
    face.rect(0, top, x0, h - top, `fill="${W.dark}" opacity="0.4"`);
    face.rect(x1, top, w - x1, h - top, `fill="${W.dark}" opacity="0.4"`);

    // Roots through O and A (and a few deeper as the wood matures); stones in C.
    const detail = new Svg(w, h);
    const r = rngFor(c.seed, 5);
    const rootDepth =
      pitY(Math.max(...horizons.filter((x) => x.id !== "C").map((x) => x.bottom), 0) + 15) * h;
    const roots = Math.round(24 * Math.min(1, age * 4 + (years > 0 ? 0.2 : 0)));
    for (let i = 0; i < 24; i++) {
      const x = range(r, x0, x1);
      const len = range(r, 0.3, 1) * (rootDepth - top);
      const sw = u * range(r, 0.002, 0.006);
      const pts: Pt[] = Array.from({ length: 6 }, (_, k) => [
        x + (c.noise(k * 0.8, i) - 0.5) * u * 0.08,
        top + (k / 5) * len,
      ]);
      if (i < roots)
        detail.path(
          smoothOpen(pts),
          `fill="none" stroke="${mix(W.sand, W.pale, 0.3)}" stroke-width="${sw.toFixed(1)}" stroke-linecap="round" opacity="0.75"`,
        );
    }
    const cTop = pitY(horizons.at(-1)!.top) * h;
    for (let i = 0; i < 14; i++) {
      const sx = range(r, x0, x1);
      const sy = range(r, Math.max(cTop, top) + u * 0.02, PIT_BOTTOM * h - u * 0.02);
      const rad = u * range(r, 0.008, 0.02);
      detail.path(blob(r, sx, sy, rad, rad * 0.75, 0.3), `fill="${mix(W.stone1, W.sand, 0.3)}"`);
    }

    // The surface: pioneer plants first, then pines.
    const crown = new Svg(w, h);
    const trees = Math.round(6 * Math.min(1, age * 10));
    for (let i = 0; i < 6; i++) {
      const tx = range(r, 0.05, 0.95) * w;
      const th = u * range(r, 0.1, 0.18) * Math.min(1, 0.4 + age * 6);
      if (i >= trees) continue;
      crown.path(
        `M${tx},${top}L${tx},${top - th}`,
        `stroke="${mix(W.dark, W.loam, 0.4)}" stroke-width="${u * 0.01}"`,
      );
      for (let k = 0; k < 3; k++) {
        const ky = top - th * (0.35 + k * 0.25);
        const kw = th * (0.38 - k * 0.09);
        crown.path(
          `M${tx - kw},${ky}L${tx},${ky - th * 0.35}L${tx + kw},${ky}Z`,
          `fill="${mix(W.foliage, W.dark, 0.25 + k * 0.08)}"`,
        );
      }
    }
    const tufts = years === 0 ? 0 : 30;
    for (let i = 0; i < tufts; i++) {
      const x = range(r, 0, 1) * w;
      const ht = u * range(r, 0.015, 0.035);
      crown.path(
        `M${x},${top}l${-ht * 0.3},${-ht}M${x},${top}l${ht * 0.3},${-ht}`,
        `fill="none" stroke="${mix(W.foliage, W.sand, 0.3)}" stroke-width="${u * 0.004}" stroke-linecap="round"`,
      );
    }

    return {
      ground: W.dark,
      layers: [
        { id: "back", svg: back.toString(scale), parallax: 0.2, motion: "none" },
        { id: "face", svg: face.toString(scale), parallax: 0.5, motion: "none" },
        { id: "detail", svg: detail.toString(scale), parallax: 0.5, motion: "none" },
        { id: "crown", svg: crown.toString(scale), parallax: 0.55, motion: "sway" },
      ],
      sprites: [],
      particles: [],
    };
  };

/** The woodland pit as the scene shows it: ten thousand years on. */
export const c11Pit = pitWall(10_000);
