/**
 * Chapter 9 cast additions (world-bible §4): the runners of the nitrogen
 * relay. Roles in context; copy says "can", "often", "depends on".
 */
import type { Organism } from "../../schema";

export const C9_ORGANISMS: Organism[] = [
  {
    id: "nitrifier-aob",
    name: "Ammonia-oxidising bacteria",
    role: "Gain energy by turning ammonium into nitrite, the first half of nitrification.",
    group: "transformer",
    sizeRange: [0.5e-6, 2e-6],
    scales: ["aggregate", "rhizosphere"],
    eats: ["ammonium (for energy)", "CO₂ (for carbon)"],
    eatenBy: ["amoebae", "flagellates"],
    transforms: ["NH₄⁺ → NO₂⁻"],
    needs: ["oxygen", "ammonium"],
    howWeKnow: ["culture", "dna", "process"],
    facts: [
      {
        id: "aob-energy",
        text: "Nitrifiers get their energy from oxidising ammonium or nitrite and their carbon from CO₂, not from organic matter.",
        confidence: "firm",
        sources: ["umn-n-cycle-2025"],
      },
    ],
    truthTag: "schematic",
    misconceptions: ["M8"],
    reviewStatus: "draft",
  },
  {
    id: "nitrifier-aoa",
    name: "Ammonia-oxidising archaea",
    role: "Archaea that can do the same first step of nitrification as the bacteria; often more numerous by gene count.",
    group: "transformer",
    sizeRange: [0.5e-6, 1e-6],
    scales: ["aggregate", "rhizosphere"],
    eats: ["ammonium (for energy)", "CO₂ (for carbon)"],
    eatenBy: ["amoebae", "flagellates"],
    transforms: ["NH₄⁺ → NO₂⁻"],
    needs: ["oxygen", "ammonium, often at low concentrations"],
    howWeKnow: ["dna", "culture"],
    facts: [
      {
        id: "aoa-genes",
        text: "In a study of 12 soils, archaeal amoA genes outnumbered bacterial ones by up to about 3,000 to 1.",
        confidence: "estimate",
        evidence: "measured",
        sources: ["leininger-2006"],
        simplification: "Gene copies, not cells and not activity.",
      },
    ],
    truthTag: "schematic",
    misconceptions: ["M23"],
    reviewStatus: "draft",
  },
  {
    id: "comammox",
    name: "Comammox Nitrospira",
    role: "Bacteria that can carry ammonium all the way to nitrate on their own.",
    group: "transformer",
    sizeRange: [1e-6, 3e-6],
    scales: ["aggregate", "rhizosphere"],
    eats: ["ammonium and nitrite (for energy)", "CO₂ (for carbon)"],
    eatenBy: ["amoebae", "flagellates"],
    transforms: ["NH₄⁺ → NO₂⁻ → NO₃⁻ in one cell"],
    needs: ["oxygen", "ammonium"],
    howWeKnow: ["culture", "dna"],
    facts: [
      {
        id: "comammox-found",
        text: "Complete ammonia oxidation by single Nitrospira bacteria was described in 2015, overturning the textbook picture of two groups in sequence.",
        confidence: "firm",
        sources: ["daims-2015", "van-kessel-2015"],
      },
    ],
    truthTag: "schematic",
    misconceptions: ["M8"],
    reviewStatus: "draft",
  },
];
