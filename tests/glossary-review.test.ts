import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CHAPTERS,
  CODEX,
  DISCOVERIES,
  MATERIALS,
  MISSIONS,
  ORGANISMS,
  PROCESSES,
  SCENES,
} from "../src/content";
import { GLOSSARY, unlockedTerms } from "../src/content/glossary";
import { REVIEW_ROWS } from "../src/content/review";
import { advance, begin } from "../src/app/progress";
import { freshSave } from "../src/save/schema";
import { Glossary } from "../src/ui/Glossary";
import { ReviewPanel } from "../src/ui/Review";
import { reviewReport } from "../tools/review-report";
import { lintReview, lintSources } from "./lib/content-lint";

describe("glossary", () => {
  it("is sourced and carries review status", () => {
    expect(lintSources({ GLOSSARY })).toEqual([]);
    expect(lintReview(GLOSSARY)).toEqual([]);
  });

  it("unlocks each term from a discovery made in the term's own chapter", () => {
    for (const t of GLOSSARY) {
      expect(
        DISCOVERIES.map((d) => d.id),
        t.id,
      ).toContain(t.unlockedBy);
      const makers = MISSIONS.filter((m) =>
        m.steps.some((s) => s.kind === "discover" && s.discoveries.includes(t.unlockedBy)),
      );
      expect(
        makers.map((m) => m.chapter),
        t.id,
      ).toEqual([t.chapter]);
    }
  });

  it("never shows a term before its phenomenon, across a full play-through", () => {
    let save = freshSave();
    expect(unlockedTerms(save.discoveries)).toEqual([]);
    const shown = new Set<string>();
    for (const ch of CHAPTERS.filter((c) => c.playable))
      for (const id of ch.missions) {
        save = begin(save, id);
        for (let i = 0; i < 40 && !save.missions[id]?.done; i++) {
          const before = new Set(save.discoveries);
          save = advance(save, id);
          for (const t of unlockedTerms(save.discoveries)) {
            expect(save.discoveries, t.id).toContain(t.unlockedBy);
            if (!shown.has(t.id)) expect(before.has(t.unlockedBy), t.id).toBe(false);
            shown.add(t.id);
          }
        }
      }
    expect([...shown].sort()).toEqual(GLOSSARY.map((t) => t.id).sort());
  });

  it("renders only unlocked terms", () => {
    const html = (discoveries: string[]) =>
      renderToStaticMarkup(
        createElement(Glossary, { save: { ...freshSave(), discoveries }, onClose: () => {} }),
      );
    const empty = html([]);
    for (const t of GLOSSARY) expect(empty).not.toContain(`id="${t.id}"`);
    const prologue = html(["d-p-half-space"]);
    expect(prologue).toContain('id="g-texture"');
    expect(prologue).not.toContain('id="g-cue"');
  });
});

describe("review report", () => {
  it("lists every content node once", () => {
    const nodes = [
      ...CHAPTERS,
      ...SCENES,
      ...MISSIONS,
      ...CODEX,
      ...ORGANISMS,
      ...PROCESSES,
      ...MATERIALS,
      ...GLOSSARY,
    ];
    const report = reviewReport(REVIEW_ROWS);
    expect(report).toContain(`${nodes.length} nodes`);
    for (const n of nodes) expect(report).toContain(`\`${n.id}\``);
  });
});

describe("review overlay", () => {
  it("shows status and offers no control that could change it", () => {
    const before = REVIEW_ROWS.map((r) => r.reviewStatus);
    const html = renderToStaticMarkup(createElement(ReviewPanel, { sceneId: "p-pore", onClose: () => {} }));
    expect(html).toContain("Inside a pore");
    expect(html).toContain(`draft (${before.filter((s) => s === "draft").length})`);
    expect(html).not.toMatch(/<(input|select|textarea|form)\b/);
    expect(REVIEW_ROWS.map((r) => r.reviewStatus)).toEqual(before);
  });
});
