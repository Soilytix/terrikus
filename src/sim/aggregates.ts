/**
 * Aggregate stability for chapter 1: the slake test (c1-m3) and binding agents
 * under tillage (c1-m4). Teaching values: they get the direction right
 * (cornell-cash-manual, tisdall-oades-1982, six-2004), not the numbers.
 */

/** Share of the aggregate's mass that stays water-stable, per cent. */
export const SLAKE_STABLE = { grassland: 80, ploughed: 15 } as const;
export type Plot = keyof typeof SLAKE_STABLE;
/** Seconds for the unstable part to fall to about a third. */
const SLAKE_TAU = 30;
export const SLAKE_TIMES = [0, 10, 30, 60, 120, 300] as const;

/** Per cent of a dry aggregate still holding together `t` seconds after it meets water. */
export function slake(plot: Plot, t: number): number {
  const stable = SLAKE_STABLE[plot];
  return Math.round(stable + (100 - stable) * Math.exp(-t / SLAKE_TAU));
}

export type Agent = "roots" | "hyphae" | "glue" | "clay-om";

/** Tisdall & Oades (1982): what each agent binds and how long it lasts. */
export const AGENTS: Record<
  Agent,
  { binds: "macro" | "micro"; lasts: "transient" | "temporary" | "persistent" }
> = {
  roots: { binds: "macro", lasts: "temporary" },
  hyphae: { binds: "macro", lasts: "temporary" },
  glue: { binds: "macro", lasts: "transient" },
  "clay-om": { binds: "micro", lasts: "persistent" },
};

/** Weeks microbial glue lasts before it is eaten (teaching value). */
const GLUE_WEEKS = 4;

/** Which agents still bind after `weeks`, with or without a tillage pass, and what they hold together. */
export function crumb(agents: Agent[], tilled: boolean, weeks: number) {
  const holding = agents.filter((a) => {
    const { lasts } = AGENTS[a];
    if (lasts === "persistent") return true;
    if (lasts === "temporary") return !tilled;
    return weeks < GLUE_WEEKS;
  });
  return {
    holding,
    macro: holding.some((a) => AGENTS[a].binds === "macro"),
    micro: holding.some((a) => AGENTS[a].binds === "micro"),
  };
}
