/** Chapter c14 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Discovery, Rumor } from "../../schema";

export const c14: Chapter = {
  id: "c14",
  number: "14",
  title: "What Does the Sample Tell Us?",
  hook: "Two reports about the same field disagree.",
  scales: ["field"],
  world: "bare",
  scenes: ["c14-bench"],
  missions: ["c14-m1", "c14-m2", "c14-m3", "c14-m4", "c14-m5"],
  entry: "c14-bench",
  sources: [
    "obrien-2016",
    "carini-2016",
    "louca-2018",
    "gloor-2017",
    "smets-2016",
    "morton-2019",
    "douglas-2020",
    "lehmann-2020",
    "fierer-2017",
    "blagodatskaya-kuzyakov-2013",
    "cornell-cash-manual",
    "weil-brady-2017",
  ],
  // WB§1: chapter 14 opens once any four chapters other than the prologue are complete; no rumor needed.
  after: [],
  needsAny: 4,
  playable: true,
  recall: [
    { prompt: "A group's share of the reads went up. Did it grow?", discovery: "d-c14-relative" },
    { prompt: "What does a lab number tell you about your field?", discovery: "d-c14-method" },
  ],
  reviewStatus: "draft",
};

export const c14Rumors: Rumor[] = [
  { id: "r-c14", text: c14.hook, chapter: "c14", hintsAt: ["c14"], explainedBy: "d-c14-reports" },
];

export const c14Discoveries: Discovery[] = [
  {
    id: "d-c14-method",
    statement: "A lab number is the truth about that sample, by that method.",
    evidenceTier: "derived",
  },
  { id: "d-c14-relative", statement: "Relative is not absolute.", evidenceTier: "observed" },
  { id: "d-c14-layers", statement: "Indicators describe; models predict.", evidenceTier: "interpreted" },
  {
    id: "d-c14-budget",
    statement: "The strongest honest claim is often smaller than the exciting one.",
    evidenceTier: "interpreted",
  },
  {
    id: "d-c14-reports",
    statement: "The two reports differ by sampling depth and benchmark, not by soil.",
    evidenceTier: "observed",
  },
];
