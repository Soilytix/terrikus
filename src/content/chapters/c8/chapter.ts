/** Chapter c8 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Discovery, Rumor } from "../../schema";

export const c8: Chapter = {
  id: "c8",
  number: "8",
  title: "Partners and Traders",
  hook: "This plant grows without nitrogen fertiliser, and that one typically forms no partnership with root fungi.",
  scales: ["rhizosphere", "cell"],
  world: "pea",
  scenes: ["c8-nodule", "c8-arbuscule"],
  // Nodule missions first, then down into the cortex cell: one trip between the scenes.
  missions: ["c8-m3", "c8-m4", "c8-m5", "c8-m1", "c8-m2", "c8-m6", "c8-m7"],
  entry: "c8-nodule",
  sources: [
    "smith-2003",
    "leake-2004",
    "brundrett-tedersoo-2018",
    "karst-2023",
    "rillig-2004",
    "gillespie-2011",
    "hoffman-2014",
    "herridge-2008",
    "oldroyd-2013",
    "ott-2005",
    "shen-2011",
    "hinsinger-2001",
    "walker-syers-1976",
    "fowler-2013",
    "akiyama-2005",
  ],
  after: ["c7"],
  playable: true,
  rumor: "r-c8",
  reviewStatus: "draft",
};

export const c8Rumors: Rumor[] = [
  {
    id: "r-c8",
    text: "This plant grows without nitrogen fertiliser, and that one typically forms no partnership with root fungi.",
    chapter: "c8",
    hintsAt: ["c8"],
    explainedBy: "d-c8-no-partner",
  },
];

export const C8_DISCOVERIES: Discovery[] = [
  {
    id: "d-c8-specific",
    statement: "Partners are specific: pea rhizobia are refused by a bean root.",
    evidenceTier: "derived",
  },
  {
    id: "d-c8-pink",
    statement: "Pink means working; a nodule count is not a fixation rate.",
    evidenceTier: "derived",
  },
  {
    id: "d-c8-switch",
    statement: "Nitrate switched nodulation and fixation down: fixing is the dearer way to get N.",
    evidenceTier: "derived",
  },
  {
    id: "d-c8-trade",
    statement: "Partnerships are trades, and trades depend on prices.",
    evidenceTier: "derived",
  },
  {
    id: "d-c8-no-partner",
    statement: "Not every crop has a fungus: spinach and sugar beet go without.",
    evidenceTier: "reference",
  },
  {
    id: "d-c8-reach",
    statement: "Phosphate barely moves; roots reach for it or release it.",
    evidenceTier: "derived",
  },
  {
    id: "d-c8-network",
    statement: "The popular wood wide web runs ahead of its field evidence.",
    evidenceTier: "interpreted",
  },
];
