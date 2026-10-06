/**
 * Water-film graph, ported from the vault prototype (sites + edges, BFS).
 * Pores are sites; the necks between them carry a water film only while the
 * soil is wet enough. The amoeba moves along held films, and only into pores
 * at least as wide as its body. Geometry and widths are teaching values
 * (or-2007, erktan-2020), not a pore-network model.
 */
export type Moisture = "dry" | "moist" | "wet";
export const MOISTURES: Moisture[] = ["dry", "moist", "wet"];
const LEVEL: Record<Moisture, number> = { dry: 0, moist: 1, wet: 2 };

export interface Site {
  id: string;
  label: string;
  /** Plate units (0..1), shared by the painter recipe and the map in the panel. */
  x: number;
  y: number;
  /** Narrowest opening into the pore, µm. */
  width: number;
  /** Bacterial cells at the start of a run (teaching units); food is how fast they grow per day. */
  cells?: number;
  food?: number;
}

export interface Neck {
  a: string;
  b: string;
  /** The driest soil in which the film across this neck still connects. */
  holds: Moisture;
}

export interface FilmGraph {
  sites: Site[];
  necks: Neck[];
}

/** Body width the amoeba squeezes through, µm (teaching value inside the 10–50 µm range). */
export const AMOEBA_BODY = 10;

export const held = (n: Neck, m: Moisture) => LEVEL[m] >= LEVEL[n.holds];

const site = (g: FilmGraph, id: string) => g.sites.find((s) => s.id === id);

/** Pores one hop away along a held film that a body of this width can enter. */
export function neighbours(g: FilmGraph, id: string, m: Moisture, body = AMOEBA_BODY): string[] {
  return g.necks
    .filter((n) => held(n, m) && (n.a === id || n.b === id))
    .map((n) => (n.a === id ? n.b : n.a))
    .filter((next) => (site(g, next)?.width ?? 0) >= body);
}

/** Shortest route along held films (breadth-first), or null when no film connects. */
export function route(g: FilmGraph, from: string, to: string, m: Moisture, body = AMOEBA_BODY) {
  const paths: string[][] = [[from]];
  const seen = new Set([from]);
  while (paths.length) {
    const path = paths.shift()!;
    const here = path.at(-1)!;
    if (here === to) return path;
    for (const next of neighbours(g, here, m, body)) {
      if (seen.has(next)) continue;
      seen.add(next);
      paths.push([...path, next]);
    }
  }
  return null;
}

export function reachable(g: FilmGraph, from: string, m: Moisture, body = AMOEBA_BODY): Set<string> {
  const seen = new Set([from]);
  const queue = [from];
  while (queue.length)
    for (const next of neighbours(g, queue.shift()!, m, body))
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
  return seen;
}

/** One hop: the amoeba arrives only if a held film joins the two pores; otherwise it stays put. */
export function hop(g: FilmGraph, at: string, to: string, m: Moisture, body = AMOEBA_BODY): string {
  return neighbours(g, at, m, body).includes(to) ? to : at;
}

/** Why a destination is out of reach: no film at all, or a film into a pore too narrow to enter. */
export function blockedBy(g: FilmGraph, from: string, to: string, m: Moisture, body = AMOEBA_BODY) {
  if (route(g, from, to, m, body)) return null;
  return route(g, from, to, m, 0) ? ("too-narrow" as const) : ("no-film" as const);
}

/** The chapter 1 labyrinth (`c1-labyrinth`). The amoeba starts in `entry`. */
export const LABYRINTH: FilmGraph = {
  sites: [
    { id: "entry", label: "Entrance pore", x: 0.14, y: 0.56, width: 40 },
    { id: "hall", label: "Wide hall", x: 0.34, y: 0.36, width: 60 },
    { id: "colony", label: "Colony in a wide pore", x: 0.55, y: 0.24, width: 50, cells: 100, food: 30 },
    { id: "crack", label: "Crack between crumbs", x: 0.36, y: 0.74, width: 25 },
    { id: "refuge", label: "Colony in a narrow pore", x: 0.56, y: 0.78, width: 3, cells: 100, food: 10 },
    { id: "neck", label: "Narrow connection", x: 0.66, y: 0.5, width: 15 },
    { id: "far", label: "Colony across the neck", x: 0.86, y: 0.44, width: 30, cells: 100, food: 8 },
  ],
  necks: [
    { a: "entry", b: "hall", holds: "dry" },
    { a: "entry", b: "crack", holds: "moist" },
    { a: "hall", b: "colony", holds: "moist" },
    { a: "crack", b: "refuge", holds: "dry" },
    { a: "hall", b: "neck", holds: "moist" },
    { a: "crack", b: "neck", holds: "moist" },
    { a: "neck", b: "far", holds: "wet" },
  ],
};

/** Share of a reachable colony one grazer eats per day, per mille (teaching value). */
export const GRAZE_PER_MILLE = 450;

/**
 * A compressed week of bacteria versus one grazer (c1-m2). Each day every
 * colony grows by its food (per cent), then loses a fixed share in any pore the
 * amoeba can reach from `from`. Integer cells, so runs repeat exactly.
 */
export function grazerWeek(g: FilmGraph, m: Moisture, from = "entry", days = 7) {
  const hunted = reachable(g, from, m);
  const colonies = g.sites.filter((s) => s.cells !== undefined);
  const series: Record<string, number[]> = Object.fromEntries(colonies.map((s) => [s.id, [s.cells!]]));
  for (let d = 0; d < days; d++)
    for (const s of colonies) {
      const list = series[s.id]!;
      let cells = list.at(-1)!;
      cells += Math.floor((cells * (s.food ?? 0)) / 100);
      if (hunted.has(s.id)) cells -= Math.floor((cells * GRAZE_PER_MILLE) / 1000);
      list.push(cells);
    }
  return { hunted, series };
}
