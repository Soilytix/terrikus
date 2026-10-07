/**
 * Chapter 8 cast additions (world-bible §4): the root's partners. Mutualists in
 * context: the same partnership can pay or cost, depending on the soil.
 */
import type { Organism } from "../../schema";

export const C8_ORGANISMS: Organism[] = [
  {
    id: "amf",
    name: "Arbuscular mycorrhizal fungi",
    role: "Grow into root cortex cells and trade phosphate and other nutrients for the plant's sugars; the trade can pay or cost the plant, depending on the soil.",
    group: "mutualist",
    sizeRange: [2e-6, 10e-6],
    scales: ["rhizosphere", "cell"],
    eats: ["sugars and lipids from the host plant"],
    eatenBy: ["fungus-feeding nematodes", "springtails and mites"],
    transforms: ["soil phosphate beyond the root's reach → phosphate inside the root"],
    needs: ["a host root that answers its signals", "carbon from that host: it cannot live alone"],
    howWeKnow: ["microscopy", "dna", "process"],
    facts: [
      {
        id: "amf-dominate",
        text: "In some plants the fungal pathway supplies most of the phosphate taken up, even when the plant does not grow better for it.",
        confidence: "firm",
        sources: ["smith-2003"],
      },
      {
        id: "amf-hosts",
        text: "Most land plants form arbuscular mycorrhizas, but some families, the Amaranthaceae among them, typically do not.",
        confidence: "firm",
        sources: ["brundrett-tedersoo-2018"],
        simplification: "Low or occasional colonisation is reported in these families.",
      },
    ],
    truthTag: "schematic",
    misconceptions: ["M8", "M14"],
    reviewStatus: "draft",
  },
  {
    id: "rhizobia",
    name: "Rhizobia (pea- and bean-specific partners)",
    role: "Soil bacteria that, with the right legume, enter its root and fix nitrogen from the air inside nodules; the partners must match.",
    group: "mutualist",
    sizeRange: [1e-6, 2e-6],
    scales: ["rhizosphere", "cell"],
    eats: ["sugars and organic acids, from soil or from the host inside the nodule"],
    eatenBy: ["protist grazers in the soil"],
    transforms: ["N₂ from the air → ammonium for the host, inside an effective nodule"],
    needs: ["a matching legume's flavonoid signal", "low oxygen inside the nodule"],
    howWeKnow: ["microscopy", "culture", "dna", "process"],
    facts: [
      {
        id: "rhizobia-signal",
        text: "Legume roots release flavonoids; matching rhizobia answer with Nod factors that the host must recognise before it lets them in.",
        confidence: "firm",
        sources: ["oldroyd-2013"],
      },
      {
        id: "rhizobia-lb",
        text: "Leghaemoglobin in the nodule keeps free oxygen low; without it the nodule does not fix nitrogen.",
        confidence: "firm",
        sources: ["ott-2005"],
      },
    ],
    truthTag: "schematic",
    misconceptions: ["M8", "M17"],
    reviewStatus: "draft",
  },
];
