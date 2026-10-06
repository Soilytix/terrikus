/**
 * The seeded painter (spec §4, art-direction §6.1). Same recipe, seed and size
 * give the same plate, byte for byte, in the browser and in Node.
 */
import { ctx } from "./brush";
import { RECIPES } from "./recipes";
import type { Plate } from "./types";

export type { Plate, PlateLayer, SpriteSpec, ParticleSpec, Motion } from "./types";

export function paint(recipe: string, seed: number, w: number, h: number, scale = 1): Plate {
  const r = RECIPES[recipe];
  if (!r) throw new Error(`unknown painter recipe: ${recipe}`);
  const W = Math.max(1, Math.round(w));
  const H = Math.max(1, Math.round(h));
  return { recipe, seed, w: W, h: H, ...r(ctx(seed, W, H), scale) };
}

export const hasRecipe = (id: string) => id in RECIPES;

/** One flat SVG of the whole plate: the static fallback and the screenshot tool. */
export function composeStatic(p: Plate): string {
  const inner = (svg: string, x: number, y: number, w: number, h: number, extra = "") =>
    svg
      .replace(/^<svg /, `<svg x="${x}" y="${y}" `)
      .replace(/ width="\d+" height="\d+"/, ` width="${w}" height="${h}"${extra}`);
  // Every layer numbers its own defs from zero: prefix them so nested documents cannot collide.
  const scoped = (svg: string, k: string) =>
    svg.replace(/ id="([^"]+)"/g, ` id="${k}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${k}$1)`);
  const parts = p.layers.map((l, k) =>
    inner(
      scoped(l.svg, `l${k}`),
      0,
      0,
      p.w,
      p.h,
      l.blend && l.blend !== "normal" ? ` style="mix-blend-mode:${l.blend}"` : "",
    ),
  );
  p.sprites.forEach((s, k) => {
    const rot = s.rotation
      ? ` transform="rotate(${((s.rotation * 180) / Math.PI).toFixed(1)} ${s.x} ${s.y})"`
      : "";
    const op = s.alpha !== undefined ? ` opacity="${s.alpha}"` : "";
    parts.push(`<g${rot}${op}>${inner(scoped(s.svg, `s${k}`), s.x - s.w / 2, s.y - s.h / 2, s.w, s.h)}</g>`);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p.w} ${p.h}" preserveAspectRatio="xMidYMid slice"><rect width="${p.w}" height="${p.h}" fill="${p.ground}"/>${parts.join("")}</svg>`;
}
