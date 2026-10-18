---
title: "Terrikus — Art direction"
description: "Palette tokens, per-scale layer recipes, motion language, illustration style, asset sourcing and licences, reduced-motion behaviour."
status: draft — new scene hexes and the zoom token need CTO sign-off (spec OD-1, OD-2)
date: 2026-10-06
---

# Terrikus — Art direction

> **Painted places, honest diagrams.** Backdrops are lively, textured and beautiful. Anything that teaches stays crisp, labelled, scaled and sourced. Ambient motion is atmosphere; event motion is meaning.

Inputs: `docs/research/visual-direction.md` (D1–D8, shaders S1–S9), the Soilytix design system (platform `packages/design-system` v0.2.0), and stillwet.art as the reference for *quality of liveliness*. Nothing from stillwet.art is copied.

Contents:

- §1 Principles
- §2 Two registers: UI and world
- §3 Palette
- §4 Per-scale layer recipes
- §5 Motion language
- §6 Illustration style
- §7 Asset sourcing, licences and the manifest
- §8 Reduced motion, static mode and accessibility of visuals
- §9 Review checklist

---

## 1. Principles

1. **One subject, one accent.** Lime (#8EDE3D) marks the thing the player is following: a tracked carbon parcel, a selected organism, the active path, jar A. It is never decoration, foliage or "nature green".
2. **Comparison is gold.** The comparison world, jar B and the twin field use gold. Peers in charts use gold #CA8407, azure #2998ED and rose #D76EB9, never green.
3. **The world is painted; the knowledge is drawn.** Plates (ground, sky, horizons, grain textures) are painterly and textured. Organisms, labels, scale bars, readouts and chains are flat, crisp vector or DOM.
4. **Every picture tells you its truth status.** Each scene carries a scale bar and, where enlarged, a *not to scale ×N* badge. Each asset carries a truth tag: `reference-drawn`, `schematic` or `decorative`, or `measured` for instrument imagery such as the chapter 13 satellite inset.
5. **Text lives in the DOM, never in the canvas.** Labels sit on glass cards over the world, so they inherit typography, zoom, contrast and screen-reader behaviour.
6. **Calm by default.** Backdrops dim while the player reads, predicts or explains. Motion never competes with a question.

---

## 2. Two registers: UI and world

| Register | Where | Source of truth | Rules |
|---|---|---|---|
| **UI register** | Notebook, bench controls, cards, HUD, dialogs, charts | Vendored design-system tokens (`src/design-system/`, spec D-6) | Standard Soilytix rules unchanged: Inter, Plex Mono for numbers, Obsidian ink, page #F5F6F6, Lime single accent, green text #384C10 |
| **World register** | Canvas plates, scene SVG, organism sprites | `src/styles/scene.css` (local, illustration-only) | Earth and water pigments bound to design-system primitives where one exists; new hexes are listed and need sign-off; never used for UI text or UI fills |

The world register is a local scene palette, documented and bounded, instead of extending the design system for one product.

---

## 3. Palette

### 3.1 UI tokens (vendored, unchanged)

| Role | Token | Hex | Notes |
|---|---|---|---|
| Ink | obsidian | #29332E | Body text, icons, organism outlines (1.5 px) |
| Page | page | #F5F6F6 | App background |
| Card | white | #FFFFFF | Notebook pages, codex, report mock-up |
| Accent | lime | #8EDE3D | Subject only; never text on light |
| Green text | green-text | #384C10 | Any text that must read "green" |
| Comparison | gold | #B48240 | Comparison world / jar B frame and labels |
| Chart peers | gold / azure / rose | #CA8407 / #2998ED / #D76EB9 | Pools and series that are not the subject |
| Warning fill | warning | #E59D2A | Dots, borders, fills only; always paired with icon + text |
| Warning text | warning-text on warning-bg | #785E09 on #F0EEE1 | "Teaching model" and "review pending" banners |
| Dark illustration ground | hero-dark | #161C19 | Underground backdrops only, as illustration, not a dark theme |

### 3.2 World register (`scene.css`)

Bound to existing primitives:

| Scene token | Primitive | Hex | Used for |
|---|---|---|---|
| `--w-humus` | scale-gold-1 | #36250F | O/A horizon, dark organic matter |
| `--w-topsoil` | primary-soil | #423C2D | A horizon base |
| `--w-loam` | scale-gold-2 | #64461E | Loam grains, aggregate bodies |
| `--w-subsoil` | scale-gold-3 | #95692D | B horizon |
| `--w-sand` | scale-gold-4, desaturated 25 % | #CB8F3D → #BD975F | Sand grains, C horizon |
| `--w-pale` | pale-horizon | #F4ECE2 | E horizon, dry crust, salt |
| `--w-stone-1` / `--w-stone-2` | stone neutrals | #6D7471 / #47504B | R horizon, gravel, rock |
| `--w-dark` | hero-dark | #161C19 | Deep pore shadow |
| `--w-film` / `--w-water` / `--w-deep` | functional blue family | #D1EDF3 / #44A6BD / #07262D | Water films, pore water, river depth |

New hexes, **pending CTO sign-off (OD-1)**. Each is used only in plates and never in UI:

| Scene token | Hex | Why no existing primitive fits |
|---|---|---|
| `--w-gley` | #5F7470 | Reduced, waterlogged grey-green matrix (ch. 4, 11) |
| `--w-oxide` | #A4572F | Rust mottles, Fe(III) (ch. 4, 11) |
| `--w-clay` | #8A6A55 | Clay platelets, Bt coatings |
| `--w-foliage` | #4F6B3A | Crops, hedges, woodland; deliberately muted so it never reads as Lime |
| `--w-sky-high` / `--w-sky-low` | #DCE3E0 / #F1E7D6 | Sky gradient at landscape and field scales |

**Water pigment (OD-2).** The functional-blue family is chosen over cat-azure (#2998ED) so that water never collides with azure as a chart peer. If the CTO prefers a bespoke water hue, only `scene.css` changes.

### 3.3 Hard rules (enforced by the token lint in backlog T02)

- No Lime in `scene.css`. Lime appears in the world only as the subject overlay layer.
- No `--w-*` token in any `ui/` component.
- No raw hex outside `src/design-system/` and `src/styles/scene.css`.
- Text contrast ≥ 4.5:1 against its glass card, checked in tests for both registers' worst case.

---

## 4. Per-scale layer recipes

Every scene is a stack of layers. Layers 0–3 are painted plates (canvas); 4–5 are vector sprites (canvas); 6–7 are DOM. The painter (backlog T07) generates plates 0–2 from a seed and recipe at runtime in the Build phase; the offline baker (T14) produces AVIF plates later.

| Layer | Content | Medium | Motion class |
|---|---|---|---|
| 0 Ground | Sky or deep background wash | painted plate | ambient (very slow) |
| 1 Far | Distant landform, deep pores, horizon texture | painted plate, parallax 0.2 | ambient |
| 2 Mid | Main matter: grains, soil wall, field rows | painted plate, parallax 0.5 | ambient (sway, drift) |
| 3 Atmosphere | Light, fog, water sheen, O₂ fog overlay | shader or painted gradient | ambient |
| 4 Actors | Organisms, roots, hyphae, particles | vector sprites | event + ambient idle |
| 5 Subject | Lime highlights, tracked parcels, active path | vector overlay | event |
| 6 Labels | Glass cards, scale bar, *not to scale* badge, truth tag | DOM | event (fade 200 ms) |
| 7 Chrome | HUD, notebook, bench, outline | DOM | UI durations |

### 4.1 Recipes

| Scale | 0 Ground | 1 Far | 2 Mid | 3 Atmosphere | 4 Actors | Living-backdrop shader |
|---|---|---|---|---|---|---|
| **landscape** | sky-high→sky-low gradient, paper grain | hill silhouette in stone-2 at 60 %, woodland in foliage at 40 % | slope fields as banded strokes; paddy and river in water family | cloud shadows drifting (S1); haze toward horizon | birds cameo (decorative), weather, satellite inset frame | S1 cloud shadow, S2 river glint |
| **field** | sky gradient | hedge or woodland edge | crop rows in foliage, residue in pale and sand; cut-away soil edge with topsoil | low sun wash; dust motes | crop plants, tractor, naturalist's tools | S3 crop sway (≤2 % amplitude) |
| **profile** | hero-dark at 40 % behind pit | horizon bands (humus/topsoil/subsoil/sand/pale/gley/oxide) with stipple texture | roots, burrows, stones, mottles, depth rail | water-table line in water family; infiltration front | worms, roots, ants | S6 infiltration fingers, S4 slow horizon time-lapse (ch. 11) |
| **aggregate** | hero-dark | blurred deep pores | grains: sand as rounded facets, silt as fine speckle, clay as platelet stacks; film-coated surfaces | water films (film colour with sheen); O₂ fog (ch. 4) | bacteria, protists, nematodes, mites, hyphae | S5 film drain/fill, S7 Brownian shimmer of colloids |
| **rhizosphere** | hero-dark | bulk soil out of focus | root tissue in pale with ink cortex lines; mucilage glow; root hairs | exudate gradient (soft radial, never Lime), P-depletion halo | rhizobia, AMF hyphae, biofilm, grazers | S8 root-tip growth, S9 exudate diffusion |
| **cell** | warm off-white #F4ECE2 (pale) for a "textbook plate" feel | membrane or platelet macro texture | ions, enzymes, molecules as flat schematic shapes | charge field as a dotted gradient | cations, phages, lipopeptide micelles | none (event-only scale) |
| **lab bench** | page #F5F6F6 | none | jars, sieve, sequencer drawn as flat line illustration | none | sample particles | none; this is UI register |

Shader ids S1–S9 are specified in `visual-direction.md` §5. Each has a quality tier (high/medium/off) controlled by the quality governor (spec §8).

### 4.2 Scale honesty on every scene

- A scale bar in Plex Mono with true units (km, m, cm, mm, µm, nm), always visible.
- A *not to scale ×N* badge when any actor is enlarged; N is in the scene data.
- Depth rail on profile scenes (cm).
- Compressed-time label whenever time runs ("1 s ≈ 60 days").

---

## 5. Motion language

### 5.1 Two kinds of motion

| Kind | Purpose | Constraints |
|---|---|---|
| **Ambient** | Makes places feel alive: sway, drift, shimmer, slow light | Loops 4–20 s; amplitude ≤2 % of the layer; seeded phase so nothing moves in unison; never carries information; frozen under reduced motion |
| **Event** | Shows a cause happening: a transfer, a bloom, a death, a portal | 600 ms by default; driven only by simulation fluxes or player actions; always has a text equivalent in the narration region |

"Ambient is atmosphere, event is meaning." If a motion would change what the player concludes, it is an event and needs a text equivalent.

### 5.2 Durations and easing

| Use | Duration | Easing token |
|---|---|---|
| Hover, focus | 120 ms | ease-control |
| Card reveal, label fade | 200 ms | ease-control |
| Panel slide (notebook, bench) | 350 ms | ease-control |
| Chart update | 500 ms | ease-chart |
| Event motion | 600 ms | ease-chart |
| **Zoom between scale nodes** | **1100 ms (proposed `duration-zoom`, OD-3)** | ease-chart in log space |

Zoom is a camera move in log scale: the camera interpolates log(scale), so a ×1000 jump feels as even as a ×10 jump. Mid-zoom, the next scale's plate crossfades in at 40–70 % of the move.

### 5.3 Flux-driven particles

- One particle = N ledger units (N per bench, shown on the bench legend).
- Particles spawn only when a transfer happens and travel along the transfer's path (litter → dissolved → biomass or → CO₂ out).
- Lime only for the tracked subject; other pools use chart peers or neutral ink at 40 %.
- Heat leaves as a shimmer that never returns, matching the energy ledger.

### 5.4 Dimming

While a prediction, chain builder or codex page is open, layers 0–3 dim to 60 % and ambient speed drops to 25 %.

---

## 6. Illustration style

### 6.1 Plates

- Built by a seeded brush painter: stroke fields along flow directions, stipple for grain texture, paper grain overlay at 4–6 %.
- Earth palette only (§3.2). No photographic textures in plates.
- The style references the Soilytix 2025 stipple illustrations (`img-soilytix-authored`): stipple density communicates organic matter and depth.

### 6.2 Organisms and objects

- Drawn in-house as SVG: 1.5 px Obsidian monoline outline, a single flat fill from the world register, one internal detail line at most.
- No faces, eyes or expressions. Character comes from silhouette and movement (amoeba pseudopods, nematode sinusoid, springtail jump).
- Morphology is `reference-drawn` from public-domain or permissively licensed sources (§7), with the reference URL in the manifest.
- Functional group shown by a **shape badge plus text**: circle = decomposer, triangle = grazer, diamond = transformer, hexagon = mutualist, square = pathogen (context), star = engineer. Never colour alone.
- True-size bar on every field card.

### 6.3 Diagrams

- Cause-chain cards: four shapes (condition, actor, process, outcome) with ink outline, white fill, labelled connectors. Subject link in Lime outline only.
- Charts: design-system chart components; pools distinguished by pattern and direct labels.

### 6.4 Evidence styling (Scientist lens and lab book)

| Evidence tier | Visual |
|---|---|
| Measured / observed | Plex Mono numbers, ± band, solid outline |
| Derived | Dashed outline, formula on hover/focus |
| Interpreted | Italic connector labels, player-chosen confidence pip (1–3) |
| Would-measure / recommendation | Outlined card with "if … then … because …" scaffold |
| Teaching model | Warning-text banner (#785E09 on #F0EEE1) with icon: "Teaching model — direction, not prediction" |

### 6.5 Open-question treatment

Contested items (curriculum Appendix C) render with a dashed, softly flickering outline (static under reduced motion), an "Open question" label and an evidence card listing both sides with sources.

---

## 7. Asset sourcing, licences and the manifest

Every bundled file is listed in `src/assets/manifest.ts` (backlog T03 defines the type; T11 builds the full manifest and credits panel). The `public` build profile fails on any entry with `publicOk: false`.

```ts
type Asset = {
  id: string;
  path: string;            // inside src/assets/
  source: SourceId;        // an img-* or font-* id in sources.md
  licence: 'soilytix' | 'pd' | 'cc0' | 'cc-by' | 'cc-by-sa' | 'ofl' | 'internal-only';
  owner: string;
  truthStatus: 'reference-drawn' | 'schematic' | 'decorative' | 'measured';
  publicOk: boolean;
  attribution?: string;    // required for cc-by / cc-by-sa
  referenceUrl?: string;   // what it was drawn from
};
```

| Source (id in sources.md) | Use | Bundled? | publicOk |
|---|---|---|---|
| `img-soilytix-authored` (2025 brand, stipple, icons) | Plate style, icons | yes | yes |
| `img-designer-infographics` | Internal reference plates | internal profile only | **no** (contract terms open, OD-6) |
| `img-sentinel-2` | Satellite inset (ch. 13) | yes (Copernicus licence, attribution) | yes |
| `font-inter`, `font-plex-mono` | Fonts via @fontsource | yes (OFL) | yes |

**Rules**

- A CI check (T03) asserts that no file path or hash under `dist/` matches a BioRender or strangespecimens pattern, and that every file in `src/assets/` has a manifest entry.
- Derived works from CC BY-SA sources stay in the CC BY-SA folder and carry the same licence; plates are never drawn over CC BY-SA images.
- No AI-generated imagery is bundled without an explicit decision (not currently allowed; it would need a provenance line in the manifest and OD-6 resolved).
- The credits panel lists every bundled asset with its attribution.

---

## 8. Reduced motion, static mode and accessibility of visuals

| Condition | Behaviour |
|---|---|
| `prefers-reduced-motion: reduce` or in-app toggle | Shader time `uTime` frozen; ambient loops stop on a designed poster frame; zoom becomes a 200 ms crossfade; particles become step-wise ledger updates with a "Next step" button; time-lapses become 4–6 posters with a stepper |
| `?static=1` or WebGL unavailable | No canvas. Each scene renders as an SVG plate with hotspot buttons; benches still run (simulation is DOM-independent); charts render normally |
| Low-power or slow frames | Quality governor drops shader tier, then parallax, then particles density; never drops labels |
| Tab hidden | Render loop pauses; simulation pauses |
| High contrast / forced colours | Glass cards become opaque; outlines thicken to 2 px |

- No information is carried by colour alone: shapes, patterns, labels and text accompany every colour cue.
- No flashing above 3 Hz; no full-screen flashes; the storm (ch. 13) uses a darkening wash, not lightning flicker.
- Every scene has a written `description` (alt text) in content, read by the DOM outline.

---

## 9. Review checklist (per scene PR)

1. Scale bar and, if needed, *not to scale* badge present.
2. Lime used only on the subject; no green chart peers.
3. All text in DOM; contrast checked.
4. Ambient motion ≤2 % amplitude, seeded, frozen under reduced motion; poster frame chosen.
5. Every bundled asset has a manifest entry and a source id.
6. Truth tags set; reference URLs recorded.
7. Static-mode plate renders.
