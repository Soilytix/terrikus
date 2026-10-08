/** Chapter c4 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Discovery, Rumor } from "../../schema";

export const c4: Chapter = {
  id: "c4",
  number: "4",
  title: "Breath and Rust",
  hook: "The flooded field smells of eggs, and the rice is fine.",
  scales: ["field", "profile"],
  world: "rice",
  scenes: ["c4-paddy", "c4-elevator"],
  missions: ["c4-m1", "c4-m2", "c4-m3"],
  entry: "c4-paddy",
  sources: [
    "keiluweit-2017",
    "borch-2010",
    "saunois-2020",
    "tian-2020",
    "ipcc-ar6-wg1-ch7",
    "weil-brady-2017",
    "nrcs-soil-survey-manual",
  ],
  // WB§1: chapters 3–13 open from the map once their rumor is met.
  after: ["c1", "leaf"],
  byRumor: true,
  playable: true,
  recall: [
    { prompt: "When oxygen runs out, what do soil microbes breathe next?", discovery: "d-c4-anaerobic" },
    { prompt: "Draining the paddy changed two gases. Which, and which way?", discovery: "d-c4-tradeoff" },
  ],
  reviewStatus: "draft",
};

export const c4Discoveries: Discovery[] = [
  {
    id: "d-c4-anaerobic",
    statement: "Anaerobic is not dead: it runs on different chemistry.",
    evidenceTier: "derived",
  },
  { id: "d-c4-diary", statement: "Grey and rust are a diary of water.", evidenceTier: "interpreted" },
  {
    id: "d-c4-microsites",
    statement: "Even a drained field has airless pockets inside its larger crumbs.",
    evidenceTier: "derived",
  },
  {
    id: "d-c4-tradeoff",
    statement:
      "Draining the paddy lowered methane and raised nitrous oxide; which matters more depends on what you value and measure.",
    evidenceTier: "interpreted",
  },
];

export const c4Rumors: Rumor[] = [{ id: "r-c4", text: c4.hook, chapter: "c4", hintsAt: ["c4"] }];
