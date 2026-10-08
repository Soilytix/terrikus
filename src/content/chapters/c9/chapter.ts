/** Chapter c9 metadata: loaded with the shell (unlock, progress, notebook). */
import type { Chapter, Discovery, Rumor } from "../../schema";

export const c9: Chapter = {
  id: "c9",
  number: "9",
  title: "The Nitrogen Relay",
  hook: "Straw was ploughed in and the next crop turned yellow.",
  scales: ["rhizosphere"],
  world: "sugarbeet",
  scenes: ["c9-relay"],
  missions: ["c9-m1", "c9-m2", "c9-m3", "c9-m4"],
  entry: "c9-relay",
  sources: [
    "nrcs-cn-ratios",
    "umn-n-cycle-2025",
    "schimel-bennett-2004",
    "leininger-2006",
    "daims-2015",
    "van-kessel-2015",
    "tian-2020",
    "fowler-2013",
    "lassaletta-2014",
    "ipcc-ar6-wg1-ch7",
  ],
  // WB§1: chapters 3–13 open from the map once their rumor has been met.
  after: ["c1", "leaf"],
  byRumor: true,
  playable: true,
  rumor: "r-c9",
  reviewStatus: "draft",
};

export const c9Rumors: Rumor[] = [
  {
    id: "r-c9",
    text: "Straw was ploughed in and the next crop turned yellow.",
    chapter: "c9",
    hintsAt: ["c9"],
    explainedBy: "d-c9-borrow",
  },
];

export const C9_DISCOVERIES: Discovery[] = [
  {
    id: "d-c9-total",
    statement:
      "Total is not available: most of the field's nitrogen is organic. N was 100.0 % accounted for.",
    evidenceTier: "derived",
  },
  {
    id: "d-c9-borrow",
    statement: "Microbes borrow nitrogen from the soil when they eat straw, and give it back later.",
    evidenceTier: "derived",
  },
  {
    id: "d-c9-leaks",
    statement:
      "Nitrogen leaks three ways: to the drain, as gas from wet soil and as ammonia from the surface.",
    evidenceTier: "derived",
  },
  {
    id: "d-c9-gene",
    statement: "A gene count is a potential, not a rate.",
    evidenceTier: "interpreted",
  },
];
