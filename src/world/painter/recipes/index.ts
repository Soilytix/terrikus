import type { Ctx } from "../brush";
import type { Plate } from "../types";
import { c1AggregateCut } from "./c1-aggregate-cut";
import { c1GrainRuler } from "./c1-grain-ruler";
import { c1Labyrinth } from "./c1-labyrinth";
import { c3Drain } from "./c3-drain";
import { c3RainProfile } from "./c3-rain-profile";
import { c4Elevator } from "./c4-elevator";
import { c4Paddy } from "./c4-paddy";
import { c5Platelet } from "./c5-platelet";
import { fieldDawn } from "./field-dawn";
import { handful } from "./handful";
import { hedgeEdge } from "./hedge-edge";
import { litter } from "./litter";
import { pore, poreLeaf } from "./pores";
import { valley } from "./valley";
import { valleyMap } from "./valley-map";

export type RecipeOut = Omit<Plate, "recipe" | "seed" | "w" | "h">;
export type Recipe = (c: Ctx, scale: number) => RecipeOut;

export const RECIPES: Record<string, Recipe> = {
  valley,
  "valley-map": valleyMap,
  "field-dawn": fieldDawn,
  handful,
  pore,
  "pore-leaf": poreLeaf,
  "hedge-edge": hedgeEdge,
  litter,
  "c1-grain-ruler": c1GrainRuler,
  "c1-aggregate-cut": c1AggregateCut,
  "c1-labyrinth": c1Labyrinth,
  "c3-drain": c3Drain,
  "c3-rain-profile": c3RainProfile,
  "c4-paddy": c4Paddy,
  "c4-elevator": c4Elevator,
  "c5-platelet": c5Platelet,
};
