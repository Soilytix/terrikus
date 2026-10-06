/** Chapter 1: a crumb cut in half. Microaggregates packed inside, a root and hyphae as string. */
import { W } from "../../../styles/scene";
import { blob, blurDef, radial, range, shaded, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { hypha } from "../sprites";
import { Svg, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";

export function c1AggregateCut(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 12);
  const cx = 0.5 * w;
  const cy = 0.52 * h;
  const rx = Math.min(u * 0.46, w * 0.44);
  const ry = Math.min(u * 0.4, h * 0.4);

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(back, [
      [0, mix(W.topsoil, W.dark, 0.3)],
      [1, W.dark],
    ])})"`,
  );

  // The crumb's cut face: a dark matrix with packed microaggregates and pores between them.
  const crumb = new Svg(w, h);
  const outline = blob(r, cx, cy, rx, ry, 0.12, 13);
  crumb.path(blob(r, cx + u * 0.015, cy + u * 0.025, rx, ry, 0.12, 13), `fill="${W.dark}" opacity="0.6"`);
  shaded(crumb, outline, mix(W.humus, W.dark, 0.2), mix(W.loam, W.humus, 0.3), W.dark);
  const clip = crumb.id("cut");
  crumb.def(`<clipPath id="${clip}"><path d="${outline}"/></clipPath>`);
  crumb.open(`clip-path="url(#${clip})"`);
  const tones = [W.loam, mix(W.loam, W.subsoil, 0.5), mix(W.clay, W.loam, 0.4), mix(W.humus, W.loam, 0.5)];
  const micros: { x: number; y: number; m: number }[] = [];
  for (let tries = 0; tries < 1500 && micros.length < 46; tries++) {
    const x = cx + range(r, -1, 1) * rx;
    const y = cy + range(r, -1, 1) * ry;
    const m = u * range(r, 0.035, 0.065);
    if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1.05) continue;
    if (micros.some((q) => Math.hypot(q.x - x, q.y - y) < (q.m + m) * 0.95)) continue;
    micros.push({ x, y, m });
    const tone = tones[Math.floor(r() * tones.length)]!;
    shaded(
      crumb,
      blob(r, x, y, m, m * range(r, 0.75, 1), 0.22),
      tone,
      mix(tone, W.sand, 0.45),
      mix(tone, W.dark, 0.5),
    );
    for (let k = 0; k < 5; k++)
      crumb.circle(
        x + range(r, -0.6, 0.6) * m,
        y + range(r, -0.6, 0.6) * m,
        u * range(r, 0.002, 0.005),
        `fill="${mix(W.sand, W.pale, 0.3)}" opacity="0.6"`,
      );
  }
  // A water-lit pore where the portal leads.
  const pb = blurDef(crumb, u * 0.01);
  crumb.path(
    blob(r, 0.6 * w, 0.66 * h, u * 0.04, u * 0.03, 0.3),
    `fill="${mix(W.water, W.deep, 0.4)}" opacity="0.85" filter="url(#${pb})"`,
  );
  crumb.close();

  // String: one fine root and a net of hyphae running through and around the crumb.
  const string = crumb;
  const root: Pt[] = [
    [cx - rx * 1.2, cy - ry * 0.9],
    [0.3 * w, 0.3 * h],
    [cx - rx * 0.1, cy + ry * 0.05],
    [cx + rx * 0.4, cy + ry * 0.7],
    [cx + rx * 0.7, cy + ry * 1.3],
  ];
  string.path(
    smoothOpen(root),
    `fill="none" stroke="${W.dark}" stroke-width="${u * 0.022}" stroke-linecap="round" opacity="0.5"`,
  );
  string.path(
    smoothOpen(root),
    `fill="none" stroke="${mix(W.pale, W.sand, 0.35)}" stroke-width="${u * 0.014}" stroke-linecap="round"`,
  );
  for (let k = 0; k < 10; k++) {
    const a = micros[Math.floor(r() * micros.length)]!;
    const b = micros[Math.floor(r() * micros.length)]!;
    const mid: Pt = [
      (a.x + b.x) / 2 + range(r, -1, 1) * u * 0.05,
      (a.y + b.y) / 2 + range(r, -1, 1) * u * 0.05,
    ];
    string.path(
      smoothOpen([[a.x, a.y], mid, [b.x, b.y]]),
      `fill="none" stroke="${mix(W.pale, W.film, 0.3)}" stroke-width="${u * 0.003}" opacity="0.75"`,
    );
  }

  return {
    ground: W.dark,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.1, motion: "none" },
      { id: "crumb", svg: crumb.toString(scale), parallax: 0.5, motion: "none" },
    ],
    sprites: [
      hypha(
        { id: "hyphae", x: 0.66 * w, y: 0.36 * h, motion: "sway", phase: 0.3, parallax: 0.5, scale },
        [
          [0, u * 0.12],
          [u * 0.06, u * 0.04],
          [u * 0.14, u * 0.08],
          [u * 0.22, u * 0.02],
        ],
        u * 0.24,
        u * 0.16,
        u * 0.006,
      ),
    ],
    particles: [],
  };
}
