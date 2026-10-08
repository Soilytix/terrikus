/** Chapter c11 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Discovery, Rumor } from "../../schema";

export const c11: Chapter = {
  id: "c11",
  number: "11",
  title: "Pit Walls and Deep Time",
  hook: "Why are these layers different colours?",
  scales: ["profile", "landscape"],
  world: "forest",
  scenes: ["c11-pit", "c11-catena"],
  missions: ["c11-m1", "c11-m2", "c11-m3", "c11-m4"],
  entry: "c11-pit",
  sources: [
    "nrcs-soil-survey-manual",
    "nrcs-field-book",
    "jenny-1941",
    "wrb-2022",
    "fao-2015-swsr",
    "verheijen-2009",
    "montgomery-2007",
    "jrc-2016-gsba",
  ],
  // WB§1: chapters 3–13 open from the map once their rumor is met.
  after: ["c1", "leaf"],
  byRumor: true,
  playable: true,
  recall: [
    { prompt: "What does a grey layer with rust spots tell you?", discovery: "d-c11-diary" },
    { prompt: "How long does a centimetre of topsoil take to form?", discovery: "d-c11-slow" },
  ],
  reviewStatus: "draft",
};

export const c11Rumors: Rumor[] = [
  { id: "r-c11", text: c11.hook, chapter: "c11", hintsAt: ["c11"], explainedBy: "d-c11-diary" },
];

export const c11Discoveries: Discovery[] = [
  { id: "d-c11-diary", statement: "Colour is a diary.", evidenceTier: "interpreted" },
  {
    id: "d-c11-podzol",
    statement: "Soil forms from the top down, and is mixed both ways.",
    evidenceTier: "observed",
  },
  {
    id: "d-c11-catena",
    statement: "Position on the hill decides how wet a soil is, and colour keeps the record.",
    evidenceTier: "interpreted",
  },
  { id: "d-c11-slow", statement: "Topsoil is not renewable on a human timescale.", evidenceTier: "derived" },
];
