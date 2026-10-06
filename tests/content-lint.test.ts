import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSourcesDoc, shortLabel } from "../tools/gen-sources";
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
import { ASSETS, INTERNAL_ASSETS } from "../src/assets/manifest";
import { BENCHES, isBenchId } from "../src/sim/benches";
import { LABYRINTH, blockedBy } from "../src/sim/films";
import { NO_GOOD_BAD, NO_SCORES, lintReview, lintSources, strings } from "./lib/content-lint";

const ALL = { CHAPTERS, SCENES, MISSIONS, CODEX, ORGANISMS, PROCESSES, MATERIALS, WORLDS, ASSETS, RUMORS };
const docRows = parseSourcesDoc(readFileSync("docs/sources.md", "utf8"));

describe("sources", () => {
  it("every registry id has a row in docs/sources.md, and the registry is current", () => {
    const docIds = new Set(docRows.map((r) => r.id));
    expect(Object.keys(SOURCES).filter((id) => !docIds.has(id))).toEqual([]);
    for (const r of docRows)
      expect(SOURCES[r.id as keyof typeof SOURCES], r.id).toEqual({
        short: shortLabel(r.id, r.citation),
        citation: r.citation,
        link: r.link,
        status: r.status,
      });
  });

  it("derives a short label from the citation", () => {
    expect(shortLabel("x", "Weil, R. R. & Brady, N. C. (2017). *Soils*.")).toBe("Weil & Brady 2017");
    expect(shortLabel("x", "Moyano, F. E., Manzoni, S. & Chenu, C. (2013). Title.")).toBe(
      "Moyano et al. 2013",
    );
    expect(shortLabel("x", "Six, J. et al. (2004). Title.")).toBe("Six et al. 2004");
    expect(shortLabel("x", "Soil Science Society of America (2012). *Know Soil*.")).toBe("SSSA 2012");
    expect(shortLabel("x", "USDA NRCS / SWCS. *Soil Biology Primer*.")).toBe("USDA NRCS");
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
        const bench = o.to?.match(/^#\/bench\/(.+)$/)?.[1];
        if (bench !== undefined) expect(isBenchId(bench), `${s.id}/${o.id} bench`).toBe(true);
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
        // Every labyrinth goal is reachable or blocked exactly as it says, from the entrance.
        if (step.kind === "labyrinth")
          for (const g of step.goals)
            expect(blockedBy(LABYRINTH, "entry", g.site, g.moisture) ?? "reach", `${m.id} ${g.site}`).toBe(
              g.outcome,
            );
        if (step.kind === "bench") {
          expect(isBenchId(step.bench), `${m.id} bench ${step.bench}`).toBe(true);
          const levers: Record<string, string[]> = BENCHES[step.bench]?.levers ?? {};
          for (const [k, v] of Object.entries({ ...step.a, ...step.b }))
            expect(levers[k], `${m.id} lever ${k}`).toContain(v);
        }
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

  it("chapters, scenes and missions point at each other", () => {
    const missionIds = new Set(MISSIONS.map((m) => m.id));
    for (const c of CHAPTERS.filter((x) => x.playable)) {
      for (const id of c.scenes) expect(sceneIds.has(id), `${c.id} scene ${id}`).toBe(true);
      for (const id of c.missions) expect(missionIds.has(id), `${c.id} mission ${id}`).toBe(true);
      expect(sceneIds.has(c.entry), `${c.id} entry`).toBe(true);
    }
    for (const s of SCENES)
      expect(s.chapter === "valley" || chapterIds.has(s.chapter as never), `${s.id}.chapter`).toBe(true);
    for (const m of MISSIONS) expect(chapterIds.has(m.chapter), `${m.id}.chapter`).toBe(true);
  });

  it("scan steps name objects in their scene; go steps name a portal to theirs", () => {
    for (const m of MISSIONS)
      for (const step of m.steps) {
        const objectsOf = (id: string) => new Set(scene(id)?.objects.map((o) => o.id));
        if (step.kind === "scan")
          for (const o of step.objects) expect(objectsOf(m.scene).has(o), `${m.id} scan ${o}`).toBe(true);
        // A go step's object is the portal (in any scene) that leads to its scene.
        if (step.kind === "go" && step.object) {
          const portal = SCENES.flatMap((x) => x.objects).find((o) => o.id === step.object);
          expect(portal?.to, `${m.id} go ${step.object}`).toBe(step.scene);
        }
      }
  });

  it("requires and hiddenBy name flags something can set", () => {
    const steps = MISSIONS.flatMap((m) => m.steps);
    const settable = new Set([
      ...MISSIONS.map((m) => `${m.id}-done`),
      ...CHAPTERS.map((c) => `chapter:${c.id}`),
      "map-open", // set by progress when the valley map opens (WB§1)
      ...[...MISSIONS, ...steps].flatMap((x) => x.onComplete?.flags ?? []),
      ...steps.flatMap((st) => (st.kind === "reactive-water-air" ? [st.flag] : [])),
    ]);
    for (const s of SCENES)
      for (const o of s.objects)
        for (const f of [o.requires, o.hiddenBy].filter((x): x is string => !!x))
          expect(settable.has(f), `${s.id}/${o.id} flag ${f}`).toBe(true);
  });

  it("rumors and chain evidence resolve", () => {
    const rumorIds = new Set(RUMORS.map((r) => r.id));
    for (const m of MISSIONS)
      for (const x of [m, ...m.steps])
        for (const id of Object.keys(x.onComplete?.rumors ?? {}))
          expect(rumorIds.has(id), `${m.id} ${id}`).toBe(true);
    for (const c of CHAPTERS) if (c.rumor) expect(rumorIds.has(c.rumor), `${c.id}.rumor`).toBe(true);
    for (const r of RUMORS) {
      for (const h of r.hintsAt) expect(chapterIds.has(h as never), `${r.id} hintsAt ${h}`).toBe(true);
      if (r.explainedBy) expect(discoveryIds.has(r.explainedBy), `${r.id} explainedBy`).toBe(true);
    }
    const evidence =
      /^your water\/air slider$|^(dry|moist|waterlogged|cool|mild|warm|leaf|straw|wood) vs \w+$/;
    for (const ch of CHAINS) expect(ch.evidence, ch.id).toMatch(evidence);
  });

  it("ids are unique, including the step ids that key the save", () => {
    const dupes = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes(SCENES.map((s) => s.id))).toEqual([]);
    expect(dupes(MISSIONS.map((m) => m.id))).toEqual([]);
    expect(dupes(CODEX.map((c) => c.id))).toEqual([]);
    expect(dupes(CHAINS.map((c) => c.id))).toEqual([]);
    const stepIds = MISSIONS.flatMap((m) => m.steps.flatMap((st) => ("id" in st && st.id ? [st.id] : [])));
    expect(dupes(stepIds)).toEqual([]);
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
      .filter((p) => !p.endsWith(".ts") && !p.endsWith(".md"))
      .map((p) => p.replace("src/assets/", ""));
    const all = [...ASSETS, ...INTERNAL_ASSETS];
    const listed = new Set(all.map((a) => a.path));
    expect(files.filter((f) => !listed.has(f))).toEqual([]);
    for (const a of all) expect(existsSync(join("src/assets", a.path)), a.path).toBe(true);
    expect(new Set(all.map((a) => a.id)).size).toBe(all.length);
  });

  it("every asset carries an attribution for the credits", () => {
    for (const a of [...ASSETS, ...INTERNAL_ASSETS]) expect(a.attribution, a.id).toBeTruthy();
  });

  it("CC BY-SA assets live in cc-by-sa/ and only there", () => {
    for (const a of [...ASSETS, ...INTERNAL_ASSETS])
      expect(a.licence === "cc-by-sa", a.id).toBe(a.path.startsWith("cc-by-sa/"));
  });

  it("designer infographics are internal-only and never in the public list", () => {
    for (const a of ASSETS) expect(a.path.startsWith("designer-infographics/"), a.id).toBe(false);
    for (const a of INTERNAL_ASSETS) {
      expect(a.path.startsWith("designer-infographics/"), a.id).toBe(true);
      expect(a.source, a.id).toBe("img-designer-infographics");
      expect(a.licence, a.id).toBe("internal-only");
      expect(a.publicOk, a.id).toBe(false);
    }
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
