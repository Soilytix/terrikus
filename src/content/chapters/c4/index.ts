/**
 * Chapter 4 — Breath and Rust (world-bible §6). Oxygen, anaerobic microsites,
 * the redox ladder and the methane–nitrous-oxide trade-off of a rice paddy, on
 * the rules in `src/sim/redox.ts` (N₂O from the nitrogen engine).
 * Deviation, recorded: `c4-m4` "Warm it up" (Q₁₀), the `c4-fog` aggregate
 * scene and the two expected cause chains wait for a later pass; microsites are
 * drawn in the mission panel instead. No new misconception ids: the chapter's
 * two extra misconceptions are addressed in feedback under M5 and M4.
 */
import type { ChapterBundle, CodexEntry, Mission, Scene } from "../../schema";
import { c4, c4Rumors } from "./chapter";
import { F } from "./facts";

const c4Scenes: Scene[] = [
  {
    id: "c4-paddy",
    chapter: "c4",
    title: "The rice paddy",
    scale: "field",
    recipe: "c4-paddy",
    seed: 83,
    scaleBar: { metres: 10, label: "10 m" },
    description:
      "A flooded rice paddy at the bottom of the valley. Rows of green rice stand in still, sky-coloured water behind a low earth bank; small bubbles rise between the stems and break at the surface. The hill and its woodland sit pale in the distance.",
    truth: {
      drawnFrom: ["A generic lowland rice paddy: bunds, rows of rice, standing water"],
      schematic: ["Bubbles are drawn larger and more often than you would see them"],
      invented: ["This paddy, its rows and its bubbles"],
      notSimulated: ["Water flow between paddies", "Plant growth", "Weather"],
    },
    up: "valley-map",
    objects: [
      {
        id: "rice",
        label: "Rice plants",
        kind: "scan",
        anchor: { x: 0.3, y: 0.56 },
        scan: "Rice grows with its feet in water. Its stems and roots are partly hollow: air runs down them to the roots, and some leaks out into the mud.",
        facts: [F.aerenchyma],
      },
      {
        id: "bubbles",
        label: "Bubbles in the water",
        kind: "scan",
        anchor: { x: 0.62, y: 0.72 },
        card: "methanogen",
        scan: "Bubbles rise from the mud and break at the surface. Most of the gas is methane, made far below where there is no oxygen at all.",
        facts: [F.methane],
      },
      {
        id: "smell",
        label: "The smell of the mud",
        kind: "scan",
        anchor: { x: 0.82, y: 0.86 },
        scan: "Stir the mud at the bank and it smells of rotten eggs. Something down there is making hydrogen sulfide, and the rice beside it is green and well.",
        facts: [F.smell],
      },
      {
        id: "elevator-portal",
        label: "Down into the flooded soil",
        kind: "portal",
        anchor: { x: 0.16, y: 0.78 },
        to: "c4-elevator",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c4-elevator",
    chapter: "c4",
    title: "The redox elevator",
    scale: "profile",
    recipe: "c4-elevator",
    seed: 89,
    scaleBar: { metres: 0.1, label: "10 cm" },
    description:
      "A cut through the flooded paddy, from the floodwater down. Under the water lies a thin brown skin of soil; below it the soil turns grey-green, darker with depth, with black stains near the bottom. Orange rust coats the channels of rice roots running down through the grey. Bubbles gather at the bottom and rise along the roots. An elevator shaft runs down the middle, with a stop at each floor.",
    truth: {
      drawnFrom: [
        "Paddy and gley soil profiles: oxidised surface layer, grey matrix, rust mottles along roots",
      ],
      schematic: [
        "The floors are evenly spaced for reading; real redox zones are millimetres to centimetres thick and overlap",
        "The elevator is a device for descending the ladder, not a real instrument",
      ],
      invented: ["This profile and its exact colours"],
      notSimulated: ["pH", "Temperature", "Mixing by animals"],
    },
    up: "c4-paddy",
    objects: [
      {
        id: "floor-o2",
        label: "Top floor: the brown skin",
        kind: "scan",
        anchor: { x: 0.66, y: 0.17 },
        scan: "A few millimetres of brown soil under the water. Oxygen from the water reaches this far, and no further.",
        facts: [F.diffusion],
      },
      {
        id: "floor-no3",
        label: "Second floor: nitrate",
        kind: "scan",
        anchor: { x: 0.66, y: 0.3 },
        card: "denitrifier",
        scan: "No oxygen left. Denitrifying bacteria breathe nitrate instead, and nitrogen leaves as gas.",
        facts: [F.ladder],
      },
      {
        id: "floor-fe",
        label: "Third floor: manganese and iron",
        kind: "scan",
        anchor: { x: 0.66, y: 0.48 },
        scan: "Grey-green soil: iron that once coloured it rust has been reduced and washed out of the grains. Along the rice roots, leaked oxygen rusts it orange again.",
        facts: [F.colour],
      },
      {
        id: "floor-so4",
        label: "Fourth floor: sulfate",
        kind: "scan",
        anchor: { x: 0.66, y: 0.68 },
        scan: "Black stains of iron sulfide, and the rotten-egg smell of the bank. Sulfate reducers live here.",
        facts: [F.smell],
      },
      {
        id: "floor-ch4",
        label: "Bottom floor: methane",
        kind: "scan",
        anchor: { x: 0.66, y: 0.87 },
        card: "methanogen",
        scan: "Every richer acceptor is spent. Methane-making archaea turn the last of the carbon into methane, which rises in bubbles and up through the rice.",
        facts: [F.methane, F.aerenchyma],
      },
      {
        id: "probe",
        label: "A redox probe",
        kind: "scan",
        anchor: { x: 0.24, y: 0.4 },
        scan: "A redox probe pushed in at one depth. It reads one number, here and now; a hand's width away, or tomorrow, it may read another.",
        facts: [F.probe],
      },
    ],
    reviewStatus: "draft",
  },
];

const FLOORS = {
  O2: "Top floor, the brown skin: oxygen from the floodwater reaches a few millimetres. Aerobic microbes breathe it, as you do.",
  NO3: "Second floor: oxygen is gone. Denitrifiers breathe nitrate; nitrogen leaves as N₂ gas, a little as N₂O.",
  Mn: "Third floor, upper part: black specks of manganese oxide dissolve as microbes hand them electrons.",
  Fe: "Third floor, lower part: rust-coloured iron is reduced and dissolves. The soil turns grey-green: gley.",
  SO4: "Fourth floor: sulfate reducers make hydrogen sulfide. The smell of rotten eggs; black stains of iron sulfide.",
  CO2: "Bottom floor: methane-making archaea. Carbon dioxide and acetate become methane, which bubbles up.",
};

const c4Missions: Mission[] = [
  {
    id: "c4-m1",
    chapter: "c4",
    title: "Ride the redox elevator",
    tier: "T2",
    learningObjective:
      "When oxygen runs out, microbes use the redox ladder in order, and each step leaves its colour, smell or gas.",
    misconceptionsTargeted: ["M5"],
    scene: "c4-paddy",
    steps: [
      {
        kind: "scan",
        text: "The rumor says the flooded field smells of eggs, and the rice is fine. Look around the paddy first.",
        objects: ["rice", "bubbles", "smell"],
      },
      {
        kind: "predict-choice",
        id: "c4-m1-dead",
        question: "Below the brown skin, the flooded soil has no oxygen at all. What lives there?",
        choices: [
          {
            id: "nothing",
            label: "Nothing much: without oxygen, life stops",
            ok: false,
            feedback: "Then where do the bubbles and the smell come from? Go down and look.",
            misconception: "M5",
          },
          {
            id: "different",
            label: "Microbes that breathe something other than oxygen",
            ok: true,
            feedback: "Go down and see what they breathe.",
          },
          {
            id: "dormant",
            label: "Only dormant cells, waiting for air",
            ok: false,
            feedback: "Some wait. Something down there is busy, though: the bubbles keep coming.",
            misconception: "M5",
          },
        ],
      },
      {
        kind: "go",
        text: "Take the elevator down into the flooded soil.",
        scene: "c4-elevator",
        object: "elevator-portal",
      },
      {
        kind: "redox",
        bench: "elevator",
        text: "Each floor down, the richest acceptor above is used up. Pick the card the microbes on this floor breathe; the elevator descends when you have it.",
        floors: FLOORS,
        resultText:
          "Six acceptors, always in the same order: oxygen, nitrate, manganese, iron, sulfate, then carbon dioxide to methane. Each floor down yields the microbes less energy, and none of them is idle.",
        facts: [F.ladder, F.eh],
      },
      {
        kind: "explain-choice",
        id: "c4-m1-eggs",
        question: "So why does the paddy smell of eggs while the rice stays healthy?",
        choices: [
          {
            id: "ladder",
            label: "Sulfate reducers make the smell deep down; rice brings air to its own roots",
            ok: true,
            feedback:
              "Yes. The smell is a sign of one floor of the ladder at work, and the rice keeps its roots supplied through hollow tissue.",
          },
          {
            id: "rotting",
            label: "The soil is rotting and the rice will suffer soon",
            ok: false,
            feedback:
              "Flooded paddies smell like this every season. The microbes are busy, not dying; look at what rice does for its roots.",
            misconception: "M5",
          },
          {
            id: "rock",
            label: "The grey soil is a different rock with its own smell",
            ok: false,
            feedback:
              "Same grains as the brown skin above. The grey is iron that has been reduced and washed out; drain it and rust comes back.",
          },
        ],
        onComplete: { rumors: { "r-c4": "explained" } },
      },
      {
        kind: "discover",
        text: "Anaerobic is not dead: it runs on different chemistry. Grey and rust are a diary of water.",
        discoveries: ["d-c4-anaerobic", "d-c4-diary"],
        cards: ["denitrifier", "methanogen"],
        codex: ["cx-c4-ladder"],
      },
    ],
    sources: ["borch-2010", "weil-brady-2017", "nrcs-soil-survey-manual", "saunois-2020"],
    simplificationNotes: [
      "Mn and Fe share one floor on the elevator; floors are evenly spaced, real redox zones are not.",
      "The order is fixed in the game; in real soil the steps overlap.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c4-m2",
    chapter: "c4",
    title: "Where is the air?",
    tier: "T2",
    learningObjective: "Anaerobic microsites exist even in drained soil, inside larger and wetter crumbs.",
    misconceptionsTargeted: ["M4", "M5"],
    scene: "c4-elevator",
    steps: [
      {
        kind: "predict-choice",
        id: "c4-m2-where",
        question:
          "The spinach field up the slope is drained and moist, not flooded. Is there anywhere in it without oxygen?",
        choices: [
          {
            id: "none",
            label: "No: a drained field is aerobic all through",
            ok: false,
            feedback: "Most of its pore space is full of air. Is every crumb's centre?",
          },
          {
            id: "inside",
            label: "Yes: inside larger crumbs, where oxygen is used before it reaches the middle",
            ok: true,
            feedback: "Try it with the levers.",
          },
          {
            id: "deep",
            label: "Only deep down, below the roots",
            ok: false,
            feedback: "Deep soil can run short. Is that the only place?",
          },
        ],
      },
      {
        kind: "redox",
        bench: "microsites",
        text: "Set how wet the soil is and how big the crumb is. The shaded core is where oxygen runs out before it gets there.",
        resultText:
          "A large crumb in moist, drained soil still had an airless core; a small one did not. Wetter soil grew the core in both, because oxygen crawls through water.",
        facts: [F.microsites, F.diffusion],
      },
      {
        kind: "explain-choice",
        id: "c4-m2-why",
        question: "What decided whether a crumb had an airless core?",
        choices: [
          {
            id: "both",
            label: "How far oxygen gets before it is used, against how far it has to go",
            ok: true,
            feedback:
              "Yes. Water slows oxygen down; size makes the trip longer. Either one can tip a crumb's centre anaerobic.",
          },
          {
            id: "water",
            label: "Only whether the field is flooded",
            ok: false,
            feedback: "Look at the large crumb in moist soil: no flooding, still a core.",
            misconception: "M4",
          },
          {
            id: "either",
            label: "A field is either aerobic or anaerobic; crumbs follow the field",
            ok: false,
            feedback: "The same field held both at once: air between crumbs, none in some centres.",
            misconception: "M5",
          },
        ],
      },
      {
        kind: "discover",
        text: "Even a drained field has airless pockets inside its larger crumbs.",
        discoveries: ["d-c4-microsites"],
        codex: ["cx-c4-microsites"],
      },
    ],
    sources: ["keiluweit-2017", "weil-brady-2017"],
    simplificationNotes: [
      "Round crumbs with one oxygen reach per wetness; the reach values are teaching values.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c4-m3",
    chapter: "c4",
    title: "Drain the paddy",
    tier: "T3",
    learningObjective:
      "Flooding trades one thing for another: draining lowers methane and can raise nitrous oxide. There is no winner and no score.",
    misconceptionsTargeted: ["M4"],
    scene: "c4-paddy",
    steps: [
      {
        kind: "predict-choice",
        id: "c4-m3-predict",
        question:
          "Instead of keeping the paddy flooded all season, the farmer drains it for five days in every fourteen. What happens to the two gases?",
        choices: [
          {
            id: "both-down",
            label: "Both fall: drained soil is healthier",
            ok: false,
            feedback: "Run the season and watch both curves.",
            misconception: "M4",
          },
          {
            id: "trade",
            label: "Methane falls; nitrous oxide may rise",
            ok: true,
            feedback: "Run the season and watch both curves.",
          },
          {
            id: "none",
            label: "Neither changes much: five days is too short",
            ok: false,
            feedback: "Run the season and watch both curves.",
          },
        ],
      },
      {
        kind: "redox",
        bench: "drain",
        text: "Run one season both ways: kept flooded, and drained in spells. Methane comes from the ladder's bottom floor; nitrous oxide from the nitrogen engine you met before.",
        resultText:
          "Each drain sent the ladder back to the top, and methane fell well below the flooded season's. But each spell of air made nitrate, and when the water came back denitrifiers turned some of it into nitrous oxide: its curve jumped after every reflood.",
        facts: [F.drainage, F.n2o, F.methane],
      },
      {
        kind: "explain-choice",
        id: "c4-m3-tradeoff",
        question: "Is draining the paddy better?",
        choices: [
          {
            id: "depends",
            label: "It depends on what you value and measure",
            ok: true,
            feedback:
              "Yes. One gas fell and one rose. Which matters more depends on the time horizon you weigh them over, what else you count (water, yield, nitrogen lost) and what you can measure in this field.",
          },
          {
            id: "yes",
            label: "Yes: methane fell a lot",
            ok: false,
            feedback: "It did. Look at the other curve: what happened after each reflood?",
          },
          {
            id: "no",
            label: "No: nitrous oxide rose",
            ok: false,
            feedback: "It did. Look at the methane curve too: is one gas the whole story?",
          },
        ],
      },
      {
        kind: "discover",
        text: "Draining traded methane for nitrous oxide.",
        discoveries: ["d-c4-tradeoff"],
        codex: ["cx-c4-tradeoff"],
      },
    ],
    sources: ["saunois-2020", "tian-2020", "ipcc-ar6-wg1-ch7", "borch-2010"],
    simplificationNotes: [
      "Methane is counted as made, not as emitted; the rice plant's own gas transport is not modelled.",
      "N₂O comes from the nitrogen engine's denitrification only; both curves are teaching units and are never added up.",
    ],
    reviewStatus: "draft",
  },
];

const c4Codex: CodexEntry[] = [
  {
    id: "cx-c4-ladder",
    title: "The redox ladder",
    chapter: "c4",
    body: [
      "Microbes get energy by moving electrons from food to an acceptor. Oxygen gives the most energy, so it goes first. When it runs out, microbes turn to nitrate, then manganese and iron oxides, then sulfate, and finally carbon dioxide, which becomes methane.",
      "Each step leaves a trace you can see or smell: grey soil where iron was reduced, rust where air came back, the egg smell of sulfide, bubbles of methane. A soil's colours are a diary of how wet it has been.",
    ],
    facts: [F.ladder, F.eh, F.colour, F.smell],
    realWorld: [F.probe],
    simplification: "One step at a time, in strict order; real soil runs several at once side by side.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c4-microsites",
    title: "Airless pockets",
    chapter: "c4",
    body: [
      "Oxygen moves into soil by diffusion, about ten thousand times more slowly through water than through air. Inside a crumb, microbes use it on the way in.",
      "In a large or wet crumb the centre can run out even when the field is drained. Those pockets run the lower floors of the ladder: a field is never simply aerobic or anaerobic.",
    ],
    facts: [F.microsites, F.diffusion],
    reviewStatus: "draft",
  },
  {
    id: "cx-c4-tradeoff",
    title: "Methane against nitrous oxide",
    chapter: "c4",
    body: [
      "Keeping a paddy flooded lets the ladder reach its bottom floor, where methane is made. Draining it sends the ladder back to the top, so methane falls.",
      "The same air lets nitrate form; when the water returns, some of that nitrate leaves as nitrous oxide. There is no single best answer: it depends on what you value, over what time horizon, and on what you can measure.",
    ],
    facts: [F.drainage, F.methane, F.n2o],
    realWorld: [F.gwp],
    reviewStatus: "draft",
  },
];

export const c4Bundle: ChapterBundle = {
  chapter: c4,
  scenes: c4Scenes,
  missions: c4Missions,
  codex: c4Codex,
  rumors: c4Rumors,
};
