import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ASSETS } from "../src/assets/manifest";
import { BADGE_SHAPES, CAST, badgeShape } from "../src/assets/organisms/cast";
import { W } from "../src/styles/scene";
import { UI } from "../src/styles/ui";
import { FRAMES_TS, SHEET_SVG, buildAtlas } from "../tools/atlas";

/** Ids in the world-bible §4 cast table, the authority for who must be drawn. */
const wb = readFileSync("docs/world-bible.md", "utf8");
const section = wb.slice(wb.indexOf("## 4. The cast"), wb.indexOf("## 5."));
const WB_IDS = [...section.matchAll(/^\| `([a-z0-9-]+)` \|/gm)].map((m) => m[1] as string);
const TRUTH = ["reference-drawn", "schematic", "decorative"];

describe("organism sprites (backlog T12)", () => {
  it("reads the whole §4 cast", () => {
    expect(WB_IDS.length).toBeGreaterThanOrEqual(36);
    expect(CAST.map((o) => o.id).sort()).toEqual([...WB_IDS].sort());
  });

  it.each(WB_IDS)("%s has an SVG, a manifest entry, a reference URL and a truth tag", (id) => {
    const asset = ASSETS.find((a) => a.path === `organisms/${id}.svg`);
    expect(existsSync(`src/assets/organisms/${id}.svg`)).toBe(true);
    expect(asset).toBeDefined();
    expect(asset?.referenceUrl).toMatch(/^https:\/\//);
    expect(TRUTH).toContain(asset?.truthStatus);
  });

  it("keeps the world bible's badge and size words", () => {
    for (const o of CAST) {
      const row = section.split("\n").find((l) => l.startsWith(`| \`${o.id}\` |`)) as string;
      const cells = row.split(" | ").map((c) => c.trim());
      expect(cells[2], o.id).toBe(o.sizeText);
      expect(cells[3], o.id).toBe(o.badge);
      if (o.size) expect(o.size[0] ?? 0, o.id).toBeLessThanOrEqual(o.size[1]);
    }
  });

  it("draws only Obsidian and world-register colours, never Lime", () => {
    const allowed = new Set<string>([UI.ink, ...Object.values(W)]);
    const files = [
      ...CAST.map((o) => `src/assets/organisms/${o.id}.svg`),
      ...BADGE_SHAPES.map((b) => `src/assets/organisms/badges/${b}.svg`),
    ];
    for (const f of files) {
      const hexes = [...readFileSync(f, "utf8").matchAll(/#[0-9a-f]{3,6}\b/gi)].map((m) =>
        m[0].toLowerCase(),
      );
      expect(
        hexes.filter((h) => !allowed.has(h)),
        f,
      ).toEqual([]);
    }
  });

  it("gives a badge shape only to groups art-direction §6.2 names", () => {
    expect(badgeShape("mutualist (context)")).toBe("hexagon");
    expect(badgeShape("decomposer / chemist")).toBe("circle");
    expect(badgeShape("shredder / predator")).toBeUndefined();
  });

  it("atlas sheet and frame table are up to date (run tools/atlas.ts)", async () => {
    const { svg, ts } = await buildAtlas();
    expect(readFileSync(SHEET_SVG, "utf8")).toBe(svg);
    expect(readFileSync(FRAMES_TS, "utf8")).toBe(ts);
  });
});
