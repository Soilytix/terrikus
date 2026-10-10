---
title: "Terrikus — Spec"
description: "Agent plan for the Terrikus web app: why, how, what, open decisions, steps and acceptance."
status: draft — Build phase ready to start; open decisions listed in §11
date: 2026-10-06
---

# Terrikus — Spec

Companion documents: `world-bible.md` (content), `art-direction.md` (look and motion), `backlog.md` (ordered tasks), `sources.md` (bibliography). Research behind these decisions is in `docs/research/`.

## 1. Why

The vault prototype (`team/eng/soil-worlds/index.html`, a 417-line single-file SVG game) showed that a soil world you can poke teaches better than a page you read. It is too small to grow: one scene, inline tokens, no content model, no sources, a customer name in the copy.

Terrikus becomes a **playable soil science textbook**: one generic valley, six nested scales, about fifteen chapters, each a place with experiments. A reader leaves with correct mental models of soil as a habitat, of carbon, water, nitrogen and life in soil, and of **what a measurement can and cannot tell you**.

What changes for people:

- **Soilytix team and new hires:** a shared, sourced picture of soil science and of the evidence ladder (measurement → derived → interpretation → recommendation) the company works by.
- **Customers and partners (seed/breeding and agri-input scientists):** a credible, beautiful explainer for why sampling protocol, benchmarks and confidence matter. It shows no Soilytix product, capability or result.
- **Public (later, after review):** an approachable textbook with no points, scores or leaderboards.

It is **not** a product demo, a soil-health score, a grower tool or a marketing claim.

## 2. How

### 2.1 Approach

A static web app. A typed content layer (chapters, scenes, organisms, processes, missions; every fact cites a source id) drives a **deterministic, mass-conserving teaching simulation** and a **layered 2D world renderer**. UI text and controls are DOM over a WebGL canvas. The app builds to static files with relative paths, so the deploy target can stay undecided.

### 2.2 Rejected approaches

| Option | Why rejected |
|---|---|
| Grow the single-file SVG prototype | No content model, no tests, no bundling; SVG struggles with layered painted plates and shaders |
| Game engine (Unity, Godot web export) | Heavy bundles, poor DOM accessibility, text in canvas, foreign toolchain for the team |
| Three.js / 3D world | 3D adds cost without teaching value; scale nesting is a 2D storytelling device |
| Phaser | Game-object model and scene manager fit arcade games; we need DOM-first UI and a custom scale camera |
| Plain Canvas 2D | No shader backdrops (stillwet-style liveliness), weaker batching for particles |
| pixi-viewport for camera | Continuous zoom does not fit discrete semantic scale nodes with portals |
| Process-based soil model (RothC, Century) as the sim | Calibrated models imply prediction; we need direction-correct teaching rules with exact conservation and readable code |
| Next.js / SSR | No server need; static build is simpler to host behind IAP or a CDN |
| CMS for content | Content must be typed, linted and reviewed with code; TS modules give compile-time checks |

## 3. What

### 3.1 Stack

| Concern | Choice |
|---|---|
| Toolchain | mise (Node 22, pnpm 10) as toolchain owner and task runner |
| Build | Vite 7, `base: './'`, static `dist/` |
| Language | TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| UI | React 19, Tailwind v4 with vendored design-system tokens |
| World renderer | PixiJS v8 (WebGL2; WebGPU when available) |
| State | zustand (UI/session state); the simulation is plain TS outside React |
| Routing | Hash routes, no router library: `#/`, `#/ch/<chapter>/<scene>`, `#/bench/<bench>`, `#/notebook/<tab>` |
| Tests | vitest (sim, content lint, save, tokens); Playwright smoke later (T34) |
| Lint gate | prek running pre-commit hooks + local gitleaks, ESLint, Prettier, typecheck |
| CI | One GitHub Actions workflow running `mise run check` |
| Fonts | @fontsource Inter and IBM Plex Mono (self-hosted, OFL) |

### 3.2 Repository layout

`AGENTS.md` § Layout is the authoritative map of the tree; this section does not repeat it, so the two cannot drift. In short: `src/app` (shell, router, store), `src/content` (typed content and source registry), `src/sim` (ledger, engine, benches; no DOM), `src/world` (Pixi renderer, camera, painter, shaders), `src/ui` (notebook, bench, chain builder, HUD, panels), `src/save`, `src/pilot`, `src/styles` (world register), `src/design-system` (vendored tokens, hash-checked by `tests/vendored.test.ts`), `src/assets` (with `manifest.ts`), `tools/`, `tests/`, `e2e/`.

## 4. World model

Six scales (landscape, field, profile, aggregate, rhizosphere, cell) form a **graph of scale nodes**, not a continuous zoom. Each scene belongs to one scale and declares portals to scenes at adjacent scales. The camera pans within a scene, zooms 1–3× within its scale, and plays a log-space zoom transition (art-direction §5.2) when the player takes a portal. The lab bench is a non-spatial overlay reachable from any scene.

## 5. Content model

### 5.1 Principles

- Content is typed TS data, not prose blobs. Code never hard-codes a fact.
- Every `Fact` has `sources: SourceId[]` (non-empty) and `confidence`.
- Every content node has `reviewStatus` and, where simplified, a `simplification` note.
- Customer names never appear (enforced, §9).

### 5.2 Types (abridged; `src/content/schema.ts` is authoritative once written)

```ts
type SourceId = Brand<string, 'SourceId'>;
type Confidence = 'firm' | 'estimate' | 'contested';
type EvidenceKind = 'measured' | 'derived' | 'inferred';
type ReviewStatus = 'draft' | 'in-review' | 'approved' | 'needs-changes';
type Scale = 'landscape' | 'field' | 'profile' | 'aggregate' | 'rhizosphere' | 'cell';
type TruthTag = 'reference-drawn' | 'schematic' | 'decorative';

interface Fact { id: string; text: string; confidence: Confidence; evidence?: EvidenceKind;
  sources: SourceId[]; simplification?: string }

interface Organism { id: string; name: string; group: GroupBadge; sizeRange: [Length, Length];
  scales: Scale[]; eats: string[]; eatenBy: string[]; transforms: string[]; needs: string[];
  howWeKnow: ('microscopy'|'culture'|'dna'|'process')[]; facts: Fact[]; art: AssetId;
  truthTag: TruthTag; misconceptions: MisconceptionId[]; reviewStatus: ReviewStatus }

interface Process { id: string; name: string; inputs: PoolId[]; outputs: PoolId[];
  conditions: string[]; ruleId?: RuleId; facts: Fact[]; reviewStatus: ReviewStatus }

interface Scene { id: string; scale: Scale; world: WorldId; layerRecipe: RecipeId;
  portals: { to: string; anchor: Point; label: string }[]; objects: SceneObject[];
  description: string; notToScale?: number; scaleBar: Length }

interface Bench { id: string; levers: Lever[] /* ≤4 */; initialState: PoolState;
  rulesetId: RuleId; timeline: { days: number; secondsPerDay: number }; readouts: Readout[] }

interface Mission { id: string; chapter: ChapterId; title: string; rumorTrigger?: RumorId;
  tier: 'T1'|'T2'|'T3'|'T4'; learningObjective: string; misconceptionsTargeted: MisconceptionId[];
  bench?: BenchId; prediction: Prediction; steps: Step[]; chainsExpected: Chain[];
  diagnostics: Diagnostic[]; transfer?: TransferQuestion; codexUnlocks: CodexId[];
  sources: SourceId[]; reviewer?: string; reviewStatus: ReviewStatus; simplificationNotes: string[] }

interface CauseCard { id: string; kind: 'condition'|'actor'|'process'|'outcome'; label: string }
type Connector = 'increases'|'decreases'|'enables'|'limits'|'only-if'|'releases'|'is-associated-with';
interface Chain { id: string; links: { from: string; via: Connector; to: string }[];
  accepted: Chain['links'][]; sequencingOnly?: boolean }

interface Discovery { id: string; statement: string;
  evidenceTier: 'observed'|'derived'|'interpreted'|'would-do' }

interface Chapter { id: ChapterId; number: string; title: string; rumor: RumorId; scales: Scale[];
  world: WorldId; scenes: string[]; missions: string[]; codex: CodexId[];
  misconceptions: MisconceptionId[]; contested: string[]; unlock: UnlockRule;
  sources: SourceId[]; reviewStatus: ReviewStatus }
```

Plus `Rumor`, `Misconception`, `CodexEntry`, `World`, `Asset` (art-direction §7).

### 5.3 World presets

`worlds.ts` holds `spinach`, `pea`, `bean`, `sugarbeet`, `rice`, `forest`, `bare` with root architecture, mycorrhizal status, partner, residue C:N and season calendar. Presets change art and bench defaults, never rules.

## 6. Simulation

### 6.1 Invariants

1. **Deterministic.** Same ruleset, levers and seed give identical trajectories.
2. **Mass-conserving.** Integer ledger units; every rule is a double-entry transfer (`from -= x; to += x`). Sum over pools, including boundary sinks (`co2Out`, `drainage`, `n2Out`), is constant per element at every tick. The engine asserts after every tick; it throws in dev and test, and logs plus halts the bench in prod.
3. **Bounded.** Transfers are clamped to `[0, from]`; no pool goes negative; timeline is finite (≤ 3,650 compressed days).
4. **Energy ledger.** Chemical energy in organic pools only decreases; heat output is monotone.
5. **Noise only in measurement.** The PRNG (mulberry32, seeded) is used by the measurement layer and particle jitter, never by the true-state rules.
6. **Direction, not prediction.** Rates are teaching values. Every bench shows the teaching-model banner.

### 6.2 Partitions

Splits are integer partitions so conservation is exact: `toBiomass = floor(flux * cue); toCO2 = flux - toBiomass`.

### 6.3 Modifiers

Piecewise-linear, from `modifiers.ts`: `fT` (Q₁₀ = 2 around 20 °C), `fW` (water-filled pore space), `fO2` (falls above WFPS ≈ 0.7), `quality` (residue).

### 6.4 Leaf-jar ruleset (Build phase)

Pools: `L` litter, `D` dissolved C, `B` microbial biomass, `M` mineral-associated C, `co2Out`. Initial `L = 10,000` units.

| Rule | Transfer | Rate |
|---|---|---|
| depolymerisation | L → D | `kL · fT · fW · fO2 · quality` |
| uptake-cue | D → B + co2Out | `kU · fW`, split by CUE (leaf 0.45, straw 0.35, wood 0.30) |
| maintenance-resp | B → co2Out | `kM · fT` |
| necromass-formation | B → D, with fraction φ = 0.25 to M | `kD` |
| maom-desorption | M → D | `kMD` (very slow) |

Lever mapping: water dry/moist/waterlogged = WFPS 0.20/0.60/0.95 → fW 0.15/1.0/0.8, fO2 1.0/1.0/0.25; temperature 10/20 °C → fT 0.5/1.0; residue quality leaf 1.0, straw 0.5, wood 0.15.

Tests assert **directions**, not numbers: moist > dry (litter lost by day 180); waterlogged < moist; leaf > straw > wood; mild > cool; conservation exact at every tick for every lever combination (property test over all 18 combinations and 10 seeds); heat monotone.

Nitrogen rules (T18) live in `src/sim/nitrogen.ts`: `withNitrogen` wraps a carbon bench, couples N to C at each source pool's C:N, and adds mineralisation, immobilisation (microbes at 8:1), nitrification, denitrification (only when fO2 < 0.5), leaching, grazing and priming by N mining from old organic matter (`O`, CO₂ to `co2Old`).

### 6.5 Measurement layer (later, T26)

Instruments read true state through sampling (core count, depth), detection limits, seeded noise and compositional reads (closure to 100 %). Measurements are rendered as the *measured* evidence tier; derived quantities show their formula.

## 7. Save state

- Key `terrikus:v1` in `localStorage` (read from the pre-rename `pedologicus:v1`, then `soilworlds:v1`, when empty); every read and write wrapped in try/catch; in-memory fallback with a visible "progress will not be kept" note.
- Schema: `{ schemaVersion, createdAt, settings, chaptersUnlocked, rumors, cards, labBook[] (cap 200, oldest dropped), chains, predictions, lastSession, pilot? }`.
- `migrate(vN → vN+1)` per version, tested with fixtures.
- Export/import as JSON from settings; import validates and refuses unknown versions.
- No network, no analytics. Pilot instrumentation (T33) stays local and exports by explicit user action.

## 8. Accessibility and performance

### 8.1 Accessibility (target WCAG 2.2 AA)

- The canvas is `aria-hidden`. A **DOM scene outline** (`<nav>` with real buttons for every interactive object and portal) is the accessible scene.
- `aria-live="polite"` narration for every event motion.
- Keyboard: Tab/Shift-Tab through outline; Enter/Space activate; `+`/`−` zoom within scale; arrows pan; `[` `]` previous/next portal; `L` lens; `N` notebook; `?` help; `Esc` close.
- Reduced motion and static mode per art-direction §8; `?static=1` forces static.
- No colour-only cues; text on glass cards; 4.5:1 contrast.
- Every chapter completable by keyboard alone (Build acceptance).

### 8.2 Performance budget (CI-enforced by `tools/budget.ts`)

| Item | Budget |
|---|---|
| Initial JS (shell, gz) | ≤ 200 KB |
| World chunk (Pixi + world, gz) | ≤ 400 KB |
| Plates per scale (later, AVIF) | ≤ 2.5 MB |
| Frame time | 16.6 ms on Apple M1 / Intel Iris Xe at DPR ≤ 2 |
| First interactive scene | ≤ 2.5 s on a cold load over fast 4G (measured in T34) |

Quality governor: rolling frame time > 20 ms for 2 s drops a tier (shaders → parallax → particle density). Render loop pauses when hidden. DPR capped at 2.

## 9. Content safety and build profiles

- **Customer denylist.** `tests/denylist-hashes.json` holds SHA-256 hashes of lowercase customer and variety tokens (generated by `tools/hash-denylist.ts` from a list kept outside the repo). `tests/denylist.test.ts` scans all of `src/` and `docs/`, `docs/research/` included (the repository is public), plus `README.md`, `AGENTS.md` and `index.html`, and fails on any hit. The names themselves are never committed.
- **Source registry.** Content-lint (T03) fails if content cites an id missing from `sources.ts`, or if `sources.ts` holds an id with no row in `docs/sources.md`.
- **Build profiles** via `SW_PROFILE=internal|public`:
  - `internal` (default): all content; anything not `approved` shows a "Scientific review pending" badge; internal-only assets allowed.
  - `public`: build fails on any content node not `approved` or any asset with `publicOk: false`.
- **Bundle scan.** After build, fail if any BioRender or strangespecimens file is present.
- No Soilytix capability, product or result is depicted as real (world-bible §9).

## 10. Decision log

| # | Decision | Rationale | Rejected |
|---|---|---|---|
| D-1 | Static Vite + TS + React app | Simple hosting, typed content, team-familiar stack (hub uses the same) | SSR frameworks; game engines |
| D-2 | PixiJS v8 for the world, DOM for all text and controls | Shader backdrops and batched particles; accessibility and typography stay in DOM | Three.js, Phaser, Canvas 2D, SVG-only |
| D-3 | Discrete scale nodes with portals and own camera | Nested semantic scales teach scale; continuous zoom blurs them | pixi-viewport, infinite zoom |
| D-4 | Deterministic integer double-entry ledger | Exact conservation is the lesson; testable; readable | Floating-point ODEs; calibrated process models |
| D-5 | Hash routing and relative base | Prefix-agnostic deploy while OD-4 is open | React Router with absolute base |
| D-6 | Vendor tokens from platform `packages/design-system` v0.2.0, not the hub copy | Platform is canonical; the hub copy is stale. The task text named hub; this deviation is deliberate and recorded in `VENDORED.md` | Hub copy; npm dependency on an unpublished package |
| D-7 | Local `scene.css` world register | Illustration needs earth pigments the UI system should not carry | Extending the design system; raw hexes in components |
| D-8 | Runtime seeded painter in the Build phase; offline AVIF baking later | Unblocks beauty without an asset pipeline; same painter bakes later | Hand-painted plates first (blocks on artist); stock images (licence, style) |
| D-9 | TS modules for content, linted and reviewed in PRs | Compile-time checks, source enforcement, provenance in git | CMS, Markdown front-matter only |
| D-10 | First playable chapter is "Where Did the Leaf Go?" | Proposal's recommended mission; exercises conservation, A/B, chains, transfer | Pore Labyrinth first (port-heavy, less engine coverage) |
| D-11 | No points, scores, currency or leaderboards; notebook is the reward | Learning-science evidence; company rule against universal scores | XP, badges, streaks |
| D-12 | Generic crop worlds only; hashed customer denylist | Customer confidentiality; names never committed even in tests | Plain-text denylist; manual review only |
| D-13 | WRB names as examples in ch. 11 (recommended, see OD-11) | International, matches European context | USDA Soil Taxonomy |
| D-14 | Qualitative-direction rates with teaching values (recommended, see OD-12) | Avoids implying prediction | Calibrated quantitative rates |
| D-15 | Save in localStorage with export/import; no network | Privacy, no backend, works offline | Accounts; server sync |

## 11. Open decisions

An agent must not settle a pending decision; it raises it and builds around it.

| # | Decision | Status | Who decides | Build-phase impact |
|---|---|---|---|---|
| OD-1 | New scene hexes (gley, oxide, clay, foliage, sky) | pending | CTO (design system owner) | None; lives in `scene.css` |
| OD-2 | Water pigment: functional blue vs bespoke | pending | CTO | None |
| OD-3 | `duration-zoom` 1100 ms token | pending | CTO | Local constant until decided |
| OD-4 | Deployment target: IAP-gated internal hub artifacts path (recommended) vs other; hub card; service account | taken by the loop 2026-10-08: IAP-gated hub artifacts path, founder to review | Founder + orchestrator | None; static relative build |
| OD-5 | Public profile and host (e.g. a share domain) | taken by the founder 2026-10-09: the internal build, review badges and all, goes public at pedologicus.com on Vercel (Soilytix team, Git integration; moved from a Cloudflare Worker on 2026-10-10); host and going public are the founder's decisions of 2026-10-09 and 2026-10-10, recorded here, not new ones; the `public` profile waits on OD-7 | Founder | None |
| OD-6 | BioRender licence; designer infographic contract terms; AI imagery policy | pending | Founder | None; excluded from bundle |
| OD-7 | Scientific reviewer per chapter | pending | Founder / CSO | Content ships `draft` with badge |
| OD-8 | Living backdrop vs design system "entry animation only" rule | pending | CTO | Ambient behind toggle; reduced motion respected |
| OD-9 | Chapter ★ in scope (bioassets boundary unresolved) | pending | Founder | Not in Build phase |
| OD-10 | Protist avatar scope (full movement game vs guided) | pending | Product owner | Not in Build phase |
| OD-11 | WRB vs USDA classification | pending (WRB recommended) | Scientific reviewer | Not in Build phase |
| OD-12 | Qualitative vs quantitative rates | pending (qualitative recommended) | Scientific reviewer | Build uses teaching values |
| OD-13 | Pilot thresholds and instrument | pending | Founder | Not in Build phase |
| OD-14 | Dark underground scenes vs light-only UI | pending | CTO | Build uses hero-dark as illustration only |
| OD-15 | Platform vs hub token source (D-6) | decided (platform), flagged for review | CTO | Vendored from platform |
| OD-16 | Chapter 14 honest-report mock-up: how close it may sit to Soilytix's own report vocabulary and layout (benchmark, confidence, provenance blocks), and whether Soilytix is named anywhere in the chapter | pending | Founder | Generic "farm lab"; report labelled a teaching mock-up, not any company's product; Soilytix not named |

## 12. Steps

Follow `backlog.md` in order. Build phase is T01–T10; each task is one PR, green on `mise run check`.

## 13. Acceptance (Build phase)

1. `mise run check` is green: hooks, typecheck, tests, build, budget.
2. Prologue is playable to the first rumor.
3. "Where Did the Leaf Go?" is playable end to end: predict → run → compare → batch-confirm chains → transfer → notebook entries → save, reload, resume.
4. Conservation and direction tests pass for every lever combination.
5. Keyboard-only completion of the prologue and chapter 2 works.
6. Reduced motion and `?static=1` both work for every Build-phase scene.
7. Denylist test, source lint and bundle scan pass; no BioRender or strangespecimens files in `dist/`.
8. Every Build-phase content node has sources and `reviewStatus: draft`, shown with the review-pending badge.
