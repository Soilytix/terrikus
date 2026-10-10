---
title: "Terrikus — Scientific curriculum backbone"
description: "Textbook-depth soil-science curriculum, organised as chapters, written to be taught through an explorable world."
status: draft — scientific review pending
date: 2026-10-06
resource: authored (agent research run, web sources cited inline)
---

# Terrikus — Scientific curriculum backbone

This is the content backbone for Terrikus. It says **what is true, how sure we are, and where it comes from**. It also suggests how each idea can be *found* in the world rather than read. Game design, art direction and code live elsewhere. When a game mechanic and this document disagree, this document wins until a scientific reviewer says otherwise.

## How to read this document

### Conventions

- **Every factual claim carries a source URL.** DOIs are preferred because they survive publisher moves. Wikipedia is used for orientation only and is never the sole source for a number.
- **Numbers are orders of magnitude unless stated otherwise.** Soil varies by orders of magnitude between fields, horizons and millimetres. The world should present ranges and "typical" values, never a single universal constant.
- **Confidence labels** on quantitative facts:
  - **[firm]**: textbook consensus or a well-replicated measurement.
  - **[estimate]**: a published synthesis or model estimate; the order of magnitude is reliable, the exact figure is not.
  - **[contested]**: active scientific disagreement; the world must present it as open.
- **Evidence-type tags.** These mirror the Soilytix rule that measurement, derived evidence, interpretation and recommendation are kept apart:
  - *measured*: an instrument or count produced it.
  - *derived*: calculated from measurements (e.g. pore diameter from a matric potential).
  - *inferred*: a model, a proxy or a statistical association.
- **Difficulty tiers**:
  - **T1 Surface:** no prior knowledge; one idea, seen directly.
  - **T2 Explorer:** connects two or three ideas into a mechanism.
  - **T3 Naturalist:** quantitative reasoning, trade-offs, context-dependence.
  - **T4 Analyst:** what evidence can and cannot support. This is the "Soilytix lens": measurement versus inference versus interpretation.

### Binding content rules (from company guidance)

1. Indicators *describe*, models *predict*. The world never shows a universal "soil health score".
2. Microbiome data are noisy and compositional. Never let a community shift "cause" an outcome in the world without an explicit mechanism and evidence step.
3. Never invent Soilytix capabilities, maturity or results. Soilytix does not appear in the content as an oracle; it may appear as one example of a measurement-and-inference workflow, in generic terms.
4. Crop worlds are generic: spinach, pea, bush bean, sugar beet and rice may appear as *crops*. They are never tied to a customer, a field or a confidential dataset.
5. Molecules such as iturin, fengycin and surfactin are textbook examples of microbial chemistry, not Soilytix discoveries or leads.

### Recorded decisions (made autonomously; review later)

| # | Decision | Reason |
| --- | --- | --- |
| D1 | Curriculum organised as 20 chapters + appendices, following a Brady & Weil-like arc (habitat → chemistry → life → cycles → degradation → management → measurement) | Mirrors the standard university sequence ([Pearson, Brady & Weil 15th ed.](https://www.pearson.com/en-us/subject-catalog/p/nature-and-properties-of-soils-the/P200000000825/9780137516933); [SSSA *Know Soil, Know Life*](https://www.soils4teachers.org/books)), so reviewers can map it to known textbooks |
| D2 | The scale ladder (landscape → cell/molecule) is the primary navigation axis; chapters are "lenses" over it | Matches the explorable-world brief; one world, many lenses |
| D3 | "Humus" is taught as a historical concept, replaced by the POM/MAOM continuum | Current consensus moved away from humic substances ([Lehmann & Kleber 2015](https://doi.org/10.1038/nature16069); [Lavallee et al. 2020](https://doi.org/10.1111/gcb.14859)) |
| D4 | Common mycorrhizal networks ("wood wide web") appear only with an explicit contested flag | [Karst et al. 2023](https://doi.org/10.1038/s41559-023-01986-1) |
| D5 | Chapter 19 (measurement vs inference) is a first-class chapter, not an appendix | It is the Soilytix-specific lesson and the hardest to teach |
| D6 | Generic crop worlds: spinach (home), pea/bean (legume + rotation), sugar beet (C:N + a published suppressive-soil story), rice (redox) | Inherited from the prototype relevance map, customer links removed |

### Primary orientation sources

- USDA NRCS, *Soil Biology Primer* — https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer
- FAO, ITPS, GSBI, CBD & EC (2020), *State of knowledge of soil biodiversity — Status, challenges and potentialities* — https://doi.org/10.4060/cb1928en
- Orgiazzi et al. (eds.) (2016), *Global Soil Biodiversity Atlas*, JRC/GSBI — https://www.globalsoilbiodiversity.org/atlas and https://esdac.jrc.ec.europa.eu/content/global-soil-biodiversity-atlas
- Weil & Brady, *The Nature and Properties of Soils*, 15th ed. — https://www.pearson.com/en-us/subject-catalog/p/nature-and-properties-of-soils-the/P200000000825/9780137516933 (structure reference; not openly licensed, never quote figures from it into the app)
- SSSA, *Know Soil, Know Life* (2012) and educator's guide — https://www.soils4teachers.org/books ; https://serc.carleton.edu/kskl_educator/index.html
- USDA NRCS, *Soil Survey Manual* — https://www.nrcs.usda.gov/resources/guides-and-instructions/soil-survey-manual
- USDA NRCS, *Field Book for Describing and Sampling Soils* — https://www.nrcs.usda.gov/resources/guides-and-instructions/field-book-for-describing-and-sampling-soils
- IUSS Working Group WRB (2022), *World Reference Base for Soil Resources*, 4th ed. — https://www.isric.org/sites/default/files/WRB_fourth_edition_2022-12-18.pdf
- FAO ITPS (2015), *Status of the World's Soil Resources* — https://openknowledge.fao.org/handle/20.500.14283/i5199e

---

## Chapter 0 — The scale ladder: one world, six zoom levels

The world is a single continuous place that the learner zooms through. Each rung has its own characteristic length, time and "who lives here". The table below is the spatial skeleton every later chapter hangs on.

| Rung | Characteristic length | Characteristic time | What is visible | Chapters that live here |
| --- | --- | --- | --- | --- |
| Landscape | 100 m – 10 km | centuries – millennia | hillslopes, parent rock, rivers, climate, vegetation belts | 1, 16 |
| Field | 1 – 100 m | seasons – decades | crops, rotation, tillage, wheel tracks, drainage, sampling grid | 16, 17, 18 |
| Profile | 1 cm – 2 m | years – millennia | horizons O/A/E/B/C/R, roots, earthworm burrows, colour, water table | 1, 3, 4 |
| Aggregate & pore | 10 µm – 10 mm | hours – years | crumbs, macro/micropores, water films, air, hyphae, fauna | 2, 3, 4, 6, 7 |
| Rhizosphere | 0.1 – 5 mm from a root | minutes – weeks | root hairs, exudate gradients, nodules, mycorrhizal hyphae, biofilms | 8, 9, 12, 14 |
| Cell & molecule | 1 nm – 10 µm | seconds – days | bacteria, archaea, viruses, enzymes, clay surfaces, ions, signalling molecules, DNA | 5, 10, 11, 13, 15, 18 |

**Scale honesty rule.** Any scene that shows organisms of different sizes together must carry a visible scale marker. A bacterium (~1 µm) and an earthworm (~10 cm) differ by 10⁵ in length; in volume the difference is about 10¹⁵. The prototype already stated that "the scene is a schematic, not a literal gathering of equally sized organisms"; keep that.

**Striking facts for the ladder**

- Soil is probably home to about **59 % (± 15 %) of all species** on Earth, making it the most species-rich habitat. [estimate] *inferred* — [Anthony et al. 2023, PNAS](https://doi.org/10.1073/pnas.2304663120)
- One gram of soil can hold on the order of **10⁸–10⁹ bacterial cells** and **thousands to tens of thousands of bacterial taxa**. [firm, order of magnitude] *measured* — [NRCS Soil Biology Primer](https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer); [Raynaud & Nunan 2014](https://doi.org/10.1371/journal.pone.0087217); [Torsvik et al. 1990](https://doi.org/10.1128/aem.56.3.782-787.1990); [Roesch et al. 2007](https://doi.org/10.1038/ismej.2007.53)
- Despite those numbers, cells cover **well under 1 %** of the available pore surface. Soil is mostly empty habitat with dense hot-spots. [estimate] — [Young & Crawford 2004, Science](https://doi.org/10.1126/science.1097394); [Raynaud & Nunan 2014](https://doi.org/10.1371/journal.pone.0087217)
- Only a small fraction of microbial biomass is active at any moment: typically **~0.1–2 %**, rarely above 5 % without fresh substrate, while 10–40 % is "potentially active" and can wake within hours. [estimate] — [Blagodatskaya & Kuzyakov 2013](https://doi.org/10.1016/j.soilbio.2013.08.024); [Lennon & Jones 2011](https://doi.org/10.1038/nrmicro2504)

**Misconceptions to surface**: "soil is dirt" (inert); "a gram of soil is well-mixed" (it is a patchwork at the micrometre scale); "every organism is active all the time".

**Interaction**: the *zoom dial*. Each rung change shows a ruler that rescales (1 km → 1 m → 1 cm → 1 mm → 10 µm → 10 nm) and a clock that rescales (millennia → seconds). The learner collects a "scale stamp" in the notebook the first time they cross each rung. **Tier**: T1.

---

## Chapter 1 — Soil formation and profiles

### Core ideas

1. Soil is a **natural body that forms in place** from parent material, through additions, losses, transformations and translocations. It is not just "weathered rock" or "dirt" — [USDA Soil Survey Manual](https://www.nrcs.usda.gov/resources/guides-and-instructions/soil-survey-manual).
2. Five **state factors** — **cl**imate, **o**rganisms, **r**elief, **p**arent material, **t**ime (CLORPT) — control what soil forms. The framework comes from Hans Jenny's *Factors of Soil Formation* (1941) — [Soil Survey Manual](https://www.nrcs.usda.gov/resources/guides-and-instructions/soil-survey-manual); orientation: [Wikipedia, Pedogenesis](https://en.wikipedia.org/wiki/Pedogenesis). Humans are now often treated as a sixth factor — [FAO 2015 Status of the World's Soil Resources](https://openknowledge.fao.org/handle/20.500.14283/i5199e).
3. The result is a **profile** of horizons. **O** is organic litter; **A** is mineral topsoil darkened by organic matter, where life is densest; **E** is an eluvial, bleached layer that lost clay, iron or aluminium; **B** is the subsoil where those materials accumulate or structure develops; **C** is little-altered parent material; **R** is hard bedrock — [NRCS Field Book for Describing and Sampling Soils](https://www.nrcs.usda.gov/resources/guides-and-instructions/field-book-for-describing-and-sampling-soils).
4. Horizon **colour is evidence**. Dark means organic matter; red/yellow means oxidised iron; grey and mottled ("redoximorphic features") means periods of waterlogging and iron reduction. Colour is recorded with Munsell notation — [NRCS Field Book](https://www.nrcs.usda.gov/resources/guides-and-instructions/field-book-for-describing-and-sampling-soils).
5. Soils are classified into named groups (WRB *Reference Soil Groups* such as Chernozems, Podzols, Gleysols, Vertisols; USDA Soil Taxonomy *orders* such as Mollisols, Spodosols) — [WRB 2022](https://www.isric.org/sites/default/files/WRB_fourth_edition_2022-12-18.pdf).
6. Soil forms **slowly** and can be lost **quickly**: a human-lifetime-irreversible resource.

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Time to form 1 cm of topsoil | "up to 1,000 years" (FAO public messaging; real rates vary greatly) | [estimate] | [FAO Director-General, 2012 speech](https://www.fao.org/fileadmin/user_upload/FAODG/docs/2012-12-05-securing-healthy-soils-145th-session-FAO-council-DG-speech.pdf) — see also rates below |
| Soil formation rates in Europe (weathering + dust) | roughly 0.3–1.4 t ha⁻¹ yr⁻¹; upper tolerable erosion ≈ 1 t ha⁻¹ yr⁻¹ | [estimate] | [Verheijen et al. 2009](https://doi.org/10.1016/j.earscirev.2009.02.003) |
| Conventional plough agriculture erosion vs soil production | 1–2 orders of magnitude faster; ≈ 1 mm yr⁻¹ net loss | [estimate] *derived* from >1,600 measurements | [Montgomery 2007, PNAS](https://doi.org/10.1073/pnas.0611508104) |
| Reference soil groups in WRB 2022 | 32 | [firm] | [WRB 2022](https://www.isric.org/sites/default/files/WRB_fourth_edition_2022-12-18.pdf) |

### Misconceptions

- "Soil is ground-up rock." Most of soil's function comes from organic matter, structure and life added on top of the mineral fraction.
- "Topsoil is renewable on human timescales." It is not, at plough-erosion rates — [Montgomery 2007](https://doi.org/10.1073/pnas.0611508104).
- "Every soil has all six horizons." Many lack an E, an O or a B. A young soil on a river terrace may be A over C.
- "Soil forms from the top down only." Translocation moves material *downward*, and biological mixing (bioturbation by worms, ants, roots) moves it *both ways* — [Global Soil Biodiversity Atlas](https://www.globalsoilbiodiversity.org/atlas).

### Visually explorable

- A profile wall (soil pit) with horizons that respond to the five factors. Turning a climate dial changes leaching and E-horizon bleaching; changing slope position changes depth and wetness; changing time deepens the profile.
- Colour chips with Munsell-style hue, value and chroma; grey mottles appear when the water table slider rises.
- Living-backdrop opportunity: slow "time-lapse" weathering of a rock face into C and then A horizons, painterly and continuous. This is the most natural place for a stillwet-style generative backdrop.

### In-world interactions

- **"Read the wall"** (T1): tap horizons, guess what each is, reveal its name and the evidence (colour, texture, roots).
- **"Make a podzol"** (T2): choose cold-wet climate + conifer litter + sandy parent material + time; watch an E horizon bleach and a B horizon accumulate iron and humus.
- **"Detective pit"** (T3): given an unknown profile, infer the drainage history from mottles and the factor most likely responsible. Present several defensible answers.

**Tier**: T1–T3.

---

## Chapter 2 — Texture, structure, aggregates and pores

### Core ideas

1. **Texture** is the proportion of mineral particles by size: **sand 2–0.05 mm, silt 0.05–0.002 mm, clay < 0.002 mm (< 2 µm)**, using USDA limits. Plotting the three fractions on the **texture triangle** gives 12 classes (e.g. loam, silty clay) — [USDA Soil Survey Manual](https://www.nrcs.usda.gov/resources/guides-and-instructions/soil-survey-manual). Texture is practically permanent on human timescales.
2. **Structure** is how particles are glued into **aggregates** (granular, blocky, platy, prismatic, single-grain, massive). Unlike texture, structure is *dynamic*: management can build or destroy it — [NRCS Field Book](https://www.nrcs.usda.gov/resources/guides-and-instructions/field-book-for-describing-and-sampling-soils).
3. Aggregates are **hierarchical**. Clay and organic molecules form microaggregates (< 250 µm), held by persistent binding agents. Roots, fungal hyphae and microbial polysaccharides bind those into macroaggregates (> 250 µm) with transient binding agents — [Tisdall & Oades 1982](https://doi.org/10.1111/j.1365-2389.1982.tb01755.x); [Six et al. 2004](https://doi.org/10.1016/j.still.2004.03.008).
4. The **pore space** between and within aggregates is the actual habitat. Pores range from cracks and worm burrows (mm) through inter-aggregate pores (tens to hundreds of µm) to intra-aggregate micropores (< 10 µm). Pore size decides what holds water, what drains, where oxygen reaches, and who can get in — [Hartmann & Six 2022](https://doi.org/10.1038/s43017-022-00366-w); [Erktan et al. 2020](https://doi.org/10.1016/j.soilbio.2020.107876).
5. Small pores are **refuges**. Bacteria in pores too narrow for protist or nematode predators escape grazing. Organic matter inside microaggregates is physically protected from decomposers — [Postma & van Veen 1990](https://doi.org/10.1007/BF02012096); [Six et al. 2004](https://doi.org/10.1016/j.still.2004.03.008).

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Clay upper size limit | 2 µm (0.002 mm) | [firm] | [Soil Survey Manual](https://www.nrcs.usda.gov/resources/guides-and-instructions/soil-survey-manual) |
| Size contrast | a medium sand grain (~0.5 mm) is ~250× the diameter of the largest clay particle; a fine clay platelet can be < 0.1 µm | [firm] *derived* from class limits | [Soil Survey Manual](https://www.nrcs.usda.gov/resources/guides-and-instructions/soil-survey-manual) |
| Specific surface area | sand ≪ 0.1 m² g⁻¹; kaolinite ~10–30 m² g⁻¹; smectite up to ~800 m² g⁻¹ (internal surfaces) | [firm, ranges] | [Cornell Agronomy Fact Sheet 22, CEC](http://nmsp.cals.cornell.edu/publications/factsheets/factsheet22.pdf); Brady & Weil ch. 8 (structure reference) |
| Macro/micro-aggregate threshold | 250 µm | [firm, convention] | [Tisdall & Oades 1982](https://doi.org/10.1111/j.1365-2389.1982.tb01755.x) |
| Particle density of mineral soil | ≈ 2.65 g cm⁻³ (quartz) | [firm] | [Soil Survey Manual](https://www.nrcs.usda.gov/resources/guides-and-instructions/soil-survey-manual) |
| Typical bulk density of arable topsoil | ≈ 1.1–1.6 g cm⁻³ → porosity ≈ 40–60 % (*derived*: 1 − BD/2.65) | [firm, range] | [Hamza & Anderson 2005](https://doi.org/10.1016/j.still.2004.08.009) |

### Misconceptions

- "Clay soil is bad, sandy soil is good" (or vice versa). Each has trade-offs: clay holds water and nutrients but drains slowly and compacts; sand drains and warms but holds little.
- "Texture and structure are the same thing." Texture is particle sizes; structure is their arrangement. Only structure is quickly changed by management.
- "Soil is 45 % mineral, 5 % organic, 25 % water, 25 % air." This is a textbook idealisation of a moist loam topsoil, not a constant. Water and air trade places hour by hour — [Soils4Teachers](https://www.soils4teachers.org/soil-basics).
- "Bigger pores are better." Large pores drain and aerate; small pores store water and shelter microbes. Function needs a *distribution*.

### Visually explorable

- A grain-size ruler: sand like marbles, silt like flour, clay as stacked platelets (shown in a lens with their surface area unrolled into "carpet" area).
- A rotating aggregate cut open: macroaggregate → microaggregates → clay–organic clusters, with hyphae and roots as visible "string".
- A pore network rendered as a navigable cave system at the aggregate rung (the prototype's protist already moves here).

### In-world interactions

- **"Feel test"** (T1): ribbon a moist sample between virtual fingers; ribbon length and grittiness reveal the texture class. This is the real field method — [Thien 1979, texture-by-feel flow diagram](https://doi.org/10.2134/jae.1979.0054).
- **"Slake it"** (T2): drop a dry aggregate into water. A well-aggregated soil holds; a degraded one collapses. This matches the standard slake/aggregate-stability test — [Cornell CASH manual](https://soilhealth.cals.cornell.edu/manual/).
- **"Hide from the grazer"** (T2): play a bacterium choosing pores. Narrow pores are safe from the protist but drier and food-poor; wide pores are rich but dangerous.
- **"Build a crumb"** (T3): combine roots, hyphae, microbial glue and clay. See which agents persist and which vanish when tillage is applied.

**Tier**: T1–T3.

---

## Chapter 3 — Water

### Core ideas

1. Soil water is held by **capillarity and adsorption**. Its "pull" is the **matric potential** (ψm, negative pressure, kPa). The drier the soil, the more negative ψm, and the harder plants and microbes must work to extract water — [Or et al. 2007](https://doi.org/10.1016/j.advwatres.2006.05.025).
2. **Field capacity** (≈ −10 to −33 kPa by convention) is the water left after free drainage. **Permanent wilting point** (≈ −1,500 kPa) is where typical crops can no longer extract water. **Plant-available water** is the difference. These are conventions, not physical constants — [Cornell Soil Health Lab, AWC](https://soilhealthlab.cals.cornell.edu/files/2021/11/05_AWC.pdf); [METER Group application note](https://publications.metergroup.com/Application%20Notes/AN_PlantAvailableWater.pdf).
3. **Pore size sets potential.** By the Young–Laplace relation, the largest water-filled pore diameter at potential ψ is roughly d (µm) ≈ 300 / |ψ| (kPa). So at field capacity pores wider than ~9–30 µm have drained; at wilting point only pores below ~0.2 µm hold water. *derived*; physics as in [Or et al. 2007](https://doi.org/10.1016/j.advwatres.2006.05.025).
4. For microbes, water is a **road network**. As soil dries, water films thin and disconnect. Bacteria can no longer swim, and solutes can no longer diffuse to them. Communities become isolated islands, which is one explanation for soil's high diversity — [Or et al. 2007](https://doi.org/10.1016/j.advwatres.2006.05.025); [Schimel 2018](https://doi.org/10.1146/annurev-ecolsys-110617-062614).
5. Rewetting a dry soil causes a **CO₂ pulse** (the "Birch effect") from released osmolytes, dead cells and newly exposed organic matter — [Schimel 2018](https://doi.org/10.1146/annurev-ecolsys-110617-062614).
6. Water moves by **infiltration** (into), **percolation** (through) and **evaporation/transpiration** (out). Macropores (worm burrows, root channels, cracks) can carry water and solutes past the matrix ("preferential flow").

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Field capacity convention | −10 kPa (sandy) to −33 kPa | [firm, convention] | [Cornell AWC](https://soilhealthlab.cals.cornell.edu/files/2021/11/05_AWC.pdf) |
| Permanent wilting point convention | −1,500 kPa (−15 bar) | [firm, convention] | [Cornell AWC](https://soilhealthlab.cals.cornell.edu/files/2021/11/05_AWC.pdf) |
| Largest water-filled pore at −33 kPa | ≈ 9 µm diameter | [firm] *derived* (Young–Laplace, σ = 0.072 N m⁻¹) | [Or et al. 2007](https://doi.org/10.1016/j.advwatres.2006.05.025) |
| Largest water-filled pore at −1,500 kPa | ≈ 0.2 µm | [firm] *derived* | same |
| Global soil respiration (context for rewetting pulses) | ≈ 98 ± 12 Pg C yr⁻¹ (2008) | [estimate] | [Bond-Lamberty & Thomson 2010](https://doi.org/10.1038/nature08930) |

### Misconceptions

- "Wet soil is always good for life." Waterlogging cuts off oxygen (Chapter 4).
- "A soil at field capacity is full." It still contains air in the large pores, which is why roots breathe.
- "Plants suck water like a straw from a tank." They extract against a rising matric "pull", and the last water is the hardest to get.
- "Water just sits in pores." Films are dynamic, and connectivity changes by the hour.

### Visually explorable

- A pore network that **drains in front of the learner** as a potential slider moves from 0 to −1,500 kPa. Largest pores empty first; films thin; bacterial islands disconnect.
- Root hairs pulling water with visible tension lines.
- A rain event: infiltration front moving down a profile, with fast fingers down burrows (preferential flow).

### In-world interactions

- **"Drain the cave"** (T2): predict which pores empty first; then watch. Notebook entry: "pore size controls water".
- **"Stranded"** (T2): as a bacterium, try to reach food while films disconnect. Movement stops below a film threshold.
- **"After the drought"** (T3): rewet a dry soil; predict the CO₂ trace; observe the pulse; explain with the three candidate sources (osmolytes, dead cells, exposed organic matter). The science treats the relative contribution as unresolved.

**Tier**: T1–T3.

---

## Chapter 4 — Air, temperature and redox

### Core ideas

1. Soil air is **connected air-filled pore space**. Oxygen enters mainly by **diffusion**. O₂ diffuses roughly **10,000× more slowly in water than in air**, so water-filled pores are oxygen barriers — [Keiluweit et al. 2017](https://doi.org/10.1038/s41467-017-01406-6).
2. Even a "well-drained" soil contains **anaerobic microsites**, typically in the wet centres of aggregates and around fresh organic matter. These microsites host anaerobic processes and can protect carbon — [Keiluweit et al. 2017](https://doi.org/10.1038/s41467-017-01406-6).
3. When O₂ is gone, microbes use other electron acceptors in a predictable **redox ladder**: O₂ → NO₃⁻ (denitrification) → Mn(IV) → Fe(III) → SO₄²⁻ → CO₂ (methanogenesis). Each step yields less energy and occurs at lower redox potential — [Borch et al. 2010](https://doi.org/10.1021/es9026248).
4. Redox leaves **visible traces**: grey reduced iron, rusty mottles where iron re-oxidised, rotten-egg sulfide smell, methane bubbles in paddies (Chapter 1 colours are the fossil record of this ladder).
5. Flooded rice soils are the clearest case. The surface stays a thin oxidised layer; below it the redox ladder runs to methanogenesis. Rice cultivation is a significant anthropogenic methane source — [Saunois et al. 2020, Global Methane Budget](https://doi.org/10.5194/essd-12-1561-2020).
6. **Temperature** speeds most biological rates. A Q₁₀ of ~2 (rate doubles per 10 °C) is a common rule of thumb, but the temperature sensitivity of *stable* organic matter is debated — [Davidson & Janssens 2006](https://doi.org/10.1038/nature04514).

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| O₂ diffusion, water vs air | ~10⁴ times slower in water | [firm] | [Keiluweit et al. 2017](https://doi.org/10.1038/s41467-017-01406-6) |
| Approx. redox (Eh at pH 7) where O₂ disappears / nitrate reduction / Fe(III) reduction / sulfate reduction / methanogenesis | ≈ +350 / +250 / +100 to −100 / −150 / < −200 mV (approximate textbook thresholds) | [estimate] | [Borch et al. 2010](https://doi.org/10.1021/es9026248) |
| Q₁₀ of soil respiration | often ~2, varies with substrate, moisture and acclimation | [contested for stable SOM] | [Davidson & Janssens 2006](https://doi.org/10.1038/nature04514) |

### Misconceptions

- "Anaerobic = dead." Anaerobic soil is full of specialised life; it simply runs on different chemistry.
- "A field is either aerobic or anaerobic." Oxygen is patchy at the millimetre scale.
- "Grey soil is just a different rock." Grey and mottled colours record water and iron chemistry.

### Visually explorable

- An oxygen "fog" overlay on the pore network, thinning toward aggregate centres. Toggle on to see anaerobic microsites glow.
- A redox elevator in a flooded paddy profile: descend floor by floor (O₂, nitrate, iron, sulfate, methane) with each floor's organisms and colours.
- Methane bubbles rising through a rice canopy (a natural living backdrop).

### In-world interactions

- **"After the downpour"** (T2, from the original proposal): compare drained versus waterlogged soil; see O₂ vanish, denitrifiers switch on, N₂O and N₂ leave (links to Chapter 11).
- **"Ride the redox elevator"** (T2): predict which process runs on each floor; collect the electron-acceptor cards in order.
- **"Drain the paddy"** (T3): intermittent drainage lowers methane but can raise N₂O. Show the trade-off and avoid declaring a winner. Present it as qualitative, sourced from [Saunois et al. 2020](https://doi.org/10.5194/essd-12-1561-2020) for methane context.

**Tier**: T2–T3.

---

## Chapter 5 — Soil chemistry: pH, charge, clays and cation exchange

### Core ideas

1. Clay minerals and organic matter carry mostly **negative surface charge**. That charge holds positively charged nutrients (cations: Ca²⁺, Mg²⁺, K⁺, NH₄⁺, also H⁺ and Al³⁺) against leaching. The capacity to hold them is the **cation exchange capacity (CEC)** — [Cornell Agronomy Fact Sheet 22](http://nmsp.cals.cornell.edu/publications/factsheets/factsheet22.pdf).
2. Clays differ. **1:1 clays** (kaolinite) are low-charge, non-swelling and common in old, weathered tropical soils. **2:1 clays** (smectite, vermiculite) carry high charge and swell and shrink with water (cracking Vertisols). Oxides of iron and aluminium can hold anions such as phosphate — [Cornell Fact Sheet 22](http://nmsp.cals.cornell.edu/publications/factsheets/factsheet22.pdf); [WRB 2022](https://www.isric.org/sites/default/files/WRB_fourth_edition_2022-12-18.pdf).
3. **pH** is a master variable. It controls nutrient availability (P is most available near pH 6–7), aluminium toxicity in acid soils (below about pH 5.5), and which microbes thrive. pH is the single best predictor of bacterial community composition at continental scale — [Lauber et al. 2009](https://doi.org/10.1128/AEM.00335-09); [Rousk et al. 2010](https://doi.org/10.1038/ismej.2010.58).
4. Soils acidify naturally (leaching, root and microbial respiration, organic acids) and under management. Ammonium-based nitrogen fertilisers are a major driver of acidification in intensively fertilised cropland — [Guo et al. 2010, Science](https://doi.org/10.1126/science.1182570).
5. **Anions** such as nitrate (NO₃⁻) are *not* held by negative charge and leach easily; this links to the nitrogen chapter.

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| CEC of kaolinite / smectite / organic matter | ≈ 3–15 / 80–150 / 200+ cmol(+) kg⁻¹ (ranges) | [firm, ranges] | [Cornell Fact Sheet 22](http://nmsp.cals.cornell.edu/publications/factsheets/factsheet22.pdf) |
| Soil pH vs bacterial community similarity, 88 soils across the Americas | r = 0.79; diversity peaks near neutral pH | [firm] *measured, inferred association* | [Lauber et al. 2009](https://doi.org/10.1128/AEM.00335-09) |
| Acidification of Chinese cropland, 1980s → 2000s | pH fell by ≈ 0.5 units on average | [estimate] | [Guo et al. 2010](https://doi.org/10.1126/science.1182570) |
| One pH unit | a tenfold change in H⁺ activity | [firm] | definition |

### Misconceptions

- "pH 7 is ideal for every crop." Optima differ by crop and by soil; blueberries want acid soil, and many legumes need near-neutral soil for nodulation.
- "pH is linear." It is logarithmic; pH 5 has ten times the H⁺ activity of pH 6.
- "Nutrients are just 'in' the soil." Most are on surfaces, in minerals or in organic matter, and only a small fraction is in solution at any moment.
- "pH determines the microbiome." pH is a strong *correlate* and one driver. Other factors co-vary with it (Chapter 19).

### Visually explorable

- A clay platelet as a **charged landscape**. Cations hover and swap places; a "rain" of H⁺ knocks Ca²⁺ off (exchange) and sends it toward drainage.
- Swelling clay: a Vertisol that cracks in drought and seals when wet.
- A pH dial that recolours nutrient availability bars, with aluminium appearing at low pH.

### In-world interactions

- **"Cation musical chairs"** (T2): drag cations onto exchange sites; add acid; watch which cations leave first.
- **"Leaky nitrate"** (T2): add NH₄⁺ and NO₃⁻ fertiliser beads; rain; see the anion leave and the cation stay (until nitrification turns it into nitrate, Chapter 11).
- **"The pH predictor"** (T4): a community plot shifts across a pH gradient. The learner is asked whether pH *causes* the shift. The right answer: it is a strong, replicated association with known mechanisms (H⁺ tolerance), but the other gradients must be checked before claiming causation.

**Tier**: T2–T4.

---

## Chapter 6 — Soil organic matter: from "humus" to a continuum

### Core ideas

1. **Soil organic matter (SOM)** is everything organic that is not a living root or animal: plant fragments, microbial bodies and their remains (**necromass**), and small molecules on mineral surfaces. In most arable topsoils it is a few percent by mass yet controls structure, water holding, CEC and nutrient supply.
2. The old idea of "humus" as large, stable, chemically unique **humic substances** formed by "humification" is **not supported by modern direct observation**. Humic extracts are largely artefacts of alkaline extraction. SOM is a **continuum** of progressively decomposed compounds, and persistence depends on accessibility and mineral protection rather than intrinsic recalcitrance — [Lehmann & Kleber 2015](https://doi.org/10.1038/nature16069); [Schmidt et al. 2011](https://doi.org/10.1038/nature10386).
3. A useful working split is **particulate organic matter (POM)** versus **mineral-associated organic matter (MAOM)**. POM is lighter, younger, made of plant fragments, turns over in years to decades and is vulnerable to disturbance. MAOM is bound to clay and silt surfaces, partly microbially processed, and persists for decades to centuries. Its capacity may be limited by available mineral surfaces — [Lavallee et al. 2020](https://doi.org/10.1111/gcb.14859); [Georgiou et al. 2022](https://doi.org/10.1038/s41467-022-31540-9).
4. Microbes are not only decomposers but **builders**. Their growth and death ("in vivo turnover", the **microbial carbon pump**) generate necromass that becomes a large share of stable SOM — [Liang et al. 2017](https://doi.org/10.1038/nmicrobiol.2017.105); [Kallenbach et al. 2016](https://doi.org/10.1038/ncomms13630).
5. SOM persistence is an **ecosystem property**: the same molecule can last a week or a millennium depending on where it sits — [Schmidt et al. 2011](https://doi.org/10.1038/nature10386).

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Global soil organic carbon, top 1 m | ≈ 1,500 Pg C (estimates span ~1,200–2,500 depending on bulk-density assumptions) | [estimate] | [Scharlemann et al. 2014](https://doi.org/10.4155/cmt.13.77); [Köchy et al. 2015](https://doi.org/10.5194/soil-1-351-2015) |
| Comparison | soil C in the top metre ≈ roughly twice the carbon in the atmosphere and more than vegetation | [estimate] | [Scharlemann et al. 2014](https://doi.org/10.4155/cmt.13.77) |
| SOM ↔ SOC conversion | the classic 1.724 ("58 % C") factor is questioned; ~2 (50 % C) often fits better | [contested] | [Pribyl 2010](https://doi.org/10.1016/j.geoderma.2010.02.003) |
| Microbial necromass share of SOC | about half in croplands and grasslands, less in forests, from biomarker-based estimates | [estimate, method-dependent] | [Liang et al. 2019](https://doi.org/10.1111/gcb.14781) |
| POM vs MAOM residence | years–decades vs decades–centuries | [firm, qualitative] | [Lavallee et al. 2020](https://doi.org/10.1111/gcb.14859) |

### Misconceptions

- "Humus is a stable black substance that plants make." (See D3: teach "humus" only as history.)
- "Recalcitrant molecules such as lignin are what lasts." Lignin often decomposes *faster* than some microbial products on minerals — [Schmidt et al. 2011](https://doi.org/10.1038/nature10386).
- "More organic matter is always possible." Mineral surfaces may saturate. Sandy soils have less capacity to build MAOM — [Georgiou et al. 2022](https://doi.org/10.1038/s41467-022-31540-9).
- "Compost = soil carbon." Added material mostly respires. Only a fraction becomes persistent SOM.

### Visually explorable

- A leaf fragment (POM) that shrinks and fragments, and microbe bodies that die and smear onto clay as glowing MAOM coatings.
- Two "vaults": the open POM pile (fast, raided by fungi and fauna) and the mineral-surface vault (slow, guarded by bonds and by small pores).
- A historical overlay ("museum" lens) that shows the 20th-century humus diagram, then strikes it through. This is a powerful moment for showing that science revises itself.

### In-world interactions

- **"Where did the leaf go?"** (T1–T2, the proposal's first mission): tag leaf carbon; trace it to CO₂, microbial biomass, necromass, POM and MAOM. Energy ends as heat and does not loop.
- **"Vault or vapour"** (T3): choose litter quality, soil texture and moisture; predict how much tagged C is still in soil after a compressed year. Outcomes are ranges, not exact numbers.
- **"Is it saturated?"** (T3): add residue to a sandy versus a clay soil and compare MAOM growth.

**Tier**: T1–T3.

---

## Chapter 7 — The soil food web, by size class

Soil life is easiest to explore **by size**, because size sets which pores an organism can enter, who can eat whom, and how fast it lives. Classic size classes are microbiota (< 0.1 mm), mesofauna (0.1–2 mm) and macrofauna (> 2 mm) — [FAO 2020](https://doi.org/10.4060/cb1928en); [Global Soil Biodiversity Atlas](https://www.globalsoilbiodiversity.org/atlas).

### Core ideas (whole chapter)

1. The food web has **energy channels**: a **root channel** (living roots and exudates), a **bacterial channel** (fast, labile inputs) and a **fungal channel** (slower, tougher inputs such as lignin and cellulose) — [NRCS Soil Biology Primer](https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer).
2. **Grazing releases nutrients.** Bacteria and fungi hold nutrients in biomass. When protists and nematodes eat them, the grazers excrete the excess nitrogen as ammonium near roots (the **microbial loop**) — [Clarholm 1985](https://doi.org/10.1016/0038-0717(85)90113-0); [Bonkowski 2004](https://doi.org/10.1111/j.1469-8137.2004.01066.x).
3. **Ecosystem engineers** (earthworms, ants, termites, roots) build the physical habitat for everyone else.
4. Most soil taxa are **uncultured and undescribed**. Unknown functions are the norm, not the exception — [Fierer 2017](https://doi.org/10.1038/nrmicro.2017.87).
5. No organism is "good" or "bad" in itself. Roles depend on context, dose and host (the proposal's rule).

### 7.1 Viruses

- **What**: mostly bacteriophages, plus viruses of fungi, protists and plants. They lyse hosts, shuttle genes and release cell contents (the "viral shunt").
- **Numbers**: ~10⁸–10¹⁰ virus-like particles g⁻¹ dry soil; higher in forest than agricultural soils in one survey [estimate] *measured* (epifluorescence counts) — [Williamson et al. 2017](https://doi.org/10.1146/annurev-virology-101416-041639).
- **Misconception**: "viruses only cause disease". In soil they mainly regulate bacterial populations and nutrient turnover.
- **Explorable**: phage particles (~50–200 nm) docking on a bacterium; a lysis burst releasing nutrients. **Interaction**: "Who controls the bloom?" (T3). **Contested**: the size of their role in soil carbon cycling is poorly quantified.

### 7.2 Bacteria

- **What**: single cells ~0.5–2 µm, living in biofilms and microcolonies on surfaces and in pores. They are the main decomposers of labile inputs and the drivers of N transformations, and many are dormant.
- **Numbers**: up to ~10⁹ cells per gram (about one teaspoon) [firm, order] — [NRCS Primer](https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer). Around 2 % of bacterial phylotypes (~500) made up nearly half of the sequences in a global survey [estimate] *measured, compositional* — [Delgado-Baquerizo et al. 2018](https://doi.org/10.1126/science.aap9516).
- **Misconceptions**: "bacteria are germs"; "more bacteria = healthier soil".
- **Explorable**: microcolonies on a pore wall; quorum-sensing glow; dormancy as a crystallised state that "wakes" with a sugar pulse. **Interaction**: "Wake the sleepers" (T2): add exudate; most cells stay dormant (Chapter 0 fact).

### 7.3 Archaea

- **What**: single-celled prokaryotes distinct from bacteria. In soils they include important ammonia oxidisers (Thaumarchaeota/Nitrososphaerota) and methanogens in waterlogged soils.
- **Numbers**: archaeal *amoA* genes up to ~3,000-fold more abundant than bacterial *amoA* in 12 soils [estimate] *measured gene copies, not activity* — [Leininger et al. 2006](https://doi.org/10.1038/nature04983).
- **Misconception**: "archaea only live in extreme environments".
- **Explorable/interaction**: in the nitrogen relay (Chapter 11), an archaeal oxidiser takes the ammonium baton in acidic, low-N soils.

### 7.4 Fungi (saprotrophs, AMF, EcM, pathogens)

- **What**: filamentous hyphae (~2–10 µm wide) that bridge air gaps, translocate water and nutrients, and decompose tough polymers. Functional groups: **saprotrophs** (decomposers, incl. white-rot lignin degraders), **arbuscular mycorrhizal fungi (AMF)** (Glomeromycota, inside roots of most crops), **ectomycorrhizal fungi (EcM)** (sheath around tree roots, many forest mushrooms), and **pathogens** (e.g. *Fusarium*, *Rhizoctonia*) — [NRCS Primer](https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer); [Tedersoo et al. 2014](https://doi.org/10.1126/science.1256688).
- **Numbers**: mycorrhizal mycelium often exceeds tens of metres of hyphae per gram of soil and can be 20–30 % of microbial biomass [estimate] — [Leake et al. 2004](https://doi.org/10.1139/b04-060). Global fungal biomass ≈ 12 Gt C, mostly in soil [estimate] — [Bar-On et al. 2018](https://doi.org/10.1073/pnas.1711842115).
- **Misconceptions**: "fungi are mushrooms" (the mushroom is a short-lived reproductive body); "fungal-dominated soils are always better". Fungal:bacterial ratios are method-sensitive and context-dependent — [Strickland & Rousk 2010](https://doi.org/10.1016/j.soilbio.2010.05.007).
- **Explorable**: hyphae growing across an air-filled pore that bacteria cannot cross. **Interaction**: "Bridge the gap" (T2). See Chapter 9 for mycorrhizas.

### 7.5 Protists

- **What**: single-celled eukaryotes: flagellates, naked and testate amoebae, ciliates. They are the main grazers of bacteria, and some are phototrophs, parasites or plant pathogens (oomycetes such as *Pythium* and *Phytophthora* are protists, not fungi) — [Geisen et al. 2018](https://doi.org/10.1093/femsre/fuy006).
- **Numbers**: thousands of flagellates and amoebae per teaspoon, plus tens to hundreds of ciliates in productive soil [estimate] — [NRCS Primer](https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer).
- **Role**: grazing releases N (the microbial loop) and reshapes bacterial communities — [Bonkowski 2004](https://doi.org/10.1111/j.1469-8137.2004.01066.x).
- **Misconception**: "protozoa are all parasites"; "oomycetes are fungi".
- **Explorable/interaction**: the prototype's player character, a bacterial-grazing amoeba. Mission "A meal connects the web" (T1–T2): eat bacteria in a water film, excrete ammonium near a root hair, and see the root take it up.

### 7.6 Nematodes

- **What**: roundworms ~0.3–5 mm long. Trophic groups: bacterivores, fungivores, omnivores, predators and plant parasites (e.g. cyst and root-knot nematodes). The trophic group is visible in mouthparts (stylet vs open mouth) — [NRCS Primer](https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer).
- **Numbers**: ≈ 4.4 × 10²⁰ nematodes in surface soils worldwide, ≈ 0.3 Gt biomass; the highest share is in sub-Arctic soils (38 %) [estimate] *model on 6,759 samples* — [van den Hoogen et al. 2019](https://doi.org/10.1038/s41586-019-1418-6).
- **Misconception**: "nematodes are pests". Most are free-living grazers that release nutrients. Their community makeup is used as a bioindicator.
- **Explorable/interaction**: "Read the mouth" (T2): sort nematodes by mouthpart, then predict the food web channel.

### 7.7 Microarthropods (mites, springtails)

- **What**: mites (Acari) and springtails (Collembola), 0.1–2 mm. They shred litter, graze fungi, prey on nematodes, and move through existing pores without digging.
- **Numbers**: typically tens of thousands to hundreds of thousands per m² [estimate, wide range] — [FAO 2020](https://doi.org/10.4060/cb1928en); [NRCS Primer](https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer).
- **Striking link**: springtails are attracted by **geosmin**, the "earthy smell" made by *Streptomyces*. They eat the bacteria and disperse their spores, so the smell of soil after rain works as a signal between organisms — [Becher et al. 2020](https://doi.org/10.1038/s41564-020-0697-x).
- **Explorable/interaction**: "Follow the smell" (T2): play a springtail tracking a geosmin gradient. This is a beautiful, evidence-backed micro-story.

### 7.8 Enchytraeids (potworms)

- **What**: small whitish annelids (~1–50 mm), relatives of earthworms. They are important in acidic, organic and cold soils where earthworms are scarce. They eat organic matter and microbes and leave faecal microaggregates.
- **Numbers**: often 10⁴–10⁵ individuals m⁻² in favourable soils [estimate] — [FAO 2020](https://doi.org/10.4060/cb1928en).
- **Interaction**: a cameo in the forest/litter world (later world in the prototype map). **Tier** T2.

### 7.9 Earthworms

- **What**: macrofauna and **ecosystem engineers**. Three ecological groups: **epigeic** (live in litter), **endogeic** (burrow horizontally in topsoil, eat soil) and **anecic** (deep vertical burrows; pull leaves down). They create macropores, mix horizons and build casts rich in stable aggregates — [Blouin et al. 2013](https://doi.org/10.1111/ejss.12025).
- **Numbers**: a meta-analysis found earthworm presence raised crop yield by ~25 % on average, mostly when residues were returned and N was limiting [estimate] — [van Groenigen et al. 2014](https://doi.org/10.1038/srep06365). Global map of local densities — [Phillips et al. 2019](https://doi.org/10.1126/science.aax4851). Darwin's 1881 book estimated tonnes of casts per acre per year — [Darwin Online](http://darwin-online.org.uk/content/frameset?itemID=F1357&viewtype=text&pageseq=1).
- **Misconceptions**: "earthworms are native everywhere and always good". In formerly glaciated North American forests, *invasive* earthworms remove the forest floor and harm native plants — [Hendrix et al. 2008](https://doi.org/10.1146/annurev.ecolsys.39.110707.173426).
- **Interaction**: "Dig the drain" (T2): place anecic worms; infiltration improves; leaves vanish from the surface. Then "The invader" (T3) in a forest world.

### 7.10 Other macrofauna (brief)

Ants, termites, beetle larvae, millipedes, woodlice and moles. Termites and ants dominate engineering in the tropics and drylands, where earthworms are fewer — [Global Soil Biodiversity Atlas](https://www.globalsoilbiodiversity.org/atlas). They can be a background cast for now.

### 7.11 Roots

- **What**: the producers that feed the underground. Roots release carbon (exudates, mucilage, sloughed cells), take up water and nutrients, create channels, and host symbionts. Root hairs are ~10 µm wide; fine roots ~0.1–1 mm.
- **Numbers**: crops and grasses send a substantial fraction of assimilated carbon below ground. Annual crops keep more in shoots (~45 % of a tracer) than grasses (~34 %) and allocate about 1.5× less below ground [estimate] — [Pausch & Kuzyakov 2018](https://doi.org/10.1111/gcb.13850).
- **Interaction**: see Chapter 8.

### Whole-web numbers and caveats

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Share of global species in soil | ~59 % ± 15 % | [estimate] | [Anthony et al. 2023](https://doi.org/10.1073/pnas.2304663120) |
| Relic (extracellular / dead-cell) DNA in soil | on average ~40 % of prokaryotic and fungal DNA; it inflated observed richness by up to 55 % | [estimate] *measured* | [Carini et al. 2016](https://doi.org/10.1038/nmicrobiol.2016.242) |
| Global biomass, bacteria (all habitats) | ≈ 70 Gt C, mostly *deep subsurface*, not topsoil | [estimate, large uncertainty] | [Bar-On et al. 2018](https://doi.org/10.1073/pnas.1711842115) |

### Visually explorable (chapter-wide)

This is the richest gallery. Use the **Soilytix illustration set** and the soilytix-illustration skill for organisms. Every organism card shows: size bar, what it eats, what eats it, what it transforms, conditions it needs, and a "how we know" line (microscopy, culturing, DNA). The food web can be a living mobile that reorganises when a channel is starved.

### Interactions (chapter-wide)

- **"Who eats whom?"** (T1–T2, from the proposal): reveal feeding links by watching; build a web; remove a node and predict the ripple.
- **"Field cards"** (T1): notebook collection; cards unlock deeper text only after the organism's role has been *seen*, not just clicked.
- **"Unknown taxon"** (T4): a DNA read with no cultured relative. The learner must say what can and cannot be claimed about it.

**Tier**: T1–T4.

---

## Chapter 8 — The rhizosphere and root exudates

### Core ideas

1. The **rhizosphere** is the thin soil zone influenced by a living root: chemically, by exudates and mucilage; physically, by water uptake and compression; and biologically, by an enriched and selected microbial community. Its extent is gradient-shaped and solute-specific. For most exudates it reaches ~0.5–4 mm from the root surface; gases and volatiles reach further — [Kuzyakov & Razavi 2019](https://doi.org/10.1016/j.soilbio.2019.05.011).
2. Roots release a broad cocktail: sugars, amino acids, organic acids (e.g. citrate, malate, which mobilise P), phenolics, flavonoids and **signalling molecules**. Flavonoids call rhizobia; strigolactones call AMF (and, unluckily, parasitic weeds) — [Bais et al. 2006](https://doi.org/10.1146/annurev.arplant.57.032905.105159); [Akiyama et al. 2005](https://doi.org/10.1038/nature03608).
3. The plant **recruits** a subset of the soil community. The rhizosphere microbiome is filtered from bulk soil by host genotype, root age and environment. Under pathogen attack, plants may enrich protective microbes ("cry for help", see Chapter 14) — [Philippot et al. 2013](https://doi.org/10.1038/nrmicro3109); [Mendes et al. 2011](https://doi.org/10.1126/science.1203980).
4. Exudates fuel **hot moments**: microbial growth bursts, priming of old SOM (Chapter 10), and grazing cascades that release N to the root (Chapter 7.5).

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Rhizosphere extent for most exudate solutes | ~0.5–4 mm (larger for volatiles, smaller for P and enzymes) | [estimate] | [Kuzyakov & Razavi 2019](https://doi.org/10.1016/j.soilbio.2019.05.011) |
| Fraction of photosynthate exuded | widely cited as ~5–21 % (method-dependent; often lower in field crops) | [contested range] | [Bais et al. 2006](https://doi.org/10.1146/annurev.arplant.57.032905.105159); compare [Pausch & Kuzyakov 2018](https://doi.org/10.1111/gcb.13850) |
| Belowground C allocation, crops vs grasses | crops allocate ~1.5× less below ground | [estimate] | [Pausch & Kuzyakov 2018](https://doi.org/10.1111/gcb.13850) |

### Misconceptions

- "The plant feeds microbes out of kindness." Exudation is partly passive leakage, partly active trade and signalling, and partly cost.
- "The rhizosphere is a fixed zone." Its width depends on the solute and the moment.
- "Plants choose their microbiome precisely." Host selection is real but probabilistic and noisy.

### Visually explorable

- A root tip growing through the pore network, trailing a coloured exudate cloud that diffuses, is eaten, and fades. The canonical "hot spot" image.
- Concentric gradients by solute: sugars (narrow), organic acids (wider), volatiles (widest).
- Root-hair forest with water depletion halo and P depletion halo (links to Chapter 13).

### In-world interactions

- **"Follow the root inputs"** (T1, prototype mission): trace exudate → bacterial bloom → protist grazing → ammonium → root uptake.
- **"Signal and answer"** (T2): release flavonoid vs strigolactone; see which partner responds (rhizobia vs AMF).
- **"Home or away"** (T3): compare the community near and far from the root. Note that *relative* abundance changes can arise because one group grew, not because another declined (bridge to Chapter 19).

**Tier**: T1–T3.

---

## Chapter 9 — Mycorrhizas

### Core ideas

1. Mycorrhizas are **root–fungus partnerships**. The plant supplies carbon (sugars and lipids); the fungus supplies nutrients (especially P, also N, Zn and water) and explores far beyond the root's depletion zone — [Smith et al. 2003](https://doi.org/10.1104/pp.103.024380); [Leake et al. 2004](https://doi.org/10.1139/b04-060).
2. Types: **arbuscular (AM)** fungi penetrate root cells and form tree-like *arbuscules* (most crops and grasses). **Ectomycorrhizal (EcM)** fungi sheath roots and form the Hartig net (many temperate and boreal trees). Ericoid and orchid mycorrhizas are specialised types — [Brundrett & Tedersoo 2018](https://doi.org/10.1111/nph.14976).
3. Some major crops are **non-mycorrhizal**: brassicas and the Amaranthaceae, including spinach and sugar beet. This is a useful teaching contrast for the generic crop worlds — [Brundrett & Tedersoo 2018](https://doi.org/10.1111/nph.14976).
4. The partnership runs from **mutualism to parasitism** depending on nutrient supply and light. With high P fertility the plant may "pay" carbon for little return — [Smith et al. 2003](https://doi.org/10.1104/pp.103.024380).
5. **Common mycorrhizal networks** linking plants exist. But claims that they are widespread in forests, transfer meaningful resources to seedlings, or let "mother trees" send resources and warnings to offspring are **insufficiently supported or unsupported** — [Karst et al. 2023](https://doi.org/10.1038/s41559-023-01986-1).

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Share of vascular plant species that are AM / EcM / ericoid / orchid / non-mycorrhizal | 72 % / 2 % / 1.5 % / 10 % / 8 % (+7 % inconsistent) | [estimate] | [Brundrett & Tedersoo 2018](https://doi.org/10.1111/nph.14976) |
| Mycorrhizal hyphal length | often tens of metres per gram of soil | [estimate] | [Leake et al. 2004](https://doi.org/10.1139/b04-060) |
| AM fungal pathway can supply most of the plant's P | even where no growth benefit is visible | [firm, experimental] | [Smith et al. 2003](https://doi.org/10.1104/pp.103.024380) |
| Fossil age of AM-like symbiosis | early land plants, > 400 million years | [firm] | [Brundrett & Tedersoo 2018](https://doi.org/10.1111/nph.14976) |
| Glomalin as an "AMF super glue" for aggregates | the measured "glomalin-related soil protein" is not specific to AMF | [contested] | [Rillig 2004](https://doi.org/10.4141/S04-003); [Gillespie et al. 2011](https://doi.org/10.1016/j.soilbio.2010.12.010) |

### Misconceptions

- "Mycorrhizas always help plants." They are context-dependent.
- "Trees talk through the wood wide web." This is contested and largely unsupported in its popular form — [Karst et al. 2023](https://doi.org/10.1038/s41559-023-01986-1).
- "All crops have mycorrhizas." Spinach and sugar beet do not, and that is a ready-made discovery in-world.

### Visually explorable

- An arbuscule inside a root cortex cell as a glowing branched "tree" where sugar and phosphate swap.
- Extraradical hyphae fanning past the root's P-depletion halo. The single most beautiful didactic image in the curriculum; a strong living-backdrop candidate.
- A "contested" network overlay with a visible uncertainty texture (dashed, flickering) and a link to the evidence card.

### In-world interactions

- **"The root exchange"** (T2, from the proposal): set soil P from low to high; watch the trade ratio change; at high P the fungus becomes a cost.
- **"Who has no partner?"** (T2): visit the spinach and sugar beet worlds; find no arbuscules; explain why that matters for P strategy.
- **"Myth or evidence?"** (T4): examine three claims about forest networks; sort them into supported / weakly supported / unsupported, using the Karst evidence card.

**Tier**: T2–T4.

---

## Chapter 10 — The carbon cycle in soil, and priming

### Core ideas

1. Carbon enters soil through **plant inputs**: shoot litter, roots, exudates and, in managed soils, residues and manures. It leaves mainly as **CO₂ from respiration** by roots and microbes, and partly as dissolved organic carbon, erosion and (when anaerobic) methane.
2. Microbes partition substrate between **growth** (biomass, eventually necromass) and **respiration**. The ratio is the **carbon-use efficiency (CUE)**. Higher CUE tends to favour SOM formation through the microbial carbon pump — [Liang et al. 2017](https://doi.org/10.1038/nmicrobiol.2017.105).
3. Soil respiration is a *gross* flux, roughly ten times fossil-fuel emissions, but it is nearly balanced by photosynthetic uptake. The climate question is the *net* change in soil stocks — [Bond-Lamberty & Thomson 2010](https://doi.org/10.1038/nature08930); [Friedlingstein et al. 2023, Global Carbon Budget](https://doi.org/10.5194/essd-15-5301-2023).
4. **Priming**: adding fresh, easily decomposed carbon (exudates, residues) can **speed up** (positive priming) or slow down decomposition of older SOM. Microbes "mine" old organic matter for N when fuel is abundant and N is scarce — [Kuzyakov 2010](https://doi.org/10.1016/j.soilbio.2010.04.003); [Fontaine et al. 2007](https://doi.org/10.1038/nature06275).
5. **Decomposition rate depends on** litter chemistry (C:N, lignin), moisture, temperature, oxygen, access (physical protection), and the decomposer community — [Schmidt et al. 2011](https://doi.org/10.1038/nature10386).

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Global soil respiration | ≈ 98 ± 12 Pg C yr⁻¹ (2008), rising ~0.1 Pg C yr⁻¹ | [estimate] | [Bond-Lamberty & Thomson 2010](https://doi.org/10.1038/nature08930) |
| Fossil CO₂ emissions (for scale) | ≈ 10 Pg C yr⁻¹ | [firm] | [Friedlingstein et al. 2023](https://doi.org/10.5194/essd-15-5301-2023) |
| Soil C stock, top 1 m | ≈ 1,500 Pg C | [estimate] | [Scharlemann et al. 2014](https://doi.org/10.4155/cmt.13.77) |
| Fresh carbon can prime decomposition of millennia-old deep-soil carbon | demonstrated in incubation | [firm, mechanism; field magnitude contested] | [Fontaine et al. 2007](https://doi.org/10.1038/nature06275) |
| "4 per 1000" initiative: annual 0.4 % SOC increase would offset a large share of emissions | aspirational target; feasibility debated | [contested] | [Minasny et al. 2017](https://doi.org/10.1016/j.geoderma.2017.01.002) |

### Misconceptions

- "Soil respiration is pollution." It is the breath of an ecosystem; nearly all of it was fixed from the air recently.
- "Adding carbon always adds carbon." Priming can make the net effect smaller or negative.
- "Soil can absorb all our emissions." Stocks are finite, accrue slowly, saturate and are reversible.

### Visually explorable

- Carbon atoms as tagged particles. Each atom's colour carries its age (a "radiocarbon" lens), so priming becomes visible when old, dark-blue atoms start leaving alongside fresh green ones.
- A breathing field: CO₂ shimmer above soil that rises with temperature and moisture.

### In-world interactions

- **"Where did the carbon go?"** (T1, prototype): pie of fates for one tagged residue.
- **"The prime suspect"** (T3): add sugar and track both new and old carbon in CO₂. The learner discovers that old carbon also left, and must explain why (N mining). This is an explicit predict → observe → explain loop.
- **"Gross versus net"** (T3): balance photosynthesis in and respiration out over a year; show stock change as the small difference of two large fluxes.

**Tier**: T1–T3.

---

## Chapter 11 — The nitrogen cycle

### Core ideas

1. Almost all soil N is in **organic** form. Plants mostly take up **ammonium (NH₄⁺)** and **nitrate (NO₃⁻)**, which are a tiny, fast-cycling fraction. *Total* N and *available* N are very different numbers (the proposal's "nitrogen relay" learning goal).
2. Stages — introduce one at a time:
   - **Fixation**: N₂ → NH₃ by nitrogenase (Chapter 12), or industrially via Haber–Bosch.
   - **Mineralisation (ammonification)**: organic N → NH₄⁺ by decomposers.
   - **Immobilisation**: microbes take up NH₄⁺/NO₃⁻ into biomass when decomposing high C:N material, temporarily competing with plants.
   - **Nitrification**: NH₄⁺ → NO₂⁻ → NO₃⁻ by ammonia-oxidising bacteria and archaea, nitrite oxidisers, and complete ammonia oxidisers (comammox *Nitrospira*), which do both steps — [Leininger et al. 2006](https://doi.org/10.1038/nature04983); [Daims et al. 2015](https://doi.org/10.1038/nature16461); [van Kessel et al. 2015](https://doi.org/10.1038/nature16459).
   - **Denitrification**: NO₃⁻ → NO₂⁻ → NO → **N₂O** → N₂ under low oxygen. Incomplete denitrification releases N₂O, a potent greenhouse gas and ozone-depleting substance — [Tian et al. 2020](https://doi.org/10.1038/s41586-020-2780-0).
   - **Losses**: nitrate leaching, ammonia volatilisation, erosion.
3. **C:N ratio decides immobilisation vs mineralisation.** Soil microbes have a body C:N of ~8:1 and need ~24 parts C to 1 part N in their diet (respiring the rest). Residues above ~24:1 lead to net immobilisation; below it, to net release — [USDA NRCS, Carbon to Nitrogen Ratios in Cropping Systems](https://www.nrcs.usda.gov/sites/default/files/2022-10/nrcs142p2_052823.pdf).
4. The human perturbation is huge. Industrial fixation now exceeds natural terrestrial fixation. Only about half of applied cropland N ends up in harvested product globally — [Fowler et al. 2013](https://doi.org/10.1098/rstb.2013.0164); [Lassaletta et al. 2014](https://doi.org/10.1088/1748-9326/9/10/105011).

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Total global N fixation (2010) | ≈ 413 Tg N yr⁻¹, about half anthropogenic | [estimate] | [Fowler et al. 2013](https://doi.org/10.1098/rstb.2013.0164) |
| Haber–Bosch vs natural terrestrial BNF | ≈ 120 vs ≈ 63 Tg N yr⁻¹ | [estimate] | [Fowler et al. 2013](https://doi.org/10.1098/rstb.2013.0164) |
| Global cropland N-use efficiency | fell from ~68 % (1961) to ~47 % (2009) | [estimate] | [Lassaletta et al. 2014](https://doi.org/10.1088/1748-9326/9/10/105011) |
| Microbial "ideal diet" C:N | ≈ 24:1 (body ≈ 8:1) | [estimate, rule of thumb] | [NRCS C:N sheet](https://www.nrcs.usda.gov/sites/default/files/2022-10/nrcs142p2_052823.pdf) |
| Residue C:N examples | young legume/vegetable residue ≈ 10–20:1; cereal straw ≈ 80:1 or more | [estimate, ranges] | [NRCS C:N sheet](https://www.nrcs.usda.gov/sites/default/files/2022-10/nrcs142p2_052823.pdf) |
| N₂O global warming potential (100 yr) | ≈ 273 × CO₂ | [firm] | [IPCC AR6 WG1, ch. 7](https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/) |
| Agriculture's share of anthropogenic N₂O | the largest single contributor | [estimate] | [Tian et al. 2020](https://doi.org/10.1038/s41586-020-2780-0) |
| Archaeal vs bacterial *amoA* abundance | up to ~3,000:1 (gene copies, 12 soils) | [estimate] | [Leininger et al. 2006](https://doi.org/10.1038/nature04983) |

### Misconceptions

- "Soil with lots of nitrogen has lots of available nitrogen."
- "Immobilised N is lost." It is borrowed and released later as microbes die and are grazed.
- "Nitrification is done by two bacteria in sequence." Archaea and comammox complicate the textbook diagram.
- "More fertiliser = more yield." Diminishing returns; the surplus leaches or volatilises.
- "Gene abundance = process rate." *amoA* copies indicate potential, not current rate (Chapter 19).

### Visually explorable

- **The nitrogen relay** as a baton race across organisms and pools: organic N → ammonium (decomposer) → nitrite → nitrate (nitrifiers) → plant, with exits to N₂O/N₂ (anaerobic microsite), leachate (drain) and NH₃ (surface).
- A sugar-beet residue (high C:N leaves vs low C:N crowns) or cereal straw dropped into the world; plant N "dims" for a while, then brightens.

### In-world interactions

- **"The nitrogen relay"** (T2, proposal): hand the N baton correctly; misplaced handoffs trigger an explanation card.
- **"Why is nitrogen temporarily unavailable?"** (T2, generic sugar beet world): add straw; predict the dip; observe immobilisation; explain with C:N.
- **"Leak hunt"** (T3): find the three loss pathways after a rain on bare soil versus soil under a cover crop.
- **"Gene ≠ rate"** (T4): an *amoA* qPCR result arrives; the learner must choose a second measurement (e.g. nitrate production in an incubation) before claiming high nitrification.

**Tier**: T2–T4.

---

## Chapter 12 — Biological nitrogen fixation and nodules

### Core ideas

1. **Nitrogenase** reduces N₂ to ammonia at a high energy cost (about 16 ATP per N₂ in the textbook stoichiometry) and is **destroyed by oxygen** — [Hoffman et al. 2014](https://doi.org/10.1021/cr400641x).
2. Free-living fixers (e.g. *Azotobacter*, cyanobacteria) and associative fixers exist, but the big agricultural flux is **symbiotic**: rhizobia in legume **root nodules** (pea, bean, soybean, clover), and *Frankia* in actinorhizal plants — [Herridge et al. 2008](https://doi.org/10.1007/s11104-008-9668-3).
3. Nodulation is a **molecular dialogue**. Legume flavonoids induce rhizobial **Nod factors**; the root hair curls, an infection thread forms, and bacteria differentiate into **bacteroids** inside nodule cells — [Oldroyd 2013](https://doi.org/10.1038/nrmicro2990).
4. The nodule solves the oxygen paradox with **leghaemoglobin**, which gives active nodules their **pink-red interior**, and with an oxygen diffusion barrier. Without leghaemoglobin, fixation fails — [Ott et al. 2005](https://doi.org/10.1016/j.cub.2005.01.042).
5. The host **regulates** nodule number (autoregulation) and suppresses nodulation when soil nitrate is plentiful. Fertilising legumes with N reduces fixation — [Oldroyd 2013](https://doi.org/10.1038/nrmicro2990).
6. Compatibility is specific. Pea and bean need different rhizobial partners (*Rhizobium leguminosarum* bv. *viciae* vs *R. etli/R. phaseoli*-type), which is one reason pea and bean worlds should not be interchangeable skins — [Oldroyd 2013](https://doi.org/10.1038/nrmicro2990).

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Nitrogenase stoichiometry | N₂ + 8 H⁺ + 8 e⁻ + 16 ATP → 2 NH₃ + H₂ + 16 ADP + 16 Pᵢ | [firm] | [Hoffman et al. 2014](https://doi.org/10.1021/cr400641x) |
| Global N fixed by crop legumes | ≈ 2.95 Tg (pulses) + 18.5 Tg (oilseed legumes) yr⁻¹; soybean ≈ 16.4 Tg (~77 %) | [estimate] | [Herridge et al. 2008](https://doi.org/10.1007/s11104-008-9668-3) |
| Natural terrestrial BNF vs Haber–Bosch | ≈ 63 vs ≈ 120 Tg N yr⁻¹ | [estimate] | [Fowler et al. 2013](https://doi.org/10.1098/rstb.2013.0164) |

### Misconceptions

- "Legumes put nitrogen in the soil for the next crop." Much fixed N leaves in harvested seed. The residual benefit depends on residue return and C:N.
- "Nodules = fixation." White or green nodules are often ineffective; pink means leghaemoglobin and likely activity.
- "Inoculating always helps." Benefit depends on existing compatible rhizobia, soil N and pH.

### Visually explorable

- Root-hair curling and infection-thread growth as a slow living animation; slicing a nodule to reveal pink tissue vs white (ineffective) tissue.
- An oxygen meter that drops across the nodule cortex.

### In-world interactions

- **"Knock knock"** (T2): send the right signal to the right partner; a mismatched rhizobium is refused.
- **"Slice the nodule"** (T1): the colour test, as a real field diagnostic.
- **"Fertiliser off-switch"** (T3): add nitrate; nodulation declines; explain the plant's economics.

**Tier**: T1–T3.

---

## Chapter 13 — Phosphorus (and a brief tour of other nutrients)

### Core ideas

1. P is **immobile**. It binds strongly to Fe/Al oxides in acid soils and to Ca in alkaline soils, so soil-solution P concentrations are tiny — [Shen et al. 2011](https://doi.org/10.1104/pp.111.175232).
2. Because P diffuses so slowly, roots create a **depletion zone** of only ~0.1–2 mm. Plants must **explore** (root hairs, mycorrhizal hyphae, Chapter 9) or **mobilise** (organic acids, phosphatase enzymes, rhizosphere acidification) — [Hinsinger 2001](https://doi.org/10.1023/A:1013351617532).
3. Over very long timescales, soils move from P-rich (young, P in apatite) to P-poor (old, P occluded or lost). This is the Walker & Syers model of P through pedogenesis — [Walker & Syers 1976](https://doi.org/10.1016/0016-7061(76)90066-5).
4. Mineral P fertiliser comes from finite **phosphate rock**. Excess P lost by erosion causes **eutrophication** downstream. Whether and when a "peak phosphorus" occurs is debated — [Cordell et al. 2009](https://doi.org/10.1016/j.gloenvcha.2008.10.009).
5. Other nutrients in brief: **K** (exchangeable and in clay interlayers); **S** (mostly organic, mineralised like N); **Ca/Mg** (exchangeable, pH-linked); **micronutrients** (Fe, Zn, Mn, Cu, B, Mo), whose availability is strongly pH- and redox-dependent. Microbial **siderophores** compete for iron, which links to Chapter 15.

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Soil-solution P | typically < 10 µM, often far lower | [firm] | [Shen et al. 2011](https://doi.org/10.1104/pp.111.175232) |
| P depletion zone around roots | ~0.1–2 mm | [estimate] | [Hinsinger 2001](https://doi.org/10.1023/A:1013351617532) |
| AM fungal pathway supply of plant P | can dominate supply | [firm, experimental] | [Smith et al. 2003](https://doi.org/10.1104/pp.103.024380) |
| Peak phosphorus timing | contested | [contested] | [Cordell et al. 2009](https://doi.org/10.1016/j.gloenvcha.2008.10.009) |

### Misconceptions

- "A high total P test means plenty of P for the plant." Most of it is unavailable.
- "Phosphorus leaches like nitrate." It moves mainly with eroded particles.
- "Phosphate-solubilising microbes reliably unlock P in the field." Strong in vitro, inconsistent in field trials (bridge to Chapter 15's in vitro vs in vivo lesson).

### Visually explorable

- Phosphate ions glued to rust-coloured oxide surfaces; a root hair's thin depletion halo; hyphae reaching past it.
- A deep-time slider (Walker & Syers): P pools shift from mineral to organic to occluded over 10⁴–10⁶ years.

### In-world interactions

- **"Reach or release"** (T2): choose root hairs, mycorrhiza or organic-acid release to get P under different pH. The non-mycorrhizal spinach/sugar beet world forces the "release" or "root hair" strategy.
- **"Downstream"** (T3): erosion event, then algal bloom in the river backdrop.

**Tier**: T2–T3.

---

## Chapter 14 — Plant disease and suppressive soils

### Core ideas

1. Disease needs a **susceptible host, a virulent pathogen and a conducive environment** (the disease triangle; the microbiome is often added as a fourth vertex) — [Scholthof 2007 (pub. 2006)](https://doi.org/10.1038/nrmicro1596).
2. Major soilborne pathogens span kingdoms: fungi (*Fusarium*, *Rhizoctonia*, *Verticillium*), **oomycetes** (*Pythium*, *Phytophthora*, *Aphanomyces*: protists, not fungi), bacteria (e.g. *Ralstonia*, *Streptomyces scabies*), plant-parasitic nematodes, and viruses vectored by soil organisms.
3. Pathogens can **persist** for years as resting spores, sclerotia, oospores or cysts. Short rotations of the same host build up inoculum — [Bennett et al. 2012](https://doi.org/10.1111/j.1469-185X.2011.00184.x).
4. **Suppressive soils** have little disease even when pathogen, host and environment allow it. **General suppression** comes from overall microbial activity and competition; it is broad and not transferable. **Specific suppression** is attributed to particular organisms, is often transferable by mixing small amounts into a conducive soil, and is lost on sterilisation — [Weller et al. 2002](https://doi.org/10.1146/annurev.phyto.40.030402.110010); [Schlatter et al. 2017](https://doi.org/10.1094/PHYTO-03-17-0111-RVW).
5. Classic cases: **take-all decline** in wheat monoculture, linked to 2,4-DAPG-producing *Pseudomonas* — [Weller et al. 2002](https://doi.org/10.1146/annurev.phyto.40.030402.110010). And a **sugar beet / *Rhizoctonia solani*** suppressive soil from the Netherlands, where community profiling plus mutants implicated *Pseudomonas* with a non-ribosomal peptide synthetase — [Mendes et al. 2011](https://doi.org/10.1126/science.1203980). Endophytic root communities can also contribute — [Carrión et al. 2019](https://doi.org/10.1126/science.aaw9285).
6. **Pathogen DNA detected is not disease**. Detection is a lead. Disease, suppression and their mechanism each need their own evidence (see Chapter 19 and the prototype's "discovery sequence").

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Bacterial/archaeal taxa detected in the sugar-beet suppressive-soil rhizosphere study | > 33,000 (PhyloChip) | [firm, platform-specific] | [Mendes et al. 2011](https://doi.org/10.1126/science.1203980) |
| Specific suppression transferable with a small fraction of suppressive soil | classic take-all and other transfer experiments, often 1–10 % w/w | [estimate] | [Weller et al. 2002](https://doi.org/10.1146/annurev.phyto.40.030402.110010) |
| Salinity-related yield losses (context for abiotic stress) | up to ~70 % in rice or beans in the worst-affected regions | [estimate] | [FAO 2024 salt-affected soils](https://www.fao.org/newsroom/detail/fao-launches-first-major-global-assessment-of-salt-affected-soils-in-50-years/en) |

### Misconceptions

- "Pathogens are always present = always disease." Presence ≠ disease.
- "A diverse microbiome prevents disease." Diversity correlates with general suppression in some studies, but specific suppression is tied to particular functions.
- "Kill the pathogen and the problem is solved." Fumigation can remove suppressive organisms too.
- "Cover crops cause disease" or "cover crops cure disease". Both are too general. Some cover crops host particular pathogens; others reduce particular pressures.

### Visually explorable

- A root under attack; pathogen hyphae advancing; then a protective biofilm along the root that fends it off (shown as a hypothesis until "evidence cards" are collected).
- Resting structures (sclerotia, oospores, cysts) glowing in a "seasons" overlay that shows carry-over across rotations.

### In-world interactions

- **"The disease triangle"** (T1): toggle host, pathogen and environment; disease appears only when all three align.
- **"What lived here last season?"** (T2, generic pea/bean world): show inoculum build-up across short vs long rotations.
- **"Transfer the shield"** (T3): mix 10 % suppressive soil into a conducive one; sterilise; compare. The learner reconstructs the classic experiment.
- **"Detection to proof"** (T4): stages observed disease outcome → suppression hypothesis → DNA/pathway candidate → compound/activity assay → plant test → field evidence. Each stage unlocks a different, bounded claim.

**Tier**: T1–T4.

---

## Chapter 15 — Microbial chemistry: antibiotics, lipopeptides and signals

### Core ideas

1. Soil microbes are prolific chemists. Actinomycetes, especially ***Streptomyces***, produce the majority of naturally derived antibiotics in clinical use — [Barka et al. 2016](https://doi.org/10.1128/MMBR.00019-15); [van der Meij et al. 2017](https://doi.org/10.1093/femsre/fux005).
2. ***Bacillus* lipopeptides** come in three families, made by non-ribosomal peptide synthetases (NRPS): **iturins** (strongly antifungal, membrane-disrupting), **fengycins** (antifungal against filamentous fungi), and **surfactins** (biosurfactants important for swarming, biofilm formation, root colonisation and triggering plant defences, with weaker direct antifungal action) — [Ongena & Jacques 2008](https://doi.org/10.1016/j.tim.2007.12.009); [Raaijmakers et al. 2010](https://doi.org/10.1111/j.1574-6976.2010.00221.x).
3. These molecules are **not interchangeable weapons**. Effects depend on dose, target membrane composition and the producer's location. **In vitro potential often fails to translate in vivo** — [Raaijmakers et al. 2010](https://doi.org/10.1111/j.1574-6976.2010.00221.x); example study cited in the prototype map: [Frontiers in Plant Science 2023](https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2023.1205894/full).
4. In nature, many "antibiotics" occur at **sub-inhibitory concentrations** and may act as **signals** that regulate gene expression in neighbours, rather than as weapons. This is an open question — [Davies et al. 2006](https://doi.org/10.1007/s10295-006-0112-5).
5. **Biosynthetic gene clusters** (BGCs) encode these pathways. Detecting a BGC in DNA suggests a *capacity*, not production, concentration or effect.
6. Most producers are **uncultured**. New methods grow them in situ: teixobactin was found in an uncultured soil bacterium grown on an iChip — [Ling et al. 2015](https://doi.org/10.1038/nature14098).
7. Soil's smell is chemistry: **geosmin** from *Streptomyces* signals to springtails (Chapter 7.7) — [Becher et al. 2020](https://doi.org/10.1038/s41564-020-0697-x).

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Share of clinically used natural-product antibiotics from actinomycetes | about two-thirds | [estimate] | [Barka et al. 2016](https://doi.org/10.1128/MMBR.00019-15) |
| *Bacillus* lipopeptide families | 3 (surfactin, iturin, fengycin) | [firm] | [Ongena & Jacques 2008](https://doi.org/10.1016/j.tim.2007.12.009) |
| Teixobactin discovery | 2015, uncultured soil β-proteobacterium via iChip | [firm] | [Ling et al. 2015](https://doi.org/10.1038/nature14098) |

### Misconceptions

- "Antibiotics evolved to kill." Natural roles may include signalling.
- "Gene cluster present = compound produced = pathogen killed in field." Each arrow needs its own evidence.
- "Biocontrol strains work like pesticides." They are living, context-dependent, and often colonisation-limited.

### Visually explorable

- A *Bacillus* colony on a root with a halo of lipopeptide micelles; iturin pores in a fungal membrane; surfactin lowering surface tension so the colony swarms.
- A *Streptomyces* mycelium sporulating and releasing geosmin as visible "scent ribbons".
- A molecular lens where the NRPS assembly line threads amino acids like beads (a playful, accurate model of modular biosynthesis).

### In-world interactions

- **"The neighbour's chemical toolkit"** (T3, prototype map): inspect a colony, reveal a candidate BGC, follow production and local exposure, then test the claim with an assay card.
- **"Weapon or whisper?"** (T4): at low dose, the "antibiotic" changes neighbour behaviour rather than killing; the learner decides what evidence would distinguish the two.
- **"Plate vs plant"** (T4): an inhibition halo on agar, then a greenhouse result with no effect. Explain the gap: colonisation, dose and environment.

**Tier**: T3–T4.

---

## Chapter 16 — Degradation: erosion, compaction, salinisation and acidification

### Core ideas

1. **Erosion** by water and wind removes the most fertile, organic-rich topsoil first. Bare soil, slope, intense rain and loss of aggregate stability drive it. Under conventional ploughing it far outpaces soil formation — [Montgomery 2007](https://doi.org/10.1073/pnas.0611508104); [Borrelli et al. 2017](https://doi.org/10.1038/s41467-017-02142-7).
2. **Compaction** by heavy machinery and trampling collapses macropores. Water infiltration, aeration and root penetration all suffer. Subsoil compaction can persist for decades — [Hamza & Anderson 2005](https://doi.org/10.1016/j.still.2004.08.009); [Keller et al. 2019](https://doi.org/10.1016/j.still.2019.104293).
3. **Salinisation** (excess soluble salts) and **sodification** (excess Na⁺ on exchange sites, which disperses clay and destroys structure) follow irrigation with poor drainage, rising saline groundwater or seawater intrusion — [FAO 2024](https://www.fao.org/newsroom/detail/fao-launches-first-major-global-assessment-of-salt-affected-soils-in-50-years/en); [USDA Handbook 60](https://www.ars.usda.gov/arsuserfiles/20360500/hb60_pdf/hb60complete.pdf).
4. **Acidification** (Chapter 5), **organic matter loss**, **sealing** (building over soil), **contamination** and **biodiversity loss** complete the FAO list of threats — [FAO 2015 Status of the World's Soil Resources](https://openknowledge.fao.org/handle/20.500.14283/i5199e).
5. Degradation processes **interact**. Compaction leads to waterlogging, which drives denitrification and N₂O. SOM loss weakens aggregates, which increases erosion, which removes more SOM.

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Share of global soils moderately to highly degraded | ≈ 33 % | [estimate] | [FAO 2015 SWSR](https://openknowledge.fao.org/handle/20.500.14283/i5199e); [UN News 2014](https://news.un.org/en/story/2014/07/473762) |
| Plough erosion vs soil production | 10–100× faster; ≈ 1 mm yr⁻¹ net loss | [estimate] | [Montgomery 2007](https://doi.org/10.1073/pnas.0611508104) |
| Tolerable erosion upper limit (Europe) | ≈ 1 t ha⁻¹ yr⁻¹ | [estimate] | [Verheijen et al. 2009](https://doi.org/10.1016/j.earscirev.2009.02.003) |
| Global water erosion, modelled | tens of Pg of soil per year (≈ 36 Pg in 2012 in one model) | [estimate, model] | [Borrelli et al. 2017](https://doi.org/10.1038/s41467-017-02142-7) |
| Salt-affected land | ≈ 1,381 Mha (10.7 % of land), with ~10 % of irrigated and of rainfed cropland affected | [estimate, high uncertainty] | [FAO 2024](https://www.fao.org/newsroom/detail/fao-launches-first-major-global-assessment-of-salt-affected-soils-in-50-years/en) |
| Saline threshold | ECe > 4 dS m⁻¹; sodic: ESP > 15 (classic definitions) | [firm, convention] | [USDA Handbook 60](https://www.ars.usda.gov/arsuserfiles/20360500/hb60_pdf/hb60complete.pdf) |
| Root elongation strongly restricted | penetrometer resistance above ~2 MPa | [estimate] | [Bengough et al. 2011](https://doi.org/10.1093/jxb/erq350) |

### Misconceptions

- "Erosion is a dramatic gully." Most loss is invisible sheet erosion, a millimetre at a time.
- "Compaction is fixed by one deep rip." Loosened subsoil can re-compact quickly without biology and traffic control.
- "Salty soil just needs more water." Without drainage, irrigation makes it worse.

### Visually explorable

- A field after a storm: a sheet of topsoil sliding off a slope into a muddy river (living backdrop); a gully appearing over seasons.
- A tractor wheel pressing a pore network flat; roots bending at a plough pan.
- White salt crusts rising with evaporation; clay dispersing into milky water when sodium arrives.

### In-world interactions

- **"Rain on bare vs covered"** (T1): raindrop splash dislodges aggregates; cover absorbs it.
- **"Heavy wheels"** (T2): choose machinery and timing (wet or dry soil); watch macropores vanish; watch the next rainfall pond.
- **"Irrigate the desert"** (T3): water with and without drainage over decades; salinity climbs; yield drops.

**Tier**: T1–T3.

---

## Chapter 17 — Management: tillage, cover crops, rotation, residues and inputs

### Core ideas

1. **Tillage** buries residues, loosens soil temporarily, controls weeds and warms seedbeds. It also breaks aggregates and hyphal networks, exposes protected SOM to decomposition, and raises erosion risk. **No-till/reduced tillage** reduces erosion and builds surface aggregation, but yields can fall in some contexts, especially in the first years and in humid climates — [Pittelkow et al. 2015](https://doi.org/10.1038/nature13809).
2. **No-till and soil carbon**: gains are often a **redistribution** toward the surface rather than more carbon in the whole profile. Climate mitigation claims are frequently overstated — [Powlson et al. 2014](https://doi.org/10.1038/nclimate2292); [Ogle et al. 2019](https://doi.org/10.1038/s41598-019-47861-7).
3. **Cover crops** protect soil from erosion, capture leftover nitrate, feed soil life between cash crops, and (legumes) fix N. Their effect on **SOC stocks** is positive on average in meta-analyses, but likely smaller than widely claimed once sampling depth and equivalent soil mass are handled properly — [Poeplau & Don 2015](https://doi.org/10.1016/j.agee.2014.10.024); [Chaplot & Smith 2023](https://doi.org/10.1111/gcb.16917).
4. **Rotation** breaks pest and pathogen cycles, diversifies root inputs and spreads risk. Short rotations of the same crop or family can cause **yield decline** through host-specific pathogens and negative plant–soil feedback — [Bennett et al. 2012](https://doi.org/10.1111/j.1469-185X.2011.00184.x); [van der Putten et al. 2013](https://doi.org/10.1111/1365-2745.12054).
5. **Residue management**: returning residues feeds SOM and soil life but can immobilise N (high C:N) and carry over pathogens. Removing them for bioenergy or bedding exports carbon and nutrients.
6. **Inputs**: fertiliser, lime, manure, compost and biologicals. Each acts through the mechanisms in Chapters 5–15, and none acts universally.
7. **Management is G×E×M**: outcomes depend on genotype × environment × management together. A practice that works in one soil and climate may not in another. This is why benchmarks and trials matter more than rules of thumb (the Soilytix modelling stance; see Chapter 19).

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| No-till yield effect across 5,463 paired observations | on average lower yields (~ −5.7 %), smaller in dry climates, with residue retention and rotation | [estimate] | [Pittelkow et al. 2015](https://doi.org/10.1038/nature13809) |
| Cover-crop SOC sequestration (meta-analysis) | ≈ 0.32 ± 0.08 t C ha⁻¹ yr⁻¹ | [contested] | [Poeplau & Don 2015](https://doi.org/10.1016/j.agee.2014.10.024) |
| Same, after stricter study selection | much smaller (re-analysis argues ≈ 0.03 t ha⁻¹ yr⁻¹ in a subset of trials) | [contested] | [Chaplot & Smith 2023](https://doi.org/10.1111/gcb.16917) |
| No-till profile SOC | often redistribution rather than net gain | [contested] | [Powlson et al. 2014](https://doi.org/10.1038/nclimate2292); [Ogle et al. 2019](https://doi.org/10.1038/s41598-019-47861-7) |
| Earthworm presence and yield | ≈ +25 % on average, context-dependent | [estimate] | [van Groenigen et al. 2014](https://doi.org/10.1038/srep06365) |

### Misconceptions

- "Regenerative practice X always increases yield and carbon." Effects are conditional; some trade off.
- "No-till sequesters lots of carbon." Often not in the whole profile.
- "There is one best rotation." The best rotation depends on pathogens, markets, climate and soil.
- "A soil health score tells you what to do." Indicators describe; decisions need context-specific evidence — [Lehmann et al. 2020](https://doi.org/10.1038/s43017-020-0080-8).

### Visually explorable

- A field-scale **season wheel**: crops, cover crops, residues and tillage events cycling, with the underground world responding (hyphae torn by tillage, regrowing; worm channels; residue piles).
- Side-by-side "twin fields" with different management, both visible, linked to the same underground world.

### In-world interactions

- **"Twin fields"** (T2): one practice changed, everything else held equal. Compare erosion, nitrate leaching, aggregates and SOC trajectories over compressed years.
- **"Context flips the answer"** (T3): run the same practice in a dry vs humid climate and in sand vs clay; watch the sign change for yield or SOC.
- **"What would you measure?"** (T4): choose measurements and sampling depth to test a claimed SOC gain. Shallow sampling "finds" carbon that a whole-profile, equivalent-soil-mass comparison does not.

**Tier**: T2–T4.

---

## Chapter 18 — How soil is measured

### Core ideas

1. **Sampling is the first measurement.** Soil varies at every scale, so where, how deep, how many cores and when all dominate the result. Bacterial communities show spatial structure even at the centimetre scale — [O'Brien et al. 2016](https://doi.org/10.1111/1462-2920.13231). Protocol consistency beats instrument sophistication.
2. **Physical**: texture by pipette or hydrometer (sedimentation, Stokes' law) or laser diffraction. The methods disagree systematically, especially for clay, so the method must be reported. Bulk density by core; aggregate stability by wet sieving or slaking; water retention by pressure plates — [Kellogg Soil Survey Laboratory Methods Manual](https://www.nrcs.usda.gov/resources/guides-and-instructions/kellogg-soil-survey-laboratory-methods-manual); [Eshel et al. 2004](https://doi.org/10.2136/sssaj2004.0736).
3. **Chemical**: pH (in water vs CaCl₂ or KCl: different numbers for the same soil), CEC, extractable nutrients (Olsen, Bray, Mehlich — again method-specific), total C and N by combustion, SOM by loss on ignition — [Kellogg Methods Manual](https://www.nrcs.usda.gov/resources/guides-and-instructions/kellogg-soil-survey-laboratory-methods-manual).
4. **Biological processes and pools**: soil respiration and the CO₂ burst after rewetting; microbial biomass by chloroform fumigation–extraction; enzyme activities; potential N mineralisation; PLFA profiles — [Vance et al. 1987](https://doi.org/10.1016/0038-0717(87)90052-6); [Cornell CASH manual](https://soilhealth.cals.cornell.edu/manual/).
5. **Molecular**:
   - **qPCR** counts copies of a target gene (e.g. 16S rRNA, a pathogen marker, *amoA*). It needs proper standards and reporting (MIQE) — [Bustin et al. 2009](https://doi.org/10.1373/clinchem.2008.112797).
   - **Amplicon sequencing** (16S for prokaryotes, ITS for fungi, 18S for eukaryotes) gives *relative* composition as amplicon sequence variants (ASVs) — [Callahan et al. 2017](https://doi.org/10.1038/ismej.2017.119).
   - **Shotgun metagenomics** gives all DNA: genes and pathways (including BGCs), at higher cost and with heavy dependence on reference databases.
   - **Metatranscriptomics / proteomics / metabolomics** move closer to *activity*.
6. **Known biases**: DNA extraction efficiency; primer bias; 16S gene copy number varies between taxa (1 to >15 copies) and cannot be reliably corrected — [Louca et al. 2018](https://doi.org/10.1186/s40168-018-0420-9); relic DNA from dead cells — [Carini et al. 2016](https://doi.org/10.1038/nmicrobiol.2016.242); function prediction from 16S (PICRUSt-type tools) gives hypotheses, not measurements — [Douglas et al. 2020](https://doi.org/10.1038/s41587-020-0548-6).
7. **Compositionality**: sequencing returns a fixed-size sample of reads, so counts are *proportions*. If one taxon doubles, all others appear to fall. Correlations between relative abundances are unreliable, and analysis must use ratios or log-ratios, or anchor to absolute abundance with spike-ins or qPCR — [Gloor et al. 2017](https://doi.org/10.3389/fmicb.2017.02224); [Morton et al. 2019](https://doi.org/10.1038/s41467-019-10656-5); [Smets et al. 2016](https://doi.org/10.1016/j.soilbio.2016.02.003).

### Numbers

| Fact | Value | Confidence | Source |
| --- | --- | --- | --- |
| Relic DNA share | ~40 % on average; inflates richness up to 55 % | [estimate] | [Carini et al. 2016](https://doi.org/10.1038/nmicrobiol.2016.242) |
| 16S copy number range per genome | ~1 to 15+ | [firm] | [Louca et al. 2018](https://doi.org/10.1186/s40168-018-0420-9) |
| Active fraction of microbial biomass | ~0.1–2 % | [estimate] | [Blagodatskaya & Kuzyakov 2013](https://doi.org/10.1016/j.soilbio.2013.08.024) |

### Misconceptions

- "A lab number is the truth about my field." It is the truth about *that sample, by that method*.
- "Sequencing tells us who is alive and active." DNA includes dormant and dead.
- "Relative abundance went up, so the organism grew." Not necessarily: others may have declined.
- "Predicted functions are measured functions."

### Visually explorable

- A **lab bench lens**: the sample from the field world goes through sieve, extraction, PCR, sequencer, and the learner sees what is *lost or transformed* at each step (dead-cell DNA sneaks in; some cells resist lysis; primers miss a clade).
- A "jar of reads": a fixed-size jar that always fills to the brim, so a doubling of one colour visibly squeezes the others (the compositionality toy).

### In-world interactions

- **"Same soil, three labs"** (T3): pH in water vs CaCl₂; texture by hydrometer vs laser. Learners discover that the method is part of the result.
- **"The squeezing jar"** (T4): one taxon blooms; the others "decline" in relative terms; add a spike-in to reveal absolute counts.
- **"Ghost DNA"** (T4): treat a sample to remove relic DNA and see richness drop.

**Tier**: T3–T4.

---

## Chapter 19 — Measurement, derived evidence, inference, interpretation, recommendation

This is the Soilytix chapter. It turns the whole world into a lesson about **what we can claim and how confidently**.

### Core ideas

1. Five layers, kept apart:
   - **Measurement**: an observation produced by a protocol (a read count, a CO₂ flux, a pH reading), with method, date and sample provenance.
   - **Derived evidence**: calculated from measurements (log-ratios, pore diameter from potential, a diversity index, an indicator).
   - **Interpretation**: what the evidence plausibly means in context, set against a benchmark and with stated confidence.
   - **Prediction / model**: a quantitative forecast under stated assumptions, validated against held-out outcomes.
   - **Recommendation**: a decision suggestion that also weighs costs, risk and alternatives.
2. **Indicators describe; models predict.** A soil indicator says how this soil compares to a benchmark. It does not, by itself, predict yield or prescribe action — [Lehmann et al. 2020](https://doi.org/10.1038/s43017-020-0080-8).
3. **Correlation in noisy, compositional data is not mechanism.** pH-linked community shifts are strong and replicated ([Lauber et al. 2009](https://doi.org/10.1128/AEM.00335-09)), yet still need mechanism. A single-field association between a taxon and yield is weak evidence on its own — [Gloor et al. 2017](https://doi.org/10.3389/fmicb.2017.02224); [Fierer 2017](https://doi.org/10.1038/nrmicro.2017.87).
4. **Every result carries a benchmark, a confidence and a provenance.** Benchmark: compared to what? Confidence: how variable and how replicated? Provenance: which sample, method and version?
5. **The evidence ladder for a biological claim**: detection → abundance (absolute) → activity (expression or process rate) → effect in controlled test → effect in field trials across environments. Each rung is a different claim. The prototype's disease "discovery sequence" is one instance.
6. **Unknowns are legitimate answers.** Most soil taxa are undescribed; most functions are predicted, not demonstrated — [Fierer 2017](https://doi.org/10.1038/nrmicro.2017.87).

### Worked example (generic, for an in-world case file)

> A bean field world has patches of poor emergence. A sample shows DNA of a known bean pathogen at higher relative abundance in the poor patches.
>
> - *Measurement*: read counts per ASV; qPCR copies of a pathogen marker gene, with method and sampling map.
> - *Derived*: log-ratio of the pathogen marker to total 16S; spatial clustering statistic.
> - *Interpretation*: "Pathogen DNA is enriched where emergence is poor (moderate confidence; n = 12 cores; one season; relic DNA not excluded)."
> - *Not supported yet*: that the pathogen caused poor emergence; that it is the virulent strain; that it is alive.
> - *Next evidence*: isolate and test virulence; a viability-PCR or RNA marker; check drainage and compaction (an alternative explanation); repeat next season.
> - *Recommendation (if any)*: conditional, cost-weighed, with alternatives.

### Visually explorable

- An **evidence ladder** object that the learner physically climbs, with each rung gated by the right kind of evidence card.
- A provenance "thread" that follows every number in the world back to its sample, method and source card. The in-world equivalent of this document's citations.

### In-world interactions

- **"Sort the statement"** (T4): drag statements into measurement / derived / interpretation / prediction / recommendation.
- **"What else could explain it?"** (T4): for each pattern, propose at least one non-biological explanation (texture, drainage, sampling date).
- **"Claim budget"** (T4): given a set of evidence cards, write the strongest claim the evidence supports, and no stronger. Feedback names overclaims explicitly.

**Tier**: T4 (with T2 entry points: "Is seeing DNA the same as seeing something alive?").

---

## Appendix A — Generic crop worlds (content only, no customer linkage)

| World | Why it teaches well | Anchor chapters | Signature exploration |
| --- | --- | --- | --- |
| **Spinach** (home world) | Non-mycorrhizal Amaranthaceae: a natural surprise. Shallow roots; sensitive to waterlogging; seed production adds a flowering and seed phase | 2, 3, 4, 8, 9, 13 | "A world beneath a spinach plant": water films, root exudates, protist grazing |
| **Pea** and **bush bean** (separate presets) | Nodules and rhizobia specificity; host-specific soilborne diseases (e.g. *Aphanomyces* on pea; *Fusarium*, *Rhizoctonia*, *Pythium* broadly); rotation carry-over | 7, 12, 14, 17 | "What lived here last season?" |
| **Sugar beet** | Non-mycorrhizal; high-C:N leaves vs crowns for immobilisation; a published *Rhizoctonia*-suppressive soil — [Mendes et al. 2011](https://doi.org/10.1126/science.1203980) | 10, 11, 14 | "Why is nitrogen temporarily unavailable?" and "Transfer the shield" |
| **Rice** (paddy) | Redox ladder, methane, N loss pathways, salinity; a deliberately contrasting habitat | 4, 11, 16 | "Ride the redox elevator" |
| **Forest litter world** (later) | O horizon, EcM, enchytraeids, invasive earthworms, the contested networks debate | 1, 6, 7, 9 | "A different reference world" |

Crop-specific numerical thresholds (e.g. a disease score cut-off) must **not** become universal game rules.

---

## Appendix B — Misconception bank (for feedback scripts)

| # | Misconception | Correct idea | Chapter |
| --- | --- | --- | --- |
| M1 | Soil is inert dirt | A habitat holding perhaps ~59 % of species | 0 |
| M2 | Topsoil regenerates quickly | Centuries per few cm; plough erosion is 10–100× faster | 1, 16 |
| M3 | Texture can be fixed by management | Texture is near-permanent; structure is manageable | 2 |
| M4 | Wet is good | Water and oxygen trade off | 3, 4 |
| M5 | Anaerobic means dead | Different metabolism (redox ladder) | 4 |
| M6 | pH 7 is ideal for all | Crop- and soil-specific optima | 5 |
| M7 | Humus is a stable special substance | Continuum; POM/MAOM; mineral protection | 6 |
| M8 | Microbes are germs / good vs bad | Context-dependent roles | 7 |
| M9 | Everything is active | Mostly dormant; ~0.1–2 % active | 0, 7 |
| M10 | Fungi = mushrooms | Hyphal networks; mushrooms are fruiting bodies | 7 |
| M11 | Oomycetes are fungi | Oomycetes are protists (stramenopiles) | 7, 14 |
| M12 | Earthworms are always good | Invasive in some forests | 7 |
| M13 | Trees talk through the wood wide web | Largely unsupported in popular form | 9 |
| M14 | All crops are mycorrhizal | Spinach and sugar beet are not | 9 |
| M15 | Adding carbon always stores carbon | Respiration, priming, saturation | 6, 10 |
| M16 | Total N = available N | Tiny available pool; immobilisation | 11 |
| M17 | Legumes fertilise the next crop by default | Much N leaves with seed | 12 |
| M18 | P leaches like nitrate | P moves with eroded particles | 13 |
| M19 | Pathogen detected = disease | Triangle; detection is a lead | 14, 19 |
| M20 | Antibiotics evolved only to kill | Possible signalling roles | 15 |
| M21 | No-till sequesters lots of carbon | Often redistribution | 17 |
| M22 | A soil health score tells you what to do | Indicators describe, not prescribe | 17, 19 |
| M23 | DNA = alive and active | Relic DNA; dormancy | 18 |
| M24 | Relative abundance up = organism grew | Compositionality | 18, 19 |
| M25 | Correlation in microbiome data = cause | Needs mechanism and replication | 19 |

---

## Appendix C — Contested-claims register

Each item must render in-world with a visible "open question" treatment and its evidence card.

| Claim | Status | Key sources |
| --- | --- | --- |
| Common mycorrhizal networks transfer meaningful resources and signals between forest trees | Weak or unsupported in popular form | [Karst et al. 2023](https://doi.org/10.1038/s41559-023-01986-1) |
| Humic substances are a distinct stable SOM fraction | Rejected by most current SOM science | [Lehmann & Kleber 2015](https://doi.org/10.1038/nature16069) |
| Glomalin is an AMF-specific aggregate glue | Assay not specific | [Gillespie et al. 2011](https://doi.org/10.1016/j.soilbio.2010.12.010) |
| No-till substantially mitigates climate change | Overstated | [Powlson et al. 2014](https://doi.org/10.1038/nclimate2292) |
| Cover crops sequester ~0.3 t C ha⁻¹ yr⁻¹ | Likely overstated | [Chaplot & Smith 2023](https://doi.org/10.1111/gcb.16917) |
| 4 per 1000 is achievable at scale | Debated | [Minasny et al. 2017](https://doi.org/10.1016/j.geoderma.2017.01.002) |
| Temperature sensitivity of stable SOM equals or exceeds that of labile SOM | Debated | [Davidson & Janssens 2006](https://doi.org/10.1038/nature04514) |
| Microbial necromass is ~half of SOC | Method-dependent (biomarker conversion factors) | [Liang et al. 2019](https://doi.org/10.1111/gcb.14781) |
| Antibiotics are primarily weapons in soil | Open; signalling hypothesis | [Davies et al. 2006](https://doi.org/10.1007/s10295-006-0112-5) |
| Peak phosphorus is imminent | Debated | [Cordell et al. 2009](https://doi.org/10.1016/j.gloenvcha.2008.10.009) |
| Exudation is 5–21 % of photosynthate | Wide, method-dependent | [Bais et al. 2006](https://doi.org/10.1146/annurev.arplant.57.032905.105159) |
| Soil holds 59 % of species | Estimate ± 15 %, dominated by microbial taxa | [Anthony et al. 2023](https://doi.org/10.1073/pnas.2304663120) |

---

## Appendix D — Quick-reference numbers (for UI copy)

| Quantity | Value | Use in world | Source |
| --- | --- | --- | --- |
| Bacteria per gram | 10⁸–10⁹ | organism card | [NRCS Primer](https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer) |
| Virus-like particles per gram | 10⁸–10¹⁰ | organism card | [Williamson et al. 2017](https://doi.org/10.1146/annurev-virology-101416-041639) |
| Mycorrhizal hyphae per gram | tens of metres | hyphae lens | [Leake et al. 2004](https://doi.org/10.1139/b04-060) |
| Nematodes on Earth | 4.4 × 10²⁰ | organism card | [van den Hoogen et al. 2019](https://doi.org/10.1038/s41586-019-1418-6) |
| Clay size | < 2 µm | grain ruler | [Soil Survey Manual](https://www.nrcs.usda.gov/resources/guides-and-instructions/soil-survey-manual) |
| Pore holding water at −33 / −1,500 kPa | ≈ 9 / 0.2 µm | water lens | *derived*, [Or et al. 2007](https://doi.org/10.1016/j.advwatres.2006.05.025) |
| O₂ diffusion water vs air | 10⁴× slower | air lens | [Keiluweit et al. 2017](https://doi.org/10.1038/s41467-017-01406-6) |
| Rhizosphere width | ~0.5–4 mm | root lens | [Kuzyakov & Razavi 2019](https://doi.org/10.1016/j.soilbio.2019.05.011) |
| Soil C (1 m) | ~1,500 Pg | carbon lens | [Scharlemann et al. 2014](https://doi.org/10.4155/cmt.13.77) |
| Soil respiration | ~98 Pg C yr⁻¹ | carbon lens | [Bond-Lamberty & Thomson 2010](https://doi.org/10.1038/nature08930) |
| Haber–Bosch N | ~120 Tg N yr⁻¹ | N lens | [Fowler et al. 2013](https://doi.org/10.1098/rstb.2013.0164) |
| AM plant species | 72 % | mycorrhiza lens | [Brundrett & Tedersoo 2018](https://doi.org/10.1111/nph.14976) |
| Salt-affected land | 10.7 % of land | degradation lens | [FAO 2024](https://www.fao.org/newsroom/detail/fao-launches-first-major-global-assessment-of-salt-affected-soils-in-50-years/en) |
| Degraded soils | ~33 % | degradation lens | [FAO 2015](https://openknowledge.fao.org/handle/20.500.14283/i5199e) |
| Relic DNA | ~40 % | lab lens | [Carini et al. 2016](https://doi.org/10.1038/nmicrobiol.2016.242) |

---

## Appendix E — Suggested learning path (knowledge-gated)

Progression unlocks by **demonstrated explanation**, not by clicks or points. No leaderboard; no universal score.

1. **Surface** (T1): Ch 0 zoom dial → Ch 1 read the wall → Ch 2 feel test → Ch 7 field cards → Ch 6 "Where did the leaf go?"
2. **Explorer** (T2): Ch 3 drain the cave → Ch 4 after the downpour → Ch 8 follow the root inputs → Ch 11 nitrogen relay → Ch 12 knock knock → Ch 9 root exchange → Ch 14 disease triangle → Ch 16 rain on bare vs covered
3. **Naturalist** (T3): Ch 10 prime suspect → Ch 13 reach or release → Ch 14 transfer the shield → Ch 17 context flips the answer → Ch 15 neighbour's toolkit → Ch 18 same soil, three labs
4. **Analyst** (T4): Ch 18 squeezing jar and ghost DNA → Ch 19 sort the statement → claim budget → Ch 9 myth or evidence → Ch 14 detection to proof

Each unlock requires a short **explain** step: connect cause cards into a chain, or predict a new case (transfer). This follows the proposal's notice → predict → change → observe → explain → retry loop.

---

## Appendix F — Open questions for scientific review

1. Should the world show quantitative rates (e.g. % of carbon remaining after one year) or only qualitative comparisons? Current recommendation: qualitative + ranges, with a "numbers" lens for T3+.
2. Which classification to show (WRB vs USDA Soil Taxonomy)? Recommendation: WRB, as the international standard for a European company.
3. How to depict uncertainty visually and consistently (texture, opacity, dashed links)? Needs a design-system decision.
4. Several numbers here are cited from syntheses whose underlying ranges are wide (microarthropod and enchytraeid densities, exudation fraction, transfer percentages for suppressive soils). A domain reviewer should confirm before they appear in UI copy.
5. The rhizobial species names for bean (Chapter 12) are simplified; confirm the taxonomy a reviewer wants to show.
6. Licensing: the Brady & Weil structure is referenced, but no figures or text may be copied. FAO and JRC materials carry their own licences (FAO: typically CC BY-NC-SA 3.0 IGO). Check before reusing any image.
7. **Link verification (2026-10-06).** All 100+ DOIs were resolved against Crossref, and their titles were checked against the cited claim; six wrong DOIs were corrected. Pages on `nrcs.usda.gov` timed out from the build environment and could not be re-verified. The Soil Biology Primer URL was confirmed via search results; the NRCS C:N ratio fact sheet PDF (Chapter 11) should be checked by hand before its numbers enter UI copy.
