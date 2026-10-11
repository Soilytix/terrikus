/**
 * Chapter 8 — Partners and Traders (world-bible §6): nodules on a pea root and
 * an arbuscule inside a cortex cell; the root exchange, who has no partner,
 * knock knock, slice the nodule, the fertiliser off-switch, reach or release,
 * and myth or evidence. Not yet here: the `c8-depletion-halo` and
 * `c8-forest-network` scenes and the two expected cause chains.
 */
import type { ChapterBundle, CodexEntry, Fact, Mission, OpenQuestion, Scene } from "../../schema";
import { c8, c8Rumors } from "./chapter";

/** The forest-network evidence card, shown in c8-m7 and its codex page. */
const NETWORK: OpenQuestion = {
  claim: "Trees share food and warnings through a 'wood wide web' of fungi.",
  sides: [
    "Mycorrhizal fungi colonise most forest trees, and in a few forests one fungus has been traced across several neighbouring trees.",
    "A review of the field studies found that claims of widespread networks, of transfers that help seedlings and of trees favouring their kin rest on few, conflicting or no field results, and are often cited beyond what they showed.",
  ],
  sources: ["karst-2023", "leake-2004"],
};

const TEACHING: Fact = {
  id: "c8-teaching",
  text: "The bench's rates are teaching values chosen to show direction; real trades vary with plant, fungus, soil and season.",
  confidence: "estimate",
  sources: ["smith-2003"],
};

const c8Scenes: Scene[] = [
  {
    id: "c8-nodule",
    chapter: "c8",
    title: "Nodules on a pea root",
    scale: "rhizosphere",
    tone: "dark",
    recipe: "c8-nodule",
    seed: 83,
    scaleBar: { metres: 1e-3, label: "1 mm" },
    notToScale: 10,
    description:
      "A pea root runs down through the soil with fine hairs along it. One hair has curled over at its tip, a thin thread running back from the curl into the root. Further down, round nodules sit on the root; one is sliced open to show a pink interior, another a white one. A band beside the slice fades from light to dark: oxygen, falling towards the nodule's centre.",
    truth: {
      drawnFrom: ["Light micrographs and photographs of legume root nodules and infection threads"],
      schematic: [
        "Curl, thread and nodules drawn side by side; in life they form over days",
        "The oxygen band is a diagram, not a measurement",
        "Bacteria drawn 10× enlarged",
      ],
      invented: ["This root, its nodules and their positions"],
      notSimulated: ["Nodule growth", "Root growth", "Which rhizobia live in this soil"],
    },
    up: "valley",
    objects: [
      {
        id: "curl",
        label: "Curled root hair",
        kind: "scan",
        anchor: { x: 0.3, y: 0.34 },
        portrait: { x: 0.26, y: 0.24 },
        card: "rhizobia",
        scan: "A root hair has curled around a few rhizobia it recognised. A thread grows back from the curl into the root, carrying them in.",
        facts: [
          {
            id: "c8-curl",
            text: "Rhizobia enter most legume roots through a root hair that curls around them and an infection thread that grows into the cortex.",
            confidence: "firm",
            sources: ["oldroyd-2013"],
          },
        ],
      },
      {
        id: "pink",
        label: "Pink nodule, sliced",
        kind: "scan",
        anchor: { x: 0.62, y: 0.56 },
        portrait: { x: 0.66, y: 0.42 },
        scan: "Inside, the nodule is pink: the colour of leghaemoglobin, which holds oxygen away from the enzyme that fixes nitrogen.",
        facts: [
          {
            id: "c8-lb",
            text: "Leghaemoglobin colours active nodules pink and keeps free oxygen low inside them; nodules without it do not fix nitrogen.",
            confidence: "firm",
            sources: ["ott-2005"],
          },
        ],
      },
      {
        id: "white",
        label: "White nodule, sliced",
        kind: "scan",
        anchor: { x: 0.42, y: 0.74 },
        portrait: { x: 0.36, y: 0.58 },
        scan: "This one is white inside. It is a nodule all the same, and it would count in a nodule tally.",
      },
      {
        id: "oxygen",
        label: "Oxygen across the nodule",
        kind: "scan",
        anchor: { x: 0.8, y: 0.48 },
        portrait: { x: 0.84, y: 0.32 },
        scan: "Oxygen falls from the soil outside to almost none at the nodule's centre.",
        facts: [
          {
            id: "c8-nitrogenase",
            text: "Nitrogenase, the enzyme that fixes N₂, is destroyed by oxygen and spends about 16 ATP for every N₂ it breaks.",
            confidence: "firm",
            sources: ["hoffman-2014"],
          },
        ],
      },
      {
        id: "into-cell",
        label: "Into a cortex cell",
        kind: "portal",
        anchor: { x: 0.56, y: 0.22 },
        portrait: { x: 0.56, y: 0.14 },
        to: "c8-arbuscule",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c8-arbuscule",
    chapter: "c8",
    title: "An arbuscule in a cortex cell",
    scale: "cell",
    tone: "dark",
    recipe: "c8-arbuscule",
    seed: 89,
    scaleBar: { metres: 20e-6, label: "20 µm" },
    description:
      "Root cortex cells sit side by side like bricks. A fungal hypha runs between them; in one cell it has branched again and again into a small glowing tree. Sugar drifts out of the cell towards the tree and phosphate drifts back. Outside the root, the hypha runs on into the soil.",
    truth: {
      drawnFrom: ["Stained micrographs of arbuscules in root cortex cells"],
      schematic: [
        "The arbuscule sits inside the cell's membrane, which is not drawn",
        "Sugar and phosphate drawn as particles; real exchange is across membranes",
      ],
      invented: ["These cells and the arbuscule's branching"],
      notSimulated: ["Arbuscule turnover (they live days)", "Fungal species and their differences"],
    },
    up: "c8-nodule",
    objects: [
      {
        id: "arbuscule",
        label: "Arbuscule",
        kind: "scan",
        anchor: { x: 0.5, y: 0.48 },
        portrait: { x: 0.5, y: 0.3 },
        card: "amf",
        scan: "A fungal tree inside one cell. Here the plant's sugar and the fungus's phosphate change hands.",
        facts: [
          {
            id: "c8-swap",
            text: "In an arbuscular mycorrhiza the plant supplies carbon and the fungus supplies phosphate and other nutrients from soil the root does not reach.",
            confidence: "firm",
            sources: ["smith-2003"],
          },
        ],
      },
      {
        id: "hypha",
        label: "Hypha into the soil",
        kind: "scan",
        anchor: { x: 0.16, y: 0.84 },
        portrait: { x: 0.2, y: 0.6 },
        scan: "The same fungus runs out of the root and on into the soil, far past where the root itself can draw phosphate.",
        facts: [
          {
            id: "c8-hyphae-reach",
            text: "Mycorrhizal hyphae extend beyond the root's phosphate depletion zone, which is only about 0.1–2 mm wide.",
            confidence: "estimate",
            sources: ["hinsinger-2001", "leake-2004"],
          },
        ],
      },
      {
        id: "cortex",
        label: "Cortex cells",
        kind: "scan",
        anchor: { x: 0.31, y: 0.24 },
        portrait: { x: 0.78, y: 0.2 },
        scan: "Plain cortex cells. The fungus grows only into these, never into the root's water-carrying core.",
      },
    ],
    reviewStatus: "draft",
  },
];

const c8Missions: Mission[] = [
  {
    id: "c8-m3",
    chapter: "c8",
    title: "Knock knock",
    tier: "T2",
    learningObjective:
      "Partners are specific: a legume lets in only the rhizobia whose signal it recognises, so pea and bean partners are not interchangeable.",
    misconceptionsTargeted: ["M14"],
    scene: "c8-nodule",
    steps: [
      {
        kind: "scan",
        text: "Look at the curled hair and the two sliced nodules.",
        objects: ["curl", "pink", "white"],
      },
      {
        kind: "predict-choice",
        id: "c8-m3-predict",
        question: "Rhizobia from a pea field reach a bean root. What happens?",
        choices: [
          {
            id: "nodule",
            label: "They form nodules: rhizobia are rhizobia",
            ok: true,
            feedback: "Your prediction. Knock and see.",
          },
          {
            id: "refused",
            label: "The bean does not let them in",
            ok: true,
            feedback: "Your prediction. Knock and see.",
          },
        ],
      },
      {
        kind: "partners",
        bench: "knock",
        text: "Send each kind of rhizobia to each root. Try at least one pairing that does not match.",
        resultText:
          "Only matched pairs made a nodule. Pea rhizobia knocking on a bean root were refused, and the other way round; spinach and sugar beet answered nobody.",
        facts: [
          {
            id: "c8-knock-signal",
            text: "Each legume answers the Nod factors of particular rhizobia; a mismatched signal does not start a nodule.",
            confidence: "firm",
            sources: ["oldroyd-2013"],
            simplification: "Two partner groups stand in for the many rhizobia and host ranges known.",
          },
        ],
      },
      {
        kind: "discover",
        text: "Partners are specific. A pea's rhizobia are not a bean's.",
        discoveries: ["d-c8-specific"],
        codex: ["cx-c8-nodules"],
      },
    ],
    sources: ["oldroyd-2013"],
    simplificationNotes: ["Specificity reduced to two partner groups and a yes-or-no answer."],
    reviewStatus: "draft",
  },
  {
    id: "c8-m4",
    chapter: "c8",
    title: "Slice the nodule",
    tier: "T1",
    learningObjective:
      "An effective nodule is pink inside: leghaemoglobin keeps oxygen low so nitrogenase can work. A white nodule fixes little or nothing.",
    misconceptionsTargeted: [],
    scene: "c8-nodule",
    steps: [
      {
        kind: "partners",
        bench: "slice",
        text: "Slice both nodules and read the oxygen meter across each.",
        resultText:
          "Same root, same rhizobia, same number of nodules: the pink one fixes, the white one does not. A nodule count is not a fixation rate.",
        facts: [
          {
            id: "c8-slice-lb",
            text: "Plants that cannot make leghaemoglobin still form nodules, but the nodules fix no nitrogen.",
            confidence: "firm",
            sources: ["ott-2005"],
          },
          {
            id: "c8-slice-field",
            text: "Cutting a nodule open and looking for pink is a routine field check of whether a legume is fixing.",
            confidence: "estimate",
            sources: ["ott-2005", "herridge-2008"],
            simplification: "A colour check, not a measurement of how much is fixed.",
          },
        ],
      },
      {
        kind: "discover",
        text: "Pink means working.",
        discoveries: ["d-c8-pink"],
      },
    ],
    sources: ["ott-2005", "hoffman-2014"],
    simplificationNotes: [
      "Pink or white only; real nodules age through green and brown as they stop fixing.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c8-m5",
    chapter: "c8",
    title: "Fertiliser off-switch",
    tier: "T3",
    learningObjective:
      "Fixing nitrogen costs the plant carbon; given nitrate, a legume makes fewer nodules and fixes less.",
    misconceptionsTargeted: ["M17"],
    scene: "c8-nodule",
    steps: [
      {
        kind: "predict-choice",
        id: "c8-m5-predict",
        question: "You add nitrate fertiliser to a pea crop. What happens to its nodules?",
        choices: [
          {
            id: "fewer",
            label: "Fewer nodules",
            ok: true,
            feedback: "Your prediction. Turn the nitrate up and watch.",
          },
          {
            id: "more",
            label: "More nodules: the plant is better fed",
            ok: true,
            feedback: "Your prediction. Turn the nitrate up and watch.",
          },
          {
            id: "same",
            label: "No change",
            ok: true,
            feedback: "Your prediction. Turn the nitrate up and watch.",
          },
        ],
      },
      {
        kind: "partners",
        bench: "nitrate",
        text: "Move the nitrate in the root zone from none to plenty. Watch nodules, nitrogen fixed and the carbon the plant spends.",
        resultText:
          "With nitrate to hand the plant made fewer nodules, fixed less and spent less carbon: taking up nitrate is cheaper than fixing.",
        facts: [
          {
            id: "c8-nitrate-switch",
            text: "Soil nitrate suppresses nodulation and fixation; the plant regulates how many nodules it makes.",
            confidence: "firm",
            sources: ["oldroyd-2013"],
          },
          TEACHING,
        ],
      },
      {
        kind: "explain-choice",
        id: "c8-m5-explain",
        question: "The pea is harvested. Does the next crop get all the nitrogen the pea fixed?",
        choices: [
          {
            id: "seed",
            label: "No: much of it leaves the field in the harvested seed",
            ok: true,
            feedback:
              "Yes. What stays depends on how much was fixed, what was harvested and what the residue releases.",
          },
          {
            id: "all",
            label: "Yes: legumes always fertilise the next crop",
            ok: false,
            feedback: "Follow the nitrogen: where does most of it go at harvest?",
            misconception: "M17",
          },
        ],
      },
      {
        kind: "discover",
        text: "A legume fixes when fixing pays; nitrate switches it down.",
        discoveries: ["d-c8-switch"],
        codex: ["cx-c8-nodules"],
      },
    ],
    sources: ["oldroyd-2013", "hoffman-2014", "herridge-2008"],
    simplificationNotes: [
      "Nodule number is set once by the nitrate at sowing; real plants adjust through the season.",
      "Carbon costs per unit of nitrogen are teaching values; fixing is shown as dearer than taking up nitrate.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c8-m1",
    chapter: "c8",
    title: "The root exchange",
    tier: "T2",
    learningObjective:
      "A mycorrhiza is a trade of plant carbon for fungal phosphate. At low soil P it pays; at high P the fungus becomes a cost.",
    misconceptionsTargeted: ["M8"],
    scene: "c8-arbuscule",
    steps: [
      {
        kind: "scan",
        text: "Look at the arbuscule, the hypha and the cortex cells.",
        objects: ["arbuscule", "hypha", "cortex"],
      },
      {
        kind: "predict-choice",
        id: "c8-m1-predict",
        question: "The soil gets richer in phosphate. What happens to the deal between pea and fungus?",
        choices: [
          {
            id: "worse",
            label: "The plant gets less for its carbon",
            ok: true,
            feedback: "Your prediction. Set the soil P and run the trade.",
          },
          {
            id: "better",
            label: "The plant gets more for its carbon",
            ok: true,
            feedback: "Your prediction. Set the soil P and run the trade.",
          },
          {
            id: "same",
            label: "Nothing changes: a partnership is a partnership",
            ok: true,
            feedback: "Your prediction. Set the soil P and run the trade.",
          },
        ],
      },
      {
        kind: "partners",
        bench: "trade",
        text: "Run the pea with and without its fungus at low, medium and high soil P, twenty days each.",
        resultText:
          "At low P the fungus delivered phosphate the root could not reach. At high P the root found enough alone, the fungus delivered nothing, and the plant still paid it carbon.",
        facts: [
          {
            id: "c8-trade-fact",
            text: "The mycorrhizal pathway can dominate a plant's phosphate uptake whether or not the plant grows better for it.",
            confidence: "firm",
            sources: ["smith-2003"],
          },
          TEACHING,
        ],
      },
      {
        kind: "explain-choice",
        id: "c8-m1-explain",
        question: "Is the fungus a helper or a parasite?",
        choices: [
          {
            id: "depends",
            label: "It depends on the soil: the same trade can pay or cost",
            ok: true,
            feedback: "Yes. Partnerships are trades, and trades depend on prices.",
          },
          {
            id: "helper",
            label: "A helper: mycorrhizas always help plants",
            ok: false,
            feedback: "Look at the high-P run: what did the plant get for its carbon?",
            misconception: "M8",
          },
        ],
      },
      {
        kind: "discover",
        text: "Partnerships are trades, and trades depend on prices.",
        discoveries: ["d-c8-trade"],
        codex: ["cx-c8-trade"],
      },
    ],
    sources: ["smith-2003", "akiyama-2005"],
    simplificationNotes: [
      "One plant, one fungus, a fixed daily P demand; real plants also cut colonisation back at high P.",
      "The plant takes from its own roots first and from the fungus only what it still lacks.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c8-m2",
    chapter: "c8",
    title: "Who has no partner?",
    tier: "T2",
    learningObjective:
      "Spinach and sugar beet typically form no mycorrhiza and no nodules; they get P by other means.",
    misconceptionsTargeted: ["M14"],
    scene: "c8-arbuscule",
    steps: [
      {
        kind: "partners",
        bench: "survey",
        text: "Look inside the roots of all four crop worlds for arbuscules and nodules.",
        resultText:
          "Pea and bean both had arbuscules and nodules. Spinach and sugar beet had neither: no fungal partner, no rhizobia.",
        facts: [
          {
            id: "c8-survey-am",
            text: "Spinach and sugar beet belong to the Amaranthaceae, a family that typically forms no arbuscular mycorrhiza.",
            confidence: "firm",
            sources: ["brundrett-tedersoo-2018"],
            simplification: "Low or occasional colonisation is reported; the survey shows the typical case.",
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c8-m2-explain",
        question: "Then how does spinach get its phosphate?",
        choices: [
          {
            id: "own",
            label: "With its own roots: root hairs reach, and released acids free bound P",
            ok: true,
            feedback: "Yes. Chapter 8's last bench lets you try both.",
          },
          {
            id: "none",
            label: "It cannot: every crop needs a fungus for P",
            ok: false,
            feedback: "Spinach grows well in many soils. What else could a root do?",
            misconception: "M14",
          },
        ],
      },
      {
        kind: "discover",
        text: "Not every crop has a fungus.",
        discoveries: ["d-c8-no-partner"],
        onComplete: { rumors: { "r-c8": "explained" } },
      },
    ],
    sources: ["brundrett-tedersoo-2018", "oldroyd-2013"],
    simplificationNotes: ["Four crops, present or absent; real colonisation is a matter of degree."],
    reviewStatus: "draft",
  },
  {
    id: "c8-m6",
    chapter: "c8",
    title: "Reach or release",
    tier: "T2",
    learningObjective:
      "Phosphate barely moves and binds to minerals in acid and alkaline soil. Roots reach for it (hairs, hyphae) or release it (organic acids).",
    misconceptionsTargeted: ["M18", "M14"],
    scene: "c8-arbuscule",
    steps: [
      {
        kind: "partners",
        bench: "reach",
        text: "Pick a crop, a soil pH and a way to get P. Try a fungus on spinach or sugar beet, and try an acid soil.",
        resultText:
          "P stayed freest near neutral pH and bound up in acid and alkaline soil. A fungus helped only the crops that host one; spinach and sugar beet had to reach with hairs or release with acids.",
        facts: [
          {
            id: "c8-p-binds",
            text: "Phosphate binds to iron and aluminium in acid soils and to calcium in alkaline soils; it is most available in between.",
            confidence: "estimate",
            sources: ["shen-2011"],
            simplification: "A teaching curve over pH; real binding depends on the minerals present.",
          },
          {
            id: "c8-p-acids",
            text: "Roots can release organic acids and change the pH around them, freeing bound phosphate.",
            confidence: "firm",
            sources: ["hinsinger-2001"],
          },
          {
            id: "c8-p-immobile",
            text: "Dissolved phosphate moves only short distances in soil, so roots draw down a narrow zone around themselves.",
            confidence: "firm",
            sources: ["shen-2011", "hinsinger-2001"],
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c8-m6-explain",
        question: "Why do roots have to reach for phosphate but not for nitrate?",
        choices: [
          {
            id: "immobile",
            label: "Phosphate binds and barely moves; nitrate flows to the root with water",
            ok: true,
            feedback: "Yes. It is also why phosphate rarely leaches: it leaves fields mostly on eroded soil.",
          },
          {
            id: "leaches",
            label: "Phosphate washes away quickly, like nitrate",
            ok: false,
            feedback: "Look at the bench: where did the phosphate go when it was not taken up?",
            misconception: "M18",
          },
        ],
      },
      {
        kind: "discover",
        text: "Roots reach for phosphate or release it; partners are one way to reach.",
        discoveries: ["d-c8-reach"],
        codex: ["cx-c8-phosphorus"],
      },
    ],
    sources: ["shen-2011", "hinsinger-2001", "smith-2003"],
    simplificationNotes: [
      "Five pH steps on a teaching curve; one bound pool stands for iron, aluminium and calcium phosphates.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c8-m7",
    chapter: "c8",
    title: "Myth or evidence?",
    tier: "T4",
    learningObjective:
      "The popular 'wood wide web' runs ahead of its evidence. Sort claims by how well field studies support them.",
    misconceptionsTargeted: ["M13"],
    scene: "c8-arbuscule",
    steps: [
      {
        kind: "claim-sort",
        text: "Three claims about forest fungal networks. Read the evidence card, then sort each claim.",
        claims: [
          {
            id: "partners",
            text: "Most forest trees partner with mycorrhizal fungi that trade soil nutrients for the tree's sugar.",
            verdict: "supported",
            feedback: "Supported: mycorrhizas are near-universal in forest trees.",
          },
          {
            id: "transfer",
            text: "Carbon moves between trees through shared fungal networks and helps seedlings grow.",
            verdict: "weak",
            feedback:
              "Weakly supported: some studies find transfer, others do not, and benefit to seedlings is inconsistent.",
          },
          {
            id: "kin",
            text: "Mother trees recognise their kin and send them food and warnings through the network.",
            verdict: "unsupported",
            feedback: "Unsupported: the review found no peer-reviewed field evidence for it.",
          },
        ],
        evidence: NETWORK,
        facts: [
          {
            id: "c8-karst",
            text: "Claims about common mycorrhizal networks in forests are often cited beyond what the field studies showed.",
            confidence: "contested",
            sources: ["karst-2023"],
          },
        ],
      },
      {
        kind: "discover",
        text: "A story can be popular and still weakly supported.",
        discoveries: ["d-c8-network"],
        codex: ["cx-c8-network"],
      },
    ],
    sources: ["karst-2023", "leake-2004", "brundrett-tedersoo-2018"],
    simplificationNotes: [
      "Three claims stand for a large literature; the sorting follows one critical review.",
    ],
    reviewStatus: "draft",
  },
];

const c8Codex: CodexEntry[] = [
  {
    id: "cx-c8-nodules",
    title: "Nodules: a costly, specific partnership",
    chapter: "c8",
    body: [
      "Legume roots signal with flavonoids; matching rhizobia answer, and only then does a root hair curl and let them in. Inside the nodule they fix nitrogen from the air.",
      "Fixing is expensive and oxygen destroys the enzyme that does it. Leghaemoglobin keeps oxygen low and turns working nodules pink. Given nitrate, the plant makes fewer nodules: it fixes when fixing pays.",
    ],
    facts: [
      {
        id: "cx-c8-specific",
        text: "Host and rhizobia recognise each other through flavonoid and Nod-factor signals; mismatched partners do not form nodules.",
        confidence: "firm",
        sources: ["oldroyd-2013"],
      },
      {
        id: "cx-c8-cost",
        text: "Nitrogenase is destroyed by oxygen and spends about 16 ATP for every N₂ it breaks.",
        confidence: "firm",
        sources: ["hoffman-2014"],
      },
    ],
    realWorld: [
      {
        id: "cx-c8-bnf-global",
        text: "Legumes on farmland fix tens of millions of tonnes of nitrogen a year; industrial fertiliser now adds more.",
        confidence: "estimate",
        sources: ["herridge-2008", "fowler-2013"],
      },
    ],
    simplification: "Two partner groups, pink or white, and nodule number set once by nitrate.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c8-trade",
    title: "The root exchange",
    chapter: "c8",
    body: [
      "In an arbuscular mycorrhiza the fungus grows into root cortex cells and branches into arbuscules, where the plant's carbon and the fungus's phosphate change hands. Its hyphae reach soil the root has already drained.",
      "The same trade runs from mutualism to parasitism. Where phosphate is scarce, the fungus delivers what the root cannot reach; where it is plentiful, the plant pays carbon for little in return.",
    ],
    facts: [
      {
        id: "cx-c8-dominate",
        text: "The fungal pathway can supply most of a plant's phosphate even when the plant shows no growth response.",
        confidence: "firm",
        sources: ["smith-2003"],
      },
      {
        id: "cx-c8-strigo",
        text: "Strigolactones released by roots prompt the hyphae of arbuscular mycorrhizal fungi to branch.",
        confidence: "firm",
        sources: ["akiyama-2005"],
      },
    ],
    openQuestion: {
      claim:
        "Glomalin, a protein from arbuscular mycorrhizal fungi, glues soil aggregates and stores carbon.",
      sides: [
        "Glomalin-related soil protein correlates with aggregate stability and is proposed as a fungal glue.",
        "Chemical analysis suggests the extracted 'glomalin' is largely other soil organic matter, so its fungal origin and role are uncertain.",
      ],
      sources: ["rillig-2004", "gillespie-2011"],
    },
    simplification: "One plant, one fungus and a fixed P demand on the bench.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c8-phosphorus",
    title: "Phosphorus does not come to the root",
    chapter: "c8",
    body: [
      "Phosphate binds to iron and aluminium in acid soils and to calcium in alkaline ones, and what stays dissolved moves only a millimetre or two. A root soon drains a thin halo around itself.",
      "So roots reach (root hairs, fungal hyphae) or release (organic acids, enzymes). Spinach and sugar beet, with no fungal partner, rely on their own roots.",
    ],
    facts: [
      {
        id: "cx-c8-halo",
        text: "The phosphate depletion zone around a root is about 0.1–2 mm wide.",
        confidence: "estimate",
        sources: ["hinsinger-2001"],
      },
      {
        id: "cx-c8-binding",
        text: "Phosphate availability is limited by sorption to iron and aluminium oxides in acid soils and by calcium phosphates in alkaline soils.",
        confidence: "firm",
        sources: ["shen-2011"],
      },
    ],
    realWorld: [
      {
        id: "cx-c8-old-soils",
        text: "Over long soil development, phosphorus is lost or locked into forms plants cannot use, so very old soils are often P-poor.",
        confidence: "firm",
        sources: ["walker-syers-1976"],
      },
    ],
    simplification:
      "One bound pool on a teaching pH curve; real soils differ in which minerals hold the phosphate.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c8-network",
    title: "The wood wide web",
    chapter: "c8",
    body: [
      "Most forest trees partner with mycorrhizal fungi, and a fungus can colonise more than one tree. From this grew a popular story of trees feeding and warning each other through a fungal internet.",
      "The field evidence is thinner than the story. Treat each claim on its own: what was measured, where, and how often was it found again?",
    ],
    facts: [
      {
        id: "cx-c8-karst",
        text: "A review of field studies found that claims about widespread networks, seedling benefit and kin preference are poorly supported or unsupported.",
        confidence: "contested",
        sources: ["karst-2023"],
      },
    ],
    openQuestion: NETWORK,
    simplification: "The chapter sorts three claims; the literature is larger and still moving.",
    reviewStatus: "draft",
  },
];

export const c8Bundle: ChapterBundle = {
  chapter: c8,
  scenes: c8Scenes,
  missions: c8Missions,
  codex: c8Codex,
  rumors: c8Rumors,
};
