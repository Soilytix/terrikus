import { describe, expect, it } from "vitest";
import {
  claimable,
  LADDER,
  nextRung,
  rotate,
  sickSeedlings,
  triangle,
  type Cover,
  type Rotation,
} from "./disease";

const B = [false, true];

describe("disease triangle", () => {
  it.each(
    B.flatMap((host) => B.flatMap((pathogen) => B.map((conducive) => ({ host, pathogen, conducive })))),
  )("disease only when all three vertices align: %o", (t) => {
    const r = triangle(t);
    expect(r.disease).toBe(t.host && t.pathogen && t.conducive);
    expect(r.detected).toBe(t.pathogen);
  });

  it("present is not sick: the pathogen is detected without disease", () => {
    expect(triangle({ host: false, pathogen: true, conducive: true })).toEqual({
      detected: true,
      disease: false,
    });
  });

  it("suppression closes the triangle", () => {
    expect(triangle({ host: true, pathogen: true, conducive: true, suppressive: true }).disease).toBe(false);
  });
});

describe("rotation inoculum", () => {
  const ALL: [Rotation, Cover][] = (["short", "long"] as const).flatMap((r) =>
    (["none", "vetch", "oat"] as const).map((c): [Rotation, Cover] => [r, c]),
  );

  it.each(ALL)("integer, non-negative inoculum every season: %s + %s", (r, c) => {
    for (const s of rotate(r, c)) {
      expect(Number.isInteger(s.inoculum)).toBe(true);
      expect(s.inoculum).toBeGreaterThanOrEqual(0);
    }
  });

  it("a short rotation of the same host builds more inoculum than a long one", () => {
    const short = rotate("short");
    const long = rotate("long");
    expect(short.at(-1)!.inoculum).toBeGreaterThan(long.at(-1)!.inoculum);
    expect(short.filter((s) => s.disease).length).toBeGreaterThan(long.filter((s) => s.disease).length);
  });

  it("the long rotation carries the pathogen every season and is never sick", () => {
    const long = rotate("long");
    expect(long.every((s) => s.detected)).toBe(true);
    expect(long.some((s) => s.disease)).toBe(false);
  });

  it("a host cover raises inoculum and a non-host cover lowers it", () => {
    const sum = (r: Rotation, c: Cover) => rotate(r, c).reduce((n, s) => n + s.inoculum, 0);
    for (const r of ["short", "long"] as const) {
      expect(sum(r, "vetch")).toBeGreaterThan(sum(r, "none"));
      expect(sum(r, "oat")).toBeLessThan(sum(r, "none"));
    }
  });

  it("disease needs a host in a wet season", () => {
    for (const s of rotate("short", "vetch"))
      if (s.disease) expect(s.wet && (s.crop === "pea" || s.crop === "bean")).toBe(true);
  });
});

describe("suppressive transfer", () => {
  const C = sickSeedlings({ soil: "conducive" });
  const S = sickSeedlings({ soil: "suppressive" });

  it("the suppressive soil has less disease than the conducive one", () => {
    expect(S).toBeLessThan(C);
  });

  it.each([1, 5, 10])("%i %% suppressive soil transfers suppression to a conducive soil", (percent) => {
    expect(sickSeedlings({ soil: "mix", percent })).toBe(S);
  });

  it("a trace too small to establish transfers little", () => {
    const trace = sickSeedlings({ soil: "mix", percent: 0.1 });
    expect(trace).toBeGreaterThan(S);
    expect(trace).toBeLessThanOrEqual(C);
  });

  it("sterilising loses suppression, general as well as specific", () => {
    expect(sickSeedlings({ soil: "suppressive", sterilised: true })).toBeGreaterThan(C);
    expect(sickSeedlings({ soil: "mix", percent: 10, sterilised: true })).toBeGreaterThan(C);
    expect(sickSeedlings({ soil: "conducive", sterilised: true })).toBeGreaterThan(C);
  });
});

describe("evidence ladder", () => {
  it("each rung's claim needs that rung and every rung below", () => {
    expect(claimable("outcome", ["outcome"])).toBe(true);
    expect(claimable("candidate", ["outcome", "candidate"])).toBe(false);
    expect(claimable("field", [...LADDER])).toBe(true);
    expect(claimable("field", LADDER.slice(0, -1))).toBe(false);
  });

  it("is climbed bottom to top", () => {
    expect(nextRung([])).toBe("outcome");
    expect(nextRung(["outcome", "hypothesis"])).toBe("candidate");
    expect(nextRung([...LADDER])).toBeUndefined();
  });
});
