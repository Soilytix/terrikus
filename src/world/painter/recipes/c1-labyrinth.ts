/** Chapter 1 pore labyrinth: the `LABYRINTH` film graph drawn as a cave of grains, in moist soil. */
import { LABYRINTH, held } from "../../../sim/films";
import { W } from "../../../styles/scene";
import { blob, blurDef, grain, radial, range, shaded, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { amoeba, bacterium } from "../sprites";
import { Svg } from "../svg";
import type { SpriteSpec } from "../types";
import type { RecipeOut } from "./index";

/** Distance from a point to a segment, px. */
function toSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

export function c1Labyrinth(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 13);
  const at = (id: string) => {
    const s = LABYRINTH.sites.find((x) => x.id === id)!;
    return { x: s.x * w, y: s.y * h, rad: u * (0.02 + Math.log2(s.width) * 0.012) };
  };

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(back, [
      [0, mix(W.deep, W.topsoil, 0.4)],
      [1, W.dark],
    ])})"`,
  );

  // Water: films along held necks, pools in the pores; a drained neck is a dashed scar.
  const film = new Svg(w, h);
  const glow = blurDef(film, u * 0.01);
  for (const n of LABYRINTH.necks) {
    const a = at(n.a);
    const b = at(n.b);
    const d = `M${a.x},${a.y}L${b.x},${b.y}`;
    if (held(n, "moist")) {
      film.path(
        d,
        `stroke="${W.water}" stroke-width="${u * 0.035}" stroke-linecap="round" opacity="0.5" filter="url(#${glow})"`,
      );
      film.path(
        d,
        `stroke="${mix(W.film, W.water, 0.3)}" stroke-width="${u * 0.008}" stroke-linecap="round" opacity="0.8"`,
      );
    } else
      film.path(
        d,
        `stroke="${W.stone1}" stroke-width="${u * 0.006}" stroke-dasharray="${u * 0.012} ${u * 0.016}" opacity="0.7"`,
      );
  }
  for (const s of LABYRINTH.sites) {
    const p = at(s.id);
    film.path(
      blob(r, p.x, p.y, p.rad, p.rad * 0.85, 0.2),
      `fill="${mix(W.water, W.deep, 0.45)}" stroke="${W.film}" stroke-width="1" opacity="0.85"`,
    );
  }

  // Grains fill everything that is not pore or film.
  const grains = new Svg(w, h);
  const tones = [W.sand, mix(W.sand, W.subsoil, 0.5), W.subsoil, mix(W.clay, W.sand, 0.3)];
  const placed: { x: number; y: number; rad: number }[] = [];
  for (let tries = 0; tries < 2500 && placed.length < 50; tries++) {
    const x = range(r, -0.05, 1.05) * w;
    const y = range(r, -0.05, 1.05) * h;
    const rad = u * range(r, 0.035, 0.08);
    if (LABYRINTH.sites.some((s) => Math.hypot(x - s.x * w, y - s.y * h) < rad + at(s.id).rad * 1.2))
      continue;
    if (
      LABYRINTH.necks.some((n) => {
        const a = at(n.a);
        const b = at(n.b);
        return toSegment(x, y, a.x, a.y, b.x, b.y) < rad + u * 0.025;
      })
    )
      continue;
    if (placed.some((g) => Math.hypot(x - g.x, y - g.y) < (rad + g.rad) * 0.92)) continue;
    placed.push({ x, y, rad });
    const tone = tones[Math.floor(r() * tones.length)]!;
    shaded(grains, grain(r, x, y, rad), tone, mix(tone, W.pale, 0.4), mix(tone, W.dark, 0.6));
  }

  const sprites: SpriteSpec[] = [];
  const entry = at("entry");
  sprites.push(
    amoeba(
      { id: "amoeba", x: entry.x, y: entry.y, motion: "wiggle", phase: 0.2, parallax: 0.5, scale },
      r,
      u * 0.03,
    ),
  );
  for (const s of LABYRINTH.sites.filter((x) => x.cells !== undefined)) {
    const p = at(s.id);
    for (let k = 0; k < 3; k++)
      sprites.push(
        bacterium(
          {
            id: `${s.id}-${k}`,
            x: p.x + range(r, -0.5, 0.5) * p.rad,
            y: p.y + range(r, -0.4, 0.4) * p.rad,
            motion: "breathe",
            phase: r(),
            parallax: 0.5,
            scale,
            rotation: r() * 3,
          },
          u * (s.width < 10 ? 0.008 : 0.014),
        ),
      );
  }

  return {
    ground: W.dark,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.15, motion: "none" },
      { id: "film", svg: film.toString(scale), parallax: 0.5, motion: "shimmer" },
      { id: "grains", svg: grains.toString(scale), parallax: 0.5, motion: "none" },
    ],
    sprites,
    particles: [],
  };
}
