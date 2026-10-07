/**
 * Chapter 11 catena: the valley's hill from woodland summit to paddy, with
 * three pits cut where `CATENA` puts them and the detective pit beside a ditch
 * at the foot of the field. Each window shows its `profileAt` horizons and
 * `redox` colours, so the panel and the plate tell the same story.
 */
import { CATENA, DETECTIVE, DETECTIVE_X, PIT_WINDOW, groundY, redox } from "../../../sim/catena";
import { profileAt } from "../../../sim/pedogenesis";
import { W } from "../../../styles/scene";
import { blob, linear, range, ridge, strokes, type Ctx } from "../brush";
import { mix } from "../color";
import { rngFor } from "../noise";
import { Svg, smoothOpen, type Pt } from "../svg";
import type { RecipeOut } from "./index";
import { paintProfile } from "./c11-pit";

export function c11Catena(c: Ctx, scale: number): RecipeOut {
  const { w, h, u } = c;
  const r = rngFor(c.seed, 11);
  const gy = (x: number) => groundY(x) * h;

  const sky = new Svg(w, h);
  sky.rect(
    0,
    0,
    w,
    h,
    `fill="url(#${linear(sky, [
      [0, W.skyHigh],
      [0.5, W.skyLow],
      [1, mix(W.skyLow, W.sand, 0.3)],
    ])})"`,
  );
  sky.path(ridge(c, 0.26 * h, u * 0.03, 1.2, 3), `fill="${mix(W.stone1, W.skyHigh, 0.6)}"`);

  const hill = new Svg(w, h);
  const line: Pt[] = Array.from({ length: 41 }, (_, i) => [(i / 40) * w, gy(i / 40)]);
  const body = smoothOpen(line) + `L${w},${h}L0,${h}Z`;
  hill.path(
    body,
    `fill="url(#${linear(hill, [
      [0.25, mix(W.foliage, W.loam, 0.35)],
      [0.7, mix(W.foliage, W.sand, 0.3)],
      [1, mix(W.loam, W.dark, 0.3)],
    ])})"`,
  );
  // Field strips on the slope, the paddy's water at the foot.
  const clip = hill.id("clip");
  hill.def(`<clipPath id="${clip}"><path d="${body}"/></clipPath>`).open(`clip-path="url(#${clip})"`);
  strokes(
    hill,
    c,
    r,
    160,
    { x0: 0.2, y0: 0.36, x1: 0.54, y1: 0.98 },
    [mix(W.foliage, W.sand, 0.45), mix(W.subsoil, W.sand, 0.4)],
    [u * 0.03, u * 0.07],
    [u * 0.003, u * 0.006],
    () => 0.35,
  );
  hill.close();
  const paddyTop = gy(0.58);
  hill.path(
    `M${0.56 * w},${paddyTop + u * 0.006}L${w},${paddyTop + u * 0.006}L${w},${paddyTop + u * 0.03}L${0.56 * w},${paddyTop + u * 0.03}Z`,
    `fill="${mix(W.water, W.skyHigh, 0.35)}" opacity="0.85"`,
  );
  for (let i = 0; i < 40; i++) {
    const x = range(r, 0.57, 0.99) * w;
    const ht = u * range(r, 0.015, 0.03);
    hill.path(
      `M${x},${paddyTop + u * 0.012}l${-ht * 0.2},${-ht}M${x},${paddyTop + u * 0.012}l${ht * 0.2},${-ht}`,
      `fill="none" stroke="${mix(W.foliage, W.sand, 0.15)}" stroke-width="${u * 0.003}" stroke-linecap="round"`,
    );
  }

  // Woodland on the summit.
  const wood = new Svg(w, h);
  for (let i = 0; i < 26; i++) {
    const x = range(r, 0, 0.27) * w;
    const y = gy(x / w);
    const th = u * range(r, 0.06, 0.12);
    wood.path(
      `M${x - th * 0.28},${y}L${x},${y - th}L${x + th * 0.28},${y}Z`,
      `fill="${mix(W.foliage, W.dark, range(r, 0.2, 0.5))}"`,
    );
  }

  // The pits: a dark frame, then the profile inside.
  const pits = new Svg(w, h);
  const pw = Math.max(u * 0.12, w * 0.08);
  const cut = (
    x: number,
    horizons: ReturnType<typeof profileAt>,
    rx: ReturnType<typeof redox>,
    k: number,
  ) => {
    const cx = x * w;
    const y0 = gy(x) + u * 0.01;
    const y1 = y0 + PIT_WINDOW * h;
    pits.rect(
      cx - pw / 2 - u * 0.006,
      y0 - u * 0.004,
      pw + u * 0.012,
      y1 - y0 + u * 0.01,
      `fill="${W.dark}" opacity="0.55"`,
    );
    paintProfile(
      pits,
      c,
      rngFor(c.seed, 20 + k),
      { x0: cx - pw / 2, x1: cx + pw / 2, y0, y1 },
      horizons,
      rx,
      0.6,
    );
  };
  CATENA.forEach((p, k) => cut(p.x, profileAt(p.factors), redox(p), k));
  cut(DETECTIVE_X, profileAt(CATENA[1]!.factors), DETECTIVE, 9);
  // The ditch that drains the field now.
  const dx = (DETECTIVE_X + 0.055) * w;
  pits.path(
    blob(r, dx, gy(DETECTIVE_X + 0.055) + u * 0.012, u * 0.025, u * 0.008, 0.2),
    `fill="${mix(W.water, W.deep, 0.4)}"`,
  );

  return {
    ground: mix(W.foliage, W.loam, 0.35),
    layers: [
      { id: "sky", svg: sky.toString(scale), parallax: 0.05, motion: "none" },
      { id: "hill", svg: hill.toString(scale), parallax: 0.4, motion: "none" },
      { id: "wood", svg: wood.toString(scale), parallax: 0.45, motion: "sway" },
      { id: "pits", svg: pits.toString(scale), parallax: 0.5, motion: "none" },
    ],
    sprites: [],
    particles: [],
  };
}
