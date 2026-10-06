import { describe, expect, it } from "vitest";
import { govern, initialGovernor, type Governor } from "./governor";

/** Feed constant frames for `ms` of wall time; record when each level was reached. */
function run(frameMs: number, totalMs: number, g: Governor = initialGovernor()) {
  const reached: number[] = [];
  for (let t = 0; t < totalMs;) {
    t += frameMs;
    const next = govern(g, frameMs);
    if (next.level !== g.level) reached.push(t);
    g = next;
  }
  return { g, reached };
}

describe("quality governor", () => {
  it("steps down through all three levels within 6 s on software GL", () => {
    const { g, reached } = run(116, 6000);
    expect(g.level).toBe(3);
    expect(reached).toHaveLength(3);
    expect(reached[2]).toBeLessThanOrEqual(6000);
  });

  it("leaves a 60 fps stage alone", () => {
    expect(run(16.7, 20_000).g.level).toBe(0);
  });

  it("ignores occasional spikes", () => {
    let g = initialGovernor();
    for (let i = 0; i < 1200; i++) g = govern(g, i % 4 === 0 ? 200 : 16);
    expect(g.level).toBe(0);
  });

  it("does not step on one long frame", () => {
    let g = initialGovernor();
    for (let i = 0; i < 30; i++) g = govern(g, 16);
    g = govern(g, 5000);
    for (let i = 0; i < 30; i++) g = govern(g, 16);
    expect(g.level).toBe(0);
  });

  it("stops at a level once frames recover", () => {
    const slow = run(50, 2100);
    expect(slow.g.level).toBe(1);
    expect(run(16, 10_000, slow.g).g.level).toBe(1);
  });
});
