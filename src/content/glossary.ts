/**
 * Glossary (world-bible §8.3): a term appears only after the player has seen
 * the phenomenon it names (ls-kapur-2016). `unlockedBy` is the discovery that
 * records that moment; `chapter` is where it happens. Seed terms whose chapter
 * is not built yet wait for it.
 */
import type { ChapterId, Fact, Reviewed } from "./schema";

export interface GlossaryTerm extends Reviewed {
  id: string;
  term: string;
  chapter: ChapterId;
  /** Discovery id (src/content/valley.ts) that unlocks the term. */
  unlockedBy: string;
  definition: Fact;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "g-texture",
    term: "texture",
    chapter: "prologue",
    unlockedBy: "d-p-half-space",
    definition: {
      id: "g-texture-def",
      text: "The mix of sand, silt and clay particle sizes in the mineral part of a soil. It changes over centuries, not seasons.",
      confidence: "firm",
      sources: ["weil-brady-2017"],
    },
    reviewStatus: "draft",
  },
  {
    id: "g-bulk-density",
    term: "bulk density",
    chapter: "prologue",
    unlockedBy: "d-p-half-space",
    definition: {
      id: "g-bulk-density-def",
      text: "Dry mass of soil per unit of total volume, pores included. Because so much of a topsoil is pore space, it sits well below the density of the mineral grains.",
      confidence: "firm",
      sources: ["weil-brady-2017"],
    },
    reviewStatus: "draft",
  },
  {
    id: "g-protist",
    term: "protist",
    chapter: "prologue",
    unlockedBy: "d-p-sleepers",
    definition: {
      id: "g-protist-def",
      text: "A eukaryote that is not a plant, animal or fungus. In soil many protists, such as amoebae, graze on bacteria.",
      confidence: "firm",
      sources: ["geisen-2018"],
      simplification: "Protists are a convenience grouping, not one branch of the tree of life.",
    },
    reviewStatus: "draft",
  },
  {
    id: "g-depolymerisation",
    term: "depolymerisation",
    chapter: "leaf",
    unlockedBy: "d-c2-conserved",
    definition: {
      id: "g-depolymerisation-def",
      text: "Cutting large molecules such as cellulose or protein into small pieces outside the cell, with enzymes microbes release. Often the rate-limiting step of decomposition.",
      confidence: "firm",
      sources: ["schimel-bennett-2004"],
    },
    reviewStatus: "draft",
  },
  {
    id: "g-mineralisation",
    term: "mineralisation",
    chapter: "leaf",
    unlockedBy: "d-c2-conserved",
    definition: {
      id: "g-mineralisation-def",
      text: "Turning an element from an organic form into an inorganic one as organic matter is decomposed: carbon to CO₂, nitrogen to ammonium.",
      confidence: "firm",
      sources: ["weil-brady-2017"],
    },
    reviewStatus: "draft",
  },
  {
    id: "g-cue",
    term: "CUE",
    chapter: "leaf",
    unlockedBy: "d-c2-conserved",
    definition: {
      id: "g-cue-def",
      text: "Carbon-use efficiency: the share of carbon a microbe takes up that it builds into biomass rather than breathes out. Reported at about 0.3–0.6 in soils, depending on the method.",
      confidence: "estimate",
      sources: ["manzoni-2012", "sinsabaugh-2013"],
    },
    reviewStatus: "draft",
  },
  {
    id: "g-water-filled-pore-space",
    term: "water-filled pore space",
    chapter: "leaf",
    unlockedBy: "d-c2-moisture",
    definition: {
      id: "g-wfps-def",
      text: "The share of the pore volume holding water. Respiration rises with it to an optimum, then falls as water shuts out air.",
      confidence: "estimate",
      sources: ["moyano-2013"],
    },
    reviewStatus: "draft",
  },
  {
    id: "g-anaerobic-microsite",
    term: "anaerobic microsite",
    chapter: "leaf",
    unlockedBy: "d-c2-moisture",
    definition: {
      id: "g-anaerobic-microsite-def",
      text: "A pocket without oxygen, often inside an aggregate, in a soil that is otherwise well aerated.",
      confidence: "estimate",
      sources: ["keiluweit-2017"],
    },
    reviewStatus: "draft",
  },
  {
    id: "g-cn-ratio",
    term: "C:N ratio",
    chapter: "leaf",
    unlockedBy: "d-c2-quality",
    definition: {
      id: "g-cn-ratio-def",
      text: "Mass of carbon per mass of nitrogen in a material. Soil microbes need a diet of about 24:1.",
      confidence: "estimate",
      sources: ["nrcs-cn-ratios"],
      simplification: "Source flagged 'verify': the number waits for a check by hand.",
    },
    reviewStatus: "draft",
  },
  {
    id: "g-immobilisation",
    term: "immobilisation",
    chapter: "leaf",
    unlockedBy: "d-c2-quality",
    definition: {
      id: "g-immobilisation-def",
      text: "Microbes taking inorganic nutrients such as ammonium into their biomass, so plants cannot use them for a while. Common when residue is rich in carbon and poor in nitrogen.",
      confidence: "estimate",
      sources: ["nrcs-cn-ratios", "umn-n-cycle-2025"],
    },
    reviewStatus: "draft",
  },
  {
    id: "g-pom",
    term: "POM",
    chapter: "leaf",
    unlockedBy: "d-c2-quality",
    definition: {
      id: "g-pom-def",
      text: "Particulate organic matter: fragments of plants and other organisms, still recognisable and relatively quick to turn over.",
      confidence: "firm",
      sources: ["lavallee-2020"],
    },
    reviewStatus: "draft",
  },
  {
    id: "g-maom",
    term: "MAOM",
    chapter: "leaf",
    unlockedBy: "d-c2-quality",
    definition: {
      id: "g-maom-def",
      text: "Mineral-associated organic matter: small molecules and microbial products held on clay and silt surfaces, which tends to persist far longer than POM.",
      confidence: "firm",
      sources: ["lavallee-2020"],
    },
    reviewStatus: "draft",
  },
  {
    id: "g-necromass",
    term: "necromass",
    chapter: "leaf",
    unlockedBy: "d-c2-vault",
    definition: {
      id: "g-necromass-def",
      text: "The remains of dead microbial cells. They contribute substantially to persistent soil carbon; how large that share is remains contested.",
      confidence: "firm",
      sources: ["liang-2017", "liang-2019"],
    },
    reviewStatus: "draft",
  },
  {
    id: "g-priming",
    term: "priming",
    chapter: "leaf",
    unlockedBy: "d-c2-vault",
    definition: {
      id: "g-priming-def",
      text: "A change, usually a speed-up, in the decomposition of older soil organic matter after fresh carbon is added.",
      confidence: "firm",
      sources: ["kuzyakov-2010", "fontaine-2007"],
    },
    reviewStatus: "draft",
  },
  ...(
    [
      [
        "matric-potential",
        "matric potential",
        "How tightly soil holds its water, by capillarity and adsorption: zero when soaked, more negative as it dries.",
        ["or-2007"],
      ],
      [
        "field-capacity",
        "field capacity",
        "The water left after free drainage, by convention at about −10 to −33 kPa. Its widest pores already hold air.",
        ["cornell-awc"],
      ],
      [
        "wilting-point",
        "wilting point",
        "The dryness, by convention about −1,500 kPa, at which typical crops can no longer take up water.",
        ["meter-paw-note"],
      ],
    ] as const
  ).map(([id, term, text, sources]): GlossaryTerm => ({
    id: `g-${id}`,
    term,
    chapter: "c3",
    unlockedBy: "d-c3-drain",
    definition: { id: `g-${id}-def`, text, confidence: "firm", sources: [...sources] },
    reviewStatus: "draft",
  })),
];

/** Terms the player has unlocked, alphabetically. */
export function unlockedTerms(discoveries: readonly string[]): GlossaryTerm[] {
  const seen = new Set(discoveries);
  return GLOSSARY.filter((t) => seen.has(t.unlockedBy)).sort((a, b) =>
    a.term.localeCompare(b.term, "en", { sensitivity: "base" }),
  );
}
