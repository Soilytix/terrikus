import { describe, expect, it } from "vitest";
import { CATENA, DETECTIVE, defensibleReadings, redox } from "./catena";
import { profileAt } from "./pedogenesis";

describe("catena: position on the hill sets wetness and soil", () => {
  it("runs summit to toeslope, each lower pit with a shallower wet-season water table", () => {
    expect(CATENA.map((p) => p.id)).toEqual(["summit", "midslope", "toeslope"]);
    for (let i = 1; i < CATENA.length; i++)
      expect(CATENA[i]!.waterTable[0]).toBeLessThan(CATENA[i - 1]!.waterTable[0]);
  });

  it("shares one climate: the hill, not the weather, makes the difference", () => {
    expect(new Set(CATENA.map((p) => p.factors.climate)).size).toBe(1);
  });

  it("only the woodland summit bleaches an E", () => {
    const withE = CATENA.filter((p) => profileAt(p.factors).some((h) => h.id === "E")).map((p) => p.id);
    expect(withE).toEqual(["summit"]);
  });

  it("mottles where the water table rises and falls, grey where it never falls", () => {
    expect(redox(CATENA[0]!)).toEqual({});
    const toe = redox(CATENA[2]!);
    expect(toe.mottles).toEqual(CATENA[2]!.waterTable);
    expect(toe.greyFrom).toBe(CATENA[2]!.waterTable[1]);
  });
});

describe("detective pit: mottles admit several defensible histories", () => {
  it("the detective pit has more than one defensible reading", () => {
    const r = defensibleReadings(DETECTIVE);
    expect(r.length).toBeGreaterThan(1);
    expect(r).toEqual(expect.arrayContaining(["seasonal", "relict", "measure"]));
    expect(r).not.toContain("never-wet");
    expect(r).not.toContain("always-wet");
  });

  it("relict wetness is only defensible where the land has since been drained", () => {
    expect(defensibleReadings({ ...DETECTIVE, drainedNow: false })).not.toContain("relict");
  });

  it("no redox features reads as never waterlogged for long; grey to the top as always wet", () => {
    expect(defensibleReadings({ drainedNow: false })).toEqual(["never-wet"]);
    expect(defensibleReadings({ greyFrom: 0, drainedNow: false })).toEqual(["always-wet"]);
  });
});
