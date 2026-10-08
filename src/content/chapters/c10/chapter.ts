/** Chapter c10 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Discovery, Rumor } from "../../schema";

export const c10: Chapter = {
  id: "c10",
  number: "10",
  title: "Disease and Defence",
  hook: "The pathogen is here, but the plants are healthy.",
  scales: ["rhizosphere"],
  world: "bean",
  scenes: ["c10-triangle", "c10-shield"],
  missions: ["c10-m1", "c10-m2", "c10-m3", "c10-m4"],
  entry: "c10-triangle",
  sources: [
    "scholthof-2007",
    "bennett-2012",
    "weller-2002",
    "schlatter-2017",
    "mendes-2011",
    "carrion-2019",
    "van-der-putten-2013",
    "geisen-2018",
    "ongena-jacques-2008",
  ],
  // WB§1: chapters 3–13 open from the map once their rumor has been met.
  after: ["c1", "leaf"],
  byRumor: true,
  playable: true,
  rumor: "r-c10",
  reviewStatus: "draft",
};

export const c10Rumors: Rumor[] = [
  {
    id: "r-c10",
    text: "The pathogen is here, but the plants are healthy.",
    chapter: "c10",
    hintsAt: ["c10"],
    explainedBy: "d-c10-present",
  },
];

export const C10_DISCOVERIES: Discovery[] = [
  {
    id: "d-c10-present",
    statement:
      "Present is not sick: disease needs a host, a virulent pathogen and conducive weather together.",
    evidenceTier: "observed",
  },
  {
    id: "d-c10-rotation",
    statement: "Growing the same host again and again builds up what waits in the soil.",
    evidenceTier: "derived",
  },
  {
    id: "d-c10-shield",
    statement: "Some soils defend, and sometimes you can move the defence.",
    evidenceTier: "observed",
  },
  {
    id: "d-c10-ladder",
    statement: "Each rung of evidence is a different claim.",
    evidenceTier: "interpreted",
  },
];
