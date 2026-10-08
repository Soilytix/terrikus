/** Chapter 4 cast additions, loaded with the shell for the field cards. */
import type { Organism } from "../../schema";
import { F } from "./facts";

/** The cast cards chapter 4 brings; `organisms.ts` lists them with the rest. */
export const c4Organisms: Organism[] = [
  {
    id: "methanogen",
    name: "Methane-making archaea",
    role: "Make methane from carbon dioxide and acetate where every richer acceptor is spent.",
    group: "transformer",
    sizeRange: [0.5e-6, 2e-6],
    scales: ["profile", "aggregate"],
    eats: ["hydrogen and carbon dioxide", "acetate left by fermenting microbes"],
    eatenBy: [],
    transforms: ["carbon dioxide and acetate → methane"],
    needs: ["no oxygen at all", "no nitrate, iron or sulfate left to outcompete them"],
    howWeKnow: ["process", "dna", "culture"],
    facts: [F.ladder, F.methane],
    truthTag: "schematic",
    misconceptions: ["M5"],
    reviewStatus: "draft",
  },
  {
    id: "denitrifier",
    name: "Denitrifying bacteria",
    role: "Breathe nitrate when oxygen runs short, and release nitrogen as N₂ gas and some N₂O.",
    group: "transformer",
    sizeRange: [0.5e-6, 3e-6],
    scales: ["profile", "aggregate"],
    eats: ["dissolved organic carbon"],
    eatenBy: ["amoebae", "flagellates"],
    transforms: ["nitrate → N₂ and N₂O"],
    needs: ["little or no oxygen", "nitrate", "food carbon"],
    howWeKnow: ["process", "culture", "dna"],
    facts: [F.ladder, F.n2o],
    truthTag: "schematic",
    misconceptions: ["M5"],
    reviewStatus: "draft",
  },
];
