/**
 * Chapter P — A Handful of Soil (world-bible §6, Build phase).
 * Deviation, recorded: `p-separated` is not its own scene. The handful
 * separates in place as a drawn figure over `p-handful` (observe step), so the
 * player never loses the thing they predicted about.
 */
import type { Chapter, CodexEntry, Mission, Rumor, Scene } from "../../schema";

const POREFACT = {
  id: "p-composition-range",
  text: "About 40–60 % of a typical arable topsoil's volume is solid; the rest is pores shared by water and air.",
  confidence: "firm" as const,
  evidence: "measured" as const,
  sources: ["soils4teachers-basics" as const, "hamza-anderson-2005" as const],
  simplification:
    "45 % mineral, 5 % organic, 25 % water, 25 % air is an idealised moist loam, not a constant.",
};

export const prologue: Chapter = {
  id: "prologue",
  number: "P",
  title: "A Handful of Soil",
  hook: "Is this alive?",
  scales: ["field", "aggregate"],
  world: "spinach",
  scenes: ["p-field-dawn", "p-handful", "p-pore"],
  missions: ["p-m1", "p-m2"],
  entry: "p-field-dawn",
  sources: [
    "soils4teachers-basics",
    "hamza-anderson-2005",
    "blagodatskaya-kuzyakov-2013",
    "lennon-jones-2011",
    "nrcs-soil-biology-primer",
    "torsvik-1990",
    "roesch-2007",
    "young-crawford-2004",
    "raynaud-nunan-2014",
    "anthony-2023",
  ],
  after: [],
  playable: true,
  reviewStatus: "draft",
};

const truthField = {
  drawnFrom: ["Spinach rosettes and row spacing: generic seed-crop field"],
  schematic: ["Light, hills and hedges are painted mood, not a real site"],
  invented: ["The field, its geometry and the weather"],
  notSimulated: ["Plant growth", "Weather"],
};

export const prologueScenes: Scene[] = [
  {
    id: "p-field-dawn",
    chapter: "prologue",
    title: "The spinach field at dawn",
    scale: "field",
    recipe: "field-dawn",
    seed: 11,
    scaleBar: { metres: 1, label: "1 m" },
    description:
      "A spinach seed field at first light. Rows of low green rosettes run toward a hedge; mist lies in the furrows and the sky is pale gold. In the foreground, a patch of bare, crumbly soil between two rows.",
    truth: truthField,
    up: "valley",
    objects: [
      {
        id: "handful",
        label: "Pick up a handful",
        kind: "portal",
        anchor: { x: 0.5, y: 0.78 },
        to: "p-handful",
      },
      {
        id: "spinach",
        label: "Spinach rosette",
        kind: "scan",
        anchor: { x: 0.27, y: 0.6 },
        scan: "Spinach grows here for seed. Its roots have no fungal partner at all: spinach belongs to a plant family that does not form mycorrhiza. Keep that in mind for later.",
        facts: [
          {
            id: "spinach-nonmyc",
            text: "Spinach and beet belong to the Amaranthaceae, a family that is typically non-mycorrhizal.",
            confidence: "firm",
            sources: ["brundrett-tedersoo-2018"],
          },
        ],
      },
      {
        id: "mist",
        label: "Mist in the furrows",
        kind: "scan",
        anchor: { x: 0.74, y: 0.5 },
        scan: "Cool night air pooled in the low furrows. By noon this water will have gone back to the air or into the soil.",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "p-handful",
    chapter: "prologue",
    title: "A handful",
    scale: "field",
    recipe: "handful",
    seed: 23,
    scaleBar: { metres: 0.01, label: "1 cm" },
    description:
      "A cupped handful of dark, crumbly loam held over the field. Crumbs of different sizes, a pale root thread, a fleck of old leaf.",
    truth: {
      drawnFrom: ["Crumb structure of an arable loam"],
      schematic: ["The composition figure: volumes drawn as stacked layers"],
      invented: ["This exact handful"],
      notSimulated: ["Drying while you hold it"],
    },
    up: "p-field-dawn",
    objects: [
      {
        id: "crumb",
        label: "A crumb",
        kind: "scan",
        anchor: { x: 0.43, y: 0.5 },
        scan: "Crumbs are aggregates: mineral grains glued together by roots, fungal threads and microbial slime. Between and inside them are gaps.",
      },
      {
        id: "pore-portal",
        label: "Zoom into a pore (×100)",
        kind: "portal",
        anchor: { x: 0.56, y: 0.44 },
        to: "p-pore",
        requires: "p-m1-done",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "p-pore",
    chapter: "prologue",
    title: "Inside a pore",
    scale: "aggregate",
    recipe: "pore",
    seed: 37,
    scaleBar: { metres: 100e-6, label: "100 µm" },
    notToScale: 4,
    description:
      "Amber mineral grains with dark gaps between them. A glistening film of water lines the grains. A single rod-shaped bacterium rests in the film; an amoeba spreads slowly nearby; a fungal thread arches across an air-filled gap.",
    truth: {
      drawnFrom: ["Grain and pore geometry after thin-section images", "Organism shapes after microscopy"],
      schematic: ["Cells are drawn 4× larger than true size so you can see them"],
      invented: ["The arrangement of this pore"],
      notSimulated: ["Diffusion of food", "Cell division"],
    },
    up: "p-handful",
    objects: [
      {
        id: "bacterium",
        label: "Bacterium",
        kind: "scan",
        anchor: { x: 0.46, y: 0.6 },
        card: "bacteria-dormant",
        scan: "It is not moving, not dividing, barely using energy. This one is dormant. Most cells here are asleep.",
      },
      {
        id: "amoeba",
        label: "Amoeba",
        kind: "scan",
        anchor: { x: 0.7, y: 0.42 },
        card: "amoeba",
        scan: "An amoeba, about 30 µm across, flowing along the water film. It hunts bacteria. Later, you can become one.",
      },
      {
        id: "hypha",
        label: "Fungal thread",
        kind: "scan",
        anchor: { x: 0.26, y: 0.32 },
        card: "fungi-sap",
        scan: "A fungal hypha crosses an air-filled gap that no bacterium could swim across.",
      },
      {
        id: "grain",
        label: "Mineral grain",
        kind: "scan",
        anchor: { x: 0.18, y: 0.72 },
        card: "mineral-grains",
        scan: "A sand grain: broken rock, fixed in size for centuries. The soil's skeleton.",
      },
      {
        id: "film",
        label: "Water film",
        kind: "scan",
        anchor: { x: 0.58, y: 0.75 },
        card: "water-film",
        scan: "A film of water a few micrometres thick. Swimmers and dissolved food move only where it is continuous.",
      },
    ],
    reviewStatus: "draft",
  },
];

export const prologueMissions: Mission[] = [
  {
    id: "p-m1",
    chapter: "prologue",
    title: "How much of this is rock?",
    tier: "T1",
    learningObjective: "Soil is about half solids and half pore space, shared by water and air.",
    misconceptionsTargeted: ["M1", "M28"],
    scene: "p-handful",
    steps: [
      {
        kind: "notice",
        text: "You hold a handful of crumbly loam from the spinach field. It feels solid in your hand.",
        cta: "Look closer",
      },
      {
        kind: "predict-slider",
        id: "p-m1-solid",
        question: "What share of this handful's volume is solid: mineral grains and organic matter?",
        min: 0,
        max: 100,
        unit: "%",
      },
      {
        kind: "observe-composition",
        text: "The handful separates by volume.",
        resultText:
          "About 40–60 % solid in a typical arable topsoil. The drawing shows an idealised moist loam: 45 % mineral, 5 % organic, 25 % water, 25 % air. An idealisation, not a constant.",
        facts: [POREFACT],
      },
      {
        kind: "explain-choice",
        id: "p-m1-rest",
        question: "So where does the rest of the volume go?",
        choices: [
          {
            id: "water-air",
            label: "Water and air, in the gaps",
            ok: true,
            feedback:
              "Yes. The gaps are pores, and water and air share them. That share changes every time it rains.",
          },
          {
            id: "nothing",
            label: "Nowhere: it is empty",
            ok: false,
            feedback:
              "Not empty: the pores are full of something you cannot see. Squeeze a wet handful and water comes out; the rest is air.",
            misconception: "M1",
          },
          {
            id: "roots",
            label: "Roots",
            ok: false,
            feedback:
              "Roots run through pores, but they take up only a small part of the volume. Most of the gap space is water and air.",
          },
        ],
      },
      {
        kind: "reactive-water-air",
        text: "If this soil is wetter, water takes space from air. Drag the water share and watch what happens. The solids stay fixed.",
      },
      {
        kind: "chains",
        text: "Here is your first cause chain, fully worked. Read it and confirm it if your slider showed the same thing.",
        chains: ["p-water-air"],
      },
      {
        kind: "discover",
        text: "Half of soil is space.",
        discoveries: ["d-p-half-space"],
        cards: ["pore-space", "mineral-grains"],
        codex: ["cx-p-handful"],
      },
    ],
    sources: ["soils4teachers-basics", "hamza-anderson-2005"],
    simplificationNotes: ["45/5/25/25 is shown as an idealised loam with the range beside it."],
    reviewStatus: "draft",
  },
  {
    id: "p-m2",
    chapter: "prologue",
    title: "Zoom in",
    tier: "T1",
    learningObjective: "Scale changes everything; most microbes in a handful are dormant.",
    misconceptionsTargeted: ["M9", "M1"],
    scene: "p-pore",
    steps: [
      {
        kind: "go",
        text: "A pore in the crumb is pulsing. Take the portal down one rung of the ladder.",
        scene: "p-pore",
        object: "pore-portal",
      },
      {
        kind: "scan",
        text: "You are 100 times smaller. Scan the bacterium, the amoeba and the fungal thread.",
        objects: ["bacterium", "amoeba", "hypha"],
      },
      {
        kind: "discover",
        text: "Most of what lives here is asleep, and most of the habitat is empty.",
        discoveries: ["d-p-scale-100", "d-p-sleepers"],
        cards: ["bacteria-dormant", "amoeba", "fungi-sap"],
        codex: ["cx-p-sleepers", "cx-p-ladder"],
      },
      {
        kind: "rumor",
        rumor: "r-p-starving",
        text: "Look again at the bacterium. It sits right next to a fleck of food, and it is not eating. Why? Your notebook keeps the question.",
      },
    ],
    sources: ["blagodatskaya-kuzyakov-2013", "lennon-jones-2011", "young-crawford-2004"],
    simplificationNotes: ["Cells are drawn 4× enlarged; the badge says so."],
    reviewStatus: "draft",
  },
];

export const prologueCodex: CodexEntry[] = [
  {
    id: "cx-p-handful",
    title: "What a handful is made of",
    chapter: "prologue",
    body: [
      "By volume, a typical topsoil is roughly half solid and half pore space. The solids are mostly mineral grains (sand, silt, clay) with a few percent of organic matter. The pores hold water and air in proportions that change with every rain and every dry spell.",
      "Life takes up a tiny fraction of that volume, but it is everywhere: a single gram can hold on the order of a hundred million to a billion bacterial cells.",
    ],
    facts: [
      POREFACT,
      {
        id: "p-bact-gram",
        text: "10⁸–10⁹ bacterial cells per gram of fertile topsoil.",
        confidence: "firm",
        evidence: "measured",
        sources: ["nrcs-soil-biology-primer"],
        simplification: "Order of magnitude.",
      },
    ],
    realWorld: [
      {
        id: "p-species",
        text: "Soil may be home to about 59 % ± 15 % of all species on Earth, an estimate dominated by microbial taxa.",
        confidence: "contested",
        sources: ["anthony-2023"],
      },
    ],
    simplification:
      "Volumes are drawn as stacked layers; in a real crumb they interpenetrate at every scale.",
    reviewStatus: "draft",
  },
  {
    id: "cx-p-sleepers",
    title: "A seed bank of sleepers",
    chapter: "prologue",
    body: [
      "Most microbial cells in soil are dormant at any moment. They wait for water, food or warmth. Dormancy builds a seed bank: when conditions change, a different set of cells wakes.",
      "This matters for anyone reading soil DNA. A gene detected is not a process running: much of what is sequenced belongs to sleepers, and some to cells already dead.",
    ],
    facts: [
      {
        id: "p-active-share",
        text: "Typically about 0.1–2 % of microbial biomass is active at any moment.",
        confidence: "estimate",
        evidence: "inferred",
        sources: ["blagodatskaya-kuzyakov-2013"],
      },
      {
        id: "p-seedbank",
        text: "Dormancy maintains microbial diversity as a seed bank.",
        confidence: "firm",
        sources: ["lennon-jones-2011"],
      },
      {
        id: "p-cover",
        text: "Cells cover well under 1 % of pore surface.",
        confidence: "estimate",
        sources: ["young-crawford-2004", "raynaud-nunan-2014"],
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "cx-p-ladder",
    title: "The ladder of scales",
    chapter: "prologue",
    body: [
      "Soil science spans ten orders of magnitude: a valley kilometres wide, a field, a pit two metres deep, a crumb, a pore, a cell, a molecule. Things that matter at one rung are invisible at the next.",
      "Every picture in this book carries a scale bar. When something is drawn bigger than it really is, a badge says by how much.",
    ],
    facts: [
      {
        id: "p-scales",
        text: "The places where soil processes happen are small and patchy: micrometre pores decide where microbes live, and a root's zone of influence reaches only millimetres.",
        confidence: "firm",
        sources: ["young-crawford-2004", "kuzyakov-razavi-2019"],
      },
    ],
    reviewStatus: "draft",
  },
];

export const prologueRumors: Rumor[] = [
  {
    id: "r-p-starving",
    text: "This bacterium is next to food but not eating. Why?",
    chapter: "c1",
    hintsAt: ["c1"],
  },
];
