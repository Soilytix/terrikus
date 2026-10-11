/**
 * Chapter 13 — Hillslope and River (world-bible §6). Erosion, the river that
 * receives it, salt under irrigation, and a satellite image as measurement, on
 * the rules in `src/sim/hillslope.ts`. The storm is a darkening wash
 * (`src/ui/storm.ts`). Deviations, recorded: `c13-satellite` is the inset in the
 * c13-m4 bench, not a scene of its own; the two expected cause chains wait for
 * a later pass, as in chapter 11.
 */
import type { ChapterBundle, CodexEntry, Fact, Mission, Scene } from "../../schema";
import { c13, c13Rumors } from "./chapter";

const F = {
  sheet: {
    id: "c13-sheet",
    text: "Water often strips soil as a thin, even sheet across a whole field. It is easy to miss: losing 13 t per hectare lowers the surface by only about a millimetre.",
    confidence: "firm",
    evidence: "derived",
    sources: ["fao-2015-swsr", "verheijen-2009"],
    simplification: "One bulk density (1.3 t/m³) stands for every soil.",
  },
  topFirst: {
    id: "c13-top-first",
    text: "Erosion takes the top of the soil first: the fine particles and organic matter that hold most of its nutrients.",
    confidence: "firm",
    sources: ["montgomery-2007", "fao-2015-swsr"],
  },
  splash: {
    id: "c13-splash",
    text: "Raindrops striking bare soil break crumbs apart and throw particles into the runoff. Residue or plants on the surface take the impact instead.",
    confidence: "firm",
    sources: ["fao-2015-swsr", "montgomery-2007"],
    simplification:
      "Splash scales with the exposed share of the ground only; drop size, crusting and slope are fixed teaching values.",
  },
  faster: {
    id: "c13-faster",
    text: "Under conventional ploughing, soil erodes 10 to 100 times faster than it forms.",
    confidence: "estimate",
    sources: ["montgomery-2007"],
  },
  formation: {
    id: "c13-formation",
    text: "In Europe soil forms at roughly 0.3–1.4 t per hectare a year, so a loss above that is not replaced.",
    confidence: "estimate",
    sources: ["verheijen-2009"],
  },
  global: {
    id: "c13-global",
    text: "Water erosion moves an estimated 36 billion tonnes of soil a year worldwide (model estimate for 2012).",
    confidence: "estimate",
    sources: ["borrelli-2017"],
  },
  pBound: {
    id: "c13-p-bound",
    text: "Phosphorus binds tightly to soil particles, so it leaves fields mostly with eroded soil, not dissolved in drainage as nitrate does.",
    confidence: "firm",
    sources: ["cordell-2009"],
    simplification:
      "Dissolved P is a fixed small share; real losses depend on how much P the soil already holds.",
  },
  bloom: {
    id: "c13-bloom",
    text: "Phosphorus that reaches rivers and lakes feeds algal blooms.",
    confidence: "firm",
    sources: ["cordell-2009"],
  },
  strip: {
    id: "c13-strip",
    text: "Cover on the field keeps soil in place; a strip of grass at the foot of a slope slows the runoff and catches some of the soil it carries.",
    confidence: "estimate",
    sources: ["fao-2015-swsr"],
    simplification: "The strip traps a fixed share of the moving soil; real strips fill up and channel.",
  },
  salinisation: {
    id: "c13-salinisation",
    text: "Irrigation water carries dissolved salts. Plants take up the water and the sun evaporates it, but the salt stays unless water drains through the root zone and carries it away.",
    confidence: "firm",
    sources: ["usda-hb60"],
  },
  waterTable: {
    id: "c13-water-table",
    text: "Without drainage, irrigation raises the water table. Once it is near the surface, capillary rise lifts salty groundwater back into the root zone.",
    confidence: "firm",
    sources: ["usda-hb60"],
    simplification:
      "The water table rises at a fixed rate and capillary rise starts at 1.5 m; both are teaching values.",
  },
  thresholds: {
    id: "c13-thresholds",
    text: "Classic thresholds: a soil is saline when its saturated-paste extract conducts more than 4 dS/m (EC_e > 4), and sodic when sodium holds more than 15 % of its exchange sites (ESP > 15).",
    confidence: "firm",
    sources: ["usda-hb60"],
  },
  sodic: {
    id: "c13-sodic",
    text: "Sodium on the exchange sites makes clay disperse: the water runs milky, the pores clog and infiltration falls.",
    confidence: "firm",
    sources: ["usda-hb60"],
  },
  leaching: {
    id: "c13-leaching",
    text: "Extra water lowers salinity only if it drains away below the roots. That extra is the leaching requirement.",
    confidence: "firm",
    sources: ["usda-hb60"],
  },
  extent: {
    id: "c13-extent",
    text: "Salt-affected soils cover about 10.7 % of the world's land area, a figure with high uncertainty.",
    confidence: "estimate",
    sources: ["fao-2024-salt"],
  },
  sentinel: {
    id: "c13-sentinel",
    text: "Sentinel-2 measures the sunlight the ground reflects in 13 wavebands; its blue, green and red bands have 10 m pixels.",
    confidence: "firm",
    evidence: "measured",
    sources: ["drusch-2012"],
  },
  reflectance: {
    id: "c13-reflectance",
    text: "A satellite pixel records reflectance: how much light of each colour came back from that patch of ground. Soil type, wetness or a cause are interpretations, and need ground data to test.",
    confidence: "firm",
    sources: ["drusch-2012", "nrcs-soil-survey-manual"],
  },
  covariate: {
    id: "c13-covariate",
    text: "Soil maps use satellite images and terrain as covariates beside pits: they describe the landscape, and the pits test the interpretation.",
    confidence: "firm",
    sources: ["nrcs-soil-survey-manual"],
  },
  greenShare: {
    id: "c13-green-share",
    text: "Green share = G ÷ (R + G + B), from the inset's display values. It is a derived index of colour, not a measurement of plants.",
    confidence: "firm",
    evidence: "derived",
    sources: ["drusch-2012"],
    simplification: "Computed from the web image's 8-bit display values, not the archive's reflectance.",
  },
} satisfies Record<string, Fact>;

/** One probe on the inset: where it sits (0..1) and the display values read there, a 9 × 9 pixel mean. */
export interface Probe {
  id: string;
  x: number;
  y: number;
  rgb: [number, number, number];
}

/** The real image beside the painted valley; `tests/c13.test.ts` holds the probes to the file. */
export const C13_SATELLITE = {
  asset: "c13-sentinel-2",
  label: "Measurement: reflectance",
  caption:
    "Sentinel-2 true colour, 5 August 2024: gullied loess hills near Yan'an, China, 6.4 × 4 km in 10 m pixels. Red, green and blue reflectance, scaled for display. A real place, not the painted valley.",
  credit: "Contains modified Copernicus Sentinel data 2024",
  probes: [
    { id: "A", x: 400 / 640, y: 220 / 400, rgb: [39, 68, 36] },
    { id: "B", x: 410 / 640, y: 370 / 400, rgb: [178, 132, 88] },
    { id: "C", x: 70 / 640, y: 150 / 400, rgb: [69, 83, 51] },
    { id: "D", x: 570 / 640, y: 160 / 400, rgb: [30, 49, 26] },
  ] satisfies Probe[],
};

const c13Scenes: Scene[] = [
  {
    id: "c13-valley",
    chapter: "c13",
    title: "The hill above the river",
    scale: "landscape",
    tone: "light",
    recipe: "c13-valley",
    seed: 131,
    scaleBar: { metres: 200, label: "200 m" },
    description:
      "The valley's hill from the side: woodland on the summit, strips of crop and bare ploughed soil running down the slope, a band of grass at its foot, and the river glinting on the flat ground below.",
    truth: {
      drawnFrom: ["Hillslope cross-sections in erosion references"],
      schematic: ["The strips and the grass band are drawn wider than real fields"],
      invented: ["This hill, its fields and its river"],
      notSimulated: ["Gullies", "Seasons", "River flow"],
    },
    up: "valley",
    objects: [
      {
        id: "bare-strips",
        label: "Bare ploughed strips on the slope",
        kind: "scan",
        anchor: { x: 0.4, y: 0.62 },
        scan: "Brown ploughed strips run straight down the slope between strips of crop. After last night's rain they look no different: no gullies, no scars.",
        facts: [F.sheet],
      },
      {
        id: "grass-band",
        label: "Grass at the foot of the slope",
        kind: "scan",
        anchor: { x: 0.64, y: 0.8 },
        scan: "A band of rough grass between the last field and the floodplain. Its stems are dusted with fine brown silt.",
        facts: [F.strip],
      },
      {
        id: "river",
        label: "The river",
        kind: "scan",
        anchor: { x: 0.85, y: 0.89 },
        scan: "Clear today, glinting in the sun.",
        facts: [F.bloom],
      },
      {
        id: "splash-portal",
        label: "Kneel by a bare strip",
        kind: "portal",
        anchor: { x: 0.36, y: 0.56 },
        to: "c13-splash",
      },
      {
        id: "salt-portal",
        label: "Over the ridge: the dry irrigated valley",
        kind: "portal",
        anchor: { x: 0.42, y: 0.2 },
        to: "c13-salt",
        requires: "c13-m2-done",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c13-splash",
    chapter: "c13",
    title: "Rain on bare and covered soil",
    scale: "field",
    tone: "light",
    recipe: "c13-splash",
    seed: 137,
    scaleBar: { metres: 0.2, label: "20 cm" },
    description:
      "Two patches of the same soil side by side in the rain. On the left the soil is bare, its crumbs loose and the drops throwing up little crowns of mud. On the right straw lies across the ground and the drops land on it.",
    truth: {
      drawnFrom: ["Splash-erosion photographs and rainfall-simulator plots"],
      schematic: ["Drops and crumbs are drawn larger than true size"],
      invented: ["This plot"],
      notSimulated: ["Surface crusting", "Drop size"],
    },
    up: "c13-valley",
    objects: [
      {
        id: "bare-plot",
        label: "Bare soil",
        kind: "scan",
        anchor: { x: 0.25, y: 0.7 },
        scan: "Each drop lands like a small hammer. Crumbs break and fine grains jump a hand's width.",
        facts: [F.splash],
      },
      {
        id: "straw-plot",
        label: "Soil under straw",
        kind: "scan",
        anchor: { x: 0.75, y: 0.7 },
        scan: "The drops hit straw, run off it and soak in. The crumbs under it are whole.",
        facts: [F.splash],
      },
      {
        id: "valley-portal",
        label: "Back to the hill above the river",
        kind: "portal",
        anchor: { x: 0.5, y: 0.15 },
        to: "c13-valley",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c13-salt",
    chapter: "c13",
    title: "The dry irrigated valley",
    scale: "field",
    tone: "light",
    recipe: "c13-salt",
    seed: 139,
    scaleBar: { metres: 10, label: "10 m" },
    description:
      "A flat field in a dry valley, fed by a canal along its far edge. Bare stony hills rise behind. White crusts line the ridges between the furrows, the plants are sparse, and the ditch at the edge runs milky.",
    truth: {
      drawnFrom: ["Photographs of salt-affected irrigated fields"],
      schematic: ["Crusts are drawn thicker than most real ones"],
      invented: ["This valley and its canal"],
      notSimulated: ["Rain", "Crop choice"],
    },
    up: "c13-valley",
    objects: [
      {
        id: "crust",
        label: "White crust on the ridges",
        kind: "scan",
        anchor: { x: 0.3, y: 0.62 },
        scan: "A white crust, crisp underfoot, thickest on the ridge tops where water evaporates.",
        facts: [F.salinisation],
      },
      {
        id: "ditch",
        label: "The milky ditch",
        kind: "scan",
        anchor: { x: 0.84, y: 0.75 },
        scan: "The water is cloudy and does not settle: fine clay hangs in it.",
        facts: [F.sodic],
      },
      {
        id: "canal",
        label: "The irrigation canal",
        kind: "scan",
        anchor: { x: 0.5, y: 0.45 },
        scan: "Clear water from a river far upstream. It tastes faintly of salt.",
        facts: [F.salinisation],
      },
      {
        id: "valley-portal",
        label: "Back to the hill above the river",
        kind: "portal",
        anchor: { x: 0.36, y: 0.2 },
        to: "c13-valley",
      },
    ],
    reviewStatus: "draft",
  },
];

const c13Missions: Mission[] = [
  {
    id: "c13-m1",
    chapter: "c13",
    title: "Rain on bare versus covered",
    tier: "T1",
    learningObjective: "Erosion removes the most fertile topsoil first, mostly as invisible sheet erosion.",
    misconceptionsTargeted: [],
    scene: "c13-splash",
    steps: [
      {
        kind: "go",
        text: "Kneel by one of the bare strips on the slope.",
        scene: "c13-splash",
        object: "splash-portal",
      },
      {
        kind: "predict-choice",
        id: "c13-m1-predict",
        question: "The same intense storm falls on bare soil and on soil under straw. Which loses more soil?",
        choices: [
          { id: "bare", label: "The bare soil", ok: true, feedback: "Try it." },
          { id: "same", label: "Both the same: it is the same rain", ok: false, feedback: "Try it." },
          { id: "straw", label: "The soil under straw", ok: false, feedback: "Try it." },
        ],
      },
      {
        kind: "hill",
        bench: "splash",
        text: "Choose the cover and the rain, then let the storm fall. Try bare soil in intense rain, then a cover.",
        resultText:
          "Bare soil under intense rain lost about 12 t per hectare, and its surface fell by less than a millimetre. Under straw the drops struck the cover, not the crumbs.",
        facts: [F.splash, F.sheet, F.topFirst],
      },
      {
        kind: "explain-choice",
        id: "c13-m1-where",
        question: "The bare strip lost 12 t per hectare and you can see no scar. Where did most of it go?",
        choices: [
          {
            id: "sheet",
            label: "A thin sheet off the whole surface, the richest part of the soil",
            ok: true,
            feedback:
              "Yes. Under a millimetre of the top, taken evenly, with its fine particles and organic matter.",
          },
          {
            id: "gully",
            label: "Into a gully somewhere on the slope",
            ok: false,
            feedback: "Did you see one? A gully is what you notice; the sheet is most of what you lose.",
          },
          {
            id: "nothing",
            label: "Nowhere much: a millimetre does not matter",
            ok: false,
            feedback: "How many years does a millimetre of topsoil take to form?",
          },
        ],
      },
      {
        kind: "discover",
        text: "Most erosion is invisible.",
        discoveries: ["d-c13-invisible"],
        codex: ["cx-c13-erosion"],
      },
    ],
    sources: ["fao-2015-swsr", "montgomery-2007", "verheijen-2009"],
    simplificationNotes: [
      "One hundred surface crumbs; each loose one stands for 0.2 t per hectare carried off.",
      "Three cover levels and two rains; no crusting, slope or drop-size effects.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c13-m2",
    chapter: "c13",
    title: "Where does the soil go?",
    tier: "T2",
    learningObjective:
      "Water carries soil down the slope, and phosphorus travels on it to the river, where it feeds algal blooms.",
    misconceptionsTargeted: ["M18"],
    scene: "c13-valley",
    steps: [
      {
        kind: "go",
        text: "Stand up and look down the whole hill.",
        scene: "c13-valley",
        object: "valley-portal",
      },
      {
        kind: "hill",
        bench: "storm",
        text: "The topsoil on the slope fields is tagged. Choose their cover and whether grass grows at the foot, then summon the storm.",
        resultText:
          "The tagged soil moved down the slope: some stopped at the foot, the rest reached the river, and nearly all the phosphorus that left rode on it. Weeks later that phosphorus fed a bloom of algae.",
        facts: [F.pBound, F.bloom, F.strip, F.topFirst],
      },
      {
        kind: "explain-choice",
        id: "c13-m2-p",
        question: "How did most of the phosphorus reach the river?",
        choices: [
          {
            id: "particles",
            label: "On eroded soil particles",
            ok: true,
            feedback: "Yes. Phosphorus clings to particles, so it moves when the soil moves.",
          },
          {
            id: "dissolved",
            label: "Dissolved in water, leaching down like nitrate",
            ok: false,
            feedback: "Look at the run: what share of the phosphorus left dissolved?",
            misconception: "M18",
          },
          {
            id: "algae",
            label: "It did not: the algae made it",
            ok: false,
            feedback: "Can algae make an element? Where was the phosphorus before the storm?",
          },
        ],
      },
      {
        kind: "discover",
        text: "The river remembers the hill.",
        discoveries: ["d-c13-river"],
        codex: ["cx-c13-river"],
        onComplete: { rumors: { "r-c13": "explained" } },
      },
    ],
    sources: ["cordell-2009", "fao-2015-swsr", "montgomery-2007"],
    simplificationNotes: [
      "One intense storm moves a fixed share of the tagged soil; eroded soil carries twice the slope's P per unit.",
      "The bloom is a threshold on river P; light, temperature and flow are not modelled.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c13-m3",
    chapter: "c13",
    title: "Irrigate the desert",
    tier: "T3",
    learningObjective: "Salinisation follows irrigation without drainage.",
    misconceptionsTargeted: [],
    scene: "c13-salt",
    steps: [
      {
        kind: "go",
        text: "Cross the ridge to the dry irrigated valley.",
        scene: "c13-salt",
        object: "salt-portal",
      },
      {
        kind: "predict-choice",
        id: "c13-m3-predict",
        question: "Thirty years of irrigation and no drains. The salt in the root zone will…",
        choices: [
          { id: "climb", label: "Climb", ok: true, feedback: "Run it." },
          { id: "stay", label: "Stay about the same", ok: false, feedback: "Run it." },
          { id: "fall", label: "Fall, washed out by the water", ok: false, feedback: "Run it." },
        ],
      },
      {
        kind: "hill",
        bench: "salt",
        text: "Irrigate for thirty years. Compare no drains with drains, and normal water with extra.",
        resultText:
          "Without drains the salt stayed: the water table rose, capillary rise lifted the groundwater's salt back up, and the root zone passed 4 dS/m. With drains and enough water to leach, it held below the line.",
        facts: [F.salinisation, F.waterTable, F.thresholds, F.sodic],
      },
      {
        kind: "explain-choice",
        id: "c13-m3-more",
        question: "A neighbour says: the soil is salty, so water it more. Is that right?",
        choices: [
          {
            id: "drained",
            label: "Only if the extra water can drain away below the roots",
            ok: true,
            feedback: "Yes. With drains, extra water carried salt out; without, it raised the water table.",
          },
          {
            id: "always",
            label: "Yes: more water always washes the salt out",
            ok: false,
            feedback: "What happened to the extra water when nothing drained it?",
          },
          {
            id: "never",
            label: "No: once salt is in, nothing removes it",
            ok: false,
            feedback: "What did the drains carry away?",
          },
        ],
      },
      {
        kind: "discover",
        text: "Salt stays where water cannot leave.",
        discoveries: ["d-c13-salt"],
        codex: ["cx-c13-salt"],
      },
    ],
    sources: ["usda-hb60", "fao-2024-salt"],
    simplificationNotes: [
      "Salt is one pool with a fixed sodium share; yield and infiltration responses are teaching curves.",
      "No rain: the canal is the only water.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c13-m4",
    chapter: "c13",
    title: "Pixels and pits",
    tier: "T4",
    learningObjective: "Satellite and environmental covariates describe a landscape. They do not explain it.",
    misconceptionsTargeted: [],
    scene: "c13-valley",
    steps: [
      {
        kind: "go",
        text: "Back over the ridge to the hill above the river.",
        scene: "c13-valley",
        object: "valley-portal",
      },
      {
        kind: "hill",
        bench: "satellite",
        text: "Beside the painted valley, a real satellite image of eroding loess hills. Probe four patches.",
        resultText:
          "Each probe read the light the ground reflected in red, green and blue, and the green share was worked out from it. Nothing in a pixel says what the soil is, or why a patch is green.",
        facts: [F.sentinel, F.reflectance, F.greenShare],
      },
      {
        kind: "explain-choice",
        id: "c13-m4-measured",
        question: "What did the satellite measure at the greenest patch?",
        choices: [
          {
            id: "reflectance",
            label: "The light it reflected in red, green and blue: reflectance",
            ok: true,
            feedback: "Yes. Everything else is an interpretation of that light.",
          },
          {
            id: "soil",
            label: "The type of soil there",
            ok: false,
            feedback: "Did the probe read anything below the surface?",
          },
          {
            id: "wet",
            label: "How wet the soil is",
            ok: false,
            feedback: "What would a dry patch under an irrigated crop look like?",
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c13-m4-cause",
        question:
          "In chapter 11's pits, the foot of the hill was the wettest. Suppose a greenness map is highest there too. What can you claim?",
        choices: [
          {
            id: "associated",
            label:
              "Greenness is associated with the wet foot; why needs ground data, such as pits and water-table readings",
            ok: true,
            feedback: "Defensible: the map and the pits agree in place, and neither shows the cause.",
          },
          {
            id: "measure",
            label:
              "I can't tell the cause from pixels: I would dig, measure the water and ask how each field is managed",
            ok: true,
            feedback:
              "Defensible, and the honest next step: if the foot is green under the same crop and management, then wetness is a candidate, because the other causes are held fixed.",
          },
          {
            id: "wet-causes",
            label: "Wet soil makes the foot greener",
            ok: false,
            feedback: "Could a different crop, irrigation or shade do the same? What would tell them apart?",
          },
          {
            id: "satellite-wet",
            label: "The satellite measured the wetness",
            ok: false,
            feedback: "What did each probe record?",
          },
        ],
      },
      {
        kind: "discover",
        text: "A satellite sees colour, not cause.",
        discoveries: ["d-c13-colour"],
        codex: ["cx-c13-satellite"],
      },
    ],
    sources: ["drusch-2012", "nrcs-soil-survey-manual"],
    simplificationNotes: [
      "Four probes on a compressed web image; the green share stands in for the vegetation indices real studies use.",
      "The inset shows a real place, not the painted valley.",
    ],
    reviewStatus: "draft",
  },
];

const c13Codex: CodexEntry[] = [
  {
    id: "cx-c13-erosion",
    title: "Erosion you cannot see",
    chapter: "c13",
    body: [
      "Raindrops break bare crumbs apart, and the runoff carries the pieces off as a thin, even sheet. A loss that would take decades to replace lowers the surface by a millimetre and leaves no scar.",
      "The top goes first, and it is the richest part. Cover takes the drops' impact; under the plough, soil erodes far faster than it forms.",
    ],
    facts: [F.splash, F.sheet, F.topFirst, F.faster, F.formation],
    realWorld: [F.global],
    reviewStatus: "draft",
  },
  {
    id: "cx-c13-river",
    title: "From hill to river",
    chapter: "c13",
    body: [
      "Soil that leaves a field stops at the foot of the slope or reaches the river. Phosphorus clings to it and travels with it, unlike nitrate, which moves dissolved.",
      "In the river that phosphorus feeds algae. A bloom weeks after a storm is the hill's soil arriving downstream.",
    ],
    facts: [F.pBound, F.bloom, F.strip],
    reviewStatus: "draft",
  },
  {
    id: "cx-c13-salt",
    title: "Salt and drainage",
    chapter: "c13",
    body: [
      "Irrigation water brings salt. Plants and the sun take the water and leave the salt, unless water drains through and carries it away.",
      "Without drains the water table rises and capillary rise lifts salt back up. Above about 4 dS/m a soil is called saline; when sodium holds more than 15 % of the exchange sites it is sodic, and its clay disperses.",
    ],
    facts: [F.salinisation, F.waterTable, F.thresholds, F.sodic, F.leaching],
    realWorld: [F.extent],
    reviewStatus: "draft",
  },
  {
    id: "cx-c13-satellite",
    title: "What a satellite measures",
    chapter: "c13",
    body: [
      "A satellite records reflectance: the light each patch of ground sends back, colour by colour. An index such as the green share is derived from it.",
      "Soil maps use such images as covariates. They describe the landscape; pits and ground measurements test what it means.",
    ],
    facts: [F.sentinel, F.reflectance, F.greenShare, F.covariate],
    reviewStatus: "draft",
  },
];

export const c13Bundle: ChapterBundle = {
  chapter: c13,
  scenes: c13Scenes,
  missions: c13Missions,
  codex: c13Codex,
  rumors: c13Rumors,
};
