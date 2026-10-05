/** Processes with leaf-jar rules (world-bible §5). A card unlocks once its rule fired in front of you. */
import type { Material, Process } from "./schema";

export const PROCESSES: Process[] = [
  {
    id: "depolymerisation",
    name: "Depolymerisation",
    summary: "Enzymes released by microbes cut litter polymers into pieces small enough to dissolve.",
    inputs: ["L"],
    outputs: ["D"],
    conditions: ["moisture", "temperature", "oxygen", "residue quality"],
    ruleId: "depolymerisation",
    facts: [
      {
        id: "depoly-bottleneck",
        text: "Breaking big polymers into dissolvable pieces is often the slow step of decomposition.",
        confidence: "firm",
        sources: ["schmidt-2011"],
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "uptake-cue",
    name: "Uptake and carbon-use efficiency",
    summary: "Microbes take up dissolved carbon; part becomes their body, the rest is breathed out as CO₂.",
    inputs: ["D"],
    outputs: ["B", "co2Out"],
    conditions: ["residue quality", "temperature"],
    ruleId: "uptake-cue",
    facts: [
      {
        id: "cue-split",
        text: "Carbon-use efficiency is the share of taken-up carbon that becomes biomass; in soils it is often around 0.3–0.6.",
        confidence: "estimate",
        sources: ["liang-2017"],
        simplification: "The game uses fixed teaching values: 0.45 leaf, 0.35 straw, 0.30 wood.",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "maintenance-resp",
    name: "Maintenance respiration",
    summary: "Staying alive costs energy: living cells breathe out carbon even without growing.",
    inputs: ["B"],
    outputs: ["co2Out"],
    conditions: ["temperature"],
    ruleId: "maintenance-resp",
    facts: [
      {
        id: "q10",
        text: "Respiration roughly doubles for every 10 °C of warming (Q₁₀ ≈ 2), a rule of thumb; how much this applies to stable organic matter is debated.",
        confidence: "contested",
        sources: ["davidson-janssens-2006"],
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "necromass-formation",
    name: "Necromass formation",
    summary: "Dead microbial cells become food again, and part of them sticks to mineral surfaces.",
    inputs: ["B"],
    outputs: ["D", "M"],
    conditions: ["texture: how much mineral surface there is"],
    ruleId: "necromass-formation",
    facts: [
      {
        id: "carbon-pump",
        text: "Microbial remains are a major source of the organic matter held on minerals: the 'microbial carbon pump'.",
        confidence: "firm",
        sources: ["liang-2017", "kallenbach-2016"],
      },
      {
        id: "necromass-share",
        text: "In croplands, about half of soil organic carbon may be microbial remains. The estimate rests on biomarkers and depends on the method.",
        confidence: "contested",
        sources: ["liang-2019"],
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "maom-desorption",
    name: "Desorption from minerals",
    summary: "Carbon held on mineral surfaces comes loose only slowly.",
    inputs: ["M"],
    outputs: ["D"],
    conditions: ["(slow in this model)"],
    ruleId: "maom-desorption",
    facts: [
      {
        id: "maom-persist",
        text: "Mineral-associated organic matter persists for decades to centuries because surfaces protect it, not because the molecules are special.",
        confidence: "firm",
        sources: ["lavallee-2020", "lehmann-kleber-2015"],
      },
    ],
    reviewStatus: "draft",
  },
];

export const MATERIALS: Material[] = [
  {
    id: "mineral-grains",
    name: "Mineral grains",
    summary: "Sand, silt and clay: broken rock. About half of a typical topsoil's volume.",
    sizeRange: [0.1e-6, 2e-3],
    facts: [
      {
        id: "grain-sizes",
        text: "Sand grains are 0.05–2 mm, silt 0.002–0.05 mm, clay smaller than 0.002 mm (USDA classes).",
        confidence: "firm",
        sources: ["nrcs-soil-survey-manual"],
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "water-film",
    name: "Water film",
    summary: "The thin water lining every grain: the only road for swimmers and for dissolved food.",
    facts: [
      {
        id: "film-habitat",
        text: "Thin water films limit how far bacteria can move and how far dissolved food diffuses.",
        confidence: "firm",
        sources: ["or-2007"],
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "pore-space",
    name: "Pore space",
    summary: "The gaps between grains, shared between water and air.",
    facts: [
      {
        id: "half-space",
        text: "Roughly half of a typical topsoil's volume is pore space; an idealised moist loam is drawn as 45 % mineral, 5 % organic, 25 % water, 25 % air.",
        confidence: "firm",
        sources: ["soils4teachers-basics", "hamza-anderson-2005"],
        simplification: "The 45/5/25/25 split is an idealisation, not a constant.",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "leaf-litter",
    name: "Leaf litter",
    summary: "Fallen leaves: the start of the soil's food web.",
    facts: [
      {
        id: "litter-quality",
        text: "Residues with a high carbon-to-nitrogen ratio, like straw, decompose more slowly than green leaves.",
        confidence: "firm",
        sources: ["nrcs-cn-ratios"],
        simplification: "Source flagged 'verify' in docs/sources.md: numbers wait for a check by hand.",
      },
    ],
    reviewStatus: "draft",
  },
];
