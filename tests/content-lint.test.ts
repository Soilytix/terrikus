import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSourcesDoc } from "../tools/gen-sources";
import { SOURCES } from "../src/content/sources";
import {
  CHAPTERS,
  CODEX,
  DISCOVERIES,
  FIELD_CARDS,
  MISSIONS,
  ORGANISMS,
  PROCESSES,
  MATERIALS,
  RUMORS,
  SCENES,
  fieldCard,
  scene,
  codex,
} from "../src/content";
import { CHAINS, CARDS } from "../src/content/chains";
import { MISCONCEPTIONS } from "../src/content/misconceptions";
import { WORLDS } from "../src/content/worlds";
import { ASSETS } from "../src/assets/manifest";
import { NO_GOOD_BAD, NO_SCORES, lintReview, lintSources, strings } from "./lib/content-lint";

const ALL = { CHAPTERS, SCENES, MISSIONS, CODEX, ORGANISMS, PROCESSES, MATERIALS, WORLDS, ASSETS, RUMORS };
const docRows = parseSourcesDoc(readFileSync("docs/sources.md", "utf8"));

describe("sources", () => {
  it("every registry id has a row in docs/sources.md, and the registry is current", () => {
    const docIds = new Set(docRows.map((r) => r.id));
    expect(Object.keys(SOURCES).filter((id) => !docIds.has(id))).toEqual([]);
    for (const r of docRows) expect(SOURCES[r.id as keyof typeof SOURCES]?.citation, r.id).toBe(r.citation);
  });

  it("every fact is sourced and every cited id exists", () => {
    expect(lintSources(ALL)).toEqual([]);
  });

  it("fails on a fact without sources (fixture)", () => {
    expect(lintSources({ facts: [{ id: "x", text: "t", confidence: "firm", sources: [] }] })).toHaveLength(1);
  });

  it("fails on an unknown source id (fixture)", () => {
    expect(lintSources({ sources: ["nobody-1999"] })[0]).toMatch(/unknown source id/);
  });
});

describe("review status", () => {
  it("every content node carries one", () => {
    expect(
      lintReview([...CHAPTERS, ...SCENES, ...MISSIONS, ...CODEX, ...ORGANISMS, ...PROCESSES, ...MATERIALS]),
    ).toEqual([]);
  });

  it("fails on a node without one (fixture)", () => {
    expect(lintReview([{ id: "fixture" }])).toEqual(["fixture: missing reviewStatus"]);
  });
});

describe("references resolve", () => {
  const sceneIds = new Set(SCENES.map((s) => s.id));
  const chapterIds = new Set(CHAPTERS.map((c) => c.id));
  const chainIds = new Set(CHAINS.map((c) => c.id));
  const discoveryIds = new Set(DISCOVERIES.map((d) => d.id));
  const mcIds = new Set(MISCONCEPTIONS.map((m) => m.id));

  it("scene objects point at real scenes, routes, chapters and cards", () => {
    for (const s of SCENES) {
      if (s.up) expect(sceneIds.has(s.up), `${s.id}.up`).toBe(true);
      for (const o of s.objects) {
        if (o.kind === "portal")
          expect(o.to?.startsWith("#/") || sceneIds.has(o.to ?? ""), `${s.id}/${o.id}`).toBe(true);
        if (o.kind === "glimpse") expect(chapterIds.has(o.to as never), `${s.id}/${o.id}`).toBe(true);
        if (o.card) expect(fieldCard(o.card), `${s.id}/${o.id} card`).toBeDefined();
      }
    }
  });

  it("missions reference real scenes, chains, codex pages, discoveries, cards and misconceptions", () => {
    for (const m of MISSIONS) {
      expect(sceneIds.has(m.scene), m.id).toBe(true);
      for (const id of m.misconceptionsTargeted) expect(mcIds.has(id), `${m.id} ${id}`).toBe(true);
      for (const step of m.steps) {
        if (step.kind === "chains") for (const c of step.chains) expect(chainIds.has(c), c).toBe(true);
        if (step.kind === "discover") {
          for (const d of step.discoveries) expect(discoveryIds.has(d), d).toBe(true);
          for (const c of step.codex ?? []) expect(codex(c), c).toBeDefined();
          for (const c of step.cards ?? []) expect(fieldCard(c), c).toBeDefined();
        }
        if (step.kind === "go") expect(scene(step.scene), step.scene).toBeDefined();
      }
      for (const c of strings(m).filter((x) => /^M\d+$/.test(x))) expect(mcIds.has(c as never), c).toBe(true);
    }
  });

  it("chains use known cards and every diagnostic names a misconception", () => {
    const cardIds = new Set(CARDS.map((c) => c.id));
    for (const ch of CHAINS) {
      for (const slot of ch.cards) for (const c of slot) expect(cardIds.has(c), c).toBe(true);
      for (const a of ch.accepted) expect(a.cards.length).toBe(ch.cards.length);
      for (const d of ch.diagnostics) expect(mcIds.has(d.misconception), d.message).toBe(true);
      if (ch.sequencingOnly)
        for (const slot of ch.connectors) expect(slot.every((c) => c === "is-associated-with")).toBe(true);
    }
  });

  it("organism art and every field card exist", () => {
    const assetIds = new Set(ASSETS.map((a) => a.id));
    for (const o of ORGANISMS) if (o.art) expect(assetIds.has(o.art), o.id).toBe(true);
    expect(new Set(FIELD_CARDS.map((c) => c.item.id)).size).toBe(FIELD_CARDS.length);
  });
});

describe("assets", () => {
  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((n) => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? walk(p) : [p];
    });
  }
  it("every file in src/assets has a manifest entry, and every entry a file", () => {
    const files = walk("src/assets")
      .filter((p) => !p.endsWith(".ts"))
      .map((p) => p.replace("src/assets/", ""));
    const listed = new Set(ASSETS.map((a) => a.path));
    expect(files.filter((f) => !listed.has(f))).toEqual([]);
    for (const a of ASSETS) expect(existsSync(join("src/assets", a.path)), a.path).toBe(true);
  });

  it("cc-by assets carry attribution", () => {
    for (const a of ASSETS) if (a.licence.startsWith("cc-by")) expect(a.attribution, a.id).toBeTruthy();
  });
});

describe("copy", () => {
  it("no scores, streaks or leaderboards anywhere in content", () => {
    expect(strings(ALL).filter((s) => NO_SCORES.test(s))).toEqual([]);
  });

  it("organisms are never good or bad", () => {
    expect(strings(ORGANISMS).filter((s) => NO_GOOD_BAD.test(s))).toEqual([]);
  });
});
