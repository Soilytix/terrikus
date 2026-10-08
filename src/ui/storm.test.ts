import { describe, expect, it } from "vitest";
import { STORM_MS, maxFlashesPerSecond, phaseAt, skyLuminance, washAt } from "./storm";

const DT = 1000 / 60;
const frames = (f: (t: number) => number, ms: number) =>
  Array.from({ length: Math.ceil(ms / DT) + 1 }, (_, i) => f(i * DT));

describe("storm wash", () => {
  it("passes the 3 Hz flash rule: no more than three flashes in any second", () => {
    const lum = frames((t) => skyLuminance(washAt(t)), STORM_MS + 1000);
    expect(maxFlashesPerSecond(lum, DT)).toBeLessThanOrEqual(3);
    // It darkens once and clears once: not a single flash.
    expect(maxFlashesPerSecond(lum, DT)).toBe(0);
  });

  it("the counter catches a lightning flicker", () => {
    const flicker = frames((t) => skyLuminance(Math.floor(t / 100) % 2 ? 0.5 : 0), 2000);
    expect(maxFlashesPerSecond(flicker, DT)).toBeGreaterThan(3);
  });

  it("the darkening is a real change, starts calm and ends clear", () => {
    expect(skyLuminance(washAt(3000))).toBeLessThan(skyLuminance(0) * 0.9);
    expect(phaseAt(0)).toBe("calm");
    expect(phaseAt(STORM_MS + 1)).toBe("after");
    expect(washAt(STORM_MS + 1)).toBe(0);
  });
});
