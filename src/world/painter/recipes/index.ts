import type { Ctx } from "../brush";
import type { Plate } from "../types";
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
};
