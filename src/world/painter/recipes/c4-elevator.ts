/**
 * Chapter 4 redox elevator: a cut through the flooded paddy. Floodwater, a thin
 * brown oxidised skin, then grey gley darkening with depth, black sulfide
 * stains low down, rust haloes around rice root channels, and an elevator
 * shaft with a stop at each floor. Bubbles gather at the bottom.
 */
import { W } from "../../../styles/scene";
import { blob, blurDef, linear, range, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";

/** Band edges, plate units: air above the water, water above the soil, the brown skin. */
const WATER_TOP = 0.04;
const SOIL_TOP = 0.11;
const SKIN = 0.15;
/** Floor stops, plate units; scene anchors match. */
const FLOORS = [0.17, 0.3, 0.48, 0.68, 0.87];
const SHAFT_X = 0.55;
const ROOTS_X = [0.1, 0.36, 0.86];
const PROBE_X = 0.24;

export function c4Elevator(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 29);

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, W.skyLow],
      [WATER_TOP, W.skyLow],
      [WATER_TOP + 0.001, mix(W.water, W.skyLow, 0.35)],
      [SOIL_TOP, mix(W.water, W.deep, 0.2)],
      [SOIL_TOP + 0.001, mix(W.subsoil, W.oxide, 0.35)],
      [SKIN, mix(W.subsoil, W.gley, 0.4)],
      [SKIN + 0.04, mix(W.gley, W.pale, 0.2)],
      [0.6, W.gley],
      [1, mix(W.gley, W.dark, 0.45)],
    ])})"`,
  );

  // Texture of the soil face, and black iron sulfide low down.
  const face = new Svg(w, h);
  stipple(
    face,
    c,
    r,
    700,
    { x0: 0, y0: SOIL_TOP, x1: 1, y1: 1 },
    [mix(W.gley, W.pale, 0.3), mix(W.gley, W.dark, 0.3), W.stone1],
    [u * 0.002, u * 0.005],
  );
  const soft = blurDef(face, u * 0.008);
  for (let i = 0; i < 16; i++) {
    const x = range(r, 0.02, 0.98) * w;
    const y = range(r, 0.6, 0.98) * h;
    face.path(
      blob(r, x, y, u * range(r, 0.02, 0.05), u * range(r, 0.01, 0.025), 0.35),
      `fill="${W.dark}" opacity="${range(r, 0.25, 0.5).toFixed(2)}" filter="url(#${soft})"`,
    );
  }

  // Rice root channels: a rust halo where leaked oxygen re-oxidises iron, the root inside it.
  const roots = new Svg(w, h);
  const halo = blurDef(roots, u * 0.01);
  for (const [i, rx] of ROOTS_X.entries()) {
    const pts: Pt[] = Array.from({ length: 10 }, (_, k) => [
      rx * w + (c.noise(k * 0.6, i * 7 + 3) - 0.5) * u * 0.08,
      SOIL_TOP * h + (k / 9) * (0.92 - SOIL_TOP) * h,
    ]);
    const path = smoothOpen(pts);
    roots.path(
      path,
      `fill="none" stroke="${W.oxide}" stroke-width="${u * 0.045}" opacity="0.55" filter="url(#${halo})"`,
    );
    roots.path(path, `fill="none" stroke="${mix(W.pale, W.sand, 0.3)}" stroke-width="${u * 0.006}"`);
    // Rice stems above the water.
    const [sx] = pts[0]!;
    for (let b = -2; b <= 2; b++)
      roots.path(
        `M${sx},${SOIL_TOP * h}Q${sx + b * u * 0.01},${WATER_TOP * h} ${sx + b * u * 0.025},0`,
        `fill="none" stroke="${W.foliage}" stroke-width="${u * 0.006}" stroke-linecap="round"`,
      );
  }

  // The elevator shaft and its floors, and a redox probe pushed in at one depth.
  const shaft = new Svg(w, h);
  const sw = u * 0.06;
  const sx = SHAFT_X * w;
  shaft.rect(sx - sw / 2, SOIL_TOP * h, sw, (1 - SOIL_TOP) * h, `fill="${W.dark}" opacity="0.25"`);
  for (const x of [sx - sw / 2, sx + sw / 2])
    shaft.path(`M${x},${WATER_TOP * h}L${x},${h}`, `stroke="${W.stone2}" stroke-width="${u * 0.004}"`);
  for (const fy of FLOORS) {
    const y = fy * h;
    shaft.path(
      `M${sx - sw * 0.9},${y}L${sx + sw * 0.9},${y}`,
      `stroke="${W.pale}" stroke-width="${u * 0.004}" opacity="0.8"`,
    );
    shaft.circle(sx + sw * 1.4, y, u * 0.008, `fill="${W.pale}" opacity="0.8"`);
  }
  // The cab, at the top floor.
  shaft.rect(
    sx - sw * 0.4,
    FLOORS[0]! * h - sw * 0.7,
    sw * 0.8,
    sw * 0.7,
    `fill="${mix(W.stone1, W.pale, 0.4)}" stroke="${W.stone2}" stroke-width="${u * 0.003}"`,
  );
  const px = PROBE_X * w;
  shaft.path(`M${px},0L${px},${0.42 * h}`, `stroke="${W.stone2}" stroke-width="${u * 0.006}"`);
  shaft.path(`M${px},${0.42 * h}l${-u * 0.006},${-u * 0.02}l${u * 0.012},0Z`, `fill="${W.stone1}"`);

  return {
    ground: W.gley,
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.2, motion: "none" },
      { id: "face", svg: face.toString(scale), parallax: 0.4, motion: "none" },
      { id: "roots", svg: roots.toString(scale), parallax: 0.45, motion: "none" },
      { id: "shaft", svg: shaft.toString(scale), parallax: 0.5, motion: "none" },
    ],
    sprites: [],
    particles: [
      {
        id: "methane",
        kind: "bubble",
        count: 20,
        colour: W.film,
        region: { x0: 0.02, y0: 0.78, x1: 0.98, y1: 0.98 },
        size: [1.5, 3],
        alpha: [0.3, 0.7],
        vx: 0,
        vy: -5,
        parallax: 0.45,
      },
    ],
  };
}
