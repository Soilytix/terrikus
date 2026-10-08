/**
 * Chapter 10 — Disease and Defence (world-bible §6): the disease triangle,
 * rotations, suppressive soils and the evidence ladder, on the rules in
 * `src/sim/disease.ts`. Not yet here: the `c10-rotation` field scene (the
 * season wheel lives in the mission panel), the scientist-lens case file and
 * the endophyte follow-up as its own mission.
 */
import type { ChapterBundle, CodexEntry, Fact, LadderRung, Mission, Scene } from "../../schema";
import { c10, c10Rumors } from "./chapter";

const TRIANGLE_FACT: Fact = {
  id: "c10-triangle",
  text: "Disease needs a susceptible host, a virulent pathogen and a conducive environment at the same time. The soil microbiome is often drawn as a fourth vertex.",
  confidence: "firm",
  sources: ["scholthof-2007"],
};

const PERSIST_FACT: Fact = {
  id: "c10-persist",
  text: "Soilborne pathogens can persist for years as resting spores, sclerotia, oospores or cysts. Short rotations of the same host build up inoculum and are linked to yield decline.",
  confidence: "firm",
  sources: ["bennett-2012"],
};

const TRANSFER_FACT: Fact = {
  id: "c10-transfer",
  text: "Specific suppression can often be moved by mixing a small amount of suppressive soil, classically 1–10 % by weight, into a conducive soil, and is lost when the soil is sterilised. General suppression is broad and does not move this way.",
  confidence: "estimate",
  sources: ["weller-2002", "schlatter-2017"],
  simplification: "The bench establishes the specific community fully at 1 %; real transfers vary.",
};

const MENDES_FACT: Fact = {
  id: "c10-mendes",
  text: "In a sugar beet soil suppressive to Rhizoctonia, more than 33,000 bacterial and archaeal taxa were detected in the rhizosphere; community profiling and mutants implicated Pseudomonas carrying a non-ribosomal peptide synthetase gene cluster.",
  confidence: "firm",
  evidence: "measured",
  sources: ["mendes-2011"],
  simplification: "The ladder paraphrases the study's steps; it is a worked example, not a protocol.",
};

const c10Scenes: Scene[] = [
  {
    id: "c10-triangle",
    chapter: "c10",
    title: "Around a pea root",
    scale: "rhizosphere",
    recipe: "c10-triangle",
    seed: 101,
    scaleBar: { metres: 0.01, label: "1 cm" },
    notToScale: 200,
    description:
      "A pea root runs down through wet, dark soil, with fine side roots. Thin pale threads of a water mould reach towards it, and round thick-walled spores lie in the soil nearby. To the left a brown, lemon-shaped cyst rests between the grains; up to the right a dark knot of fungal threads sits in a pore. Water fills many of the pores.",
    truth: {
      drawnFrom: [
        "Textbook drawings of root rot, oospores, sclerotia and cyst nematodes",
        "Sections of a legume root in wet soil",
      ],
      schematic: [
        "Pathogens drawn about 200× enlarged; the cyst and the root are not to one scale",
        "A water mould, a fungus and a nematode drawn side by side; one field rarely shows all three in a centimetre",
      ],
      invented: ["This root, its soil and its pathogens"],
      notSimulated: ["Infection itself: the bench decides disease from the triangle alone", "Root exudates"],
    },
    up: "valley",
    objects: [
      {
        id: "pea-root",
        label: "Pea root",
        kind: "scan",
        anchor: { x: 0.44, y: 0.42 },
        portrait: { x: 0.46, y: 0.36 },
        scan: "A pea root, the host. Pea and bean share some root-rot pathogens; cereals and beet do not host them.",
        facts: [TRIANGLE_FACT],
      },
      {
        id: "oomycete",
        label: "Water-mould threads",
        kind: "scan",
        anchor: { x: 0.58, y: 0.5 },
        portrait: { x: 0.62, y: 0.44 },
        card: "oomycete",
        scan: "Threads of a water mould growing towards the root. It looks like a fungus but is a protist; its swimming spores need water-filled pores.",
      },
      {
        id: "oospores",
        label: "Resting spores",
        kind: "scan",
        anchor: { x: 0.66, y: 0.66 },
        portrait: { x: 0.7, y: 0.55 },
        card: "oomycete",
        scan: "Thick-walled oospores. They can wait in soil for years without a host, which is how the pathogen is still here when the pea comes back.",
        facts: [PERSIST_FACT],
      },
      {
        id: "cyst",
        label: "Nematode cyst",
        kind: "scan",
        anchor: { x: 0.26, y: 0.66 },
        portrait: { x: 0.24, y: 0.56 },
        card: "nematode-plant",
        scan: "The hardened body of a dead female cyst nematode, full of eggs. They hatch when a host root grows nearby.",
      },
      {
        id: "sclerotium",
        label: "Fungal knot (sclerotium)",
        kind: "scan",
        anchor: { x: 0.68, y: 0.24 },
        portrait: { x: 0.78, y: 0.27 },
        card: "fungi-path",
        scan: "A tight, dark knot of fungal threads: a sclerotium. It is how some fungal root pathogens wait out the years without a host.",
      },
      {
        id: "wet-pores",
        label: "Water-filled pores",
        kind: "scan",
        anchor: { x: 0.18, y: 0.38 },
        portrait: { x: 0.18, y: 0.32 },
        scan: "After a wet spring many pores are full of water. That suits the water mould's swimming spores: a conducive environment for this pathogen.",
      },
      {
        id: "to-shield",
        label: "To the sugar beet field",
        kind: "portal",
        anchor: { x: 0.56, y: 0.9 },
        portrait: { x: 0.86, y: 0.66 },
        to: "c10-shield",
        requires: "c10-m2-done",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c10-shield",
    chapter: "c10",
    title: "The beet root's shield",
    scale: "rhizosphere",
    recipe: "c10-shield",
    seed: 103,
    scaleBar: { metres: 0.001, label: "1 mm" },
    notToScale: 1000,
    description:
      "A sugar beet root fills the left of the view. Along its surface lies a thin film of bacteria, drawn dashed. From the right, branching fungal threads reach towards the root and stop short of the film. Below, a small colony of rod-shaped bacteria sits on a grain.",
    truth: {
      drawnFrom: [
        "Micrographs and diagrams of rhizosphere biofilms and Rhizoctonia hyphae",
        "The published sugar beet suppressive-soil study, as a worked example",
      ],
      schematic: [
        "The biofilm is drawn dashed: a hypothesis until the evidence ladder is climbed",
        "Cells drawn about 1,000× enlarged",
      ],
      invented: ["This root, its film and its soil"],
      notSimulated: ["How the film acts on the fungus: the bench counts sick seedlings only"],
    },
    up: "c10-triangle",
    objects: [
      {
        id: "biofilm-hypothesis",
        label: "Film along the root (a hypothesis)",
        kind: "scan",
        anchor: { x: 0.42, y: 0.46 },
        portrait: { x: 0.46, y: 0.4 },
        card: "pseudomonas-protector",
        scan: "A film of bacteria along the root. Is it defending the root? Nothing here shows that yet: it is a hypothesis until each rung of evidence is in.",
        hiddenBy: "c10-m4-done",
      },
      {
        id: "biofilm",
        label: "Film along the root (evidence in hand)",
        kind: "scan",
        anchor: { x: 0.42, y: 0.46 },
        portrait: { x: 0.46, y: 0.4 },
        card: "pseudomonas-protector",
        scan: "In the published case, the evidence reached a pot test: Pseudomonas from this kind of soil protected beet, and a mutant without its gene cluster did not. Field evidence across soils and seasons is the next rung.",
        facts: [MENDES_FACT],
        requires: "c10-m4-done",
      },
      {
        id: "rhizoctonia",
        label: "Fungal threads",
        kind: "scan",
        anchor: { x: 0.72, y: 0.4 },
        portrait: { x: 0.74, y: 0.32 },
        card: "fungi-path",
        scan: "Rhizoctonia threads reaching for the root. In this soil they rarely do much damage, even with beet planted and the weather right.",
      },
      {
        id: "bacillus",
        label: "Bacillus colony",
        kind: "scan",
        anchor: { x: 0.62, y: 0.74 },
        portrait: { x: 0.64, y: 0.58 },
        card: "bacillus",
        scan: "Another bacterium known for antifungal compounds. Known for them in a dish does not mean active here: that would need its own evidence.",
      },
    ],
    reviewStatus: "draft",
  },
];

const ladder: LadderRung[] = [
  {
    id: "outcome",
    evidence:
      "Observed outcome: beet in this field has had little Rhizoctonia disease for years, though the fungus, the host and the weather were all there.",
    claim: "This field has less disease than expected.",
    notYet: "Not yet why: weather, variety or soil could each explain it.",
  },
  {
    id: "hypothesis",
    evidence:
      "Pot test: the soil kept beet seedlings healthy with the fungus added; heated soil did not; a little of it mixed into a conducive soil passed the effect on.",
    claim: "The soil suppresses the disease, and the suppression is biological and transferable.",
    notYet: "Not yet who: thousands of taxa live in that soil.",
  },
  {
    id: "candidate",
    evidence:
      "DNA candidate: community profiling found Pseudomonas and a few other groups more common in the suppressive rhizosphere, with a gene cluster that stood out.",
    claim: "Pseudomonas with this gene cluster are candidates for the suppression.",
    notYet: "Not yet that they do anything: DNA is a lead, not an activity.",
  },
  {
    id: "assay",
    evidence:
      "Activity assay: a strain from the soil held the fungus back; a mutant lacking the gene cluster did not.",
    claim: "This strain can act against the pathogen, through this gene cluster.",
    notYet: "Not yet that it protects a plant in soil.",
  },
  {
    id: "plant-test",
    evidence: "Plant test: in soil, beet seedlings with the strain had less disease than with the mutant.",
    claim: "This strain protects beet in pots, in this soil.",
    notYet: "Not yet in fields, in other soils or other seasons.",
  },
  {
    id: "field",
    evidence:
      "Would measure: trials across several fields, soils and seasons. If protection held, then the claim could cover those conditions, because only the field rung tests the environment.",
    claim: "A claim for the fields, soils and seasons tested, and only those.",
    notYet: "Never: every soil, every crop, everywhere.",
  },
];

const c10Missions: Mission[] = [
  {
    id: "c10-m1",
    chapter: "c10",
    title: "The disease triangle",
    tier: "T1",
    learningObjective:
      "Disease appears only when a susceptible host, a virulent pathogen and a conducive environment line up. Finding the pathogen is not finding disease.",
    misconceptionsTargeted: ["M19", "M11"],
    scene: "c10-triangle",
    steps: [
      {
        kind: "scan",
        text: "Look at the pea root, the water-mould threads and the resting spores.",
        objects: ["pea-root", "oomycete", "oospores"],
      },
      {
        kind: "predict-choice",
        id: "c10-m1-predict",
        question:
          "A soil test found DNA of a pea root-rot pathogen in this field. Will the peas get sick this season?",
        choices: [
          {
            id: "yes",
            label: "Yes: the pathogen is there",
            ok: true,
            feedback: "Your prediction. Toggle the triangle and see.",
          },
          {
            id: "depends",
            label: "It depends on the host and the weather",
            ok: true,
            feedback: "Your prediction. Toggle the triangle and see.",
          },
          {
            id: "no",
            label: "No",
            ok: true,
            feedback: "Your prediction. Toggle the triangle and see.",
          },
        ],
      },
      {
        kind: "disease",
        bench: "triangle",
        text: "Switch the host, the pathogen and the weather on and off. Find when the pathogen is there and the peas stay healthy, and when they get sick.",
        resultText:
          "The pathogen's DNA was detected every time it was switched on. Disease appeared only with a host, the pathogen and wet weather together.",
        facts: [TRIANGLE_FACT],
        onComplete: { flags: ["c10-triangle-run"] },
      },
      {
        kind: "chains",
        text: "Build the link to disease from what your toggles showed.",
        chains: ["c10-chain-triangle"],
        judgeNow: true,
      },
      {
        kind: "discover",
        text: "Present is not sick.",
        discoveries: ["d-c10-present"],
        codex: ["cx-c10-triangle"],
        cards: ["oomycete"],
        onComplete: { rumors: { "r-c10": "explained" } },
      },
    ],
    sources: ["scholthof-2007", "geisen-2018"],
    simplificationNotes: [
      "Each vertex is on or off; real hosts, pathogens and weather come in degrees.",
      "The microbiome's vertex (suppression) waits for mission 3.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c10-m2",
    chapter: "c10",
    title: "What lived here last season?",
    tier: "T2",
    learningObjective:
      "Resting structures carry a pathogen from one host season to the next. Short rotations of the same host build them up; non-host seasons let them fade. Cover crops can go either way.",
    misconceptionsTargeted: ["M19", "M35"],
    scene: "c10-triangle",
    steps: [
      {
        kind: "scan",
        text: "Look at the nematode cyst and the fungal knot: two more ways to wait for a host.",
        objects: ["cyst", "sclerotium"],
      },
      {
        kind: "predict-choice",
        id: "c10-m2-predict",
        question:
          "One field grows pea and bean every year; the other grows a legume only twice in six years. After six years, which holds more resting inoculum?",
        choices: [
          {
            id: "short",
            label: "The pea–bean field",
            ok: true,
            feedback: "Your prediction. Turn the wheel and watch the resting spores.",
          },
          {
            id: "long",
            label: "The long rotation",
            ok: true,
            feedback: "Your prediction. Turn the wheel and watch the resting spores.",
          },
          {
            id: "same",
            label: "About the same",
            ok: true,
            feedback: "Your prediction. Turn the wheel and watch the resting spores.",
          },
        ],
      },
      {
        kind: "disease",
        bench: "rotation",
        text: "Run six seasons of each rotation, then add a winter cover between them: vetch (a legume) or oat.",
        resultText:
          "Pea after bean after pea built the resting spores up; cereal and beet seasons let them fade. In the long rotation the pathogen was detected every season and the crop was never sick.",
        facts: [PERSIST_FACT],
        onComplete: { flags: ["c10-rotation-run"] },
      },
      {
        kind: "explain-choice",
        id: "c10-m2-cover",
        question: "So are cover crops a disease risk?",
        choices: [
          {
            id: "all-risky",
            label: "Yes: every cover crop is a risk",
            ok: false,
            feedback: "Look at the oat winters on the wheel. What happened to the resting spores?",
            misconception: "M35",
          },
          {
            id: "cure",
            label: "No: cover crops protect against disease",
            ok: false,
            feedback:
              "Look at the vetch winters on the wheel. What did a legume cover do for a legume pathogen?",
            misconception: "M35",
          },
          {
            id: "depends",
            label: "It depends: vetch hosted this pathogen and oat did not",
            ok: true,
            feedback:
              "Yes. A cover can host a particular pathogen or starve it; which one depends on the cover and the pathogen.",
          },
        ],
      },
      {
        kind: "chains",
        text: "Build the chain from rotation to disease risk.",
        chains: ["c10-chain-rotation"],
        judgeNow: true,
      },
      {
        kind: "discover",
        text: "What lived here last season decides what waits for the next.",
        discoveries: ["d-c10-rotation"],
        codex: ["cx-c10-rotation"],
        cards: ["nematode-plant", "fungi-path"],
      },
    ],
    sources: ["bennett-2012", "van-der-putten-2013"],
    simplificationNotes: [
      "One generic legume pathogen; inoculum triples in a host season and keeps 60 % in a non-host one. Teaching values.",
      "The weather is the same six springs for every rotation, so only the crops differ.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c10-m3",
    chapter: "c10",
    title: "Transfer the shield",
    tier: "T3",
    learningObjective:
      "Some soils suppress disease. Specific suppression moves with a little suppressive soil and is lost on sterilisation, because it is alive; general suppression does not move this way.",
    misconceptionsTargeted: ["M33", "M34"],
    scene: "c10-shield",
    steps: [
      {
        kind: "go",
        text: "Follow the portal to the sugar beet field next door, where the plants stay healthy.",
        scene: "c10-shield",
      },
      {
        kind: "scan",
        text: "Look at the film along the root and the fungal threads.",
        objects: ["biofilm-hypothesis", "rhizoctonia"],
      },
      {
        kind: "predict-choice",
        id: "c10-m3-predict",
        question:
          "Mix a spoonful of this soil (1 % by weight) into a conducive soil and sow beet with the fungus. What happens?",
        choices: [
          {
            id: "less",
            label: "Fewer seedlings get sick",
            ok: true,
            feedback: "Your prediction. Run the pots.",
          },
          {
            id: "same",
            label: "No change: 1 % is too little to matter",
            ok: true,
            feedback: "Your prediction. Run the pots.",
          },
        ],
      },
      {
        kind: "disease",
        bench: "transfer",
        text: "Run the pots: the two soils, a mix and a sterilised soil. Every pot gets beet and the fungus.",
        resultText:
          "A little suppressive soil made the conducive soil suppressive. Sterilised, the suppressive soil lost it, and even the conducive soil got worse.",
        facts: [TRANSFER_FACT],
      },
      {
        kind: "explain-choice",
        id: "c10-m3-heat",
        question:
          "Sterilising kills the pathogen in the soil too. Why did the sterilised pots have more disease?",
        choices: [
          {
            id: "alive",
            label:
              "The suppression is alive: heat killed the organisms doing it, and the fungus came back in with the test",
            ok: true,
            feedback: "Yes. Both kinds of suppression are biological, so sterilising takes both away.",
          },
          {
            id: "solved",
            label: "It should have had less: the pathogen was killed",
            ok: false,
            feedback: "Check the table: every pot got the fungus added. What else did the heat kill?",
            misconception: "M34",
          },
          {
            id: "chemistry",
            label: "Heat changed the soil's chemistry",
            ok: false,
            feedback:
              "Possible in a real soil, but look at the mix: 1 % of living soil moved the effect. What can grow from a pinch?",
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c10-m3-kind",
        question: "Which kind of suppression did the 1 % carry?",
        choices: [
          {
            id: "specific",
            label: "Specific: a few organisms that establish from a pinch",
            ok: true,
            feedback:
              "Yes. General suppression comes from the whole community's activity; a pinch cannot replace a soil's bulk.",
          },
          {
            id: "general",
            label: "General: the soil's total microbial activity",
            ok: false,
            feedback: "A 1 % pinch barely changes the total activity of the soil. What could grow from it?",
          },
          {
            id: "diversity",
            label: "Diversity: more kinds of microbes means less disease",
            ok: false,
            feedback:
              "The conducive soil was full of microbes too. Specific suppression is tied to particular functions, not to the count of kinds.",
            misconception: "M33",
          },
        ],
      },
      {
        kind: "discover",
        text: "Some soils defend, and sometimes you can move the defence.",
        discoveries: ["d-c10-shield"],
        codex: ["cx-c10-suppressive"],
        cards: ["pseudomonas-protector"],
      },
    ],
    sources: ["weller-2002", "schlatter-2017", "mendes-2011"],
    simplificationNotes: [
      "Out of 100 seedlings: 90 sick with no suppression, less 30 for general and 60 for specific. Teaching values.",
      "The 1–10 % range is an estimate; the bench establishes the specific community fully at 1 %.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c10-m4",
    chapter: "c10",
    title: "Detection to proof",
    tier: "T4",
    learningObjective:
      "Each rung of the evidence ladder supports its own, bounded claim: an outcome, a hypothesis, a DNA candidate, an activity, a plant test, field evidence. DNA detected is a lead, not proof.",
    misconceptionsTargeted: ["M19", "M23", "M25"],
    scene: "c10-shield",
    steps: [
      {
        kind: "evidence-ladder",
        text: "The published sugar beet case, rung by rung. Collect each rung's evidence; each one opens a claim, and only that claim.",
        rungs: ladder,
        overreach: [
          {
            id: "dna-disease",
            label: "Rhizoctonia DNA is in the soil, so the beet will get sick",
            ok: false,
            feedback:
              "Present is not sick. The first rung already showed the fungus there and the beet healthy.",
            misconception: "M19",
          },
          {
            id: "dna-protects",
            label: "Pseudomonas DNA is abundant, so Pseudomonas protects this field",
            ok: false,
            feedback:
              "Abundant DNA is a candidate. That it does anything takes an activity assay and a plant test.",
            misconception: "M23",
          },
          {
            id: "everywhere",
            label: "This strain will protect any crop, in any soil",
            ok: false,
            feedback:
              "No rung reaches that far. Even field evidence covers only the fields, soils and seasons tested.",
            misconception: "M25",
          },
        ],
        facts: [MENDES_FACT],
      },
      {
        kind: "discover",
        text: "Each rung of evidence is a different claim.",
        discoveries: ["d-c10-ladder"],
        codex: ["cx-c10-ladder"],
      },
    ],
    sources: ["mendes-2011", "carrion-2019", "schlatter-2017"],
    simplificationNotes: [
      "The ladder paraphrases one published case; the field rung is a would-measure, not a result of that study.",
    ],
    reviewStatus: "draft",
  },
];

const c10Codex: CodexEntry[] = [
  {
    id: "cx-c10-triangle",
    title: "The disease triangle",
    chapter: "c10",
    body: [
      "A plant gets sick when three things meet: a host that can be infected, a pathogen able to infect it, and an environment that lets it. Take any one away and there is no disease, even with the other two in place.",
      "So finding a pathogen, by eye or by its DNA, is a lead. Whether it means disease depends on the host and the conditions, and on the soil's other organisms, often drawn as a fourth vertex.",
    ],
    facts: [TRIANGLE_FACT],
    reviewStatus: "draft",
  },
  {
    id: "cx-c10-rotation",
    title: "What waits in the soil",
    chapter: "c10",
    body: [
      "Many root pathogens outlast their host as resting structures: oospores of water moulds, sclerotia of fungi, cysts of nematodes. A host season multiplies them; seasons without a host let them slowly fade.",
      "A plant changes the soil it grows in, and that changes how the next plant fares: a plant–soil feedback. Pathogen build-up under a short rotation is one way this happens.",
    ],
    facts: [
      PERSIST_FACT,
      {
        id: "cx-c10-feedback",
        text: "Plants change the biotic and abiotic soil they grow in, and these changes feed back on the next plants: plant–soil feedback.",
        confidence: "firm",
        sources: ["van-der-putten-2013"],
      },
    ],
    simplification: "One generic legume pathogen and six identical springs.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c10-suppressive",
    title: "Soils that defend",
    chapter: "c10",
    body: [
      "In a suppressive soil, disease stays low even when host, pathogen and weather allow it. General suppression comes from the whole community's activity and competition; it is broad and does not transfer. Specific suppression is tied to particular organisms and often moves with a pinch of soil.",
      "Both are biological, so sterilising or fumigating a soil takes both away: killing the pathogen can kill the defence with it.",
      "A classic case is take-all decline: after years of wheat on wheat, take-all eases, linked to Pseudomonas that make an antifungal compound.",
    ],
    facts: [
      TRANSFER_FACT,
      {
        id: "cx-c10-take-all",
        text: "Take-all decline in wheat monoculture has been linked to Pseudomonas that make 2,4-DAPG.",
        confidence: "firm",
        sources: ["weller-2002"],
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "cx-c10-ladder",
    title: "The evidence ladder",
    chapter: "c10",
    body: [
      "From a healthy field to a protective microbe is a ladder, not a jump: an observed outcome, a suppression hypothesis, a DNA candidate, an activity assay, a plant test, field evidence across environments. Each rung allows a claim the rung below cannot.",
      "The published sugar beet case climbed to the plant test. A follow-up looked inside the roots and found endophytes contributing to suppression once the fungus invaded: another candidate, with its own ladder to climb.",
    ],
    facts: [
      MENDES_FACT,
      {
        id: "cx-c10-endophytes",
        text: "In the same kind of soil, the endophytic root community, including Chitinophaga and Flavobacterium, contributed to suppression once the pathogen invaded the root.",
        confidence: "firm",
        evidence: "measured",
        sources: ["carrion-2019"],
      },
    ],
    reviewStatus: "draft",
  },
];

export const c10Bundle: ChapterBundle = {
  chapter: c10,
  scenes: c10Scenes,
  missions: c10Missions,
  codex: c10Codex,
  rumors: c10Rumors,
};
