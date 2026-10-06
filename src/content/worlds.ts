/** Crop and reference world presets (spec §5.3, world-bible §3). Generic only. */
import type { World } from "./schema";

export const WORLDS: World[] = [
  {
    id: "spinach",
    name: "Spinach",
    teaches: "A typically non-mycorrhizal crop: not every crop has a fungal partner.",
    rootArchitecture: "tap",
    mycorrhizal: "none",
    sources: ["brundrett-tedersoo-2018"],
  },
  {
    id: "pea",
    name: "Pea",
    teaches: "Nodules with a pea-specific rhizobial partner.",
    rootArchitecture: "tap",
    mycorrhizal: "AM",
    partner: "Rhizobium leguminosarum bv. viciae",
    sources: ["oldroyd-2013"],
  },
  {
    id: "bean",
    name: "Bush bean",
    teaches: "A different rhizobial partner from pea: legumes are not interchangeable.",
    rootArchitecture: "tap",
    mycorrhizal: "AM",
    sources: ["oldroyd-2013"],
  },
  {
    id: "sugarbeet",
    name: "Sugar beet",
    teaches: "Non-mycorrhizal; straw C:N and immobilisation.",
    rootArchitecture: "tap",
    mycorrhizal: "none",
    sources: ["nrcs-cn-ratios"],
  },
  {
    id: "rice",
    name: "Rice paddy",
    teaches: "The redox ladder under flooding.",
    rootArchitecture: "fibrous",
    mycorrhizal: "AM",
    sources: ["borch-2010"],
  },
  {
    id: "forest",
    name: "Woodland on the hilltop",
    teaches: "Litter, ectomycorrhiza, and a contested 'wood wide web'.",
    rootArchitecture: "tap",
    mycorrhizal: "ECM",
    sources: ["karst-2023"],
  },
  {
    id: "bare",
    name: "Bare control plot",
    teaches: "Same soil, no plant: the comparison that tests 'the plant did it'.",
    rootArchitecture: "none",
    mycorrhizal: "none",
    sources: ["soils4teachers-basics"],
  },
];
