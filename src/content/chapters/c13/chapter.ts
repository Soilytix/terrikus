/** Chapter c13 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Discovery, Rumor } from "../../schema";

export const c13: Chapter = {
  id: "c13",
  number: "13",
  title: "Hillslope and River",
  hook: "Where does the soil from the hill go?",
  scales: ["landscape", "field"],
  world: "rice",
  scenes: ["c13-valley", "c13-splash", "c13-salt"],
  missions: ["c13-m1", "c13-m2", "c13-m3", "c13-m4"],
  entry: "c13-valley",
  sources: [
    "montgomery-2007",
    "borrelli-2017",
    "verheijen-2009",
    "fao-2015-swsr",
    "usda-hb60",
    "fao-2024-salt",
    "cordell-2009",
    "drusch-2012",
    "nrcs-soil-survey-manual",
  ],
  // WB§1: chapters 3–13 open from the map once their rumor is met.
  after: ["c1", "leaf"],
  byRumor: true,
  playable: true,
  recall: [
    { prompt: "Where did the soil from the bare strip go?", discovery: "d-c13-invisible" },
    { prompt: "What does a satellite pixel measure?", discovery: "d-c13-colour" },
  ],
  reviewStatus: "draft",
};

export const c13Rumors: Rumor[] = [
  { id: "r-c13", text: c13.hook, chapter: "c13", hintsAt: ["c13"], explainedBy: "d-c13-river" },
];

export const c13Discoveries: Discovery[] = [
  { id: "d-c13-invisible", statement: "Most erosion is invisible.", evidenceTier: "observed" },
  { id: "d-c13-river", statement: "The river remembers the hill.", evidenceTier: "observed" },
  { id: "d-c13-salt", statement: "Salt stays where water cannot leave.", evidenceTier: "observed" },
  { id: "d-c13-colour", statement: "A satellite sees colour, not cause.", evidenceTier: "interpreted" },
];
