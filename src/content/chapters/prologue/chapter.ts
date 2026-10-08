/** Chapter prologue metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Rumor } from "../../schema";

export const prologue: Chapter = {
  id: "prologue",
  number: "P",
  title: "A Handful of Soil",
  hook: "Is this alive?",
  scales: ["field", "aggregate"],
  world: "spinach",
  scenes: ["p-field-dawn", "p-handful", "p-pore"],
  missions: ["p-m1", "p-m2"],
  entry: "p-field-dawn",
  sources: [
    "soils4teachers-basics",
    "blagodatskaya-kuzyakov-2013",
    "lennon-jones-2011",
    "nrcs-soil-biology-primer",
    "torsvik-1990",
    "torsvik-ovreas-2002",
    "roesch-2007",
    "raynaud-nunan-2014",
    "young-crawford-2004",
    "young-ritz-2000",
    "tecon-or-2017",
    "anthony-2023",
  ],
  after: [],
  playable: true,
  recall: [
    { prompt: "How much of a handful of topsoil is solid?", discovery: "d-p-half-space" },
    { prompt: "What were most of the microbes in the pore doing?", discovery: "d-p-sleepers" },
  ],
  reviewStatus: "draft",
};

export const prologueRumors: Rumor[] = [
  {
    id: "r-p-starving",
    text: "This bacterium is next to food but not eating. Why?",
    chapter: "c1",
    hintsAt: ["c1"],
  },
];
