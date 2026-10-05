import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { W } from "../src/styles/scene";
import { UI, UI_TOKEN_NAME } from "../src/styles/ui";

const sceneCss = readFileSync("src/styles/scene.css", "utf8");
const tokensCss = readFileSync("src/design-system/tokens.css", "utf8");
const kebab = (k: string) =>
  k
    .replace(/([A-Z])/g, "-$1")
    .replace(/(\d)/g, "-$1")
    .toLowerCase();

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

describe("world register", () => {
  it("scene.ts matches scene.css exactly", () => {
    for (const [key, hex] of Object.entries(W)) {
      const re = new RegExp(`--w-${kebab(key)}:\\s*(#[0-9a-f]{6})`, "i");
      expect(sceneCss.match(re)?.[1]?.toLowerCase(), key).toBe(hex);
    }
  });

  it("never carries Lime", () => {
    expect(sceneCss.toLowerCase()).not.toContain("8ede3d");
    expect(Object.values(W)).not.toContain(UI.lime);
  });
});

describe("UI register", () => {
  it("ui.ts mirrors the vendored token sheet", () => {
    for (const [key, hex] of Object.entries(UI)) {
      const name = UI_TOKEN_NAME[key as keyof typeof UI];
      const re = new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, "i");
      expect(tokensCss.match(re)?.[1]?.toLowerCase(), name).toBe(hex);
    }
  });

  it("no raw hex outside src/styles and src/design-system", () => {
    const offenders = walk("src")
      .filter((p) => /\.(ts|tsx|css)$/.test(p))
      .filter((p) => !p.startsWith("src/styles/") && !p.startsWith("src/design-system/"))
      .filter((p) => /#[0-9a-f]{6}\b|#[0-9a-f]{3}\b(?![-\w])/i.test(readFileSync(p, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("no world-register token in UI components", () => {
    const offenders = walk("src/ui").filter((p) => readFileSync(p, "utf8").includes("--w-"));
    expect(offenders).toEqual([]);
  });

  it("text pairs on cards reach 4.5:1", () => {
    const pairs: [string, string, string][] = [
      ["ink on card", UI.ink, "#ffffff"],
      ["ink on page", UI.ink, UI.page],
      ["green text on card", UI.greenText, "#ffffff"],
      ["muted on card", UI.muted, "#ffffff"],
      ["warning text on warning bg", "#785e09", "#f0eee1"],
      ["warm text on hero dark", UI.warmText, UI.heroDark],
      ["comparison label (gold ink) on card", "#8c5a01", "#ffffff"],
    ];
    for (const [name, fg, bg] of pairs) expect(contrast(fg, bg), name).toBeGreaterThanOrEqual(4.5);
  });
});
