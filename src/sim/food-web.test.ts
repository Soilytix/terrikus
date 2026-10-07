import { describe, expect, it } from "vitest";
import {
  linkId,
  observedLinks,
  relative,
  runWeb,
  WEB_LINKS,
  WEB_ORGANISMS,
  type WebOrganism,
  type WebSettings,
} from "./food-web";

const total = (l: Record<string, number>) => Object.values(l).reduce((a, b) => a + b, 0);
/** Every subset of removed organisms, both waters. */
const SUBSETS: WebOrganism[][] = Array.from({ length: 2 ** WEB_ORGANISMS.length }, (_, mask) =>
  WEB_ORGANISMS.filter((_, i) => mask & (1 << i)),
);
const base: WebSettings = { water: "moist", pulse: 3000 };

describe("food-web bench", () => {
  it.each((["moist", "dry"] as const).flatMap((water) => SUBSETS.map((removed) => ({ water, removed }))))(
    "conserves C and N exactly at every tick: %o",
    ({ water, removed }) => {
      const snaps = runWeb({ water, pulse: 3000, removed }, 40);
      const [C, N] = [total(snaps[0]!.ledger.C), total(snaps[0]!.ledger.N)];
      for (const s of snaps) {
        expect(total(s.ledger.C)).toBe(C);
        expect(total(s.ledger.N)).toBe(N);
      }
    },
  );

  it("bacteria near the root multiply, then crash under grazing", () => {
    const b = runWeb(base, 40).map((s) => s.ledger.C["bacteria-copio"]);
    const peak = Math.max(...b);
    expect(peak).toBeGreaterThan(b[0]! * 2);
    expect(b[40]!).toBeLessThan(peak / 2);
  });

  it("removing the bacterial grazers keeps bacteria high and starves the root of N", () => {
    const grazed = runWeb(base, 20)[20]!.ledger;
    const ungrazed = runWeb({ ...base, removed: ["amoeba", "nematode-bact"] }, 20)[20]!.ledger;
    expect(ungrazed.C["bacteria-copio"]).toBeGreaterThan(grazed.C["bacteria-copio"]);
    expect(ungrazed.N.plant).toBeLessThan(grazed.N.plant);
  });

  it("grazers excrete ammonium (the microbial loop)", () => {
    const rules = runWeb(base, 10).flatMap((s) => s.transfers);
    expect(rules.some((t) => t.rule === "excretion:amoeba" && t.to === "nh4")).toBe(true);
  });

  it("drying limits grazer movement, so grazing and root N fall", () => {
    const eaten = (water: "moist" | "dry") =>
      runWeb({ ...base, water }, 20)
        .flatMap((s) => s.transfers)
        .filter((t) => t.element === "C" && t.rule === "eat:amoeba>bacteria-copio")
        .reduce((a, t) => a + t.amount, 0);
    expect(eaten("dry")).toBeLessThan(eaten("moist"));
    expect(runWeb({ ...base, water: "dry" }, 20)[20]!.ledger.N.plant).toBeLessThan(
      runWeb(base, 20)[20]!.ledger.N.plant,
    );
  });

  it("reveals only links seen feeding, and none of a removed organism", () => {
    expect(observedLinks(runWeb(base, 10))).toEqual(WEB_LINKS.map(linkId));
    expect(observedLinks(runWeb(base, 5), "amoeba")).toEqual(["amoeba>bacteria-copio"]);
    const gone = observedLinks(runWeb({ ...base, removed: ["springtail"] }, 5));
    expect(gone.some((id) => id.includes("springtail"))).toBe(false);
  });

  it("a bloom squeezes the others' relative share while their absolute biomass holds", () => {
    const snaps = runWeb(base, 6);
    const taxa = ["bacteria-copio", "fungi-sap"] as const;
    const [before, after] = [relative(snaps[0]!.ledger, taxa), relative(snaps[6]!.ledger, taxa)];
    expect(after["bacteria-copio"]!).toBeGreaterThan(before["bacteria-copio"]!);
    expect(after["fungi-sap"]!).toBeLessThan(before["fungi-sap"]!);
    expect(snaps[6]!.ledger.C["fungi-sap"]).toBeGreaterThanOrEqual(snaps[0]!.ledger.C["fungi-sap"]);
  });

  it("is deterministic", () => {
    expect(runWeb(base, 30)).toEqual(runWeb(base, 30));
  });
});
