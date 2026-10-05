---
title: "Soil Worlds — Backlog"
description: "Ordered, independently mergeable tasks. T01–T10 are the Build phase."
status: ready — Build phase can start; later tasks may be reordered after Build acceptance
date: 2026-10-06
---

# Soil Worlds — Backlog

Rules for every task:

- One task, one PR, green on `mise run check`.
- No pending open decision (spec §11) is settled inside a task; raise it in the PR.
- Content PRs carry sources and ship as `reviewStatus: draft`.
- References: spec (S§), world bible (WB§), art direction (AD§).

---

## Build phase (T01–T10)

### T01 — Repository scaffold · Build phase

- **Goal:** an empty app that builds, tests and lints in CI.
- **Scope:** `mise.toml` (tasks: setup, install, dev, build, test, typecheck, hooks, lint, secrets, check, serve), `package.json` (pnpm 10), `vite.config.ts` (`base: './'`), `tsconfig.json` (strict), `index.html`, `src/main.tsx`, `src/app/App.tsx` (hash router stub), `.pre-commit-config.yaml` (pre-commit-hooks + local gitleaks via prek), ESLint/Prettier, `.github/workflows/ci.yml`, `README.md` (mario-style header, shields labelColor=16211B, TOC), `AGENTS.md` + `CLAUDE.md` symlink, `icons/icon.png`, `.editorconfig`, `.gitattributes`, `.gitignore`, `.env.example` (`SW_PROFILE`), `tools/budget.ts`.
- **Acceptance:** `mise run check` runs hooks, typecheck, vitest (one trivial test), build and budget, and passes locally and in CI; `dist/` works when opened from a nested path; README describes What it does / Install / Operations / Configuration / Where it runs / Development.
- **Depends on:** —

### T02 — Design tokens, world register and fonts · Build phase

- **Goal:** UI and world colours come only from tokens.
- **Scope:** `src/design-system/` vendored from platform `packages/design-system` v0.2.0 with `VENDORED.md` (commit, date, reason for platform over hub: S D-6); Tailwind v4 theme wiring; `src/styles/scene.css` (AD§3.2); @fontsource Inter and IBM Plex Mono; `tests/tokens.test.ts` (no raw hex outside the two token homes; no Lime in `scene.css`; no `--w-*` in `src/ui/`; contrast check for text-on-card pairs).
- **Acceptance:** a token sample page at `#/dev/tokens` (internal profile only) shows both registers; token tests pass; OD-1/OD-2 hexes are marked pending in `scene.css` comments.
- **Depends on:** T01

### T03 — Content schema, source registry and content safety · Build phase

- **Goal:** content is typed, sourced and safe before any chapter is written.
- **Scope:** `src/content/schema.ts` (S§5.2, including `Asset` type from AD§7), `src/content/sources.ts` (ids from `docs/sources.md` needed by P and ch. 2 at minimum), `src/content/misconceptions.ts` (M1–M25), `src/content/worlds.ts` (presets), `src/assets/manifest.ts` (empty typed list), `tests/content-lint.test.ts`, `tests/denylist.test.ts` + `tools/hash-denylist.ts`, `tools/bundle-scan.ts` (wired into `mise run check` after build), `SW_PROFILE` handling in `vite.config.ts`.
- **Acceptance:** lint fails on an unknown source id, on a registry id without a row in `docs/sources.md`, on a `Fact` without sources, and on a file in `src/assets/` without a manifest entry; denylist fails on a fixture containing a hashed token; `public` profile build fails on a `draft` node; all proven by failing-fixture tests.
- **Depends on:** T01

### T04 — Simulation core · Build phase

- **Goal:** a deterministic, exactly conserving teaching engine with the leaf-jar ruleset.
- **Scope:** `src/sim/ledger.ts`, `rng.ts`, `modifiers.ts`, `engine.ts`, `benches/leaf-jar.ts`; tests in `src/sim/*.test.ts`.
- **Acceptance:** conservation exact at every tick for all 18 lever combinations × 10 seeds; heat monotone; direction tests (moist > dry, waterlogged < moist, leaf > straw > wood, mild > cool); identical trajectories for identical inputs; no pool negative; engine has no DOM or React imports.
- **Depends on:** T01

### T05 — Save state · Build phase

- **Goal:** progress survives reloads and can be moved between browsers.
- **Scope:** `src/save/` (schema, storage with try/catch and in-memory fallback, `migrate`, export/import), zustand store wiring in `src/app/`.
- **Acceptance:** tests cover round-trip, corrupt JSON, unknown version refusal, storage throwing, lab-book cap 200; settings UI exports and imports a file; fallback shows a "progress will not be kept" note.
- **Depends on:** T01, T03

### T06 — World renderer shell · Build phase

- **Goal:** navigable nested scenes that are accessible without the canvas.
- **Scope:** `src/world/app.ts` (Pixi v8, DPR cap, pause when hidden), `camera.ts` (pan, 1–3× zoom, log-space portal transition), `scenes/` (generic scene builder from `Scene` data), `particles.ts` (flux-driven, from engine events), `fallback/` (static SVG mode, `?static=1`, WebGL failure), `src/ui/outline/` (DOM scene outline), `src/ui/hud/` (scale bar, not-to-scale badge, narration live region); lazy-loaded world chunk.
- **Acceptance:** two placeholder scenes at different scales with a portal; keyboard map from S§8.1 works; reduced motion swaps zoom for crossfade and freezes ambient; static mode renders the same scenes with hotspots; budget check passes with the world chunk split.
- **Depends on:** T02, T03

### T07 — Seeded plate painter (runtime) · Build phase

- **Goal:** beautiful, deterministic painted plates without an asset pipeline.
- **Scope:** `src/world/painter/` (isomorphic: runs in browser and Node), recipes for `field`, `profile`, `aggregate` and lab bench (AD§4.1), paper grain, stipple; painter output cached per seed and size.
- **Acceptance:** same seed and recipe give pixel-identical output (snapshot hash test in Node); plates use only `scene.css` tokens; paint time ≤ 150 ms per plate on M1 at 1440 px wide; static mode can use painter output as SVG/PNG.
- **Depends on:** T02, T06

### T08 — Notebook and cause-chain builder · Build phase

- **Goal:** the only reward system: rumor map, field cards, lab book, codex and chains.
- **Scope:** `src/ui/notebook/` (four tabs, WB§7.1), `src/ui/chains/` (cards by shape, connectors, batch confirmation, three verdicts, accepted variants, diagnostics by misconception id), evidence-tier styling (AD§6.4), contents screen as progress view.
- **Acceptance:** chains confirmable by keyboard and screen reader; batch feedback "N of M supported"; sequencing-only chains restricted to *is associated with*; no score, percentage or currency anywhere; lab-book entries persist via T05.
- **Depends on:** T03, T05

### T09 — Prologue: A Handful of Soil · Build phase

- **Goal:** the first five minutes.
- **Scope:** `src/content/chapters/prologue/` (scenes `p-field-dawn`, `p-handful`, `p-separated`, `p-pore`; missions `p-m1`, `p-m2`; codex; discoveries; organisms `bacteria-copio`, `bacteria-dormant`, `amoeba`, `fungi-sap` as in-house SVG placeholders), composition slider and reactive water/air sentence.
- **Acceptance:** playable from `#/` to the first rumor; prediction committed and shown beside result; result shown as a range with confidence; scale stamp recorded; chapters 1 and 2 unlock (1 shows "coming soon"); every fact sourced; keyboard-only and static mode completion.
- **Depends on:** T06, T07, T08

### T10 — Chapter 2: Where Did the Leaf Go? · Build phase

- **Goal:** the first complete experiment chapter, proving the engine and the loop.
- **Scope:** `src/content/chapters/leaf/` (scenes `c2-hedge-edge`, `c2-litter`, `c2-aggregate`, `c2-bench`; missions `c2-m1`–`c2-m5`; chains 1–3 with diagnostics; codex pages; discoveries), `src/ui/bench/` (≤4 levers, run/scrub, A/B compare with Lime/gold, stacked-area chart, "Carbon accounted for: 100.0 %", energy bar, teaching-model banner), Scientist lens v1.
- **Acceptance:** predict → run → compare → batch-confirm chains → transfer (incl. "cannot tell yet; measure X" accepted) → notebook entries → reload resumes mid-chapter; codex pages unlock only after their experiment; reduced motion uses step buttons; spec §13 Build acceptance all true.
- **Depends on:** T04, T08, T09

---

## Later (T11–T35, ordered)

### T11 — Asset manifest, build profiles and credits panel

- **Goal:** every bundled asset is accounted for and creditable.
- **Scope:** populate `src/assets/manifest.ts`; credits panel in settings; `cc-by-sa/` isolation folder; designer-infographics import path for the internal profile only.
- **Acceptance:** public build fails on `publicOk: false`; credits list every bundled asset with attribution; bundle scan still clean.
- **Depends on:** T03

### T12 — In-house organism sprite library and atlas

- **Goal:** all §4 cast drawn to AD§6.2.
- **Scope:** `src/assets/organisms/*.svg`, atlas build, group-badge shapes, true-size data.
- **Acceptance:** every organism in WB§4 has an SVG with manifest entry, reference URL and truth tag; atlas loads in ≤ 1 draw call per scene layer.
- **Depends on:** T06, T11

### T13 — Chapter 1: The Pore Labyrinth

- **Goal:** texture, structure, pores; the amoeba avatar.
- **Scope:** port the prototype water-film graph (BFS) into `src/sim/films.ts`; chapter content `c1-*`; feel-test flow diagram; slake test.
- **Acceptance:** missions `c1-m1`–`c1-m4` playable; film connectivity tests; amoeba moves only along connected films; OD-10 respected (guided movement unless decided otherwise).
- **Depends on:** T10, T12

### T14 — Offline plate baker and time-lapse

- **Goal:** higher-quality AVIF plates and stillwet-style time-lapses.
- **Scope:** `tools/bake-plates.ts` using the T07 painter in Node; AVIF output; time-lapse frame sets; plate budget check.
- **Acceptance:** baked plates match runtime painter for the same seed; ≤ 2.5 MB per scale; runtime falls back to painter when a plate is missing.
- **Depends on:** T07

### T15 — Living-backdrop shaders and quality governor

- **Goal:** lively backdrops S1–S9 within budget.
- **Scope:** `src/world/shaders/`, quality tiers, governor, dimming during reading (AD§5.4), ambient toggle in settings.
- **Acceptance:** 16.6 ms frames on reference hardware at high tier; governor steps down under load; reduced motion freezes all; OD-8 raised in PR.
- **Depends on:** T06, T14

### T16 — Valley map, contents and retrieval prompts

- **Goal:** navigation across chapters and return visits.
- **Scope:** landscape-scale valley map scene; unlock rules; full Rumor Map; recall cards on return (WB§7.4).
- **Acceptance:** chapter unlocks follow WB§1 progression; recall prompt appears on return; keyboard and static mode work.
- **Depends on:** T10, T13

### T17 — Chapter 3: Water Roads

- **Goal:** matric potential, films as roads, Birch pulse.
- **Scope:** water-potential rules in `sim/`; content `c3-*`; S5/S6 use.
- **Acceptance:** missions playable; drainage order test (largest pores first); Birch pulse direction test; "unresolved" source attribution accepted.
- **Depends on:** T13, T16

### T18 — Nitrogen engine

- **Goal:** multi-element ledger rules for N.
- **Scope:** mineralisation, immobilisation, nitrification, denitrification, leaching, grazing-N rules; C:N coupling; tests.
- **Acceptance:** N conservation exact; immobilisation dip with high C:N; denitrification only when fO2 low; priming stretch for ch. 2 enabled.
- **Depends on:** T04

### T19 — Chapter 4: Breath and Rust (rice)

- **Goal:** O₂, microsites, redox ladder, trade-offs.
- **Scope:** redox rules; paddy world art; redox elevator scene; content `c4-*`.
- **Acceptance:** ladder order enforced in rules; drain-the-paddy shows both CH₄ and N₂O with no verdict score.
- **Depends on:** T16, T18

### T20 — Chapter 6: Who Eats Whom

- **Goal:** food web, microbial loop, compositional preview.
- **Scope:** food-web mobile; grazing rules; geosmin scene; content `c6-*`.
- **Acceptance:** link reveal by observation only; squeezing-jar preview caption persistent; no organism labelled good or bad (copy lint).
- **Depends on:** T12, T18

### T21 — Chapter 7: The Root's Neighbourhood

- **Goal:** rhizosphere gradients, exudates, recruitment.
- **Scope:** exudation rules; root-tip shader S8; bare-vs-planted comparison; content `c7-*`.
- **Acceptance:** C and N conserved through exudate → bloom → grazing → uptake; contested exudation share shown as a band.
- **Depends on:** T20

### T22 — Chapter 8: Partners and Traders

- **Goal:** mycorrhiza, nodules, phosphorus.
- **Scope:** trade and P-sorption rules; nodule and arbuscule scenes; pea/bean/spinach/beet contrast; content `c8-*`.
- **Acceptance:** spinach and beet show no partner; pea/bean partner specificity enforced; wood-wide-web item uses open-question treatment.
- **Depends on:** T21

### T23 — Chapter 9: The Nitrogen Relay

- **Goal:** N cycle stage by stage on the sugar beet world.
- **Scope:** `straw-n` bench; relay scene; content `c9-*`.
- **Acceptance:** "N accounted for: 100.0 %"; gene ≠ rate mission requires a second measurement; no customer framing.
- **Depends on:** T18, T21

### T24 — Chapter 5: Charged Surfaces

- **Goal:** CEC, clays, pH.
- **Scope:** exchange rules; platelet scene; pH dial; content `c5-*`.
- **Acceptance:** leaching of anions vs retention of cations shown; pH-predictor mission accepts association-not-cause answer.
- **Depends on:** T16, T18

### T25 — Chapter 10: Disease and Defence

- **Goal:** disease triangle, rotations, suppressive soils, evidence ladder.
- **Scope:** rotation inoculum rules; suppressive transfer experiment; content `c10-*`.
- **Acceptance:** "present is not sick" enforced in diagnostics; evidence ladder rungs unlock bounded claims.
- **Depends on:** T22

### T26 — Measurement engine

- **Goal:** instruments over true state.
- **Scope:** `src/sim/measure.ts` (sampling, detection limits, seeded noise, compositional closure, relic DNA, copy number); lab-bench scene.
- **Acceptance:** compositional reads always sum to 100 %; spike-in recovers absolute direction; noise only from seeded PRNG.
- **Depends on:** T04

### T27 — Chapter 11: Pit Walls and Deep Time

- **Goal:** pedogenesis, horizons, catena.
- **Scope:** profile scenes; pedogenesis time-lapse (T14); catena; content `c11-*`; WRB examples (OD-11 raised).
- **Acceptance:** time-compression label always visible; mottle detective accepts several defensible answers.
- **Depends on:** T14, T16

### T28 — Chapter 12: Fields and Seasons

- **Goal:** management through mechanisms; G×E×M.
- **Scope:** `twin-fields` bench; season wheel; compaction scene; content `c12-*`.
- **Acceptance:** context-flip mission flips sign; contested cover-crop SOC pair shown; confounder mission requires naming drainage.
- **Depends on:** T17, T23, T26

### T29 — Chapter 13: Hillslope and River

- **Goal:** erosion, catena water, salinity, satellite as measurement.
- **Scope:** valley storm, splash, salt scenes; Sentinel-2 inset with attribution; content `c13-*`.
- **Acceptance:** storm passes the 3 Hz flash rule; satellite labelled reflectance measurement.
- **Depends on:** T15, T27

### T30 — Chapter 14: What Does the Sample Tell Us?

- **Goal:** the capstone on claims and confidence.
- **Scope:** lab-bench pipeline; squeezing jar; claim-budget and sort-the-statement missions; honest-report mock-up labelled as teaching material.
- **Acceptance:** unlocks after any four chapters; every report block requires benchmark, confidence and provenance; no Soilytix product depicted.
- **Depends on:** T26, T28

### T31 — Glossary and review-status tooling

- **Goal:** reviewers can see and change what is approved.
- **Scope:** glossary unlocked by phenomena (WB§8.3); `tools/review-report.ts` listing nodes by status and reviewer; internal review overlay.
- **Acceptance:** report lists every node; glossary terms never appear before their phenomenon.
- **Depends on:** T10

### T32 — Sound mixer (off by default)

- **Goal:** optional ambient and event sound.
- **Scope:** WebAudio mixer; per-scale ambience; event cues with captions.
- **Acceptance:** off by default; every sound has a text equivalent; no autoplay.
- **Depends on:** T15

### T33 — Pilot instrumentation

- **Goal:** measure learning in a pilot (OD-13).
- **Scope:** opt-in pre/post questions keyed to misconceptions; local-only log; explicit export.
- **Acceptance:** nothing leaves the browser without user action; thresholds left configurable pending OD-13.
- **Depends on:** T10

### T34 — Playwright smoke and performance measurement

- **Goal:** end-to-end safety net.
- **Scope:** Playwright runs of prologue and ch. 2 (normal, reduced motion, static, keyboard-only); first-interactive timing.
- **Acceptance:** runs in CI; first interactive ≤ 2.5 s on throttled fast 4G profile.
- **Depends on:** T10

### T35 — Deploy pipeline

- **Goal:** ship to the decided target.
- **Scope:** publish workflow per OD-4 (recommended IAP-gated hub artifacts path, keyless auth); public profile per OD-5.
- **Acceptance:** blocked until OD-4 is decided; then a tagged build deploys and is reachable at the decided path.
- **Depends on:** T10, OD-4

---

## Parked

- **Chapter ★ — The Neighbour's Chemical Toolkit.** Blocked on OD-9 (bioassets/LOAM boundary). Textbook examples only when unblocked. Depends on T22, T25.
