/**
 * Chapter 9 — The Nitrogen Relay (world-bible §6): the N cycle stage by stage
 * on the sugar beet world, run on T18's nitrogen engine through the `straw-n`
 * bench. Not yet here: the `c9-beet-field` field scene, c9-m5 "The prime
 * suspect" (the chapter 2 stretch) and the expected cause chains.
 */
import type { ChapterBundle, CodexEntry, Fact, Mission, RelayLeg, Scene } from "../../schema";
import { c9, c9Rumors } from "./chapter";

/** C:N rule of thumb, quoted wherever a step explains immobilisation. */
const CN_FACT: Fact = {
  id: "c9-cn-diet",
  text: "Soil microbes have bodies of roughly 8 parts carbon to 1 of nitrogen and need a diet near 24:1, because they breathe much of the carbon out. Residue richer in carbon than that leads to net immobilisation; poorer, to net release. Young leafy residue is often 10–20:1, cereal straw 80:1 or more.",
  confidence: "estimate",
  sources: ["nrcs-cn-ratios"],
  simplification:
    "A rule of thumb, and its source is still to be checked by hand. The bench uses 15:1 for beet tops and 80:1 for straw.",
};

const TOTAL_FACT: Fact = {
  id: "c9-total",
  text: "Almost all soil nitrogen is in organic matter. The ammonium and nitrate a plant can take up are a small, fast-cycling fraction of the total.",
  confidence: "firm",
  sources: ["umn-n-cycle-2025", "schimel-bennett-2004"],
};

const c9Scenes: Scene[] = [
  {
    id: "c9-relay",
    chapter: "c9",
    title: "Under the beet field",
    scale: "rhizosphere",
    tone: "dark",
    recipe: "c9-relay",
    seed: 91,
    scaleBar: { metres: 0.1, label: "10 cm" },
    notToScale: 2000,
    description:
      "A slice through a sugar beet field in spring. Pale straw lies on and just under the surface, crowded with bacteria. The beet's taproot runs down the left with fine side roots. In the middle a small colony of ammonia oxidisers sits between the grains; to the right a dark, waterlogged crumb holds bacteria in its airless core, with bubbles rising from it. A field drain crosses the bottom, and faint wisps leave the surface above the straw.",
    truth: {
      drawnFrom: [
        "Textbook diagrams of the soil nitrogen cycle",
        "Sections of arable topsoil with a taproot",
      ],
      schematic: [
        "The relay's stages are drawn side by side; in a real field they overlap in the same millimetres",
        "Cells drawn about 2,000× enlarged",
        "Nitrite is skipped by the bench: NH₄⁺ goes to NO₃⁻ in one step",
      ],
      invented: ["This field, its straw, root, crumb and drain"],
      notSimulated: ["Distance: the bench is one well-mixed field", "Nitrogen fixation (chapter 8)"],
    },
    up: "valley",
    objects: [
      {
        id: "straw",
        label: "Ploughed-in straw",
        kind: "scan",
        anchor: { x: 0.5, y: 0.19 },
        portrait: { x: 0.82, y: 0.25 },
        scan: "Cereal straw from last season, worked into the top of the soil. It carries a lot of carbon and little nitrogen.",
        facts: [CN_FACT],
      },
      {
        id: "decomposers",
        label: "Decomposers on the straw",
        kind: "scan",
        anchor: { x: 0.6, y: 0.3 },
        portrait: { x: 0.64, y: 0.33 },
        card: "bacteria-copio",
        scan: "Bacteria and fungi break the straw down. What they release as ammonium, they did not need; on straw they need more than it holds.",
      },
      {
        id: "nitrifiers",
        label: "Ammonia oxidisers",
        kind: "scan",
        anchor: { x: 0.47, y: 0.5 },
        portrait: { x: 0.5, y: 0.44 },
        card: "nitrifier-aoa",
        scan: "A small colony that gains energy by turning ammonium into nitrite. Archaea and bacteria both do this step, and some Nitrospira do the whole way to nitrate.",
        facts: [
          {
            id: "c9-comammox",
            text: "Some Nitrospira bacteria oxidise ammonia all the way to nitrate on their own (comammox).",
            confidence: "firm",
            sources: ["daims-2015", "van-kessel-2015"],
          },
        ],
      },
      {
        id: "beet-root",
        label: "Sugar beet taproot",
        kind: "scan",
        anchor: { x: 0.3, y: 0.46 },
        portrait: { x: 0.24, y: 0.42 },
        scan: "The beet takes up nitrogen mostly as nitrate and ammonium, dissolved in the water around its roots, not straight from organic matter.",
        facts: [TOTAL_FACT],
      },
      {
        id: "microsite",
        label: "Waterlogged crumb",
        kind: "scan",
        anchor: { x: 0.66, y: 0.6 },
        portrait: { x: 0.74, y: 0.52 },
        card: "denitrifier",
        scan: "Inside this crumb every pore is full of water and the oxygen is used up. Denitrifiers breathe nitrate instead and let N₂O and N₂ go.",
        facts: [
          {
            id: "c9-n2o",
            text: "Agriculture is the largest human source of N₂O, released partly by denitrification in wet soil.",
            confidence: "estimate",
            sources: ["tian-2020"],
          },
        ],
      },
      {
        id: "drain",
        label: "Field drain",
        kind: "scan",
        anchor: { x: 0.62, y: 0.9 },
        portrait: { x: 0.86, y: 0.67 },
        scan: "Water that drains through the soil carries nitrate with it. Nitrate is an anion, so the soil's mostly negative surfaces cannot hold it.",
      },
      {
        id: "surface",
        label: "Air above the straw",
        kind: "scan",
        anchor: { x: 0.5, y: 0.08 },
        portrait: { x: 0.4, y: 0.2 },
        scan: "Ammonium at the surface can escape as ammonia gas, NH₃. How much depends on pH, warmth, wind and whether it is worked in; the bench uses one small rate.",
      },
      {
        id: "bench",
        label: "Open the straw bench",
        kind: "portal",
        anchor: { x: 0.12, y: 0.88 },
        portrait: { x: 0.1, y: 0.67 },
        to: "#/bench/straw-n",
        requires: "c9-m2-done",
      },
    ],
    reviewStatus: "draft",
  },
];

const relayLegs: RelayLeg[] = [
  {
    id: "mineralise",
    from: "Organic N (straw, soil organic matter)",
    to: "Ammonium, NH₄⁺",
    choices: [
      {
        id: "decomposers",
        label: "Decomposers",
        ok: true,
        feedback:
          "Yes. Decomposers take organic matter apart and release the nitrogen they do not need as ammonium: mineralisation.",
      },
      {
        id: "nitrifiers",
        label: "Ammonia oxidisers",
        ok: false,
        feedback: "Ammonia oxidisers start from ammonium. Who makes ammonium out of organic matter first?",
      },
      {
        id: "beet",
        label: "The beet root",
        ok: false,
        feedback:
          "The beet takes up mineral nitrogen, not straw. Someone has to unlock the organic nitrogen before it gets a turn.",
        misconception: "M16",
      },
    ],
  },
  {
    id: "oxidise",
    from: "Ammonium, NH₄⁺",
    to: "Nitrite, NO₂⁻",
    choices: [
      {
        id: "aoa-aob",
        label: "Ammonia-oxidising archaea and bacteria",
        ok: true,
        feedback: "Yes. Both archaea and bacteria run this leg, using oxygen to turn ammonium into nitrite.",
      },
      {
        id: "denitrifiers",
        label: "Denitrifiers",
        ok: false,
        feedback:
          "Denitrifiers work without oxygen and take nitrate apart. This leg needs oxygen and goes the other way.",
      },
    ],
  },
  {
    id: "nitrate",
    from: "Nitrite, NO₂⁻",
    to: "Nitrate, NO₃⁻",
    choices: [
      {
        id: "nob",
        label: "Nitrite oxidisers, or comammox Nitrospira running both legs alone",
        ok: true,
        feedback:
          "Yes. The textbook relay has two kinds of bacteria in sequence; comammox Nitrospira can carry the baton both legs.",
      },
      {
        id: "beet",
        label: "The beet root",
        ok: false,
        feedback: "Nitrite rarely piles up long enough for a root to take it. Who turns it into nitrate?",
      },
    ],
  },
  {
    id: "uptake",
    from: "Nitrate, NO₃⁻",
    to: "Sugar beet",
    choices: [
      {
        id: "root",
        label: "The beet root takes it up",
        ok: true,
        feedback: "Yes. The baton reaches the crop.",
      },
      {
        id: "drain",
        label: "Rain carries it to the drain",
        ok: false,
        feedback: "That happens too, but it is a leak out of the field, not a handoff to the crop.",
      },
      {
        id: "crumb",
        label: "Denitrifiers in the wet crumb",
        ok: false,
        feedback: "Without oxygen they do take nitrate, and it leaves as gas: another leak, not a handoff.",
      },
    ],
  },
];

const c9Missions: Mission[] = [
  {
    id: "c9-m1",
    chapter: "c9",
    title: "The nitrogen relay",
    tier: "T2",
    learningObjective:
      "Nitrogen reaches the crop through a relay: organic N to ammonium (decomposers), ammonium to nitrite to nitrate (nitrifiers), nitrate to the root. Most of the field's N stays organic.",
    misconceptionsTargeted: ["M16"],
    scene: "c9-relay",
    steps: [
      {
        kind: "scan",
        text: "Look at the straw, the decomposers, the ammonia oxidisers and the beet root.",
        objects: ["straw", "decomposers", "nitrifiers", "beet-root"],
      },
      {
        kind: "relay",
        text: "Hand the nitrogen baton from runner to runner. Then follow a season of it on the bench.",
        legs: relayLegs,
        facts: [TOTAL_FACT],
      },
      {
        kind: "explain-choice",
        id: "c9-m1-explain",
        question:
          "All season most of the field's nitrogen sat in organic matter. Why could the beet still go short?",
        choices: [
          {
            id: "small-pool",
            label: "The beet can only use the small mineral pool, and the relay refills it slowly",
            ok: true,
            feedback: "Yes. Total nitrogen is large; available nitrogen is the trickle the relay hands on.",
          },
          {
            id: "lost",
            label: "The organic nitrogen had been lost",
            ok: false,
            feedback: "Look at the account: 100.0 %. Where was it sitting?",
            misconception: "M16",
          },
        ],
      },
      {
        kind: "discover",
        text: "Total is not available.",
        discoveries: ["d-c9-total"],
        codex: ["cx-c9-relay"],
        cards: ["nitrifier-aoa", "nitrifier-aob", "comammox"],
      },
    ],
    sources: ["umn-n-cycle-2025", "schimel-bennett-2004", "daims-2015", "van-kessel-2015"],
    simplificationNotes: [
      "The bench skips nitrite: ammonium becomes nitrate in one step.",
      "One well-mixed field; teaching rates on T18's nitrogen engine.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c9-m2",
    chapter: "c9",
    title: "Why is nitrogen temporarily unavailable?",
    tier: "T2",
    learningObjective:
      "Residue with a high C:N makes microbes take mineral N from the soil (immobilisation), so less is left for the crop for a while. The N is borrowed, not lost.",
    misconceptionsTargeted: ["M16", "M26"],
    scene: "c9-relay",
    steps: [
      {
        kind: "predict-choice",
        id: "c9-m2-predict",
        question:
          "Straw is ploughed in before the beet is sown. Over the first two months, what happens to the ammonium and nitrate the beet can use?",
        choices: [
          {
            id: "dip",
            label: "It falls for a while",
            ok: true,
            feedback: "Your prediction. Run the bench and watch the mineral N line.",
          },
          {
            id: "rise",
            label: "It rises: the straw brings nitrogen",
            ok: true,
            feedback: "Your prediction. Run the bench and watch the mineral N line.",
          },
          {
            id: "same",
            label: "It stays about the same",
            ok: true,
            feedback: "Your prediction. Run the bench and watch the mineral N line.",
          },
        ],
      },
      {
        kind: "straw-run",
        text: "The same field, once with cereal straw and once with beet tops ploughed in. Step through the season.",
        facts: [CN_FACT],
      },
      {
        kind: "explain-choice",
        id: "c9-m2-explain",
        question: "Why did mineral N fall after straw but not after beet tops?",
        choices: [
          {
            id: "cn",
            label: "Microbes eating straw need more N than it carries, so they take it from the soil",
            ok: true,
            feedback:
              "Yes. Straw is about 80 parts carbon to 1 of nitrogen; a microbe's diet is nearer 24:1. Microbial N rose as mineral N fell.",
          },
          {
            id: "sponge",
            label: "The straw soaked the nitrogen up",
            ok: false,
            feedback:
              "Look at which row rose while mineral N fell. Was it the straw, or something living on it?",
          },
          {
            id: "air",
            label: "The nitrogen escaped to the air",
            ok: false,
            feedback: "Check the losses row and the account. Where did the nitrogen go?",
            misconception: "M26",
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c9-m2-borrowed",
        question: "Is the nitrogen the microbes took lost to the beet?",
        choices: [
          {
            id: "borrowed",
            label: "Borrowed: it comes back as microbes die and are eaten",
            ok: true,
            feedback: "Yes. Later in the season the crop's uptake picks up again as the straw runs out.",
          },
          {
            id: "lost",
            label: "Lost to the beet for the season",
            ok: false,
            feedback:
              "The account never drops below 100.0 %. Follow the microbial N row to the end of the season.",
            misconception: "M26",
          },
        ],
      },
      {
        kind: "discover",
        text: "Microbes borrow nitrogen and give it back later.",
        discoveries: ["d-c9-borrow"],
        codex: ["cx-c9-cn"],
        onComplete: { rumors: { "r-c9": "explained" } },
      },
    ],
    sources: ["nrcs-cn-ratios", "schimel-bennett-2004"],
    simplificationNotes: [
      "A textbook mechanism on a teaching model; it says nothing about the yield of any real field.",
      "Beet tops use the leaf jar's green-leaf rates at C:N 15; straw its straw rates at C:N 80.",
      "The crop's uptake ramps up linearly over its first 60 days.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c9-m3",
    chapter: "c9",
    title: "Leak hunt",
    tier: "T3",
    learningObjective:
      "Nitrogen leaves a field three ways: nitrate down the drain, N₂O and N₂ from wet soil, and NH₃ from the surface. A crop's roots take nitrate before rain can carry it away.",
    misconceptionsTargeted: ["M26"],
    scene: "c9-relay",
    steps: [
      {
        kind: "scan",
        text: "Look at the drain, the waterlogged crumb and the air above the straw.",
        objects: ["drain", "microsite", "surface"],
      },
      {
        kind: "leak-hunt",
        text: "A season of heavy rain after ammonium fertiliser, on bare soil and under a beet crop. Find the three ways nitrogen leaves the field.",
        spots: [
          {
            id: "leaching",
            label: "Nitrate to the drain",
            ok: true,
            feedback: "Found. Nitrate moves with drainage water.",
          },
          {
            id: "denitrification",
            label: "N₂O and N₂ from the wet crumb",
            ok: true,
            feedback: "Found. Without oxygen, denitrifiers breathe nitrate and release gas.",
          },
          {
            id: "volatilisation",
            label: "NH₃ from the surface",
            ok: true,
            feedback: "Found. Ammonium at the surface can escape as ammonia.",
          },
          {
            id: "immobilisation",
            label: "Nitrogen taken into microbes",
            ok: false,
            feedback: "Still in the field: borrowed, not lost.",
            misconception: "M26",
          },
          {
            id: "plant-uptake",
            label: "Nitrogen taken up by the beet",
            ok: false,
            feedback: "That is the crop getting it, not a leak.",
          },
        ],
        facts: [
          {
            id: "c9-nue",
            text: "Globally, the share of cropland nitrogen inputs that ends up in harvested crops fell from about 68 % in 1961 to about 47 % in 2009.",
            confidence: "estimate",
            sources: ["lassaletta-2014"],
          },
        ],
      },
      {
        kind: "explain-choice",
        id: "c9-m3-cover",
        question: "Under the crop, less nitrate reached the drain. Why?",
        choices: [
          {
            id: "roots",
            label: "Roots took nitrate up before the rain could carry it down",
            ok: true,
            feedback: "Yes. Living roots compete with the drain for the same nitrate.",
          },
          {
            id: "umbrella",
            label: "The leaves kept the rain off",
            ok: false,
            feedback: "The bench gave both plots the same rain. What else was different under the crop?",
          },
        ],
      },
      {
        kind: "discover",
        text: "Nitrogen leaks to water and air; roots in the ground take it first.",
        discoveries: ["d-c9-leaks"],
        cards: ["denitrifier"],
      },
    ],
    sources: ["tian-2020", "lassaletta-2014", "umn-n-cycle-2025"],
    simplificationNotes: [
      "Heavy rain is the engine's waterlogged soil for the whole season, not a single storm.",
      "NH₃ loss uses one small rate; pH, wind and incorporation are not simulated.",
    ],
    reviewStatus: "draft",
  },
  {
    id: "c9-m4",
    chapter: "c9",
    title: "Gene ≠ rate",
    tier: "T4",
    learningObjective:
      "A count of nitrification genes shows who could nitrify, not how fast they are doing it. Claiming a rate needs a measurement of the rate.",
    misconceptionsTargeted: ["M23", "M16"],
    scene: "c9-relay",
    steps: [
      {
        kind: "gene-rate",
        id: "c9-m4-claim",
        text: "A qPCR result arrives from both plots, 20 days after the residue went in: amoA gene copies per gram of soil, the gene for the first step of nitrification.",
        measurements: [
          {
            id: "incubation",
            label: "Nitrate production in a 7-day incubation",
            ok: true,
            feedback: "A rate, measured on the soil itself.",
          },
          {
            id: "qpcr-again",
            label: "A second qPCR on another core",
            ok: false,
            feedback: "Still a gene count: it says who could nitrify, not how fast.",
          },
          {
            id: "sequencing",
            label: "Sequence the community",
            ok: false,
            feedback: "Shares of reads say who is there relative to others, not what they are doing.",
            misconception: "M23",
          },
          {
            id: "total-n",
            label: "Total soil nitrogen",
            ok: false,
            feedback: "A stock, not a rate, and most of it is organic.",
            misconception: "M16",
          },
        ],
        question: "What can you claim about nitrification in the straw plot?",
        claims: [
          {
            id: "high",
            label: "Nitrification is high: the genes are abundant",
            ok: false,
            feedback: "Look at the incubation beside the gene counts. Do they say the same thing?",
            misconception: "M23",
          },
          {
            id: "potential",
            label: "The potential is there, but little or no nitrate is being made right now",
            ok: true,
            feedback:
              "Yes. Same genes in both plots, different rates: under straw the microbes take the ammonium the nitrifiers would use.",
          },
          {
            id: "dead",
            label: "The ammonia oxidisers in the straw plot are dead",
            ok: false,
            feedback:
              "Neither measurement says who is alive. What does a nitrifier need that straw takes away?",
          },
        ],
        facts: [
          {
            id: "c9-amoa",
            text: "Archaeal amoA genes outnumbered bacterial ones by up to about 3,000 to 1 across 12 soils.",
            confidence: "estimate",
            evidence: "measured",
            sources: ["leininger-2006"],
            simplification: "The counts here are teaching values, about 200 to 1.",
          },
        ],
      },
      {
        kind: "discover",
        text: "A gene count is a potential, not a rate.",
        discoveries: ["d-c9-gene"],
        codex: ["cx-c9-gene"],
      },
    ],
    sources: ["leininger-2006"],
    simplificationNotes: [
      "Gene counts are fixed teaching values; the incubation is the bench run in a jar with no crop and no rain.",
    ],
    reviewStatus: "draft",
  },
];

const c9Codex: CodexEntry[] = [
  {
    id: "cx-c9-relay",
    title: "The nitrogen relay",
    chapter: "c9",
    body: [
      "Nitrogen reaches a crop through a relay. Decomposers release ammonium from organic matter; ammonia oxidisers turn it into nitrite and nitrite oxidisers into nitrate; roots take up both ammonium and nitrate.",
      "There are exits along the way: nitrate drains away with water, denitrifiers in airless pockets breathe it out as N₂O and N₂, and ammonium at the surface can escape as ammonia.",
    ],
    facts: [TOTAL_FACT],
    revised: {
      old: "Nitrification is two groups of bacteria in sequence.",
      now: "Archaea do the first step too, and comammox Nitrospira can do both steps in one cell.",
      sources: ["leininger-2006", "daims-2015", "van-kessel-2015"],
    },
    realWorld: [
      {
        id: "cx-c9-haber",
        text: "Industrial fixation by the Haber–Bosch process adds about 120 Tg of nitrogen a year, against about 63 Tg fixed naturally on land.",
        confidence: "estimate",
        sources: ["fowler-2013"],
      },
      {
        id: "cx-c9-gwp",
        text: "Over 100 years, N₂O warms about 273 times as much as the same mass of CO₂.",
        confidence: "firm",
        sources: ["ipcc-ar6-wg1-ch7"],
      },
    ],
    simplification: "The bench skips nitrite and runs one well-mixed field.",
    reviewStatus: "draft",
  },
  {
    id: "cx-c9-cn",
    title: "Borrowed, not lost",
    chapter: "c9",
    body: [
      "A microbe eating straw is short of nitrogen: the straw has far more carbon per unit of nitrogen than the microbe's body. It takes ammonium and nitrate from the soil water to make up the gap, and for a while there is less left for the crop.",
      "The nitrogen is borrowed. As the straw runs out, microbes die and are eaten, and their nitrogen is released as ammonium again.",
    ],
    facts: [CN_FACT],
    reviewStatus: "draft",
  },
  {
    id: "cx-c9-gene",
    title: "A gene count is a potential",
    chapter: "c9",
    body: [
      "qPCR counts copies of a gene. Many copies of amoA mean many cells that could oxidise ammonia; they say nothing about whether those cells have ammonium, oxygen or the conditions to do it today.",
      "A rate is measured as a rate: nitrate made in an incubation, or a tracer followed through the pools. Gene and rate together say more than either alone.",
    ],
    facts: [
      {
        id: "cx-c9-aoa",
        text: "Archaeal amoA genes outnumbered bacterial ones by up to about 3,000 to 1 across 12 soils.",
        confidence: "estimate",
        evidence: "measured",
        sources: ["leininger-2006"],
      },
    ],
    reviewStatus: "draft",
  },
];

export const c9Bundle: ChapterBundle = {
  chapter: c9,
  scenes: c9Scenes,
  missions: c9Missions,
  codex: c9Codex,
  rumors: c9Rumors,
};
