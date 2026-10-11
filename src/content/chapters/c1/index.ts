/**
 * Chapter 1 — The Pore Labyrinth (world-bible §6). Texture, structure, pores;
 * the amoeba avatar moves on the water-film graph in `src/sim/films.ts`.
 * Deviation, recorded: the scientist-lens porosity payoff and the two expected
 * cause chains wait for a later pass; the texture triangle is not vendored, so
 * the feel test ends at the class name.
 */
import type { ChapterBundle, CodexEntry, Fact, FlowNode, Mission, Scene } from "../../schema";
import { c1, c1Rumors } from "./chapter";

const F = {
  sizes: {
    id: "c1-grain-sizes",
    text: "Sand grains are 0.05–2 mm, silt 0.002–0.05 mm, clay smaller than 0.002 mm (USDA classes).",
    confidence: "firm",
    sources: ["nrcs-soil-survey-manual"],
  },
  surface: {
    id: "c1-surface-area",
    text: "Sand has well under 0.1 m² of surface per gram; smectite clays reach about 800 m² per gram.",
    confidence: "firm",
    sources: ["cornell-fs22-cec"],
    simplification: "Ranges for typical minerals; kaolinite clays have far less surface than smectites.",
  },
  feel: {
    id: "c1-feel-diagram",
    text: "Texture by feel: whether a moist sample forms a ball, how long a ribbon it makes before breaking, and whether it feels gritty or smooth sort it into a texture class.",
    confidence: "firm",
    sources: ["thien-1979"],
    simplification:
      "Ribbon breaks at about 2.5 and 5 cm; trained hands check themselves against lab particle-size analysis.",
  },
  permanent: {
    id: "c1-texture-permanent",
    text: "Texture changes over centuries of weathering, not seasons; tillage, roots and organic matter change structure instead.",
    confidence: "firm",
    sources: ["weil-brady-2017"],
  },
  films: {
    id: "c1-films-break",
    text: "As soil dries, water films thin and break, cutting pores off from one another for swimming cells.",
    confidence: "firm",
    sources: ["or-2007"],
  },
  refuge: {
    id: "c1-pore-refuge",
    text: "Bacteria in pores too narrow for protists to enter survive grazing better than bacteria in wide pores.",
    confidence: "estimate",
    sources: ["postma-vanveen-1990", "erktan-2020"],
    simplification:
      "The game uses one cut-off width; real amoebae squeeze and real pore necks vary along their length.",
  },
  slake: {
    id: "c1-slake",
    text: "Aggregates from soil under long-term grass usually hold together in water better than those from long-ploughed soil.",
    confidence: "firm",
    sources: ["cornell-cash-manual", "six-2004"],
    simplification:
      "The percentages are teaching values; the soil-health test measures stability under simulated rain.",
  },
  agents: {
    id: "c1-binding-agents",
    text: "Roots and fungal hyphae bind macroaggregates for months; microbial gums are transient; clay–organic bonds hold microaggregates persistently.",
    confidence: "firm",
    sources: ["tisdall-oades-1982"],
    simplification: "Three classes of binding agent stand in for a continuum.",
  },
  tillage: {
    id: "c1-tillage-breaks",
    text: "Tillage breaks macroaggregates apart and speeds the decomposition of the organic matter they held.",
    confidence: "firm",
    sources: ["six-2004", "hartmann-six-2022"],
  },
} satisfies Record<string, Fact>;

/** The Thien (1979) flow diagram, as data. */
const FEEL_DIAGRAM: FlowNode[] = [
  {
    id: "ball",
    question: "Does the moist soil stay in a ball when you squeeze it?",
    action: "Squeeze it in your palm",
    branches: [
      { id: "yes", label: "Yes", to: "ribbon" },
      { id: "no", label: "No", to: "=Sand" },
    ],
  },
  {
    id: "ribbon",
    question: "Does it form a ribbon when you push it out between thumb and finger?",
    action: "Push it into a ribbon",
    branches: [
      { id: "yes", label: "Yes", to: "length" },
      { id: "no", label: "No", to: "=Loamy sand" },
    ],
  },
  {
    id: "length",
    question: "How long does the ribbon grow before it breaks?",
    action: "Let the ribbon hang until it breaks",
    branches: [
      { id: "weak", label: "Under 2.5 cm", to: "feel-weak" },
      { id: "medium", label: "2.5 to 5 cm", to: "feel-medium" },
      { id: "strong", label: "Over 5 cm", to: "feel-strong" },
    ],
  },
  ...(
    [
      ["feel-weak", "Sandy loam", "Silt loam", "Loam"],
      ["feel-medium", "Sandy clay loam", "Silty clay loam", "Clay loam"],
      ["feel-strong", "Sandy clay", "Silty clay", "Clay"],
    ] as const
  ).map(([id, gritty, smooth, neither]) => ({
    id,
    question: "Wet a pinch and rub it. Does it feel very gritty, very smooth, or neither?",
    action: "Rub a wet pinch in your palm",
    branches: [
      { id: "gritty", label: "Very gritty", to: `=${gritty}` },
      { id: "smooth", label: "Very smooth", to: `=${smooth}` },
      { id: "neither", label: "Neither", to: `=${neither}` },
    ],
  })),
];

const truthAggregate = {
  drawnFrom: ["Grain shapes and aggregate structure after soil thin sections and textbook figures"],
  schematic: ["Sizes on the ruler are drawn to their own scale, not to each other's"],
  invented: ["This crumb and its arrangement"],
  notSimulated: ["Weathering", "Shrinking and swelling"],
};

const c1Scenes: Scene[] = [
  {
    id: "c1-grain-ruler",
    chapter: "c1",
    title: "The grain ruler",
    scale: "aggregate",
    tone: "light",
    recipe: "c1-grain-ruler",
    seed: 61,
    scaleBar: { metres: 1e-3, label: "1 mm" },
    notToScale: 50,
    description:
      "Three trays laid out along a ruler. In the first, rounded sand grains like marbles; in the second, silt as fine as flour; in the third, clay drawn as thin stacked platelets, enlarged so you can see them.",
    truth: truthAggregate,
    up: "valley",
    objects: [
      {
        id: "sand",
        label: "Sand",
        kind: "scan",
        anchor: { x: 0.2, y: 0.55 },
        card: "mineral-grains",
        scan: "Sand: grains you can see and feel, 0.05 to 2 mm. Gritty between the fingers. Little surface for their size.",
        facts: [F.sizes],
      },
      {
        id: "silt",
        label: "Silt",
        kind: "scan",
        anchor: { x: 0.5, y: 0.55 },
        scan: "Silt: like flour, smooth and silky when wet. Too small to see a single grain.",
        facts: [F.sizes],
      },
      {
        id: "clay",
        label: "Clay",
        kind: "scan",
        anchor: { x: 0.8, y: 0.55 },
        scan: "Clay: platelets under 2 µm, stacked like sheets of paper. Unrolled, one gram of some clays would carpet a large room.",
        facts: [F.surface],
      },
      {
        id: "cut-portal",
        label: "Cut open a crumb",
        kind: "portal",
        anchor: { x: 0.5, y: 0.82 },
        to: "c1-aggregate-cut",
        requires: "c1-m1-done",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c1-aggregate-cut",
    chapter: "c1",
    title: "Inside a crumb",
    scale: "aggregate",
    tone: "dark",
    recipe: "c1-aggregate-cut",
    seed: 67,
    scaleBar: { metres: 1e-3, label: "1 mm" },
    description:
      "A crumb of soil cut in half. Inside, smaller rounded clusters are packed together with gaps between them. A pale root and fine fungal threads run through it like string, tying the clusters together.",
    truth: {
      ...truthAggregate,
      schematic: ["Roots and hyphae are drawn thicker than true so they read as string"],
    },
    up: "c1-grain-ruler",
    objects: [
      {
        id: "micro",
        label: "Microaggregate",
        kind: "scan",
        anchor: { x: 0.42, y: 0.58 },
        scan: "A microaggregate, smaller than a quarter of a millimetre: clay and old organic matter stuck to silt and fine sand. These hold together for years.",
        facts: [F.agents],
      },
      {
        id: "root",
        label: "Root",
        kind: "scan",
        anchor: { x: 0.3, y: 0.3 },
        scan: "A fine root threads through the crumb and holds the clusters in a net. When it dies or is cut, that net loosens.",
        facts: [F.agents],
      },
      {
        id: "hyphae",
        label: "Fungal threads",
        kind: "scan",
        anchor: { x: 0.66, y: 0.36 },
        card: "fungi-sap",
        scan: "Fungal hyphae wrap the microaggregates like string around a parcel.",
        facts: [F.agents],
      },
      {
        id: "labyrinth-portal",
        label: "Into the pore network (×10)",
        kind: "portal",
        anchor: { x: 0.6, y: 0.66 },
        to: "c1-labyrinth",
        requires: "c1-m1-done",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c1-labyrinth",
    chapter: "c1",
    title: "The pore labyrinth",
    scale: "aggregate",
    tone: "dark",
    recipe: "c1-labyrinth",
    seed: 71,
    scaleBar: { metres: 100e-6, label: "100 µm" },
    notToScale: 4,
    description:
      "A cave of dark mineral grains, lit from within by water. Films of water line the passages between pores; one narrow neck has drained. Bacterial colonies sit in a wide pore, in a very narrow pore, and across the neck.",
    truth: {
      drawnFrom: ["Pore and water-film geometry after thin sections and pore-network diagrams"],
      schematic: [
        "The network is seven pores; a real crumb has millions",
        "Cells are drawn 4× larger than true size",
      ],
      invented: ["Pore widths, colony sizes, growth and grazing rates"],
      notSimulated: ["Diffusion of food", "Oxygen", "Encystment when films break"],
    },
    up: "c1-aggregate-cut",
    objects: [
      {
        id: "amoeba",
        label: "The amoeba (you)",
        kind: "scan",
        anchor: { x: 0.14, y: 0.56 },
        card: "amoeba",
        scan: "You. A naked amoeba about 30 µm across. You can only flow where water connects, and only into pores wider than your body.",
      },
      {
        id: "refuge",
        label: "Narrow pore",
        kind: "scan",
        anchor: { x: 0.56, y: 0.78 },
        card: "bacteria-copio",
        scan: "Bacteria in a pore a few micrometres wide. Water reaches them; you do not fit.",
      },
      {
        id: "neck",
        label: "Narrow connection",
        kind: "scan",
        anchor: { x: 0.66, y: 0.5 },
        card: "water-film",
        scan: "The film across this neck has drained. Beyond it is another colony.",
        facts: [F.films],
      },
    ],
    reviewStatus: "draft",
  },
];

const c1Missions: Mission[] = [
  {
    id: "c1-m1",
    chapter: "c1",
    title: "Feel test",
    tier: "T1",
    learningObjective: "Texture (sand, silt, clay) is near-permanent and can be read with your fingers.",
    misconceptionsTargeted: ["M3", "M29"],
    scene: "c1-grain-ruler",
    steps: [
      {
        kind: "scan",
        text: "Before you feel the soil, meet what it is made of. Scan the sand, the silt and the clay.",
        objects: ["sand", "silt", "clay"],
      },
      {
        kind: "feel-test",
        text: "A pinch of the spinach field, wetted until it is like putty. Follow the flow diagram with your fingers.",
        diagram: FEEL_DIAGRAM,
        sample: {
          ball: { branch: "yes", felt: "It holds together in a ball, like putty." },
          ribbon: { branch: "yes", felt: "A short, flat ribbon pushes out over your finger." },
          length: { branch: "weak", felt: "It breaks at about 2 cm." },
          "feel-weak": { branch: "neither", felt: "A little gritty, a little smooth: neither stands out." },
        },
        facts: [F.feel],
      },
      {
        kind: "explain-choice",
        id: "c1-m1-permanent",
        question:
          "Could the farmer turn this loam into a sandy soil by ploughing it differently for a few years?",
        choices: [
          {
            id: "no",
            label: "No: ploughing changes how grains are arranged, not which grains are there",
            ok: true,
            feedback:
              "Yes. Texture is the grains themselves, and they change over centuries. What management changes is structure: how the grains are built into crumbs.",
          },
          {
            id: "yes",
            label: "Yes: enough tillage will loosen it into sand",
            ok: false,
            feedback:
              "Tillage loosens crumbs, but each grain of clay and silt is still there. Would the ribbon be any shorter?",
            misconception: "M3",
          },
          {
            id: "should",
            label: "Yes, and it should: sand is the better soil",
            ok: false,
            feedback:
              "Sand drains and warms fast, but holds little water or nutrient. Clay does the opposite. Each texture trades one thing for another.",
            misconception: "M29",
          },
        ],
      },
      {
        kind: "discover",
        text: "Texture is what it's made of; structure is how it's built.",
        discoveries: ["d-c1-texture"],
        cards: ["mineral-grains"],
        codex: ["cx-c1-texture"],
      },
    ],
    sources: ["thien-1979", "nrcs-soil-survey-manual", "cornell-fs22-cec", "weil-brady-2017"],
    simplificationNotes: [
      "The sample answers each question for you; real hands need practice and a lab check.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c1-m2",
    chapter: "c1",
    title: "Hide from the grazer",
    tier: "T2",
    learningObjective: "Pore size and water films decide who can reach whom: small pores are refuges.",
    misconceptionsTargeted: ["M30", "M4"],
    scene: "c1-labyrinth",
    steps: [
      {
        kind: "go",
        text: "The crumb is full of gaps. Go down into the pore network.",
        scene: "c1-labyrinth",
        object: "labyrinth-portal",
      },
      {
        kind: "labyrinth",
        text: "You are the amoeba. Choose a pore and you flow there along the water films. Find the colony you can eat, the one you cannot fit into, and the one cut off by a dry neck. Wetting the soil is an experiment on the bench, not something the amoeba does.",
        goals: [
          { site: "colony", moisture: "moist", outcome: "reach" },
          { site: "refuge", moisture: "moist", outcome: "too-narrow" },
          { site: "far", moisture: "moist", outcome: "no-film" },
          { site: "far", moisture: "wet", outcome: "reach" },
        ],
      },
      {
        kind: "predict-choice",
        id: "c1-m2-refuge",
        question:
          "Now be a bacterium. You get one pore for a compressed week while the amoeba hunts in moist soil. Which pore keeps the most bacteria?",
        choices: [
          {
            id: "colony",
            label: "The wide pore: the most food",
            ok: false,
            feedback: "It has the most food. Does it have the fewest visitors?",
            misconception: "M30",
          },
          {
            id: "refuge",
            label: "The narrow pore: the amoeba cannot fit",
            ok: true,
            feedback: "Less food, but no grazer. Let's see whether safety beats food.",
          },
          {
            id: "far",
            label: "Across the neck: the film there is broken",
            ok: true,
            feedback: "A broken film is a refuge too, as long as the soil stays this dry.",
          },
        ],
      },
      {
        kind: "grazer-week",
        text: "Run the week. Each day every colony grows with its food; where the amoeba can reach, it grazes.",
        moisture: "moist",
        resultText:
          "The wide pore grew fastest and lost the most. The narrow pore kept the most bacteria: less food, but out of reach. The colony across the dry neck was safe too, until the soil gets wet.",
        facts: [F.refuge, F.films],
      },
      {
        kind: "explain-choice",
        id: "c1-m2-why",
        question: "Why did the narrow pore keep the most bacteria?",
        choices: [
          {
            id: "access",
            label: "The grazer could not get in",
            ok: true,
            feedback:
              "Yes. Pore size limits who can enter. The bacteria there grew slowly, but nothing ate them.",
          },
          {
            id: "food",
            label: "It had the most food",
            ok: false,
            feedback: "It had the least. Look at the growth before grazing: the wide pore was richer.",
          },
          {
            id: "bigger",
            label: "Bigger pores are better homes, so the bacteria there moved out",
            ok: false,
            feedback:
              "Nothing moved between pores in this run. Wide pores hold food and air, but also the hunters.",
            misconception: "M30",
          },
        ],
      },
      {
        kind: "discover",
        text: "Small pores are refuges.",
        discoveries: ["d-c1-refuge"],
        cards: ["amoeba", "water-film"],
        codex: ["cx-c1-refuges"],
      },
    ],
    sources: ["postma-vanveen-1990", "erktan-2020", "or-2007", "geisen-2018"],
    simplificationNotes: [
      "Seven pores stand in for a network; growth and grazing rates are teaching values.",
      "Movement is guided: you choose a pore and the amoeba follows the films (OD-10 pending).",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c1-m3",
    chapter: "c1",
    title: "Slake it",
    tier: "T2",
    learningObjective: "Structure is built by living things and broken by tillage; the slake test shows it.",
    misconceptionsTargeted: ["M3"],
    scene: "c1-aggregate-cut",
    steps: [
      {
        kind: "predict-choice",
        id: "c1-m3-slake",
        question:
          "Two dry crumbs of the same loam: one from a plot under grass for years, one from a plot ploughed every year. Dropped into water, which falls apart more?",
        choices: [
          { id: "ploughed", label: "The ploughed one", ok: true, feedback: "Drop them in and watch." },
          { id: "grass", label: "The grassland one", ok: false, feedback: "Drop them in and watch." },
          {
            id: "same",
            label: "Both the same: it is the same soil",
            ok: false,
            feedback: "Same texture. Is it the same structure?",
            misconception: "M3",
          },
        ],
      },
      {
        kind: "slake",
        text: "Lower both crumbs into water at the same moment.",
        resultText:
          "The ploughed crumb slumped into a cloud of grains within a minute. The grassland crumb kept most of its shape.",
        facts: [F.slake],
      },
      {
        kind: "explain-choice",
        id: "c1-m3-why",
        question: "The texture is the same. What made the grassland crumb hold?",
        choices: [
          {
            id: "binding",
            label: "Roots, fungal threads and microbial glue bound it, and nobody broke them up",
            ok: true,
            feedback: "Yes. Years without ploughing let living binders build and keep the structure.",
          },
          {
            id: "texture",
            label: "It must have more clay",
            ok: false,
            feedback: "Both crumbs come from the same loam. Texture did not change; structure did.",
            misconception: "M3",
          },
          {
            id: "drier",
            label: "It was drier to begin with",
            ok: false,
            feedback: "Both were air-dried the same way before the test.",
          },
        ],
      },
      {
        kind: "discover",
        text: "Structure is how the soil is built, and it can be broken.",
        discoveries: ["d-c1-slake"],
      },
    ],
    sources: ["cornell-cash-manual", "six-2004"],
    simplificationNotes: ["Stability percentages are teaching values with the right direction."],
    reviewStatus: "draft",
  },
  {
    id: "c1-m4",
    chapter: "c1",
    title: "Build a crumb",
    tier: "T3",
    learningObjective: "Binding agents differ in how long they last; tillage breaks the temporary ones.",
    misconceptionsTargeted: ["M3"],
    scene: "c1-aggregate-cut",
    steps: [
      {
        kind: "build-crumb",
        text: "Build a crumb from grains and binders, then run a tillage pass and wait a season. Try it with and without each binder.",
        resultText:
          "After tillage and a season, only the clay–organic bonds still held the small clusters. Roots and hyphae had been cut; the microbial glue had been eaten.",
        facts: [F.agents, F.tillage],
      },
      {
        kind: "explain-choice",
        id: "c1-m4-persist",
        question: "Which binder survived tillage and a season?",
        choices: [
          {
            id: "clay-om",
            label: "Clay–organic bonds inside the small clusters",
            ok: true,
            feedback:
              "Yes. They are persistent; the large crumb has to be rebuilt by roots and fungi each time.",
          },
          {
            id: "hyphae",
            label: "Fungal hyphae",
            ok: false,
            feedback: "The tillage pass cut them. Look at the crumb after the pass.",
          },
          {
            id: "glue",
            label: "Microbial glue",
            ok: false,
            feedback: "Microbes eat their own gums within weeks. Look at the crumb after the season.",
          },
        ],
      },
      {
        kind: "discover",
        text: "Hyphae are string.",
        discoveries: ["d-c1-string"],
        cards: ["fungi-sap"],
        codex: ["cx-c1-binding"],
      },
    ],
    sources: ["tisdall-oades-1982", "six-2004", "hartmann-six-2022"],
    simplificationNotes: ["Binding agents act as on or off; real binding fades gradually."],
    reviewStatus: "draft",
  },
];

const c1Codex: CodexEntry[] = [
  {
    id: "cx-c1-texture",
    title: "Texture and structure",
    chapter: "c1",
    body: [
      "Texture is the mix of sand, silt and clay. It is set by the rock the soil came from and by weathering over centuries, so a field keeps its texture for a human lifetime.",
      "Structure is how those grains are built into crumbs and pores. Roots, fungi, microbes and tillage change it within a season. A farmer manages structure, not texture.",
    ],
    facts: [F.sizes, F.surface, F.permanent, F.feel],
    simplification: "Three size classes stand in for a continuous distribution of grain sizes.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c1-refuges",
    title: "Small pores are refuges",
    chapter: "c1",
    body: [
      "Pore size decides which pores hold water, where air reaches, and who can get in. A protist cannot enter a pore narrower than its body, so bacteria there escape grazing.",
      "Water films are the roads. When soil dries the films break, and colonies are cut off: safe from grazers, but also from food carried in the water.",
    ],
    facts: [F.refuge, F.films],
    simplification: "One cut-off width and three moisture levels stand in for continuous variation.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c1-binding",
    title: "What holds a crumb together",
    chapter: "c1",
    body: [
      "Small clusters (microaggregates) are held by clay and old organic matter, bonds that last for years. Larger crumbs are tied by fine roots and fungal hyphae, and glued for a few weeks by microbial gums.",
      "Tillage cuts the roots and hyphae and exposes the glue to decomposers. The large crumbs fall apart and have to be rebuilt by living things.",
    ],
    facts: [F.agents, F.tillage, F.slake],
    reviewStatus: "draft",
  },
];

export const c1Bundle: ChapterBundle = {
  chapter: c1,
  scenes: c1Scenes,
  missions: c1Missions,
  codex: c1Codex,
  rumors: c1Rumors,
};
