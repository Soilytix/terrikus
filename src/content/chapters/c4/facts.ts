/** Chapter 4 facts, shared by its scenes and its cast additions. */
import type { Fact } from "../../schema";

export const F = {
  ladder: {
    id: "c4-ladder",
    text: "When oxygen runs out, soil microbes use other electron acceptors in a set order: nitrate, then manganese and iron oxides, then sulfate, then carbon dioxide, which becomes methane.",
    confidence: "firm",
    sources: ["borch-2010"],
    simplification: "In real soil the steps overlap in space and time; the game runs them one after another.",
  },
  eh: {
    id: "c4-eh",
    text: "Approximate redox potential (Eh at pH 7) where each step runs: oxygen about +350 mV, nitrate +250, manganese and iron +100 to −100, sulfate −150, methane below −200.",
    confidence: "estimate",
    evidence: "measured",
    sources: ["borch-2010"],
    simplification: "Values shift with pH and soil; read them as a ladder, not as fixed numbers.",
  },
  diffusion: {
    id: "c4-diffusion",
    text: "Oxygen diffuses about ten thousand times more slowly through water than through air, so in waterlogged soil it is used up faster than it arrives.",
    confidence: "firm",
    sources: ["weil-brady-2017"],
  },
  colour: {
    id: "c4-colour",
    text: "Under waterlogging, iron is reduced, dissolves and moves, leaving a grey matrix; where air returns it oxidises again into orange-brown mottles. Soil surveyors read these colours as a record of wetness.",
    confidence: "firm",
    sources: ["nrcs-soil-survey-manual", "weil-brady-2017"],
  },
  smell: {
    id: "c4-smell",
    text: "Sulfate-reducing microbes make hydrogen sulfide, the rotten-egg smell of flooded soil and mud.",
    confidence: "firm",
    sources: ["weil-brady-2017"],
  },
  aerenchyma: {
    id: "c4-aerenchyma",
    text: "Rice carries air down to its roots through hollow tissue (aerenchyma) and leaks some oxygen around them; the same channels carry methane up from the soil to the air.",
    confidence: "firm",
    sources: ["weil-brady-2017"],
  },
  microsites: {
    id: "c4-microsites",
    text: "Pockets without oxygen form inside soil aggregates even in well-drained soils, where respiration uses oxygen faster than it diffuses in.",
    confidence: "firm",
    sources: ["keiluweit-2017"],
    simplification:
      "The game uses round crumbs and one oxygen reach per wetness; real aggregates are irregular and their pore water changes by the hour.",
  },
  methane: {
    id: "c4-methane",
    text: "Flooded rice paddies are one of the larger human-made sources of methane, alongside livestock, fossil fuels and waste.",
    confidence: "firm",
    sources: ["saunois-2020"],
  },
  n2o: {
    id: "c4-n2o",
    text: "Most nitrous oxide comes from soils, and nitrogen added to farmland raises it. It escapes when nitrification and denitrification run incompletely, often as soils wet up and dry out.",
    confidence: "estimate",
    sources: ["tian-2020"],
    simplification: "The game's model makes N₂O only by denitrification.",
  },
  drainage: {
    id: "c4-drainage",
    text: "Draining a paddy for some days mid-season usually lowers its methane and can raise its nitrous oxide; how much of each varies with soil, climate and management.",
    confidence: "estimate",
    sources: ["saunois-2020", "tian-2020"],
    simplification: "The curves are teaching values; they show the direction of each gas, not its size.",
  },
  gwp: {
    id: "c4-gwp",
    text: "Over 100 years, a kilogram of N₂O warms about 273 times as much as a kilogram of CO₂, and a kilogram of methane from living sources about 27 times. Over 20 years, that methane counts about 80 times.",
    confidence: "firm",
    evidence: "derived",
    sources: ["ipcc-ar6-wg1-ch7"],
    simplification:
      "Choosing the time horizon is a choice of what to value, not a measurement; the game does not add the two gases up.",
  },
  probe: {
    id: "c4-probe",
    text: "A redox probe reads Eh at one depth at one moment; flooded soil varies over millimetres and over days, so one reading is a moment, not a regime.",
    confidence: "firm",
    sources: ["borch-2010"],
  },
} satisfies Record<string, Fact>;
