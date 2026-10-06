/**
 * Chapter 2 — Where Did the Leaf Go? (world-bible §6, the first experiment chapter).
 */
import type { Chapter, ChapterBundle, Choice, CodexEntry, Mission, Rumor, Scene } from "../../schema";

const leaf: Chapter = {
  id: "leaf",
  number: "2",
  title: "Where Did the Leaf Go?",
  hook: "The leaf vanished, but the soil barely got heavier.",
  scales: ["field", "profile", "aggregate"],
  world: "spinach",
  scenes: ["c2-hedge-edge", "c2-litter", "c2-aggregate"],
  missions: ["c2-m1", "c2-m2", "c2-m3", "c2-m4", "c2-m5"],
  entry: "c2-hedge-edge",
  sources: [
    "schmidt-2011",
    "schimel-bennett-2004",
    "manzoni-2012",
    "sinsabaugh-2013",
    "zhang-2008",
    "lehmann-kleber-2015",
    "lavallee-2020",
    "georgiou-2022",
    "liang-2017",
    "kallenbach-2016",
    "liang-2019",
    "davidson-janssens-2006",
    "keiluweit-2017",
    "moyano-2013",
    "nrcs-cn-ratios",
    "bond-lamberty-thomson-2010",
    "friedlingstein-2023",
    "scharlemann-2014",
    "kuzyakov-2010",
    "fontaine-2007",
    "pribyl-2010",
  ],
  after: ["prologue"],
  playable: true,
  rumor: "r-c2-leaf",
  lens: true,
  reviewStatus: "draft",
};

const leafScenes: Scene[] = [
  {
    id: "c2-hedge-edge",
    chapter: "leaf",
    title: "The hedge at the field edge",
    scale: "field",
    recipe: "hedge-edge",
    seed: 53,
    scaleBar: { metres: 0.5, label: "50 cm" },
    description:
      "Autumn at the edge of the spinach field. A hawthorn hedge in low sun drops its leaves one by one onto bare soil beside a spinach root crown. One fallen leaf lies in the foreground.",
    truth: {
      drawnFrom: ["Hedge and field-edge structure of temperate farmland"],
      schematic: ["Falling leaves are atmosphere, not data"],
      invented: ["This hedge, this leaf"],
      notSimulated: ["Leaf fall timing", "Wind"],
    },
    up: "valley",
    objects: [
      {
        id: "leaf",
        label: "The fallen leaf",
        kind: "scan",
        anchor: { x: 0.52, y: 0.74 },
        card: "leaf-litter",
        scan: "A green-gold hedge leaf, freshly fallen. In a year or two most of it will be gone from here. The question is where it goes.",
      },
      {
        id: "crown",
        label: "Spinach root crown",
        kind: "scan",
        anchor: { x: 0.25, y: 0.66 },
        scan: "The harvested spinach left its crown and taproot behind. They will decompose too, more slowly than the leaf.",
      },
      {
        id: "portal-litter",
        label: "Kneel down to the litter (5 cm)",
        kind: "portal",
        anchor: { x: 0.66, y: 0.8 },
        to: "c2-litter",
      },
      {
        id: "bench",
        label: "Open the lab bench",
        kind: "portal",
        anchor: { x: 0.86, y: 0.7 },
        to: "#/bench/leaf-jar",
        requires: "c2-bench-open",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c2-litter",
    chapter: "leaf",
    title: "The litter layer",
    scale: "profile",
    recipe: "litter",
    seed: 71,
    scaleBar: { metres: 0.01, label: "1 cm" },
    description:
      "A cut through the top five centimetres. Layers of leaf fragments, the oldest at the bottom darkening into crumbly topsoil. White fungal threads web the fragments; a springtail sits on a leaf edge.",
    truth: {
      drawnFrom: ["Litter-layer cross-sections of arable field edges"],
      schematic: ["Hyphae drawn thicker than true"],
      invented: ["This exact section"],
      notSimulated: ["Fragmentation by animals"],
    },
    up: "c2-hedge-edge",
    objects: [
      {
        id: "fragment",
        label: "Leaf fragment",
        kind: "scan",
        anchor: { x: 0.36, y: 0.36 },
        card: "leaf-litter",
        scan: "Last year's leaf, now lace: the soft tissue is gone and the veins remain. Something has been eating it from the outside.",
      },
      {
        id: "hypha",
        label: "Fungal threads",
        kind: "scan",
        anchor: { x: 0.6, y: 0.48 },
        card: "fungi-sap",
        scan: "Fungal hyphae spread over the fragments, releasing enzymes that cut the leaf's polymers into pieces small enough to dissolve.",
      },
      {
        id: "springtail",
        label: "Springtail",
        kind: "scan",
        anchor: { x: 0.24, y: 0.3 },
        card: "springtail",
        scan: "A springtail, under 2 mm long, grazing fungal threads. It shreds as it eats.",
      },
      {
        id: "portal-aggregate",
        label: "Zoom into a pore beside a fragment (×100)",
        kind: "portal",
        anchor: { x: 0.52, y: 0.72 },
        to: "c2-aggregate",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c2-aggregate",
    chapter: "leaf",
    title: "Beside a leaf fragment",
    scale: "aggregate",
    recipe: "pore-leaf",
    seed: 89,
    scaleBar: { metres: 100e-6, label: "100 µm" },
    notToScale: 4,
    description:
      "A water-filled pore next to a dark leaf fragment. A colony of bacteria clusters at the fragment's edge; a faint plume of dissolved carbon drifts from it; tiny CO₂ bubbles rise; a clay surface below carries a thin coating.",
    truth: {
      drawnFrom: ["Microbial colonies on residue after microscopy"],
      schematic: ["Dissolved carbon drawn as a visible plume", "Cells drawn 4× enlarged"],
      invented: ["Bubble size and number"],
      notSimulated: ["Diffusion geometry"],
    },
    up: "c2-litter",
    objects: [
      {
        id: "colony",
        label: "Bacterial colony",
        kind: "scan",
        anchor: { x: 0.38, y: 0.5 },
        card: "bacteria-copio",
        scan: "Fast-growing bacteria crowd the fragment's edge, where dissolved food is richest. Each cell turns part of what it eats into body and breathes out the rest.",
      },
      {
        id: "plume",
        label: "Dissolved carbon plume",
        kind: "scan",
        anchor: { x: 0.56, y: 0.36 },
        card: "depolymerisation",
        scan: "Enzymes cut the leaf into dissolved pieces. This plume is the leaf, on its way into the microbes.",
      },
      {
        id: "clay",
        label: "Clay surface",
        kind: "scan",
        anchor: { x: 0.5, y: 0.84 },
        card: "necromass-formation",
        scan: "A clay surface. Over months, remains of dead microbes stick here, and carbon held on minerals can stay for decades.",
      },
      {
        id: "bubble",
        label: "CO₂ bubbles",
        kind: "scan",
        anchor: { x: 0.74, y: 0.26 },
        card: "uptake-cue",
        scan: "Carbon leaving as CO₂: the breath of everything decomposing the leaf.",
      },
      {
        id: "bench",
        label: "Take a sample to the lab bench",
        kind: "portal",
        anchor: { x: 0.86, y: 0.7 },
        to: "#/bench/leaf-jar",
        requires: "c2-bench-open",
      },
    ],
    reviewStatus: "draft",
  },
];

const whichFaster = (a: string, b: string, aFaster: string, bFaster: string, m?: "M4"): Choice[] => [
  { id: "a", label: `${a} (jar A)`, ok: true, feedback: aFaster },
  { id: "b", label: `${b} (jar B)`, ok: true, feedback: bFaster, ...(m ? { misconception: m } : {}) },
  { id: "same", label: "About the same", ok: true, feedback: "Run it and see whether they part ways." },
];

const leafMissions: Mission[] = [
  {
    id: "c2-m1",
    chapter: "leaf",
    title: "Follow the leaf",
    tier: "T1",
    learningObjective:
      "Decomposed matter is not destroyed: most leaves as CO₂, some becomes microbes and mineral-held carbon.",
    misconceptionsTargeted: ["M26", "M27"],
    scene: "c2-hedge-edge",
    steps: [
      {
        kind: "notice",
        text: "If this leaf disappears over the next year, where does its material go?",
        cta: "Make a prediction",
      },
      {
        kind: "predict-choice",
        id: "c2-m1-where",
        multi: true,
        question: "Choose every place you think the leaf's carbon ends up.",
        choices: [
          { id: "soil", label: "Into the soil", ok: true, feedback: "Some does, on mineral surfaces." },
          { id: "air", label: "Into the air", ok: true, feedback: "Most does, as CO₂." },
          { id: "life", label: "Into living things", ok: true, feedback: "Some does, as microbial bodies." },
          {
            id: "destroyed",
            label: "It is destroyed",
            ok: false,
            feedback: "Watch the ledger: nothing in the jar will be destroyed.",
            misconception: "M26",
          },
        ],
      },
      {
        kind: "hand-decompose",
        text: "Be the decomposer for three turns. Eat the leaf one parcel at a time and decide where each parcel goes: into your body, or out as breath.",
        turns: 3,
        cue: 0.4,
        onComplete: { flags: ["c2-bench-open"] },
      },
      {
        kind: "bench",
        bench: "leaf-jar",
        text: "Now the world does it: one leaf in a jar of moist soil, one compressed year. Run it and watch the ledger.",
        a: { water: "moist", temperature: "mild", residue: "leaf" },
      },
      {
        kind: "explain-choice",
        id: "c2-m1-explain",
        question: "Where did most of the leaf's carbon go?",
        choices: [
          {
            id: "air",
            label: "Out of the jar as CO₂",
            ok: true,
            feedback: "Yes: the breath of every decomposer. The ledger still holds all of it.",
          },
          {
            id: "destroyed",
            label: "It was destroyed",
            ok: false,
            feedback:
              "Look at the ledger: carbon accounted for is 100.0 %. Where did the CO₂ bubbles go? They left the soil, but they still exist.",
            misconception: "M26",
          },
          {
            id: "minerals",
            label: "Into the minerals",
            ok: false,
            feedback:
              "Some did, and it may stay for decades. Compare the bands: much more left as CO₂ than stuck to minerals.",
            misconception: "M15",
          },
        ],
      },
      {
        kind: "discover",
        text: "Carbon is never destroyed. Energy is different: it left as heat and did not come back.",
        discoveries: ["d-c2-conserved", "d-c2-heat"],
        cards: ["depolymerisation", "uptake-cue", "leaf-litter"],
        codex: ["cx-c2-decomposition", "cx-c2-cue"],
        onComplete: { rumors: { "r-c2-leaf": "explained" } },
      },
    ],
    sources: ["schmidt-2011", "liang-2017"],
    simplificationNotes: ["One decomposer community with fixed traits."],
    reviewStatus: "draft",
  },
  {
    id: "c2-m2",
    chapter: "leaf",
    title: "Dry versus moist",
    tier: "T2",
    learningObjective: "Moisture speeds decomposition by enabling microbial activity.",
    misconceptionsTargeted: ["M4"],
    scene: "c2-hedge-edge",
    steps: [
      {
        kind: "bench",
        bench: "leaf-jar",
        text: "Two jars, one change. Jar A is moist, jar B is dry. Everything else is the same.",
        a: { water: "moist", temperature: "mild", residue: "leaf" },
        b: { water: "dry", temperature: "mild", residue: "leaf" },
        predict: {
          id: "c2-m2-predict",
          question: "In which jar will the leaf lose mass faster?",
          choices: whichFaster(
            "Moist",
            "Dry",
            "Your prediction: moist faster. Run it.",
            "Your prediction: dry faster. Run it.",
          ),
        },
      },
      {
        kind: "chains",
        text: "Build the chain that explains your run. One card and the connectors are blank. Chains are checked together after the next two experiments.",
        chains: ["c2-chain-moisture"],
      },
    ],
    sources: ["moyano-2013"],
    simplificationNotes: ["Moisture acts through one piecewise modifier."],
    reviewStatus: "draft",
  },
  {
    id: "c2-m3",
    chapter: "leaf",
    title: "After the downpour",
    tier: "T2",
    learningObjective:
      "Water and oxygen trade off: waterlogged soil decomposes slower because O₂ runs short.",
    misconceptionsTargeted: ["M4", "M5"],
    scene: "c2-hedge-edge",
    steps: [
      {
        kind: "bench",
        bench: "leaf-jar",
        text: "A week of rain. Jar A is moist, jar B is waterlogged.",
        a: { water: "moist", temperature: "mild", residue: "leaf" },
        b: { water: "waterlogged", temperature: "mild", residue: "leaf" },
        predict: {
          id: "c2-m3-predict",
          question: "Waterlogged versus moist: which decomposes faster?",
          choices: whichFaster(
            "Moist",
            "Waterlogged",
            "Your prediction: moist faster. Run it.",
            "Your prediction: wetter is faster. Run it and see.",
            "M4",
          ),
        },
      },
      {
        kind: "explain-choice",
        id: "c2-m3-why",
        question: "Why is the waterlogged jar slower?",
        choices: [
          {
            id: "o2",
            label: "Water fills the pores and oxygen runs short",
            ok: true,
            feedback:
              "Yes. Most decomposers breathe oxygen; when water fills the pores, oxygen moves through water far more slowly than through air.",
          },
          {
            id: "drown",
            label: "Too much water drowns the leaf",
            ok: false,
            feedback: "Your run shows waterlogged jars still have plenty of water. What is missing in them?",
            misconception: "M4",
          },
          {
            id: "dead",
            label: "Nothing lives without air, so it stops",
            ok: false,
            feedback:
              "It slowed but did not stop: the waterlogged jar still lost mass. Other microbes switch to other ways of breathing (chapter 4).",
            misconception: "M5",
          },
        ],
      },
      {
        kind: "chains",
        text: "Build the waterlogging chain.",
        chains: ["c2-chain-waterlogged"],
      },
      {
        kind: "discover",
        text: "Moisture speeds decomposition, up to the point where it shuts out air.",
        discoveries: ["d-c2-moisture"],
        codex: ["cx-c2-water-air"],
      },
    ],
    sources: ["keiluweit-2017", "moyano-2013"],
    simplificationNotes: ["Oxygen is a single modifier of water-filled pore space."],
    reviewStatus: "draft",
  },
  {
    id: "c2-m4",
    chapter: "leaf",
    title: "Leaf versus straw versus twig",
    tier: "T3",
    learningObjective: "Residue quality (C:N, lignin) changes how fast decomposition goes.",
    misconceptionsTargeted: ["M15"],
    scene: "c2-hedge-edge",
    steps: [
      {
        kind: "bench",
        bench: "leaf-jar",
        text: "Same soil, same weather, different residue. Jar A gets a green leaf, jar B cereal straw. Try the woody twig too.",
        a: { water: "moist", temperature: "mild", residue: "leaf" },
        b: { water: "moist", temperature: "mild", residue: "straw" },
        predict: {
          id: "c2-m4-predict",
          question: "Which residue loses mass fastest?",
          choices: [
            { id: "leaf", label: "Green leaf", ok: true, feedback: "Your prediction: leaf fastest." },
            { id: "straw", label: "Cereal straw", ok: true, feedback: "Your prediction: straw fastest." },
            { id: "wood", label: "Woody twig", ok: true, feedback: "Your prediction: twig fastest." },
          ],
        },
      },
      {
        kind: "chains",
        text: "Build the residue chain. Then confirm all three chapter chains together.",
        chains: ["c2-chain-moisture", "c2-chain-waterlogged", "c2-chain-quality"],
      },
      {
        kind: "discover",
        text: "What the residue is made of changes how fast it goes.",
        discoveries: ["d-c2-quality"],
        cards: ["maintenance-resp", "necromass-formation", "maom-desorption"],
        codex: ["cx-c2-cn", "cx-c2-pom-maom"],
      },
    ],
    sources: ["nrcs-cn-ratios", "liang-2017"],
    simplificationNotes: ["Quality is one multiplier; real residues differ in many compounds."],
    reviewStatus: "draft",
  },
  {
    id: "c2-m5",
    chapter: "leaf",
    title: "Vault or vapour",
    tier: "T3",
    learningObjective: "Transfer: predict a new residue's fate and say what you would measure.",
    misconceptionsTargeted: ["M15", "M7"],
    scene: "c2-hedge-edge",
    steps: [
      {
        kind: "transfer",
        id: "c2-m5",
        scenario: "A woody residue lies in a cold, waterlogged soil.",
        question: "Will it follow the same chain as the leaf in your mild, moist jar?",
        choices: [
          {
            id: "slower",
            label: "Same chain, every link slower: cold, short of O₂, low quality",
            ok: true,
            feedback:
              "A defensible prediction: three brakes at once. Your runs showed each brake on its own.",
          },
          {
            id: "same",
            label: "Same speed: carbon is carbon",
            ok: false,
            feedback:
              "Your leaf, straw and twig jars held the same carbon and lost it at very different speeds.",
            misconception: "M15",
          },
          {
            id: "never",
            label: "It will never decompose",
            ok: false,
            feedback: "Slower is not stopped: your waterlogged and twig jars still lost mass.",
            misconception: "M7",
          },
          {
            id: "cannot-tell",
            label: "Cannot tell yet; I would measure first",
            ok: true,
            feedback:
              "Accepted. Uncertainty is not failure: saying what you would measure is the scientist's move.",
          },
        ],
        measure: [
          {
            id: "co2",
            label: "Soil respiration (CO₂ flux)",
            ok: true,
            feedback: "A measurement of breath. Careful: roots and old carbon breathe too.",
          },
          {
            id: "mass",
            label: "Litter mass loss in a mesh bag",
            ok: true,
            feedback: "A direct, if slow, measurement of what you care about.",
          },
          {
            id: "biomass",
            label: "Microbial biomass",
            ok: false,
            feedback: "That tells you how many microbes are there, not how fast the twig is going.",
          },
          {
            id: "nothing",
            label: "You cannot tell without measuring",
            ok: true,
            feedback: "Accepted: true, and honest.",
          },
        ],
      },
      {
        kind: "discover",
        text: "Carbon persists where it is protected, not because it is 'stable stuff'.",
        discoveries: ["d-c2-transfer", "d-c2-vault"],
        codex: ["cx-c2-necromass", "cx-c2-real-world"],
      },
    ],
    sources: ["lavallee-2020", "lehmann-kleber-2015", "kuzyakov-2010"],
    simplificationNotes: ["The transfer is judged on reasoning, not on a number."],
    reviewStatus: "draft",
  },
];

const leafCodex: CodexEntry[] = [
  {
    id: "cx-c2-decomposition",
    title: "Decomposition",
    chapter: "leaf",
    body: [
      "Decomposers cannot swallow a leaf. They release enzymes that cut its long polymers into small pieces that dissolve; they take those up; part becomes their body and the rest is breathed out as CO₂.",
      "Nothing is destroyed. Your ledger tracked every unit of carbon into the air, into microbes and onto minerals.",
    ],
    facts: [
      {
        id: "cx-depoly",
        text: "Depolymerisation by extracellular enzymes is often the rate-limiting step of decomposition.",
        confidence: "firm",
        sources: ["schimel-bennett-2004"],
      },
    ],
    simplification:
      "The game treats all decomposers as one community with fixed traits; real communities shift.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c2-cue",
    title: "Carbon-use efficiency",
    chapter: "leaf",
    body: [
      "The same carbon becomes body or breath. Carbon-use efficiency (CUE) is the share that becomes body. With a CUE of 0.4, of ten parcels eaten, four become microbes and six leave as CO₂: exactly the rule you played by hand.",
    ],
    facts: [
      {
        id: "cx-cue-range",
        text: "Soil microbial CUE is reported at about 0.3–0.6 depending on the method, and shifts with temperature and substrate.",
        confidence: "estimate",
        sources: ["manzoni-2012", "sinsabaugh-2013"],
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "cx-c2-water-air",
    title: "Water and air trade places",
    chapter: "leaf",
    body: [
      "Pores hold water or air, never more than they hold. Wetter means less air. Decomposition speeds up as a dry soil gets moist, then slows again as water shuts oxygen out. Inside a crumb, anaerobic pockets form even in soil that looks well drained.",
      "You saw the first half of this in your handful. Chapters 3 and 4 go further down both roads.",
    ],
    facts: [
      {
        id: "cx-anaerobic-microsites",
        text: "Anaerobic microsites inside aggregates can slow decomposition and protect carbon even in upland soils.",
        confidence: "estimate",
        sources: ["keiluweit-2017"],
      },
      {
        id: "cx-moisture-response",
        text: "Soil respiration rises with moisture to an optimum and falls when pores fill with water.",
        confidence: "estimate",
        sources: ["moyano-2013"],
        simplification: "Source flagged 'verify' in docs/sources.md.",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "cx-c2-cn",
    title: "What decomposers eat besides carbon",
    chapter: "leaf",
    body: [
      "A microbe's body needs nitrogen as well as carbon. Residues with a lot of carbon per unit of nitrogen, like straw, make decomposers short of nitrogen, and they slow down or take nitrogen from the soil around them (chapter 9).",
      "Microbes need roughly 24 parts carbon per part nitrogen in their diet.",
    ],
    facts: [
      {
        id: "cx-cn-24",
        text: "Soil microbes need a diet of about 24:1 C:N; residues above that tend to immobilise soil nitrogen.",
        confidence: "estimate",
        sources: ["nrcs-cn-ratios"],
        simplification: "Source flagged 'verify': the number waits for a check by hand.",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "cx-c2-pom-maom",
    title: "POM, MAOM and the humus museum",
    chapter: "leaf",
    body: [
      "Soil organic matter is a continuum of pieces, from recognisable fragments (particulate organic matter, POM) to small molecules held on mineral surfaces (mineral-associated organic matter, MAOM). MAOM persists longer because surfaces and tiny pores protect it.",
      "Mineral surfaces are finite, so a soil's capacity to hold MAOM may saturate.",
    ],
    facts: [
      {
        id: "cx-pom-maom",
        text: "Separating soil organic matter into POM and MAOM explains its persistence better than chemical 'humus' fractions.",
        confidence: "firm",
        sources: ["lavallee-2020"],
      },
      {
        id: "cx-saturation",
        text: "Mineral-associated carbon storage may approach a saturation limit set by mineral surfaces.",
        confidence: "contested",
        sources: ["georgiou-2022"],
      },
    ],
    revised: {
      old: "Humus is a special, stable substance made of large humic molecules.",
      now: "Organic matter is a continuum; persistence comes from protection and access, not molecular stability.",
      sources: ["lehmann-kleber-2015"],
    },
    reviewStatus: "draft",
  },
  {
    id: "cx-c2-necromass",
    title: "Microbial necromass",
    chapter: "leaf",
    body: [
      "The microbes that ate the leaf die too. Their remains are rich in nitrogen and stick readily to minerals, so a large part of soil organic carbon may be built from dead microbes rather than from plant pieces directly.",
    ],
    facts: [
      {
        id: "cx-pump",
        text: "Microbial remains contribute substantially to stable soil carbon (the microbial carbon pump).",
        confidence: "firm",
        sources: ["liang-2017", "kallenbach-2016"],
      },
    ],
    openQuestion: {
      claim: "About half of cropland soil organic carbon is microbial necromass.",
      sides: [
        "Biomarker (amino sugar) estimates put it near half in croplands.",
        "The estimate depends on conversion factors for those biomarkers, and other methods disagree.",
      ],
      sources: ["liang-2019"],
    },
    reviewStatus: "draft",
  },
  {
    id: "cx-c2-real-world",
    title: "In the real world: the soil breathes",
    chapter: "leaf",
    body: [
      "Your jar breathed out most of a leaf in a year. The whole planet's soils do the same with every year's litter and roots.",
      "In a real field, CO₂ from the soil also includes root respiration and old carbon released when fresh food arrives (priming). CO₂ alone does not tell you which carbon decomposed.",
    ],
    facts: [
      {
        id: "cx-rs",
        text: "Global soil respiration is about 98 Pg C per year, around ten times fossil emissions, and nearly balanced by photosynthesis.",
        confidence: "estimate",
        evidence: "derived",
        sources: ["bond-lamberty-thomson-2010", "friedlingstein-2023"],
      },
      {
        id: "cx-stock",
        text: "Soils hold about 1,500 Pg of carbon in the top metre.",
        confidence: "estimate",
        sources: ["scharlemann-2014"],
      },
      {
        id: "cx-priming",
        text: "Fresh carbon inputs can accelerate the decomposition of older soil carbon (priming).",
        confidence: "firm",
        sources: ["kuzyakov-2010", "fontaine-2007"],
      },
      {
        id: "cx-som-soc",
        text: "The old factor of 1.724 for converting organic carbon to organic matter is unreliable; about 2 fits most soils better.",
        confidence: "estimate",
        sources: ["pribyl-2010"],
      },
    ],
    reviewStatus: "draft",
  },
];

const leafRumors: Rumor[] = [
  {
    id: "r-c2-leaf",
    text: "The leaf vanished, but the soil barely got heavier.",
    chapter: "leaf",
    hintsAt: ["leaf"],
    explainedBy: "d-c2-conserved",
  },
];

export const leafBundle: ChapterBundle = {
  chapter: leaf,
  scenes: leafScenes,
  missions: leafMissions,
  codex: leafCodex,
  rumors: leafRumors,
};
