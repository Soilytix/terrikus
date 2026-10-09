# Learning game design for Pedologicus

Status: design research, draft 1 (2026-10-06). Written autonomously while the founder was unavailable; every decision below is marked **Decision** and is reversible. Scientific review of mission content is still pending. Nothing here claims a validated learning effect: the pilot plan in section 12 exists to find out.

Prior art read: the internal single-file prototype (protist player, spinach world, three expeditions, notebook), its proposal (2026-10-04) and the project relevance map (2026-10-05). This document keeps their best ideas (notice → predict → change → observe → explain → retry; no health score; schematic scale marking; scientist lens) and adds structure for a much larger world.

---

## 1. Design thesis

> **Pedologicus is a textbook you read by doing experiments.** Each chapter is a place. Each page is a phenomenon you can poke. You keep what you learn as explanations in your own notebook, not as points.

Three commitments follow from that thesis and from company rules:

1. **Knowledge is the only key.** Progress is gated by what the player can explain, never by grinding, timers, currency or upgrades (Outer Wilds model).
2. **The simulation tells the truth within stated bounds.** It is small, rule-based and mass-conserving for C, N and water. It never invents a field outcome, and it labels itself a teaching model.
3. **Evidence types stay separate on screen.** What you *saw* (measurement), what you *derived* (evidence), what you *think* (interpretation) and what you would *do* (recommendation) are four visually distinct things in the notebook. This is Soilytix' own hierarchy, taught as a game mechanic.

---

## 2. Mechanics extracted from reference games and tools

For each reference: what it does, why it works for learning, what we take, what we refuse.

### 2.1 Outer Wilds (Mobius, 2019): knowledge-gated progression and the ship log

- **What:** every location is reachable from minute one; the only progression is understanding. The ship log has a *rumor mode* (a graph of places linked by unresolved clues) and a *map mode*. Entries move from "rumor" (dim, with a question) to "explored" (full).
- **Why it works:** curiosity as an information gap (Loewenstein, 1994). The graph makes the gaps visible, so the player self-directs. Nothing is lost on a loop reset except what you didn't understand.
- **We take:** the **Rumor Map** in the notebook: nodes are phenomena ("Leaf vanished faster near the root"), edges are hints ("Something here eats bacteria — check the water films"). Locations open by a *question*, not a key. Time loop becomes the **season loop**: rewinding a plot to spring costs nothing.
- **We refuse:** cryptic dead ends. Outer Wilds tolerates hours of confusion; our adults have 15-minute sessions. Every rumor carries a "where to look" hint after two failed visits.

### 2.2 Subnautica (Unknown Worlds, 2018): scanner and databank

- **What:** scan an organism (hold for a few seconds) to unlock a databank entry; fragments of a blueprint need several scans.
- **Why it works:** turns observation into an action with a small cost; the databank is a reward that is also the reference text.
- **We take:** the **Scan** verb, with a short hold and a *partial scan* rule: some things need scanning in two contexts (a bacterium in a dry pore and in a wet pore) before the card is complete. This teaches that organisms are context-dependent.
- **We refuse:** scanning as the end of learning. A full card shows "what it uses, what it makes, what it needs, who it meets", but *mechanism cards* (the valuable ones) only come from experiments.

### 2.3 Return of the Obra Dinn (Pope, 2018): deduction notebook

- **What:** the player fills in "who died, how, by whom" for 60 people. Fates are confirmed only in batches of three correct, so guessing is unrewarding.
- **Why it works:** assessment *is* the game; batch confirmation prevents brute force and forces reasoning.
- **We take:** **Cause-chain cards** (section 8) confirmed in batches. A mission's three chains are checked together; the game says "two of three are right" without saying which. This is the main assessment mechanic.
- **We refuse:** single-solution deductions where soil science has several defensible answers. Chains accept multiple valid paths; feedback distinguishes "wrong", "possible but unsupported by what you observed" and "supported".

### 2.4 Eco (Strange Loop, 2018), SimEarth and SimLife (Maxis, 1990–92): ecosystem sim

- **What:** a shared world with populations, nutrient stocks and feedbacks; player actions have delayed, distributed consequences.
- **Why it works:** systems thinking comes from watching delays and feedback loops; Eco makes the ecosystem a shared resource with real tradeoffs.
- **We take:** stocks-and-flows display (a small Sankey per plot), time-lapse with explicit compression, and **tradeoffs without a winner**: rice paddy water saves one thing and costs another (methane).
- **We refuse:** SimEarth's opaque coupling (players could not tell why things happened). Every flow in Pedologicus can be clicked to see its rule in plain language. No global score, no "Gaia" health meter.

### 2.5 Spore cell stage (Maxis, 2008): play at microscopic scale

- **What:** you are a small organism in a soup; size relative to others determines what eats what.
- **We take:** the prototype's **protist avatar** at pore scale, with water films as the only paths it can travel (a real constraint: protists move in water films). Scale shifts are cinematic and labeled.
- **We refuse:** evolution-as-progress and "eat to grow" as the goal. The protist is a guide, not a hero with a power curve.

### 2.6 Cell to Singularity (Computer Lunch, 2018): incremental + tech tree

- **What:** an idle clicker whose tech tree is a timeline of evolution and technology, each node with a short fact.
- **We take:** only the **visual tree of concepts** as an overview of what one has understood (our "Contents page", section 6).
- **We refuse:** idle/incremental loops, currency, and accelerating numbers. They teach nothing about mechanisms and would contradict the "no score" rule.

### 2.7 Zachtronics (SpaceChem, Opus Magnum, Exapunks)

- **What:** open-ended engineering puzzles with a rule set you fully understand; solutions are compared on histograms (cycles, cost, area) rather than leaderboards.
- **Why it works:** creativity under transparent rules; histograms show where you sit without ranking against named people.
- **We take:** **transparent rules** (every rule visible in the codex), **challenge puzzles** with several solutions ("keep the leaf carbon in the soil for 2 seasons, using any two management levers"), and **anonymous distributions** of solutions as *variety*, not ranking. Optional for the pilot; requires care.
- **We refuse:** "optimal solution" framing on farm management, where real tradeoffs depend on context.

### 2.8 Kurzgesagt (and similar explainer animation)

- **What:** flat, saturated vector illustration, consistent bird mascots, scale-jump narration, carefully sourced scripts with published source documents.
- **We take:** scale-jump transitions with a persistent scale bar; a consistent visual grammar for organisms (shape language per functional group); a **sources panel** for every chapter, as Kurzgesagt publishes for every video.
- **We refuse:** narration-heavy passive viewing; any "fact" without a source; cute anthropomorphism that implies intention ("the good bacteria fight the bad").

### 2.9 PhET Interactive Simulations (University of Colorado Boulder)

Design principles from Wieman, Adams & Perkins (2008, *Science*), Adams et al. (2008) and Podolefsky, Perkins & Adams (2010) on "implicit scaffolding":

- Make the **invisible visible** (pore water, O2, C atoms as tagged parcels).
- **Implicit scaffolding through affordances** rather than written instructions: controls that suggest their use, constrained so productive exploration is likely.
- **Multiple linked representations** (picture, graph, number) updated together.
- **Minimal text**, playful but non-trivial, immediate feedback on interaction.
- Interviews show students explore systematically when the sim has few controls and clear causal feedback.
- **We take all of it.** Every experiment bench obeys: ≤ 4 controls, one picture, one graph, one number, all linked. Plus PhET's practice of think-aloud interviews during development.

### 2.10 Explorable Explanations (Bret Victor, 2011) and "Up and Down the Ladder of Abstraction" (2011)

- **What:** reactive documents where numbers in text are draggable and the consequences recompute; laddering between a concrete instance and an abstraction over all instances.
- **We take:** **reactive sentences in codex entries** ("At [60]% of pore space filled with water, oxygen reaches the centre of a [2] mm aggregate in [about a minute]"), and the **ladder**: one run → sweep of a parameter → small multiples. The time-lapse comparison is a ladder step.

### 2.11 Nicky Case, *Parable of the Polygons* (with Vi Hart, 2014), and *Explorable Explanations* collection

- **What:** a tiny rule (shapes move if fewer than 1/3 neighbours match) produces an unexpected emergent outcome (strong segregation). The player first plays manually, then the rule runs automatically, then the player adjusts the rule.
- **Why it works:** surprise from emergence; manual-then-automatic sequencing gives ownership of the rule.
- **We take:** the **"you do it, then the world does it" sequence**: player moves carbon parcels by hand once (being a microbe eating), then watches the rule run at scale. Used for decomposition, immobilization and denitrification.

### 2.12 Foldit (Cooper et al., 2010, *Nature*) and Eterna (Lee et al., 2014, *PNAS*)

- **What:** citizen science puzzles where players' solutions were scored by physics (Foldit) or synthesised and tested in a real lab (Eterna).
- **Why it works:** real stakes; Eterna's split between in-silico score and *wet-lab result* taught players that models and experiments disagree.
- **We take:** the **model vs. measurement split** as a late-game theme: in the molecular chapter, a candidate peptide's in-silico prediction is a different card type from an assay result, and both differ from a field result. This mirrors the relevance map's chain (observed outcome → hypothesis → candidate → assay → plant test → field evidence).
- **We refuse:** implying players contribute to real Soilytix R&D. That would fabricate capability. Any citizen-science framing is out of scope.

---

## 3. Learning-science evidence and what it means for design

Effect sizes are indicative; most findings come from classroom or lab studies with school or university students, not adult employees in a self-paced game. Treat them as design priors, not guarantees.

| Principle | Key sources | Design consequence |
| --- | --- | --- |
| **Predict–Observe–Explain (POE)** | White & Gunstone (1992) *Probing Understanding*; Crouch et al. (2004) on predictions in lecture demos | Every experiment opens with a committed prediction (one tap, no penalty), then runs, then asks the player to reconcile. Predictions are saved in the notebook, so the player sees their own revised thinking. |
| **Productive failure / invention before instruction** | Kapur (2008, 2016); Sinha & Kapur (2021) meta-analysis, PS-I beats direct instruction for conceptual knowledge when designed well | First contact with a phenomenon is an open challenge ("make the leaf last longer") *before* the codex explains the mechanism. The explanation then arrives as a "here is why your attempts did what they did" consolidation. |
| **Retrieval practice** | Roediger & Karpicke (2006); Dunlosky et al. (2013) | Returning to a chapter starts with a 1–2 card recall ("What did you find limits decomposition here?") before showing the notebook. Transfer missions require recalling mechanisms from earlier chapters. Spaced: revisit prompts after 1 and 7 days (opt-in). |
| **Worked examples and fading** | Sweller & Cooper (1985); Renkl & Atkinson (2003); expertise reversal, Kalyuga et al. (2003) | First cause chain in each chapter is fully shown by the guide; the second has one blank; the third is built from scratch. Experienced players can skip worked examples (expertise reversal). |
| **Self-explanation** | Chi et al. (1994) | "Why did that happen?" is a structured prompt (choose a mechanism card + one free-text line), not an essay box. |
| **Cognitive load and multimedia** | Mayer, *Multimedia Learning* (3rd ed., 2020); Sweller, Ayres & Kalyuga (2011) | Coherence (no decorative motion during an explanation: living backdrops dim and slow when a card is open); signalling (highlight the one stock that changed); spatial and temporal contiguity (labels on the object, not in a legend); segmenting (player-paced steps); pre-training (meet the actors before their interactions); modality (optional audio narration, never required); redundancy (no identical narration + text). |
| **Conceptual change** | Posner et al. (1982); Chi (2008) on ontological miscategorisation; Vosniadou (1994) | Target named misconceptions (section 4) with discrepant events: the player's prediction is shown next to the result, the gap is named, and a plausible, fruitful alternative is offered. Never just "wrong". |
| **Intrinsic motivation without leaderboards** | Ryan & Deci (2000) self-determination theory; Deci, Koestner & Ryan (1999) on rewards undermining intrinsic motivation; Hanus & Fox (2015) leaderboards/badges lowered motivation and grades; Sailer & Homner (2020) gamification meta-analysis (small positive, design-dependent) | Autonomy (open map, choose what to investigate), competence (visible growth of *your own* explanations), relatedness (shared team notebook later, optional). No points, leaderboards, streak punishment or loot. Badges only as descriptive discoveries ("You traced carbon into microbial biomass"). |
| **Instructional support inside games** | Wouters & van Oostendorp (2013); Clark, Tanner-Smith & Killingsworth (2016); Mayer (2019) | Games alone teach less than games with explanation prompts, feedback and reflection. Explanation is part of the core loop, not a quiz after play. |
| **Guidance over pure discovery** | Kirschner, Sweller & Clark (2006); Alfieri et al. (2011) meta-analysis: *enhanced* discovery beats both unassisted discovery and pure direct instruction | Discovery is always scaffolded: constrained controls, prompts, hints on demand, consolidation. |
| **Curiosity** | Loewenstein (1994) information-gap theory; Gruber, Gelman & Ranganath (2014) | Rumor map shows gaps; each chapter opens with a puzzling observation, not a definition. |
| **Interactive engagement gains** | Hake (1998), normalized gain | Pilot uses normalized gain on a short causal-question inventory (section 12). |

---

## 4. Target misconceptions

Chosen because they are common, consequential for how employees talk to customers, and testable. Each has a discrepant event in the game.

| Misconception | Discrepant event in Pedologicus | Source / note |
| --- | --- | --- |
| Soil is inert dirt; plants "eat" soil | Weigh-the-pot experiment (van Helmont, ~1648, as a playable lab bench): tree gains 74 kg, soil loses ~0.06 kg | Classic; widely documented in plant-nutrition misconception literature |
| Decomposed matter disappears | Tagged-carbon parcel: total C conserved, most leaves as CO2, some becomes microbial biomass and persists | Mass-balance display |
| More water is always better for life | Waterlogging run: O2 drops, decomposition slows, denitrification rises | Redox chapter |
| Microbes are good or bad | Same organism in two contexts behaves differently; pathogen presence without disease | Context-dependence; no hero/villain art |
| More diversity always means healthier soil | Two plots with similar richness and different function; a disturbed plot with high richness | Company rule: indicators describe, models predict |
| Detecting DNA means it is active / causing the effect | Scientist lens: DNA present, process rate measured as low | Measurement vs. inference |
| Total nitrogen = available nitrogen | Straw added (high C:N) → plant N availability falls temporarily (immobilization) | N relay chapter |
| Soil organic matter is "humus", stable molecules | Lehmann & Kleber (2015) soil continuum model: persistence depends on access and protection in aggregates | Modern view; keep claims modest |
| Correlation in a field map shows cause | Two fields where a confounder (drainage) drives both microbe and yield | G×E×M chapter |

---

## 5. Core loop

**Decision:** one loop at every scale, with five verbs and a notebook.

```
       ┌──────────── curiosity hook (a puzzling observation on the Rumor Map) ────────────┐
       ▼                                                                                   │
   EXPLORE  ── scan / zoom / sample ──►  QUESTION  ──►  PREDICT (commit)  ──►  EXPERIMENT   │
                                                                              (perturb, time-lapse, compare)
                                                                                   │
   NOTEBOOK ◄── EXPLAIN (cause-chain cards, batch-confirmed) ◄── OBSERVE (linked picture/graph/number)
       │
       └──► new rumors, new zoom levels, new tools unlocked  ───────────────────────────────┘
```

- **Micro-loop** (30–90 s): scan something, read its card, notice a rumor.
- **Experiment loop** (3–6 min): predict → run → compare → explain one relationship.
- **Mission loop** (10–15 min): 2–3 experiments → one batch of cause chains → one transfer question.
- **Chapter loop** (45–90 min across sessions): complete a world's chain set, unlock its scientist lens and the next scale.

### 5.1 Verbs (discovery mechanics)

| Verb | Interaction | Teaches | Unlocked |
| --- | --- | --- | --- |
| **Scan** | Hold on an object ~1 s; ring fills | Identity, functional role, what it needs | Start |
| **Zoom** | Scroll/pinch or click a portal; cinematic jump with scale bar (10 km → 1 m → 1 cm → 100 µm → 1 µm → 1 nm) | Scale, emergent vs. local processes | One step at a time, by question |
| **Sample** | Take a core or a pinch; it goes to the **lab bench** where measurement instruments are used | Measurements are taken from a sample, at a time, with error | Chapter 1 end |
| **Perturb** | Few levers per bench: water, temperature, residue type, tillage, crop, rotation | Causation via controlled change | Per experiment |
| **Time-lapse** | Scrub a timeline; compression factor always visible ("1 s = 3 days") | Rates, delays, seasons | Chapter 1 |
| **Compare** | Split view: A/B worlds with one lever differing; diff highlighted | Control of variables | After first perturb |
| **Tag** | Mark a carbon or nitrogen parcel and follow it | Conservation, pathways | Chapter 2 |
| **Lens** | Toggle habitat / community / flows / scientist lens on the same state | Multiple representations; evidence types | Progressive |

---

## 6. Progression structure: chapters, worlds, scales

**Decision:** the textbook's table of contents *is* the world map. Each chapter is a biome or scale; within a chapter, missions are pages. The "Contents" screen doubles as a progress view, showing understood concepts as filled nodes (Cell to Singularity tree, without currency).

| # | Chapter (textbook topic) | World / scale | Opening puzzle (rumor) | Core mechanisms | Scientist-lens payoff |
| --- | --- | --- | --- | --- | --- |
| 0 | **A handful of soil** (onboarding) | Hand-scale to pore | "Is this alive?" | Solids, water, air, life; ~45/25/25/5 volume schematic | What a sample is |
| 1 | **Habitat physics** | Aggregate and pore (100 µm) | "Why is this bacterium starving next to food?" | Texture, pores, water films, connectivity, O2 diffusion | Water content vs. water potential |
| 2 | **Where did the leaf go?** (carbon) | Litter layer and topsoil | "The leaf vanished; the soil barely got heavier" | Decomposition, respiration, microbial biomass, residue quality, CUE (qualitative) | Respiration measurement vs. inferred decomposition |
| 3 | **Who eats whom** (food web) | Rhizosphere | "Bacteria near the root multiply, then crash" | Root exudates, grazing protists and nematodes, microbial loop | Community composition is relative (compositional data) |
| 4 | **The nitrogen relay** | Root zone, generic crop (sugar beet world) | "Straw was added and the crop turned yellow" | Mineralization, immobilization, nitrification, leaching, C:N | Total vs. available N; one sample is one moment |
| 5 | **Partners at the root** | Root (legume world: pea/bean) | "This plant grows without N fertiliser" | Rhizobia and nodules, mycorrhizae, carbon-for-nutrient trade | Presence of a partner ≠ effective partnership |
| 6 | **After the downpour** (redox) | Paddy (rice world) and a waterlogged field | "The flooded field smells; the rice is fine" | O2 depletion, redox ladder, denitrification, methane | Tradeoffs: no single score |
| 7 | **Soil chemistry** | Clay surface (nm) | "The fertiliser stayed where the clay was" | Charge, CEC, pH, sorption, buffering | pH is measured in a solution under a protocol |
| 8 | **Profiles and time** (pedogenesis) | Profile pit, 1–2 m; millennia | "Why are these layers coloured differently?" | Horizons, parent material, climate, organisms, relief, time (CLORPT, Jenny 1941) | Soil maps as interpretations |
| 9 | **Seasons and management** | Field (generic spinach seed crop world) | "Same seed, two fields, different harvests" | Rotation, cover crops, tillage, residue, history | G×E×M: separating genotype, environment, management |
| 10 | **Landscape and climate** | Landscape (km); stillwet-style living backdrop | "Where does the water from the hill go?" | Erosion, catena, hydrology, carbon at landscape scale | Satellite/environmental covariates describe, not explain |
| 11 | **What does the sample tell us?** (capstone) | Lab bench and report | "Two reports disagree" | Measurement → derived evidence → interpretation → recommendation; benchmarks, confidence, provenance | Build a small honest report with uncertainty |
| ★ | **The neighbour's chemical toolkit** (optional) | Cell and molecule | "Nothing grows near this colony" | Antagonism, lipopeptide families (iturin, fengycin, surfactin) as *examples*, in-vitro vs. in-vivo | Prediction ≠ assay ≠ field result |

Rules:

- Chapters 0–2 are linear (onboarding); after Chapter 2 the map opens and chapters 3–10 can be entered in any order once their opening rumor is discovered (Outer Wilds openness). Chapter 11 requires any four completed chapters because it reuses their mechanisms.
- Crop worlds are **generic** (spinach seed production, pea, bush bean, sugar beet, rice). No customer names, fields, data or results appear anywhere in the content.
- **Pilot scope decision:** Chapters 0, 1, 2 and 4 plus a short version of 11. The rest is the authored roadmap.

---

## 7. Notebook and codex

**Decision:** one notebook, four tabs, and the notebook is the only reward.

1. **Rumor Map** (Outer Wilds ship log). Nodes: places and phenomena. States: *glimpsed* (dim, question mark), *investigated*, *explained* (filled). Edges: "hints at" (dashed) and "explains" (solid, from a confirmed cause chain).
2. **Field cards** (Subnautica databank). Organisms, materials, processes, tools. Fields: what it is, what it uses, what it makes, what it needs, who it meets, scale, sources. Cards unlock partially by scanning, fully by experiment.
3. **Lab book** (the evidence record). Every experiment the player ran: prediction, settings, result graph, explanation, timestamp. Entries are styled by evidence type:
   - **Observed** (measurement): mono numbers, sample ID, time, instrument, uncertainty band.
   - **Derived** (evidence): computed from observations, formula visible.
   - **Interpreted** (my explanation): player's cause chain, with confidence they chose.
   - **Would do** (recommendation): only in chapters 9 and 11, always conditional ("if …, then …, because …").
4. **Codex** (the textbook). Reactive explanations (Bret Victor style), each with an "In the real world" box, a simplification note ("the game merges all fungi into one functional group; real fungi differ"), and sources. Codex pages unlock *after* the related experiment, never before (productive failure).

Each notebook entry carries **provenance**: which world, which run, which rule version. This is the company's provenance discipline taught by example.

---

## 8. Assessment by explanation: cause-chain cards

**Decision:** the central assessment is building cause chains from cards. No multiple-choice quizzes in the main flow.

- **Cards** are of four kinds, colour- and shape-coded (never colour only): *Condition* (water ↑), *Actor* (bacteria), *Process* (respiration), *Outcome* (O2 ↓ in aggregate centre). Plus connector words: *increases*, *decreases*, *enables*, *limits*, *only if*.
- A chain is 3–5 cards: `Waterlogged pores → limits → O2 diffusion → enables → denitrifier activity → increases → N2O/N2 loss`.
- **Batch confirmation** (Obra Dinn): a mission's 2–3 chains are confirmed together. Feedback is "N of M supported" plus, per wrong chain, a *diagnostic* message tied to the specific misconception detected (rule table authored per mission).
- **Three verdicts:** *Supported by what you observed*, *Plausible but you have not tested it* (prompts a new experiment — this is where curiosity loops back), *Contradicted by your run* (shows the run).
- **Confidence slider** on each chain (low/medium/high). Calibration is reflected back gently ("you were confident and right 4/5 times"), never scored.
- **Transfer question** at the end of each mission: a new context, same mechanism ("Will a woody residue in cold soil follow the same chain?"). The answer is a chain plus "what would you measure next?" (a single choice from instrument cards). This mirrors the agentic-products idea of bounded, uncertainty-aware next questions without an omniscient tutor.
- Free-text one-liner is optional and stored locally only; useful for pilot interviews.

---

## 9. Experiments and the bounded simulation

**Decision:** an authored, deterministic, rule-based box model per plot, running in a Web Worker or plain module, with seeded noise for measurements only.

### 9.1 State

Per plot (or per pore cell in micro views), integer or fixed-point stocks to make conservation exact:

- **Carbon:** litter C, dissolved organic C, microbial biomass C, protected (aggregate/mineral-associated) C, root C, CO2 out, CH4 out.
- **Nitrogen:** organic N (litter, SOM), microbial N, NH4+, NO3-, plant N, N2/N2O out, leached N.
- **Water:** pore water, plant water, drainage out, evaporation/transpiration out; derived water-filled pore space (WFPS).
- **Conditions (not conserved):** temperature, O2 index (derived from WFPS and aggregate size), pH, texture, structure index.
- **Communities:** functional-group activity indices (decomposer bacteria, fungi, nitrifiers, denitrifiers, methanogens, grazers, mycorrhizae, rhizobia). These are *indices*, not cell counts, and labeled as such.

### 9.2 Rules

- First-order kinetics with modifiers: `flux = k × stock × f(T) × f(W) × f(O2) × f(C:N)`, each modifier a small authored curve (piecewise linear) with its source cited in the codex (e.g., Q10 form for temperature; moisture optimum near intermediate WFPS; denitrification above ~60–70% WFPS as a qualitative threshold). Parameters are **teaching values**, calibrated to give the right *direction and rough order*, not site predictions.
- C:N stoichiometry drives immobilization vs. mineralization: microbes need N in proportion to the C they assimilate; if N is short, they take mineral N.
- Carbon-use efficiency splits assimilated C between biomass and CO2.

### 9.3 Conservation and invariants

- Every transfer is a **double entry**: `from -= x; to += x`. Boundary sinks/sources (atmosphere, groundwater, fertiliser, harvest) are explicit stocks.
- A test asserts after every step: `Σ C_in + C_initial = Σ C_stocks + Σ C_out` (same for N and water) to the fixed-point unit. Violations throw in development.
- Animations are *driven by* fluxes, never the reverse: a particle exists on screen only if it represents a parcel in the model.

### 9.4 Experiment benches

Each bench: ≤ 4 levers, a picture, one graph, one number (PhET rule). Example benches: **Leaf in a jar** (water, temperature, residue type), **Aggregate O2** (water, aggregate size), **Straw and nitrogen** (residue C:N, mineral N added), **Flooded paddy** (water regime, organic input), **Rotation planner** (crop sequence, cover crop, tillage over 3 seasons).

### 9.5 Measurement layer

The model has a true state; the **instruments** read it through a measurement model: sampling depth, time, detection limits, seeded noise, and relative composition for sequencing (abundances sum to 1, so an increase in one group appears as decreases in others). This makes "measurement ≠ truth" and compositional data tangible without lecturing.

---

## 10. Showing uncertainty and measurement vs. inference

- **Visual grammar** (consistent across the app):
  - Measured value: IBM Plex Mono number, sample ID, ± band, a small instrument icon.
  - Derived: number with a visible formula on hover; dashed outline.
  - Interpretation: card with the player's chosen confidence; italic connector words.
  - Model prediction (the game's simulation or a "forecast"): shaded fan/ribbon, labeled "teaching model".
- **Replicates.** The lab bench lets the player take 1, 3 or 5 replicate samples; the spread is shown as dots, not just a mean. Mission in chapter 11 makes a decision flip if only one sample is taken.
- **Benchmarks.** Any value shown in the scientist lens appears against a stated reference distribution (in-game, from the simulated region), never alone. Benchmark source and size are shown.
- **Microbiome caution.** Sequencing results show relative abundance with a persistent caption ("relative, not absolute; presence ≠ activity"). Causal language is blocked in cards: the card set for sequencing outcomes has no *causes* connector, only *is associated with*.
- **Teaching-model label.** A small persistent tag "Teaching model — direction, not prediction" on any simulated graph.
- **Uncertainty is not failure.** One mission rewards answering "cannot tell yet; measure X" as the correct chain.

---

## 11. Missions, onboarding, sessions, save state

### 11.1 Mission template

Each mission is a JSON/TS file authored by content owners:

```
id, chapter, title, rumorTrigger, learningObjective (1 sentence),
misconceptionsTargeted[], bench (levers, ranges, initialState),
prediction {prompt, options[]}, steps[], chainsExpected[] (with accepted variants),
diagnostics[{pattern, message}], transfer {scenario, acceptedChains[], measureNext[]},
codexUnlocks[], sources[], reviewer, reviewStatus, simplificationNotes[]
```

`reviewStatus` must be `approved` for a mission to appear outside development builds (scientific review gate, per the proposal).

### 11.2 First two minutes (onboarding)

Target: the player has made a prediction and seen a surprising result within 120 seconds, with zero instruction text longer than one line.

| Time | What happens |
| --- | --- |
| 0–10 s | Living landscape backdrop (stillwet-like painterly motion: wind in grass, cloud shadow). One line: "Pick up a handful." Single obvious affordance. |
| 10–30 s | Handful in view. Prompt: "How much of this is solid rock and mineral?" Slider prediction (commit). |
| 30–60 s | Handful separates into solids / water / air / life layers by volume; prediction marker shown against result (~half is pore space). First notebook entry appears with a page-flip sound: *Observed: half of soil is space.* |
| 60–90 s | Zoom portal pulses on a pore. Zoom in: water films, a bacterium, the protist guide. "Scan anything." First scan. |
| 90–120 s | Rumor appears: "This bacterium is next to food but not eating. Why?" The Rumor Map opens with one glowing node. Player is free. |

No account, no settings screen, no tutorial pop-ups. Accessibility settings are reachable from a small gear and honour `prefers-reduced-motion` automatically.

### 11.3 Session length

- **Decision:** design for 10–15 minute sessions; one mission per session, with a natural stopping point (notebook summary page) at the end of each mission. Full pilot path ≈ 4 sessions / 60 minutes. Whole roadmap ≈ 6–8 hours.
- Resume screen shows "Last time you found …" plus one retrieval card (section 3).

### 11.4 Save state

- **Decision:** `localStorage` only for the pilot; no accounts, no server, no analytics beacons.
- Key `soilworlds:v1`, JSON: `{schemaVersion, createdAt, settings, chaptersUnlocked, rumors{id: state}, cards{id: level}, labBook[], chains{missionId: {attempts[], confirmed}}, predictions[], lastSession, pilot{participantCode?, preTest?, postTest?}}`.
- Wrapped in try/catch; the game runs fully in memory if storage is unavailable, with a small notice.
- **Export/import** notebook as a JSON file (also how pilot data is collected voluntarily; see 12). Migration function per schema version.
- Size budget: lab book capped (most recent 200 runs; graphs stored as summary points).

---

## 12. Pilot evaluation

The aim is to learn whether the game teaches causal reasoning, not whether people enjoy it. Enjoyment is a secondary signal.

### 12.1 Design

- **Participants:** 8–12 Soilytix employees without agronomy/microbiology background (engineering, commercial, ops), recruited voluntarily. Small sample: a usability and learning signal, not statistical proof.
- **Scope:** chapters 0, 1, 2, 4 and the short capstone (~60 min over 2–4 sessions).
- **Instruments:**
  1. **Pre-test** (in-app, before chapter 0, ~6 min): 8 causal items, two per target mechanism (habitat/O2, decomposition and C fate, immobilization, measurement vs. inference). Each item: a scenario, a forced choice, and a one-line "why". Plus 2 confidence ratings.
  2. **Post-test** (immediately after): parallel isomorphic items (different surface story, same mechanism), counterbalanced A/B forms.
  3. **Delayed transfer** (7 days later): 3 unfamiliar scenarios (e.g., compost in a cold clay soil) requiring a cause chain and "what would you measure next".
  4. **Think-aloud** with 4–5 participants during first session (PhET method), recorded as notes.
  5. **Short survey:** intrinsic motivation inventory interest/enjoyment subscale (IMI; Ryan, 1982) and perceived competence, 6 items; plus "what confused you".
  6. **In-game logs** (local, exported voluntarily): prediction accuracy over time, hint use, chain attempts per batch, time on bench.
- **Scoring:** items scored 0/1 for choice and 0–2 for the explanation using a rubric (0 = no mechanism, 1 = partial, 2 = correct mechanism with condition). Two raters on the explanation, agreement checked (Cohen's κ).

### 12.2 Metrics and gates

| Metric | Target to continue building |
| --- | --- |
| Normalized gain (Hake) on causal items, `(post − pre)/(max − pre)` | ≥ 0.3 median |
| Delayed transfer: correct chain on ≥ 2 of 3 | ≥ 60% of participants |
| Unfacilitated completion of the pilot path | ≥ 80% |
| Misconception persistence: any single misconception held by ≥ 50% post | Revise that mission before new content |
| Measurement-vs-inference item correct post | ≥ 70% |
| IMI interest/enjoyment | Recorded; not a gate |

Gates are proposals, not commitments; they follow the proposal's "4 of 5" spirit but are quantified for a slightly larger group.

### 12.3 Ethics and data

Participation voluntary, not linked to performance review, data anonymised by participant code, stored in the exported JSON and a team folder only. No external analytics.

---

## 13. Design principles checklist (for reviewers and builders)

1. Every screen answers: what can I poke, what changed, why.
2. One new idea per experiment; ≤ 4 levers.
3. Prediction before every run; never penalised.
4. Explanations unlock after experience, not before.
5. Matter conserved; energy shown leaving as heat; animations driven by model fluxes.
6. Measured, derived, interpreted and recommended things look different.
7. No universal health score, leaderboard, currency or streak penalty.
8. Organisms are functional roles in context, never heroes or villains.
9. Microbiome data shown as relative, with "associated with", never "causes".
10. Each mission has a source list, simplification notes and a reviewer.
11. Generic crops only; no customer names, sites or results.
12. Living backdrops calm down when the player is reading or explaining (Mayer coherence).
13. Works with keyboard, reduced motion and without colour cues.

---

## 14. Open decisions (flagged for the founder and a scientific reviewer)

- **Scientific reviewer** not assigned; missions cannot be marked `approved` until one is.
- Whether the **protist** remains the player avatar at all scales or only at pore scale (current lean: guide at micro scales, a field notebook persona at field/landscape scale).
- Whether **Chapter ★ (molecular toolkit)** belongs in an employee tool given the bioassets data boundary is unresolved. Current lean: keep as optional, uses only published lipopeptide families as examples.
- Whether outsiders (later audience) change tone or content; current content is written for adult employees.
- Whether to add an optional **team notebook** (relatedness) later; out of pilot scope (needs a backend).
- Pilot thresholds in 12.2 are proposals.

---

## 15. References

Games and tools:
- Mobius Digital (2019). *Outer Wilds*. Annapurna Interactive.
- Unknown Worlds (2018). *Subnautica*.
- Pope, L. (2018). *Return of the Obra Dinn*. 3909.
- Strange Loop Games (2018). *Eco*. Maxis (1990, 1992). *SimEarth*, *SimLife*. Maxis (2008). *Spore*.
- Computer Lunch (2018). *Cell to Singularity*.
- Zachtronics (2011–2019). *SpaceChem*, *Opus Magnum*, *Exapunks*.
- Kurzgesagt – In a Nutshell (YouTube channel and published source documents).
- PhET Interactive Simulations, University of Colorado Boulder. https://phet.colorado.edu
- Victor, B. (2011). *Explorable Explanations*; *Up and Down the Ladder of Abstraction*. worrydream.com
- Hart, V. & Case, N. (2014). *Parable of the Polygons*. https://ncase.me/polygons/
- Cooper, S. et al. (2010). Predicting protein structures with a multiplayer online game. *Nature* 466, 756–760.
- Lee, J. et al. (2014). RNA design rules from a massive open laboratory. *PNAS* 111(6), 2122–2127.
- Stillwet (https://stillwet.art/) as a visual reference for living painterly backdrops.

Learning science:
- Adams, W. K. et al. (2008). A study of educational simulations Part I/II. *J. Interactive Learning Research* 19(3–4).
- Alfieri, L. et al. (2011). Does discovery-based instruction enhance learning? *J. Educational Psychology* 103(1), 1–18.
- Chi, M. T. H. et al. (1994). Eliciting self-explanations improves understanding. *Cognitive Science* 18, 439–477.
- Chi, M. T. H. (2008). Three types of conceptual change. In Vosniadou (Ed.), *Handbook of Research on Conceptual Change*.
- Clark, D. B., Tanner-Smith, E. E. & Killingsworth, S. (2016). Digital games, design, and learning: a systematic review and meta-analysis. *Review of Educational Research* 86(1), 79–122.
- Deci, E. L., Koestner, R. & Ryan, R. M. (1999). A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation. *Psychological Bulletin* 125(6), 627–668.
- Dunlosky, J. et al. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest* 14(1), 4–58.
- Gruber, M. J., Gelman, B. D. & Ranganath, C. (2014). States of curiosity modulate hippocampus-dependent learning. *Neuron* 84(2), 486–496.
- Hake, R. R. (1998). Interactive-engagement versus traditional methods. *American Journal of Physics* 66(1), 64–74.
- Hanus, M. D. & Fox, J. (2015). Assessing the effects of gamification in the classroom. *Computers & Education* 80, 152–161.
- Kalyuga, S. et al. (2003). The expertise reversal effect. *Educational Psychologist* 38(1), 23–31.
- Kapur, M. (2008). Productive failure. *Cognition and Instruction* 26(3), 379–424; Kapur, M. (2016). *Educational Psychologist* 51(2), 289–299.
- Kirschner, P. A., Sweller, J. & Clark, R. E. (2006). Why minimal guidance during instruction does not work. *Educational Psychologist* 41(2), 75–86.
- Loewenstein, G. (1994). The psychology of curiosity. *Psychological Bulletin* 116(1), 75–98.
- Mayer, R. E. (2019). Computer games in education. *Annual Review of Psychology* 70, 531–549.
- Mayer, R. E. (2020). *Multimedia Learning* (3rd ed.). Cambridge University Press.
- Podolefsky, N. S., Perkins, K. K. & Adams, W. K. (2010). Factors promoting engaged exploration with computer simulations. *Phys. Rev. ST Phys. Educ. Res.* 6, 020117.
- Posner, G. J. et al. (1982). Accommodation of a scientific conception. *Science Education* 66(2), 211–227.
- Renkl, A. & Atkinson, R. K. (2003). Structuring the transition from example study to problem solving. *Educational Psychologist* 38(1), 15–22.
- Roediger, H. L. & Karpicke, J. D. (2006). Test-enhanced learning. *Psychological Science* 17(3), 249–255.
- Ryan, R. M. & Deci, E. L. (2000). Self-determination theory. *American Psychologist* 55(1), 68–78.
- Sailer, M. & Homner, L. (2020). The gamification of learning: a meta-analysis. *Educational Psychology Review* 32, 77–112.
- Sinha, T. & Kapur, M. (2021). When problem solving followed by instruction works. *Review of Educational Research* 91(5), 761–798.
- Sweller, J. & Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving. *Cognition and Instruction* 2(1), 59–89.
- Sweller, J., Ayres, P. & Kalyuga, S. (2011). *Cognitive Load Theory*. Springer.
- White, R. & Gunstone, R. (1992). *Probing Understanding*. Falmer Press.
- Wieman, C. E., Adams, W. K. & Perkins, K. K. (2008). PhET: Simulations that enhance learning. *Science* 322, 682–683.
- Wouters, P. & van Oostendorp, H. (2013). A meta-analytic review of the role of instructional support in game-based learning. *Computers & Education* 60(1), 412–425.

Soil science anchors (content sources to be expanded by the curriculum research):
- Weil, R. R. & Brady, N. C. (2017). *The Nature and Properties of Soils* (15th ed.). Pearson.
- Jenny, H. (1941). *Factors of Soil Formation*. McGraw-Hill.
- Lehmann, J. & Kleber, M. (2015). The contentious nature of soil organic matter. *Nature* 528, 60–68.
- Schmidt, M. W. I. et al. (2011). Persistence of soil organic matter as an ecosystem property. *Nature* 478, 49–56.
- USDA NRCS. *Soil Biology Primer*. FAO. Soil food webs overview.
- Gloor, G. B. et al. (2017). Microbiome datasets are compositional: and this is not optional. *Frontiers in Microbiology* 8, 2224.
