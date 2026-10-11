import { describe, expect, it } from "vitest";
import { installLanguage, localize, t } from "../src/i18n";
import { collect, german } from "../tools/i18n";

describe("i18n", () => {
  it("looks up by English, fills slots, falls back to English", () => {
    installLanguage("de", { "Chapter {n}": "Kapitel {n}", Notebook: "Notizbuch" });
    expect(t("Notebook")).toBe("Notizbuch");
    expect(t("Chapter {n}", { n: 3 })).toBe("Kapitel 3");
    expect(t("Not in the book")).toBe("Not in the book");
    const fact = { id: "Notebook", text: "Notebook", sources: ["Notebook"], confidence: "firm" };
    expect(localize(fact)).toEqual({
      id: "Notebook",
      text: "Notizbuch",
      sources: ["Notebook"],
      confidence: "firm",
    });
    installLanguage("en", {});
    expect(t("Notebook")).toBe("Notebook");
  });

  it("every learner-facing string has German, with the same slots", async () => {
    const de = german();
    const gaps: string[] = [];
    for (const [area, set] of Object.entries(await collect()))
      for (const s of set) {
        const g = de[s];
        if (!g) gaps.push(`${area}: ${s}`);
        else if ((s.match(/\{\w+\}/g) ?? []).sort().join() !== (g.match(/\{\w+\}/g) ?? []).sort().join())
          gaps.push(`${area}: slots differ: ${s}`);
      }
    expect(gaps.slice(0, 20), `${gaps.length} strings`).toEqual([]);
  });
});
