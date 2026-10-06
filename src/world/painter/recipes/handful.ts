/** Field scale, close up: a handful of crumbly loam against the blurred field. */
import { W } from "../../../styles/scene";
import { blob, blurDef, linear, paperGrain, radial, range, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";
import { crumb } from "./plants";

export function handful(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 4);
  // Portrait (phones): the mound sits in the upper half, clear of the mission sheet,
  // and heap-relative heights are squeezed so the root and leaf stay on it.
  // Hotspot anchors in the prologue's `portrait` fields follow `fy`.
  const portrait = h > w;
  const fy = (y: number) => (portrait ? 0.36 + (y - 0.58) * 0.45 : y);

  // Out-of-focus field and dawn sky behind.
  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.skyHigh, W.water, 0.15)],
      [fy(0.3), mix(W.skyLow, W.sand, 0.3)],
      [fy(0.42), mix(W.foliage, W.skyLow, 0.5)],
      [fy(0.7), mix(W.loam, W.foliage, 0.3)],
      [fy(1), W.topsoil],
    ])})"`,
  );
  const bb = blurDef(back, u * 0.03);
  back.open(`filter="url(#${bb})"`);
  for (let i = 0; i < 40; i++) {
    const y = range(r, 0.36, 0.95) * h;
    back.path(
      blob(r, range(r, 0, 1) * w, y, u * range(r, 0.04, 0.12), u * range(r, 0.02, 0.05), 0.3),
      `fill="${mix(W.foliage, r() < 0.5 ? W.dark : W.sand, range(r, 0.1, 0.4))}" opacity="0.8"`,
    );
  }
  back.close();
  const bokeh = blurDef(back, u * 0.004);
  back.open(`filter="url(#${bokeh})"`);
  for (let i = 0; i < 30; i++) {
    back.circle(
      range(r, 0.45, 1) * w,
      range(r, 0.15, 0.5) * h,
      u * range(r, 0.008, 0.03),
      `fill="${W.pale}" opacity="${range(r, 0.15, 0.45).toFixed(2)}"`,
    );
  }
  back.close();
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(
      back,
      [
        [0, W.pale, 0.5],
        [1, W.pale, 0],
      ],
      0.78,
      0.22,
      0.45,
    )})"`,
  );

  // The heap: a dark body, then crumbs back to front.
  const heap = new Svg(w, h);
  const cx = 0.5 * w;
  const cy = fy(0.58) * h;
  const R = portrait ? w * 0.42 : Math.min(w * 0.36, u * 0.48);
  heap.path(
    blob(r, cx - R * 0.05, cy + R * 0.42, R * 1.15, R * 0.18, 0.1),
    `fill="${W.dark}" opacity="0.45"`,
  );
  for (let i = 0; i < 70; i++) {
    const a = Math.PI + r() * Math.PI;
    const d = Math.sqrt(r()) * 0.92;
    const rr = R * range(r, 0.1, 0.2);
    heap.path(
      blob(
        r,
        cx + Math.cos(a) * d * R,
        Math.min(cy + R * 0.4 + Math.sin(a) * d * R * 0.95, cy + R * 0.42 - rr * 0.6),
        rr,
        rr * 0.8,
        0.35,
      ),
      `fill="${mix(W.humus, W.dark, 0.4)}"`,
    );
  }
  const crumbs: [number, number, number][] = [];
  for (let i = 0; i < 760; i++) {
    const t = r();
    const a = Math.PI + r() * Math.PI;
    const d = Math.sqrt(t);
    const x = cx + Math.cos(a) * d * R * 1.05;
    const y = cy + R * 0.42 + Math.sin(a) * d * R * 0.95;
    const top = 1 - d;
    crumbs.push([x, y, u * range(r, 0.008, 0.026) * (0.7 + top * 0.6)]);
  }
  crumbs.sort((a, b) => a[1] - b[1]);
  for (const [x, y, rad] of crumbs) {
    crumb(heap, r, x, y, rad, mix(mix(W.topsoil, W.humus, range(r, 0.1, 0.6)), W.loam, range(r, 0, 0.35)));
  }
  // The crumb in the foreground, and the pore the portal opens.
  crumb(heap, r, 0.43 * w, fy(0.5) * h, u * 0.05, mix(W.topsoil, W.loam, 0.35));
  crumb(heap, r, 0.56 * w, fy(0.44) * h, u * 0.055, mix(W.topsoil, W.loam, 0.25));
  // A crevice between crumbs: dark, irregular, with a film of water on its lip.
  heap.path(
    `M${0.535 * w},${fy(0.43) * h}q${u * 0.012},${u * 0.006} ${u * 0.022},${-u * 0.002}q${u * 0.01},${u * 0.004} ${u * 0.02},${u * 0.016}q${-u * 0.02},${u * 0.006} ${-u * 0.034},${-u * 0.004}z`,
    `fill="${W.dark}"`,
  );
  heap.path(
    `M${0.54 * w},${fy(0.432) * h}q${u * 0.012},${u * 0.005} ${u * 0.02},0`,
    `stroke="${W.film}" stroke-width="1" fill="none" opacity="0.55"`,
  );

  // A pale root thread and an old leaf fleck.
  const detail = new Svg(w, h);
  const root: Pt[] = [
    [0.28, 0.66],
    [0.36, 0.6],
    [0.45, 0.63],
    [0.55, 0.58],
    [0.66, 0.66],
    [0.74, 0.72],
  ].map(([x, y]) => [x! * w, fy(y!) * h] as Pt);
  detail.path(
    smoothOpen(root),
    `fill="none" stroke="${mix(W.dark, W.topsoil, 0.4)}" stroke-width="${u * 0.006}" stroke-linecap="round" opacity="0.6"`,
  );
  detail.path(
    smoothOpen(root),
    `fill="none" stroke="${mix(W.pale, W.sand, 0.4)}" stroke-width="${u * 0.0025}" stroke-linecap="round" opacity="0.85"`,
  );
  for (let i = 0; i < 6; i++) {
    const p = root[1 + Math.floor(r() * 4)]!;
    detail.path(
      `M${p[0]},${p[1]}q${u * range(r, -0.02, 0.02)},${u * 0.02} ${u * range(r, -0.03, 0.03)},${u * range(r, 0.02, 0.04)}`,
      `fill="none" stroke="${mix(W.pale, W.sand, 0.4)}" stroke-width="1" opacity="0.8"`,
    );
  }
  detail.path(
    blob(r, 0.63 * w, fy(0.62) * h, u * 0.022, u * 0.012, 0.35),
    `fill="${mix(W.subsoil, W.oxide, 0.35)}"`,
  );
  detail.path(
    `M${0.615 * w},${fy(0.62) * h}L${0.645 * w},${fy(0.618) * h}`,
    `stroke="${mix(W.subsoil, W.pale, 0.3)}" stroke-width="0.8"`,
  );
  stipple(
    detail,
    c,
    r,
    900,
    { x0: 0.2, y0: fy(0.28), x1: 0.8, y1: fy(0.85) },
    [W.sand, mix(W.sand, W.pale, 0.5)],
    [0.4, 1.1],
    (x, y) => ((x - 0.5) ** 2 / 0.09 + (y - fy(0.6)) ** 2 / (0.06 * (fy(1) - fy(0)) ** 2) < 1 ? 1 : 0),
    [0.35, 0.8],
  );

  const air = new Svg(w, h);
  air.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${radial(
      air,
      [
        [0.55, W.dark, 0],
        [1, W.dark, 0.45],
      ],
      0.5,
      0.5,
      0.75,
    )})"`,
  );

  const grain = new Svg(w, h);
  paperGrain(grain, c.seed, 0.05);

  return {
    ground: W.topsoil,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.1, motion: "sway" },
      { id: "heap", svg: heap.toString(scale), parallax: 0.6, motion: "none" },
      { id: "detail", svg: detail.toString(scale), parallax: 0.6, motion: "none" },
      { id: "vignette", svg: air.toString(scale), parallax: 0, motion: "none" },
      { id: "grain", svg: grain.toString(scale), parallax: 0, motion: "none", blend: "multiply" },
    ],
    sprites: [],
    particles: [
      {
        id: "motes",
        kind: "mote",
        count: 30,
        colour: W.pale,
        region: { x0: 0.5, y0: 0.05, x1: 1, y1: 0.5 },
        size: [0.8, 2.4],
        alpha: [0.2, 0.6],
        vx: 3,
        vy: -1.5,
        parallax: 0.2,
      },
    ],
  };
}
