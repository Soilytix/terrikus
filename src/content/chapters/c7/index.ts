/**
 * Chapter 7 — The Root's Neighbourhood (world-bible §6): the root tip and its
 * exudate gradients, follow the root inputs, bare versus planted, home or away
 * and signal and answer. Not yet here: the `c7-home-away` split scene, the
 * `c7-season` field scene, the S8 root-tip shader and the expected cause chain.
 */
import type { ChapterBundle, CodexEntry, Fact, Mission, Scene } from "../../schema";
import { c7, c7Rumors } from "./chapter";

/** The contested share, quoted wherever a step shows the band. */
const SHARE_FACT: Fact = {
  id: "c7-share-band",
  text: "Roots release roughly 5–21 % of the carbon a plant fixes; the figure depends on the plant, its age and above all on the method used to measure it.",
  confidence: "contested",
  sources: ["bais-2006", "pausch-kuzyakov-2018"],
  simplification: "The bench runs at both ends of the band and shows every result as a range.",
};

const c7Scenes: Scene[] = [
  {
    id: "c7-root-tip",
    chapter: "c7",
    title: "At the root tip",
    scale: "rhizosphere",
    tone: "dark",
    recipe: "c7-root-tip",
    seed: 71,
    scaleBar: { metres: 1e-3, label: "1 mm" },
    notToScale: 10,
    description:
      "A spinach root tip pushes down between soil grains, its cap in front and fine hairs behind. Around it, soft halos fade into the soil: a narrow one for sugars, a wider one for organic acids and the widest, faintest one for volatile compounds. Bacteria crowd the inner halo; an amoeba works along its edge.",
    truth: {
      drawnFrom: ["Root-tip microscopy and zymography images of rhizosphere gradients"],
      schematic: [
        "Halos drawn as sharp-edged colour; real gradients fade smoothly and shift by the hour",
        "Cells drawn 10× enlarged",
      ],
      invented: ["This root, its grains and the halo widths drawn"],
      notSimulated: ["Root growth", "Distance from the root (the bench is one well-mixed pool)"],
    },
    up: "valley",
    objects: [
      {
        id: "root-tip",
        label: "Root tip",
        kind: "scan",
        anchor: { x: 0.5, y: 0.62 },
        portrait: { x: 0.5, y: 0.48 },
        scan: "The growing tip of a spinach root. Most of what a root releases leaks out near here, behind the cap.",
        facts: [
          {
            id: "c7-cocktail",
            text: "Roots release a mix of sugars, amino acids, organic acids, signalling compounds and sloughed cells.",
            confidence: "firm",
            sources: ["bais-2006"],
          },
        ],
      },
      {
        id: "halos",
        label: "Exudate halos",
        kind: "scan",
        anchor: { x: 0.68, y: 0.5 },
        portrait: { x: 0.74, y: 0.34 },
        scan: "Each compound spreads as far as diffusion carries it before something eats it. Sugars are eaten fast and stay close; organic acids reach further; volatiles travel furthest through air-filled pores.",
        facts: [
          {
            id: "c7-gradient",
            text: "The rhizosphere is a gradient, not a fixed zone: for most root exudates it reaches about 0.5–4 mm, and its width depends on the compound and on time.",
            confidence: "estimate",
            sources: ["kuzyakov-razavi-2019"],
          },
        ],
      },
      {
        id: "bloom",
        label: "Bacteria near the root",
        kind: "scan",
        anchor: { x: 0.36, y: 0.52 },
        portrait: { x: 0.28, y: 0.38 },
        card: "bacteria-copio",
        scan: "Bacteria packed into the inner halo, where the sugars are. A few millimetres away, in bulk soil, they are sparser and mostly dormant.",
      },
      {
        id: "amoeba",
        label: "Amoeba",
        kind: "scan",
        anchor: { x: 0.3, y: 0.34 },
        portrait: { x: 0.26, y: 0.22 },
        card: "amoeba",
        scan: "An amoeba on the edge of the bacterial crowd. Grazers follow the bloom.",
      },
    ],
    reviewStatus: "draft",
  },
];

const c7Missions: Mission[] = [
  {
    id: "c7-m1",
    chapter: "c7",
    title: "Follow the root inputs",
    tier: "T1",
    learningObjective:
      "Root exudates feed a bacterial bloom; grazers eat the bloom and release ammonium the root takes up. Carbon and nitrogen are conserved at every step.",
    misconceptionsTargeted: ["M26", "M8"],
    scene: "c7-root-tip",
    steps: [
      {
        kind: "scan",
        text: "Look at the root tip, its halos, the bacteria and the amoeba.",
        objects: ["root-tip", "halos", "bloom", "amoeba"],
      },
      {
        kind: "predict-choice",
        id: "c7-m1-predict",
        question: "The root leaks sugar into the soil. Where does that carbon end up after a few weeks?",
        choices: [
          {
            id: "spread",
            label: "In microbes, their grazers and the air",
            ok: true,
            feedback: "Your prediction. Follow the ledger and see.",
          },
          {
            id: "lost",
            label: "It is used up and gone",
            ok: false,
            feedback: "Watch the ledger: carbon can change pool and form, but the total stays put.",
            misconception: "M26",
          },
          {
            id: "back",
            label: "Back in the root",
            ok: true,
            feedback: "Your prediction. Follow the carbon, and the nitrogen with it.",
          },
        ],
      },
      {
        kind: "root-inputs",
        text: "Step through the days. Every number is a range: the bench runs once at each end of the exudation band, because no one knows the share well enough to pick one value.",
        facts: [SHARE_FACT],
      },
      {
        kind: "explain-choice",
        id: "c7-m1-explain",
        question: "The root's nitrogen rose a few days after the bacteria peaked. Why the delay?",
        choices: [
          {
            id: "grazing",
            label: "The nitrogen came back only once grazers ate the bacteria",
            ok: true,
            feedback:
              "Yes. The bloom first locks nitrogen into bacteria; grazing releases it as ammonium near the root.",
          },
          {
            id: "kindness",
            label: "The bacteria were paying the root back for its sugar",
            ok: false,
            feedback:
              "Nothing in the ledger pays anyone back. Look at which rule moved the nitrogen into ammonium.",
          },
          {
            id: "slow-root",
            label: "The root is slow to take anything up",
            ok: false,
            feedback: "Look at the ammonium row: was there anything to take up before the grazers came?",
          },
        ],
      },
      {
        kind: "discover",
        text: "The root feeds a bloom, the grazers release it, and nothing is lost on the way.",
        discoveries: ["d-c7-inputs"],
        codex: ["cx-c7-exudates"],
        onComplete: { rumors: { "r-c7": "explained" } },
      },
    ],
    sources: ["bais-2006", "pausch-kuzyakov-2018", "clarholm-1985", "bonkowski-2004"],
    simplificationNotes: [
      "One well-mixed pool stands for the whole rhizosphere; real gradients fall off with distance.",
      "Teaching rates on the chapter 6 food web; the exuded share is a contested band (5–21 %).",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c7-m2",
    chapter: "c7",
    title: "Bare versus planted",
    tier: "T2",
    learningObjective:
      "The same soil with and without a living root differs in dissolved carbon and microbial activity.",
    misconceptionsTargeted: ["M9"],
    scene: "c7-root-tip",
    steps: [
      {
        kind: "bare-planted",
        id: "c7-m2-predict",
        text: "Two plots of the same soil: one bare, one with a spinach plant. Ten days, the same weather.",
        question: "Which plot's microbes breathe out more carbon?",
        choices: [
          {
            id: "planted",
            label: "The planted plot",
            ok: true,
            feedback: "Your prediction. Run both plots.",
          },
          {
            id: "bare",
            label: "The bare plot: no root competing for nutrients",
            ok: true,
            feedback: "Your prediction. Run both plots and look at the activity row.",
          },
          {
            id: "same",
            label: "About the same: it is the same soil",
            ok: true,
            feedback: "Your prediction. Run both plots.",
          },
        ],
      },
      {
        kind: "discover",
        text: "The bare plot is the comparison that tests whether the plant did it.",
        discoveries: ["d-c7-bare"],
        codex: ["cx-c7-samples"],
      },
    ],
    sources: ["philippot-2013", "kuzyakov-razavi-2019"],
    simplificationNotes: [
      "The active-microbe index is the bench's own derived number (CO₂ from bacteria and fungi per day), not a lab measurement.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c7-m3",
    chapter: "c7",
    title: "Home or away",
    tier: "T3",
    learningObjective:
      "A share rising near the root could mean one group grew or others declined; only an absolute measurement separates the two.",
    misconceptionsTargeted: ["M24"],
    scene: "c7-root-tip",
    steps: [
      {
        kind: "home-away",
        id: "c7-m3-shares",
        text: "Sequencing readouts from soil touching the root and from bulk soil a few centimetres away. Each sample's reads sum to 100 %.",
        question: "The fungi's share is lower near the root. Did the root drive fungi away?",
        choices: [
          {
            id: "cannot-tell",
            label: "Cannot tell from shares alone",
            ok: true,
            feedback:
              "Yes. The bacteria's bloom squeezes every other share. Add a spike-in to count absolute numbers and see what the fungi did.",
          },
          {
            id: "away",
            label: "Yes, fungi avoid the root",
            ok: false,
            feedback:
              "The shares must sum to 100 %. If bacteria boom, everyone else's share falls. Is that the same as fewer fungi?",
            misconception: "M24",
          },
          {
            id: "recruited",
            label: "The root chose bacteria over fungi",
            ok: false,
            feedback:
              "A readout like this shows association, not a choice. And recruitment near roots is noisy, not a precise selection.",
            misconception: "M24",
          },
        ],
        facts: [
          {
            id: "c7-ha-compositional",
            text: "Relative abundances are compositional: a change in one share forces the others to move, whatever happened to absolute numbers.",
            confidence: "firm",
            sources: ["gloor-2017"],
          },
          {
            id: "c7-ha-absolute",
            text: "Adding a measure of absolute load (cell counts, qPCR or a spike-in) can reverse what relative profiles alone suggest.",
            confidence: "firm",
            sources: ["vandeputte-2017"],
          },
        ],
      },
      {
        kind: "discover",
        text: "Near the root and away from it are different samples of different habitats; mixing them changes the answer.",
        discoveries: ["d-c7-home-away", "d-c7-filter"],
        codex: ["cx-c7-samples"],
      },
    ],
    sources: ["gloor-2017", "vandeputte-2017", "philippot-2013"],
    simplificationNotes: [
      "Bulk soil is the bare plot's teaching run; the readouts are the model's biomass turned into shares, without extraction or amplification bias.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c7-m4",
    chapter: "c7",
    title: "Signal and answer",
    tier: "T2",
    learningObjective:
      "Some exudates are signals: flavonoids call rhizobia, strigolactones prompt mycorrhizal fungi to branch. Not every plant has a partner to call.",
    misconceptionsTargeted: ["M14"],
    scene: "c7-root-tip",
    steps: [
      {
        kind: "explain-choice",
        id: "c7-m4-signal",
        question: "A pea root releases flavonoids and strigolactones. What could answer?",
        choices: [
          {
            id: "partners",
            label: "Rhizobia to the flavonoids, mycorrhizal fungi to the strigolactones",
            ok: true,
            feedback: "Yes: two signals, two partners. Chapter 8 follows both into the root.",
          },
          {
            id: "pathogens",
            label: "Only pathogens: a signal gives the root away",
            ok: false,
            feedback:
              "Some pathogens and parasitic weeds do read these signals. But who else was the signal for?",
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c7-m4-spinach",
        question: "Spinach releases sugars and acids like any root. Does a mycorrhizal fungus answer it?",
        choices: [
          {
            id: "no",
            label: "Typically not: spinach's family rarely forms mycorrhizas",
            ok: true,
            feedback:
              "Yes. Spinach and sugar beet typically go without; chapter 8 shows what they do instead.",
          },
          {
            id: "yes",
            label: "Yes: all crops partner with fungi",
            ok: false,
            feedback: "Most plants do, but not all. Which family does spinach belong to?",
            misconception: "M14",
          },
        ],
      },
      {
        kind: "discover",
        text: "A root also signals, and only some neighbours can answer.",
        discoveries: ["d-c7-signal"],
      },
    ],
    sources: ["akiyama-2005", "bais-2006"],
    simplificationNotes: ["A preview of chapter 8; signal chemistry reduced to two compound families."],
    reviewStatus: "draft",
  },
];

const c7Codex: CodexEntry[] = [
  {
    id: "cx-c7-exudates",
    title: "What a root gives away",
    chapter: "c7",
    body: [
      "A root leaks and releases a cocktail: sugars, amino acids, organic acids, signals and cells shed from its cap. Most of it comes out near the growing tip.",
      "Microbes near the root grow on it; grazers eat them and return the nitrogen as ammonium the root can take up. What the plant gains from this depends on the soil and the season; exudation is not a gift.",
    ],
    facts: [
      {
        id: "cx-c7-cocktail",
        text: "Root exudates include sugars, amino acids, organic acids and secondary metabolites that shape rhizosphere communities.",
        confidence: "firm",
        sources: ["bais-2006", "philippot-2013"],
      },
      {
        id: "cx-c7-loop",
        text: "Protist grazing on rhizosphere bacteria releases nitrogen that plants take up.",
        confidence: "firm",
        sources: ["clarholm-1985", "bonkowski-2004"],
      },
    ],
    openQuestion: {
      claim: "Roots exude a large share of the carbon the plant fixes.",
      sides: [
        "Reviews of exudation report up to about a fifth of fixed carbon released by roots.",
        "Field-scale budgets of rhizodeposition give lower shares, and the gap depends on the method.",
      ],
      sources: ["bais-2006", "pausch-kuzyakov-2018"],
    },
    simplification:
      "The bench never uses one share: it runs at about 5 % and about 21 % and shows the range.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c7-samples",
    title: "Near the root is a different sample",
    chapter: "c7",
    body: [
      "Soil touching a root and soil a few centimetres away are different habitats. Plants enrich some groups near their roots, but the recruitment is noisy and depends on the soil's own community.",
      "A rhizosphere sample and a bulk-soil sample answer different questions. Mixing them, or comparing one to the other as if they were the same, changes the answer.",
    ],
    facts: [
      {
        id: "cx-c7-recruit",
        text: "Plants shape their rhizosphere community from the bulk-soil pool, but the outcome varies with soil, plant genotype and conditions.",
        confidence: "firm",
        sources: ["philippot-2013"],
      },
      {
        id: "cx-c7-suppress",
        text: "Some rhizosphere communities are associated with suppression of root disease.",
        confidence: "estimate",
        sources: ["mendes-2011"],
      },
    ],
    reviewStatus: "draft",
  },
];

export const c7Bundle: ChapterBundle = {
  chapter: c7,
  scenes: c7Scenes,
  missions: c7Missions,
  codex: c7Codex,
  rumors: c7Rumors,
};
