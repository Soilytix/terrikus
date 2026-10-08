/** Chapter c1 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Rumor } from "../../schema";

export const c1: Chapter = {
  id: "c1",
  number: "1",
  title: "The Pore Labyrinth",
  hook: "Why is this bacterium starving next to food?",
  scales: ["aggregate"],
  world: "spinach",
  scenes: ["c1-grain-ruler", "c1-aggregate-cut", "c1-labyrinth"],
  missions: ["c1-m1", "c1-m2", "c1-m3", "c1-m4"],
  entry: "c1-grain-ruler",
  sources: [
    "nrcs-soil-survey-manual",
    "tisdall-oades-1982",
    "six-2004",
    "hartmann-six-2022",
    "erktan-2020",
    "postma-vanveen-1990",
    "cornell-fs22-cec",
    "thien-1979",
    "cornell-cash-manual",
    "or-2007",
    "weil-brady-2017",
  ],
  after: ["prologue"],
  playable: true,
  recall: [
    { prompt: "What is the difference between texture and structure?", discovery: "d-c1-texture" },
    { prompt: "What did small pores give the bacteria?", discovery: "d-c1-refuge" },
  ],
  reviewStatus: "draft",
};

export const c1Rumors: Rumor[] = [{ id: "r-c1", text: c1.hook, chapter: "c1", hintsAt: ["c1"] }];
