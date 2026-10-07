/** Field scale, close up: a handful of crumbly loam against the blurred field. */
import { W } from "../../../styles/scene";
import { blob, blurDef, linear, paperGrain, radial, range, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { fbm, pow, rngFor } from "../noise";
import { Svg, smoothClosed, type Pt } from "../svg";
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
  // Crumbs: a skewed size distribution (many fine, few coarse), each turned and
  // stretched a little, toned by a seeded patchiness so the heap is not one stamp.
  const patch = fbm(c.seed + 41, 3);
  const darker = range(r, 0.15, 0.45);
  const crumbs: { x: number; y: number; rad: number; rot: number; sq: number }[] = [];
  for (let i = 0; i < 760; i++) {
    const t = r();
    const a = Math.PI + r() * Math.PI;
    const d = Math.sqrt(t);
    const x = cx + Math.cos(a) * d * R * 1.05;
    const y = cy + R * 0.42 + Math.sin(a) * d * R * 0.95;
    const top = 1 - d;
    const rad = u * (0.01 + 0.022 * pow(r(), 1.8)) * (0.7 + top * 0.6);
    crumbs.push({ x, y, rad, rot: range(r, -40, 40), sq: range(r, 0.7, 1.15) });
  }
  crumbs.sort((a, b) => a.y - b.y);
  for (const { x, y, rad, rot, sq } of crumbs) {
    const k = patch((x / w) * 6, (y / h) * 6);
    const tone = mix(mix(W.topsoil, W.humus, darker + k * 0.5), W.loam, range(r, 0, 0.4) * (1 - k));
    heap.open(
      `transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(1 ${sq.toFixed(2)})"`,
    );
    crumb(heap, r, 0, 0, rad, tone);
    heap.close();
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

  // A pale root: a noisy main axis that tapers to its tip, laterals branching off it.
  const detail = new Svg(w, h);
  const wob = fbm(c.seed + 53, 3);
  const axis = (from: Pt, ang: number, len: number, n: number, salt: number): Pt[] => {
    const pts: Pt[] = [from];
    for (let i = 1; i <= n; i++) {
      const [px, py] = pts[i - 1]!;
      const a = ang + (wob(i * 0.45, salt) - 0.5) * 2.2;
      pts.push([px + Math.cos(a) * (len / n), py + Math.sin(a) * (len / n)]);
    }
    return pts;
  };
  const taper = (pts: Pt[], w0: number, w1: number): string => {
    const left: Pt[] = [];
    const right: Pt[] = [];
    pts.forEach(([x, y], i) => {
      const [ax, ay] = pts[Math.max(0, i - 1)]!;
      const [bx, by] = pts[Math.min(pts.length - 1, i + 1)]!;
      const l = Math.hypot(bx - ax, by - ay) || 1;
      const half = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
      left.push([x - ((by - ay) / l) * half, y + ((bx - ax) / l) * half]);
      right.push([x + ((by - ay) / l) * half, y - ((bx - ax) / l) * half]);
    });
    return smoothClosed([...left, ...right.reverse()]);
  };
  const rootPale = mix(W.pale, W.sand, 0.4);
  const rootShade = mix(W.dark, W.topsoil, 0.4);
  const root = axis([0.27 * w, fy(range(r, 0.62, 0.68)) * h], range(r, -0.12, 0.08), R * 1.35, 14, 1);
  const rootW = u * 0.01;
  detail.path(taper(root, rootW * 1.6, rootW * 0.3), `fill="${rootShade}" opacity="0.45"`);
  detail.path(taper(root, rootW, u * 0.0008), `fill="${rootPale}" opacity="0.9"`);
  for (let i = 0; i < 5; i++) {
    const at = 2 + Math.floor(r() * (root.length - 5));
    const t = at / (root.length - 1);
    const side = r() < 0.5 ? -1 : 1;
    const [bx, by] = root[at]!;
    const [nx, ny] = root[at + 1]!;
    const lat = axis(
      [bx, by],
      Math.atan2(ny - by, nx - bx) + side * range(r, 0.6, 1.1),
      R * range(r, 0.12, 0.3) * (1 - t * 0.5),
      6,
      10 + i,
    );
    detail.path(taper(lat, rootW * (1 - t) * 0.6 + 0.6, 0.3), `fill="${rootPale}" opacity="0.8"`);
    // Root hairs off the lateral.
    for (let j = 1; j < lat.length; j += 2) {
      const [hx, hy] = lat[j]!;
      detail.path(
        `M${hx.toFixed(1)},${hy.toFixed(1)}l${(u * range(r, -0.008, 0.008)).toFixed(1)},${(u * range(r, -0.008, 0.008)).toFixed(1)}`,
        `stroke="${rootPale}" stroke-width="0.5" opacity="0.6"`,
      );
    }
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
    (x, y) => (pow(x - 0.5, 2) / 0.09 + pow(y - fy(0.6), 2) / (0.06 * pow(fy(1) - fy(0), 2)) < 1 ? 1 : 0),
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
