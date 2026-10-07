import { describe, expect, it } from "vitest";
import { total } from "./ledger";
import {
  AGGREGATE,
  ANOXIC_WATER,
  LADDER,
  PADDY_DAYS,
  REGIMES,
  activeRung,
  aerate,
  anoxicShare,
  column,
  conserved,
  isFlooded,
  nextCard,
  paddySeason,
  respire,
  type Acceptor,
  type RungId,
} from "./redox";

const ids = LADDER.map((r) => r.id);

describe("redox ladder", () => {
  it("runs O₂, NO₃⁻, Mn, Fe, SO₄²⁻, then CO₂ to CH₄, in falling Eh", () => {
    expect(ids).toEqual(["O2", "NO3", "Mn", "Fe", "SO4", "CO2"]);
    for (let i = 1; i < LADDER.length; i++) expect(LADDER[i]!.eh).toBeLessThan(LADDER[i - 1]!.eh);
  });

  it("a flooded column uses each acceptor only once every rung above it is spent", () => {
    const c = column();
    const firstDay = {} as Record<RungId, number>;
    for (let day = 1; day <= 60; day++) {
      const used = respire(c, 200);
      for (const id of ids) {
        if (used[id] === 0) continue;
        firstDay[id] ??= day;
        // Nothing above a rung in use has acceptor left after the tick.
        for (const above of ids.slice(0, ids.indexOf(id))) expect(c.stock[above as Acceptor]).toBe(0);
      }
    }
    const order = ids.filter((id) => firstDay[id] !== undefined).sort((a, b) => firstDay[a]! - firstDay[b]!);
    expect(order).toEqual(ids);
  });

  it("names the rung in use as the highest with acceptor left", () => {
    const c = column();
    expect(activeRung(c)).toBe("O2");
    c.stock.O2 = 0;
    c.stock.NO3 = 0;
    expect(activeRung(c)).toBe("Mn");
    c.stock.Mn = c.stock.Fe = c.stock.SO4 = 0;
    expect(activeRung(c)).toBe("CO2");
  });

  it("collects acceptor cards only in ladder order", () => {
    expect(nextCard([])).toBe("O2");
    expect(nextCard(["O2", "NO3"])).toBe("Mn");
    expect(nextCard(ids)).toBeUndefined();
  });

  it("conserves electrons exactly, flooded and through drain cycles", () => {
    const c = column();
    const start = conserved(c);
    for (let day = 1; day <= PADDY_DAYS; day++) {
      if (day % 9 === 0) aerate(c);
      respire(c, 333);
      expect(conserved(c)).toBe(start);
    }
  });

  it("draining resets the ladder to the top", () => {
    const c = column();
    for (let day = 0; day < 40; day++) respire(c, 300);
    expect(activeRung(c)).toBe("CO2");
    aerate(c);
    expect(activeRung(c)).toBe("O2");
  });
});

describe("anaerobic microsites", () => {
  it("form even in moist soil, inside large aggregates only", () => {
    expect(anoxicShare("moist", "small")).toBe(0);
    expect(anoxicShare("moist", "large")).toBeGreaterThan(0);
  });

  it("grow with water and with aggregate size", () => {
    for (const size of Object.keys(AGGREGATE) as (keyof typeof AGGREGATE)[]) {
      const shares = (Object.keys(ANOXIC_WATER) as (keyof typeof ANOXIC_WATER)[]).map((w) =>
        anoxicShare(w, size),
      );
      for (let i = 1; i < shares.length; i++) expect(shares[i]).toBeGreaterThanOrEqual(shares[i - 1]!);
      expect(shares.at(-1)).toBeGreaterThan(shares[0]!);
    }
    for (const water of Object.keys(ANOXIC_WATER) as (keyof typeof ANOXIC_WATER)[])
      expect(anoxicShare(water, "large")).toBeGreaterThan(anoxicShare(water, "small"));
  });
});

describe("drain the paddy", () => {
  const flooded = paddySeason("flooded");
  const drained = paddySeason("intermittent");
  const sum = (s: typeof flooded, k: "ch4" | "n2o") => s.days.reduce((n, d) => n + d[k], 0);

  it("the intermittent regime spends days drained; the flooded one never does", () => {
    expect(REGIMES).toEqual(["flooded", "intermittent"]);
    const dry = (r: (typeof REGIMES)[number]) =>
      Array.from({ length: PADDY_DAYS }, (_, i) => i + 1).filter((d) => !isFlooded(r, d)).length;
    expect(dry("flooded")).toBe(0);
    expect(dry("intermittent")).toBeGreaterThan(0);
  });

  it("draining lowers methane but raises nitrous oxide: both curves move, in opposite directions", () => {
    expect(sum(flooded, "ch4")).toBeGreaterThan(0);
    expect(sum(drained, "ch4")).toBeLessThan(sum(flooded, "ch4"));
    expect(sum(drained, "n2o")).toBeGreaterThan(sum(flooded, "n2o"));
    expect(sum(flooded, "n2o")).toBeGreaterThan(0);
  });

  it("reuses the nitrogen engine: N₂O is the ledger's n2oOut and C and N stay conserved", () => {
    for (const s of [flooded, drained]) {
      const { first, last } = s.ledger;
      expect(total(last, "C")).toBe(total(first, "C"));
      expect(total(last, "N")).toBe(total(first, "N"));
      expect(sum(s, "n2o")).toBe(last.N.n2oOut - first.N.n2oOut);
    }
  });

  it("returns curves only: no combined score or verdict", () => {
    expect(Object.keys(flooded).sort()).toEqual(["days", "ledger"]);
    expect(Object.keys(flooded.days[0]!).sort()).toEqual(["ch4", "day", "flooded", "n2o", "rung"]);
  });

  it("is deterministic", () => {
    expect(paddySeason("intermittent")).toEqual(drained);
  });
});
