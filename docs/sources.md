---
title: "Soil Worlds — Sources"
description: "Bibliography with stable ids. Every fact in content files cites one or more ids from this list."
status: draft — scientific review pending
date: 2026-10-06
---

# Soil Worlds — Sources

This is the bibliography for Soil Worlds. Each source has a **stable id**. Content files cite these ids in `sources: [...]`, and nothing else. `src/content/sources.ts` is the machine-readable registry. The content-lint test (backlog T03) fails in two cases:

- a content file cites an id that is not in `sources.ts`;
- `sources.ts` contains an id that has no row here.

## Rules

- **Ids are permanent.** Never rename or reuse one. If a source turns out to be wrong, mark it `withdrawn` in the Status column and keep the row. Content that cites it then fails the lint until it is re-sourced.
- **Id format:** `firstauthor-year[-keyword]`, lowercase ASCII with hyphens. Agencies and series use a short slug, e.g. `nrcs-soil-biology-primer`.
- **Reuse** column:
  - `ref`: we may state facts from it in our own words.
  - `ref-no-figures`: facts only. Its figures and text are never copied.
  - `cc-by`, `cc-by-sa`, `pd`: its figures may be adapted under that licence, with attribution. CC BY-SA adaptations are kept as standalone figures (see art-direction.md §7).
- **Status** column:
  - `doi-checked`: the curriculum research resolved the DOI against Crossref on 2026-10-06 and matched the title to the claim.
  - `url-checked`: the curriculum research checked the URL on 2026-10-06.
  - `verify`: the link or a detail is not yet checked. The source may be cited in `draft` content, but content citing it cannot reach `approved` until the row is checked.
  - `withdrawn`.
- **Ch** column: chapter numbers as in `world-bible.md` (P = prologue, ★ = optional chapter, X = cross-cutting).
- The internal vault notes listed in `docs/research/internal-assets.md` §5 are **maps, not citations**. They never appear here. Re-source each claim to a primary or textbook source.

## 1. Textbooks, primers, agency references

| id | Citation | Link | Reuse | Status | Ch |
|---|---|---|---|---|---|
| `weil-brady-2017` | Weil, R. R. & Brady, N. C. (2017). *The Nature and Properties of Soils*, 15th ed. Pearson. | https://www.pearson.com/en-us/subject-catalog/p/nature-and-properties-of-soils-the/P200000000825/9780137516933 | ref-no-figures | url-checked | X |
| `nrcs-soil-biology-primer` | USDA NRCS / SWCS. *Soil Biology Primer*. | https://www.nrcs.usda.gov/resources/education-and-teaching-materials/soil-biology-primer | ref (uncredited graphics: pd with credit; credited photos need SWCS permission) | url-checked | P, 6, 7, 8 |
| `fao-2020-soil-biodiversity` | FAO, ITPS, GSBI, CBD & EC (2020). *State of knowledge of soil biodiversity — Status, challenges and potentialities*. | https://doi.org/10.4060/cb1928en | ref-no-figures (CC BY-NC-SA 3.0 IGO, NC conflicts) | doi-checked | 6 |
| `jrc-2016-gsba` | Orgiazzi, A. et al. (eds.) (2016). *Global Soil Biodiversity Atlas*. European Commission JRC / GSBI. | https://esdac.jrc.ec.europa.eu/content/global-soil-biodiversity-atlas | cc-by (EU-owned material only; third-party photos excluded) | url-checked | 6, 11 |
| `nrcs-soil-survey-manual` | USDA NRCS / Soil Science Division Staff. *Soil Survey Manual* (Handbook 18). | https://www.nrcs.usda.gov/resources/guides-and-instructions/soil-survey-manual | pd | verify (nrcs.usda.gov timed out on recheck) | 1, 11 |
| `nrcs-field-book` | Schoeneberger, P. J. et al. *Field Book for Describing and Sampling Soils*. USDA NRCS. | https://www.nrcs.usda.gov/resources/guides-and-instructions/field-book-for-describing-and-sampling-soils | pd | verify | 1, 11 |
| `wrb-2022` | IUSS Working Group WRB (2022). *World Reference Base for Soil Resources*, 4th ed. | https://www.isric.org/sites/default/files/WRB_fourth_edition_2022-12-18.pdf | ref-no-figures | url-checked | 5, 11 |
| `fao-2015-swsr` | FAO & ITPS (2015). *Status of the World's Soil Resources*. | https://openknowledge.fao.org/handle/20.500.14283/i5199e | ref-no-figures | url-checked | 11, 13 |
| `sssa-know-soil` | Soil Science Society of America (2012). *Know Soil, Know Life*, and educator's guide. | https://www.soils4teachers.org/books | ref-no-figures | url-checked | P, 1 |
| `soils4teachers-basics` | SSSA. *Soil Basics*, Soils4Teachers. | https://www.soils4teachers.org/soil-basics | ref-no-figures | url-checked | P |
| `jenny-1941` | Jenny, H. (1941). *Factors of Soil Formation*. McGraw-Hill. | (book; orientation via `nrcs-soil-survey-manual`) | ref | verify | 11 |
| `kellogg-lab-methods` | USDA NRCS. *Kellogg Soil Survey Laboratory Methods Manual*. | https://www.nrcs.usda.gov/resources/guides-and-instructions/kellogg-soil-survey-laboratory-methods-manual | pd | verify | 14 |
| `cornell-cash-manual` | Moebius-Clune, B. N. et al. *Comprehensive Assessment of Soil Health* (Cornell). | https://soilhealth.cals.cornell.edu/manual/ | ref-no-figures | url-checked | 1, 14 |
| `cornell-fs22-cec` | Cornell Nutrient Management Spear Program. *Agronomy Fact Sheet 22: Cation Exchange Capacity*. | http://nmsp.cals.cornell.edu/publications/factsheets/factsheet22.pdf | ref-no-figures | url-checked | 5 |
| `cornell-awc` | Cornell Soil Health Lab. *Available Water Capacity* (fact sheet 05). | https://soilhealthlab.cals.cornell.edu/files/2021/11/05_AWC.pdf | ref-no-figures | url-checked | 3 |
| `meter-paw-note` | METER Group. *Plant available water* application note. | https://publications.metergroup.com/Application%20Notes/AN_PlantAvailableWater.pdf | ref-no-figures | url-checked | 3 |
| `nrcs-cn-ratios` | USDA NRCS (2011). *Carbon to Nitrogen Ratios in Cropping Systems*. | https://www.nrcs.usda.gov/sites/default/files/2022-10/nrcs142p2_052823.pdf | pd | verify (curriculum flagged: check by hand before numbers enter UI) | 2, 9 |
| `umn-n-cycle-2025` | University of Minnesota Extension (2025). *The nitrogen cycle: N transformations in soil*. | https://blog-crop-news.extension.umn.edu/2025/04/the-nitrogen-cycle-n-transformations-in.html | ref-no-figures | verify | 9 |
| `fao-soil-food-webs` | FAO. *Soil food webs* (Soil biodiversity thematic pages). | https://www.fao.org/agriculture/crops/thematic-sitemap/theme/spi/soil-biodiversity/soil-organisms/soil-food-webs/en/ | ref-no-figures | verify | 6 |
| `usda-hb60` | Richards, L. A. (ed.) (1954). *Diagnosis and Improvement of Saline and Alkali Soils*, USDA Handbook 60. | https://www.ars.usda.gov/arsuserfiles/20360500/hb60_pdf/hb60complete.pdf | pd | url-checked | 13 |
| `fao-2024-salt` | FAO (2024). Global assessment of salt-affected soils, news release. | https://www.fao.org/newsroom/detail/fao-launches-first-major-global-assessment-of-salt-affected-soils-in-50-years/en | ref-no-figures | url-checked | 13 |
| `soil-atlas-2015` | Heinrich Böll Stiftung & IASS (2015). *Soil Atlas*. | https://www.boell.de/en/2015/01/05/bodenatlas-daten-und-fakten-ueber-acker-land-und-erde | cc-by-sa (3.0 Unported) | url-checked | 12, 13 |
| `ipcc-ar6-wg1-ch7` | Forster, P. et al. (2021). Ch. 7, *The Earth's energy budget, climate feedbacks and climate sensitivity*. IPCC AR6 WG1. | https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-7/ | ref-no-figures | url-checked | 4, 9 |
| `darwin-1881` | Darwin, C. (1881). *The Formation of Vegetable Mould through the Action of Worms*. John Murray. | http://darwin-online.org.uk/content/frameset?itemID=F1357&viewtype=text&pageseq=1 | pd | url-checked | 6 |
| `van-helmont-willow` | van Helmont's willow experiment (published posthumously in 1648 in *Ortus Medicinae*), as retold in plant-physiology history. | (secondary retelling to be chosen; e.g. Hershey, D. R. (2003), "Misconceptions about Helmont's willow experiment", *Plant Science Bulletin* 49(3)) | ref | verify (author added; not in research) | P |

## 2. Primary literature and reviews

These DOIs come from `docs/research/curriculum.md`, which checked them on 2026-10-06, unless the Status column says otherwise.

| id | Citation | Link | Reuse | Status | Ch |
|---|---|---|---|---|---|
| `anthony-2023` | Anthony, M. A., Bender, S. F. & van der Heijden, M. G. A. (2023). Enumerating soil biodiversity. *PNAS* 120, e2304663120. | https://doi.org/10.1073/pnas.2304663120 | ref | doi-checked | P, 6 |
| `raynaud-nunan-2014` | Raynaud, X. & Nunan, N. (2014). Spatial ecology of bacteria at the microscale in soil. *PLoS ONE* 9, e87217. | https://doi.org/10.1371/journal.pone.0087217 | cc-by | doi-checked | P, 1 |
| `torsvik-1990` | Torsvik, V., Goksøyr, J. & Daae, F. L. (1990). High diversity in DNA of soil bacteria. *Appl. Environ. Microbiol.* 56, 782–787. | https://doi.org/10.1128/aem.56.3.782-787.1990 | ref | doi-checked | P |
| `torsvik-ovreas-2002` | Torsvik, V. & Øvreås, L. (2002). Microbial diversity and function in soil: from genes to ecosystems. *Curr. Opin. Microbiol.* 5, 240–245. | https://doi.org/10.1016/S1369-5274(02)00324-7 | ref | doi-checked | P |
| `roesch-2007` | Roesch, L. F. W. et al. (2007). Pyrosequencing enumerates and contrasts soil microbial diversity. *ISME J* 1, 283–290. | https://doi.org/10.1038/ismej.2007.53 | ref | doi-checked | P |
| `young-crawford-2004` | Young, I. M. & Crawford, J. W. (2004). Interactions and self-organization in the soil-microbe complex. *Science* 304, 1634–1637. | https://doi.org/10.1126/science.1097394 | ref | doi-checked | P, 1 |
| `blagodatskaya-kuzyakov-2013` | Blagodatskaya, E. & Kuzyakov, Y. (2013). Active microorganisms in soil: critical review of estimation criteria and approaches. *Soil Biol. Biochem.* 67, 192–211. | https://doi.org/10.1016/j.soilbio.2013.08.024 | ref | doi-checked | P, 6, 14 |
| `lennon-jones-2011` | Lennon, J. T. & Jones, S. E. (2011). Microbial seed banks: the ecological and evolutionary implications of dormancy. *Nat. Rev. Microbiol.* 9, 119–130. | https://doi.org/10.1038/nrmicro2504 | ref | doi-checked | P, 6 |
| `verheijen-2009` | Verheijen, F. G. A. et al. (2009). Tolerable versus actual soil erosion rates in Europe. *Earth-Sci. Rev.* 94, 23–38. | https://doi.org/10.1016/j.earscirev.2009.02.003 | ref | doi-checked | 11, 13 |
| `montgomery-2007` | Montgomery, D. R. (2007). Soil erosion and agricultural sustainability. *PNAS* 104, 13268–13272. | https://doi.org/10.1073/pnas.0611508104 | ref | doi-checked | 11, 13 |
| `tisdall-oades-1982` | Tisdall, J. M. & Oades, J. M. (1982). Organic matter and water-stable aggregates in soils. *J. Soil Sci.* 33, 141–163. | https://doi.org/10.1111/j.1365-2389.1982.tb01755.x | ref | doi-checked | 1 |
| `six-2004` | Six, J. et al. (2004). A history of research on the link between (micro)aggregates, soil biota, and soil organic matter dynamics. *Soil Tillage Res.* 79, 7–31. | https://doi.org/10.1016/j.still.2004.03.008 | ref | doi-checked | 1, 2, 12 |
| `hartmann-six-2022` | Hartmann, M. & Six, J. (2022). Soil structure and microbiome functions in agroecosystems. *Nat. Rev. Earth Environ.* 4, 4–18. | https://doi.org/10.1038/s43017-022-00366-w | ref | doi-checked | 1 |
| `erktan-2020` | Erktan, A., Or, D. & Scheu, S. (2020). The physical structure of soil: determinant and consequence of trophic interactions. *Soil Biol. Biochem.* 148, 107876. | https://doi.org/10.1016/j.soilbio.2020.107876 | ref | doi-checked | 1, 6 |
| `postma-vanveen-1990` | Postma, J. & van Veen, J. A. (1990). Habitable pore space and survival of *Rhizobium leguminosarum* biovar *trifolii* introduced into soil. *Microb. Ecol.* 19, 149–161. | https://doi.org/10.1007/BF02012096 | ref | doi-checked | 1 |
| `hamza-anderson-2005` | Hamza, M. A. & Anderson, W. K. (2005). Soil compaction in cropping systems. *Soil Tillage Res.* 82, 121–145. | https://doi.org/10.1016/j.still.2004.08.009 | ref | doi-checked | P, 1, 12 |
| `thien-1979` | Thien, S. J. (1979). A flow diagram for teaching texture-by-feel analysis. *J. Agron. Educ.* 8, 54–55. | https://doi.org/10.2134/jae.1979.0054 | ref | doi-checked | 1 |
| `or-2007` | Or, D. et al. (2007). Physical constraints affecting bacterial habitats and activity in unsaturated porous media. *Adv. Water Resour.* 30, 1505–1527. | https://doi.org/10.1016/j.advwatres.2006.05.025 | ref | doi-checked | 1, 3 |
| `schimel-2018` | Schimel, J. P. (2018). Life in dry soils: effects of drought on soil microbial communities and processes. *Annu. Rev. Ecol. Evol. Syst.* 49, 409–432. | https://doi.org/10.1146/annurev-ecolsys-110617-062614 | ref | doi-checked | 3 |
| `moyano-2013` | Moyano, F. E., Manzoni, S. & Chenu, C. (2013). Responses of soil heterotrophic respiration to moisture availability: an exploration of processes and models. *Soil Biol. Biochem.* 59, 72–85. | https://doi.org/10.1016/j.soilbio.2012.12.011 | ref | verify (author added for the moisture-modifier shape; not in research) | 2, 3 |
| `keiluweit-2017` | Keiluweit, M. et al. (2017). Anaerobic microsites have an unaccounted role in soil carbon stabilization. *Nat. Commun.* 8, 1771. | https://doi.org/10.1038/s41467-017-01406-6 | cc-by | doi-checked | 2, 4 |
| `borch-2010` | Borch, T. et al. (2010). Biogeochemical redox processes and their impact on contaminant dynamics. *Environ. Sci. Technol.* 44, 15–23. | https://doi.org/10.1021/es9026248 | ref | doi-checked | 4 |
| `saunois-2020` | Saunois, M. et al. (2020). The Global Methane Budget 2000–2017. *Earth Syst. Sci. Data* 12, 1561–1623. | https://doi.org/10.5194/essd-12-1561-2020 | cc-by | doi-checked | 4 |
| `davidson-janssens-2006` | Davidson, E. A. & Janssens, I. A. (2006). Temperature sensitivity of soil carbon decomposition and feedbacks to climate change. *Nature* 440, 165–173. | https://doi.org/10.1038/nature04514 | ref | doi-checked | 2, 4 |
| `lauber-2009` | Lauber, C. L. et al. (2009). Pyrosequencing-based assessment of soil pH as a predictor of soil bacterial community structure at the continental scale. *Appl. Environ. Microbiol.* 75, 5111–5120. | https://doi.org/10.1128/AEM.00335-09 | ref | doi-checked | 5, 14 |
| `rousk-2010` | Rousk, J. et al. (2010). Soil bacterial and fungal communities across a pH gradient in an arable soil. *ISME J* 4, 1340–1351. | https://doi.org/10.1038/ismej.2010.58 | ref | doi-checked | 5 |
| `guo-2010` | Guo, J. H. et al. (2010). Significant acidification in major Chinese croplands. *Science* 327, 1008–1010. | https://doi.org/10.1126/science.1182570 | ref | doi-checked | 5 |
| `lehmann-kleber-2015` | Lehmann, J. & Kleber, M. (2015). The contentious nature of soil organic matter. *Nature* 528, 60–68. | https://doi.org/10.1038/nature16069 | ref | doi-checked | 2 |
| `schmidt-2011` | Schmidt, M. W. I. et al. (2011). Persistence of soil organic matter as an ecosystem property. *Nature* 478, 49–56. | https://doi.org/10.1038/nature10386 | ref | doi-checked | 2 |
| `lavallee-2020` | Lavallee, J. M., Soong, J. L. & Cotrufo, M. F. (2020). Conceptualizing soil organic matter into particulate and mineral-associated forms. *Glob. Change Biol.* 26, 261–273. | https://doi.org/10.1111/gcb.14859 | ref | doi-checked | 2 |
| `georgiou-2022` | Georgiou, K. et al. (2022). Global stocks and capacity of mineral-associated soil organic carbon. *Nat. Commun.* 13, 3797. | https://doi.org/10.1038/s41467-022-31540-9 | cc-by | doi-checked | 2 |
| `liang-2017` | Liang, C., Schimel, J. P. & Jastrow, J. D. (2017). The importance of anabolism in microbial control over soil carbon storage. *Nat. Microbiol.* 2, 17105. | https://doi.org/10.1038/nmicrobiol.2017.105 | ref | doi-checked | 2 |
| `kallenbach-2016` | Kallenbach, C. M., Frey, S. D. & Grandy, A. S. (2016). Direct evidence for microbial-derived soil organic matter formation. *Nat. Commun.* 7, 13630. | https://doi.org/10.1038/ncomms13630 | cc-by | doi-checked | 2 |
| `scharlemann-2014` | Scharlemann, J. P. W. et al. (2014). Global soil carbon: understanding and managing the largest terrestrial carbon pool. *Carbon Manag.* 5, 81–91. | https://doi.org/10.4155/cmt.13.77 | ref | doi-checked | 2 |
| `kochy-2015` | Köchy, M., Hiederer, R. & Freibauer, A. (2015). Global distribution of soil organic carbon, part 1. *SOIL* 1, 351–365. | https://doi.org/10.5194/soil-1-351-2015 | cc-by | doi-checked | 2 |
| `pribyl-2010` | Pribyl, D. W. (2010). A critical review of the conventional SOC to SOM conversion factor. *Geoderma* 156, 75–83. | https://doi.org/10.1016/j.geoderma.2010.02.003 | ref | doi-checked | 2 |
| `liang-2019` | Liang, C. et al. (2019). Quantitative assessment of microbial necromass contribution to soil organic matter. *Glob. Change Biol.* 25, 3578–3590. | https://doi.org/10.1111/gcb.14781 | ref | doi-checked | 2 |
| `clarholm-1985` | Clarholm, M. (1985). Interactions of bacteria, protozoa and plants leading to mineralization of soil nitrogen. *Soil Biol. Biochem.* 17, 181–187. | https://doi.org/10.1016/0038-0717(85)90113-0 | ref | doi-checked | 6, 7 |
| `bonkowski-2004` | Bonkowski, M. (2004). Protozoa and plant growth: the microbial loop in soil revisited. *New Phytol.* 162, 617–631. | https://doi.org/10.1111/j.1469-8137.2004.01066.x | ref | doi-checked | 6, 7 |
| `fierer-2017` | Fierer, N. (2017). Embracing the unknown: disentangling the complexities of the soil microbiome. *Nat. Rev. Microbiol.* 15, 579–590. | https://doi.org/10.1038/nrmicro.2017.87 | ref | doi-checked | 6, 14 |
| `williamson-2017` | Williamson, K. E. et al. (2017). Viruses in soil ecosystems: an unknown quantity within an unexplored territory. *Annu. Rev. Virol.* 4, 201–219. | https://doi.org/10.1146/annurev-virology-101416-041639 | ref | doi-checked | 6 |
| `delgado-baquerizo-2018` | Delgado-Baquerizo, M. et al. (2018). A global atlas of the dominant bacteria found in soil. *Science* 359, 320–325. | https://doi.org/10.1126/science.aap9516 | ref | doi-checked | 6 |
| `leininger-2006` | Leininger, S. et al. (2006). Archaea predominate among ammonia-oxidizing prokaryotes in soils. *Nature* 442, 806–809. | https://doi.org/10.1038/nature04983 | ref | doi-checked | 6, 9 |
| `tedersoo-2014` | Tedersoo, L. et al. (2014). Global diversity and geography of soil fungi. *Science* 346, 1256688. | https://doi.org/10.1126/science.1256688 | ref | doi-checked | 6 |
| `leake-2004` | Leake, J. et al. (2004). Networks of power and influence: the role of mycorrhizal mycelium. *Can. J. Bot.* 82, 1016–1045. | https://doi.org/10.1139/b04-060 | ref | doi-checked | 6, 8 |
| `bar-on-2018` | Bar-On, Y. M., Phillips, R. & Milo, R. (2018). The biomass distribution on Earth. *PNAS* 115, 6506–6511. | https://doi.org/10.1073/pnas.1711842115 | ref | doi-checked | 6 |
| `strickland-rousk-2010` | Strickland, M. S. & Rousk, J. (2010). Considering fungal:bacterial dominance in soils — methods, controls, and ecosystem implications. *Soil Biol. Biochem.* 42, 1385–1395. | https://doi.org/10.1016/j.soilbio.2010.05.007 | ref | doi-checked | 6 |
| `geisen-2018` | Geisen, S. et al. (2018). Soil protists: a fertile frontier in soil biology research. *FEMS Microbiol. Rev.* 42, 293–323. | https://doi.org/10.1093/femsre/fuy006 | ref | doi-checked | 6 |
| `van-den-hoogen-2019` | van den Hoogen, J. et al. (2019). Soil nematode abundance and functional group composition at a global scale. *Nature* 572, 194–198. | https://doi.org/10.1038/s41586-019-1418-6 | ref | doi-checked | 6 |
| `becher-2020` | Becher, P. G. et al. (2020). Developmentally regulated volatiles geosmin and 2-methylisoborneol attract a soil arthropod to *Streptomyces* bacteria promoting spore dispersal. *Nat. Microbiol.* 5, 821–829. | https://doi.org/10.1038/s41564-020-0697-x | ref | doi-checked | 6, ★ |
| `blouin-2013` | Blouin, M. et al. (2013). A review of earthworm impact on soil function and ecosystem services. *Eur. J. Soil Sci.* 64, 161–182. | https://doi.org/10.1111/ejss.12025 | ref | doi-checked | 6, 12 |
| `van-groenigen-2014` | van Groenigen, J. W. et al. (2014). Earthworms increase plant production: a meta-analysis. *Sci. Rep.* 4, 6365. | https://doi.org/10.1038/srep06365 | cc-by | doi-checked | 6, 12 |
| `phillips-2019` | Phillips, H. R. P. et al. (2019). Global distribution of earthworm diversity. *Science* 366, 480–485. | https://doi.org/10.1126/science.aax4851 | ref | doi-checked | 6 |
| `hendrix-2008` | Hendrix, P. F. et al. (2008). Pandora's box contained bait: the global problem of introduced earthworms. *Annu. Rev. Ecol. Evol. Syst.* 39, 593–613. | https://doi.org/10.1146/annurev.ecolsys.39.110707.173426 | ref | doi-checked | 6 |
| `pausch-kuzyakov-2018` | Pausch, J. & Kuzyakov, Y. (2018). Carbon input by roots into the soil: quantification of rhizodeposition from root to ecosystem scale. *Glob. Change Biol.* 24, 1–12. | https://doi.org/10.1111/gcb.13850 | ref | doi-checked | 7 |
| `carini-2016` | Carini, P. et al. (2016). Relic DNA is abundant in soil and obscures estimates of soil microbial diversity. *Nat. Microbiol.* 2, 16242. | https://doi.org/10.1038/nmicrobiol.2016.242 | ref | doi-checked | 6, 14 |
| `kuzyakov-razavi-2019` | Kuzyakov, Y. & Razavi, B. S. (2019). Rhizosphere size and shape: temporal dynamics and spatial stationarity. *Soil Biol. Biochem.* 135, 343–360. | https://doi.org/10.1016/j.soilbio.2019.05.011 | ref | doi-checked | 7 |
| `bais-2006` | Bais, H. P. et al. (2006). The role of root exudates in rhizosphere interactions with plants and other organisms. *Annu. Rev. Plant Biol.* 57, 233–266. | https://doi.org/10.1146/annurev.arplant.57.032905.105159 | ref | doi-checked | 7 |
| `akiyama-2005` | Akiyama, K., Matsuzaki, K. & Hayashi, H. (2005). Plant sesquiterpenes induce hyphal branching in arbuscular mycorrhizal fungi. *Nature* 435, 824–827. | https://doi.org/10.1038/nature03608 | ref | doi-checked | 7, 8 |
| `philippot-2013` | Philippot, L. et al. (2013). Going back to the roots: the microbial ecology of the rhizosphere. *Nat. Rev. Microbiol.* 11, 789–799. | https://doi.org/10.1038/nrmicro3109 | ref | doi-checked | 7 |
| `mendes-2011` | Mendes, R. et al. (2011). Deciphering the rhizosphere microbiome for disease-suppressive bacteria. *Science* 332, 1097–1100. | https://doi.org/10.1126/science.1203980 | ref | doi-checked | 7, 10 |
| `smith-2003` | Smith, S. E., Smith, F. A. & Jakobsen, I. (2003). Mycorrhizal fungi can dominate phosphate supply to plants irrespective of growth responses. *Plant Physiol.* 133, 16–20. | https://doi.org/10.1104/pp.103.024380 | ref | doi-checked | 8 |
| `brundrett-tedersoo-2018` | Brundrett, M. C. & Tedersoo, L. (2018). Evolutionary history of mycorrhizal symbioses and global host plant diversity. *New Phytol.* 220, 1108–1115. | https://doi.org/10.1111/nph.14976 | ref | doi-checked | 8 |
| `karst-2023` | Karst, J. et al. (2023). Positive citation bias and overinterpreted results lead to misinformation on common mycorrhizal networks in forests. *Nat. Ecol. Evol.* 7, 501–511. | https://doi.org/10.1038/s41559-023-01986-1 | ref | doi-checked | 8 |
| `rillig-2004` | Rillig, M. C. (2004). Arbuscular mycorrhizae, glomalin, and soil aggregation. *Can. J. Soil Sci.* 84, 355–363. | https://doi.org/10.4141/S04-003 | ref | doi-checked | 8 |
| `gillespie-2011` | Gillespie, A. W. et al. (2011). Glomalin-related soil protein contains non-mycorrhizal-related heat-stable proteins, lipids and humic materials. *Soil Biol. Biochem.* 43, 766–777. | https://doi.org/10.1016/j.soilbio.2010.12.010 | ref | doi-checked | 8 |
| `bond-lamberty-thomson-2010` | Bond-Lamberty, B. & Thomson, A. (2010). Temperature-associated increases in the global soil respiration record. *Nature* 464, 579–582. | https://doi.org/10.1038/nature08930 | ref | doi-checked | 2, 3 |
| `friedlingstein-2023` | Friedlingstein, P. et al. (2023). Global Carbon Budget 2023. *Earth Syst. Sci. Data* 15, 5301–5369. | https://doi.org/10.5194/essd-15-5301-2023 | cc-by | doi-checked | 2 |
| `kuzyakov-2010` | Kuzyakov, Y. (2010). Priming effects: interactions between living and dead organic matter. *Soil Biol. Biochem.* 42, 1363–1371. | https://doi.org/10.1016/j.soilbio.2010.04.003 | ref | doi-checked | 2 |
| `fontaine-2007` | Fontaine, S. et al. (2007). Stability of organic carbon in deep soil layers controlled by fresh carbon supply. *Nature* 450, 277–280. | https://doi.org/10.1038/nature06275 | ref | doi-checked | 2 |
| `minasny-2017` | Minasny, B. et al. (2017). Soil carbon 4 per mille. *Geoderma* 292, 59–86. | https://doi.org/10.1016/j.geoderma.2017.01.002 | ref | doi-checked | 2, 12 |
| `daims-2015` | Daims, H. et al. (2015). Complete nitrification by *Nitrospira* bacteria. *Nature* 528, 504–509. | https://doi.org/10.1038/nature16461 | ref | doi-checked | 9 |
| `van-kessel-2015` | van Kessel, M. A. H. J. et al. (2015). Complete nitrification by a single microorganism. *Nature* 528, 555–559. | https://doi.org/10.1038/nature16459 | ref | doi-checked | 9 |
| `tian-2020` | Tian, H. et al. (2020). A comprehensive quantification of global nitrous oxide sources and sinks. *Nature* 586, 248–256. | https://doi.org/10.1038/s41586-020-2780-0 | ref | doi-checked | 4, 9 |
| `fowler-2013` | Fowler, D. et al. (2013). The global nitrogen cycle in the twenty-first century. *Phil. Trans. R. Soc. B* 368, 20130164. | https://doi.org/10.1098/rstb.2013.0164 | cc-by | doi-checked | 8, 9 |
| `lassaletta-2014` | Lassaletta, L. et al. (2014). 50 year trends in nitrogen use efficiency of world cropping systems. *Environ. Res. Lett.* 9, 105011. | https://doi.org/10.1088/1748-9326/9/10/105011 | cc-by | doi-checked | 9 |
| `hoffman-2014` | Hoffman, B. M. et al. (2014). Mechanism of nitrogen fixation by nitrogenase: the next stage. *Chem. Rev.* 114, 4041–4062. | https://doi.org/10.1021/cr400641x | ref | doi-checked | 8 |
| `herridge-2008` | Herridge, D. F., Peoples, M. B. & Boddey, R. M. (2008). Global inputs of biological nitrogen fixation in agricultural systems. *Plant Soil* 311, 1–18. | https://doi.org/10.1007/s11104-008-9668-3 | ref | doi-checked | 8 |
| `oldroyd-2013` | Oldroyd, G. E. D. (2013). Speak, friend, and enter: signalling systems that promote beneficial symbiotic associations in plants. *Nat. Rev. Microbiol.* 11, 252–263. | https://doi.org/10.1038/nrmicro2990 | ref | doi-checked | 8 |
| `ott-2005` | Ott, T. et al. (2005). Symbiotic leghemoglobins are crucial for nitrogen fixation in legume root nodules but not for general plant growth and development. *Curr. Biol.* 15, 531–535. | https://doi.org/10.1016/j.cub.2005.01.042 | ref | doi-checked | 8 |
| `shen-2011` | Shen, J. et al. (2011). Phosphorus dynamics: from soil to plant. *Plant Physiol.* 156, 997–1005. | https://doi.org/10.1104/pp.111.175232 | ref | doi-checked | 8 |
| `hinsinger-2001` | Hinsinger, P. (2001). Bioavailability of soil inorganic P in the rhizosphere as affected by root-induced chemical changes. *Plant Soil* 237, 173–195. | https://doi.org/10.1023/A:1013351617532 | ref | doi-checked | 8 |
| `walker-syers-1976` | Walker, T. W. & Syers, J. K. (1976). The fate of phosphorus during pedogenesis. *Geoderma* 15, 1–19. | https://doi.org/10.1016/0016-7061(76)90066-5 | ref | doi-checked | 8, 11 |
| `cordell-2009` | Cordell, D., Drangert, J.-O. & White, S. (2009). The story of phosphorus: global food security and food for thought. *Glob. Environ. Change* 19, 292–305. | https://doi.org/10.1016/j.gloenvcha.2008.10.009 | ref | doi-checked | 8, 13 |
| `scholthof-2007` | Scholthof, K.-B. G. (2007). The disease triangle: pathogens, the environment and society. *Nat. Rev. Microbiol.* 5, 152–156. | https://doi.org/10.1038/nrmicro1596 | ref | doi-checked | 10 |
| `bennett-2012` | Bennett, A. J. et al. (2012). Meeting the demand for crop production: the challenge of yield decline in crops grown in short rotations. *Biol. Rev.* 87, 52–71. | https://doi.org/10.1111/j.1469-185X.2011.00184.x | ref | doi-checked | 10, 12 |
| `weller-2002` | Weller, D. M. et al. (2002). Microbial populations responsible for specific soil suppressiveness to plant pathogens. *Annu. Rev. Phytopathol.* 40, 309–348. | https://doi.org/10.1146/annurev.phyto.40.030402.110010 | ref | doi-checked | 10 |
| `schlatter-2017` | Schlatter, D. et al. (2017). Disease suppressive soils: new insights from the soil microbiome. *Phytopathology* 107, 1284–1297. | https://doi.org/10.1094/PHYTO-03-17-0111-RVW | ref | doi-checked | 10 |
| `carrion-2019` | Carrión, V. J. et al. (2019). Pathogen-induced activation of disease-suppressive functions in the endophytic root microbiome. *Science* 366, 606–612. | https://doi.org/10.1126/science.aaw9285 | ref | doi-checked | 10 |
| `barka-2016` | Barka, E. A. et al. (2016). Taxonomy, physiology, and natural products of Actinobacteria. *Microbiol. Mol. Biol. Rev.* 80, 1–43. | https://doi.org/10.1128/MMBR.00019-15 | ref | doi-checked | ★ |
| `van-der-meij-2017` | van der Meij, A. et al. (2017). Chemical ecology of antibiotic production by actinomycetes. *FEMS Microbiol. Rev.* 41, 392–416. | https://doi.org/10.1093/femsre/fux005 | ref | doi-checked | ★ |
| `ongena-jacques-2008` | Ongena, M. & Jacques, P. (2008). *Bacillus* lipopeptides: versatile weapons for plant disease biocontrol. *Trends Microbiol.* 16, 115–125. | https://doi.org/10.1016/j.tim.2007.12.009 | ref | doi-checked | 10, ★ |
| `raaijmakers-2010` | Raaijmakers, J. M. et al. (2010). Natural functions of lipopeptides from *Bacillus* and *Pseudomonas*: more than surfactants and antibiotics. *FEMS Microbiol. Rev.* 34, 1037–1062. | https://doi.org/10.1111/j.1574-6976.2010.00221.x | ref | doi-checked | 10, ★ |
| `frontiers-2023-bacillus-fj3` | *Bacillus subtilis* FJ3 study, *Frontiers in Plant Science* 14 (2023), 1205894. | https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2023.1205894/full | cc-by | verify (author list and title to be completed) | ★ |
| `davies-2006` | Davies, J., Spiegelman, G. B. & Yim, G. (2006). The world of subinhibitory antibiotic concentrations. *Curr. Opin. Microbiol.* 9, 445–453; cited by the curriculum as https://doi.org/10.1007/s10295-006-0112-5. | https://doi.org/10.1007/s10295-006-0112-5 | ref | verify (the DOI resolves to a *J. Ind. Microbiol. Biotechnol.* paper by Davies; reconcile the citation) | ★ |
| `ling-2015` | Ling, L. L. et al. (2015). A new antibiotic kills pathogens without detectable resistance. *Nature* 517, 455–459. | https://doi.org/10.1038/nature14098 | ref | doi-checked | ★ |
| `borrelli-2017` | Borrelli, P. et al. (2017). An assessment of the global impact of 21st century land use change on soil erosion. *Nat. Commun.* 8, 2013. | https://doi.org/10.1038/s41467-017-02142-7 | cc-by | doi-checked | 13 |
| `drusch-2012` | Drusch, M. et al. (2012). Sentinel-2: ESA's optical high-resolution mission for GMES operational services. *Remote Sens. Environ.* 120, 25–36. | https://doi.org/10.1016/j.rse.2011.11.026 | ref | doi-checked (2026-10-07) | 13 |
| `keller-2019` | Keller, T. et al. (2019). Historical increase in agricultural machinery weights enhanced soil stress levels and adversely affected soil functioning. *Soil Tillage Res.* 194, 104293. | https://doi.org/10.1016/j.still.2019.104293 | ref | doi-checked | 12, 13 |
| `bengough-2011` | Bengough, A. G. et al. (2011). Root elongation, water stress, and mechanical impedance: a review of limiting stresses and beneficial root tip traits. *J. Exp. Bot.* 62, 59–68. | https://doi.org/10.1093/jxb/erq350 | ref | doi-checked | 12, 13 |
| `pittelkow-2015` | Pittelkow, C. M. et al. (2015). Productivity limits and potentials of the principles of conservation agriculture. *Nature* 517, 365–368. | https://doi.org/10.1038/nature13809 | ref | doi-checked | 12 |
| `powlson-2014` | Powlson, D. S. et al. (2014). Limited potential of no-till agriculture for climate change mitigation. *Nat. Clim. Change* 4, 678–683. | https://doi.org/10.1038/nclimate2292 | ref | doi-checked | 12 |
| `ogle-2019` | Ogle, S. M. et al. (2019). Climate and soil characteristics determine where no-till management can store carbon in soils and mitigate greenhouse gas emissions. *Sci. Rep.* 9, 11665. | https://doi.org/10.1038/s41598-019-47861-7 | cc-by | doi-checked | 12 |
| `poeplau-don-2015` | Poeplau, C. & Don, A. (2015). Carbon sequestration in agricultural soils via cultivation of cover crops — a meta-analysis. *Agric. Ecosyst. Environ.* 200, 33–41. | https://doi.org/10.1016/j.agee.2014.10.024 | ref | doi-checked | 12 |
| `chaplot-smith-2023` | Chaplot, V. & Smith, P. (2023). Cover crops do not increase soil organic carbon stocks as much as has been claimed. *Glob. Change Biol.* 29, 6163–6169. | https://doi.org/10.1111/gcb.16917 | ref | doi-checked | 12 |
| `tonitto-2006` | Tonitto, C., David, M. B. & Drinkwater, L. E. (2006). Replacing bare fallows with cover crops in fertilizer-intensive cropping systems: a meta-analysis of crop yield and N dynamics. *Agric. Ecosyst. Environ.* 112, 58–72. | https://doi.org/10.1016/j.agee.2005.07.003 | ref | verify (author added for the chapter 12 cover-crop nitrate readout; not in research) | 12 |
| `van-der-putten-2013` | van der Putten, W. H. et al. (2013). Plant–soil feedbacks: the past, the present and future challenges. *J. Ecol.* 101, 265–276. | https://doi.org/10.1111/1365-2745.12054 | ref | doi-checked | 10, 12 |
| `lehmann-2020` | Lehmann, J. et al. (2020). The concept and future prospects of soil health. *Nat. Rev. Earth Environ.* 1, 544–553. | https://doi.org/10.1038/s43017-020-0080-8 | ref | doi-checked | 12, 14 |
| `obrien-2016` | O'Brien, S. L. et al. (2016). Spatial scale drives patterns in soil bacterial diversity. *Environ. Microbiol.* 18, 2039–2051. | https://doi.org/10.1111/1462-2920.13231 | ref | doi-checked | 14 |
| `eshel-2004` | Eshel, G. et al. (2004). Critical evaluation of the use of laser diffraction for particle-size distribution analysis. *SSSAJ* 68, 736–743. | https://doi.org/10.2136/sssaj2004.0736 | ref | doi-checked | 14 |
| `vance-1987` | Vance, E. D., Brookes, P. C. & Jenkinson, D. S. (1987). An extraction method for measuring soil microbial biomass C. *Soil Biol. Biochem.* 19, 703–707. | https://doi.org/10.1016/0038-0717(87)90052-6 | ref | doi-checked | 14 |
| `bustin-2009` | Bustin, S. A. et al. (2009). The MIQE guidelines. *Clin. Chem.* 55, 611–622. | https://doi.org/10.1373/clinchem.2008.112797 | ref | doi-checked | 14 |
| `callahan-2017` | Callahan, B. J., McMurdie, P. J. & Holmes, S. P. (2017). Exact sequence variants should replace operational taxonomic units in marker-gene data analysis. *ISME J* 11, 2639–2643. | https://doi.org/10.1038/ismej.2017.119 | ref | doi-checked | 14 |
| `louca-2018` | Louca, S., Doebeli, M. & Parfrey, L. W. (2018). Correcting for 16S rRNA gene copy numbers in microbiome surveys remains an unsolved problem. *Microbiome* 6, 41. | https://doi.org/10.1186/s40168-018-0420-9 | cc-by | doi-checked | 14 |
| `douglas-2020` | Douglas, G. M. et al. (2020). PICRUSt2 for prediction of metagenome functions. *Nat. Biotechnol.* 38, 685–688. | https://doi.org/10.1038/s41587-020-0548-6 | ref | doi-checked | 14 |
| `gloor-2017` | Gloor, G. B. et al. (2017). Microbiome datasets are compositional: and this is not optional. *Front. Microbiol.* 8, 2224. | https://doi.org/10.3389/fmicb.2017.02224 | cc-by | doi-checked | 6, 12, 14 |
| `morton-2019` | Morton, J. T. et al. (2019). Establishing microbial composition measurement standards with reference frames. *Nat. Commun.* 10, 2719. | https://doi.org/10.1038/s41467-019-10656-5 | cc-by | doi-checked | 14 |
| `smets-2016` | Smets, W. et al. (2016). A method for simultaneous measurement of soil bacterial abundances and community composition via 16S rRNA gene sequencing. *Soil Biol. Biochem.* 96, 145–151. | https://doi.org/10.1016/j.soilbio.2016.02.003 | ref | doi-checked | 14 |
| `manzoni-2012` | Manzoni, S. et al. (2012). Environmental and stoichiometric controls on microbial carbon-use efficiency in soils. *New Phytol.* 196, 79–91. | https://doi.org/10.1111/j.1469-8137.2012.04225.x | ref | doi-checked | 2 |
| `sinsabaugh-2013` | Sinsabaugh, R. L. et al. (2013). Carbon use efficiency of microbial communities: stoichiometry, methodology and modelling. *Ecol. Lett.* 16, 930–939. | https://doi.org/10.1111/ele.12113 | ref | doi-checked | 2 |
| `schimel-bennett-2004` | Schimel, J. P. & Bennett, J. (2004). Nitrogen mineralization: challenges of a changing paradigm. *Ecology* 85, 591–602. | https://doi.org/10.1890/03-8002 | ref | doi-checked | 2, 9 |
| `tecon-or-2017` | Tecon, R. & Or, D. (2017). Biophysical processes supporting the diversity of microbial life in soil. *FEMS Microbiol. Rev.* 41, 599–623. | https://doi.org/10.1093/femsre/fux039 | ref | doi-checked | P, 1, 3 |
| `young-ritz-2000` | Young, I. M. & Ritz, K. (2000). Tillage, habitat space and function of soil microbes. *Soil Tillage Res.* 53, 201–213. | https://doi.org/10.1016/S0167-1987(99)00106-3 | ref | doi-checked | P, 1 |
| `zhang-2008` | Zhang, D. et al. (2008). Rates of litter decomposition in terrestrial ecosystems: global patterns and controlling factors. *J. Plant Ecol.* 1, 85–93. | https://doi.org/10.1093/jpe/rtn002 | ref | doi-checked | 2 |
| `vandeputte-2017` | Vandeputte, D. et al. (2017). Quantitative microbiome profiling links gut community variation to microbial load. *Nature* 551, 507–511. | https://doi.org/10.1038/nature24460 | ref | doi-checked | 7, 14 |

### Full-text checks (R11)

Where a claim was checked against the source's full text, the location of the stating passage. Checked 2026-10-06 unless dated otherwise.

- `anthony-2023` (Europe PMC PMC10437432): Results, the paragraph after the virus estimates, and Fig. 2: the soil share averaged over the lower, central and upper estimates is 58.5 ± 14.7 %, excluding phage; including phage it is 20.8 ± 11 %. The 59 % is a mean of per-group shares, so it is not "dominated by microbial taxa".
- `raynaud-nunan-2014` (Europe PMC PMC3905020): Introduction, "a single gram of soil can harbour up to 10¹⁰ bacterial cells"; Results and Table 1, epifluorescence counts in thin sections give ca. 1.09 × 10⁷ to 1.16 × 10¹⁰ cells g⁻¹ (topsoil 0–30 cm mean 1.03 × 10⁹).
- `young-crawford-2004` (full text, checked 2026-10-07): p. 1634, "Biological Diversity": "the fraction of the surface area covered by soil microbes is only about 10⁻⁶ %", and "considerably less than 1%, even with the most optimistic balance of inputs". This is a share of the soil's surface area, not of its pore volume or pore space; `pore-cover` and `p-cover` now say surface. The same paragraph's "10¹² bacteria" gives no soil mass, so it is not cited for counts.
- `young-ritz-2000` (full text, checked 2026-10-07): states no occupancy figure. §3.3 (p. 205–207) covers habitable pore space: habitat is defined by the pore network (p. 205), and most cells sit in pores about three times their diameter (p. 207, citing Kilbertus 1980). It is no longer cited for the occupancy claim; it stays on the prologue reading list.
- `torsvik-ovreas-2002` (full text, checked 2026-10-07): p. 240, Introduction, "One gram of soil may harbor up to 10 billion microorganisms"; Fig. 1 caption, DAPI direct count 4.2 × 10¹⁰ cells g⁻¹ dry soil against 4.2 × 10⁶ colony-forming units g⁻¹ by plating. Cited by `p-bact-gram` for the upper end and the method dependence.

## 3. Learning-science sources

These are cited in `spec.md` and `world-bible.md` for **design rationale** only. They never appear in player-facing content.

| id | Citation | Link | Status |
|---|---|---|---|
| `ls-white-gunstone-1992` | White, R. & Gunstone, R. (1992). *Probing Understanding*. Falmer. | — | verify |
| `ls-kapur-2016` | Kapur, M. (2016). Examining productive failure, productive success, unproductive failure, and unproductive success in learning. *Educ. Psychol.* 51, 289–299. | https://doi.org/10.1080/00461520.2016.1155457 | verify |
| `ls-sinha-kapur-2021` | Sinha, T. & Kapur, M. (2021). When problem solving followed by instruction works. *Rev. Educ. Res.* 91, 761–798. | https://doi.org/10.3102/00346543211019105 | verify |
| `ls-roediger-karpicke-2006` | Roediger, H. L. & Karpicke, J. D. (2006). Test-enhanced learning. *Psychol. Sci.* 17, 249–255. | https://doi.org/10.1111/j.1467-9280.2006.01693.x | verify |
| `ls-chi-1994` | Chi, M. T. H. et al. (1994). Eliciting self-explanations improves understanding. *Cogn. Sci.* 18, 439–477. | https://doi.org/10.1207/s15516709cog1803_3 | verify |
| `ls-mayer-2020` | Mayer, R. E. (2020). *Multimedia Learning*, 3rd ed. Cambridge UP. | — | verify |
| `ls-posner-1982` | Posner, G. J. et al. (1982). Accommodation of a scientific conception. *Sci. Educ.* 66, 211–227. | https://doi.org/10.1002/sce.3730660207 | verify |
| `ls-ryan-deci-2000` | Ryan, R. M. & Deci, E. L. (2000). Self-determination theory. *Am. Psychol.* 55, 68–78. | https://doi.org/10.1037/0003-066X.55.1.68 | verify |
| `ls-hanus-fox-2015` | Hanus, M. D. & Fox, J. (2015). Assessing the effects of gamification in the classroom. *Comput. Educ.* 80, 152–161. | https://doi.org/10.1016/j.compedu.2014.08.019 | verify |
| `ls-wouters-2013` | Wouters, P. & van Oostendorp, H. (2013). A meta-analytic review of the role of instructional support in game-based learning. *Comput. Educ.* 60, 412–425. | https://doi.org/10.1016/j.compedu.2012.07.018 | verify |
| `ls-alfieri-2011` | Alfieri, L. et al. (2011). Does discovery-based instruction enhance learning? *J. Educ. Psychol.* 103, 1–18. | https://doi.org/10.1037/a0021017 | verify |
| `ls-loewenstein-1994` | Loewenstein, G. (1994). The psychology of curiosity. *Psychol. Bull.* 116, 75–98. | https://doi.org/10.1037/0033-2909.116.1.75 | verify |
| `ls-wieman-2008` | Wieman, C. E., Adams, W. K. & Perkins, K. K. (2008). PhET: simulations that enhance learning. *Science* 322, 682–683. | https://doi.org/10.1126/science.1161948 | verify |
| `ls-podolefsky-2010` | Podolefsky, N. S., Perkins, K. K. & Adams, W. K. (2010). Factors promoting engaged exploration with computer simulations. *Phys. Rev. ST PER* 6, 020117. | https://doi.org/10.1103/PhysRevSTPER.6.020117 | verify |
| `ls-hake-1998` | Hake, R. R. (1998). Interactive-engagement versus traditional methods. *Am. J. Phys.* 66, 64–74. | https://doi.org/10.1119/1.18809 | verify |
| `ls-kirschner-2006` | Kirschner, P. A., Sweller, J. & Clark, R. E. (2006). Why minimal guidance during instruction does not work. *Educ. Psychol.* 41, 75–86. | https://doi.org/10.1207/s15326985ep4102_1 | verify |

The learning-science DOIs above were filled in by the lead designer from memory. The game-design research cited the papers but not their DOIs. Check each before the pilot write-up quotes it.

## 4. Asset and image sources

These are sources of **images**, not facts. Each shipped file also gets a row in `src/assets/manifest.ts` (see art-direction.md §7).

| id | Source | Licence / terms (as found 2026-10-06) | Alter? | Allowed use |
|---|---|---|---|---|
| `img-nrcs-photo-gallery` | USDA NRCS Photo Gallery | US public domain; asks for no alteration and no implied endorsement | no | Unaltered reference photos in notebook cards |
| `img-usda-ars` | USDA ARS Image Gallery | Mostly public domain; third-party credits per image | per image | Micrographs as notebook references |
| `img-bhl` | Biodiversity Heritage Library (e.g. Haeckel 1904; `darwin-1881` plates) | Per item; confirm public domain | if PD | Engraving-style references; optional "naturalist plate" texture |
| `img-wikimedia` | Wikimedia Commons micrographs and profile photos | Per file (PD, CC0, CC BY, CC BY-SA) | per licence | Profile photos and micrographs; CC BY-SA kept isolated |
| `img-sentinel-2` | Copernicus Sentinel-2 | Free and open: "Contains modified Copernicus Sentinel data [year]" | yes | Landscape satellite inset, labelled as a measurement |
| `img-jrc-gsba` | `jrc-2016-gsba` figures | CC BY 4.0, EU-owned only | yes | Food-web and organism-group diagram references |
| `img-soil-atlas` | `soil-atlas-2015` graphics | CC BY-SA 3.0 | yes, share-alike | Standalone adapted figures only |
| `img-soilytix-authored` | Soilytix-authored SVG and brand elements (`Soil sample (Soilytix).svg`, 2025 biome vignettes, 2025 organism stipple drawings, 2026 Soilytix-palette SVGs) | Soilytix-owned | yes | Any profile |
| `img-designer-infographics` | Designer infographic set and hub harvest (2026-08-10 dump) | Designer work for Soilytix; derivative-use terms **unconfirmed** | internal only | `internal` profile only, until the terms are confirmed |
| `img-biorender` | `illustration-assets/src/biorender` | BioRender terms forbid standalone extraction; plan tier unknown | — | **Drawing reference only. Never bundled.** |
| `img-strangespecimens` | `illustration-assets/src/strangespecimens` | Beta licence; no unauthenticated surface; decorative only | — | **Not bundled by default.** Allowed only in a later, explicitly decided `internal` decorative layer. |
| `img-isric-monoliths` | ISRIC World Soil Museum | No open licence found | — | Excluded until permission is obtained |
| `font-inter`, `font-plex-mono` | Inter; IBM Plex Mono | SIL OFL 1.1 | — | UI type, licence file in repo |
