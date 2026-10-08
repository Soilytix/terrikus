/**
 * Chapter 3 — Water Roads (world-bible §6). Matric potential, films as roads,
 * the Birch pulse and preferential flow, on the rules in `src/sim/water.ts`.
 * Deviation, recorded: the `c3-root-pull` scene and the two expected cause
 * chains wait for a later pass; the cast cards for ciliates, flagellates, the
 * anecic earthworm and the tap root arrive with the chapters that need them.
 */
import type { ChapterBundle, CodexEntry, Fact, Mission, Scene } from "../../schema";
import { c3, c3Rumors } from "./chapter";

const F = {
  held: {
    id: "c3-held",
    text: "Soil holds water in pores by capillarity and on grain surfaces by adsorption. The tighter it is held, the more negative its matric potential: the soil's 'pull'.",
    confidence: "firm",
    sources: ["or-2007", "weil-brady-2017"],
  },
  laplace: {
    id: "c3-laplace",
    text: "The widest pore still full of water at a matric potential ψ is roughly d (µm) ≈ 300 / |ψ| (kPa).",
    confidence: "firm",
    evidence: "derived",
    sources: ["or-2007"],
    simplification:
      "Assumes round pores and water that fully wets the grains; real necks are irregular, so pores drain over a range.",
  },
  conventions: {
    id: "c3-conventions",
    text: "Field capacity (about −10 to −33 kPa) and the wilting point (about −1,500 kPa) are conventions, not constants: soils and crops differ.",
    confidence: "firm",
    sources: ["cornell-awc", "meter-paw-note"],
  },
  fcAir: {
    id: "c3-fc-air",
    text: "At field capacity the largest pores have drained and hold air. A soil at field capacity is not full.",
    confidence: "firm",
    sources: ["cornell-awc"],
  },
  sameContent: {
    id: "c3-same-content",
    text: "Two soils with the same water content can hold that water at very different potentials: a clay holds it more tightly than a sand.",
    confidence: "firm",
    sources: ["weil-brady-2017", "meter-paw-note"],
  },
  films: {
    id: "c3-films-roads",
    text: "As soil dries, water films thin and break, cutting bacteria and protists off from each other and from dissolved food.",
    confidence: "firm",
    sources: ["or-2007"],
    simplification: "Films connect or break at three moisture levels here; real films thin continuously.",
  },
  encyst: {
    id: "c3-encyst",
    text: "Amoebae move only through water films; when the soil dries they form cysts and wait.",
    confidence: "firm",
    sources: ["geisen-2018"],
    simplification: "The game stops the amoeba where it is and does not show the cyst.",
  },
  birch: {
    id: "c3-birch",
    text: "Rewetting a dry soil produces a burst of CO₂ within hours to days, far above the rate of soil kept moist: the Birch effect.",
    confidence: "firm",
    sources: ["schimel-2018"],
    simplification: "The daily numbers are teaching values; the shape, a jump then a decay, is the point.",
  },
  birchSources: {
    id: "c3-birch-sources",
    text: "Candidate sources of the burst are osmolytes that cells release when water returns, cells killed by drying, and organic matter exposed as crumbs shrink and crack. How much each contributes is unresolved.",
    confidence: "contested",
    sources: ["schimel-2018"],
  },
  optimum: {
    id: "c3-optimum",
    text: "Respiration rises with moisture up to an optimum, then falls as water shuts out air.",
    confidence: "estimate",
    sources: ["moyano-2013"],
  },
  global: {
    id: "c3-global-resp",
    text: "Soil respiration releases on the order of 100 billion tonnes of carbon a year worldwide, one of the largest carbon fluxes on land.",
    confidence: "estimate",
    sources: ["bond-lamberty-thomson-2010"],
  },
  bypass: {
    id: "c3-bypass",
    text: "Earthworm burrows and other large pores can carry rain deep into the soil, bypassing the matrix between them: preferential flow.",
    confidence: "firm",
    sources: ["blouin-2013"],
    simplification:
      "Three burrows and a front that moves as the square root of time; real infiltration depends on rain rate and how wet the soil already was.",
  },
} satisfies Record<string, Fact>;

const c3Scenes: Scene[] = [
  {
    id: "c3-drain",
    chapter: "c3",
    title: "The draining cave",
    scale: "aggregate",
    recipe: "c3-drain",
    seed: 73,
    scaleBar: { metres: 100e-6, label: "100 µm" },
    notToScale: 20,
    description:
      "Inside a crumb of the spinach field after a dry week. A wide crack runs across the top, empty of water; below it, pores grow narrower and narrower, and the finest still glint with water between flat clay platelets. Thin films line every grain.",
    truth: {
      drawnFrom: ["Pore and water-film geometry after thin sections and pore-network diagrams"],
      schematic: [
        "Seven pores stand for a range from 500 µm to 0.1 µm; the finest are drawn 20× larger than true",
      ],
      invented: ["This crumb and its pores"],
      notSimulated: ["Hysteresis: pores fill and drain at different potentials", "Swelling of clay"],
    },
    up: "valley",
    objects: [
      {
        id: "crack",
        label: "Crack between crumbs",
        kind: "scan",
        anchor: { x: 0.18, y: 0.3 },
        scan: "A crack half a millimetre wide. It held water after the last rain and was the first to empty.",
        facts: [F.laplace],
      },
      {
        id: "clay-gap",
        label: "Gap between clay platelets",
        kind: "scan",
        anchor: { x: 0.2, y: 0.72 },
        scan: "Water a tenth of a micrometre wide between clay platelets. It is held so tightly that no root can take it.",
        facts: [F.held, F.conventions],
      },
      {
        id: "film",
        label: "Water film",
        kind: "scan",
        anchor: { x: 0.56, y: 0.44 },
        card: "water-film",
        scan: "A film of water a few micrometres thick on the grain. For a swimming cell, this is the road.",
        facts: [F.films],
      },
      {
        id: "rain-portal",
        label: "Up to the field in the rain",
        kind: "portal",
        anchor: { x: 0.3, y: 0.08 },
        portrait: { x: 0.5, y: 0.42 },
        to: "c3-rain-profile",
        requires: "c3-m3-done",
      },
    ],
    reviewStatus: "draft",
  },
  {
    id: "c3-rain-profile",
    chapter: "c3",
    title: "Rain on the profile",
    scale: "profile",
    recipe: "c3-rain-profile",
    seed: 79,
    scaleBar: { metres: 0.2, label: "20 cm" },
    description:
      "A cut through the spinach field during heavy rain. Dark wet soil spreads down from the surface as an even band. Beside it, vertical earthworm burrows carry dark fingers of water much deeper.",
    truth: {
      drawnFrom: ["Dye-tracer photographs of preferential flow and earthworm burrows in profile"],
      schematic: ["Three burrows; the wetting front is drawn as one smooth band"],
      invented: ["This profile and its burrows"],
      notSimulated: ["Run-off at the surface", "Water flowing sideways", "Air trapped below the front"],
    },
    up: "valley",
    objects: [
      {
        id: "front",
        label: "Wetting front",
        kind: "scan",
        anchor: { x: 0.3, y: 0.3 },
        scan: "Wet soil is darker. The front moves down slowly through the soil between the burrows.",
        facts: [F.bypass],
      },
      {
        id: "burrow",
        label: "Earthworm burrow",
        kind: "scan",
        anchor: { x: 0.62, y: 0.55 },
        card: "earthworm-epi",
        scan: "A vertical burrow, as wide as a pencil, dug by a deep-burrowing earthworm. Water runs down its walls.",
        facts: [F.bypass],
      },
      {
        id: "drain-portal",
        label: "Back into the crumb",
        kind: "portal",
        anchor: { x: 0.18, y: 0.82 },
        to: "c3-drain",
      },
    ],
    reviewStatus: "draft",
  },
];

const c3Missions: Mission[] = [
  {
    id: "c3-m1",
    chapter: "c3",
    title: "Drain the cave",
    tier: "T2",
    learningObjective:
      "Matric potential is the soil's pull on water; pore size sets which pores hold water, and the largest empty first.",
    misconceptionsTargeted: ["M31", "M32"],
    scene: "c3-drain",
    steps: [
      {
        kind: "predict-choice",
        id: "c3-m1-first",
        question:
          "The soil is about to dry, from soaked to as dry as a wilting crop. Which pores empty first?",
        choices: [
          {
            id: "largest",
            label: "The widest ones",
            ok: true,
            feedback: "Let's see. Watch the crack at the top.",
          },
          {
            id: "smallest",
            label: "The narrowest ones: they hold the least",
            ok: false,
            feedback: "They hold the least water. Do they hold it the least tightly?",
            misconception: "M30",
          },
          {
            id: "all",
            label: "All of them at once, a little at a time",
            ok: false,
            feedback: "Watch whether every pore loses water together, or one after another.",
          },
        ],
      },
      {
        kind: "water",
        bench: "drain",
        text: "Pull on the water: move the slider from soaked (0 kPa) to the wilting-point convention (−1,500 kPa).",
        resultText:
          "The widest pores emptied first and the narrowest held on longest. At the wilting-point convention, water remains only in gaps narrower than about 0.2 µm, held too tightly for a root.",
        facts: [F.laplace, F.conventions, F.held],
      },
      {
        kind: "explain-choice",
        id: "c3-m1-fc",
        question: "At field capacity (−33 kPa) is the soil full of water?",
        choices: [
          {
            id: "air",
            label: "No: the wide pores have drained and hold air",
            ok: true,
            feedback:
              "Yes. Pores wider than about 9 µm are empty. That air is what roots and microbes breathe.",
          },
          {
            id: "full",
            label: "Yes: that is what 'capacity' means",
            ok: false,
            feedback: "Look at the crack and the wide pore at −33 kPa. What is in them now?",
            misconception: "M31",
          },
          {
            id: "tank",
            label: "It is a tank: a root can drink it all, however dry it gets",
            ok: false,
            feedback:
              "The last water sits in the narrowest gaps, held at a pull a root cannot match. Is that water free to drink?",
            misconception: "M32",
          },
        ],
      },
      {
        kind: "discover",
        text: "Big pores drain first.",
        discoveries: ["d-c3-drain"],
        cards: ["water-film"],
        codex: ["cx-c3-pull"],
      },
    ],
    sources: ["or-2007", "cornell-awc", "meter-paw-note", "weil-brady-2017"],
    simplificationNotes: [
      "Seven pores, each with one width, stand in for a continuous range.",
      "Drainage is shown at equilibrium; real soils take hours to days to drain.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c3-m2",
    chapter: "c3",
    title: "Stranded",
    tier: "T2",
    learningObjective: "For microbes, water films are roads. Drying cuts the network into islands.",
    misconceptionsTargeted: ["M4"],
    scene: "c3-drain",
    steps: [
      {
        kind: "water",
        bench: "stranded",
        text: "You are the amoeba again, and the soil is drying while you move: every hop, it is a little drier. Reach the bacteria before the films break.",
        resultText:
          "The short road through the wide pore broke first; the films along the narrow corners held a little longer. Once the soil passed about −100 kPa, no film connected anything, and the amoeba stopped where it was.",
        facts: [F.films, F.encyst],
      },
      {
        kind: "explain-choice",
        id: "c3-m2-why",
        question: "Why did the road through the wide pore fail first?",
        choices: [
          {
            id: "wide-drain",
            label: "Wide pores drain first, so their films broke before the narrow ones",
            ok: true,
            feedback: "Yes. The same rule as in the cave: the widest water goes first.",
          },
          {
            id: "far",
            label: "It was longer",
            ok: false,
            feedback: "It was the shorter road. Count the hops.",
          },
          {
            id: "wetter",
            label: "Wetter is always better, so the amoeba should have waited for rain",
            ok: false,
            feedback:
              "Water opened the roads here. In a waterlogged pore, though, air runs short. Is wetter always better?",
            misconception: "M4",
          },
        ],
      },
      {
        kind: "discover",
        text: "Water films are roads.",
        discoveries: ["d-c3-roads"],
        cards: ["amoeba"],
        codex: ["cx-c3-roads"],
      },
    ],
    sources: ["or-2007", "geisen-2018"],
    simplificationNotes: [
      "The soil dries a fixed step per hop; real drying takes days, and amoebae encyst.",
      "Movement is guided: you choose a pore and the amoeba follows the films (OD-10 pending).",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c3-m3",
    chapter: "c3",
    title: "After the drought",
    tier: "T3",
    learningObjective:
      "Rewetting a dry soil produces a CO₂ pulse; its sources are several and not yet separable.",
    misconceptionsTargeted: ["M4"],
    scene: "c3-drain",
    steps: [
      {
        kind: "predict-choice",
        id: "c3-m3-trace",
        question:
          "A soil has been dry for a week. You wet it. What does the CO₂ coming off it do, compared with a soil kept moist all along?",
        choices: [
          {
            id: "burst",
            label: "A burst well above the moist soil, then a fall",
            ok: true,
            feedback: "Wet it and watch the trace.",
          },
          {
            id: "catch-up",
            label: "It rises slowly to the moist soil's rate",
            ok: false,
            feedback: "Wet it and watch the trace.",
          },
          {
            id: "lower",
            label: "It stays lower: the microbes were damaged",
            ok: false,
            feedback: "Some cells did die. What happens to the carbon in them?",
          },
        ],
      },
      {
        kind: "water",
        bench: "birch",
        text: "Dry one soil for a week, keep a twin moist, then wet the dry one. Each day's CO₂ is logged.",
        resultText:
          "While dry, the soil breathed less than its moist twin. On the day it was wetted, CO₂ jumped to several times the moist soil's rate, then fell back over a few days. A longer drought made a bigger burst.",
        facts: [F.birch, F.birchSources, F.optimum, F.global],
        attribution: {
          effect: "The CO₂ pulse on rewetting",
          candidates: [
            { id: "osmolytes", label: "Osmolytes released by cells" },
            { id: "dead-cells", label: "Cells killed by drying" },
            { id: "exposed-om", label: "Organic matter exposed as crumbs crack" },
          ],
          shares: "unresolved",
          sources: ["schimel-2018"],
        },
      },
      {
        kind: "explain-choice",
        id: "c3-m3-source",
        question: "Where did the carbon in the burst come from?",
        choices: [
          {
            id: "several",
            label: "Several sources, not yet separable",
            ok: true,
            feedback:
              "Yes. Osmolytes, dead cells and exposed organic matter all contribute, and studies have not yet pulled them apart. Saying so is the honest answer.",
          },
          {
            id: "osmolytes",
            label: "Osmolytes released by cells",
            ok: false,
            feedback: "A real candidate. Is it the only one the evidence supports?",
          },
          {
            id: "dead-cells",
            label: "Cells killed by drying",
            ok: false,
            feedback: "A real candidate. Is it the only one the evidence supports?",
          },
          {
            id: "exposed-om",
            label: "Organic matter exposed as crumbs crack",
            ok: false,
            feedback: "A real candidate. Is it the only one the evidence supports?",
          },
        ],
      },
      {
        kind: "discover",
        text: "Dry-then-wet makes soil breathe out.",
        discoveries: ["d-c3-birch"],
        codex: ["cx-c3-birch"],
        onComplete: { rumors: { "r-c3": "explained" } },
      },
    ],
    sources: ["schimel-2018", "moyano-2013", "bond-lamberty-thomson-2010"],
    simplificationNotes: [
      "One stored pool of labile carbon stands in for every candidate source; the model does not split them, because the evidence does not.",
      "Daily steps; the real burst starts within minutes to hours.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c3-m4",
    chapter: "c3",
    title: "Fast lanes",
    tier: "T2",
    learningObjective: "Water can bypass the soil matrix through macropores such as worm burrows.",
    misconceptionsTargeted: ["M30"],
    scene: "c3-rain-profile",
    steps: [
      {
        kind: "go",
        text: "Out of the crumb and up to the field: it has started to rain hard.",
        scene: "c3-rain-profile",
        object: "rain-portal",
      },
      {
        kind: "predict-choice",
        id: "c3-m4-deep",
        question:
          "Heavy rain for an hour on two patches of the same soil, one with worm burrows and one without. Where does water get deepest?",
        choices: [
          { id: "burrows", label: "With burrows", ok: true, feedback: "Let it rain and look." },
          { id: "without", label: "Without burrows", ok: false, feedback: "Let it rain and look." },
          {
            id: "same",
            label: "The same: it is the same soil",
            ok: false,
            feedback: "Same soil between the burrows. Is the water only moving through that?",
          },
        ],
      },
      {
        kind: "water",
        bench: "fast-lanes",
        text: "Rain on both patches for an hour, ten minutes at a time.",
        resultText:
          "In both patches the front through the soil moved down at the same slow pace. With burrows, water also ran straight down them, wetting soil a metre deep while the front was still near the top.",
        facts: [F.bypass],
      },
      {
        kind: "explain-choice",
        id: "c3-m4-why",
        question: "The soil between the burrows wetted at the same pace. Why was water deeper with burrows?",
        choices: [
          {
            id: "bypass",
            label: "It ran down the burrows and bypassed the soil between them",
            ok: true,
            feedback: "Yes. Wide pores carry water fast when they are full; they empty first when it stops.",
          },
          {
            id: "faster",
            label: "The worms made all of the soil drain faster",
            ok: false,
            feedback: "Compare the front between the burrows in the two patches.",
          },
          {
            id: "better",
            label: "Bigger pores are better everywhere",
            ok: false,
            feedback:
              "Fast lanes carry water deep, and with it whatever is dissolved in it. Narrow pores hold the water roots use between rains.",
            misconception: "M30",
          },
        ],
      },
      {
        kind: "discover",
        text: "Rain can take a fast lane past the soil.",
        discoveries: ["d-c3-fast"],
        codex: ["cx-c3-fast"],
      },
    ],
    sources: ["blouin-2013"],
    simplificationNotes: ["The front moves as the square root of time and burrows at a fixed speed."],
    reviewStatus: "draft",
  },
];

const c3Codex: CodexEntry[] = [
  {
    id: "cx-c3-pull",
    title: "The soil's pull on water",
    chapter: "c3",
    body: [
      "Soil holds water by capillarity in its pores and by adsorption on its grains. Matric potential measures how hard: zero when soaked, more negative as the soil dries. The narrower the pore, the harder it holds, so the widest pores empty first.",
      "Field capacity and the wilting point are conventions on that scale, not constants. And water content is not water potential: a clay and a sand with the same water content hold it at very different pulls, which is why they are measured with different instruments.",
    ],
    facts: [F.held, F.laplace, F.conventions, F.fcAir, F.sameContent],
    simplification: "Round pores of single widths; real pores are irregular and drain over a range.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c3-roads",
    title: "Water films are roads",
    chapter: "c3",
    body: [
      "Bacteria and protists swim, and their food diffuses, only through water. As soil dries the films thin and break, and the network falls apart into islands.",
      "On an island, a cell is safe from grazers but cut off from food. When rain returns, the roads reconnect.",
    ],
    facts: [F.films, F.encyst],
    reviewStatus: "draft",
  },
  {
    id: "cx-c3-birch",
    title: "The Birch pulse",
    chapter: "c3",
    body: [
      "Wet a dry soil and it breathes out a burst of CO₂, far above a soil kept moist, then settles. A longer drought makes a bigger burst.",
      "The carbon was stored while the soil was dry and released when water returned. Where it was stored is an open question.",
    ],
    facts: [F.birch, F.optimum, F.global],
    openQuestion: {
      claim: "How much of the burst comes from each source?",
      sides: [
        "Osmolytes that cells release when water returns",
        "Cells killed by drying",
        "Organic matter exposed as crumbs shrink and crack",
      ],
      sources: ["schimel-2018"],
    },
    reviewStatus: "draft",
  },
  {
    id: "cx-c3-fast",
    title: "Fast lanes",
    chapter: "c3",
    body: [
      "Rain moves through most soil as a slow front. Burrows, root channels and cracks are fast lanes: when they fill, water runs deep past the soil between them.",
      "The same lanes carry whatever the water carries, and they are the first pores to empty when the rain stops.",
    ],
    facts: [F.bypass],
    reviewStatus: "draft",
  },
];

export const c3Bundle: ChapterBundle = {
  chapter: c3,
  scenes: c3Scenes,
  missions: c3Missions,
  codex: c3Codex,
  rumors: c3Rumors,
};
