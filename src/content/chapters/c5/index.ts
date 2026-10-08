/**
 * Chapter 5 — Charged Surfaces (world-bible §6). CEC, clays and pH on one
 * clay platelet; the surface runs on `src/sim/exchange.ts`.
 * Deviation, recorded: the swelling-clay scene (`c5-vertisol`), "Acid rain on
 * the field" (c5-m4), the water-versus-CaCl₂ scientist-lens payoff and the two
 * expected cause chains wait for a later pass; guo-2010 appears in the codex.
 */
import type { ChapterBundle, CodexEntry, Fact, Mission, Scene } from "../../schema";
import { c5, c5Rumors } from "./chapter";

const F = {
  charge: {
    id: "c5-negative-charge",
    text: "Clay minerals and organic matter carry mostly negative surface charge. It holds cations such as Ca²⁺, Mg²⁺, K⁺ and NH₄⁺ against leaching; the capacity to hold them is the cation exchange capacity (CEC).",
    confidence: "firm",
    sources: ["cornell-fs22-cec"],
  },
  ranges: {
    id: "c5-cec-ranges",
    text: "CEC is about 3–15 cmol(+) per kg for kaolinite, 80–150 for smectite, and 200 or more for organic matter.",
    confidence: "firm",
    sources: ["cornell-fs22-cec"],
    simplification: "Typical ranges; a real soil's CEC mixes its clays and organic matter.",
  },
  clays: {
    id: "c5-clay-kinds",
    text: "1:1 clays such as kaolinite carry little charge and do not swell; 2:1 clays such as smectite carry much more charge and swell and shrink with water.",
    confidence: "firm",
    sources: ["cornell-fs22-cec", "wrb-2022"],
  },
  series: {
    id: "c5-holding-order",
    text: "Cations with more charge and a smaller hydrated size are held more tightly: roughly H⁺ and Al³⁺, then Ca²⁺, then Mg²⁺, then K⁺ and NH₄⁺.",
    confidence: "estimate",
    sources: ["weil-brady-2017"],
    simplification:
      "The order shifts with concentration and clay type. The game swaps whole ions all at once; real exchange is a gradual equilibrium.",
  },
  acid: {
    id: "c5-acid-displaces",
    text: "Acidity adds H⁺, which displaces base cations such as Ca²⁺ from exchange sites; once in the soil water they can be leached.",
    confidence: "firm",
    sources: ["weil-brady-2017"],
  },
  nitrate: {
    id: "c5-nitrate-leaches",
    text: "Nitrate (NO₃⁻) is an anion. Negative surfaces do not hold it, so it moves with draining water.",
    confidence: "firm",
    sources: ["cornell-fs22-cec", "weil-brady-2017"],
    simplification:
      "In real drainage every nitrate leaves with a cation partner, so nitrate leaching also carries calcium and other cations away. The game does not balance charge in the water.",
  },
  log: {
    id: "c5-ph-log",
    text: "pH is a logarithmic scale of H⁺ activity: one pH unit is a tenfold change.",
    confidence: "firm",
    sources: ["weil-brady-2017"],
  },
  availability: {
    id: "c5-availability",
    text: "Nutrient availability depends on pH. Phosphorus is most available near pH 6–7; below about pH 5.5 aluminium comes into solution and can be toxic to roots.",
    confidence: "estimate",
    sources: ["weil-brady-2017"],
    simplification:
      "The bars are teaching values with the shape of the textbook chart; real curves depend on the soil.",
  },
  lauber: {
    id: "c5-lauber",
    text: "Across 88 soils from North and South America, bacterial community composition tracked soil pH closely (r = 0.79).",
    confidence: "firm",
    evidence: "measured",
    sources: ["lauber-2009"],
    simplification: "A measured association across sites; on its own it does not show cause.",
  },
  groups: {
    id: "c5-acid-groups",
    text: "In acid soils Acidobacteria made up a larger share of the community; Actinobacteria and Bacteroidetes a larger share in near-neutral soils.",
    confidence: "estimate",
    sources: ["lauber-2009"],
    simplification:
      "These are relative shares: a group can look commoner because others fell. The dial's community bar is a schematic of the direction.",
  },
  rousk: {
    id: "c5-rousk",
    text: "Along a pH gradient within one arable field, where climate and parent material hardly differ, bacterial communities still changed strongly with pH; fungal communities changed less.",
    confidence: "firm",
    sources: ["rousk-2010"],
  },
  mechanism: {
    id: "c5-tolerance",
    text: "One known mechanism is tolerance: many bacterial groups grow well only within a narrow pH range.",
    confidence: "estimate",
    sources: ["rousk-2010"],
  },
  guo: {
    id: "c5-guo",
    text: "Topsoil pH in major Chinese croplands fell by about 0.5 units on average between the 1980s and the 2000s, mainly from heavy nitrogen fertiliser use.",
    confidence: "estimate",
    sources: ["guo-2010"],
  },
} satisfies Record<string, Fact>;

const c5Scenes: Scene[] = [
  {
    id: "c5-platelet",
    chapter: "c5",
    title: "A charged landscape",
    scale: "cell",
    recipe: "c5-platelet",
    seed: 53,
    scaleBar: { metres: 100e-9, label: "100 nm" },
    notToScale: 25,
    description:
      "Two clay platelets seen edge-on in soil water. On the left, a thick stack of swelling 2:1 layers with water between them; on the right, a thinner 1:1 stack. Pale cations hover just above both surfaces, many more over the left stack. Below, darker nitrate ions drift down through the water towards the drain.",
    truth: {
      drawnFrom: ["Clay layer structure after textbook diagrams of kaolinite and smectite"],
      schematic: [
        "Ions are drawn about 25× larger than true size",
        "Charges are drawn as evenly spaced sites; real charge sits across the layers and at the edges",
      ],
      invented: ["Numbers of sites and ions", "Exchange swaps whole ions in a fixed order"],
      notSimulated: [
        "Charge balance in the soil water",
        "Anions held by iron and aluminium oxides",
        "Swelling and cracking",
        "Nitrification",
      ],
    },
    up: "valley-map",
    objects: [
      {
        id: "smectite",
        label: "2:1 clay (smectite)",
        kind: "scan",
        anchor: { x: 0.24, y: 0.44 },
        portrait: { x: 0.5, y: 0.3 },
        scan: "A smectite stack: each layer is a sheet of aluminium sandwiched between two of silica. Water slips between the layers, so it swells. Its surfaces are crowded with negative charge.",
        facts: [F.clays, F.ranges],
      },
      {
        id: "kaolinite",
        label: "1:1 clay (kaolinite)",
        kind: "scan",
        anchor: { x: 0.56, y: 0.44 },
        portrait: { x: 0.5, y: 0.45 },
        scan: "A kaolinite stack: one silica sheet, one aluminium sheet, bound tight. No water gets between the layers, and few charges sit on it.",
        facts: [F.clays, F.ranges],
      },
      {
        id: "calcium",
        label: "Calcium on the surface",
        kind: "scan",
        anchor: { x: 0.24, y: 0.32 },
        portrait: { x: 0.72, y: 0.25 },
        scan: "A calcium ion, Ca²⁺, hovering over two negative charges. It is held, not stuck: another cation can take its place.",
        facts: [F.charge],
      },
      {
        id: "nitrate",
        label: "Nitrate in the soil water",
        kind: "scan",
        anchor: { x: 0.42, y: 0.76 },
        portrait: { x: 0.62, y: 0.54 },
        scan: "Nitrate, NO₃⁻, carries a negative charge like the clay. Nothing holds it here.",
        facts: [F.nitrate],
      },
    ],
    reviewStatus: "draft",
  },
];

const c5Missions: Mission[] = [
  {
    id: "c5-m1",
    chapter: "c5",
    title: "Cation musical chairs",
    tier: "T2",
    learningObjective: "Clay and organic matter hold cations on negative charges; acid displaces them.",
    misconceptionsTargeted: [],
    scene: "c5-platelet",
    steps: [
      {
        kind: "scan",
        text: "You are a few hundred nanometres from a clay surface. Scan the two clays and the calcium sitting on one of them.",
        objects: ["smectite", "kaolinite", "calcium"],
      },
      {
        kind: "predict-choice",
        id: "c5-m1-first",
        question:
          "A surface holds calcium, magnesium and potassium. Acid arrives as H⁺. Which cation do you expect to leave first?",
        choices: [
          {
            id: "K",
            label: "Potassium (K⁺)",
            ok: true,
            feedback: "Seat them and add acid to see.",
          },
          {
            id: "Ca",
            label: "Calcium (Ca²⁺)",
            ok: false,
            feedback: "Seat them and add acid to see.",
          },
          {
            id: "all",
            label: "All of them at once",
            ok: false,
            feedback: "Seat them and add acid a little at a time to see.",
          },
        ],
      },
      {
        kind: "exchange",
        mode: "chairs",
        text: "Seat cations on the eight negative charges until none is free. Then add acid two H⁺ at a time, and let it rain.",
        resultText:
          "The H⁺ took seats one charge at a time. Potassium was knocked off first, then magnesium; calcium held on longest. Rain carried what was knocked off towards the drain.",
        facts: [F.charge, F.series, F.acid],
      },
      {
        kind: "explain-choice",
        id: "c5-m1-why",
        question: "Why did calcium hold on longer than potassium?",
        choices: [
          {
            id: "charge",
            label: "It carries two positive charges, so the surface holds it more tightly",
            ok: true,
            feedback:
              "Yes. More charge, and a small hydrated size, mean a tighter hold. H⁺ is held tighter still, which is why acid wins seats.",
          },
          {
            id: "heavy",
            label: "It is heavier, so it sinks onto the clay",
            ok: false,
            feedback: "Weight plays no part at this scale. What did the surface and the ions each carry?",
          },
          {
            id: "first",
            label: "It was seated first",
            ok: false,
            feedback: "Try seating potassium first next time. Does the order change?",
          },
        ],
      },
      {
        kind: "discover",
        text: "Clay is a magnet for cations.",
        discoveries: ["d-c5-magnet"],
        codex: ["cx-c5-cec"],
      },
    ],
    sources: ["cornell-fs22-cec", "weil-brady-2017", "wrb-2022"],
    simplificationNotes: [
      "Eight charges stand in for the millions on a real platelet; ions swap whole and in a fixed order.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c5-m2",
    chapter: "c5",
    title: "Leaky nitrate",
    tier: "T2",
    learningObjective:
      "Anions such as nitrate are not held by negative surfaces, so they leach; cations stay.",
    misconceptionsTargeted: [],
    scene: "c5-platelet",
    steps: [
      {
        kind: "predict-choice",
        id: "c5-m2-drain",
        question:
          "You scatter fertiliser beads: the same number of ammonium (NH₄⁺) and nitrate (NO₃⁻). Then it rains. Which reaches the drain first?",
        choices: [
          { id: "NO3", label: "Nitrate", ok: true, feedback: "Add the beads and let it rain." },
          { id: "NH4", label: "Ammonium", ok: false, feedback: "Add the beads and let it rain." },
          {
            id: "same",
            label: "Both the same: both dissolve",
            ok: false,
            feedback: "Both dissolve. Does the clay treat them the same?",
          },
        ],
      },
      {
        kind: "exchange",
        mode: "leaky",
        text: "Add fertiliser to the soil water, then let it rain at least twice.",
        resultText:
          "The nitrate washed through to the drain; the ammonium stayed seated on the clay. Fertilise past the surface's eight charges and ammonium starts to leave too.",
        facts: [F.nitrate, F.charge],
      },
      {
        kind: "explain-choice",
        id: "c5-m2-why",
        question: "Why did the ammonium stay?",
        choices: [
          {
            id: "charge",
            label: "It is positive, and the clay surface is negative; nitrate is negative too",
            ok: true,
            feedback:
              "Yes. The surface holds cations; anions find nothing to hold them and go with the water.",
          },
          {
            id: "dissolve",
            label: "Ammonium does not dissolve",
            ok: false,
            feedback: "Both dissolve readily. Look at where each one sat while it rained.",
          },
          {
            id: "in",
            label: "Nutrients are simply in the soil until a root takes them",
            ok: false,
            feedback:
              "Most nutrients are on surfaces, in minerals or in organic matter, and only a small part is in the water at any moment. Where it sits decides whether rain takes it.",
          },
        ],
      },
      {
        kind: "notice",
        text: "Ammonium does not stay ammonium for long. In warm, moist soil, microbes turn it into nitrate, and then the rain can take it. That relay is chapter 9.",
      },
      {
        kind: "discover",
        text: "Negative surfaces hold cations; nitrate, an anion, washes through.",
        discoveries: ["d-c5-leaky"],
        codex: ["cx-c5-leaching"],
      },
    ],
    sources: ["cornell-fs22-cec", "weil-brady-2017", "guo-2010"],
    simplificationNotes: [
      "Rain takes half of what is in the soil water each time; charge balance in the water is not simulated.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c5-m3",
    chapter: "c5",
    title: "The pH predictor",
    tier: "T4",
    learningObjective:
      "pH is a master variable; its strong link to bacterial communities is an association with mechanisms, not yet proof of cause.",
    misconceptionsTargeted: ["M6", "M25"],
    scene: "c5-platelet",
    steps: [
      {
        kind: "ph-dial",
        text: "Turn the pH dial from acid to alkaline. Watch the H⁺, the nutrient bars and the bacterial community.",
        resultText:
          "Each step down the dial multiplied the H⁺ tenfold. Phosphorus was most available near pH 6–7, aluminium came into the water below about 5.5, and the community shifted with the dial.",
        facts: [F.log, F.availability, F.groups],
      },
      {
        kind: "explain-choice",
        id: "c5-m3-ideal",
        question: "So is pH 7 the right pH for every crop?",
        choices: [
          {
            id: "depends",
            label: "No: the best pH differs by crop and by soil",
            ok: true,
            feedback:
              "Yes. Blueberries want acid soil; many legumes need near-neutral soil to form nodules. There is no single ideal.",
          },
          {
            id: "seven",
            label: "Yes: neutral is ideal",
            ok: false,
            feedback:
              "Neutral suits many crops, not all. Which nutrients were less available at pH 7 on the dial?",
            misconception: "M6",
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c5-m3-cause",
        question:
          "Across 88 soils from the Americas, bacterial community composition tracked soil pH closely (r = 0.79). Does pH cause the shift?",
        choices: [
          {
            id: "association",
            label:
              "It is a strong, replicated association with a known mechanism, but what varies with pH must be checked before calling it the cause",
            ok: true,
            feedback:
              "Yes. Bacterial tolerance of H⁺ is a mechanism, and a gradient inside one field gave the same pattern. Climate, plants and organic matter still change with pH across a continent.",
          },
          {
            id: "cause",
            label: "Yes: a correlation that strong proves pH drives the community",
            ok: false,
            feedback:
              "Strength is not proof. Across 88 sites, what else changes from an acid soil to an alkaline one?",
            misconception: "M25",
          },
          {
            id: "nothing",
            label: "No: a correlation tells you nothing",
            ok: false,
            feedback:
              "A replicated association with a mechanism is real evidence. It is not yet proof of cause, which is a different thing from nothing.",
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c5-m3-check",
        question: "Which study would test pH itself, rather than what comes with it?",
        choices: [
          {
            id: "one-field",
            label:
              "Compare bacteria along a pH gradient inside one field, where climate and rock are the same",
            ok: true,
            feedback: "Yes. That is what a study of one arable field did, and bacteria still followed pH.",
          },
          {
            id: "lime",
            label: "Lime half of a plot, leave the other half, and compare after some years",
            ok: true,
            feedback:
              "Yes. Changing pH yourself, with everything else the same, is the strongest test of cause.",
          },
          {
            id: "more",
            label: "Sample many more soils across the continent",
            ok: false,
            feedback:
              "More sites sharpen the association, but climate and plants still change with pH from site to site.",
          },
        ],
      },
      {
        kind: "discover",
        text: "Strong association is not yet cause.",
        discoveries: ["d-c5-log", "d-c5-association"],
        codex: ["cx-c5-ph"],
      },
    ],
    sources: ["lauber-2009", "rousk-2010", "weil-brady-2017"],
    simplificationNotes: [
      "Availability bars and the community bar are teaching values and a schematic of the reported direction, not data.",
    ],
    reviewStatus: "draft",
  },
];

const c5Codex: CodexEntry[] = [
  {
    id: "cx-c5-cec",
    title: "Charged surfaces",
    chapter: "c5",
    body: [
      "Clay platelets and organic matter carry mostly negative charge. Cations hover over it, held but free to swap places with others: that swapping is cation exchange, and how much a soil can hold is its CEC.",
      "Clays differ. A 1:1 clay such as kaolinite holds little; a 2:1 clay such as smectite holds far more and swells when wet. Organic matter holds more again, weight for weight.",
    ],
    facts: [F.charge, F.ranges, F.clays, F.series],
    simplification:
      "Exchange is shown as whole ions swapping in a fixed order; real exchange is a gradual equilibrium.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c5-leaching",
    title: "What the rain takes",
    chapter: "c5",
    body: [
      "Negative surfaces hold cations such as ammonium, calcium and potassium. Anions such as nitrate find nothing to hold them and go with the draining water.",
      "Acid adds H⁺, which takes seats from calcium and magnesium. Once knocked off, they can be leached too, and the soil grows more acid. Ammonium fertiliser feeds this: where it is used heavily, cropland soils have acidified measurably within decades.",
    ],
    facts: [F.nitrate, F.acid],
    realWorld: [F.guo],
    simplification:
      "Charge balance in the soil water is not simulated: real nitrate leaves with a cation partner.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c5-ph",
    title: "pH, the master variable",
    chapter: "c5",
    body: [
      "pH is logarithmic: pH 5 has ten times the H⁺ of pH 6. It sets which nutrients are available, whether aluminium dissolves, and which microbes thrive.",
      "Across many soils, pH is the best single predictor of which bacteria live there. That is a strong, replicated association with a known mechanism. It is not yet proof of cause: other gradients change with pH and must be checked.",
    ],
    facts: [F.log, F.availability, F.lauber, F.groups, F.rousk, F.mechanism],
    openQuestion: {
      claim: "pH determines the soil microbiome.",
      sides: [
        "pH is the strongest single predictor of bacterial community composition across many soils, and the pattern holds within one field.",
        "Climate, plants, organic matter and parent rock vary with pH between sites; pH is one driver among co-varying gradients, and fungi track it less closely.",
      ],
      sources: ["lauber-2009", "rousk-2010"],
    },
    reviewStatus: "draft",
  },
];

export const c5Bundle: ChapterBundle = {
  chapter: c5,
  scenes: c5Scenes,
  missions: c5Missions,
  codex: c5Codex,
  rumors: c5Rumors,
};
