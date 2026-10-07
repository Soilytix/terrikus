/**
 * Chapter 3 draining cave: the `DRAIN_PORES` of `src/sim/water.ts` after a dry
 * week (−100 kPa), widest drained and filmed, narrowest still full of water.
 */
import { DRAIN_PORES, drained } from "../../../sim/water";
import { W } from "../../../styles/scene";
import { blob, blurDef, grain, radial, range, shaded, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { amoeba } from "../sprites";
import { Svg } from "../svg";
import type { RecipeOut } from "./index";

/** The plate shows the cave at this potential. */
const PSI = -100;

export function c3Drain(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 17);
  const gone = new Set(drained(DRAIN_PORES, PSI));
  const at = DRAIN_PORES.map((p) => ({
    ...p,
    px: p.x * w,
    py: p.y * h,
    rad: u * (0.025 + Math.log10(p.width * 10) * 0.022),
  }));

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(back, [
      [0, mix(W.deep, W.topsoil, 0.35)],
      [1, W.dark],
    ])})"`,
  );

  // Drained pores hold air behind a thin film; full ones are water to the rim.
  const film = new Svg(w, h);
  const glow = blurDef(film, u * 0.008);
  for (const p of at) {
    const d = blob(r, p.px, p.py, p.rad, p.rad * 0.8, 0.22);
    if (gone.has(p.id)) {
      film.path(d, `fill="${mix(W.dark, W.stone2, 0.4)}" opacity="0.9"`);
      film.path(d, `fill="none" stroke="${W.film}" stroke-width="${u * 0.006}" opacity="0.7"`);
    } else {
      film.path(d, `fill="${W.water}" opacity="0.55" filter="url(#${glow})"`);
      film.path(d, `fill="${mix(W.water, W.deep, 0.35)}" stroke="${W.film}" stroke-width="1" opacity="0.85"`);
    }
  }

  const grains = new Svg(w, h);
  const tones = [W.sand, mix(W.sand, W.subsoil, 0.5), W.subsoil, mix(W.clay, W.sand, 0.3)];
  const placed: { x: number; y: number; rad: number }[] = [];
  for (let tries = 0; tries < 2500 && placed.length < 46; tries++) {
    const x = range(r, -0.05, 1.05) * w;
    const y = range(r, -0.05, 1.05) * h;
    const rad = u * range(r, 0.035, 0.08);
    if (at.some((p) => Math.hypot(x - p.px, y - p.py) < rad + p.rad * 1.15)) continue;
    if (placed.some((g) => Math.hypot(x - g.x, y - g.y) < (rad + g.rad) * 0.92)) continue;
    placed.push({ x, y, rad });
    const tone = tones[Math.floor(r() * tones.length)]!;
    shaded(grains, grain(r, x, y, rad), tone, mix(tone, W.pale, 0.4), mix(tone, W.dark, 0.6));
    // Every grain keeps a film, however dry the cave.
    grains.path(
      grain(r, x, y, rad * 1.04),
      `fill="none" stroke="${W.film}" stroke-width="${u * 0.003}" opacity="0.45"`,
    );
  }

  const start = at.find((p) => p.id === "meso")!;
  return {
    ground: W.dark,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.15, motion: "none" },
      { id: "film", svg: film.toString(scale), parallax: 0.5, motion: "shimmer" },
      { id: "grains", svg: grains.toString(scale), parallax: 0.5, motion: "none" },
    ],
    sprites: [
      amoeba(
        {
          id: "amoeba",
          x: start.px,
          y: start.py + start.rad * 1.6,
          motion: "wiggle",
          phase: 0.4,
          parallax: 0.5,
          scale,
        },
        r,
        u * 0.026,
      ),
    ],
    particles: [],
  };
}
