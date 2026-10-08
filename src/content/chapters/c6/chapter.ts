/** Chapter c6 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Discovery, Rumor } from "../../schema";

export const c6: Chapter = {
  id: "c6",
  number: "6",
  title: "Who Eats Whom",
  hook: "Bacteria near the root multiply, then crash.",
  scales: ["aggregate", "rhizosphere"],
  world: "spinach",
  scenes: ["c6-gallery", "c6-geosmin"],
  missions: ["c6-m1", "c6-m2", "c6-m3", "c6-m4", "c6-m6"],
  entry: "c6-gallery",
  sources: [
    "nrcs-soil-biology-primer",
    "fao-2020-soil-biodiversity",
    "clarholm-1985",
    "bonkowski-2004",
    "geisen-2018",
    "van-den-hoogen-2019",
    "becher-2020",
    "barka-2016",
    "fierer-2017",
    "strickland-rousk-2010",
    "carini-2016",
    "gloor-2017",
    "anthony-2023",
  ],
  after: ["leaf"],
  playable: true,
  rumor: "r-c6",
  reviewStatus: "draft",
};

export const c6Rumors: Rumor[] = [
  {
    id: "r-c6",
    text: "Bacteria near the root multiply, then crash.",
    chapter: "c6",
    hintsAt: ["c6"],
    explainedBy: "d-c6-loop",
  },
];

export const C6_DISCOVERIES: Discovery[] = [
  {
    id: "d-c6-loop",
    statement: "Eating is how nutrients move: grazers release the nitrogen of what they eat.",
    evidenceTier: "derived",
  },
  {
    id: "d-c6-channels",
    statement: "Bacterial and fungal channels run side by side; removing grazers ripples through both.",
    evidenceTier: "derived",
  },
  { id: "d-c6-mouth", statement: "A nematode's mouth tells its meal.", evidenceTier: "interpreted" },
  {
    id: "d-c6-smell",
    statement: "A smell can bring an eater and a spore carrier together.",
    evidenceTier: "reference",
  },
  { id: "d-c6-unnamed", statement: "Most of who lives here has no name yet.", evidenceTier: "reference" },
  {
    id: "d-c6-relative",
    statement: "A share is not a count: relative, not absolute; presence is not activity.",
    evidenceTier: "interpreted",
  },
];
