/**
 * Cation exchange and the pH dial for chapter 5 (cornell-fs22-cec,
 * weil-brady-2017). A clay surface carries a fixed number of negative charges;
 * cations sit on them, strongest-held first, and anions never do. Counts are
 * whole ions and every ion is in exactly one place: on the surface, in the soil
 * water, or drained. Teaching model: the order of holding is right; the
 * all-or-nothing exchange and the availability curves are not measurements.
 */

/** Charge per ion. */
export const CHARGE = { H: 1, Ca: 2, Mg: 2, K: 1, NH4: 1, NO3: -1 } as const;
export type Ion = keyof typeof CHARGE;
export type Cation = Exclude<Ion, "NO3">;
/** Strongest-held first: a simplified lyotropic series. */
export const CATIONS: Cation[] = ["H", "Ca", "Mg", "K", "NH4"];

export type Counts = Record<Ion, number>;
export interface Surface {
  /** Negative charges on the surface. */
  sites: number;
  held: Counts;
  water: Counts;
  drained: Counts;
  /** Everything ever added, so the balance can be checked. */
  added: Counts;
}

const zero = (): Counts => ({ H: 0, Ca: 0, Mg: 0, K: 0, NH4: 0, NO3: 0 });
const ions = Object.keys(CHARGE) as Ion[];

export function surface(sites: number): Surface {
  return { sites, held: zero(), water: zero(), drained: zero(), added: zero() };
}

export const heldCharge = (s: Surface) => CATIONS.reduce((q, c) => q + s.held[c] * CHARGE[c], 0);

/** Share the surface's charge out again, strongest-held cation first; the rest stays in the water. */
function settle(s: Surface): Surface {
  const held = zero();
  const water = { ...s.water };
  let free = s.sites;
  for (const c of CATIONS) {
    const pool = s.held[c] + s.water[c];
    held[c] = Math.min(pool, Math.floor(free / CHARGE[c]));
    water[c] = pool - held[c];
    free -= held[c] * CHARGE[c];
  }
  return { ...s, held, water };
}

/** Put `n` ions into the soil water (fertiliser, acid, a dragged cation) and let the surface take its share. */
export function add(s: Surface, ion: Ion, n: number): Surface {
  if (!Number.isInteger(n) || n < 0) throw new Error(`cannot add ${n} ${ion}`);
  return settle({
    ...s,
    water: { ...s.water, [ion]: s.water[ion] + n },
    added: { ...s.added, [ion]: s.added[ion] + n },
  });
}

/** Rain carries `share` per cent of what is in the soil water (rounded up) to the drain; held ions stay. */
export function rain(s: Surface, share: number): Surface {
  const water = { ...s.water };
  const drained = { ...s.drained };
  for (const i of ions) {
    const moved = Math.min(water[i], Math.ceil((water[i] * share) / 100));
    water[i] -= moved;
    drained[i] += moved;
  }
  return { ...s, water, drained };
}

/** Every ion added is held, in the water or drained; nothing is negative or fractional; no anion is held. */
export function assertBalanced(s: Surface): void {
  for (const i of ions) {
    const parts = [s.held[i], s.water[i], s.drained[i]];
    if (parts.some((v) => v < 0 || !Number.isInteger(v))) throw new Error(`${i}: ${parts.join(", ")}`);
    if (parts[0]! + parts[1]! + parts[2]! !== s.added[i]) throw new Error(`${i} not conserved`);
  }
  if (s.held.NO3 !== 0) throw new Error("an anion is held");
  if (heldCharge(s) > s.sites) throw new Error("more charge held than the surface has");
}

/** H⁺ relative to pH 7: one unit is ten times. */
export const hRelative = (ph: number) => 10 ** (7 - ph);

/** Teaching knots (pH, per cent available) with the shape of the textbook availability chart. */
export const AVAILABILITY = {
  N: [
    [4, 30],
    [5.5, 70],
    [6, 100],
    [8, 100],
    [9, 70],
  ],
  P: [
    [4, 15],
    [5, 35],
    [6, 90],
    [6.5, 100],
    [7, 90],
    [7.5, 60],
    [8.5, 30],
    [9, 25],
  ],
  K: [
    [4, 35],
    [5.5, 70],
    [6, 100],
    [9, 100],
  ],
  Ca: [
    [4, 25],
    [5.5, 60],
    [7, 100],
    [9, 100],
  ],
  Fe: [
    [4, 100],
    [6, 85],
    [7, 45],
    [8, 20],
    [9, 15],
  ],
} as const satisfies Record<string, readonly (readonly [number, number])[]>;
export type Nutrient = keyof typeof AVAILABILITY;

const lerp = (knots: readonly (readonly [number, number])[], x: number) => {
  const first = knots[0]!;
  const last = knots[knots.length - 1]!;
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  const i = knots.findIndex(([k]) => k >= x);
  const [x0, y0] = knots[i - 1]!;
  const [x1, y1] = knots[i]!;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
};

/** Per cent available at this pH (teaching value). */
export const availability = (n: Nutrient, ph: number) => Math.round(lerp(AVAILABILITY[n], ph));

/** Below about pH 5.5 aluminium comes into solution; 0 above, rising to 100 at pH 4 (teaching value). */
export const aluminium = (ph: number) => Math.round(Math.min(100, Math.max(0, ((5.5 - ph) / 1.5) * 100)));
