/** Chapter c12 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Discovery, Rumor } from "../../schema";

export const c12: Chapter = {
  id: "c12",
  number: "12",
  title: "Fields and Seasons",
  hook: "Same seed, two fields, different harvests.",
  scales: ["field", "aggregate"],
  world: "spinach",
  scenes: ["c12-twin-fields", "c12-wheel"],
  missions: ["c12-m1", "c12-m2", "c12-m3", "c12-m4", "c12-m5"],
  entry: "c12-twin-fields",
  sources: [
    "pittelkow-2015",
    "powlson-2014",
    "ogle-2019",
    "poeplau-don-2015",
    "chaplot-smith-2023",
    "bennett-2012",
    "van-der-putten-2013",
    "hamza-anderson-2005",
    "keller-2019",
    "bengough-2011",
    "lehmann-2020",
    "six-2004",
    "tonitto-2006",
    "keiluweit-2017",
    "gloor-2017",
  ],
  // WB§1: chapters 3–13 open from the map once their rumor has been met.
  after: ["c1", "leaf"],
  byRumor: true,
  playable: true,
  recall: [
    { prompt: "Does no-till raise yield?", discovery: "d-c12-hypothesis" },
    { prompt: "Where did the reduced-tillage carbon come from?", discovery: "d-c12-depth" },
  ],
  reviewStatus: "draft",
};

export const c12Rumors: Rumor[] = [
  { id: "r-c12", text: c12.hook, chapter: "c12", hintsAt: ["c12"], explainedBy: "d-c12-shared" },
];

export const c12Discoveries: Discovery[] = [
  {
    id: "d-c12-mechanism",
    statement:
      "Each practice works through a mechanism: tillage breaks crumbs, covers catch nitrate, short rotations feed pathogens.",
    evidenceTier: "derived",
  },
  {
    id: "d-c12-hypothesis",
    statement: "A practice is a hypothesis about this field.",
    evidenceTier: "derived",
  },
  { id: "d-c12-depth", statement: "The answer depends on depth.", evidenceTier: "derived" },
  {
    id: "d-c12-wheels",
    statement: "A heavy wheel on wet soil crushed the big pores, and the next rain ponded.",
    evidenceTier: "observed",
  },
  {
    id: "d-c12-shared",
    statement: "Two things moving together may share a cause.",
    evidenceTier: "interpreted",
  },
];
