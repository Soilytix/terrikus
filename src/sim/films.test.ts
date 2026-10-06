import { describe, expect, it } from "vitest";
import {
  AMOEBA_BODY,
  LABYRINTH,
  MOISTURES,
  blockedBy,
  grazerWeek,
  held,
  hop,
  reachable,
  route,
  type FilmGraph,
} from "./films";

const line: FilmGraph = {
  sites: ["a", "b", "c"].map((id, i) => ({ id, label: id, x: i, y: 0, width: 20 })),
  necks: [
    { a: "a", b: "b", holds: "dry" },
    { a: "b", b: "c", holds: "wet" },
  ],
};

describe("film connectivity", () => {
  it("a neck holds its film from its own moisture upward", () => {
    const n = { a: "a", b: "b", holds: "moist" as const };
    expect(MOISTURES.map((m) => held(n, m))).toEqual([false, true, true]);
  });

  it("finds the shortest route along held films and none across a broken one", () => {
    expect(route(line, "a", "c", "wet")).toEqual(["a", "b", "c"]);
    expect(route(line, "a", "c", "moist")).toBeNull();
    expect(route(line, "a", "a", "dry")).toEqual(["a"]);
  });

  it("wetter soil never disconnects a route that drier soil had", () => {
    for (const from of LABYRINTH.sites)
      for (const [dry, wet] of [
        ["dry", "moist"],
        ["moist", "wet"],
      ] as const)
        for (const id of reachable(LABYRINTH, from.id, dry))
          expect(reachable(LABYRINTH, from.id, wet).has(id), `${from.id}→${id}`).toBe(true);
  });

  it("the labyrinth teaches both kinds of refuge", () => {
    expect([...reachable(LABYRINTH, "entry", "dry")].sort()).toEqual(["entry", "hall"]);
    expect(route(LABYRINTH, "entry", "colony", "moist")).toEqual(["entry", "hall", "colony"]);
    expect(blockedBy(LABYRINTH, "entry", "far", "moist")).toBe("no-film");
    expect(blockedBy(LABYRINTH, "entry", "far", "wet")).toBeNull();
    // Once water reaches the narrow pore, the amoeba still cannot enter it.
    expect(blockedBy(LABYRINTH, "entry", "refuge", "dry")).toBe("no-film");
    for (const m of ["moist", "wet"] as const)
      expect(blockedBy(LABYRINTH, "entry", "refuge", m)).toBe("too-narrow");
  });
});

describe("the amoeba moves only along connected films", () => {
  it("a hop across a broken film or into a too-narrow pore leaves it where it was", () => {
    expect(hop(LABYRINTH, "neck", "far", "moist")).toBe("neck");
    expect(hop(LABYRINTH, "neck", "far", "wet")).toBe("far");
    expect(hop(LABYRINTH, "crack", "refuge", "wet")).toBe("crack");
    // Not adjacent: no teleporting, however wet.
    expect(hop(LABYRINTH, "entry", "colony", "wet")).toBe("entry");
  });

  it("every step of every route is a held film into a pore wide enough", () => {
    for (const m of MOISTURES)
      for (const a of LABYRINTH.sites)
        for (const b of LABYRINTH.sites) {
          const path = route(LABYRINTH, a.id, b.id, m);
          if (!path) continue;
          let at = path[0]!;
          for (const next of path.slice(1)) {
            at = hop(LABYRINTH, at, next, m);
            expect(at).toBe(next);
            expect(LABYRINTH.sites.find((s) => s.id === at)!.width).toBeGreaterThanOrEqual(AMOEBA_BODY);
          }
        }
  });
});

describe("a week with a grazer", () => {
  it("is deterministic and integer", () => {
    const a = grazerWeek(LABYRINTH, "moist");
    expect(a).toEqual(grazerWeek(LABYRINTH, "moist"));
    for (const s of Object.values(a.series)) for (const n of s) expect(Number.isInteger(n)).toBe(true);
  });

  it("the narrow pore keeps more bacteria than the rich wide pore the amoeba hunts in", () => {
    const { hunted, series } = grazerWeek(LABYRINTH, "moist");
    expect(hunted.has("colony")).toBe(true);
    expect(hunted.has("refuge")).toBe(false);
    expect(series.refuge!.at(-1)!).toBeGreaterThan(series.colony!.at(-1)!);
    expect(series.colony!.at(-1)!).toBeLessThan(series.colony![0]!);
  });

  it("a reconnected film opens the far colony to grazing", () => {
    expect(grazerWeek(LABYRINTH, "moist").series.far!.at(-1)!).toBeGreaterThan(
      grazerWeek(LABYRINTH, "wet").series.far!.at(-1)!,
    );
  });
});
