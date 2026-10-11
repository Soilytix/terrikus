/**
 * Chapter 6 — Who Eats Whom (world-bible §6): the food-web mobile, the
 * microbial loop, the geosmin scene and the squeezing-jar preview.
 * Not yet here: c6-m5 (phages and grazers), c6-m7 and the forest-litter scene.
 */
import type { ChapterBundle, CodexEntry, Mission, Scene } from "../../schema";
import { c6, c6Rumors } from "./chapter";

const c6Scenes: Scene[] = [
  {
    id: "c6-gallery",
    chapter: "c6",
    title: "Beside a spinach root",
    scale: "aggregate",
    tone: "dark",
    recipe: "pore",
    seed: 37,
    scaleBar: { metres: 100e-6, label: "100 µm" },
    notToScale: 4,
    description:
      "A water-filled pore a few millimetres from a spinach root. Bacteria cluster in the film, an amoeba creeps towards them and a fungal thread crosses an air gap. The food-web mobile hangs in the mission panel: each organism drawn at schematic size, with its true size beside it.",
    truth: {
      drawnFrom: ["Microscopy of soil pores and their grazers"],
      schematic: [
        "The mobile's links are teaching rules, not measured feeding rates",
        "Cells drawn 4× enlarged",
      ],
      invented: ["This pore and its residents"],
      notSimulated: ["Encystment", "Phages", "Root growth"],
    },
    up: "valley",
    objects: [
      {
        id: "amoeba",
        label: "Naked amoeba",
        kind: "scan",
        anchor: { x: 0.7, y: 0.42 },
        portrait: { x: 0.3, y: 0.42 },
        card: "amoeba",
        scan: "An amoeba flows through the water film towards a cluster of bacteria. Whether it eats them is something to watch, not assume.",
      },
      {
        id: "bacteria",
        label: "Bacteria",
        kind: "scan",
        anchor: { x: 0.46, y: 0.6 },
        portrait: { x: 0.7, y: 0.5 },
        card: "bacteria-copio",
        scan: "Bacteria fed by sugars leaking from the root. Near a root they can multiply fast.",
      },
      {
        id: "hypha",
        label: "Fungal thread",
        kind: "scan",
        anchor: { x: 0.27, y: 0.24 },
        portrait: { x: 0.6, y: 0.24 },
        card: "fungi-sap",
        scan: "A fungal thread bridging an air gap. Fungi feed a second channel of the web, and their own grazers.",
      },
      {
        id: "portal-geosmin",
        label: "Follow the earthy smell (×1)",
        kind: "portal",
        anchor: { x: 0.55, y: 0.84 },
        portrait: { x: 0.4, y: 0.66 },
        to: "c6-geosmin",
        requires: "c6-m3-done",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c6-geosmin",
    chapter: "c6",
    title: "The smell of soil",
    scale: "aggregate",
    tone: "dark",
    recipe: "c6-geosmin",
    seed: 97,
    scaleBar: { metres: 1e-3, label: "1 mm" },
    notToScale: 20,
    description:
      "A crumb's surface under low light. Branching filaments of Streptomyces carry chains of spores; faint ribbons of scent drift away from them through the air-filled pores. A springtail at the far edge turns towards the ribbons.",
    truth: {
      drawnFrom: [
        "Streptomyces colonies and springtails in microscopy",
        "The lab experiment of Becher et al. 2020",
      ],
      schematic: ["Scent drawn as visible ribbons", "Filaments drawn 20× thicker than true"],
      invented: ["This crumb and the ribbons' shape"],
      notSimulated: ["Diffusion of the volatiles", "Spore dispersal"],
    },
    up: "c6-gallery",
    objects: [
      {
        id: "streptomyces",
        label: "Streptomyces filaments",
        kind: "scan",
        anchor: { x: 0.24, y: 0.58 },
        portrait: { x: 0.32, y: 0.4 },
        card: "streptomyces",
        scan: "Streptomyces: a bacterium that grows in threads. At the tips, chains of spores are forming.",
      },
      {
        id: "ribbons",
        label: "Scent ribbons",
        kind: "scan",
        anchor: { x: 0.44, y: 0.4 },
        portrait: { x: 0.52, y: 0.28 },
        scan: "Geosmin and 2-methylisoborneol, released as the spores form. Drawn as ribbons; in the soil they are invisible molecules in the pore air.",
        facts: [
          {
            id: "geosmin-nose",
            text: "Geosmin is the compound behind the earthy smell of freshly turned soil.",
            confidence: "firm",
            sources: ["becher-2020"],
          },
        ],
      },
      {
        id: "springtail",
        label: "Springtail",
        kind: "scan",
        anchor: { x: 0.64, y: 0.32 },
        portrait: { x: 0.78, y: 0.2 },
        card: "springtail",
        scan: "A springtail, about a millimetre long. Its antennae are turning towards the ribbons.",
      },
    ],
    reviewStatus: "draft",
  },
];

const c6Missions: Mission[] = [
  {
    id: "c6-m1",
    chapter: "c6",
    title: "A meal connects the web",
    tier: "T1",
    learningObjective:
      "Grazing releases nutrients: protists excrete the nitrogen they do not need as ammonium, and the root takes it up.",
    misconceptionsTargeted: ["M8"],
    scene: "c6-gallery",
    steps: [
      {
        kind: "notice",
        text: "Root sugars fed a bloom of bacteria. An amoeba is moving in. Bacteria are rich in nitrogen; an amoeba's body needs less of it per unit of carbon.",
        cta: "Make a prediction",
      },
      {
        kind: "predict-choice",
        id: "c6-m1-predict",
        question: "If the amoeba eats bacteria, what happens to the nitrogen it does not need?",
        choices: [
          {
            id: "out",
            label: "It leaves the amoeba as ammonium",
            ok: true,
            feedback: "Your prediction. Watch the amoeba and see.",
          },
          {
            id: "kept",
            label: "The amoeba stores all of it",
            ok: true,
            feedback: "Your prediction. Watch whether its body can hold it all.",
          },
          {
            id: "gone",
            label: "It is destroyed in digestion",
            ok: false,
            feedback: "Keep an eye on the ledger: nitrogen can change form, but it cannot vanish.",
            misconception: "M26",
          },
        ],
      },
      {
        kind: "food-web",
        text: "Watch the amoeba for a few days, then the bacteria. A link lights up only when you see that meal happen.",
        watch: ["amoeba", "bacteria-copio"],
        reveal: ["amoeba>bacteria-copio", "bacteria-copio>food"],
      },
      {
        kind: "explain-choice",
        id: "c6-m1-explain",
        question: "The root's nitrogen rose while the amoeba fed. Where did it come from?",
        choices: [
          {
            id: "loop",
            label: "From the bacteria, released as ammonium by the amoeba",
            ok: true,
            feedback:
              "Yes: the microbial loop. Nitrogen locked in bacteria is released when they are eaten, and the root takes it up.",
          },
          {
            id: "air",
            label: "From the air",
            ok: false,
            feedback: "Nothing in this web takes nitrogen from the air. Which pool fell as the root's rose?",
          },
          {
            id: "bacteria-give",
            label: "The bacteria handed it to the root directly",
            ok: false,
            feedback: "Bacteria near a root often take up ammonium themselves. Look at who was eating.",
          },
        ],
      },
      {
        kind: "discover",
        text: "Eating is how nutrients move.",
        discoveries: ["d-c6-loop"],
        cards: ["amoeba"],
        codex: ["cx-c6-loop"],
        onComplete: { rumors: { "r-c6": "explained" } },
      },
    ],
    sources: ["clarholm-1985", "bonkowski-2004", "geisen-2018"],
    simplificationNotes: [
      "Guided, not a free movement game: the amoeba avatar's scope is an open decision (OD-10).",
      "One amoeba pool stands for all protists; teaching rates.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c6-m2",
    chapter: "c6",
    title: "Who eats whom?",
    tier: "T2",
    learningObjective:
      "The soil food web has a bacterial and a fungal channel; removing one grazer ripples through the rest.",
    misconceptionsTargeted: ["M8", "M10"],
    scene: "c6-gallery",
    steps: [
      {
        kind: "food-web",
        text: "Hang the rest of the mobile. Watch each organism; every link you see feeding lights up. There is no other way to draw a link.",
        watch: [
          "bacteria-copio",
          "fungi-sap",
          "amoeba",
          "nematode-bact",
          "nematode-fung",
          "springtail",
          "nematode-pred",
          "mite",
        ],
        reveal: [
          "nematode-bact>bacteria-copio",
          "fungi-sap>food",
          "nematode-fung>fungi-sap",
          "springtail>fungi-sap",
          "nematode-pred>nematode-bact",
          "mite>springtail",
        ],
      },
      {
        kind: "food-web-remove",
        id: "c6-m2-ripple",
        text: "Now take the bacteria's grazers out: the amoebae and the bacteria-feeding nematodes. Same pulse of root sugar, same twenty days.",
        remove: ["amoeba", "nematode-bact"],
        question: "What ripples through the web?",
        choices: [
          {
            id: "ripple",
            label: "Bacteria stay high and the root gets less nitrogen",
            ok: true,
            feedback: "Your prediction. Run both webs.",
          },
          {
            id: "better",
            label: "Fewer mouths, so more nitrogen for the root",
            ok: true,
            feedback: "Your prediction. Run both webs and look at the root's bar.",
          },
          {
            id: "nothing",
            label: "Nothing much: the grazers are small",
            ok: true,
            feedback: "Your prediction. Run both webs.",
          },
        ],
      },
      {
        kind: "discover",
        text: "The bacterial and fungal channels run side by side; grazers set the pace at which nitrogen comes back.",
        discoveries: ["d-c6-channels"],
        cards: ["nematode-bact", "nematode-fung", "nematode-pred", "mite"],
        codex: ["cx-c6-channels"],
      },
    ],
    sources: ["nrcs-soil-biology-primer", "bonkowski-2004", "strickland-rousk-2010"],
    simplificationNotes: ["Eight pools stand for thousands of taxa; each link is one teaching rule."],
    reviewStatus: "draft",
  },
  {
    id: "c6-m3",
    chapter: "c6",
    title: "Read the mouth",
    tier: "T2",
    learningObjective: "A nematode's mouthparts tell which channel of the web it feeds in.",
    misconceptionsTargeted: ["M8"],
    scene: "c6-gallery",
    steps: [
      {
        kind: "explain-choice",
        id: "c6-m3-stylet",
        question:
          "Under the microscope: a nematode with a hollow, needle-like stylet in its mouth. What can it feed on?",
        choices: [
          {
            id: "fungi",
            label: "Fungal threads, by piercing them",
            ok: true,
            feedback:
              "Yes, a stylet punctures hyphae. Some stylet-bearers pierce roots instead: same tool, different meal.",
          },
          {
            id: "bacteria",
            label: "Bacteria, by swallowing them whole",
            ok: false,
            feedback: "Bacteria are swallowed through an open mouth. What is a needle for?",
          },
          {
            id: "pest",
            label: "Only crops: nematodes are pests",
            ok: false,
            feedback:
              "Most soil nematodes never touch a plant. Look at the web you hung: most of its nematodes eat microbes or each other.",
            misconception: "M8",
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c6-m3-open",
        question: "A second nematode has a wide, open mouth and no stylet. Which channel does it feed in?",
        choices: [
          {
            id: "bacterial",
            label: "The bacterial channel",
            ok: true,
            feedback: "Yes: an open tube for swallowing bacteria.",
          },
          {
            id: "fungal",
            label: "The fungal channel",
            ok: false,
            feedback: "Without a stylet it cannot pierce a fungal wall.",
          },
        ],
      },
      {
        kind: "discover",
        text: "The mouth tells the meal.",
        discoveries: ["d-c6-mouth"],
      },
    ],
    sources: ["nrcs-soil-biology-primer", "van-den-hoogen-2019"],
    simplificationNotes: ["Two mouth types stand for a much wider range of nematode feeding structures."],
    reviewStatus: "draft",
  },
  {
    id: "c6-m4",
    chapter: "c6",
    title: "Follow the smell",
    tier: "T2",
    learningObjective:
      "Organisms in the web also signal: a smell can bring an eater and a spore carrier together.",
    misconceptionsTargeted: ["M8", "M20"],
    scene: "c6-geosmin",
    steps: [
      {
        kind: "go",
        text: "An earthy smell is coming from somewhere in this crumb. Follow it.",
        scene: "c6-geosmin",
        object: "portal-geosmin",
      },
      {
        kind: "scan",
        text: "Look at the filaments, the ribbons and the springtail.",
        objects: ["streptomyces", "ribbons", "springtail"],
      },
      {
        kind: "predict-choice",
        id: "c6-m4-predict",
        question: "You are the springtail. Which way do you go?",
        choices: [
          {
            id: "towards",
            label: "Up the ribbons, towards the filaments",
            ok: true,
            feedback:
              "In the lab, springtails did go towards these smells, ate the colony and left carrying its spores.",
          },
          {
            id: "away",
            label: "Away: the smell is a warning",
            ok: true,
            feedback:
              "A fair guess: many microbial chemicals do repel. In this experiment, the springtails went towards the smell.",
          },
        ],
      },
      {
        kind: "discover",
        text: "A smell can bring an eater and a spore carrier together.",
        discoveries: ["d-c6-smell"],
        cards: ["streptomyces", "springtail"],
        codex: ["cx-c6-geosmin"],
      },
    ],
    sources: ["becher-2020", "barka-2016"],
    simplificationNotes: ["One lab experiment with one springtail species; field generality is open."],
    reviewStatus: "draft",
  },
  {
    id: "c6-m6",
    chapter: "c6",
    title: "Unknown taxon",
    tier: "T4",
    learningObjective:
      "Most soil taxa are undescribed, and a sequencing readout is relative: it shows associations, not causes.",
    misconceptionsTargeted: ["M23", "M24"],
    scene: "c6-gallery",
    steps: [
      {
        kind: "squeezing-jar",
        id: "c6-m6-jar",
        text: "A sequencing readout of the web, before and after the root's sugar pulse. Reads fill a fixed-size jar: every sample sums to 100 %.",
        question: "The fungi's share of the reads fell. Did the fungi decline?",
        choices: [
          {
            id: "cannot-tell",
            label: "Cannot tell from shares alone",
            ok: true,
            feedback:
              "Yes. The bacteria's bloom squeezed everyone else's share. The teaching model shows the fungi did not decline; sequencing alone could not have told you.",
          },
          {
            id: "declined",
            label: "Yes, the fungi declined",
            ok: false,
            feedback:
              "Their share fell, but shares must sum to 100 %. Look at the absolute bars beside the readout.",
            misconception: "M24",
          },
          {
            id: "bacteria-caused",
            label: "The bacteria caused the fungi to decline",
            ok: false,
            feedback:
              "A readout like this can only say one share is associated with another. And here the fungi did not decline at all.",
            misconception: "M24",
          },
        ],
        facts: [
          {
            id: "jar-compositional",
            text: "Sequencing data are compositional: a rise in one taxon's share forces the others' shares down, whatever happened to their absolute numbers.",
            confidence: "firm",
            sources: ["gloor-2017"],
          },
          {
            id: "jar-relic",
            text: "Much of the DNA extracted from soil can come from dead cells (relic DNA), so a read shows presence, not activity.",
            confidence: "estimate",
            sources: ["carini-2016"],
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c6-m6-claim",
        question:
          "A read in the readout matches no cultured organism. Its share rose after the pulse. Which claim can you make?",
        choices: [
          {
            id: "associated",
            label: "Its share is associated with the sugar pulse",
            ok: true,
            feedback:
              "That is what the readout supports. What it does, and whether it is even alive, would take other measurements.",
          },
          {
            id: "function",
            label: "It feeds on root sugar",
            ok: false,
            feedback: "No one has grown it or watched it eat. A share rising is not a meal observed.",
            misconception: "M24",
          },
          {
            id: "active",
            label: "It is alive and active",
            ok: false,
            feedback: "DNA can come from dormant or dead cells. Presence is not activity.",
            misconception: "M23",
          },
        ],
      },
      {
        kind: "discover",
        text: "Most of who lives here has no name yet, and a share is not a count.",
        discoveries: ["d-c6-unnamed", "d-c6-relative"],
        codex: ["cx-c6-unknown"],
      },
    ],
    sources: ["gloor-2017", "carini-2016", "fierer-2017", "anthony-2023"],
    simplificationNotes: [
      "The readout is the teaching model's biomass turned into shares; real reads add extraction and amplification bias.",
    ],
    reviewStatus: "draft",
  },
];

const c6Codex: CodexEntry[] = [
  {
    id: "cx-c6-loop",
    title: "The microbial loop",
    chapter: "c6",
    body: [
      "Bacteria hold a lot of nitrogen for their carbon. A protist that eats them keeps what its own body needs, breathes out part of the carbon and releases the surplus nitrogen as ammonium, right where roots are.",
      "Near a root this loop can be a large share of the nitrogen a plant takes up. How large depends on the soil, the plant and the season.",
    ],
    facts: [
      {
        id: "cx-loop",
        text: "Protist grazing on bacteria releases nitrogen as ammonium that plants take up.",
        confidence: "firm",
        sources: ["clarholm-1985", "bonkowski-2004"],
      },
      {
        id: "cx-protists",
        text: "Soil protists are diverse and functionally varied; many graze bacteria, others eat fungi or other protists.",
        confidence: "firm",
        sources: ["geisen-2018"],
      },
    ],
    simplification: "The bench treats all protists as one amoeba pool with a fixed body C:N.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c6-channels",
    title: "Two channels, one web",
    chapter: "c6",
    body: [
      "Energy enters the soil web from roots and litter and flows up two main channels: through bacteria and their grazers, and through fungi and theirs. Predators sit on top and draw from both.",
      "No channel is the better one. Which dominates depends on the soil, its management and how it is measured.",
    ],
    facts: [
      {
        id: "cx-fb-ratio",
        text: "Fungal:bacterial dominance varies with soil and management, and its claimed effects on carbon and nutrient cycling are not consistent across studies.",
        confidence: "contested",
        sources: ["strickland-rousk-2010"],
      },
      {
        id: "cx-web",
        text: "The soil food web links bacteria, fungi, protists, nematodes and arthropods through feeding.",
        confidence: "firm",
        sources: ["nrcs-soil-biology-primer", "fao-2020-soil-biodiversity"],
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "cx-c6-geosmin",
    title: "The smell of soil",
    chapter: "c6",
    body: [
      "The earthy smell after rain is geosmin, made by Streptomyces and other microbes. In the lab, Streptomyces released it as they formed spores, and springtails followed the smell, ate the colony and carried spores away on and in their bodies.",
    ],
    facts: [
      {
        id: "cx-geosmin",
        text: "Geosmin and 2-methylisoborneol attract springtails to sporulating Streptomyces, which helps disperse the spores.",
        confidence: "estimate",
        sources: ["becher-2020"],
      },
    ],
    simplification:
      "One experiment; whether the same partnership matters in field soils is an open question.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c6-unknown",
    title: "Most of who lives here has no name",
    chapter: "c6",
    body: [
      "A gram of soil holds thousands of taxa, and most have never been grown or described. A DNA read with no cultured relative is normal, not a discovery of something special.",
      "What a read can support is a bounded claim: this sequence was present, and its share is associated with a condition. What the organism does takes other evidence.",
    ],
    facts: [
      {
        id: "cx-unknown",
        text: "Most soil microbial taxa are uncultured and their functions are unknown.",
        confidence: "firm",
        sources: ["fierer-2017"],
      },
    ],
    openQuestion: {
      claim: "Soil is home to more than half of all species on Earth.",
      sides: [
        "A synthesis of estimates puts about 59 % of species in soil.",
        "The figure rests on uncertain counts for microbes and invertebrates and depends on what counts as a species.",
      ],
      sources: ["anthony-2023"],
    },
    reviewStatus: "draft",
  },
];

export const c6Bundle: ChapterBundle = {
  chapter: c6,
  scenes: c6Scenes,
  missions: c6Missions,
  codex: c6Codex,
  rumors: c6Rumors,
};
