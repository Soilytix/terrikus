/** Chapter c3 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Discovery, Rumor } from "../../schema";

export const c3: Chapter = {
  id: "c3",
  number: "3",
  title: "Water Roads",
  hook: "After the dry spell, the soil breathed out a burst.",
  scales: ["aggregate", "profile"],
  world: "spinach",
  scenes: ["c3-drain", "c3-rain-profile"],
  missions: ["c3-m1", "c3-m2", "c3-m3", "c3-m4"],
  entry: "c3-drain",
  sources: [
    "or-2007",
    "schimel-2018",
    "cornell-awc",
    "meter-paw-note",
    "moyano-2013",
    "bond-lamberty-thomson-2010",
    "blouin-2013",
    "weil-brady-2017",
    "geisen-2018",
  ],
  // WB§1: chapters 3–13 open from the map once their rumor is met.
  after: ["c1", "leaf"],
  byRumor: true,
  playable: true,
  recall: [
    { prompt: "As soil dries, which pores empty first?", discovery: "d-c3-drain" },
    { prompt: "What happened when the dry soil was wetted again?", discovery: "d-c3-birch" },
  ],
  reviewStatus: "draft",
};

export const c3Rumors: Rumor[] = [
  { id: "r-c3", text: c3.hook, chapter: "c3", hintsAt: ["c3"], explainedBy: "d-c3-birch" },
];

export const c3Discoveries: Discovery[] = [
  { id: "d-c3-drain", statement: "Big pores drain first.", evidenceTier: "derived" },
  {
    id: "d-c3-roads",
    statement: "Water films are roads: drying cuts the network into islands.",
    evidenceTier: "observed",
  },
  { id: "d-c3-birch", statement: "Dry-then-wet makes soil breathe out.", evidenceTier: "observed" },
  { id: "d-c3-fast", statement: "Rain can take a fast lane past the soil.", evidenceTier: "observed" },
];
