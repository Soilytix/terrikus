/** Chapter leaf metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Rumor } from "../../schema";

export const leaf: Chapter = {
  id: "leaf",
  number: "2",
  title: "Where Did the Leaf Go?",
  hook: "The leaf vanished, but the soil barely got heavier.",
  scales: ["field", "profile", "aggregate"],
  world: "spinach",
  scenes: ["c2-hedge-edge", "c2-litter", "c2-aggregate"],
  missions: ["c2-m1", "c2-m2", "c2-m3", "c2-m4", "c2-m5"],
  entry: "c2-hedge-edge",
  sources: [
    "schmidt-2011",
    "schimel-bennett-2004",
    "manzoni-2012",
    "sinsabaugh-2013",
    "zhang-2008",
    "lehmann-kleber-2015",
    "lavallee-2020",
    "georgiou-2022",
    "liang-2017",
    "kallenbach-2016",
    "liang-2019",
    "davidson-janssens-2006",
    "keiluweit-2017",
    "moyano-2013",
    "nrcs-cn-ratios",
    "bond-lamberty-thomson-2010",
    "friedlingstein-2023",
    "scharlemann-2014",
    "kuzyakov-2010",
    "fontaine-2007",
    "pribyl-2010",
  ],
  after: ["prologue"],
  playable: true,
  rumor: "r-c2-leaf",
  lens: true,
  recall: [
    { prompt: "Where did the leaf's carbon go?", discovery: "d-c2-conserved" },
    { prompt: "What did you find limits decomposition here?", discovery: "d-c2-moisture" },
  ],
  reviewStatus: "draft",
};

export const leafRumors: Rumor[] = [
  {
    id: "r-c2-leaf",
    text: "The leaf vanished, but the soil barely got heavier.",
    chapter: "leaf",
    hintsAt: ["leaf"],
    explainedBy: "d-c2-conserved",
  },
];
