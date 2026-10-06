import type { Ctx } from "../brush";
import type { Plate } from "../types";
import { c1AggregateCut } from "./c1-aggregate-cut";
import { c1GrainRuler } from "./c1-grain-ruler";
import { c1Labyrinth } from "./c1-labyrinth";
import { fieldDawn } from "./field-dawn";
import { handful } from "./handful";
import { hedgeEdge } from "./hedge-edge";
import { litter } from "./litter";
import { pore, poreLeaf } from "./pores";
import { valley } from "./valley";

export type RecipeOut = Omit<Plate, "recipe" | "seed" | "w" | "h">;
export type Recipe = (c: Ctx, scale: number) => RecipeOut;

export const RECIPES: Record<string, Recipe> = {
  valley,
  "field-dawn": fieldDawn,
  handful,
  pore,
  "pore-leaf": poreLeaf,
  "hedge-edge": hedgeEdge,
  litter,
  "c1-grain-ruler": c1GrainRuler,
  "c1-aggregate-cut": c1AggregateCut,
  "c1-labyrinth": c1Labyrinth,
};
