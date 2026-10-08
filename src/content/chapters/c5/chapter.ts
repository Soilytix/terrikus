/** Chapter c5 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Rumor } from "../../schema";

export const c5: Chapter = {
  id: "c5",
  number: "5",
  title: "Charged Surfaces",
  hook: "The fertiliser stayed exactly where the clay was.",
  scales: ["cell"],
  world: "spinach",
  scenes: ["c5-platelet"],
  missions: ["c5-m1", "c5-m2", "c5-m3"],
  entry: "c5-platelet",
  sources: ["cornell-fs22-cec", "wrb-2022", "lauber-2009", "rousk-2010", "guo-2010", "weil-brady-2017"],
  after: ["c1", "leaf"],
  byRumor: true,
  playable: true,
  recall: [
    { prompt: "Which ions does a clay surface hold, and which wash through?", discovery: "d-c5-leaky" },
    { prompt: "pH tracks the bacterial community closely. Is that cause?", discovery: "d-c5-association" },
  ],
  reviewStatus: "draft",
};

export const c5Rumors: Rumor[] = [{ id: "r-c5", text: c5.hook, chapter: "c5", hintsAt: ["c5"] }];
