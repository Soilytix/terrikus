/**
 * The valley (landscape scale): the title vista and the map of chapters.
 * Later chapters are glimpsed here with their opening rumor, never their content.
 */
import type { Chapter, Discovery, Scene } from "./schema";

const later = (
  id: Chapter["id"],
  number: string,
  title: string,
  hook: string,
  world: Chapter["world"],
): Chapter => ({
  id,
  number,
  title,
  hook,
  scales: [],
  world,
  scenes: [],
  missions: [],
  entry: "valley",
  sources: ["soils4teachers-basics"],
  after: ["prologue"],
  playable: false,
  reviewStatus: "draft",
});

/** Hooks verbatim from the world-bible chapter map. */
export const LATER_CHAPTERS: Chapter[] = [
  later("c1", "1", "The Pore Labyrinth", "Why is this bacterium starving next to food?", "spinach"),
  later("c3", "3", "Water Roads", "After the dry spell, the soil breathed out a burst.", "spinach"),
  later("c4", "4", "Breath and Rust", "The flooded field smells of eggs, and the rice is fine.", "rice"),
  later("c5", "5", "Charged Surfaces", "The fertiliser stayed exactly where the clay was.", "spinach"),
  later("c6", "6", "Who Eats Whom", "Bacteria near the root multiply, then crash.", "forest"),
  later(
    "c7",
    "7",
    "The Root's Neighbourhood",
    "The soil touching the root is a different country.",
    "spinach",
  ),
  later(
    "c8",
    "8",
    "Partners and Traders",
    "This plant grows without nitrogen fertiliser, and that one typically forms no partnership with root fungi.",
    "pea",
  ),
  later(
    "c9",
    "9",
    "The Nitrogen Relay",
    "Straw was ploughed in and the next crop turned yellow.",
    "sugarbeet",
  ),
  later("c10", "10", "Disease and Defence", "The pathogen is here, but the plants are healthy.", "bean"),
  later("c11", "11", "Pit Walls and Deep Time", "Why are these layers different colours?", "forest"),
  later("c12", "12", "Fields and Seasons", "Same seed, two fields, different harvests.", "spinach"),
  later("c13", "13", "Hillslope and River", "Where does the soil from the hill go?", "rice"),
  later("c14", "14", "What Does the Sample Tell Us?", "Two reports about the same field disagree.", "bare"),
];

export const valleyScene: Scene = {
  id: "valley",
  chapter: "valley",
  title: "The valley",
  scale: "landscape",
  recipe: "valley",
  seed: 7,
  scaleBar: { metres: 500, label: "500 m" },
  description:
    "A river valley at first light. Woodland crowns the hill; below it a patchwork of fields runs down the slope, with a hedge along one edge. At the bottom, a rice paddy shines beside a winding river. Cloud shadows drift across the slope.",
  truth: {
    drawnFrom: ["A generic temperate river valley: woodland, slope fields, paddy and river"],
    schematic: ["Everything is painted mood; no real place"],
    invented: ["The valley, its fields and its weather"],
    notSimulated: ["Erosion", "Water flow", "Seasons"],
  },
  objects: [
    {
      id: "field",
      label: "The spinach field",
      kind: "portal",
      anchor: { x: 0.44, y: 0.62 },
      to: "p-field-dawn",
    },
    {
      id: "hedge",
      label: "The hedge at the field edge",
      kind: "portal",
      anchor: { x: 0.63, y: 0.53 },
      to: "c2-hedge-edge",
      requires: "chapter:leaf",
    },
    {
      id: "woodland",
      label: "Woodland on the hilltop",
      kind: "glimpse",
      anchor: { x: 0.24, y: 0.3 },
      to: "c11",
    },
    { id: "paddy", label: "Rice paddy", kind: "glimpse", anchor: { x: 0.72, y: 0.8 }, to: "c4" },
    { id: "river", label: "The river", kind: "glimpse", anchor: { x: 0.9, y: 0.88 }, to: "c13" },
    { id: "beet", label: "Sugar beet field", kind: "glimpse", anchor: { x: 0.2, y: 0.66 }, to: "c9" },
    { id: "peas", label: "Pea and bean strips", kind: "glimpse", anchor: { x: 0.83, y: 0.58 }, to: "c8" },
  ],
  reviewStatus: "draft",
};

export const DISCOVERIES: Discovery[] = [
  {
    id: "d-p-half-space",
    statement: "Roughly half of soil is space: about 40–60 % of topsoil is solid.",
    evidenceTier: "reference",
  },
  { id: "d-p-scale-100", statement: "One step down the ladder: ×100.", evidenceTier: "observed" },
  { id: "d-p-sleepers", statement: "Most microbes here are dormant.", evidenceTier: "derived" },
  {
    id: "d-c2-conserved",
    statement: "Carbon is never destroyed; I traced it into air, biomass and minerals.",
    evidenceTier: "derived",
  },
  { id: "d-c2-heat", statement: "Energy left as heat and did not come back.", evidenceTier: "derived" },
  {
    id: "d-c2-moisture",
    statement: "Moisture speeds decomposition, up to the point where it shuts out air.",
    evidenceTier: "derived",
  },
  {
    id: "d-c2-quality",
    statement: "What the residue is made of changes how fast it goes.",
    evidenceTier: "derived",
  },
  {
    id: "d-c2-vault",
    statement: "Carbon persists where it is protected, not because it is 'stable stuff'.",
    evidenceTier: "interpreted",
  },
  {
    id: "d-c2-transfer",
    statement: "I predicted a new residue's fate and said what I would measure.",
    evidenceTier: "would-do",
  },
];
