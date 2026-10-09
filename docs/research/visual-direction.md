# Pedologicus: visual and technical rendering direction

Research note, 2026-10-06. Written for the build loop of `soilytix/soil-worlds` during a hands-off run. The founder could not be asked anything, so every choice below is a **decision recorded for review**, not an approved spec. Open questions are collected at the end.

## 1. Decisions in one screen

| # | Decision | Why |
|---|---|---|
| D1 | **Render the world in PixiJS v8 (WebGL2, WebGPU when available)**. React 19 and Vite carry the UI chrome, as in `hub`. All text and controls stay in the DOM. | A layered 2D scene graph with batching, culling, render textures and custom filters, without building those ourselves. Text stays crisp, translatable and accessible. |
| D2 | **Use two kinds of art.** (a) *Baked plates*: deterministic, seeded "code painting" rendered offline to AVIF tiles for backdrops. (b) *Live layers*: authored vector organisms and props, animated in real time by small shaders. | This is the stillwet lesson: run the expensive painterly simulation offline and play back cheaply. Live motion stays limited to what responds to the learner. |
| D3 | **Nest six scales on one zoom axis**: landscape, field, profile, aggregate/pore, rhizosphere, cell/molecule. A persistent scale bar sits in IBM Plex Mono. | "Powers of Ten" and "The Scale of the Universe" continuity. The learner always knows where they are and how big things are. |
| D4 | **Lime marks the learner's subject only**: the tagged parcel, the selected organism, the active path. **Gold marks the comparison world** in predict/compare. Everything else is earth, ink and neutral. | Maps the design system's chart roles (subject, comparison, context) onto a world. One accent with one meaning. |
| D5 | **The earth palette is a separate "world register"**, bound to existing primitives wherever possible (`primary-soil`, `scale-gold-*`, the neutral ramp, `text-on-dark-warm`, `functional-dark-blue`). It applies only to illustration, never to UI or data. The 6 new hexes need CTO sign-off. | DESIGN.md says "don't introduce a colour that is not in the primitives block". This keeps the extension minimal and clearly marked. |
| D6 | **Ship no BioRender SVGs or strangespecimens files in the app bundle.** Organisms are drawn in-house, with those archives used as drawing reference only. | BioRender terms forbid standalone extraction. strangespecimens is decorative-only and cannot appear on any unauthenticated surface. Details in section 8. |
| D7 | **Respect reduced motion fully**: no ambient motion, no animated zoom (crossfade instead), and simulations advance by step buttons. Sound is off by default. | DESIGN.md: "nothing slides, counts, pulses or reveals under it." |
| D8 | **Keep a parallel DOM "scene outline" as the accessibility layer.** Every interactive world object is a real `<button>` in a spatially ordered list, and narration goes through `aria-live`. | Canvas content is invisible to assistive tech. PixiJS's built-in accessibility plugin only adds positioned divs, which is not enough for a learning tool. |

## 2. What stillwet.art actually does

I checked this on 2026-10-06 by fetching the page HTML.

- **It is not a real-time WebGL piece.** Each painting is a program written by a model against an *offline* simulation of oil paint: bristle brushes, wet paint, drying, glazes. Visitors receive the result as media.
- **Delivery is plain HTML and responsive media.** It uses `<picture>` with AVIF `srcset` at 720/960/1200/2000 widths and a JPEG fallback, with `fetchpriority="high"` on the hero and `loading="lazy" decoding="async"` on cards. The time-lapse plays as `<video muted loop playsinline preload="none" aria-hidden="true">`. Each card has `data-small`/`data-big` MP4 URLs and swaps by viewport. There is an explicit play button, and long, descriptive `alt` text on every still.
- **The "alive" feeling comes from process, not ambient noise.** You watch the picture being made, stroke by stroke.
- **Lessons for Pedologicus:**
  1. Bake the expensive look and play back cheaply.
  2. The painterly quality comes from *simulated material*: wet edges, glazes, bristle texture. A blur filter does not produce it.
  3. Motion should be opt-in or slow, with a still frame as the canonical state.
  4. Alt text can be beautiful and specific.
  5. One feature to borrow directly: a *"watch this layer form"* time-lapse in the profile scale, showing pedogenesis over compressed millennia. It is the stillwet idea applied to soil formation.

We will not reuse stillwet code or imagery. The site says its source is on GitHub, but I did not locate or review the repository or its licence. We write our own small deterministic brush renderer (section 6.3).

## 3. Reference works: what to take from each

These are style and interaction references only. No assets from them are used.

| Work | Take | Leave |
|---|---|---|
| **Bartosz Ciechanowski explorables** (ciechanow.ski) | Direct manipulation next to the explanation; one variable per figure; small drags in every diagram; scientific honesty about simplifications. | Long-form essay pacing. Our "text" is the field notebook, not paragraphs. |
| **Nicky Case** (explorable explanations, "Parable of the Polygons") | Guided play first, sandbox unlocked later; "try to break it" prompts; plain adult language. | Cute anthropomorphic characters. The audience is adult and scientific. |
| **The Scale of the Universe** (Huang) / **Powers of Ten** (Eames, 1977) | One continuous zoom axis, an always-visible scale label, objects revealed by scale. | A slider as the *only* navigation. Ours is spatial plus a slider. |
| **Neal Agarwal, "The Deep Sea"** | Depth as physical distance; a depth readout as the anchor; fauna appearing by depth. | It is pure scroll. We need free exploration, but the profile scale borrows its vertical depth readout directly. |
| **Kurzgesagt** (flat vector) | Value-driven depth: darker and cooler as things recede, rim light on subjects, a soft bloom on the "hero" object, very few shapes per object. | Saturated neon palette, faces on cells, the house style itself. |
| **Alto's Odyssey, Gris, Firewatch (Olly Moss)** | Atmospheric perspective through flat parallax planes; a palette per area; weather and time-of-day as mood. | Game-HUD conventions such as scores and collectibles counters. |
| **The Pudding / NYT scrollytelling** | Step-anchored transitions for *story beats inside a mission* (e.g. "Where did the leaf go?"). | Scroll as the primary navigation of the world. |
| **A Soft Murmur** | Ambient sound as a mixer of named layers, user-controlled, off by default. | Nothing else. |

## 4. Rendering stack evaluation

The target is a 2D layered zoomable world with ambient generative motion, running at 60 fps on a 2020+ laptop with integrated graphics, and degrading gracefully on phones.

| Stack | Bundle (min+gz, approx.) | Strengths | Weaknesses for us | Verdict |
|---|---|---|---|---|
| **PixiJS v8** | ~250 KB full; ~120–160 KB with selective imports (`pixi.js` ESM, tree-shaken; unverified until we measure) | Scene graph, sprite batching, culling, `RenderTexture`, custom `Filter`/`Shader` (GLSL and WGSL), `ParticleContainer`, texture atlases, WebGPU path, large ecosystem. `pixi-viewport` gives pan/zoom/pinch. | Bundle weight. Its accessibility plugin is shallow. Canvas text is poor for long copy, so we keep text in the DOM. No Canvas2D fallback is assumed. | **Chosen.** |
| three.js (orthographic) | ~170 KB+ | Huge ecosystem, post-processing. | A 3D scene graph we would fight for 2D layering. Larger than needed. | No |
| OGL | ~10–25 KB | Tiny, close to raw WebGL, nice for full-screen shaders. | We would have to build batching, a scene graph, hit-testing, atlases and culling ourselves. | Keep as an option *only* for a standalone backdrop shader if Pixi filters disappoint. |
| regl | ~25 KB | Functional, explicit, great for data-heavy shaders. | Same as OGL: no scene graph or sprites. | No |
| Plain Canvas2D | 0 KB | Simple, universally supported. | No shaders, so grain, flow and water effects are CPU-bound. Many layers with parallax and particles at 2× DPR drop frames on laptops. | Used only for the offline plate painter (node-canvas / OffscreenCanvas). |
| SVG + CSS | 0 KB | Accessible DOM, crisp, easy to author and inspect. | Many animated nodes thrash layout and paint. No real grain or flow. Filters (`feTurbulence`) are slow at full screen. | Used for UI chrome, the notebook, diagrams in cards, and the **reduced-data fallback** (static plates plus SVG hotspots). |

**Why Pixi, given the size cost.** The world needs batched sprites (hundreds of particles, roots, aggregates), offscreen render textures (zoom transitions, a moisture mask), and per-layer filters. Those are exactly Pixi's core. The initial JS budget (section 7) holds if Pixi is code-split behind the landing screen.

**Text rendering.** All labels, cards and narration are DOM elements positioned over the canvas by a small projection helper (`worldToScreen`). That gives us Inter and Plex Mono at native quality, selectable text, translation, screen readers and correct contrast via glass cards. Only purely decorative glyphs, such as the scale-bar ticks, may be drawn in the canvas.

**Mobile.** Touch pinch and pan come from `pixi-viewport`. Device pixel ratio is capped at 2, and at 1.5 on low tiers. Hit targets are at least 44 px. The landscape layout stacks the notebook below. A quality governor (section 7) drops grain and flow passes first.

**Failure path.** If WebGL is unavailable or context creation fails, the app renders each scale as its baked AVIF plate with SVG hotspots and the full DOM outline. Every mission stays completable. This is also the path for `?static=1`, used for screenshots and printing.

## 5. Scale-by-scale layer specs

The world is one tree of **scale nodes**. Each scale is a `Container` with ordered layers. Parallax factor `p` means a layer moves `p ×` camera translation (1 = locked to world, 0 = fixed to screen).

Between scales, a *portal* object such as a soil pit, a clod or a root tip is the zoom target. Zooming into it plays a noise-dissolve transition (shader S7) while the child scale's plate fades in.

**Every scene shows:**
- a **scale bar** (Plex Mono, e.g. `0 — 2 mm`);
- a **schematic badge** whenever sizes are not to scale ("Not to scale: bacteria enlarged ×200");
- a **truth tag** on organism cards (`reference-drawn`, `schematic`, or `decorative`).

### 5.1 Landscape (km)

| Layer | p | Content | Motion |
|---|---|---|---|
| L0 sky plate | 0.05 | Baked plate: high cloud, low sun, `world-sky` gradient | Slow cloud drift (S3 flow), 60 s loop |
| L1 far hills | 0.15 | Baked silhouette band, atmospheric haze | None |
| L2 catena | 0.4 | Hillslope with summit, shoulder, backslope, footslope, toeslope; river; woodland | Water glint (S5) |
| L3 fields | 0.8 | Patchwork of generic crop worlds (spinach, pea, bean, sugar beet, rice paddy), hedgerows | Crop sway (S2) |
| L4 interactive | 1 | Portals: "dig here" pits on 3 catena positions; weather vane (rain/drought toggle) | Hover lift 160 ms |
| L5 weather | 1.1 | Rain streaks / heat shimmer particles, optional | Curl-noise particles (S4) |

Teaches: why soils differ along a slope (topography, water, parent material). Optional satellite inset: a Sentinel-2 true-colour tile (section 8), clearly labelled as a *measurement*, next to the painted *illustration*.

### 5.2 Field (10–100 m)

| Layer | p | Content | Motion |
|---|---|---|---|
| F0 horizon sky | 0.1 | Plate | Cloud drift |
| F1 field rows | 0.6 | Crop rows of the chosen crop world; residue on surface | Sway (S2), residue flutter |
| F2 management props | 1 | Tillage implement, cover crop, sampling probe with core, irrigation | Only when the learner acts |
| F3 cut-away edge | 1 | The front edge is cut open to show topsoil; this is the portal to the profile | Moisture front visible after rain (S6) |

Teaches: management (tillage, cover, residue, compaction) as *conditions*, not "good/bad" buttons. The sampling probe introduces measurement: a core is a sample, not the soil.

### 5.3 Profile (cm–m)

| Layer | p | Content | Motion |
|---|---|---|---|
| P0 pit wall plate | 1 | Baked painterly horizons O/A/E/B/C/R; the plate set varies by catena position | None |
| P1 structure | 1 | Peds (granular, blocky, prismatic, platy), mottles, concretions, root channels, earthworm burrows | Water infiltration front (S6) |
| P2 roots | 1 | Root architecture (tap vs fibrous) by crop world | Root tip growth (S8) over time slider |
| P3 fauna | 1.02 | Earthworm, ants, beetle larvae, springtails, enlarged and badged | Path-following on burrow splines |
| P4 depth rail | 0 | Depth readout in Plex Mono (cm) and horizon labels in DOM | — |

Signature interactions:
- **"Watch this profile form"**: a stillwet-style time-lapse of pedogenesis, with plate frames baked at 0, 100, 1 000 and 10 000 years and crossfaded. The time-compression label is always on.
- **Munsell colour chip** comparison, as a measurement exercise.

### 5.4 Aggregate and pore (µm–mm)

| Layer | p | Content | Motion |
|---|---|---|---|
| A0 matrix | 1 | Mineral grains (sand, silt and clay drawn as distinct textures), organic coatings | None |
| A1 pore space | 1 | Signed-distance field of pores; water films and menisci from the moisture state | Water redistribution (S5/S6) on drying/wetting |
| A2 air | 1 | Air-filled pores, faint O₂ gradient overlay (lens) | O₂ diffusion field updates |
| A3 biota | 1 | Bacterial colonies on surfaces, fungal hyphae bridging pores, protists and nematodes in water films | Curl-noise drift (S4); nematodes swim only in water-filled pores |
| A4 lens overlays | 1 | Lenses: habitat / community / flows (carbon, nitrogen, water) | Flow particles along authored paths |

Teaches: texture, porosity, water-holding, aeration, and why organisms live where they do. Drying the aggregate visibly strands nematodes and fragments water films, which is the physics shown directly.

### 5.5 Rhizosphere (µm–mm around a root)

| Layer | p | Content | Motion |
|---|---|---|---|
| R0 bulk soil | 1 | Reuses the aggregate matrix at lower detail | — |
| R1 root | 1 | Root tip, root cap, mucilage, root hairs, cortex cutaway | Exudate plume (S4 advected dye) |
| R2 mycorrhiza | 1 | Arbuscular mycorrhizal hyphae entering cortex; extraradical network | Pulse of nutrient transfer (Lime only when tracked) |
| R3 rhizobia (legume worlds) | 1 | Nodule with cutaway | Shown only for pea/bean |
| R4 microbes | 1 | Gradient of density toward the root (schematic) | Drift |

Content guard: interactions are framed as conditional exchanges ("can", "often", "depends on"), never as "this microbe makes plants grow".

### 5.6 Cell and molecule (nm–µm)

| Layer | p | Content | Motion |
|---|---|---|---|
| C0 field | 1 | Water/clay surface background, charged clay platelet with cation exchange sites | Brownian jitter (S4, tiny amplitude) |
| C1 cell | 1 | One bacterial cell, cutaway: membrane, DNA, ribosomes, enzymes | Slow |
| C2 molecules | 1 | Ions (NH₄⁺, NO₃⁻, K⁺, Ca²⁺, H⁺), sugars, an extracellular enzyme cleaving a polymer | Event-driven only |
| C3 measurement | 0 | DNA extraction / sequencing read as a *sample of fragments* | — |

This is where the **measurement vs inference** mission lives. A sequencing read shows *presence of DNA*. A gene shows *potential function*. A process rate is a *separate measurement*. The scene uses three visual treatments, matching the truth ladder: solid for measured, dashed or translucent for inferred, text-only for interpretation.

## 6. Art direction

### 6.1 Palette

**Roles (binding):**

| Role | Token | Hex | Use in the world |
|---|---|---|---|
| Ink / line | `ink` | #29332E | All outlines, monoline, rounded caps and joins |
| Subject | `brand-primary` | #8EDE3D | The learner's tracked parcel, selected organism, active path, focus ring. **Never text on light.** Green text uses `functional-dark-green` #384C10. |
| Comparison | `primary-gold` | #B48240 | The "other condition" in compare mode (dry vs moist world), outline and tint |
| Text on dark | `text-on-dark` | #F0EEE1 | Labels over dark underground scenes |
| Hero dark | `surface-hero-dark` | #161C19 | Deep subsoil background, cell scale background |
| UI ground | `surface-page` | #F5F6F6 | App chrome, notebook |
| Warning | `functional-yellow` / `functional-dark-yellow` on `functional-light-yellow` | #E59D2A / #785E09 on #F0EEE1 | Only for real cautions ("this simplification hides…"), never decoration |

**World register (illustration only; proposed).** These are bound to primitives where one exists. "New" rows are flagged for CTO sign-off.

| World token | Bound to / value | Status |
|---|---|---|
| `world-humus` | `scale-gold-1` #36250F | existing |
| `world-topsoil` | `primary-soil` #423C2D | existing |
| `world-loam` | `scale-gold-2` #64461E | existing |
| `world-subsoil` | `scale-gold-3` #95692D | existing |
| `world-sand` | `scale-gold-4` #CB8F3D, desaturated 40% in shader | existing (shader-mixed) |
| `world-pale-horizon` | `primary-light-gold` #F4ECE2 | existing |
| `world-stone` | `neutral-dark-green` #6D7471 / `neutral-darker-green` #47504B | existing |
| `world-water-deep` | `functional-dark-blue` #07262D at 60% over ground | existing primitive, illustration use |
| `world-water-film` | `functional-light-blue` #D1EDF3 at 35% | existing primitive, illustration use |
| `world-gley` | **#5F7470** (grey-green reduced horizon) | **new** |
| `world-oxide` | **#A4572F** (iron mottle red-brown) | **new** |
| `world-clay` | **#8A6A55** (clay skin) | **new** |
| `world-foliage` | **#4F6B3A** (muted plant green, deliberately far from Lime's chroma) | **new** |
| `world-sky-high` / `world-sky-low` | **#DCE3E0** / **#F1E7D6** | **new** |

Justification:
- Soil colour is *data* in pedology. Gley grey and iron red teach redox, and they cannot be faked from the gold ramp.
- Plant green must exist in a world of crops, and it must not compete with Lime. That is why foliage sits at low chroma (OKLCH C ≈ 0.06 vs Lime's ≈ 0.19).
- `functional-blue` (status Info) is *not* used as a UI or data colour here, only as a pigment in painted water. That is an interpretation of the rules, flagged in section 10.
- Peers in any in-world chart (e.g. the decomposition curve card) follow register A: gold, azure, rose. Never green.

### 6.2 Light, depth, atmosphere

- **Above ground:** low warm sun from upper left, at a fixed direction across all scales so the world feels like one place. Atmospheric perspective: each farther layer is mixed 15–25% toward `world-sky-low` and loses 30% contrast.
- **Below ground:** light comes from the cut face, the viewer side. Value drops with depth, roughly 6% per 20 cm, toward `surface-hero-dark`. Organic-rich horizons are darker by data, not by mood.
- **Micro scales:** transmitted-light microscopy feel. A pale field (`world-pale-horizon`) with a soft vignette, objects slightly translucent, and edges darkened like phase contrast (shader S9).
- **Grain:** constant 2–3% luminance film grain plus linen/paper tooth (S1) on every painted plate. UI chrome has none.
- **Depth of field:** layers with |p − 1| > 0.3 get a cheap blur (Pixi `BlurFilter`, quality 2), disabled on low tier.

### 6.3 Painterly plates (offline, deterministic)

`tools/paint/` is a Node script on node-canvas or OffscreenCanvas. It takes a **plate spec** (JSON: shapes, palette tokens, seed) and outputs AVIF tiles of 1024² at 1× and 2×, plus a 64 px blur-up placeholder. Same seed, same bytes: this is invariant 8 of the illustration skill.

```text
for region in spec.regions (back to front):
  underpaint: fill region with token colour, value-shifted −8%
  for pass in [blockIn(large brush), glaze(alpha 0.15), detail(small brush)]:
    strokes = poissonDisk(region, spacing(pass), seed)
    for s in strokes:
      dir   = flowField(s.pos)            // layered value noise + region tangent
      len   = pass.len * (0.7 + 0.6*rand())
      col   = mixOKLCH(token, neighbourToken, rand()*pass.mix)
      drawBristleStroke(s.pos, dir, len, width=pass.w, bristles=8..14,
                        load=1.0 → 0.2 along stroke,   // paint runs out
                        wetPickup=0.12)               // smear previous layer
  edge: dry-brush the region boundary with broken strokes
apply linen tooth multiply (S1 texture baked in), export
```

The "watch it form" time-lapse records stroke batches as frames, encoded to a short muted MP4/WebM (`preload="none"`, poster equals the final plate), exactly like stillwet's delivery.

### 6.4 Organisms and props

- Drawn **in-house as SVG**: monoline `ink` outline at 1.5 px (at 1× zoom), rounded caps and joins as in DESIGN.md, flat fill from the world register, one soft inner shade, and an optional single highlight.
- No faces, no eyes on microbes, no mascots. Character comes from *morphology and movement*: nematode sinusoid, springtail jump, hyphal tip extension, ciliate beat.
- Morphology is drawn from public-domain or CC references (BHL plates, NRCS and USDA photos, Wikimedia micrographs; section 8). Each sprite records `reference_url` and `truth_status` in `assets/manifest.json`, mirroring `illustration-assets/manifest.csv`.
- Functional groups (decomposer, grazer, predator, mutualist) are shown by **shape badges plus text**, never by colour alone.
- Rasterise SVGs at build time into atlases at 1×/2× (`@pixi/assetpack`). Lime and gold states are applied by tint and outline filters, not by duplicate art.

### 6.5 Motion language

| Kind | Period / duration | Easing | Notes |
|---|---|---|---|
| Ambient (sway, drift, shimmer) | 4–20 s loops, amplitude ≤ 2% of object size | sine / noise | Never synchronous: phase is seeded per object |
| UI | DESIGN.md tokens: 120 / 200 / 350 / 500 / 600 ms | `ease-control`, `ease-chart` | Cards, notebook, lens switch |
| Zoom between scales | **1100 ms** (proposed token `duration-zoom`) | `ease-chart` | Log-space camera interpolation, so each decade takes equal time |
| Simulation time | Learner-controlled; default 1 tick = 1 compressed "day" | linear | The time label is always visible ("×10⁵ faster") |
| Events (tracked parcel moves) | 600 ms | `ease-chart` | Lime trail fades over 2 s |

Rule: **ambient motion is atmosphere, event motion is meaning.** Anything that teaches is triggered by the learner or stated by narration. Nothing important happens only in the background.

### 6.6 Sound (optional, off by default)

- A mixer in the style of A Soft Murmur, with layers *wind*, *rain*, *underground hum* and *water film*, generated in **WebAudio** (filtered noise, granular clicks, low drones).
- No third-party recordings in v1. If recordings are added later, use only Freesound **CC0** files, with the licence recorded per file. Contact-microphone soil recordings (e.g. the "Sounding Soil" project) need permission and are out of scope.
- Event cues are short and soft, with a visual and text equivalent always present. The mute state persists in `localStorage`.

## 7. Performance budget

- **Initial JS** ≤ 180 KB gz for the landing screen (React + shell). The world chunk (Pixi + scenes) is ≤ 350 KB gz, loaded on "Enter".
- **Images:** one scale's plates ≤ 2.5 MB AVIF at 2×. Child-scale plates prefetch when its portal is in view.
- **Frame time:** 16.6 ms target at 1440p on an M1 / Intel Iris Xe, measured with a dev overlay.
- **Quality governor:** the rolling 2 s mean frame time decides tier changes. Above 20 ms, step down: disable S3 flow, then DoF blur, then grain, then halve particles, then DPR 1. Below 12 ms for 10 s, step back up.
- **Battery:** pause the ticker on `visibilitychange` hidden and when the window loses focus for 60 s. Ambient animation idles after 2 min without input and resumes on input.
- **Culling:** only the current scale and its parent's backdrop are in the stage. Others are destroyed or unloaded via `Assets.unload`.

## 8. Image and asset sources, with licences

"Alter?" means whether we may transform the image (e.g. paint over it or run it through shaders). Licence findings are from the sources' own statements found on 2026-10-06. Anything marked *verify* must be checked per item before use.

| Source | Licence / terms | Attribution | Alter? | Planned use | Status |
|---|---|---|---|---|---|
| **NRCS Photo Gallery** (USDA) | US public domain (federal work) | Suggested: "Photo courtesy of USDA NRCS" | **No:** gallery terms ask that images not be distorted or altered, and not imply NRCS endorsement | Unaltered "real-world" reference photos in notebook cards (profiles, aggregates, erosion) next to painted scenes | Usable |
| **USDA ARS Image Gallery** | Mostly public domain; some images credited to third parties | Credit ARS and photographer | Per image | Micrographs (nematodes, mycorrhizae) as notebook references | Verify per image |
| **USDA Soil Biology Primer** (NRCS / SWCS) | Uncredited USDA text, graphics and photos are free to use with credit; **credited photos need permission** via SWCS (pubs@swcs.org) | "Soil Biology Primer, USDA NRCS" | Uncredited material only | Content reference; uncredited diagrams as drawing reference | Usable for uncredited only |
| **Soil Atlas 2015** (Heinrich Böll Stiftung and IASS) | **CC BY-SA 3.0 Unported**, texts and graphics; graphics ZIP available | Credit the publishers, link licence | Yes, but **derivatives must be CC BY-SA** | Content reference; any adapted graphic kept as a standalone figure carrying CC BY-SA | Usable with share-alike isolation |
| **Global Soil Biodiversity Atlas** (JRC, 2016) | CC BY 4.0 for EU-owned material; **third-party photos excluded** (permission needed) | "© European Union, JRC; Global Soil Biodiversity Atlas", and indicate changes | Yes, EU-owned material only | Organism group diagrams and food-web references | Usable, EU-owned material only |
| **ESDAC datasets / maps** | Use granted on condition data are **not passed to third parties** | Cite source | — | Not shipped in the app | Excluded from bundle |
| **Biodiversity Heritage Library** (e.g. Haeckel, *Kunstformen der Natur* 1904; Darwin, *Formation of Vegetable Mould through the Action of Worms* 1881) | Per item. Many are public domain. Flickr "No known copyright restrictions" ≠ confirmed public domain; some Flickr items are CC BY 2.0 | Recommended: title, author, year, BHL link | Public domain: yes | Engraving-style references for protists, nematodes and earthworms; an optional "naturalist plate" texture in the notebook | Verify per item |
| **Wikimedia Commons** micrographs and profiles | Per file (PD, CC0, CC BY, CC BY-SA…) | As the file page requires (author, licence, link) | Per licence; prefer PD, CC0 and CC BY; keep CC BY-SA isolated | Soil profile photos by WRB group, micrographs (tardigrades, rotifers, fungal hyphae) | Verify per file; record in manifest |
| **Copernicus Sentinel-2** | Free and open | "Contains modified Copernicus Sentinel data [year]" | Yes | Landscape-scale satellite inset, labelled as measurement | Usable |
| **ISRIC World Soil Museum monoliths** | No open licence found; older publications are all rights reserved | — | — | Would be ideal for profiles | **Excluded until permission is obtained** |
| **FAO soil publications** | Often CC BY-NC-SA 3.0 IGO (not verified per item). NC conflicts with a company tool | — | — | Content reference only | Verify; reference only |
| **BioRender** (`illustration-assets/src/biorender`, internal) | Terms forbid using BioRender content outside BioRender in a way that extracts it or makes it available standalone. Designs outside BioRender need the Industry licence. Our plan tier is unknown | BioRender citation required on published figures | — | **Drawing reference only; no files in the bundle** | Excluded from bundle |
| **strangespecimens** (`illustration-assets/src/strangespecimens`, internal) | Beta licence: internal design work, UI and marketing allowed; **no unauthenticated surface, no scientific claims**; the beta grant covers projects created during the beta | Appreciated, not required | Yes | At most decorative UI furniture on an IAP-gated internal build; **never** in the outsider build or near a claim | Avoid by default |
| **Inter, IBM Plex Mono** | SIL OFL 1.1 | Licence file in repo | — | UI type | Usable |
| **Freesound** | Per file; use **CC0 only** | None required; record anyway | Yes | Optional ambient layers (post-v1) | Optional |
| **Kurzgesagt, Ciechanowski, Case, Agarwal, stillwet** | Copyrighted works | — | — | Style and interaction reference only | No assets |

Every shipped external asset gets a row in `assets/ATTRIBUTION.md` and in `assets/manifest.json` with these fields: `source_url`, `licence`, `author`, `retrieved`, `altered`, `truth_status`. The in-app credits panel is generated from that manifest.

## 9. Shader sketches

These are GLSL-ish and run as Pixi v8 `Filter` or `Mesh` shaders. All are seeded and time-driven by a single `uTime`, which is **frozen at 0 under reduced motion**.

**S1 grain and linen tooth (filter on painted layers)**
```glsl
float grain = hash(floor(gl_FragCoord.xy / uGrainSize) + floor(uTime*12.)) - 0.5;
float tooth = texture(uLinen, vUv * uLinenScale).r;            // tileable 512² linen
color.rgb *= mix(1.0, tooth, 0.12);
color.rgb += grain * 0.025;                                    // 2.5% luminance
```

**S2 wind sway (vertex shader on crop/grass meshes)**
```glsl
float h = aPosition.y_normalised;                              // 0 at base, 1 at tip
float w = sin(uTime*0.8 + aPhase) * 0.6 + fbm(vec2(aWorldX*0.01, uTime*0.2)) * 0.4;
pos.x += w * uWind * h*h;                                      // tips move, bases fixed
```

**S3 painterly flow (filter on sky/backdrop plate, high tier only)**
```glsl
vec2 dir  = curl(fbm3(vUv*3.0, uTime*0.02));                   // slow vector field
vec4 acc  = vec4(0);
for (int i=-3;i<=3;i++) acc += texture(uPlate, vUv + dir*float(i)*uSmear);
color = mix(texture(uPlate, vUv), acc/7.0, 0.35);              // brush-like smear that drifts
```

**S4 microbe and particle drift (CPU or ParticleContainer; also exudate dye)**
```text
v = curlNoise(p * k, t * 0.1) * speed + bias(towardRoot) * chemotaxis
p += v * dt;  if (!inWater(p) && motile) v *= 0.05   // swimmers need water films
```

**S5 water film and meniscus in pores (SDF)**
```glsl
float d = texture(uPoreSDF, vUv).r;                            // distance to grain surface, px
float film = smoothstep(uFilm+1.0, uFilm, d);                  // film thickness from moisture state
float filled = step(d, uPoreFillRadius);                       // small pores fill first (capillarity)
float water = max(film, filled);
color = mix(color, worldWaterFilm, water*0.35);
color += specular(normalFromSDF(uPoreSDF, vUv), uLightDir) * water * 0.2;
```
`uFilm` and `uPoreFillRadius` come from simulation moisture. The physics this teaches: as soil dries, large pores empty first and small pores hold water longest.

**S6 wetting front (profile/field)**
```glsl
float front = uFrontDepth + fbm(vec2(vUv.x*8., 0.)) * uFingering;   // preferential flow fingers
float wet = smoothstep(front+0.02, front-0.02, vUv.y_depth);
color.rgb *= mix(1.0, 0.78, wet);                              // wet soil is darker (Munsell value)
```

**S7 scale-transition dissolve**
```glsl
float n = fbm(vUv*6.0 + uSeed);
float m = smoothstep(uProgress-0.08, uProgress+0.08, n + radial(vUv, uPortalCenter)*0.6);
color = mix(texture(uChildScene, vUv), texture(uParentScene, zoomUv(vUv, uProgress)), m);
```
Under reduced motion this becomes a 200 ms opacity crossfade.

**S8 root tip growth (mesh along spline)**
```text
for root in roots: length(t) = L_max * (1 - exp(-k * t_sim))
emit quad strip along spline[0..length]; width tapers to tip; tip gets mucilage halo (soft circle, 20% alpha)
root hairs: instanced short strokes spawned behind tip zone (2–8 mm from tip in world units, scaled)
```

**S9 microscope look (filter on micro scales)**
```glsl
float edge = length(sobel(uScene, vUv));
color.rgb = mix(color.rgb, color.rgb*0.55, smoothstep(0.1, 0.4, edge));   // phase-contrast dark rims
color.rgb *= vignette(vUv, 0.75);
```

## 10. Accessibility

- **Reduced motion** (`prefers-reduced-motion: reduce`, or the in-app toggle, which wins):
  - `uTime` is frozen and ambient tickers stop;
  - zooms become crossfades;
  - particle flows become a static path with arrowheads;
  - time-lapses show their poster plus a frame stepper;
  - the simulation advances only by "Step" buttons.
- **Text equivalents:**
  - every scene has a written description (as rich as stillwet's alt text);
  - every animation has a "What just happened" line in the narration log;
  - every lens has a text table of its flows (e.g. carbon: leaf 100 → microbial biomass 20 → CO₂ 55 → remaining 25, all marked *illustrative, not measured*).
- **Keyboard:**

  | Key | Action |
  |---|---|
  | Tab / Shift+Tab | Walks the scene outline in spatial reading order |
  | Enter | Inspect |
  | Space | Pause / play |
  | `+` / `-` | Zoom into / out of the focused portal |
  | Arrows | Pan |
  | `[` / `]` | Scrub time |
  | `L` | Cycle lens |
  | `N` | Notebook |
  | `?` | Help |
  | Esc | Close |

  All keys are listed in the help overlay, and none needs a modifier.
- **Focus:** the DESIGN.md ring (3 px Lime halo plus 2 px ink outline). The canvas object that matches the focused DOM button gets a Lime outline filter, so sighted keyboard users see where they are in the world.
- **Colour independence:**
  - subject vs comparison is also shown by outline pattern (solid vs dashed);
  - functional groups use shape badges and text;
  - moisture and redox show as texture plus a label.
- **Contrast:**
  - labels over painted scenes sit on glass cards (white at 85% plus `blur-glass` 24 px, `ink` text);
  - on dark underground scenes they use `text-on-dark` #F0EEE1;
  - Lime is never text on a light surface.
- **Screen reader:**
  - the outline is a `<nav>` tree, scale → layer group → objects;
  - an `aria-live="polite"` narration region announces mission events;
  - the canvas is `aria-hidden="true"`.
- **Cognitive:** short prompts, an optional "tell me more" depth, no timers, no fail states, and unlimited retries (from the proposal).

## 11. Open decisions (flagged, not resolved here)

1. **World register:** six new hexes (`world-gley`, `world-oxide`, `world-clay`, `world-foliage`, `world-sky-high`, `world-sky-low`). They need CTO sign-off as an *illustration-only* register in DESIGN.md, or replacement with existing primitives.
2. **`functional-blue` and `functional-dark-blue` as water pigment:** this departs from "Info blue is not a data colour". It is defensible because water is not data, but it should be confirmed.
3. **`duration-zoom` 1100 ms:** a new motion token outside the DESIGN.md set.
4. **Audience surface:** an employee-only IAP-gated build vs a public build. This decides whether strangespecimens may appear at all. Default here: the public-safe asset set only.
5. **BioRender plan tier:** if Soilytix holds an Industry licence, BioRender-derived figures might be usable in designs outside BioRender. Even then, shipping raw SVGs in a bundle is standalone extraction. The default is to exclude them.
6. **ISRIC monolith photos:** worth requesting permission; they would be the best profile references.
7. **Dark underground scenes vs "light is the only customer-facing theme":** this world is an illustration surface, not a product theme. Treat it like the open Pathogen Monitor question, and confirm.
8. **Scientific review owner** for every scene's causal story, sprite morphology and simplification note (from the proposal). No such reviewer is assigned yet.
9. **Bundle numbers for Pixi v8** are taken from third-party package indexes and are approximate. Measure in the first build and revisit D1 if the world chunk exceeds 350 KB gz.

## Sources

- stillwet: https://stillwet.art/ (HTML inspected 2026-10-06)
- Soilytix DESIGN.md: [DESIGN.md] (version 2026-09-25)
- `soilytix/illustration-assets` README and `src/strangespecimens/LICENCE-AND-USE.md`
- Soil Biology Primer, image permissions: https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer
- NRCS Photo Gallery terms, as reproduced on Wikimedia Commons file pages, e.g. https://species-id.net/openmedia/File:NRCSAZ02010_-_Arizona_(303)(NRCS_Photo_Gallery).tif
- Soil Atlas 2015 licence (CC BY-SA 3.0): https://www.boell.de/en/2015/01/05/bodenatlas-daten-und-fakten-ueber-acker-land-und-erde, https://th.boell.org/sites/default/files/soilatlas2015.pdf
- Global Soil Biodiversity Atlas: https://esdac.jrc.ec.europa.eu/content/global-soil-biodiversity-atlas, https://publications.jrc.ec.europa.eu/repository/handle/JRC95584
- BHL copyright guidance: https://about-new.biodiversitylibrary.org/?p=1027
- BioRender licence terms: https://www.biorender.com/terms, https://biorender.com/basic-license, https://marketing.biorender.com/industry-license
- PixiJS bundle figures: https://depscope.dev/pkg/npm/pixi.js; https://pixijs.io/customize/
- ISRIC collections: https://www.isric.org/explore/ISRIC-collections
