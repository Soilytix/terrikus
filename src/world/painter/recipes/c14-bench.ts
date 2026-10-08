/**
 * Chapter 14 lab bench: a generic lab drawn as flat line illustration on a
 * pale wall (art-direction §4.1, lab bench row). Left to right along the
 * bench: the soil cores, the sieve, the extraction tubes, the PCR block, the
 * sequencer and the squeezing jar of reads, filled to the brim. No brand,
 * label or screen text: this is any lab.
 */
import { W } from "../../../styles/scene";
import { INK, linear, range, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg } from "../svg";
import type { RecipeOut } from "./index";

/** Top of the bench, as a fraction of the plate height. */
const TOP = 0.66;
/** A second, higher bench on portrait plates, so six items fit a phone. */
const UPPER = 0.46;
/** Where each item stands: [x, bench top] as plate fractions, landscape then portrait. Scene anchors follow these. */
const ITEMS = {
  cores: [
    [0.2, TOP],
    [0.2, UPPER],
  ],
  sieve: [
    [0.3, TOP],
    [0.5, UPPER],
  ],
  tubes: [
    [0.4, TOP],
    [0.8, UPPER],
  ],
  pcr: [
    [0.5, TOP],
    [0.2, TOP],
  ],
  sequencer: [
    [0.6, TOP],
    [0.5, TOP],
  ],
  jar: [
    [0.7, TOP],
    [0.8, TOP],
  ],
} as const;

export function c14Bench(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 14);
  const y0 = TOP * h;
  const portrait = h > w;
  const k = portrait ? 0.2 * w : u * 0.11;
  const line = `stroke="${INK}" stroke-width="${u * 0.003}" stroke-linejoin="round"`;
  const at = (id: keyof typeof ITEMS) => {
    const [fx, fy] = ITEMS[id][portrait ? 1 : 0];
    return [fx * w, fy * h] as const;
  };

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, W.skyHigh],
      [TOP, W.pale],
    ])})"`,
  );
  // A shelf on the wall with a row of plain bottles.
  const shelf = 0.26 * h;
  back.rect(0.05 * w, shelf, 0.9 * w, u * 0.012, `fill="${mix(W.clay, W.pale, 0.35)}" ${line}`);
  for (let i = 0; i < 9; i++) {
    const bx = (0.09 + i * 0.1) * w;
    const bh = k * range(r, 0.45, 0.7);
    back.rect(bx, shelf - bh, k * 0.28, bh, `fill="${mix(W.film, W.pale, 0.4)}" ${line} opacity="0.7"`);
  }

  const bench = new Svg(w, h);
  bench.rect(0, y0, w, h - y0, `fill="${mix(W.clay, W.pale, 0.55)}"`);
  bench.rect(0, y0, w, u * 0.02, `fill="${mix(W.clay, W.pale, 0.2)}" ${line}`);
  if (portrait) bench.rect(0, UPPER * h, w, u * 0.03, `fill="${mix(W.clay, W.pale, 0.2)}" ${line}`);

  {
    // Soil cores: three short cylinders of topsoil.
    const [cx0, b] = at("cores");
    for (let i = 0; i < 3; i++) {
      const cx = cx0 + (i - 1) * k * 0.32;
      const ch = k * (0.55 + 0.1 * i);
      bench.rect(cx - k * 0.12, b - ch, k * 0.24, ch, `fill="${mix(W.topsoil, W.loam, 0.3 * i)}" ${line}`);
    }
  }

  {
    // The sieve: a shallow drum with a mesh and a heap of crumbs on it.
    const [sx, b] = at("sieve");
    bench.rect(
      sx - k * 0.6,
      b - k * 0.35,
      k * 1.2,
      k * 0.35,
      `fill="${mix(W.stone1, W.pale, 0.55)}" ${line}`,
    );
    for (let i = 1; i < 8; i++) {
      const mx = sx - k * 0.6 + (i * k * 1.2) / 8;
      bench.path(
        `M${mx},${b - k * 0.35}L${mx},${b}`,
        `stroke="${INK}" stroke-width="${u * 0.001}" opacity="0.5"`,
      );
    }
    stipple(
      bench,
      c,
      r,
      90,
      { x0: (sx - k * 0.45) / w, y0: (b - k * 0.5) / h, x1: (sx + k * 0.45) / w, y1: (b - k * 0.36) / h },
      [W.topsoil, W.loam, W.subsoil],
      [u * 0.003, u * 0.006],
    );
  }

  {
    // Extraction tubes in a rack.
    const [tx, b] = at("tubes");
    bench.rect(tx - k * 0.6, b - k * 0.3, k * 1.2, k * 0.3, `fill="${mix(W.stone2, W.pale, 0.5)}" ${line}`);
    for (let i = 0; i < 4; i++) {
      const cx = tx - k * 0.45 + i * k * 0.3;
      bench.path(
        `M${cx - k * 0.08},${b - k * 0.95}L${cx + k * 0.08},${b - k * 0.95}L${cx + k * 0.08},${b - k * 0.3}L${cx},${b - k * 0.2}L${cx - k * 0.08},${b - k * 0.3}Z`,
        `fill="${mix(W.film, W.pale, 0.3)}" ${line}`,
      );
      bench.rect(cx - k * 0.07, b - k * 0.55, k * 0.14, k * 0.25, `fill="${mix(W.sand, W.pale, 0.3)}"`);
    }
  }

  {
    // The PCR block: a box with a hinged lid and a grid of wells.
    const [px, b] = at("pcr");
    bench.rect(px - k * 0.6, b - k * 0.6, k * 1.2, k * 0.6, `fill="${mix(W.stone1, W.pale, 0.35)}" ${line}`);
    bench.rect(px - k * 0.6, b - k * 0.78, k * 1.2, k * 0.18, `fill="${mix(W.stone2, W.pale, 0.3)}" ${line}`);
    for (let i = 0; i < 6; i++)
      bench.circle(
        px - k * 0.4 + i * k * 0.16,
        b - k * 0.32,
        k * 0.04,
        `fill="${mix(W.dark, W.stone2, 0.4)}"`,
      );
  }

  {
    // The sequencer: a tall plain cabinet with a blank panel.
    const [qx, b] = at("sequencer");
    bench.rect(qx - k * 0.65, b - k * 1.5, k * 1.3, k * 1.5, `fill="${mix(W.stone1, W.pale, 0.6)}" ${line}`);
    bench.rect(qx - k * 0.45, b - k * 1.3, k * 0.9, k * 0.5, `fill="${mix(W.deep, W.stone2, 0.5)}" ${line}`);
    bench.rect(qx - k * 0.3, b - k * 0.55, k * 0.6, k * 0.06, `fill="${INK}" opacity="0.6"`);
  }

  {
    // The squeezing jar: a fixed-size jar of reads, always full to the brim.
    const [jx, b] = at("jar");
    const bands = [W.oxide, W.foliage, W.water, W.sand, W.clay];
    let top = b - k * 1.1;
    for (let i = 0; i < bands.length; i++) {
      const bh = (k * 1.1) / bands.length;
      bench.rect(jx - k * 0.42, top, k * 0.84, bh, `fill="${mix(bands[i]!, W.pale, 0.25)}"`);
      top += bh;
    }
    bench.rect(jx - k * 0.45, b - k * 1.15, k * 0.9, k * 1.15, `fill="none" ${line}`);
    bench.rect(jx - k * 0.5, b - k * 1.28, k * 1.0, k * 0.13, `fill="${mix(W.stone2, W.pale, 0.4)}" ${line}`);
  }
  return {
    ground: W.pale,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.05, motion: "none" },
      { id: "bench", svg: bench.toString(scale), parallax: 0.3, motion: "none" },
    ],
    sprites: [],
    particles: [],
  };
}
