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
import { c10Shield, c10Triangle } from "./c10-roots";
import { c11Catena } from "./c11-catena";
import { c11Pit, pitWall } from "./c11-pit";
import { c12TwinFields } from "./c12-twin-fields";
import { c12Wheel } from "./c12-wheel";
import { c13Salt } from "./c13-salt";
import { c13Splash } from "./c13-splash";
import { c13Valley } from "./c13-valley";
import { c14Bench } from "./c14-bench";
import { c6Geosmin } from "./c6-geosmin";
import { c7RootTip } from "./c7-root-tip";
import { c8Arbuscule } from "./c8-arbuscule";
import { c8Nodule } from "./c8-nodule";
import { c9Relay } from "./c9-relay";
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
  "c11-pit": c11Pit,
  "c11-catena": c11Catena,
  // Time-lapse frames of c11-pit (tools/bake-plates.ts TIMELAPSES).
  ...Object.fromEntries([0, 100, 1_000].map((y) => [`c11-form-${y}`, pitWall(y)])),
  "c6-geosmin": c6Geosmin,
  "c7-root-tip": c7RootTip,
  "c8-nodule": c8Nodule,
  "c8-arbuscule": c8Arbuscule,
  "c9-relay": c9Relay,
  "c10-triangle": c10Triangle,
  "c10-shield": c10Shield,
  "c12-twin-fields": c12TwinFields,
  "c12-wheel": c12Wheel,
  "c13-valley": c13Valley,
  "c13-splash": c13Splash,
  "c13-salt": c13Salt,
  "c14-bench": c14Bench,
};
