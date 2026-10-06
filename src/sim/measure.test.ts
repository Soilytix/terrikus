import { describe, expect, it, vi } from "vitest";
import { closure, labRun, type Protocol, type TrueTaxon } from "./measure";
import { AFTER, BEFORE, DEFAULT_LAB, LEVERS, protocol, type LabLevers } from "./benches/lab-bench";

const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);
const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);
const ALL: LabLevers[] = (Object.keys(LEVERS) as (keyof typeof LEVERS)[]).reduce<LabLevers[]>(
  (acc, k) => acc.flatMap((l) => Object.keys(LEVERS[k]).map((v) => ({ ...l, [k]: v }))),
  [DEFAULT_LAB],
);
const living = (c: TrueTaxon[]) => Object.fromEntries(c.map((t) => [t.id, t.cells]));

describe("closure", () => {
  it("splits any weights into integers that sum to the total", () => {
    expect(closure({ a: 1, b: 1, c: 1 }, 1000)).toEqual({ a: 334, b: 333, c: 333 });
    expect(sum(closure({ a: 0.001, b: 7e9, c: 3 }, 1000))).toBe(1000);
  });
});

describe("lab bench", () => {
  it("has 32 lever combinations", () => expect(ALL).toHaveLength(32));

  it.each(ALL)("compositional reads always sum to 100 %: %o", (levers) => {
    const p = protocol(levers);
    for (const seed of SEEDS)
      for (const community of [BEFORE, AFTER]) {
        const r = labRun(community, p, seed);
        expect(sum(r.reads)).toBe(p.depth);
        expect(sum(r.permille)).toBe(1000);
      }
  });

  it("noise comes only from the seeded PRNG", () => {
    const random = vi.spyOn(Math, "random");
    const p = protocol(DEFAULT_LAB);
    expect(labRun(BEFORE, p, 7)).toEqual(labRun(BEFORE, p, 7));
    expect(labRun(BEFORE, p, 7)).not.toEqual(labRun(BEFORE, p, 8));
    expect(random).not.toHaveBeenCalled();
    random.mockRestore();
  });

  it("relative abundance of spore formers rises although their cells fell", () => {
    const p = protocol({ ...DEFAULT_LAB, cores: "five", relic: "remove" });
    expect(AFTER.find((t) => t.id === "spore")!.cells).toBeLessThan(
      BEFORE.find((t) => t.id === "spore")!.cells,
    );
    for (const seed of SEEDS)
      expect(labRun(AFTER, p, seed).permille.spore).toBeGreaterThan(
        labRun(BEFORE, p, seed + 1000).permille.spore!,
      );
  });

  it("a spike-in recovers the absolute direction for every living group", () => {
    const p = protocol({ ...DEFAULT_LAB, cores: "five", relic: "remove", spike: "added", depth: "deep" });
    const [before, after] = [living(BEFORE), living(AFTER)];
    for (const seed of SEEDS) {
      const a = labRun(BEFORE, p, seed).absolute!;
      const b = labRun(AFTER, p, seed + 1000).absolute!;
      for (const id of Object.keys(before).filter((k) => before[k]! > 0))
        expect(Math.sign(b[id]! - a[id]!), `${id} seed ${seed}`).toBe(Math.sign(after[id]! - before[id]!));
    }
  });

  it("relic DNA inflates richness: removing it drops the ghost group", () => {
    const keep = labRun(BEFORE, protocol(DEFAULT_LAB), 1);
    const removed = labRun(BEFORE, protocol({ ...DEFAULT_LAB, relic: "remove" }), 1);
    expect(keep.reads.ghost).toBeGreaterThan(0);
    expect(removed.reads.ghost).toBe(0);
    expect(removed.richness).toBeLessThan(keep.richness);
  });

  it("a rare group sits below the detection limit until the sequencing is deeper", () => {
    for (const seed of SEEDS) {
      expect(labRun(BEFORE, protocol(DEFAULT_LAB), seed).reads.ammonia).toBe(0);
      expect(labRun(BEFORE, protocol({ ...DEFAULT_LAB, depth: "deep" }), seed).reads.ammonia).toBeGreaterThan(
        0,
      );
    }
  });

  it("copy number shapes the reads: equal cells, unequal copies, unequal shares", () => {
    const pair: TrueTaxon[] = [
      { id: "many", cells: 100, relic: 0, copies: 10, dbCopies: 10, lysis: 1, patchiness: 0 },
      { id: "one", cells: 100, relic: 0, copies: 1, dbCopies: 1, lysis: 1, patchiness: 0 },
    ];
    const p: Protocol = {
      cores: 1,
      removeRelic: true,
      spikeIn: null,
      depth: 10_000,
      detectionLimit: 5,
      copyCorrection: false,
    };
    const raw = labRun(pair, p, 3).permille;
    const corrected = labRun(pair, { ...p, copyCorrection: true }, 3).permille;
    expect(raw.many! / raw.one!).toBeGreaterThan(8);
    expect(Math.abs(corrected.many! - corrected.one!)).toBeLessThan(60);
  });

  it("more cores narrow the spread between repeat samples", () => {
    const spread = (cores: "one" | "five") => {
      const v = SEEDS.map(
        (s) => labRun(BEFORE, protocol({ ...DEFAULT_LAB, cores, spike: "added" }), s).absolute!.fast!,
      );
      const m = v.reduce((a, b) => a + b, 0) / v.length;
      return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length) / m;
    };
    expect(spread("five")).toBeLessThan(spread("one"));
  });
});
