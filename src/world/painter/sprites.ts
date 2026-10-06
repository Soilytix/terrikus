/**
 * Actors drawn in-house (art-direction §6.2): monoline Obsidian outline, one
 * flat world-register fill, at most one detail line. No faces.
 */
import { W } from "../../styles/scene";
import { UI } from "../../styles/ui";
import { mix } from "./color";
import { blob, range } from "./brush";
import type { Rng } from "./noise";
import { Svg, smoothClosed, smoothOpen, type Pt } from "./svg";
import type { Motion, SpriteSpec } from "./types";

const OUT = `stroke="${UI.ink}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"`;

interface Place {
  id: string;
  x: number;
  y: number;
  motion: Motion;
  phase: number;
  parallax: number;
  scale: number;
  rotation?: number;
  alpha?: number;
  blend?: SpriteSpec["blend"];
  vx?: number;
  vy?: number;
}

function sprite(s: Svg, p: Place): SpriteSpec {
  const spec: SpriteSpec = {
    id: p.id,
    svg: s.toString(p.scale),
    x: p.x,
    y: p.y,
    w: s.w,
    h: s.h,
    motion: p.motion,
    phase: p.phase,
    parallax: p.parallax,
  };
  if (p.rotation !== undefined) spec.rotation = p.rotation;
  if (p.alpha !== undefined) spec.alpha = p.alpha;
  if (p.blend !== undefined) spec.blend = p.blend;
  if (p.vx !== undefined) spec.vx = p.vx;
  if (p.vy !== undefined) spec.vy = p.vy;
  return spec;
}

/** Rod bacterium. `len` in px. Dormant cells are paler and carry a dashed rim. */
export function bacterium(p: Place, len: number, dormant = false): SpriteSpec {
  const wid = len * 0.42;
  const pad = 3;
  const s = new Svg(len + pad * 2, wid + pad * 2);
  const fill = dormant ? mix(W.clay, W.pale, 0.45) : mix(W.clay, W.sand, 0.4);
  s.rect(pad, pad, len, wid, `rx="${wid / 2}" fill="${fill}" ${OUT}`);
  s.path(
    `M${pad + wid * 0.6},${pad + wid * 0.5}L${pad + len - wid * 0.6},${pad + wid * 0.5}`,
    `stroke="${UI.ink}" stroke-width="0.8" opacity="0.45" ${dormant ? 'stroke-dasharray="2 2"' : ""}`,
  );
  return sprite(s, p);
}

/** Naked amoeba: lobed body with pseudopods; one nucleus as the single detail. */
export function amoeba(p: Place, r: Rng, rad: number): SpriteSpec {
  const size = rad * 2.8;
  const s = new Svg(size, size);
  const c = size / 2;
  const pts: Pt[] = [];
  const lobes = 5 + Math.floor(r() * 3);
  for (let i = 0; i < lobes * 2; i++) {
    const a = (i / (lobes * 2)) * Math.PI * 2;
    const k = i % 2 === 0 ? range(r, 1.0, 1.22) : range(r, 0.78, 0.92);
    pts.push([c + Math.cos(a) * rad * k, c + Math.sin(a) * rad * k * 0.85]);
  }
  s.path(smoothClosed(pts), `fill="${mix(W.film, W.pale, 0.4)}" fill-opacity="0.92" ${OUT}`);
  s.circle(c + rad * 0.15, c - rad * 0.1, rad * 0.22, `fill="${mix(W.gley, W.film, 0.3)}" ${OUT}`);
  return sprite(s, p);
}

/** A fungal hypha: a long tube with septa, along `pts` (sprite-local, px). */
export function hypha(p: Place, pts: Pt[], w: number, h: number, thick: number): SpriteSpec {
  const s = new Svg(w, h);
  const d = smoothOpen(pts);
  s.path(d, `fill="none" stroke="${UI.ink}" stroke-width="${thick + 3}" stroke-linecap="round"`);
  s.path(
    d,
    `fill="none" stroke="${mix(W.pale, W.film, 0.35)}" stroke-width="${thick}" stroke-linecap="round"`,
  );
  // Septa: cross-walls along the thread, the one internal detail.
  s.path(
    d,
    `fill="none" stroke="${UI.ink}" stroke-width="${thick}" stroke-dasharray="1 ${(thick * 4).toFixed(1)}" opacity="0.5"`,
  );
  return sprite(s, p);
}

/** Springtail (Collembola): segmented body, antennae, the furca folded beneath. */
export function springtail(p: Place, len: number): SpriteSpec {
  const s = new Svg(len * 1.6, len * 0.9);
  const cx = s.w / 2;
  const cy = s.h / 2;
  const body = mix(W.stone2, W.clay, 0.4);
  s.path(`M${cx - len * 0.6},${cy + len * 0.18}L${cx - len * 0.75},${cy + len * 0.32}`, `fill="none" ${OUT}`);
  s.path(
    `M${cx + len * 0.42},${cy - len * 0.05}Q${cx + len * 0.62},${cy - len * 0.35} ${cx + len * 0.74},${cy - len * 0.32}M${cx + len * 0.42},${cy}Q${cx + len * 0.66},${cy - len * 0.2} ${cx + len * 0.78},${cy - len * 0.12}`,
    `fill="none" ${OUT}`,
  );
  for (const lx of [-0.2, 0, 0.2]) {
    s.path(`M${cx + lx * len},${cy + len * 0.12}l${-len * 0.06},${len * 0.2}`, `fill="none" ${OUT}`);
  }
  s.path(
    blob(() => 0.5, cx, cy, len * 0.52, len * 0.2, 0, 12),
    `fill="${body}" ${OUT}`,
  );
  s.circle(cx + len * 0.42, cy - len * 0.02, len * 0.12, `fill="${body}" ${OUT}`);
  s.path(
    `M${cx - len * 0.1},${cy - len * 0.19}L${cx - len * 0.1},${cy + len * 0.19}`,
    `stroke="${UI.ink}" stroke-width="0.8" opacity="0.5"`,
  );
  return sprite(s, p);
}

/** A hedge leaf (hawthorn-like lobes), coloured between `a` and `b`. */
export function leafShape(r: Rng, cx: number, cy: number, len: number, angle: number): string {
  const pts: Pt[] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const a = t * Math.PI * 2;
    const lobe = 1 + 0.18 * Math.sin(a * 3 + r() * 0.5);
    const rx = len * 0.5 * lobe;
    const ry = len * 0.3 * lobe;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry * (Math.cos(a) > 0 ? 0.8 : 1);
    pts.push([
      cx + x * Math.cos(angle) - y * Math.sin(angle),
      cy + x * Math.sin(angle) + y * Math.cos(angle),
    ]);
  }
  return smoothClosed(pts);
}

export function fallingLeaf(p: Place, r: Rng, len: number, tint: number): SpriteSpec {
  const s = new Svg(len * 1.3, len * 1.3);
  const c = s.w / 2;
  const fill = mix(mix(W.foliage, W.sand, 0.5), W.oxide, tint);
  s.path(leafShape(r, c, c, len, 0), `fill="${fill}" stroke="${mix(fill, W.dark, 0.4)}" stroke-width="0.8"`);
  s.path(
    `M${c - len * 0.5},${c}L${c + len * 0.45},${c}`,
    `stroke="${mix(fill, W.dark, 0.35)}" stroke-width="0.7"`,
  );
  return sprite(s, p);
}

/** A soft cloud shadow, multiplied over the landscape. */
export function cloudShadow(p: Place, r: Rng, w: number, h: number): SpriteSpec {
  const s = new Svg(w, h);
  const id = s.id("cb");
  s.def(
    `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${h * 0.12}"/></filter>`,
  );
  s.open(`filter="url(#${id})"`);
  for (let i = 0; i < 4; i++) {
    s.path(
      blob(
        r,
        w * range(r, 0.3, 0.7),
        h * range(r, 0.4, 0.6),
        w * range(r, 0.18, 0.3),
        h * range(r, 0.2, 0.3),
        0.3,
      ),
      `fill="${W.topsoil}" opacity="0.5"`,
    );
  }
  s.close();
  return sprite(s, p);
}

/** A bird far away: two strokes. Decorative cameo only. */
export function bird(p: Place, span: number): SpriteSpec {
  const s = new Svg(span + 4, span * 0.5 + 4);
  const c = s.w / 2;
  s.path(
    `M2,${span * 0.25 + 2}Q${c - span * 0.2},-1 ${c},${span * 0.3 + 2}Q${c + span * 0.2},-1 ${s.w - 2},${span * 0.25 + 2}`,
    `fill="none" stroke="${mix(W.stone2, W.dark, 0.3)}" stroke-width="1.4" stroke-linecap="round"`,
  );
  return sprite(s, p);
}

export type { Place };
