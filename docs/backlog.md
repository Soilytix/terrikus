---
title: "Soil Worlds — Backlog"
description: "Ordered, independently mergeable tasks. T01–T10 (Build phase) are done; R01–R12 are review follow-ups."
status: Build phase done (919f9eb, review fixes 7469de3 + 36bc6ff); review follow-ups R01–R12 next, then T11 onward
date: 2026-10-06
---

# Soil Worlds — Backlog

Rules for every task:

- One task, one PR, green on `mise run check`.
- No pending open decision (spec §11) is settled inside a task; raise it in the PR.
- Content PRs carry sources and ship as `reviewStatus: draft`.
- References: spec (S§), world bible (WB§), art direction (AD§).

---

## Build phase (T01–T10) — done

All ten are merged on `main`. Three reviews (science, play/visual, engineering) followed at `919f9eb`; their high and medium findings in Build scope were fixed in `7469de3` (content) and `36bc6ff` (app). What remains is listed under **Review follow-ups** below. Known gaps against the Build acceptance text: T07 paint time is not yet measured on M1 (R10); T09 "scale stamp" and static/keyboard completion are covered by the smoke and by the keyboard-only run of `p-m1` (R08, done).

### T01 — Repository scaffold · Build phase · **done**

- **Goal:** an empty app that builds, tests and lints in CI.
- **Scope:** `mise.toml` (tasks: setup, install, dev, build, test, typecheck, hooks, lint, secrets, check, serve), `package.json` (pnpm 10), `vite.config.ts` (`base: './'`), `tsconfig.json` (strict), `index.html`, `src/main.tsx`, `src/app/App.tsx` (hash router stub), `.pre-commit-config.yaml` (pre-commit-hooks + local gitleaks via prek), ESLint/Prettier, `.github/workflows/ci.yml`, `README.md` (mario-style header, shields labelColor=16211B, TOC), `AGENTS.md` + `CLAUDE.md` symlink, `icons/icon.png`, `.editorconfig`, `.gitattributes`, `.gitignore`, `.env.example` (`SW_PROFILE`), `tools/budget.ts`.
- **Acceptance:** `mise run check` runs hooks, typecheck, vitest (one trivial test), build and budget, and passes locally and in CI; `dist/` works when opened from a nested path; README describes What it does / Install / Operations / Configuration / Where it runs / Development.
- **Depends on:** —

### T02 — Design tokens, world register and fonts · Build phase · **done**

- **Goal:** UI and world colours come only from tokens.
- **Scope:** `src/design-system/` vendored from platform `packages/design-system` v0.2.0 with `VENDORED.md` (commit, date, reason for platform over hub: S D-6); Tailwind v4 theme wiring; `src/styles/scene.css` (AD§3.2); @fontsource Inter and IBM Plex Mono; `tests/tokens.test.ts` (no raw hex outside the two token homes; no Lime in `scene.css`; no `--w-*` in `src/ui/`; contrast check for text-on-card pairs).
- **Acceptance:** a token sample page at `#/dev/tokens` (internal profile only) shows both registers; token tests pass; OD-1/OD-2 hexes are marked pending in `scene.css` comments.
- **Depends on:** T01

### T03 — Content schema, source registry and content safety · Build phase · **done**

- **Goal:** content is typed, sourced and safe before any chapter is written.
- **Scope:** `src/content/schema.ts` (S§5.2, including `Asset` type from AD§7), `src/content/sources.ts` (ids from `docs/sources.md` needed by P and ch. 2 at minimum), `src/content/misconceptions.ts` (M1–M25), `src/content/worlds.ts` (presets), `src/assets/manifest.ts` (empty typed list), `tests/content-lint.test.ts`, `tests/denylist.test.ts` + `tools/hash-denylist.ts`, `tools/bundle-scan.ts` (wired into `mise run check` after build), `SW_PROFILE` handling in `vite.config.ts`.
- **Acceptance:** lint fails on an unknown source id, on a registry id without a row in `docs/sources.md`, on a `Fact` without sources, and on a file in `src/assets/` without a manifest entry; denylist fails on a fixture containing a hashed token; `public` profile build fails on a `draft` node; all proven by failing-fixture tests.
- **Depends on:** T01

### T04 — Simulation core · Build phase · **done**

- **Goal:** a deterministic, exactly conserving teaching engine with the leaf-jar ruleset.
- **Scope:** `src/sim/ledger.ts`, `rng.ts`, `modifiers.ts`, `engine.ts`, `benches/leaf-jar.ts`; tests in `src/sim/*.test.ts`.
- **Acceptance:** conservation exact at every tick for all 18 lever combinations × 10 seeds; heat monotone; direction tests (moist > dry, waterlogged < moist, leaf > straw > wood, mild > cool); identical trajectories for identical inputs; no pool negative; engine has no DOM or React imports.
- **Depends on:** T01

### T05 — Save state · Build phase · **done**

- **Goal:** progress survives reloads and can be moved between browsers.
- **Scope:** `src/save/` (schema, storage with try/catch and in-memory fallback, `migrate`, export/import), zustand store wiring in `src/app/`.
- **Acceptance:** tests cover round-trip, corrupt JSON, unknown version refusal, storage throwing, lab-book cap 200; settings UI exports and imports a file; fallback shows a "progress will not be kept" note.
- **Depends on:** T01, T03

### T06 — World renderer shell · Build phase · **done**

- **Goal:** navigable nested scenes that are accessible without the canvas.
- **Scope:** `src/world/app.ts` (Pixi v8, DPR cap, pause when hidden), `camera.ts` (pan, 1–3× zoom, log-space portal transition), `scenes/` (generic scene builder from `Scene` data), `particles.ts` (flux-driven, from engine events), `fallback/` (static SVG mode, `?static=1`, WebGL failure), `src/ui/outline/` (DOM scene outline), `src/ui/hud/` (scale bar, not-to-scale badge, narration live region); lazy-loaded world chunk.
- **Acceptance:** two placeholder scenes at different scales with a portal; keyboard map from S§8.1 works; reduced motion swaps zoom for crossfade and freezes ambient; static mode renders the same scenes with hotspots; budget check passes with the world chunk split.
- **Depends on:** T02, T03

### T07 — Seeded plate painter (runtime) · Build phase · **done**

- **Goal:** beautiful, deterministic painted plates without an asset pipeline.
- **Scope:** `src/world/painter/` (isomorphic: runs in browser and Node), recipes for `field`, `profile`, `aggregate` and lab bench (AD§4.1), paper grain, stipple; painter output cached per seed and size.
- **Acceptance:** same seed and recipe give pixel-identical output (snapshot hash test in Node); plates use only `scene.css` tokens; paint time ≤ 150 ms per plate on M1 at 1440 px wide; static mode can use painter output as SVG/PNG.
- **Depends on:** T02, T06

### T08 — Notebook and cause-chain builder · Build phase · **done**

- **Goal:** the only reward system: rumor map, field cards, lab book, codex and chains.
- **Scope:** `src/ui/notebook/` (four tabs, WB§7.1), `src/ui/chains/` (cards by shape, connectors, batch confirmation, three verdicts, accepted variants, diagnostics by misconception id), evidence-tier styling (AD§6.4), contents screen as progress view.
- **Acceptance:** chains confirmable by keyboard and screen reader; batch feedback "N of M supported"; sequencing-only chains restricted to *is associated with*; no score, percentage or currency anywhere; lab-book entries persist via T05.
- **Depends on:** T03, T05

### T09 — Prologue: A Handful of Soil · Build phase · **done**

- **Goal:** the first five minutes.
- **Scope:** `src/content/chapters/prologue/` (scenes `p-field-dawn`, `p-handful`, `p-separated`, `p-pore`; missions `p-m1`, `p-m2`; codex; discoveries; organisms `bacteria-copio`, `bacteria-dormant`, `amoeba`, `fungi-sap` as in-house SVG placeholders), composition slider and reactive water/air sentence.
- **Acceptance:** playable from `#/` to the first rumor; prediction committed and shown beside result; result shown as a range with confidence; scale stamp recorded; chapters 1 and 2 unlock (1 shows "coming soon"); every fact sourced; keyboard-only and static mode completion.
- **Depends on:** T06, T07, T08

### T10 — Chapter 2: Where Did the Leaf Go? · Build phase · **done**

- **Goal:** the first complete experiment chapter, proving the engine and the loop.
- **Scope:** `src/content/chapters/leaf/` (scenes `c2-hedge-edge`, `c2-litter`, `c2-aggregate`, `c2-bench`; missions `c2-m1`–`c2-m5`; chains 1–3 with diagnostics; codex pages; discoveries), `src/ui/bench/` (≤4 levers, run/scrub, A/B compare with Lime/gold, stacked-area chart, "Carbon accounted for: 100.0 %", energy bar, teaching-model banner), Scientist lens v1.
- **Acceptance:** predict → run → compare → batch-confirm chains → transfer (incl. "cannot tell yet; measure X" accepted) → notebook entries → reload resumes mid-chapter; codex pages unlock only after their experiment; reduced motion uses step buttons; spec §13 Build acceptance all true.
- **Depends on:** T04, T08, T09

---

## Decisions taken during the review pass

Recorded here because the founder was unavailable; each can be reversed in one PR.

| Id | Decision | Why |
| --- | --- | --- |
| D-R1 | The home world is plain "Spinach", not "Spinach for seed production". | The seed-production framing adds nothing to the teaching. |
| D-R2 | Chain connectors are each link's own causal sign. A chain is contradicted when the product of its signs is opposite to the direction the run observed (`ChainTemplate.observed`). | One consistent meaning removes the "growth decreases decomposition" inversion. |
| D-R3 | A chain whose mechanism the bench cannot show (`ChainTemplate.untested`) caps at "plausible", with the reason shown. | The run observed slower mass loss; C:N is interpretation until T18. |
| D-R4 | Literature values the learner is shown carry the `reference` tier, not `observed` or `measured`. Teaching-model outputs (ledger, heat) are `derived`. | Golden rule 4. |
| D-R5 | The prologue water/air chain asks for the connector and a confidence, and is judged at once (`judgeNow`). Chapter 2 chains still batch. | "Build the chain" had nothing to build. |

---

## Review follow-ups (R01–R12, ordered by dependency)

Each is one PR, green on `mise run check`; visual ones also run `mise run e2e` and the screenshots are looked at. Source reviews: science (S), play/visual (P), engineering (E), all at `919f9eb`.

### R01 — Content model: chapter bundles and a bench registry (E5) · **done**

- **Problem:** adding a chapter or bench means editing engine and UI code. The `bench` step is typed against the leaf-jar levers (`src/content/schema.ts`), the router has one `#/bench/leaf-jar` route (`src/app/router.ts`), and chapter ids are hard-coded in `src/app/progress.ts` (`c2-bench-open`, `d-c2-conserved` → `r-c2-leaf`, `c.id === "leaf"`), `src/ui/Bench.tsx`, `src/ui/MissionPanel.tsx` and `src/app/App.tsx`. `src/content/index.ts` registers each chapter in five arrays.
- **Direction:** a `ChapterBundle { chapter, scenes, missions, codex, rumors }` exported per chapter, with `index.ts` building the lists from an array of bundles; bench step `{ bench: BenchId; a: Record<string,string>; b?: …; predict? }` with a `BENCHES` registry filled by each bench module and a `#/bench/:id` route; flag/rumor side effects moved into data (`onComplete: { flags, rumors }` on missions or steps). Behaviour is unchanged.
- **Acceptance:** `grep -rn '"leaf"\|c2-' src/app src/ui` finds no chapter ids outside content; the e2e smoke passes unchanged; content lint resolves bench ids; `mise run check` green.
- **Depends on:** —. **Blocks:** T13 and every later chapter.
- **Done:** chapters export a `ChapterBundle`; bench steps name a bench from `BENCHES` (`src/sim/benches/index.ts`) and open `#/bench/:id`; flags and rumors come from `onComplete`, `Chapter.rumor` and `Chapter.lens`; the water/air step names its flag. Progress and verdict tests moved to `tests/` since they read chapter content. Open: `src/app/verdict.ts` still ties the evidence "your water/air slider" to the flag `p-m1-slider` by name.

### R02 — The world reacts to the experiment (P1, P2 rest) · **done**

- **Problem:** "Separate the handful" and the water/air slider change only the side panel; the painted handful stays the same. Art direction says event motion is meaning.
- **Direction:** in `src/world/stage.ts` add a small scene-event API (`stage.event("separate" | "water", value)`) driven from `MissionPanel` through `WorldHandle`; the handful plate gets a layered "settled cylinder" overlay that eases in, and the pore/handful water layer tint follows the slider value. Reduced motion jumps to the end state; static mode shows the end state as a second plate. Also record the learner's guess on the `pore-space` field card ("You guessed X %").
- **Acceptance:** the canvas differs before and after "Separate the handful" and between slider extremes (pixel diff in a Playwright check); reduced motion has no tween; no text in the canvas; `mise run check` green.
- **Depends on:** —.

### R03 — Quality governor that actually steps down (P perf, E11 rest) · **done**

- **Problem:** on software GL (≈116 ms/frame) the governor in `src/world/stage.ts` (`govern`) needs 90 slow frames (~10 s) per step and never falls back to the static plate.
- **Direction:** time-based governor: median frame time over a 2 s window; above 33 ms drop ambient shaders, then particles, then switch `World` to static mode (`mode = "static"`) with a one-line note in Settings. Never touches labels or hotspots.
- **Acceptance:** a unit test drives `govern` with synthetic frame times and sees all three steps within 6 s; a Playwright run with `--use-angle=swiftshader` ends in static mode; `mise run check` green.
- **Depends on:** —. Feeds T15.

### R04 — Phone composition: observe step and portrait plates (P phone) · **done**

- **Problem:** on a 390 px phone the observe step's sheet covers the handful (one crumb visible); the handful's portal crumb floats and the root runs into empty space; the ladder covers the pore's hypha.
- **Direction:** a `portrait` branch in the `handful` and `pores` recipes (`src/world/painter/recipes/`) when `h > w`, anchoring the mound and hypha in the upper half; the mission sheet on phones caps at 45 % and the camera target shifts up while a step needs the scene; ladder collapses to the current rung on phones.
- **Acceptance:** phone screenshots `03-handful-observe` and `04-pore` show the subject above the sheet; painter snapshot tests updated deliberately; `mise run check` green.
- **Depends on:** —.

### R05 — Art polish: handful, pores, field, valley (P visual) · **done**

- **Problem:** the handful reads as identical stamped tiles with a sine-wave root and a flat chevron leaf; pore grains are near-identical eggs; the hypha is a thick white segmented tube; the field rows meet in a hard V seam and the mist is a flat band; valley plots look toy-scale against the 500 m bar.
- **Direction:** vary crumb size, rotation and tone per seed; branch the root with tapered noise; give grains a size and angularity distribution; draw hyphae thinner (≈⅓ width) and translucent; feather the vanishing point and break the mist with noise; scale the valley plots to the bar. World register colours only.
- **Acceptance:** before/after screenshots in the PR; painter determinism tests still pass; `tests/tokens.test.ts` passes; `mise run check` green.
- **Depends on:** R04 (same recipes).

### R06 — Curiosity cues and small UX fixes (P8, P9, P10) · **done**

- **Problem:** hotspots show names only on hover/focus, so the field gives no reason to click; the field has both "Go there" and "Pick up a handful"; the title chapter list reads "P / 2 / 1–14 Twelve more chapters".
- **Direction:** labels visible on a scene's first visit (until first scan) and a gentle pulse after 6 s idle (off in reduced motion); hide the panel's "Go there" when the target portal is visible in the scene; title list shows "Prologue · Chapter 2 · twelve more coming".
- **Acceptance:** e2e asserts a visible label on first visit to `p-field-dawn`; keyboard and screen-reader names unchanged; `mise run check` green.
- **Depends on:** —.

### R07 — Readable citations (P5) · **done**

- **Problem:** facts show raw source slugs (`soils4teachers-basics`) in monospace.
- **Direction:** derive a short label ("Weil & Brady 2017") in `tools/gen-sources.ts` from the citation and emit it as `short` in `src/content/sources.ts`; `FactItem` in `src/ui/common.tsx` shows it, with the full citation as tooltip and link.
- **Acceptance:** no slug visible in the observe-step screenshot; content lint still checks ids; `mise run check` green.
- **Depends on:** —.

### R08 — CI: one pass of the hooks, e2e and axe (E14) · **done**

- **Problem:** `.github/workflows/ci.yml` runs prettier/eslint/tsc twice (prek and `mise run check`); Playwright and any a11y check never run in CI.
- **Direction:** CI runs `prek run --all-files` for the hook-only checks (whitespace, gitleaks) and `mise run check` for the rest, without overlap; add a non-blocking `e2e` job running `mise run e2e` with `@axe-core/playwright` on title, one scene and the notebook, and a keyboard-only pass of the prologue (no mouse clicks). Screenshots are uploaded as an artifact, not committed.
- **Acceptance:** CI green; axe reports zero serious/critical issues on the three routes; the keyboard-only run completes `p-m1`.
- **Depends on:** —. Supersedes the CI part of T34.

### R09 — Ledger transfer assertions (E9) · **done**

- **Problem:** `transfer` in `src/sim/ledger.ts` clamps silently; a future bench with outflows larger than a pool would pass conservation tests while losing intended flux.
- **Direction:** `run` in `src/sim/engine.ts` (dev/test only) checks that each pool's total outflow in a tick does not exceed its start-of-tick value and throws `ConservationError` otherwise; a fixture bench in the test proves it fires.
- **Acceptance:** the new fixture test fails without the check; leaf-jar tests unchanged; `mise run check` green.
- **Depends on:** —. Before T18.

### R10 — Paint off the main thread and measure it (E8 rest, T07 acceptance) · **done**

- **Problem:** the valley takes ~57 ms and 2.3 MB of SVG per paint on the main thread; T07's "≤ 150 ms per plate on M1" was never measured.
- **Direction:** move `paint` (pure, deterministic) into a module worker used by `stage.build` and the static fallback; add `tools/plate.ts --bench` printing per-recipe paint time.
- **Acceptance:** worker output equals main-thread output for every recipe (snapshot hash test); bench output in the PR; no frame over 50 ms during a portal zoom in a Playwright trace; `mise run check` green.
- **Depends on:** —.
- **Outcome:** `paint` runs in `src/world/painter/paint.worker.ts` via `remote.ts` (main-thread fallback); `remote.test.ts` hashes worker against main thread for every recipe; `tools/plate.ts --bench`; `e2e/paint-worker.spec.ts` profiles a portal zoom and asserts no painting on the main thread. The 50 ms bar is not met: GL texture upload of the SVG layers (`texImage2D`) and the governor's fallback still make long main-thread tasks under software GL, and T07's ≤ 150 ms on M1 still needs a quiet machine (bench numbers swung 2.5× on a loaded host).

### R11 — Science follow-ups needing full text (S M1, L1, L2) · **done**

- **Problem:** three claims were softened rather than confirmed: the pore-occupancy figure (now "a few percent at most", `young-crawford-2004`, `young-ritz-2000`), the bacteria count (now "10⁸–10¹⁰ depending on method", NRCS only), and the Anthony 2023 species share (caveat dropped).
- **Direction:** read the full texts; add `torsvik-ovreas-2002` for direct counts; set the exact figure and page in `docs/sources.md` notes; keep "active" and "occupancy" as separate claims. A named scientist reviews prologue and chapter 2 and moves nodes to `approved` (agents never do).
- **Acceptance:** each claim cites a source whose text states it; `docs/sources.md` rows `doi-checked`; `mise run check` green.
- **Progress (2026-10-06):** bacteria count now also cites `raynaud-nunan-2014` (direct thin-section counts, full text read); the Anthony 2023 share carries the phage caveat its text states. Still open: the pore-occupancy figure (no open full text of `young-crawford-2004` or `young-ritz-2000`) and `torsvik-ovreas-2002` (no open full text). See `docs/sources.md` §2, Full-text checks.
- **Done (2026-10-07):** full texts read. `young-crawford-2004` p. 1634 gives about 10⁻⁶ % of the soil's *surface area* covered by microbes, not a share of pore space; `pore-cover` and `p-cover` now state the surface figure and cite only it. `young-ritz-2000` states no occupancy figure and is dropped from both facts. `torsvik-ovreas-2002` is registered and cited by `p-bact-gram` (p. 240). Page-level notes in `docs/sources.md` §2. All nodes stay `draft`.
- **Depends on:** a named reviewer for the approval part, which is outside this item's acceptance.

### R12 — Public-repo hygiene of `docs/research/` (S L14) · **done**

- **Problem:** `docs/research/internal-assets.md` contained internal vault paths, the internal hub host, bucket names and notes on which items came from customer material.
- **Direction:** redacted in place (no move): paths, hosts, buckets and customer-derived notes removed, licence conclusions kept; `tests/denylist-hashes.json` gains hashes for the bucket names and vault path prefixes.
- **Acceptance:** a grep of `docs/` for bucket URLs, the internal hub host and the share bucket finds nothing; denylist test covers the new hashes; `mise run check` green.
- **Depends on:** —. **Blocks:** making the GitHub repo public. No longer blocks OD-5, which stays open.

### Se1 — E2E port per worktree · **done**

- **Problem:** `playwright.config.ts` hard-coded port 4173 with `reuseExistingServer: true`, so two worktrees running `mise run e2e` at once collided or tested each other's build.
- **Direction:** the config reads `E2E_PORT` (default 4173) for `baseURL` and the preview server and never reuses a server; `mise run e2e` picks a free port when `E2E_PORT` is unset; `mise run serve` keeps 4173.
- **Acceptance:** two `mise run e2e` invocations in two worktrees at the same time both pass.
- **Depends on:** —.

---

## Later (T11–T35, ordered)

### T11 — Asset manifest, build profiles and credits panel · **done**

- **Goal:** every bundled asset is accounted for and creditable.
- **Scope:** populate `src/assets/manifest.ts`; credits panel in settings; `cc-by-sa/` isolation folder; designer-infographics import path for the internal profile only.
- **Acceptance:** public build fails on `publicOk: false`; credits list every bundled asset with attribution; bundle scan still clean.
- **Depends on:** T03
- **Done:** every manifest entry carries an attribution; `INTERNAL_ASSETS` (empty) and `bundledAssets(profile)` split out `designer-infographics/`, which a Vite plugin loads as nothing in the public profile and the public bundle scan forbids; `cc-by-sa/` holds CC BY-SA files only (content lint); `src/ui/Credits.tsx` in Settings lists every bundled asset plus the two fonts. Open: OD-6 decides when designer infographics may leave internal.

### T12 — In-house organism sprite library and atlas · **done**

- **Goal:** all §4 cast drawn to AD§6.2.
- **Scope:** `src/assets/organisms/*.svg`, atlas build, group-badge shapes, true-size data.
- **Acceptance:** every organism in WB§4 has an SVG with manifest entry, reference URL and truth tag; atlas loads in ≤ 1 draw call per scene layer.
- **Depends on:** T06, T11

### T13 — Chapter 1: The Pore Labyrinth · **done**

- **Goal:** texture, structure, pores; the amoeba avatar.
- **Scope:** port the prototype water-film graph (BFS) into `src/sim/films.ts`; chapter content `c1-*`; feel-test flow diagram; slake test.
- **Acceptance:** missions `c1-m1`–`c1-m4` playable; film connectivity tests; amoeba moves only along connected films; OD-10 respected (guided movement unless decided otherwise).
- **Depends on:** T10, T12
- **Done:** `src/sim/films.ts` (film graph, BFS `route`, `hop` refuses broken films and too-narrow pores, `grazerWeek`) and `src/sim/aggregates.ts` (slake, binding agents under tillage); content in `src/content/chapters/c1/`; recipes `c1-grain-ruler`, `c1-aggregate-cut`, `c1-labyrinth`; e2e `e2e/c1.spec.ts`. Movement is guided (OD-10 still pending). Open: the scientist-lens porosity payoff and the two expected chains; the texture triangle is not vendored; the aggregate plate budget is at 2.49 / 2.5 MB.

### T14 — Offline plate baker and time-lapse · **done**

- **Goal:** higher-quality AVIF plates and stillwet-style time-lapses.
- **Scope:** `tools/bake-plates.ts` using the T07 painter in Node; AVIF output; time-lapse frame sets; plate budget check.
- **Acceptance:** baked plates match runtime painter for the same seed; ≤ 2.5 MB per scale; runtime falls back to painter when a plate is missing.
- **Depends on:** T07

### T15 — Living-backdrop shaders and quality governor · **done**

- **Goal:** lively backdrops S1–S9 within budget.
- **Scope:** `src/world/shaders/`, quality tiers, governor, dimming during reading (AD§5.4), ambient toggle in settings.
- **Acceptance:** 16.6 ms frames on reference hardware at high tier; governor steps down under load; reduced motion freezes all; OD-8 raised in PR.
- **Depends on:** T06, T14
- **Done:** S1 grain, S3 painterly flow, S7 scale dissolve and S9 microscope look as WebGL filters; S2 sway and S4 drift stay the stage's displacement and CPU particles. Tiers high/medium/off by scale (`src/world/shaders/tiers.ts`); the governor steps high → medium → off → no particles → static. S5, S6 and S8 follow simulation state and arrive with their chapter benches. Ambient toggle in settings is the OD-8 interim; reference-hardware frame time still to be confirmed at a visible display.

### T16 — Valley map, contents and retrieval prompts · **done**

- **Goal:** navigation across chapters and return visits.
- **Scope:** landscape-scale valley map scene; unlock rules; full Rumor Map; recall cards on return (WB§7.4).
- **Acceptance:** chapter unlocks follow WB§1 progression; recall prompt appears on return; keyboard and static mode work.
- **Depends on:** T10, T13

### T17 — Chapter 3: Water Roads · **done**

- **Goal:** matric potential, films as roads, Birch pulse.
- **Scope:** water-potential rules in `sim/`; content `c3-*`; S5/S6 use.
- **Acceptance:** missions playable; drainage order test (largest pores first); Birch pulse direction test; "unresolved" source attribution accepted.
- **Done:** `src/sim/water.ts` (d ≈ 300/|ψ| drainage, the drying film graph, the Birch pulse on the integer ledger, matrix front and burrow bypass); four missions on `c3-drain` (unbaked, aggregate plates at budget) and `c3-rain-profile`; an `Attribution` with `shares: "unresolved"` in the content model. S5 film and S6 front filters are in `src/world/shaders/index.ts` with uniforms from `filmLook`/`frontLook`; attaching them to the stage waits for `src/world/stage.ts` (R02). `c3-root-pull` and the two chapter chains are deferred.
- **Depends on:** T13, T16

### T18 — Nitrogen engine · **done**

- **Goal:** multi-element ledger rules for N.
- **Scope:** mineralisation, immobilisation, nitrification, denitrification, leaching, grazing-N rules; C:N coupling; tests.
- **Acceptance:** N conservation exact; immobilisation dip with high C:N; denitrification only when fO2 low; priming stretch for ch. 2 enabled.
- **Depends on:** T04

### T19 — Chapter 4: Breath and Rust (rice) · **done**

- **Goal:** O₂, microsites, redox ladder, trade-offs.
- **Scope:** redox rules; paddy world art; redox elevator scene; content `c4-*`.
- **Acceptance:** ladder order enforced in rules; drain-the-paddy shows both CH₄ and N₂O with no verdict score.
- **Done:** `src/sim/redox.ts` (electron-conserving ladder column, anoxic microsites by wetness and crumb size, a 100-day paddy season flooded or drained in spells with N₂O from the unchanged nitrogen ledger); three missions on `c4-paddy` and `c4-elevator` (both baked); drain-the-paddy shows two curves and per-gas totals, no combined number. `c4-m4` (Q10), `c4-fog`, the chapter chains and new misconception ids are deferred.
- **Depends on:** T16, T18

### T20 — Chapter 6: Who Eats Whom · **done**

- **Goal:** food web, microbial loop, compositional preview.
- **Scope:** food-web mobile; grazing rules; geosmin scene; content `c6-*`.
- **Acceptance:** link reveal by observation only; squeezing-jar preview caption persistent; no organism labelled good or bad (copy lint).
- **Depends on:** T12, T18
- **Done:** `src/sim/food-web.ts` (grazing rules, conserving for every removal set); missions c6-m1–m4 and c6-m6 with the mobile, ripple run, geosmin scene (`recipes/c6-geosmin.ts`) and squeezing jar. Deferred: c6-m5 (phages), c6-m7, the forest-litter scene and cause chains. Protist avatar is guided pending OD-10; predator badge is text-only (art-direction §6.2).

### T21 — Chapter 7: The Root's Neighbourhood · **done**

- **Goal:** rhizosphere gradients, exudates, recruitment.
- **Scope:** exudation rules; root-tip shader S8; bare-vs-planted comparison; content `c7-*`.
- **Acceptance:** C and N conserved through exudate → bloom → grazing → uptake; contested exudation share shown as a band.
- **Depends on:** T20
- **Done:** `src/sim/rhizosphere.ts` (exudation share and bare plot on the T20 food-web rules, conserving for every plot, band end, water and removal set); missions c7-m1–m4 on the `c7-root-tip` scene (`recipes/c7-root-tip.ts`, baked); every planted result is a 5–21 % range. Deferred: the S8 root-tip shader (T15's lane), the `c7-home-away` and `c7-season` scenes and the cause chain.

### T22 — Chapter 8: Partners and Traders · **done**

- **Goal:** mycorrhiza, nodules, phosphorus.
- **Scope:** trade and P-sorption rules; nodule and arbuscule scenes; pea/bean/spinach/beet contrast; content `c8-*`.
- **Acceptance:** spinach and beet show no partner; pea/bean partner specificity enforced; wood-wide-web item uses open-question treatment.
- **Depends on:** T21
- **Done:** `src/sim/trade.ts` and `src/sim/sorption.ts` (root/hair/acid/fungus P uptake with C paid, pH-dependent sorption, conserving P and C for every crop, soil P, pH and strategy) and `src/sim/nodules.ts` (rhizobia specificity, pink vs white nodules, nitrate off-switch, conserving N and C); missions c8-m1–m7 on the baked `c8-nodule` and `c8-arbuscule` scenes; spinach and sugar beet form no partner in either rule set; the forest-network claim sort uses the open-question card. Deferred: the `c8-depletion-halo` and `c8-forest-network` scenes and the cause chains.

### T23 — Chapter 9: The Nitrogen Relay · **done**

- **Goal:** N cycle stage by stage on the sugar beet world.
- **Scope:** `straw-n` bench; relay scene; content `c9-*`.
- **Acceptance:** "N accounted for: 100.0 %"; gene ≠ rate mission requires a second measurement; no customer framing.
- **Depends on:** T18, T21
- **Done:** `src/sim/benches/straw-n.ts` (T18 nitrogen rules plus beet uptake and NH₃ loss; the ledger gains N pools `plant` and `nh3Out`; conserving for all 16 lever sets); missions c9-m1–m4 on the `c9-relay` scene (`recipes/c9-relay.ts`, baked); the gene ≠ rate claim stays locked until a 7-day incubation is measured. Deferred: the `c9-beet-field` scene, c9-m5, the cause chains and misconception ids for the new chapter 9 misconceptions (kept clear of T22's lane).

### T24 — Chapter 5: Charged Surfaces · **done**

- **Goal:** CEC, clays, pH.
- **Scope:** exchange rules; platelet scene; pH dial; content `c5-*`.
- **Acceptance:** leaching of anions vs retention of cations shown; pH-predictor mission accepts association-not-cause answer.
- **Depends on:** T16, T18
- **Done:** `src/sim/exchange.ts` (integer cation exchange, strongest-held first, rain drains the soil water, every ion conserved; pH dial teaching curves, aluminium below pH 5.5); content in `src/content/chapters/c5/`; recipe `c5-platelet` (baked, cell scale); `src/ui/Exchange.tsx`, `src/ui/PhDial.tsx`; opens from the map's acid woodland edge; e2e `e2e/c5.spec.ts`. Open: `c5-vertisol`, `c5-m4` (acidification by ammonium fertiliser), the water-versus-CaCl₂ lens payoff and the two expected chains.

### T25 — Chapter 10: Disease and Defence

- **Goal:** disease triangle, rotations, suppressive soils, evidence ladder.
- **Scope:** rotation inoculum rules; suppressive transfer experiment; content `c10-*`.
- **Acceptance:** "present is not sick" enforced in diagnostics; evidence ladder rungs unlock bounded claims.
- **Depends on:** T22

### T26 — Measurement engine · **done**

- **Goal:** instruments over true state.
- **Scope:** `src/sim/measure.ts` (sampling, detection limits, seeded noise, compositional closure, relic DNA, copy number); lab-bench scene.
- **Acceptance:** compositional reads always sum to 100 %; spike-in recovers absolute direction; noise only from seeded PRNG.
- **Depends on:** T04

### T27 — Chapter 11: Pit Walls and Deep Time · **done**

- **Goal:** pedogenesis, horizons, catena.
- **Scope:** profile scenes; pedogenesis time-lapse (T14); catena; content `c11-*`; WRB examples (OD-11 raised).
- **Acceptance:** time-compression label always visible; mottle detective accepts several defensible answers.
- **Done:** `src/sim/pedogenesis.ts` (horizons from climate, litter, parent material and time; years per cm from 0.3–1.4 t/ha/yr) and `src/sim/catena.ts` (three pits down one hill, redox from a seasonal water table, the detective pit's defensible readings); four missions on `c11-pit` and `c11-catena`; the `c11-timelapse` frames (`pitWall(years)` at 0, 100, 1,000 and 10,000 years) baked by `tools/bake-plates.ts` as it is. WRB names are labelled examples (OD-11 open). `c11-munsell` and the two chapter chains are deferred.
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

### T31 — Glossary and review-status tooling · **done**

- **Goal:** reviewers can see and change what is approved.
- **Scope:** glossary unlocked by phenomena (WB§8.3); `tools/review-report.ts` listing nodes by status and reviewer; internal review overlay.
- **Acceptance:** report lists every node; glossary terms never appear before their phenomenon.
- **Depends on:** T10
- **Done:** `src/content/glossary.ts` seeds 14 of the WB§8.3 terms whose phenomena are playable (prologue, chapter 2); the rest arrive with their chapters. `mise run review-report`; internal overlay is read-only. Approval waits on OD-7.

### T32 — Sound mixer (off by default) · **done**

- **Goal:** optional ambient and event sound.
- **Scope:** WebAudio mixer; per-scale ambience; event cues with captions.
- **Acceptance:** off by default; every sound has a text equivalent; no autoplay.
- **Done:** `src/audio/mixer.ts` (synthesised in WebAudio, no audio files; no AudioContext until the learner turns sound on), `settings.sound` in the save, the Settings section and caption strip in `src/ui/Sound.tsx`; the ambient toggle silences the bed and reduced motion holds its swell still.
- **Depends on:** T15

### T33 — Pilot instrumentation · **done**

- **Goal:** measure learning in a pilot (OD-13).
- **Scope:** opt-in pre/post questions keyed to misconceptions; local-only log; explicit export.
- **Acceptance:** nothing leaves the browser without user action; thresholds left configurable pending OD-13.
- **Done:** `src/pilot/` (draft instrument, null thresholds, own storage key) and the Settings section in `src/ui/Pilot.tsx`; instrument and thresholds still wait on OD-13.
- **Depends on:** T10

### T34 — Playwright smoke and performance measurement · **done**

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
