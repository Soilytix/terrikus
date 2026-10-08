/**
 * Chapter 11 — Pit Walls and Deep Time (world-bible §6). Pedogenesis, horizons
 * and the catena, on the rules in `src/sim/pedogenesis.ts` and `src/sim/catena.ts`.
 * Soil names are WRB examples, never survey results; WRB vs USDA is OD-11, open.
 * Deviation, recorded: the `c11-munsell` colour-chip scene and the two expected
 * cause chains wait for a later pass.
 */
import type { HorizonId } from "../../../sim/pedogenesis";
import type { ChapterBundle, CodexEntry, Fact, Mission, Scene, SceneObject, Timelapse } from "../../schema";
import { c11, c11Rumors } from "./chapter";

const F = {
  body: {
    id: "c11-body",
    text: "Soil is a natural body formed in place from parent material by additions, losses, transformations and translocations. It is not just ground-up rock.",
    confidence: "firm",
    sources: ["nrcs-soil-survey-manual"],
  },
  clorpt: {
    id: "c11-clorpt",
    text: "Five state factors control what soil forms: climate, organisms, relief, parent material and time. Humans are often treated as a sixth.",
    confidence: "firm",
    sources: ["jenny-1941", "nrcs-soil-survey-manual", "fao-2015-swsr"],
  },
  horizons: {
    id: "c11-horizons",
    text: "Horizons are named O (organic litter), A (mineral topsoil darkened by organic matter), E (bleached, having lost clay, iron or aluminium), B (where material accumulates or structure develops), C (little-altered parent material) and R (bedrock).",
    confidence: "firm",
    sources: ["nrcs-field-book"],
  },
  notAll: {
    id: "c11-not-all",
    text: "Many soils lack some horizons. A young soil on a river terrace may be only A over C.",
    confidence: "firm",
    sources: ["nrcs-field-book"],
  },
  colour: {
    id: "c11-colour",
    text: "Colour is evidence: dark means organic matter, red and yellow mean oxidised iron, grey with rust mottles means periods of waterlogging.",
    confidence: "firm",
    sources: ["nrcs-field-book"],
  },
  podzol: {
    id: "c11-podzol",
    text: "Under acid litter, in a climate where water drains through, on a sandy parent material, organic acids carry iron and aluminium down: an E bleaches pale and the B beneath turns dark and rusty.",
    confidence: "firm",
    sources: ["nrcs-soil-survey-manual", "wrb-2022"],
    simplification:
      "One index multiplies climate, litter, parent material and time; the time constants are invented teaching values.",
  },
  mixing: {
    id: "c11-mixing",
    text: "Soil is mixed both ways: water carries material down, while earthworms, ants and roots carry it up.",
    confidence: "firm",
    sources: ["jrc-2016-gsba"],
  },
  slowForm: {
    id: "c11-slow-form",
    text: "A profile like this takes thousands of years to develop; the frames at 0, 100, 1,000 and 10,000 years are teaching stages, not dated ones.",
    confidence: "estimate",
    sources: ["nrcs-soil-survey-manual"],
    simplification: "Each frame is the teaching model at that age; real profiles vary with every factor.",
  },
  catena: {
    id: "c11-catena",
    text: "Down a hill, position controls drainage and wetness, so different soils form side by side under the same climate: a catena.",
    confidence: "firm",
    sources: ["nrcs-soil-survey-manual"],
    simplification: "Three pits and a fixed seasonal water table at each; real slopes grade continuously.",
  },
  redox: {
    id: "c11-redox",
    text: "Where soil stays saturated, iron is reduced, moves and leaves a grey matrix. Where the water table rises and falls, iron reoxidises in rust mottles.",
    confidence: "firm",
    sources: ["nrcs-field-book"],
  },
  relict: {
    id: "c11-relict",
    text: "Redox colours can outlast the wetness that made them: after drainage, mottles may be relict. Colour alone cannot date the wetness; water-table readings across a year can.",
    confidence: "firm",
    sources: ["nrcs-soil-survey-manual", "nrcs-field-book"],
  },
  wrb: {
    id: "c11-wrb",
    text: "The World Reference Base names 32 Reference Soil Groups; Podzols, Cambisols, Luvisols and Gleysols are four of them. The names here are examples of what such pits often resemble, not survey results.",
    confidence: "firm",
    sources: ["wrb-2022"],
  },
  map: {
    id: "c11-map",
    text: "A soil map is an interpretation drawn from pits and covariates such as slope and vegetation. It is not a measurement of every square metre.",
    confidence: "firm",
    sources: ["nrcs-soil-survey-manual"],
  },
  formRate: {
    id: "c11-form-rate",
    text: "In Europe soil forms at roughly 0.3–1.4 t per hectare a year from weathering and dust. At a bulk density of 1.3 g/cm³ that is about 90 to 430 years per centimetre.",
    confidence: "estimate",
    evidence: "derived",
    sources: ["verheijen-2009"],
    simplification: "One bulk density stands for every soil.",
  },
  fao: {
    id: "c11-fao",
    text: "Public messaging says a centimetre of topsoil can take up to 1,000 years to form. Real rates vary widely with climate and parent material.",
    confidence: "estimate",
    sources: ["fao-2015-swsr"],
  },
  erosion: {
    id: "c11-erosion",
    text: "Conventional plough agriculture erodes soil 10 to 100 times faster than it forms.",
    confidence: "estimate",
    sources: ["montgomery-2007"],
  },
} satisfies Record<string, Fact>;

/**
 * The summit profile from `profileAt(CATENA[0].factors)` and the pit anchors on
 * the plates, as literals so the sim stays out of the initial bundle;
 * `tests/c11.test.ts` holds them to the model.
 */
export const SUMMIT: { id: HorizonId; top: number; bottom: number; y: number }[] = [
  { id: "O", top: 0, bottom: 6, y: 0.219 },
  { id: "A", top: 6, bottom: 14, y: 0.264 },
  { id: "E", top: 14, bottom: 25, y: 0.325 },
  { id: "Bs", top: 25, bottom: 39, y: 0.405 },
  { id: "C", top: 39, bottom: 120, y: 0.547 },
];
/** Summit, midslope, toeslope and detective pits on `c11-catena`. */
export const PIT_ANCHORS = [
  { x: 0.21, y: 0.448 },
  { x: 0.35, y: 0.61 },
  { x: 0.6, y: 0.8 },
  { x: 0.47, y: 0.755 },
];
const cm = (a: number, b: number) => `${a}–${b} cm`;

/** One scan per horizon of the woodland pit, labelled by depth only: naming them is the mission. */
const EVIDENCE: Record<HorizonId, string> = {
  Bw: "Browner than the sand below, weathered in place.",
  O: "Needles and twigs, some whole, some rotted to a dark felt. Nothing here is mineral.",
  A: "Dark grey-brown mineral soil, full of fine roots.",
  E: "A pale, almost white band of loose sand grains with nothing coating them.",
  Bs: "Dark rusty brown, the grains coated and stuck together.",
  C: "Yellowish loose sand, much as it was laid down.",
};
const horizonObjects: SceneObject[] = SUMMIT.map((h, i) => ({
  id: `hz-${h.id.toLowerCase()}`,
  label: `Layer at ${cm(h.top, h.bottom)}`,
  kind: "scan",
  anchor: { x: i % 2 ? 0.66 : 0.34, y: h.y },
  scan: EVIDENCE[h.id],
  facts: [h.id === "E" || h.id === "Bs" ? F.podzol : F.horizons],
}));

const c11Scenes: Scene[] = [
  {
    id: "c11-pit",
    chapter: "c11",
    title: "The woodland pit",
    scale: "profile",
    recipe: "c11-pit",
    seed: 83,
    scaleBar: { metres: 0.2, label: "20 cm" },
    description:
      "A pit dug under the pines on the hilltop, its wall cut clean. Under a thin dark mat of needles lies a dark band full of roots, then a startling pale band, almost white, then a dark rusty band, and below it yellowish sand down to the floor of the pit.",
    truth: {
      drawnFrom: ["Podzol profiles in soil survey photographs and field descriptions"],
      schematic: ["Horizon depths come from the teaching model, not from a surveyed pit"],
      invented: ["This pit and its woodland"],
      notSimulated: ["Burrowing animals", "Seasonal change in the litter"],
    },
    up: "valley",
    objects: [
      ...horizonObjects,
      {
        id: "catena-portal",
        label: "Out of the pit and down the hill",
        kind: "portal",
        anchor: { x: 0.5, y: 0.15 },
        to: "c11-catena",
        requires: "c11-m2-done",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c11-catena",
    chapter: "c11",
    title: "Three pits down the hill",
    scale: "landscape",
    recipe: "c11-catena",
    seed: 89,
    scaleBar: { metres: 100, label: "100 m" },
    description:
      "The valley's hill from the side: pines on the summit, crop strips down the slope and a flooded paddy at the foot. Three pits are cut into it. The summit pit shows a pale band over a rusty one; the slope pit is brown all the way down; the paddy pit is grey with rust spots. A fourth pit sits beside a ditch at the foot of the field.",
    truth: {
      drawnFrom: ["Catena diagrams in soil survey references"],
      schematic: [
        "The pits are drawn about 40× larger than the hill around them",
        "Each pit is the teaching model's profile for its position",
      ],
      invented: ["This hill, its land use and its water table"],
      notSimulated: ["Water moving downslope", "Erosion and deposition", "Seasons"],
    },
    up: "c11-pit",
    objects: [
      {
        id: "summit-pit",
        label: "Summit pit under the woodland",
        kind: "scan",
        anchor: PIT_ANCHORS[0]!,
        scan: "A pale bleached band over a rusty one, as in the woodland pit. The water table never reaches it.",
        facts: [F.podzol, F.catena],
      },
      {
        id: "slope-pit",
        label: "Mid-slope pit in the field",
        kind: "scan",
        anchor: PIT_ANCHORS[1]!,
        scan: "Brown all the way down, browner than the parent loam: weathered in place. No grey, no mottles.",
        facts: [F.catena, F.colour],
      },
      {
        id: "toe-pit",
        label: "Toeslope pit by the paddy",
        kind: "scan",
        anchor: PIT_ANCHORS[2]!,
        scan: "Rust spots from a hand's width down, and grey below where the water never leaves.",
        facts: [F.redox],
      },
      {
        id: "detective-pit",
        label: "Pit beside the ditch",
        kind: "scan",
        anchor: PIT_ANCHORS[3]!,
        scan: "Brown above, rust mottles from 35 to 70 cm, grey below. A ditch drains this field today.",
        facts: [F.redox, F.relict],
      },
      {
        id: "pit-portal",
        label: "Back to the woodland pit",
        kind: "portal",
        anchor: { x: 0.12, y: 0.22 },
        to: "c11-pit",
      },
    ],
    reviewStatus: "draft",
  },
];

/** Watch this profile form: the woodland pit at four ages, baked by `tools/bake-plates.ts`. */
export const c11Timelapse: Timelapse = {
  id: "c11-timelapse",
  compression: "Time compressed: 10,000 years in 12 seconds. Each frame is ten times older than the last.",
  frames: [
    { label: "Year 0: fresh sand", recipe: "c11-form-0", seed: 83 },
    { label: "Year 100", recipe: "c11-form-100", seed: 83 },
    { label: "Year 1,000", recipe: "c11-form-1000", seed: 83 },
    { label: "Year 10,000", recipe: "c11-pit", seed: 83 },
  ],
};

const c11Missions: Mission[] = [
  {
    id: "c11-m1",
    chapter: "c11",
    title: "Read the wall",
    tier: "T1",
    learningObjective:
      "Horizons are O, A, E, B, C and R, and each colour is evidence of what happened there.",
    misconceptionsTargeted: [],
    scene: "c11-pit",
    steps: [
      {
        kind: "pit",
        bench: "read-wall",
        text: "Tap each layer of the wall, guess what it is, then see its name and the evidence.",
        resultText:
          "Five horizons: litter, a dark topsoil, a bleached layer, a rusty layer where what left the bleached one collected, and the sand it all formed from. Each colour records a process.",
        facts: [F.horizons, F.colour, F.body],
        horizons: {
          O: { name: "O: organic litter", evidence: "Needles and twigs, not mineral grains." },
          A: { name: "A: topsoil", evidence: "Dark from organic matter; most of the roots are here." },
          E: {
            name: "E: bleached (eluvial) layer",
            evidence: "Pale because iron, aluminium and organic matter were washed out of it.",
          },
          Bs: {
            name: "B: accumulation layer",
            evidence: "Rusty and dark where the iron and organic matter from the E collected.",
          },
          C: { name: "C: parent material", evidence: "Sand little changed since it was laid down." },
        },
      },
      {
        kind: "explain-choice",
        id: "c11-m1-all",
        question: "Does every soil have all of these horizons?",
        choices: [
          {
            id: "no",
            label: "No: many soils lack some, and a young one may be only A over C",
            ok: true,
            feedback: "Yes. This wall has no R, and a grassland soil would have no O and no E.",
          },
          {
            id: "yes",
            label: "Yes: every soil has O, A, E, B and C",
            ok: false,
            feedback: "Would a soil formed a century ago on fresh river sand have had time to bleach an E?",
          },
          {
            id: "rock",
            label: "There are no real layers: soil is ground-up rock, sorted by size",
            ok: false,
            feedback: "Look at the dark A and the rusty B. Is that a size, or something added and moved?",
          },
        ],
      },
      {
        kind: "discover",
        text: "Colour is a diary.",
        discoveries: ["d-c11-diary"],
        codex: ["cx-c11-horizons"],
        onComplete: { rumors: { "r-c11": "explained" } },
      },
    ],
    sources: ["nrcs-field-book", "nrcs-soil-survey-manual"],
    simplificationNotes: [
      "Horizon boundaries are drawn as bands; real boundaries can be wavy, broken or gradual.",
      "No R horizon: the pit stops in sand.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c11-m2",
    chapter: "c11",
    title: "Make a podzol",
    tier: "T2",
    learningObjective:
      "Climate, organisms, parent material and time together decide which horizons form, and soil forms both downward and by mixing.",
    misconceptionsTargeted: [],
    scene: "c11-pit",
    steps: [
      {
        kind: "pit",
        bench: "timelapse",
        text: "Watch this profile form, from fresh sand to the wall in front of you.",
        resultText:
          "Litter and a dark topsoil came within centuries. The pale E and the rusty B beneath it took thousands of years.",
        facts: [F.slowForm, F.podzol],
        timelapse: c11Timelapse,
      },
      {
        kind: "pit",
        bench: "podzol",
        text: "Now choose the factors yourself: climate, litter, parent material and time. Make a pale E over a rusty B.",
        resultText:
          "A pale E needs all of them at once: water draining through, acid litter, a sand that lets the water pass, and time. Take one away and the E thins or never forms.",
        facts: [F.podzol, F.clorpt],
      },
      {
        kind: "explain-choice",
        id: "c11-m2-way",
        question: "Which way does soil form?",
        choices: [
          {
            id: "both",
            label: "Both ways: water carries material down, and worms, ants and roots carry it up",
            ok: true,
            feedback: "Yes. The E and B were made by water moving down; the dark A is kept mixed by life.",
          },
          {
            id: "down",
            label: "From the top down only",
            ok: false,
            feedback: "Something carries soil upward too. What makes the casts on a lawn?",
          },
          {
            id: "rock",
            label: "From the rock up, as the rock crumbles",
            ok: false,
            feedback: "The sand did not crumble into a bleached layer. What did the water and the litter do?",
          },
        ],
      },
      {
        kind: "discover",
        text: "Soil forms from the top down, and is mixed both ways.",
        discoveries: ["d-c11-podzol"],
        codex: ["cx-c11-factors"],
      },
    ],
    sources: ["jenny-1941", "nrcs-soil-survey-manual", "wrb-2022", "jrc-2016-gsba"],
    simplificationNotes: [
      "Three choices per factor and four ages; relief is the next mission.",
      "The model forms horizons only; it does not move individual elements.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c11-m3",
    chapter: "c11",
    title: "Detective pit",
    tier: "T3",
    learningObjective:
      "Position on a hill controls wetness, and redox colours record waterlogging; colour alone admits several drainage histories.",
    misconceptionsTargeted: [],
    scene: "c11-catena",
    steps: [
      {
        kind: "go",
        text: "Climb out of the pit and walk down the hill.",
        scene: "c11-catena",
        object: "catena-portal",
      },
      {
        kind: "pit",
        bench: "catena",
        text: "Three pits, one climate. Compare them from the summit to the paddy.",
        resultText:
          "Down the hill the water table rises. At the summit the soil never waterlogs; at the foot it stays wet, and the iron has gone grey with rust where the water rises and falls.",
        facts: [F.catena, F.redox, F.wrb, F.map],
        examples: {
          summit: "Podzol",
          midslope: "Cambisol (or Luvisol, where clay has moved down)",
          toeslope: "Gleysol",
        },
      },
      {
        kind: "pit",
        bench: "detective",
        text: "The pit beside the ditch. Look at its colours.",
        resultText:
          "Brown above 35 cm, rust mottles from 35 to 70 cm, a grey matrix below 70 cm. A ditch drains the field today.",
        facts: [F.redox, F.relict],
      },
      {
        kind: "explain-choice",
        id: "c11-m3-history",
        question: "What does this pit say about the field's drainage? Choose an answer you can defend.",
        choices: [
          {
            id: "seasonal",
            label: "The water table rises to about 35 cm in the wet season and falls in the dry",
            ok: true,
            feedback:
              "Defensible: mottles form where the water rises and falls. The ditch may have changed that, though.",
          },
          {
            id: "relict",
            label: "It used to be that wet; the ditch may have dried it, and the mottles stayed",
            ok: true,
            feedback: "Defensible: iron colours outlast the wetness that made them.",
          },
          {
            id: "measure",
            label: "Can't tell from colour alone: I would read the water table across a year",
            ok: true,
            feedback:
              "Defensible, and the honest next step: if the water still reaches 35 cm in winter, then the mottles are current, because readings date the wetness and colour cannot.",
          },
          {
            id: "never-wet",
            label: "The field never waterlogs",
            ok: false,
            feedback: "What reduces iron to grey, then rusts it in spots?",
          },
          {
            id: "always-wet",
            label: "It is waterlogged all year, right to the surface",
            ok: false,
            feedback: "Look at the top 35 cm, and at the rust: does rust form without air?",
          },
        ],
      },
      {
        kind: "discover",
        text: "Position on the hill decides how wet a soil is, and colour keeps the record.",
        discoveries: ["d-c11-catena"],
        codex: ["cx-c11-catena"],
      },
    ],
    sources: ["nrcs-soil-survey-manual", "nrcs-field-book", "wrb-2022"],
    simplificationNotes: [
      "Three positions and one detective pit; real catenas grade continuously.",
      "Soil names are WRB examples, not classifications of these pits (OD-11 pending).",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c11-m4",
    chapter: "c11",
    title: "A thousand years per centimetre?",
    tier: "T2",
    learningObjective:
      "Soil forms slowly and can be lost quickly: topsoil is not renewable on a human timescale.",
    misconceptionsTargeted: ["M2"],
    scene: "c11-catena",
    steps: [
      {
        kind: "predict-choice",
        id: "c11-m4-form",
        question: "How long does one centimetre of soil take to form?",
        choices: [
          {
            id: "centuries",
            label: "About a century to several centuries",
            ok: true,
            feedback: "Work it out.",
          },
          { id: "years", label: "A few years", ok: false, feedback: "Work it out.", misconception: "M2" },
          { id: "millions", label: "Millions of years", ok: false, feedback: "Work it out." },
        ],
      },
      {
        kind: "pit",
        bench: "rates",
        text: "Pick a formation rate from the measured range, then a plough-erosion rate.",
        resultText:
          "Formation at 0.3–1.4 t per hectare a year builds a centimetre in about 90 to 430 years. Erosion 10 to 100 times faster removes it within a human lifetime or less.",
        facts: [F.formRate, F.fao, F.erosion],
      },
      {
        kind: "explain-choice",
        id: "c11-m4-renew",
        question: "Is topsoil renewable?",
        choices: [
          {
            id: "not-human",
            label: "Not on a human timescale: it is lost far faster than it forms",
            ok: true,
            feedback: "Yes. Formation is measured in centuries per centimetre; plough erosion in years.",
          },
          {
            id: "quick",
            label: "Yes: it regenerates in a few seasons",
            ok: false,
            feedback: "Look at the years per centimetre you just worked out.",
            misconception: "M2",
          },
        ],
      },
      {
        kind: "discover",
        text: "Topsoil is not renewable on a human timescale.",
        discoveries: ["d-c11-slow"],
        codex: ["cx-c11-time"],
      },
    ],
    sources: ["verheijen-2009", "fao-2015-swsr", "montgomery-2007"],
    simplificationNotes: [
      "One bulk density (1.3 g/cm³) for every soil; erosion as a fixed multiple of formation.",
    ],
    reviewStatus: "draft",
  },
];

const c11Codex: CodexEntry[] = [
  {
    id: "cx-c11-horizons",
    title: "Reading a pit wall",
    chapter: "c11",
    body: [
      "A soil profile is read top down: O litter, A topsoil, E bleached layer, B where things collect or weather, C parent material, R bedrock. Many soils lack some of them.",
      "Colour is the first evidence. Dark is organic matter; red and yellow are oxidised iron; pale is what is left when they are washed out; grey with rust mottles is a record of waterlogging.",
    ],
    facts: [F.horizons, F.notAll, F.colour, F.body],
    reviewStatus: "draft",
  },
  {
    id: "cx-c11-factors",
    title: "The soil-forming factors",
    chapter: "c11",
    body: [
      "Climate, organisms, relief, parent material and time: Jenny's five factors decide which soil forms. People are now often counted as a sixth.",
      "Processes add, remove, transform and move material. Water carries it down; worms, ants and roots carry it back up.",
    ],
    facts: [F.clorpt, F.podzol, F.mixing],
    simplification: "The game's podzol index multiplies four factors; real soils respond to many more.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c11-catena",
    title: "The catena",
    chapter: "c11",
    body: [
      "Down one hill under one climate, a sequence of soils: dry and leached at the summit, wetter at the foot, where iron goes grey and rusts in mottles.",
      "Names such as Podzol or Gleysol are examples from the World Reference Base. A soil map built from such pits is an interpretation, not a measurement of every square metre.",
    ],
    facts: [F.catena, F.redox, F.relict, F.wrb, F.map],
    reviewStatus: "draft",
  },
  {
    id: "cx-c11-time",
    title: "Deep time, fast loss",
    chapter: "c11",
    body: [
      "Soil forms at a fraction of a millimetre a year. Under the plough it can be lost ten to a hundred times faster.",
      "A centimetre that took centuries can go in a few years.",
    ],
    facts: [F.formRate, F.fao, F.erosion],
    reviewStatus: "draft",
  },
];

export const c11Bundle: ChapterBundle = {
  chapter: c11,
  scenes: c11Scenes,
  missions: c11Missions,
  codex: c11Codex,
  rumors: c11Rumors,
};
