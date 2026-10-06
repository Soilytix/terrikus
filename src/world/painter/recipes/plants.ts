/** Shared plant and soil motifs for field-scale recipes. */
import { W } from "../../../styles/scene";
import { blob, range } from "../brush";
import { mix } from "../color";
import type { Rng } from "../noise";
import type { Svg } from "../svg";

const f = (n: number) => n.toFixed(1);

/** One leaf blade from (x, y) toward angle `a`, length `l`, half-width `bw`, squashed by `sq` vertically. */
export function blade(x: number, y: number, a: number, l: number, bw: number, sq = 1): string {
  const tx = x + Math.cos(a) * l;
  const ty = y + Math.sin(a) * l * sq;
  const nx = -Math.sin(a) * bw;
  const ny = Math.cos(a) * bw * sq;
  const m1x = x + Math.cos(a) * l * 0.55;
  const m1y = y + Math.sin(a) * l * 0.55 * sq;
  return `M${f(x)},${f(y)}Q${f(m1x + nx * 1.6)},${f(m1y + ny * 1.6)} ${f(tx)},${f(ty)}Q${f(m1x - nx * 1.6)},${f(m1y - ny * 1.6)} ${f(x)},${f(y)}Z`;
}

/** A spinach rosette seen from a low angle: broad oval leaves, back ones dark, front ones lit. */
export function rosette(s: Svg, r: Rng, x: number, y: number, size: number, light = 0.5): void {
  s.path(
    blob(r, x - size * 0.1, y + size * 0.08, size * 0.95, size * 0.26, 0.15),
    `fill="${W.dark}" opacity="0.2"`,
  );
  const n = 6 + Math.floor(r() * 3);
  const leaves: { a: number; l: number }[] = [];
  for (let i = 0; i < n; i++)
    leaves.push({ a: (i / n) * Math.PI * 2 + r() * 0.5, l: size * range(r, 0.7, 1.05) });
  leaves.sort((p, q) => Math.sin(p.a) - Math.sin(q.a));
  const cy = y - size * 0.12;
  for (const { a, l } of leaves) {
    const front = Math.sin(a) > 0;
    const lit = Math.cos(a + 0.6) * 0.5 + 0.5;
    const tone = mix(mix(W.foliage, W.dark, front ? 0.08 : 0.32), W.sand, lit * 0.3 * light);
    const lift = front ? 0.45 : 0.62;
    // Petiole, then a broad oval blade.
    const px = x + Math.cos(a) * l * 0.28;
    const py = cy + Math.sin(a) * l * 0.28 * lift;
    s.path(
      `M${f(x)},${f(cy)}L${f(px)},${f(py)}`,
      `stroke="${mix(tone, W.sand, 0.2)}" stroke-width="${f(Math.max(0.6, size * 0.05))}" stroke-linecap="round"`,
    );
    s.path(blade(px, py, a, l * 0.78, l * 0.36, lift), `fill="${tone}"`);
    s.path(
      `M${f(px)},${f(py)}L${f(px + Math.cos(a) * l * 0.66)},${f(py + Math.sin(a) * l * 0.66 * lift)}`,
      `stroke="${mix(tone, W.pale, 0.3)}" stroke-width="${f(Math.max(0.4, size * 0.03))}" opacity="0.6"`,
    );
  }
}

/** A loose soil crumb with a light rim and a shadow, sand grains stippled in. */
export function crumb(s: Svg, r: Rng, x: number, y: number, rad: number, base: string): void {
  s.path(
    blob(r, x - rad * 0.2, y + rad * 0.25, rad * 1.05, rad * 0.75, 0.25),
    `fill="${W.dark}" opacity="0.35"`,
  );
  s.path(blob(r, x, y, rad, rad * 0.82, 0.3, 8), `fill="${base}"`);
  s.path(
    blob(r, x + rad * 0.25, y - rad * 0.3, rad * 0.55, rad * 0.35, 0.3),
    `fill="${mix(base, W.sand, 0.35)}" opacity="0.65"`,
  );
  const dots = Math.min(6, Math.floor(rad / 2));
  for (let i = 0; i < dots; i++) {
    s.circle(
      x + (r() - 0.5) * rad * 1.2,
      y + (r() - 0.5) * rad,
      Math.max(0.5, rad * 0.06),
      `fill="${W.sand}" opacity="0.7"`,
    );
  }
}
