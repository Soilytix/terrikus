/**
 * Chapter 13 dry irrigated valley: bare stony hills, a flat field fed by a
 * canal, white salt crusts on the ridges between furrows where water
 * evaporates, and a ditch at the edge running milky with dispersed clay.
 */
import { W } from "../../../styles/scene";
import { linear, range, ridge, stipple, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg } from "../svg";
import type { RecipeOut } from "./index";

/** Field edge (the far bank of the canal) and the ditch, plate units. */
export const SALT_FIELD = 0.46;
export const SALT_DITCH = { x0: 0.78, x1: 0.86 };

export function c13Salt(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 19);
  const top = SALT_FIELD * h;

  const back = new Svg(w, h);
  back.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(back, [
      [0, mix(W.skyHigh, W.pale, 0.4)],
      [SALT_FIELD, mix(W.skyLow, W.sand, 0.25)],
    ])})"`,
  );
  back.path(ridge(c, 0.3 * h, u * 0.05, 1.6, 7), `fill="${mix(W.sand, W.stone1, 0.35)}"`);
  back.path(ridge(c, 0.38 * h, u * 0.03, 2.2, 9), `fill="${mix(W.sand, W.subsoil, 0.3)}"`);

  // The canal along the far edge of the field.
  const field = new Svg(w, h);
  field.rect(0, top - u * 0.02, w, u * 0.02, `fill="${mix(W.water, W.skyHigh, 0.25)}"`);
  field.rect(
    0,
    top,
    w,
    h - top,
    `fill="url(#${linear(field, [
      [0, mix(W.subsoil, W.sand, 0.5)],
      [1, mix(W.loam, W.subsoil, 0.4)],
    ])})"`,
  );
  // Furrows converging on the horizon; salt crust on each ridge, thicker toward the dry far end.
  const vx = 0.4 * w;
  for (let k = -10; k <= 10; k++) {
    const x1 = vx + k * w * 0.09;
    field.path(
      `M${vx + k * w * 0.012},${top}L${x1},${h}`,
      `stroke="${mix(W.loam, W.dark, 0.2)}" stroke-width="${u * 0.006}" opacity="0.5"`,
    );
  }
  stipple(
    field,
    c,
    r,
    700,
    { x0: 0, y0: SALT_FIELD, x1: SALT_DITCH.x0, y1: 1 },
    [W.pale, mix(W.pale, W.sand, 0.2)],
    [u * 0.002, u * 0.006],
    (_, y) => 1.1 - (y - SALT_FIELD) * 1.3,
  );
  // A few thirsty plants, fewer where the crust is thick.
  for (let i = 0; i < 30; i++) {
    const x = range(r, 0.05, SALT_DITCH.x0 - 0.03) * w;
    const y = range(r, 0.62, 0.98) * h;
    const ht = u * 0.03 * (y / h);
    field.path(
      `M${x},${y}l${-ht * 0.3},${-ht}M${x},${y}l${ht * 0.3},${-ht}M${x},${y}l0,${-ht * 1.1}`,
      `stroke="${mix(W.foliage, W.sand, 0.35)}" stroke-width="${u * 0.003}" stroke-linecap="round" fill="none"`,
    );
  }

  // The ditch, milky with clay.
  const ditch = new Svg(w, h);
  ditch.path(
    `M${SALT_DITCH.x0 * w},${top}L${SALT_DITCH.x1 * w},${top}L${(SALT_DITCH.x1 + 0.08) * w},${h}L${(SALT_DITCH.x0 - 0.04) * w},${h}Z`,
    `fill="${mix(W.clay, W.pale, 0.5)}"`,
  );

  return {
    ground: mix(W.subsoil, W.sand, 0.5),
    layers: [
      { id: "back", svg: back.toString(scale), parallax: 0.1, motion: "none" },
      { id: "field", svg: field.toString(scale), parallax: 0.4, motion: "none" },
      { id: "ditch", svg: ditch.toString(scale), parallax: 0.45, motion: "none" },
    ],
    sprites: [],
    particles: [],
  };
}
