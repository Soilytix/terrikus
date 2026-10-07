---
title: "Soil Worlds — World bible"
description: "The whole world: scales, crop worlds, cast, chapters, scenes, missions, discoveries, misconceptions and sources."
status: draft — scientific review pending on every chapter
date: 2026-10-06
---

# Soil Worlds — World bible

> **A textbook you read by doing experiments.** Each chapter is a place, and each page is a phenomenon you can poke. What you learn, you keep as your own explanations in a field notebook. There are no points.

This document is the content authority for the build. `spec.md` defines how content is encoded, and `art-direction.md` defines how it looks. `docs/research/curriculum.md` remains the deeper science reference. Where this bible simplifies the curriculum, the curriculum wins until a scientific reviewer decides otherwise. Every fact here carries a source id from `sources.md`, and every chapter is `draft` until a named reviewer approves it.

Contents:

- §1 The world in one page
- §2 Scales
- §3 Crop and reference worlds
- §4 The cast
- §5 Process index
- §6 The chapters
- §7 Cross-cutting systems
- §8 Banks
- §9 Content rules

---

## 1. The world in one page

- **One place, six zoom levels.** The player stands in a single generic river valley: a hill with woodland on top, a patchwork of fields on the slope, and a paddy and river at the bottom. Every scale is nested inside that valley.
  - The **landscape** contains fields.
  - A **field** has a pit you can climb into: the **profile**.
  - A **clod** on the pit wall opens into the **aggregate and pore** world.
  - A root running through it opens into the **rhizosphere**.
  - A clay platelet, a cell or a nodule opens into the **cell and molecule** scale.
- **Two guides, no mascots.**
  - At micro scales the player can *become* a bacterial-grazing **amoeba** (from the prototype). It moves only through water films, eats bacteria and excretes ammonium. It cannot change the weather.
  - At field and landscape scales the player is simply **the naturalist**: you, with a notebook, a spade, a sampling probe and a lab bench.
  - Neither guide has a face or a voice line. Character comes from morphology and movement.
- **Actor versus experiment.** The amoeba acts *inside* the world. Changing conditions (rain, temperature, residue, tillage) happens on an **experiment bench**, which the UI marks as "not something the amoeba does". The prototype got this right, and it is kept.
- **Knowledge is the only key.** Places open when you have a question that leads there (a rumor), never when you have collected enough points.
- **Honesty is visible.** Every scene carries a scale bar and, where needed, a *not to scale* badge. Every simulated graph carries "Teaching model — direction, not prediction". Every number carries a confidence tag. Every card carries its sources.

### Chapter map

| # | Chapter | Home scale | World | Opening rumor (the hook) | Phase |
|---|---|---|---|---|---|
| P | **A Handful of Soil** | handful → aggregate | Spinach home field | "Is this alive?" | **Build** |
| 1 | **The Pore Labyrinth** | aggregate & pore | Spinach home field | "Why is this bacterium starving next to food?" | Later |
| 2 | **Where Did the Leaf Go?** | litter layer → aggregate | Spinach home field edge (hedge leaf) | "The leaf vanished, but the soil barely got heavier." | **Build** |
| 3 | **Water Roads** | aggregate + profile | Spinach home field | "After the dry spell, the soil breathed out a burst." | Later |
| 4 | **Breath and Rust** | profile + aggregate | Rice paddy | "The flooded field smells of eggs, and the rice is fine." | Later |
| 5 | **Charged Surfaces** | cell & molecule | Spinach field / acid woodland edge | "The fertiliser stayed exactly where the clay was." | Later |
| 6 | **Who Eats Whom** | aggregate + rhizosphere | Spinach field + forest reference | "Bacteria near the root multiply, then crash." | Later |
| 7 | **The Root's Neighbourhood** | rhizosphere | Spinach | "The soil touching the root is a different country." | Later |
| 8 | **Partners and Traders** | rhizosphere + cell | Pea and bush bean; spinach and sugar beet as contrast | "This plant grows without nitrogen fertiliser, and that one has no fungal partner at all." | Later |
| 9 | **The Nitrogen Relay** | rhizosphere + field | Sugar beet | "Straw was ploughed in and the next crop turned yellow." | Later |
| 10 | **Disease and Defence** | rhizosphere + field | Pea / bush bean rotation; sugar beet suppressive soil | "The pathogen is here, but the plants are healthy." | Later |
| 11 | **Pit Walls and Deep Time** | profile + landscape | Catena: woodland, slope, paddy | "Why are these layers different colours?" | Later |
| 12 | **Fields and Seasons** | field | All crop worlds | "Same seed, two fields, different harvests." | Later |
| 13 | **Hillslope and River** | landscape | Whole valley | "Where does the soil from the hill go?" | Later |
| 14 | **What Does the Sample Tell Us?** | lab bench | Any world, chosen by the player | "Two reports about the same field disagree." | Later |
| ★ | **The Neighbour's Chemical Toolkit** (optional) | cell & molecule | Rhizosphere of any crop | "Nothing grows near this colony." | Later |

**Progression:**

1. The Prologue is linear, about 5 minutes.
2. After it, chapters 1 and 2 are both open, and the player may take them in either order.
3. When both are done, the **valley map opens** and chapters 3–13 open as their opening rumors are discovered.
4. Chapter 14 needs any four completed chapters, because it reuses their benches.
5. Chapter ★ opens from a rumor in chapter 10 or 7.

---

## 2. Scales

Each scale has a characteristic length, a characteristic time, a set of residents and a palette recipe (art-direction.md §4). The scale bar always shows the true length unit. When organisms are enlarged to be visible, a *not to scale* badge names the enlargement. The ladder rests on `nrcs-soil-survey-manual`, `kuzyakov-razavi-2019`, `or-2007` and `young-crawford-2004`.

| id | Scale | Length | Clock | Who and what is visible | Portals down | Portals up |
|---|---|---|---|---|---|---|
| `landscape` | Landscape | 100 m – 10 km | centuries – millennia | Hill, woodland, slope fields, paddy, river, weather, satellite inset | a field | — |
| `field` | Field | 1 – 100 m | seasons – decades | Crop rows, residue, wheel tracks, cover crop, sampling probe, cut-away edge | the soil pit | valley |
| `profile` | Profile | 1 cm – 2 m | years – millennia | Horizons O/A/E/B/C(/R), roots, burrows, mottles, water table, depth rail | a clod; a root | field |
| `aggregate` | Aggregate & pore | 10 µm – 10 mm | hours – years | Grains (sand/silt/clay), aggregates, pore network, water films, air, hyphae, protists, nematodes, mites, springtails | a root surface; a clay surface; a bacterium | profile |
| `rhizosphere` | Rhizosphere | 0.1 – 5 mm from a root | minutes – weeks | Root tip, cap, mucilage, root hairs, exudate gradient, nodules, arbuscules, biofilm | a nodule; a cell | aggregate |
| `cell` | Cell & molecule | 1 nm – 10 µm | seconds – days | Bacterial cell cutaway, clay platelet with exchange sites, ions, enzymes, DNA, lipopeptides | — | rhizosphere / aggregate |

There is also a non-spatial place: the **lab bench**, reachable from any scale with the Sample verb. It is not a zoom level. It is where samples become measurements, and it carries the measurement lens.

**Scale stamps.** Crossing a rung for the first time adds a stamp to the notebook: "You went from 1 m to 1 mm: a factor of 1,000." This is a T1 discovery.

---

## 3. Crop and reference worlds

All worlds are **generic**. No customer, variety, field, trial, dataset or result appears anywhere in the content. Crop-specific thresholds (disease scores, yield cut-offs) never become universal rules. The worlds were chosen because each one teaches something the others cannot.

| id | World | What it uniquely teaches | Anchor chapters | Key facts (sources) |
|---|---|---|---|---|
| `spinach` | **Spinach** (home world; generic crop, decision recorded in `docs/backlog.md` D-R1) | A **typically non-mycorrhizal** crop, which surprises players who learned "all crops have fungal partners". Shallow roots and sensitivity to waterlogging. | P, 1, 2, 3, 6, 7, 8 | Amaranthaceae are typically non-mycorrhizal; low or occasional AM colonisation is reported (`brundrett-tedersoo-2018`) |
| `pea` | **Pea** | Nodules with *Rhizobium leguminosarum* bv. *viciae*; host-specific root-rot carry-over in short rotations (oomycete *Aphanomyces* as a textbook example, not a field score) | 8, 10, 12 | `oldroyd-2013`, `bennett-2012` |
| `bean` | **Bush bean** | A *different* rhizobial partner from pea, so pea and bean are never interchangeable skins; bacterial and fungal root diseases as generic examples | 8, 10 | `oldroyd-2013` |
| `sugarbeet` | **Sugar beet** | Non-mycorrhizal; high-C:N straw from the preceding cereal versus low-C:N beet tops for immobilisation; the published *Rhizoctonia*-suppressive soil story | 9, 10 | `nrcs-cn-ratios`, `mendes-2011` |
| `rice` | **Rice paddy** | A deliberately contrasting habitat: the redox ladder, methane, N loss pathways, an oxidised surface film over reduced soil | 4, 9, 13 | `borch-2010`, `saunois-2020` |
| `forest` | **Woodland on the hilltop** (reference world) | O horizon and litter, ectomycorrhiza, enchytraeids, invasive earthworms, the contested "wood wide web" | 6, 8, 11 | `karst-2023`, `hendrix-2008` |
| `bare` | **Bare control plot** | A comparison world: same soil, no plant. It exists so that "the plant did it" can be tested. | 2, 7, 12 | — |

**World presets** are typed data (spec §5.3): crop, root architecture (tap or fibrous), mycorrhizal status, partner, residue C:N and season calendar. Switching world changes scene art and bench defaults, never the rules.

---

## 4. The cast

Organisms are **functional roles in context**, never heroes or villains (M8). Each card shows:

- size bar (true size);
- what it eats;
- what eats it;
- what it transforms;
- what it needs;
- who it meets;
- **how we know** (microscopy, culture, DNA, process measurement);
- sources;
- a truth tag: `reference-drawn`, `schematic` or `decorative`.

A card unlocks *partly* by Scan and *fully* only after the organism's role has been seen in an experiment.

| id | Organism / group | Size (true) | Group badge | Home scales | Signature behaviour on screen | Where it teaches | Sources |
|---|---|---|---|---|---|---|---|
| `phage` | Bacteriophages | 50–200 nm | virus | cell | Dock on a cell; lysis burst releases contents | 6 | `williamson-2017` |
| `bacteria-copio` | Fast-growing bacteria (copiotroph role) | 0.5–2 µm | decomposer | aggregate, rhizosphere | Bloom near exudates; microcolonies | P, 2, 6, 7 | `nrcs-soil-biology-primer` |
| `bacteria-dormant` | Dormant bacteria | 0.5–2 µm | decomposer | aggregate | Glassy "asleep" state; most stay asleep after a sugar pulse | P, 6 | `blagodatskaya-kuzyakov-2013`, `lennon-jones-2011` |
| `streptomyces` | *Streptomyces* (actinomycete) | hyphae ~1 µm | decomposer / chemist | aggregate | Branching filaments, spores, geosmin "scent ribbons" | 6, ★ | `becher-2020`, `barka-2016` |
| `nitrifier-aob` | Ammonia-oxidising bacteria | ~1 µm | transformer | aggregate | Take the NH₄⁺ baton | 9 | `leininger-2006` |
| `nitrifier-aoa` | Ammonia-oxidising archaea | <1 µm | transformer | aggregate | Same baton, in acid and low-N soil | 6, 9 | `leininger-2006` |
| `comammox` | Comammox *Nitrospira* | ~1 µm | transformer | aggregate | Runs both nitrification legs | 9 | `daims-2015`, `van-kessel-2015` |
| `denitrifier` | Denitrifying bacteria (role) | ~1 µm | transformer | aggregate (anaerobic microsite) | Switch on when O₂ fades | 4, 9 | `tian-2020` |
| `methanogen` | Methanogenic archaea | ~1 µm | transformer | paddy profile | Bottom floor of the redox elevator | 4 | `saunois-2020`, `borch-2010` |
| `rhizobia` | Rhizobia (pea- and bean-specific partners) | ~1–2 µm; bacteroids inside nodules | mutualist | rhizosphere, cell | Swim to flavonoid; infection thread; pink nodule | 8 | `oldroyd-2013`, `ott-2005` |
| `pseudomonas-protector` | *Pseudomonas* (protective role in published suppressive soils) | ~1 µm | antagonist (context) | rhizosphere | Biofilm along the root | 10 | `weller-2002`, `mendes-2011` |
| `bacillus` | *Bacillus* | 1–3 µm; spores | antagonist / chemist (context) | rhizosphere, cell | Colony with lipopeptide halo; swarming | ★ | `ongena-jacques-2008`, `raaijmakers-2010` |
| `fungi-sap` | Saprotrophic fungi | hyphae 2–10 µm | decomposer | aggregate, litter | Hyphae bridge air gaps bacteria cannot cross | 2, 6 | `nrcs-soil-biology-primer`, `tedersoo-2014` |
| `amf` | Arbuscular mycorrhizal fungi | hyphae 2–10 µm | mutualist (context) | rhizosphere, cell | Arbuscule "tree" in a cortex cell; hyphae past the P-depletion halo | 8 | `smith-2003`, `brundrett-tedersoo-2018` |
| `ecm` | Ectomycorrhizal fungi | sheath + Hartig net | mutualist (context) | forest rhizosphere | Mantle on tree root tips | 8 | `brundrett-tedersoo-2018` |
| `fungi-path` | Fungal root pathogens (*Fusarium*, *Rhizoctonia* as textbook genera) | hyphae | pathogen (context) | rhizosphere | Advance along the root; sclerotia persist | 10 | `scholthof-2007`, `weller-2002` |
| `oomycete` | Oomycetes (*Pythium*, *Aphanomyces*): protists, not fungi | hyphae-like; oospores | pathogen (context) | rhizosphere | Swimming zoospores, persistent oospores | 6, 10 | `geisen-2018` |
| `amoeba` | Naked amoeba (**the player's micro avatar**) | 10–50 µm | grazer | aggregate, rhizosphere | Moves only in water films; engulfs bacteria; releases NH₄⁺ | P, 1, 6, 7 | `bonkowski-2004`, `geisen-2018`, `clarholm-1985` |
| `flagellate` | Flagellates | 2–20 µm | grazer | aggregate | Fast in thin films | 6 | `nrcs-soil-biology-primer` |
| `ciliate` | Ciliates | 20–200 µm | grazer | aggregate (wet) | Need thick films; vanish as soil dries | 3, 6 | `nrcs-soil-biology-primer` |
| `testate` | Testate amoebae | 20–200 µm, shell | grazer | forest litter | Shell homes in moss and litter | 6 | `geisen-2018` |
| `nematode-bact` | Bacterivorous nematodes | 0.3–1 mm | grazer | aggregate | Sinusoid swim in water-filled pores; open mouth | 6 | `nrcs-soil-biology-primer`, `van-den-hoogen-2019` |
| `nematode-fung` | Fungivorous nematodes | 0.3–1 mm | grazer | aggregate | Stylet punctures hyphae | 6 | same |
| `nematode-pred` | Predatory nematodes | ~1–2 mm | predator | aggregate | Eat other nematodes | 6 | same |
| `nematode-plant` | Plant-parasitic nematodes (cyst, root-knot) | 0.3–1 mm | pathogen (context) | rhizosphere | Stylet into the root; cysts persist | 10 | same |
| `mite` | Mites (oribatid, predatory) | 0.1–2 mm | shredder / predator | aggregate, litter | Walk through existing pores; never dig | 6 | `fao-2020-soil-biodiversity` |
| `springtail` | Springtails (Collembola) | 0.2–2 mm | grazer | aggregate, litter | Jump; follow the geosmin gradient | 6, ★ | `becher-2020` |
| `enchytraeid` | Potworms (enchytraeids) | 1–50 mm | shredder | forest litter | Faecal microaggregates | 6 | `fao-2020-soil-biodiversity` |
| `earthworm-epi` | Epigeic earthworm | 2–10 cm | shredder | litter | Lives in litter, no burrow | 6 | `blouin-2013` |
| `earthworm-endo` | Endogeic earthworm | 5–15 cm | engineer | profile (A) | Horizontal burrows, eats soil, casts | 6, 12 | `blouin-2013` |
| `earthworm-anecic` | Anecic earthworm | 10–30 cm | engineer | profile (A–B) | Deep vertical burrow, pulls leaves down | 3, 6, 12 | `blouin-2013`, `darwin-1881` |
| `ant` | Ants / termites (cameo) | mm | engineer | profile | Galleries | 6 | `jrc-2016-gsba` |
| `mole` | Mole (cameo) | 15 cm | predator | profile | Tunnels; eats earthworms | 6 | — (decorative) |
| `root-tap` | Taproot (spinach, sugar beet) | mm–cm | producer | profile, rhizosphere | Tip growth, root hairs, exudate plume | 7, 8 | `bais-2006` |
| `root-fibrous` | Fibrous roots (rice, cereal) | 0.1–1 mm | producer | profile, rhizosphere | Dense mat; aerenchyma in rice | 4, 7 | `pausch-kuzyakov-2018` |
| `root-legume` | Legume root with nodules (pea, bean) | mm | producer + host | rhizosphere | Root-hair curl → nodule | 8 | `oldroyd-2013` |

**Field-card fields** are fixed by the schema (spec §5.2). Card copy never says "good" or "bad". It says "can", "often", "in this context" and "depends on".

---

## 5. Process index

Each process is a typed entry with inputs, outputs (ledger pools), conditions and, when simulated, a `ruleId` that points to the code rule. A process card unlocks when its rule has fired in front of the player.

| id | Process | Inputs → outputs | Conditions that change it | Simulated in | Sources |
|---|---|---|---|---|---|
| `depolymerisation` | Breakdown of litter polymers by extracellular enzymes | litter C → dissolved C | moisture, temperature, O₂, residue quality | 2 | `schmidt-2011` |
| `uptake-cue` | Microbial uptake, split by carbon-use efficiency | dissolved C → biomass C + CO₂ | residue quality, temperature | 2, 9 | `liang-2017` |
| `maintenance-resp` | Maintenance respiration | biomass C → CO₂ | temperature | 2 | `davidson-janssens-2006` |
| `necromass-formation` | Death; necromass onto minerals (microbial carbon pump) | biomass C → dissolved C + mineral-associated C | texture (mineral surface) | 2, 1 | `liang-2017`, `kallenbach-2016`, `lavallee-2020` |
| `maom-desorption` | Slow release from mineral surfaces | mineral-associated C → dissolved C | — (slow) | 2 | `lavallee-2020` |
| `priming` | Fresh C accelerates old-C loss | old C → CO₂ | N scarcity, fresh C pulse | 2 (stretch), 9 | `kuzyakov-2010`, `fontaine-2007` |
| `grazing` | Protist and nematode grazing; microbial loop | bacterial C, N → grazer biomass + CO₂ + NH₄⁺ | water films, pore size | 1, 6, 7 | `clarholm-1985`, `bonkowski-2004` |
| `exudation` | Root exudation | plant C → dissolved C (rhizosphere) | plant stage, light | 7 | `bais-2006`, `pausch-kuzyakov-2018` |
| `mineralisation` | Ammonification | organic N → NH₄⁺ | C:N | 9 | `nrcs-cn-ratios` |
| `immobilisation` | Microbial uptake of mineral N | NH₄⁺/NO₃⁻ → microbial N | C:N > ~24 | 9 | `nrcs-cn-ratios` |
| `nitrification` | NH₄⁺ → NO₂⁻ → NO₃⁻ | NH₄⁺ → NO₃⁻ | O₂, pH | 9 | `leininger-2006`, `daims-2015` |
| `denitrification` | NO₃⁻ → N₂O → N₂ | NO₃⁻ → N₂O + N₂ (out) | O₂ low, C available | 4, 9 | `tian-2020` |
| `leaching` | Nitrate leaching | NO₃⁻ → drainage (out) | rain, no plant | 5, 9 | `umn-n-cycle-2025` |
| `bnf` | Symbiotic N fixation | atmospheric N₂ → plant N | O₂ protection, soil nitrate | 8 | `hoffman-2014`, `ott-2005` |
| `myco-trade` | Mycorrhizal C-for-P trade | plant C ↔ fungal P | soil P | 8 | `smith-2003` |
| `p-sorption` | Phosphate sorption | solution P ↔ sorbed P | pH, Fe/Al oxides | 8 | `shen-2011`, `hinsinger-2001` |
| `cation-exchange` | Cation exchange | exchange site cation ↔ solution cation | pH, CEC | 5 | `cornell-fs22-cec` |
| `redox-ladder` | Electron-acceptor sequence | O₂ → NO₃⁻ → Mn → Fe → SO₄²⁻ → CO₂ | O₂ supply, C | 4 | `borch-2010` |
| `methanogenesis` | CH₄ production | C → CH₄ (out) | flooded, reduced | 4 | `saunois-2020` |
| `infiltration` | Infiltration and preferential flow | rain → pore water → drainage | macropores, structure | 3, 12 | `or-2007` |
| `birch-pulse` | CO₂ pulse on rewetting | stored labile C → CO₂ | dry-then-wet | 3 | `schimel-2018` |
| `aggregation` | Aggregate formation and breakdown | particles ↔ aggregates | roots, hyphae, tillage | 1, 12 | `tisdall-oades-1982`, `six-2004` |
| `erosion` | Erosion by water | topsoil → river | cover, slope, rain | 13 | `montgomery-2007`, `borrelli-2017` |
| `compaction` | Compaction | macropores → micropores | load, wetness | 12 | `hamza-anderson-2005`, `keller-2019` |
| `pedogenesis` | Additions, losses, transformations, translocations | parent material → horizons | CLORPT | 11 | `jenny-1941`, `nrcs-soil-survey-manual` |
| `salinisation` | Salt accumulation | irrigation salts → surface crust | drainage, evaporation | 13 | `usda-hb60`, `fao-2024-salt` |

---

## 6. The chapters

Each chapter section has the same headings, which map onto the content types in spec §5:

- **Learning objectives**
- **Scenes**
- **Cast**
- **Benches and missions**
- **Expected cause chains**
- **Discoveries**
- **Misconceptions addressed**
- **Contested items shown**
- **Scientist-lens payoff**
- **Sources**

Mission steps follow the core loop: notice → predict → change → observe → explain → transfer. Tier labels T1–T4 come from the curriculum.

---

### Chapter P — A Handful of Soil · **Build phase**

**Learning objectives**

1. Soil is a habitat. By volume it is roughly half solids and half pore space, and the pore space is shared between water and air. Life is a tiny fraction by volume but is everywhere.
2. Things change dramatically with scale. Scale bars are part of reading any picture.
3. Most microbes in a handful are dormant (about 0.1–2 % of biomass is active). Separately, microbes cover only a minute fraction of the soil's internal surface, about 10⁻⁶ % by one estimate and well under 1 % on any optimistic assumption (`young-crawford-2004`, p. 1634; a surface-area figure, not a share of pore volume).

**Scenes**

| id | Scale | What is on screen | Interactive objects |
|---|---|---|---|
| `p-field-dawn` | field | Spinach seed field at dawn: painted plate, slow cloud drift, crop sway. One line: "Pick up a handful." | `handful` (the only affordance) |
| `p-handful` | handful (a field sub-view, 10 cm) | A cupped handful of crumbly loam on a linen ground | `composition-slider` (prediction), `separate` button |
| `p-separated` | handful | The same handful separated into four stacked layers by volume (mineral, organic, water, air) with a "living things" sliver drawn enlarged and badged | `layer` ×4 (scan) |
| `p-pore` | aggregate | First zoom (×100): grains, a water film, a bacterium, an amoeba, a fungal hypha | `bacterium`, `amoeba`, `hypha`, `grain`, `water-film`, `rumor-node` |

**Cast:** `bacteria-copio`, `bacteria-dormant`, `amoeba`, `fungi-sap` (cameo).

**Missions**

`p-m1` **"How much of this is rock?"** (T1, about 2 minutes)

1. *Notice:* the handful.
2. *Predict:* a slider, "What share of this handful's volume is solid?", from 0 to 100 %. The player commits; there is no penalty.
3. *Observe:* the handful separates. The result is shown as a range, not a constant: "about 40–60 % solid in a typical arable topsoil". The reference picture is 45 % mineral, 5 % organic, 25 % water and 25 % air, and the game labels that split "an idealised moist loam, not a constant" (`soils4teachers-basics`, `hamza-anderson-2005`). The prediction marker stays next to the result.
4. *Explain* (one tap): "Where does the rest go?" Choose from water and air / nothing / roots. Feedback addresses the choice.
5. **Bench mini (reactive sentence):** "If this soil is wetter, [water] takes space from [air]." The player drags the water share and the air share shrinks with it. Solids stay fixed. This seeds chapters 3 and 4.

`p-m2` **"Zoom in"** (T1, about 2 minutes)

1. A pore pulses as a portal. The player zooms and gets a first scale stamp (×100), then scans three things.
2. Scanning the bacterium reveals that it is **dormant**: "Most cells here are asleep: typically about 0.1–2 % of microbial biomass is active at any moment" (`blagodatskaya-kuzyakov-2013`, estimate).
3. Scanning the amoeba unlocks the option to *become* it (chapter 1 trailhead).
4. A **rumor** appears: "This bacterium is next to food but not eating. Why?" The Rumor Map opens with one node.

**Expected cause chain** (worked example, fully shown; the player only confirms it):
`more water` → *takes space from* → `air in pores`.

**Discoveries**

- `d-p-half-space` (observed): "Half of soil is space."
- `d-p-scale-100` (observed): "One step down the ladder: ×100."
- `d-p-sleepers` (derived): "Most microbes here are dormant."

**Misconceptions addressed:** M1 (soil is inert dirt), M9 (everything is active), and the "45/5/25/25 is a constant" idealisation from curriculum ch. 2.

**Striking facts on cards**

- 10⁸–10¹⁰ bacterial cells per gram, depending on the counting method (`nrcs-soil-biology-primer`, `raynaud-nunan-2014`, estimate, order of magnitude).
- Thousands to tens of thousands of bacterial taxa per gram (`torsvik-1990`, `roesch-2007`, estimate).
- Microbes cover only a minute fraction of the soil's internal surface, about 10⁻⁶ % by one estimate, well under 1 % (`young-crawford-2004`, p. 1634, estimate; surface area, not pore volume).
- Soil may host about 59 % ± 15 % of species, excluding phages; about 21 % with them (`anthony-2023`, estimate; contested register).

**Contested items shown:** the 59 % species estimate carries its ± and the phage caveat (the 59 % is a mean of per-group shares excluding phages; `anthony-2023`).

**Scientist-lens payoff:** none yet. The lens is introduced in chapter 2.

**Sources:** `soils4teachers-basics`, `hamza-anderson-2005`, `blagodatskaya-kuzyakov-2013`, `lennon-jones-2011`, `nrcs-soil-biology-primer`, `torsvik-1990`, `roesch-2007`, `young-crawford-2004`, `raynaud-nunan-2014`, `anthony-2023`.

**Unlocks:** chapters 1 and 2.

---

### Chapter 1 — The Pore Labyrinth

**Learning objectives**

1. Texture (sand, silt, clay) is near-permanent. Structure (aggregates) is dynamic.
2. Pore size decides which pores hold water, where O₂ reaches, and who can enter.
3. Small pores are refuges: bacteria hide from grazers, and organic matter hides from decomposers.

**Scenes**

- `c1-grain-ruler` (aggregate): sand drawn like marbles, silt like flour, clay as stacked platelets. A "carpet" lens unrolls the specific surface area: sand ≪ 0.1 m² g⁻¹; smectite up to about 800 m² g⁻¹ (`cornell-fs22-cec`, firm ranges).
- `c1-aggregate-cut`: a rotating macroaggregate cut open to show microaggregates (<250 µm), clay–organic clusters, and roots and hyphae as visible "string" (`tisdall-oades-1982`, `six-2004`).
- `c1-labyrinth`: the pore network as a navigable cave. The prototype's water-film graph (sites + edges, BFS) is ported here. The player is the amoeba.

**Cast:** `amoeba`, `bacteria-copio`, `fungi-sap`, `nematode-bact`, `mite`.

**Benches and missions**

- `c1-m1` **"Feel test"** (T1): ribbon a moist sample between virtual fingers. Grittiness and ribbon length lead through the real flow diagram (`thien-1979`) to a texture class on the texture triangle. Vendored `ChartSoilTextureTriangle`, if available.
- `c1-m2` **"Hide from the grazer"** (T2): play a bacterium choosing pores. Narrow pores are safe but drier and food-poor; wide pores are rich but the amoeba hunts there. Predict which pore class keeps the most bacteria after a compressed week, then run it (`postma-vanveen-1990`, `erktan-2020`).
- `c1-m3` **"Slake it"** (T2): drop a dry aggregate from a grassland plot and one from a long-ploughed plot into water. Predict, observe, explain (`cornell-cash-manual`).
- `c1-m4` **"Build a crumb"** (T3): combine roots, hyphae, microbial glue and clay. Apply a tillage pass and see which binding agents persist (persistent versus transient agents).

**Expected chains**

- `narrow pore` → *limits* → `grazer access` → *enables* → `bacterial survival`
- `tillage` → *breaks* → `hyphal and root binding` → *decreases* → `macroaggregates`

**Discoveries:** "Texture is what it's made of; structure is how it's built." "Small pores are refuges." "Hyphae are string."

**Misconceptions:** M3 (texture can be fixed by management); "clay bad, sand good"; "bigger pores are better".

**Scientist-lens payoff:** porosity is *derived* from bulk density: φ ≈ 1 − BD / 2.65. The game shows the formula and its assumptions, with values from `hamza-anderson-2005`.

**Sources:** `nrcs-soil-survey-manual`, `tisdall-oades-1982`, `six-2004`, `hartmann-six-2022`, `erktan-2020`, `postma-vanveen-1990`, `cornell-fs22-cec`, `hamza-anderson-2005`, `thien-1979`, `cornell-cash-manual`, `or-2007`.

---

### Chapter 2 — Where Did the Leaf Go? · **Build phase (first playable chapter)**

The founder's proposal names this mission as the first prototype. It is the chapter that proves the engine: a mass-conserving carbon ledger, an energy trail, A/B comparison, cause chains, a transfer question and notebook entries.

**Learning objectives**

1. Decomposed matter does not disappear. Most of a leaf's carbon leaves as CO₂. Some becomes microbial biomass, and part of that persists on minerals as necromass. Some stays as litter for a while.
2. Energy is different from matter: it ends as heat and does not loop.
3. Decomposition rate depends on conditions (water, O₂, temperature) and on the residue (its quality, or C:N). Neither "more water" nor "more residue" is always better.
4. Persistence is about *where* carbon sits (mineral protection, access), not about a magic stable "humus" molecule.

**Scenes**

| id | Scale | Content | Interactive objects |
|---|---|---|---|
| `c2-hedge-edge` | field | The field edge under a hedge in autumn: a single fallen leaf beside a spinach root crown. Living backdrop: leaf flutter, low sun. | `leaf` (tag), `portal-litter` |
| `c2-litter` | profile (top 5 cm) | Litter layer over the A horizon; leaf fragments; fungal hyphae on the leaf; springtail cameo | `leaf-fragment`, `hypha`, `springtail`, `portal-aggregate` |
| `c2-aggregate` | aggregate | A pore next to a leaf fragment; bacterial microcolony; dissolved-C plume; clay surface with "necromass coatings" appearing over time | `colony`, `doc-plume`, `clay-surface`, `co2-bubble` |
| `c2-bench` | lab bench | **Leaf-in-a-jar bench** (below): two jars side by side, A (subject, Lime) and B (comparison, gold), with ledger and graph | levers, run, scrub, compare |

**Cast:** `fungi-sap`, `bacteria-copio`, `bacteria-dormant`, `springtail`, `earthworm-epi` (cameo, not simulated).

**Bench `leaf-jar`**: at most 3 levers, one picture, one graph, one number (the PhET rule; `ls-podolefsky-2010`).

| Lever | Options | Default | Mapping (teaching values, spec §7.4) |
|---|---|---|---|
| Water | dry / moist / waterlogged | moist | water-filled pore space ≈ 0.20 / 0.60 / 0.95 → moisture and O₂ modifiers |
| Temperature | cool (10 °C) / mild (20 °C) | mild | Q₁₀ = 2 form (`davidson-janssens-2006`) |
| Residue | green leaf (low C:N) / cereal straw (high C:N) / woody twig | green leaf | quality modifier and CUE |

- **Picture:** jar cross-section; Lime particles are the tagged carbon parcels, each representing a fixed number of ledger units. CO₂ bubbles rise out, a heat shimmer leaves, coatings form on the clay.
- **Graph:** stacked area of carbon pools over compressed days (litter, dissolved, microbial biomass, mineral-associated, CO₂-out). Peers follow chart roles: subject Lime and comparison gold, with pools distinguished by pattern plus label.
- **Number:** "Carbon accounted for: 100.0 %". Always 100 %. That is the point.
- **Energy trail:** a second slim bar, "chemical energy left in organic matter" versus "released as heat", which only grows toward heat.
- **Time:** scrubber 0–365 compressed days with an always-visible label: "Teaching model: 1 s ≈ 60 days. Direction, not prediction."

**Missions**

`c2-m1` **"Follow the leaf"** (T1; you do it, then the world does it — `ls-wieman-2008`, the Parable-of-the-Polygons sequencing):

1. *Notice:* "If this leaf disappears, where does its material go?"
2. *Predict:* choose any of: into the soil / into the air / into living things / it is destroyed. Multi-select, committed.
3. *Do it by hand:* the player is a decomposer for three turns, dragging carbon parcels from leaf to "dissolved", then into "me (biomass)" or "breath (CO₂)". A gentle constraint applies: each eaten parcel must split, roughly 4 into biomass and 6 into breath.
4. *The world does it:* time-lapse for one compressed year with the same split, now automatic.
5. *Observe:* the ledger shows 100 % accounted for, most of it gone as CO₂. The energy bar ends as heat.
6. *Explain:* confirm the worked chain (below). This is the worked-example stage of fading (`ls-chi-1994`).

`c2-m2` **"Dry versus moist"** (T2):

1. *Predict:* "In which jar will the leaf lose mass faster: dry or moist?" (A = moist, B = dry; one variable changed.)
2. *Run* both, scrub, compare. The diff highlight shows on litter remaining.
3. *Explain:* build the chain, with one blank to fill.

`c2-m3` **"After the downpour"** (T2, a discrepant event):

1. *Predict:* "Waterlogged versus moist: which decomposes faster?" Players holding "wetter is always better" (M4) predict waterlogged.
2. *Observe:* waterlogged is slower, because O₂ runs short.
3. *Explain* from scratch. Feedback is keyed to the misconception if the player blames "too much water drowns the leaf" without O₂.
4. A codex card unlocks: "Water and air trade places", which links back to the prologue.

`c2-m4` **"Leaf versus straw versus twig"** (T2–T3):

1. *Predict* the order of mass loss.
2. *Observe* it.
3. *Explain* with residue quality. A codex card on C:N (`nrcs-cn-ratios`) is marked *verify* until the source is checked, and seeds chapter 9.
4. Optional reactive sentence: "Microbes need about [24] parts carbon per part nitrogen in their diet."

`c2-m5` **"Vault or vapour"** (T3, transfer):

1. *Scenario:* a woody residue in a cold, waterlogged soil.
2. *Question:* "Will it follow the same chain?"
3. *Answer:* a chain plus "What would you measure next?", choosing one of soil respiration (CO₂ flux), litter mass loss, microbial biomass, or "you cannot tell without measuring".
4. Accepted answers:
   - the slower-decomposition chain combining cold, low O₂ and low quality;
   - "measure CO₂ flux" or "litter mass loss";
   - "cannot tell yet; measure X" is **accepted as correct** (uncertainty is not failure).

**Expected cause chains** (batch-confirmed together at the end of m2–m4, Obra Dinn style):

1. `moisture ↑ (dry → moist)` → *enables* → `microbial activity` → *increases* → `decomposition` → *increases* → `CO₂ released`
2. `waterlogging` → *limits* → `O₂ in pores` → *limits* → `microbial activity` → *decreases* → `decomposition`
3. `residue C:N high (straw)` → *limits* → `microbial growth` → *decreases* → `decomposition rate`

Accepted variants are listed per chain in the content file. Diagnostics:

| Pattern detected | Message |
|---|---|
| Player links water → decomposition directly in chain 2 without O₂ | "Your run shows waterlogged jars still have plenty of water. What is missing in them?" |
| Player answers "the carbon was destroyed" in m1 | Show the ledger, highlight the 100 %, and ask where the CO₂ bubbles went. |
| Player links straw → "more carbon, so more decomposition" | Point at the graph: same mass, slower loss. Ask what microbes need besides carbon. |

**Discoveries**

| id | Statement | Evidence tier |
|---|---|---|
| `d-c2-conserved` | "Carbon is never destroyed; I traced it into air, biomass and minerals." | observed |
| `d-c2-heat` | "Energy left as heat and did not come back." | observed |
| `d-c2-moisture` | "Moisture speeds decomposition, up to the point where it shuts out air." | derived (from my own A/B runs) |
| `d-c2-quality` | "What the residue is made of changes how fast it goes." | derived |
| `d-c2-vault` | "Carbon persists where it is protected, not because it is 'stable stuff'." | interpreted (codex) |
| `d-c2-transfer` | "I predicted a new residue's fate and said what I would measure." | interpreted + would-measure |

**Codex pages unlocked** (only *after* the matching experiment, per productive failure: `ls-kapur-2016`)

- **Decomposition:** depolymerisation, uptake and CUE (`liang-2017`, `schmidt-2011`).
  - *Simplification note:* "The game treats all decomposers as one community with fixed traits; real communities shift."
- **Carbon-use efficiency:** the same carbon becomes body or breath. A reactive sentence: "With CUE [0.4], of 10 parcels eaten, [4] become microbes."
- **POM and MAOM, and the humus museum:**
  - the 20th-century humus diagram, shown struck through, with "science revises itself" (`lehmann-kleber-2015`, `lavallee-2020`);
  - mineral surfaces may saturate (`georgiou-2022`).
- **Microbial necromass:** "About half of SOC in croplands may be microbial remains (biomarker estimates, method-dependent)." Source `liang-2019`; contested.
- **Water and air trade places**, linking to chapters 3 and 4 (`keiluweit-2017`, `moyano-2013` [verify]).
- **In the real world:**
  - soil respiration is about 98 Pg C per year, roughly ten times fossil emissions, but nearly balanced by photosynthesis (`bond-lamberty-thomson-2010`, `friedlingstein-2023`);
  - soil holds about 1,500 Pg C in the top metre (`scharlemann-2014`, estimate).

**Misconceptions addressed**

- M15: adding carbon always stores carbon.
- M4: wet is good.
- M7: humus is a stable special substance.
- "Decomposed matter disappears".
- "Energy is recycled like matter".

**Contested items shown**

- Necromass share of SOC (`liang-2019`).
- Temperature sensitivity of stable SOM (`davidson-janssens-2006`): a single dashed note on the temperature lever, "Q₁₀ ≈ 2 is a rule of thumb; for stable organic matter it is debated".

**Scientist-lens payoff** (introduced here)

- Toggling the lens re-skins the bench readouts into evidence types.
- The **CO₂ flux** is a *measurement*: mono numbers with a ± band. In the teaching model the band is seeded noise and is labelled as such.
- **"Decomposition"** is *derived*: the formula is shown (litter mass loss ÷ time).
- **"The leaf became microbes"** is an *interpretation*, shown as a card with a confidence level the player chose.
- A card explains that in real soils, respiration includes root respiration and old-carbon priming. So CO₂ alone does not tell you which carbon decomposed. This is a teaser for priming (stretch rule), with sources `kuzyakov-2010` and `fontaine-2007`.

**Stretch (not in the Build phase): "The prime suspect"** (T3). Add a sugar pulse and track "old" carbon (dark) versus "new" carbon (Lime) in the CO₂. Old carbon leaves faster, and the player explains it through N mining. This needs the nitrogen engine (backlog T18).

**Sources:** `schmidt-2011`, `lehmann-kleber-2015`, `lavallee-2020`, `georgiou-2022`, `liang-2017`, `kallenbach-2016`, `liang-2019`, `davidson-janssens-2006`, `keiluweit-2017`, `moyano-2013`, `nrcs-cn-ratios`, `bond-lamberty-thomson-2010`, `friedlingstein-2023`, `scharlemann-2014`, `kuzyakov-2010`, `fontaine-2007`, `pribyl-2010` (the SOM-to-SOC factor note in codex).

---

### Chapter 3 — Water Roads

**Learning objectives**

1. Water is held by capillarity and adsorption. Matric potential is its "pull".
2. Pore size sets which pores hold water at a given dryness. Largest pores empty first.
3. For microbes, water films are roads. Drying cuts the network into islands.
4. Rewetting a dry soil produces a CO₂ pulse.

**Scenes**

- `c3-drain` (aggregate): the pore network drains in front of the player as a potential slider goes from 0 to −1,500 kPa (shader S5).
- `c3-root-pull`: root hairs with tension lines.
- `c3-rain-profile` (profile): an infiltration front with preferential-flow fingers down an anecic worm burrow (shader S6).

**Cast:** `amoeba`, `ciliate`, `flagellate`, `bacteria-copio`, `earthworm-anecic`, `root-tap`.

**Missions**

- `c3-m1` **"Drain the cave"** (T2): predict which pores empty first, then watch. A reactive sentence: "At [−33] kPa, pores wider than about [9] µm have drained." It uses d (µm) ≈ 300 / |ψ| (kPa), derived (`or-2007`). Field capacity and wilting point are labelled "conventions, not constants" (`cornell-awc`, `meter-paw-note`).
- `c3-m2` **"Stranded"** (T2): as the amoeba, reach food while films disconnect. Movement stops below a film threshold, using the ported water-film graph from chapter 1.
- `c3-m3` **"After the drought"** (T3):
  1. Rewet a dry soil.
  2. Predict the CO₂ trace.
  3. Observe the pulse.
  4. Explain with candidate sources: osmolytes, dead cells, exposed organic matter.
  - The relative contribution is shown as **unresolved** (`schimel-2018`), and the accepted answer is "several, not yet separable".
- `c3-m4` **"Fast lanes"** (T2): rain on soil with and without worm burrows. Water bypasses the matrix through macropores.

**Expected chains**

- `drying` → *decreases* → `water film connectivity` → *limits* → `bacterial movement and substrate diffusion` → *decreases* → `activity`
- `rewetting dry soil` → *releases* → `stored labile C` → *increases* → `CO₂ pulse`

**Discoveries:** "Big pores drain first." "Water films are roads." "Dry-then-wet makes soil breathe out."

**Misconceptions:** M4 (wet is good); "a soil at field capacity is full"; "plants suck water from a tank".

**Scientist-lens payoff:** water content (*measured*) versus water potential (*derived or measured by a different instrument*). Two soils with the same water content can hold that water at very different potentials.

**Sources:** `or-2007`, `schimel-2018`, `cornell-awc`, `meter-paw-note`, `moyano-2013`, `bond-lamberty-thomson-2010`.

---

### Chapter 4 — Breath and Rust

**Learning objectives**

1. O₂ enters soil by diffusion, and diffuses about 10⁴ times more slowly in water than in air.
2. Anaerobic microsites exist even in drained soil.
3. When O₂ runs out, microbes use the redox ladder in order. The ladder leaves visible traces in soil colour, smell and bubbles.
4. Flooding trades one thing for another: methane against N₂O, among others. There is no winner and no score.

**Scenes**

- `c4-fog` (aggregate): an O₂ "fog" overlay that thins toward aggregate centres, where anaerobic microsites glow.
- `c4-paddy` (landscape → field): a rice paddy with a living backdrop of methane bubbles rising through the canopy and a water shimmer.
- `c4-elevator` (profile): **the redox elevator**, a flooded paddy profile descended floor by floor.
  - Floors: O₂ (+350 mV), NO₃⁻ (+250), Mn/Fe (+100 to −100), SO₄²⁻ (−150), CH₄ (< −200). Values approximate, Eh at pH 7, estimate (`borch-2010`).
  - Each floor shows its organisms, its colour (grey gley, rusty mottles) and its smell.

**Cast:** `denitrifier`, `methanogen`, `root-fibrous` (rice, with aerenchyma), `bacteria-copio`.

**Missions**

- `c4-m1` **"Ride the redox elevator"** (T2): predict which process runs on each floor and collect the electron-acceptor cards in order.
- `c4-m2` **"Where is the air?"** (T2): with the water lever and the aggregate-size lever, predict where anaerobic microsites form.
- `c4-m3` **"Drain the paddy"** (T3): intermittent drainage lowers methane but can raise N₂O. The player sees both curves and must state the trade-off. The verdict "it depends on what you value and measure" is the accepted answer. Methane context comes from `saunois-2020`; N₂O GWP ≈ 273 comes from `ipcc-ar6-wg1-ch7`.
- `c4-m4` **"Warm it up"** (T2): a Q₁₀ ≈ 2 rule of thumb, with the contested note (`davidson-janssens-2006`).

**Expected chains**

- `waterlogging` → *limits* → `O₂ diffusion` → *enables* → `denitrifier activity` → *increases* → `N₂O and N₂ loss`
- `flooding` → *drives* → `redox ladder to methanogenesis` → *increases* → `CH₄`

**Discoveries:** "Anaerobic is not dead: it runs on different chemistry." "Grey and rust are a diary of water."

**Misconceptions:** M5 (anaerobic means dead); "a field is either aerobic or anaerobic"; "grey soil is a different rock".

**Scientist-lens payoff:** Eh readings are protocol-bound. A redox probe at one depth on one day is a moment, not a regime.

**Sources:** `keiluweit-2017`, `borch-2010`, `saunois-2020`, `davidson-janssens-2006`, `tian-2020`, `ipcc-ar6-wg1-ch7`.

---

### Chapter 5 — Charged Surfaces

**Learning objectives**

1. Clay and organic matter carry negative charge. CEC is the capacity to hold cations.
2. Clays differ: 1:1 (low charge) versus 2:1 (high charge, swelling).
3. pH is a master variable for nutrient availability, aluminium toxicity and microbial communities.
4. Anions such as nitrate are not held, so they leach.

**Scenes**

- `c5-platelet` (cell): a clay platelet as a **charged landscape**. Cations hover on exchange sites. An H⁺ "rain" knocks Ca²⁺ off and sends it toward drainage.
- `c5-vertisol` (profile): swelling clay cracks in drought and seals when wet.
- `c5-ph-dial`: nutrient-availability bars recolour as pH moves. Aluminium appears below about pH 5.5.

**Missions**

- `c5-m1` **"Cation musical chairs"** (T2): drag cations onto sites, add acid, and see which cations leave first.
- `c5-m2` **"Leaky nitrate"** (T2): add NH₄⁺ and NO₃⁻ beads, then rain. The anion leaves, the cation stays, and a teaser for nitrification follows (chapter 9).
- `c5-m3` **"The pH predictor"** (T4):
  1. A community plot shifts across a pH gradient (`lauber-2009`: r = 0.79 across 88 soils, measured association).
  2. The player is asked: does pH *cause* the shift?
  3. Accepted answer: a strong, replicated association with known mechanisms (H⁺ tolerance; `rousk-2010`), but co-varying gradients must be checked before claiming causation.
- `c5-m4` **"Acid rain on the field"** (T2): ammonium fertiliser drives acidification (`guo-2010`: about −0.5 pH units in Chinese cropland, 1980s → 2000s, estimate).

**Expected chains**

- `acid input (H⁺)` → *displaces* → `exchangeable Ca²⁺` → *increases* → `leaching of base cations`
- `nitrate (anion)` → *not held by* → `negative surfaces` → *increases* → `leaching risk`

**Discoveries:** "Clay is a magnet for cations." "pH is logarithmic: one unit is ten times." "Strong association is not yet cause."

**Misconceptions:** M6 (pH 7 is ideal for all); "pH is linear"; "nutrients are just 'in' the soil"; "pH determines the microbiome".

**Scientist-lens payoff:** pH in water versus in CaCl₂ gives different numbers for the same soil. The method is part of the result (bridge to chapter 14).

**Sources:** `cornell-fs22-cec`, `wrb-2022`, `lauber-2009`, `rousk-2010`, `guo-2010`.

---

### Chapter 6 — Who Eats Whom

**Learning objectives**

1. The soil food web has energy channels: root, bacterial and fungal.
2. Grazing releases nutrients. Protists and nematodes excrete excess N as ammonium (the microbial loop).
3. Size class decides access: microbiota, mesofauna, macrofauna.
4. Most soil taxa are undescribed. Unknown functions are normal.
5. No organism is good or bad in itself.

**Scenes**

- `c6-gallery`: a **living mobile** of the food web. Nodes are organisms drawn at schematic size with true-size bars. Links light up as feeding is *observed*.
- `c6-forest-litter` (forest reference world): enchytraeids, testate amoebae, mites, springtails and an invasive earthworm cameo.
- `c6-geosmin` (aggregate): *Streptomyces* releases geosmin scent ribbons, and springtails follow them (`becher-2020`). This is the most beautiful micro-story in the bible and a strong living-backdrop candidate.

**Cast:** nearly all of §4, especially `amoeba`, `flagellate`, `ciliate`, `nematode-*`, `mite`, `springtail`, `enchytraeid`, `earthworm-*`, `phage`, `fungi-sap`, `streptomyces`.

**Missions**

- `c6-m1` **"A meal connects the web"** (T1–T2): as the amoeba, eat bacteria in a water film and excrete NH₄⁺ near a root hair; the root takes it up (`clarholm-1985`, `bonkowski-2004`). Uses the N-ledger rule `grazing`.
- `c6-m2` **"Who eats whom?"** (T1–T2): reveal links by watching. Remove a node and predict the ripple, then run it.
- `c6-m3` **"Read the mouth"** (T2): sort nematodes by mouthpart (stylet or open mouth) and predict their channel.
- `c6-m4` **"Follow the smell"** (T2): play a springtail tracking a geosmin gradient.
- `c6-m5` **"Who controls the bloom?"** (T3): phages and grazers together. The size of viruses' role in soil carbon cycling is shown as poorly quantified (`williamson-2017`).
- `c6-m6` **"Unknown taxon"** (T4): a DNA read with no cultured relative. The player chooses what can and cannot be claimed (`fierer-2017`).
- `c6-m7` **"The invader"** (T3, forest world): non-native earthworms remove the forest floor (`hendrix-2008`).

**Expected chains**

- `protist grazing on bacteria` → *releases* → `NH₄⁺` → *enables* → `plant N uptake`
- `drying` → *limits* → `grazer movement` → *decreases* → `grazing pressure`

**Discoveries:** "Eating is how nutrients move." "Same worm, different place, different story." "Most of who lives here has no name yet."

**Misconceptions:** M8 (good/bad microbes); M10 (fungi are mushrooms); M11 (oomycetes are fungi); M12 (earthworms are always good); "nematodes are pests"; "viruses only cause disease"; "fungal-dominated soils are always better" (`strickland-rousk-2010`).

**Contested items:** the share of species in soil (`anthony-2023`); the viral role in carbon cycling.

**Scientist-lens payoff:** **"The squeezing jar" preview.**

- A sequencing readout of the web shows *relative* abundances: one taxon blooms and all the others appear to fall.
- A persistent caption reads "relative, not absolute; presence ≠ activity" (`gloor-2017`).
- The connector set for sequencing outcomes has no *causes*, only *is associated with*.

**Sources:** `nrcs-soil-biology-primer`, `fao-2020-soil-biodiversity`, `jrc-2016-gsba`, `clarholm-1985`, `bonkowski-2004`, `geisen-2018`, `van-den-hoogen-2019`, `becher-2020`, `blouin-2013`, `hendrix-2008`, `williamson-2017`, `fierer-2017`, `delgado-baquerizo-2018`, `tedersoo-2014`, `bar-on-2018`, `strickland-rousk-2010`, `carini-2016`, `gloor-2017`, `anthony-2023`.

---

### Chapter 7 — The Root's Neighbourhood

**Learning objectives**

1. The rhizosphere is a gradient. For most exudates it reaches about 0.5–4 mm, and its width depends on the solute.
2. Roots release a cocktail: sugars, amino acids, organic acids and signals.
3. The plant recruits a subset of the soil community, probabilistically and noisily.
4. Exudates fuel hot moments: growth bursts, grazing cascades and priming.

**Scenes**

- `c7-root-tip` (rhizosphere): a spinach root tip grows through the pore network (shader S8). It trails an exudate plume that diffuses, is eaten and fades. Concentric gradients by solute: sugars narrow, organic acids wider, volatiles widest.
- `c7-home-away`: a split view of the community near the root and in bulk soil.
- `c7-season` (field): the spinach crop from seedling to bolting. The root input rate changes with stage. Plant-stage art comes from the in-house sprite set.

**Missions**

- `c7-m1` **"Follow the root inputs"** (T1, a prototype mission rebuilt): exudate → bacterial bloom → amoeba grazing → NH₄⁺ → root uptake. The ledger conserves C and N.
- `c7-m2` **"Bare versus planted"** (T2): the same soil with no plant (the `bare` world) against a spinach plant. Compare the active-microbe index and the dissolved C.
- `c7-m3` **"Home or away"** (T3): a rise in relative abundance near the root could mean one group grew or that others declined. Only absolute quantification (qPCR, spike-in, cell counts) separates the two (`gloor-2017`, `vandeputte-2017`). This bridges to chapter 14.
- `c7-m4` **"Signal and answer"** (T2): releasing a flavonoid or a strigolactone calls rhizobia or AMF. A preview of chapter 8; spinach answers neither.

**Expected chains**

- `root exudation` → *feeds* → `bacterial growth near root` → *enables* → `grazing` → *releases* → `NH₄⁺ near root`

**Discoveries:** "The soil touching the root is a different country." "The plant feeds and filters its neighbours, but not precisely."

**Misconceptions:** "the plant feeds microbes out of kindness"; "the rhizosphere is a fixed zone"; "plants choose their microbiome precisely".

**Contested:** the share of photosynthate exuded (about 5–21 %, method-dependent; `bais-2006` versus `pausch-kuzyakov-2018`). Displayed as a wide band.

**Scientist-lens payoff:** a rhizosphere sample and a bulk-soil sample are *different samples of different habitats*. Mixing them changes the answer (the concept only, from the internal sample-matrix note; no SOP numbers).

**Sources:** `kuzyakov-razavi-2019`, `bais-2006`, `akiyama-2005`, `philippot-2013`, `mendes-2011`, `pausch-kuzyakov-2018`, `clarholm-1985`, `bonkowski-2004`.

---

### Chapter 8 — Partners and Traders

**Learning objectives**

1. Mycorrhizas trade plant carbon for nutrients, especially P. The relationship runs from mutualism to parasitism depending on context.
2. Spinach and sugar beet belong to a family that typically forms no mycorrhiza.
3. Symbiotic N fixation happens in nodules. Nitrogenase is costly and destroyed by O₂; leghaemoglobin makes active nodules pink.
4. Partners are specific: pea and bean need different rhizobia.
5. P is immobile. Roots must reach for it (hairs, hyphae) or release it (acids, enzymes).
6. The "wood wide web" in its popular form is weakly supported.

**Scenes**

- `c8-arbuscule` (cell): an arbuscule inside a cortex cell, a glowing branched "tree" where sugar and phosphate swap.
- `c8-depletion-halo` (rhizosphere): a P-depletion halo of about 0.1–2 mm (`hinsinger-2001`), with extraradical hyphae fanning past it. This is the single most beautiful didactic image in the curriculum and a living-backdrop candidate.
- `c8-nodule` (rhizosphere → cell): root-hair curl, infection thread, then a nodule sliced to show a pink (active) or white (ineffective) interior, with an O₂ meter dropping across the cortex.
- `c8-forest-network` (forest world): a contested network overlay with an uncertainty texture (dashed, flickering) and an evidence-card link.

**Cast:** `amf`, `ecm`, `rhizobia`, `root-legume`, `root-tap` (spinach and beet: no partner).

**Missions**

- `c8-m1` **"The root exchange"** (T2): set soil P from low to high and watch the trade ratio change. At high P the fungus becomes a cost (`smith-2003`).
- `c8-m2` **"Who has no partner?"** (T2): visit the spinach and sugar beet worlds and find no arbuscules. Explain what the plant does instead.
- `c8-m3` **"Knock knock"** (T2): send the right signal to the right partner. A pea rhizobium knocking on a bean root is refused.
- `c8-m4` **"Slice the nodule"** (T1): the colour test, a real field diagnostic (`ott-2005`).
- `c8-m5` **"Fertiliser off-switch"** (T3): add nitrate, nodulation declines, and the player explains the plant's economics (`oldroyd-2013`).
- `c8-m6` **"Reach or release"** (T2): choose root hairs, mycorrhiza or organic-acid release to get P at a given pH. The non-mycorrhizal worlds force release or root hairs.
- `c8-m7` **"Myth or evidence?"** (T4): sort three claims about forest networks into supported, weakly supported and unsupported using the Karst evidence card (`karst-2023`).

**Expected chains**

- `low soil P` → *increases* → `value of fungal partner` → *enables* → `P supply beyond depletion zone`
- `soil nitrate high` → *suppresses* → `nodulation` → *decreases* → `N fixation`

**Discoveries:** "Partnerships are trades, and trades depend on prices." "Pink means working." "Not every crop has a fungus."

**Misconceptions:** M13 (trees talk through the wood wide web); M14 (all crops are mycorrhizal); M17 (legumes fertilise the next crop by default); M18 (P leaches like nitrate); "nodules = fixation"; "inoculating always helps".

**Contested:** glomalin as AMF glue (`rillig-2004`, `gillespie-2011`); common mycorrhizal networks (`karst-2023`).

**Scientist-lens payoff:** finding a partner's DNA is not finding an *effective* partnership. A nodule count is not a fixation rate.

**Sources:** `smith-2003`, `leake-2004`, `brundrett-tedersoo-2018`, `karst-2023`, `rillig-2004`, `gillespie-2011`, `hoffman-2014`, `herridge-2008`, `oldroyd-2013`, `ott-2005`, `shen-2011`, `hinsinger-2001`, `walker-syers-1976`, `fowler-2013`, `akiyama-2005`.

---

### Chapter 9 — The Nitrogen Relay

**Learning objectives**

1. Almost all soil N is organic. *Total* N and *available* N are different numbers.
2. The cycle is learned one stage at a time: mineralisation, immobilisation, nitrification, denitrification, losses.
3. C:N decides immobilisation versus release. Microbes need about 24:1 in their diet, and their bodies are about 8:1.
4. Immobilised N is borrowed, not lost.
5. Gene abundance is not a process rate.

**Scenes**

- `c9-relay` (rhizosphere): **the nitrogen relay** as a baton race:
  - organic N → NH₄⁺ (decomposer);
  - NH₄⁺ → NO₂⁻ → NO₃⁻ (AOB/AOA/comammox);
  - NO₃⁻ → plant;
  - exits: N₂O/N₂ at an anaerobic microsite, leachate down a drain, NH₃ at the surface.
- `c9-beet-field` (field): a sugar beet field after cereal straw was incorporated. The crop's N status dims, then recovers.

**Cast:** `nitrifier-aob`, `nitrifier-aoa`, `comammox`, `denitrifier`, `bacteria-copio`, `amoeba`, `root-tap` (beet).

**Bench `straw-n`:**

- Levers: residue C:N (beet tops ~15 / cereal straw ~80; ranges from `nrcs-cn-ratios`, verify), mineral N added (none / some), rain (dry / wet).
- Picture: the relay.
- Graph: NH₄⁺, NO₃⁻, microbial N, plant N, losses.
- Number: "N accounted for: 100.0 %".

**Missions**

- `c9-m1` **"The nitrogen relay"** (T2): hand the baton correctly. A misplaced handoff triggers an explanation card.
- `c9-m2` **"Why is nitrogen temporarily unavailable?"** (T2): add straw, predict the dip, observe immobilisation, explain with C:N. This is a textbook mechanism. **No customer-specific yield hypothesis appears.**
- `c9-m3` **"Leak hunt"** (T3): find three loss pathways after rain on bare soil and under a cover crop.
- `c9-m4` **"Gene ≠ rate"** (T4): an *amoA* qPCR result arrives (archaeal *amoA* up to about 3,000× bacterial in some soils, gene copies; `leininger-2006`). The player must choose a second measurement, such as nitrate production in an incubation, before claiming high nitrification.
- `c9-m5` **"The prime suspect"** (T3): the chapter 2 stretch, now unlocked by N.

**Expected chains**

- `high C:N residue` → *increases* → `microbial N demand` → *causes* → `immobilisation` → *decreases* → `plant-available N (temporarily)`
- `rain on bare soil` → *increases* → `nitrate leaching`

**Discoveries:** "Total is not available." "Microbes borrow N and give it back later." "A gene count is a potential, not a rate."

**Misconceptions:** M16 (total N = available N); "immobilised N is lost"; "nitrification is two bacteria in sequence"; "more fertiliser = more yield".

**In the real world:**

- Haber–Bosch fixes about 120 Tg N per year against about 63 Tg of natural terrestrial fixation (`fowler-2013`).
- Global cropland NUE fell from about 68 % to about 47 % between 1961 and 2009 (`lassaletta-2014`).
- N₂O GWP is about 273 (`ipcc-ar6-wg1-ch7`).

**Sources:** `nrcs-cn-ratios`, `umn-n-cycle-2025`, `leininger-2006`, `daims-2015`, `van-kessel-2015`, `tian-2020`, `fowler-2013`, `lassaletta-2014`, `ipcc-ar6-wg1-ch7`, `kuzyakov-2010`, `fontaine-2007`.

---

### Chapter 10 — Disease and Defence

**Learning objectives**

1. Disease needs a susceptible host, a virulent pathogen and a conducive environment. The microbiome is often added as a fourth vertex.
2. Pathogens span kingdoms, and oomycetes are protists.
3. Pathogens persist as resting structures. Short rotations of the same host build up inoculum.
4. Suppressive soils come in two kinds: general (broad, related to total microbial activity, not transferable) and specific (transferable with small amounts of soil). Both are biological, so sterilisation reduces both.
5. **Pathogen DNA detected is not disease.** Each claim on the evidence ladder needs its own evidence.

**Scenes**

- `c10-triangle`: a three-toggle disease triangle on a pea root.
- `c10-rotation` (field): a season wheel for pea/bean in short versus long rotation. Resting structures (oospores, sclerotia, cysts) glow in a "seasons" overlay.
- `c10-shield` (rhizosphere): a protective biofilm along a sugar beet root, shown as a *hypothesis* until evidence cards are collected.

**Cast:** `fungi-path`, `oomycete`, `nematode-plant`, `pseudomonas-protector`, `bacillus`, `root-legume`, `root-tap`.

**Missions**

- `c10-m1` **"The disease triangle"** (T1): disease appears only when all three vertices align (`scholthof-2007`).
- `c10-m2` **"What lived here last season?"** (T2, generic pea/bean): inoculum builds up across short versus long rotations (`bennett-2012`). Cover crops can host particular pathogens or reduce particular pressures; "all cover crops are risky" is marked wrong.
- `c10-m3` **"Transfer the shield"** (T3): two arms. (a) Add 1–10 % untreated suppressive soil to a conducive soil: suppression transfers. (b) Sterilise or pasteurise the suppressive soil on its own: suppression is lost. The player reconstructs the classic experiment (`weller-2002`, `schlatter-2017`; the 1–10 % w/w range is an estimate).
- `c10-m4` **"Detection to proof"** (T4): climb the evidence ladder:
  1. observed disease outcome
  2. suppression hypothesis
  3. DNA/pathway candidate
  4. compound/activity assay
  5. plant test
  6. field evidence across environments

  Each rung unlocks a bounded claim. The published sugar beet / *Rhizoctonia* case (`mendes-2011`) and endophyte follow-up (`carrion-2019`) serve as the worked example.

**Expected chains**

- `host + virulent pathogen + conducive environment` → *together enable* → `disease`
- `short rotation of same host` → *increases* → `resting inoculum` → *increases* → `disease risk`

**Discoveries:** "Present is not sick." "Some soils defend, and sometimes you can move the defence." "Each rung of evidence is a different claim."

**Misconceptions:** M19 (pathogen detected = disease); "a diverse microbiome prevents disease"; "kill the pathogen and the problem is solved"; "cover crops cause / cure disease".

**Scientist-lens payoff:** the generic worked case file from curriculum ch. 19, set in a bean world. It separates measurement, derived, interpretation, *not supported yet* and next evidence.

**Sources:** `scholthof-2007`, `bennett-2012`, `weller-2002`, `schlatter-2017`, `mendes-2011`, `carrion-2019`, `van-der-putten-2013`, `geisen-2018`, `ongena-jacques-2008`.

---

### Chapter 11 — Pit Walls and Deep Time

**Learning objectives**

1. Soil is a natural body formed in place by additions, losses, transformations and translocations.
2. Five state factors (CLORPT) control it, with humans often treated as a sixth.
3. Horizons are O, A, E, B, C and R. Many soils lack some of them.
4. Colour is evidence: dark means organic matter, red/yellow means oxidised iron, grey and mottled means waterlogging.
5. Soil forms slowly and is lost quickly.

**Scenes**

- `c11-pit` (profile): a painterly pit wall with a depth rail (Plex Mono cm) and horizon labels in the DOM.
- `c11-timelapse`: **"Watch this profile form"**, a stillwet-style time-lapse of pedogenesis. Plate frames are baked at 0, 100, 1,000 and 10,000 years and crossfaded. The time-compression label is always on (art-direction §5).
- `c11-catena` (landscape): three pits on the hill. Summit woodland: Podzol-like, bleached E. Mid-slope field: Cambisol/Luvisol-like loam. Toeslope paddy: Gleysol-like grey. WRB group names are shown as *examples*, not survey results (`wrb-2022`).
- `c11-munsell`: a colour-chip comparison as a measurement exercise.

**Missions**

- `c11-m1` **"Read the wall"** (T1): tap horizons, guess, then reveal the name and the evidence.
- `c11-m2` **"Make a podzol"** (T2): choose climate, litter, parent material and time, and watch the E horizon bleach and the B horizon accumulate.
- `c11-m3` **"Detective pit"** (T3): infer drainage history from mottles. Several defensible answers are accepted.
- `c11-m4` **"A thousand years per centimetre?"** (T2):
  - FAO public messaging says "up to 1,000 years per cm", with large real variation (`fao-2015-swsr` context; `verheijen-2009`: about 0.3–1.4 t ha⁻¹ yr⁻¹ formation).
  - Plough erosion runs 10–100× faster (`montgomery-2007`).

**Expected chains**

- `cold wet climate + conifer litter + sand` → *drive* → `leaching of Fe/Al/organic acids` → *forms* → `bleached E over enriched B`
- `seasonal waterlogging` → *reduces* → `iron` → *leaves* → `grey matrix with rust mottles`

**Discoveries:** "Colour is a diary." "Soil forms from the top down *and* is mixed both ways." "Topsoil is not renewable on a human timescale."

**Misconceptions:** M2 (topsoil regenerates quickly); "soil is ground-up rock"; "every soil has all horizons"; "soil forms only top-down".

**Scientist-lens payoff:** a soil map is an *interpretation* drawn from pits and covariates. It is not a measurement of every square metre.

**Sources:** `nrcs-soil-survey-manual`, `nrcs-field-book`, `jenny-1941`, `wrb-2022`, `fao-2015-swsr`, `verheijen-2009`, `montgomery-2007`, `jrc-2016-gsba`, `walker-syers-1976`.

---

### Chapter 12 — Fields and Seasons

**Learning objectives**

1. Tillage, cover crops, rotation, residues and inputs act through the mechanisms of earlier chapters. None acts universally.
2. Outcomes are G×E×M: genotype × environment × management.
3. Many popular claims are conditional or overstated: no-till carbon, cover-crop SOC.
4. Compaction collapses macropores and its effects persist.

**Scenes**

- `c12-season-wheel` (field): crops, cover crops, residues and tillage events cycle. The underground world responds below: hyphae torn and regrowing, worm channels, residue piles.
- `c12-twin-fields`: twin fields side by side (subject Lime, comparison gold) sharing the same underground view.
- `c12-wheel` (aggregate): a tractor wheel presses the pore network flat. Roots bend at a plough pan (penetrometer resistance above about 2 MPa restricts roots; `bengough-2011`).

**Bench `twin-fields`:**

- Levers (≤4): tillage (plough / reduced), cover crop (none / legume / grass), rotation (2-year / 4-year), traffic (wet-season / dry-season).
- Readouts over compressed years: aggregate index, nitrate leached, SOC in topsoil *and* whole profile, disease pressure index.
- All are labelled teaching model.

**Missions**

- `c12-m1` **"Twin fields"** (T2): change one practice and compare.
- `c12-m2` **"Context flips the answer"** (T3):
  - The same no-till change in a dry versus a humid climate, and in sand versus clay.
  - The sign flips for yield or SOC.
  - Grounding: `pittelkow-2015` (about −5.7 % average no-till yield across 5,463 pairs, smaller with residue retention and rotation in dry climates).
- `c12-m3` **"What would you measure?"** (T4):
  - Shallow sampling "finds" carbon that a whole-profile, equivalent-soil-mass comparison does not (`powlson-2014`, `ogle-2019`).
  - Cover-crop SOC is shown as a contested pair: `poeplau-don-2015` about 0.32 against `chaplot-smith-2023` much smaller.
- `c12-m4` **"Heavy wheels"** (T2): machinery on wet versus dry soil; macropores vanish and the next rain ponds (`keller-2019`, `hamza-anderson-2005`).
- `c12-m5` **"Same seed, two fields"** (T3, G×E×M):
  - Generic spinach crop. One variety, two fields that differ in drainage and history.
  - The player must separate an environment effect from a management effect. A confounder (drainage) drives both a microbial signal and yield.
  - Teaches "correlation in a field map is not cause". **No customer framing.**

**Expected chains**

- `tillage` → *breaks* → `aggregates` → *exposes* → `protected C` → *increases* → `decomposition`
- `drainage poor` → *drives both* → `microbial signal X` and `yield` (confounder)

**Discoveries:** "A practice is a hypothesis about this field." "The answer depends on depth." "Two things moving together may share a cause."

**Misconceptions:** M21 (no-till sequesters lots of carbon); M22 (a soil health score tells you what to do); "regenerative practice X always increases yield and carbon"; "there is one best rotation"; "compaction is fixed by one deep rip".

**Scientist-lens payoff:** indicators describe and models predict. A percentile changes when the cohort changes: the "indicator versus model" hub playground idea, rebuilt generically (`lehmann-2020`).

**Sources:** `pittelkow-2015`, `powlson-2014`, `ogle-2019`, `poeplau-don-2015`, `chaplot-smith-2023`, `bennett-2012`, `van-der-putten-2013`, `hamza-anderson-2005`, `keller-2019`, `bengough-2011`, `lehmann-2020`, `van-groenigen-2014`, `minasny-2017`.

---

### Chapter 13 — Hillslope and River

**Learning objectives**

1. Erosion removes the most fertile topsoil first, mostly as invisible sheet erosion.
2. Water moves through a landscape: catena position controls wetness and soil type.
3. P moves with eroded particles and feeds algal blooms downstream.
4. Salinisation follows irrigation without drainage.
5. Satellite and environmental covariates *describe* a landscape. They do not *explain* it.

**Scenes**

- `c13-valley` (landscape): the full living backdrop.
  - Cloud shadows cross the hill; wind sways the woodland.
  - The river glints, and a storm can be summoned.
  - After the storm, a muddy plume enters the river and an algal bloom appears weeks later.
- `c13-splash` (field): raindrop splash dislodges aggregates on bare soil; a residue cover absorbs it.
- `c13-salt` (field, a dry irrigated valley variant): white crusts rise with evaporation; clay disperses into milky water when sodium arrives.
- `c13-satellite`: a Sentinel-2 true-colour inset beside the painted valley. It is labelled as a *measurement* (reflectance) next to an *illustration* (`img-sentinel-2`).

**Missions**

- `c13-m1` **"Rain on bare versus covered"** (T1).
- `c13-m2` **"Where does the soil go?"** (T2): follow tagged soil from slope to river. P travels with it (`cordell-2009`).
- `c13-m3` **"Irrigate the desert"** (T3): water with and without drainage over decades; salinity climbs and yield falls. Classic thresholds: EC_e > 4 dS m⁻¹ saline, ESP > 15 sodic (`usda-hb60`). Salt-affected land is about 10.7 % of land area (`fao-2024-salt`, high uncertainty).
- `c13-m4` **"Pixels and pits"** (T4): satellite greenness correlates with the soil map along the catena. The player must say what the satellite measured (reflectance) and what it cannot tell (the reason).

**Expected chains**

- `bare soil + intense rain` → *dislodges* → `aggregates` → *increases* → `sheet erosion` → *moves* → `P to river` → *feeds* → `algal bloom`
- `irrigation without drainage` → *raises* → `salt at surface` → *disperses* → `clay` → *decreases* → `infiltration`

**Discoveries:** "Most erosion is invisible." "The river remembers the hill." "A satellite sees colour, not cause."

**Misconceptions:** "erosion is a dramatic gully"; "salty soil just needs more water"; M18 (P leaches like nitrate).

**Sources:** `montgomery-2007`, `borrelli-2017`, `verheijen-2009`, `fao-2015-swsr`, `usda-hb60`, `fao-2024-salt`, `cordell-2009`, `soil-atlas-2015`, `keller-2019`.

---

### Chapter 14 — What Does the Sample Tell Us? (capstone)

This is the Soilytix chapter. It turns the whole world into a lesson about **what can be claimed, and how confidently**. Soilytix does not appear as an oracle. A generic "lab" stands for any measurement-and-inference workflow.

**Learning objectives**

1. Five layers are kept apart:
   - measurement
   - derived evidence
   - interpretation
   - prediction/model
   - recommendation
2. Indicators describe; models predict.
3. Every result carries a **benchmark, a confidence and a provenance**.
4. The sample is the first measurement. Where, how deep, how many cores and when dominate the result.
5. Sequencing gives *relative* composition. DNA includes dormant and dead cells. Predicted function is not measured function.
6. "We cannot tell yet; measure X" is a legitimate answer.

**Scenes**

- `c14-bench` (lab bench): the sample travels through sieve → extraction → PCR → sequencer. The player sees what is lost or transformed at each step:
  - relic DNA sneaks in (`carini-2016`: about 40 % on average, inflates richness by up to 55 %);
  - some cells resist lysis;
  - primers miss a clade;
  - 16S copy number varies from about 1 to 15+ (`louca-2018`).
- `c14-jar`: **the squeezing jar**, a fixed-size jar of reads that always fills to the brim. A spike-in estimates absolute counts (with its own extraction and amplification bias) (`gloor-2017`, `smets-2016`, `morton-2019`).
- `c14-report`: the player assembles a **small honest report**. Each block is typed (measured / derived / interpreted / would-do) and must carry a benchmark, a confidence and a provenance before it can be placed. It is clearly labelled as a teaching mock-up, not a Soilytix product.

**Missions**

- `c14-m1` **"Same soil, three labs"** (T3): pH in water versus CaCl₂; texture by hydrometer versus laser (`eshel-2004`, `kellogg-lab-methods`). The method is part of the result.
- `c14-m2` **"One core or five?"** (T3):
  - The player samples a patchy field world (`obrien-2016`: structure at the centimetre scale).
  - A decision flips when only one core is taken; replicates show the spread as dots.
- `c14-m3` **"The squeezing jar"** (T4).
- `c14-m4` **"Ghost DNA"** (T4): remove relic DNA and watch richness drop.
- `c14-m5` **"Sort the statement"** (T4): drag 12 statements into the five layers.
- `c14-m6` **"What else could explain it?"** (T4): for each pattern, propose at least one non-biological explanation (texture, drainage, sampling date).
- `c14-m7` **"Claim budget"** (T4): given evidence cards, write the strongest claim the evidence supports, and no stronger. Overclaims are named.
- `c14-m8` **"Two reports disagree"** (capstone): resolve the opening rumor. The reports differ by sampling depth and benchmark cohort, not by soil.

**Expected chains** (an evidence ladder, not a cause chain)

`detection` → `absolute abundance` → `activity` → `effect in controlled test` → `effect in field trials across environments`. Each rung is a different claim.

**Discoveries:** "A lab number is the truth about that sample, by that method." "Relative is not absolute." "The strongest honest claim is often smaller than the exciting one."

**Misconceptions:** M22 (a soil health score tells you what to do); M23 (DNA = alive and active); M24 (relative abundance up = organism grew); M25 (correlation in microbiome data = cause); "a lab number is the truth about my field"; "predicted functions are measured functions" (`douglas-2020`).

**Sources:** `obrien-2016`, `eshel-2004`, `kellogg-lab-methods`, `vance-1987`, `bustin-2009`, `callahan-2017`, `louca-2018`, `carini-2016`, `douglas-2020`, `gloor-2017`, `morton-2019`, `smets-2016`, `lehmann-2020`, `fierer-2017`, `lauber-2009`, `blagodatskaya-kuzyakov-2013`, `cornell-cash-manual`.

---

### Chapter ★ — The Neighbour's Chemical Toolkit (optional)

**Status:** optional, and opened by a rumor. It uses only **published textbook examples** (the *Bacillus* lipopeptide families, *Streptomyces*, teixobactin). It does **not** mention, imply or depict Soilytix bioassets, LOAM or any V3 discovery work, because the data boundary there is unresolved. It contains no real sequences other than public textbook examples.

**Learning objectives**

1. Soil microbes are prolific chemists. Actinomycetes are the source of about two-thirds of clinically used natural-product antibiotics (`barka-2016`, estimate).
2. *Bacillus* lipopeptides come in three families (iturin, fengycin, surfactin) with different roles. They are not interchangeable weapons.
3. In-vitro potential often fails to translate in vivo.
4. Many "antibiotics" may act as signals at low dose. This is an open question.
5. A gene cluster indicates capacity, not production, concentration or effect.

**Scenes**

- `cs-colony` (cell): a *Bacillus* colony on a root with a halo of lipopeptide micelles. Iturin pores appear in a fungal membrane; surfactin lowers surface tension so the colony swarms.
- `cs-assembly-line`: an NRPS assembly line threading amino acids like beads, a playful but accurate model of modular biosynthesis.
- `cs-geosmin`: *Streptomyces* sporulates and releases geosmin ribbons (shared with chapter 6).

**Missions**

- `cs-m1` **"The neighbour's toolkit"** (T3): inspect a colony, reveal a candidate gene cluster, follow production and local exposure, then test with an assay card.
- `cs-m2` **"Plate versus plant"** (T4): an inhibition halo on agar, then a greenhouse result with no effect. Explain the gap: colonisation, dose, environment (`raaijmakers-2010`, `frontiers-2023-bacillus-fj3`).
- `cs-m3` **"Weapon or whisper?"** (T4): at low dose the molecule changes neighbour behaviour rather than killing. Which evidence would distinguish the two? (`davies-2006`, citation to be reconciled.)
- `cs-m4` **"Growing the unculturable"** (T2): the iChip story and teixobactin (`ling-2015`).

**Misconceptions:** M20 (antibiotics evolved only to kill); "gene cluster present = compound produced = pathogen killed in field"; "biocontrol strains work like pesticides".

**Sources:** `barka-2016`, `van-der-meij-2017`, `ongena-jacques-2008`, `raaijmakers-2010`, `frontiers-2023-bacillus-fj3`, `davies-2006`, `ling-2015`, `becher-2020`.

---

## 7. Cross-cutting systems

### 7.1 Field notebook (the only reward)

Four tabs, from the game-design research (§7):

1. **Rumor Map.** Nodes are phenomena; edges are "hints at" (dashed) and "explains" (solid). States: glimpsed → investigated → explained. After two visits without progress, a node offers a "where to look" hint.
2. **Field cards.** Organisms, materials, processes, tools. Partial on Scan; full after experiment.
3. **Lab book.** Every run: prediction, settings, result summary, chain, timestamp, rule-set version. Entries are styled by evidence tier:
   - observed: mono numbers with a ± band;
   - derived: dashed outline, formula on hover;
   - interpreted: chosen confidence, italic connectors;
   - would-do: chapters 12 and 14 only, always "if … then … because …".
4. **Codex.** Textbook pages that unlock *after* the related experiment. Each has an "In the real world" box, a simplification note and sources.

The **Contents** screen doubles as the progress view: chapters as a tree, concepts filled in as explained. There is no percentage, score or currency.

### 7.2 Cause-chain cards

- **Card kinds:** Condition, Actor, Process, Outcome. Each has a distinct *shape* plus a label, never colour alone.
- **Connectors:** *increases*, *decreases*, *enables*, *limits*, *only if*, *releases*, *is associated with*.
- **Batch confirmation:** a mission's 2–3 chains are confirmed together, and feedback says "N of M supported".
- **Verdicts:**
  - *Supported by what you observed*
  - *Plausible but untested*, which offers a new experiment
  - *Contradicted by your run*, which shows the run
- **Sequencing outcomes** can only use *is associated with*.
- **Confidence:** a three-step choice, reflected back gently and never scored.

### 7.3 Lenses

All lenses read the **same state**:

- **Habitat:** pores, water, air.
- **Community:** organisms and roles.
- **Flows:** C, N and water parcels; chapter-gated.
- **Scientist:** evidence types, instruments, uncertainty; unlocked in chapter 2.

### 7.4 Retrieval and return

- Returning to a chapter opens with a one- or two-card recall ("What did you find limits decomposition here?") before the notebook appears (`ls-roediger-karpicke-2006`).
- Spaced revisit prompts at 1 and 7 days are opt-in and local only.

### 7.5 Truth panel

A persistent "What is real here?" panel per scene, inherited from the prototype. It lists what is drawn from references, what is schematic, what is invented (units, rates, geometry) and what is *not simulated*.

---

## 8. Banks

### 8.1 Misconception bank

The ids M1–M25 are taken verbatim from `docs/research/curriculum.md` Appendix B and are encoded in `src/content/misconceptions.ts`. Additional misconceptions in this bible are encoded as M26+ by the chapter tasks. Every diagnostic message references a misconception id.

### 8.2 Contested-claims register

Every item in curriculum Appendix C renders with the **open-question treatment** (art-direction §6.5) and an evidence card. The bible adds nothing new, and the chapter tasks must carry every item that touches their chapter.

### 8.3 Glossary seed

Every term appears in the glossary only *after* the player has seen the phenomenon (`ls-kapur-2016`). Each entry names its unlocking chapter.

aggregate · anaerobic microsite · arbuscule · bulk density · catena · CEC · C:N ratio · compositional data · CUE · denitrification · depolymerisation · exudate · field capacity · horizon · immobilisation · leghaemoglobin · MAOM · matric potential · microbial loop · mineralisation · mycorrhiza · necromass · nitrification · nodule · oomycete · pedogenesis · pH · POM · priming · protist · redox · relic DNA · rhizosphere · structure · suppressive soil · texture · water-filled pore space · wilting point.

---

## 9. Content rules (binding on every content file)

1. **Every fact carries `sources` ids and a `confidence`** (firm / estimate / contested). Numbers are ranges or orders of magnitude unless the source is firm.
2. **Evidence types stay separate on screen:** measured / derived / inferred / interpreted / recommendation. Indicators describe; models predict.
3. **Microbiome causality:** no community shift *causes* an outcome without a mechanism and an evidence step. Sequencing connectors are limited to *is associated with*.
4. **No Soilytix capability, product, maturity, indicator, score or result** appears as real. The capstone report is a labelled teaching mock-up.
5. **No customer names, variety names, fields, trials, sample IDs or account framing.** A hashed denylist test enforces this (spec §9).
6. **No universal soil-health score, leaderboard, currency or streak.**
7. **Organisms are not good or bad.** Copy uses "can / often / in this context".
8. **Every content node has `reviewStatus`, `simplification` and `sources`.** Only `approved` content ships in the `public` profile. The `internal` profile shows a visible "scientific review pending" badge on anything not approved.
9. **Codex unlocks follow experience** (productive failure). There are no definitions before phenomena.
10. **Adult tone, short prompts, optional depth.** No timers, no fail states, unlimited retries.
