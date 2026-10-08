/** Chapter c7 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Discovery, Rumor } from "../../schema";

export const c7: Chapter = {
  id: "c7",
  number: "7",
  title: "The Root's Neighbourhood",
  hook: "The soil touching the root is a different country.",
  scales: ["rhizosphere"],
  world: "spinach",
  scenes: ["c7-root-tip"],
  missions: ["c7-m1", "c7-m2", "c7-m3", "c7-m4"],
  entry: "c7-root-tip",
  sources: [
    "kuzyakov-razavi-2019",
    "bais-2006",
    "akiyama-2005",
    "philippot-2013",
    "mendes-2011",
    "pausch-kuzyakov-2018",
    "clarholm-1985",
    "bonkowski-2004",
    "gloor-2017",
    "vandeputte-2017",
  ],
  after: ["c6"],
  playable: true,
  rumor: "r-c7",
  reviewStatus: "draft",
};

export const c7Rumors: Rumor[] = [
  {
    id: "r-c7",
    text: "The soil touching the root is a different country.",
    chapter: "c7",
    hintsAt: ["c7"],
    explainedBy: "d-c7-inputs",
  },
];

export const C7_DISCOVERIES: Discovery[] = [
  {
    id: "d-c7-inputs",
    statement: "The root feeds a bloom; grazers return its nitrogen. C and N were 100.0 % accounted for.",
    evidenceTier: "derived",
  },
  {
    id: "d-c7-bare",
    statement: "The same soil with a root breathes more and holds more dissolved carbon than without.",
    evidenceTier: "derived",
  },
  {
    id: "d-c7-home-away",
    statement: "Near the root and away from it are different samples; a share near the root is not a count.",
    evidenceTier: "interpreted",
  },
  {
    id: "d-c7-filter",
    statement: "The plant feeds and filters its neighbours, but not precisely.",
    evidenceTier: "reference",
  },
  {
    id: "d-c7-signal",
    statement: "A root also signals, and only some neighbours can answer.",
    evidenceTier: "reference",
  },
];
