/** Misconception bank M1–M25, verbatim from docs/research/curriculum.md Appendix B. */
import type { Misconception } from "./schema";

export const MISCONCEPTIONS: Misconception[] = [
  {
    id: "M1",
    misconception: "Soil is inert dirt",
    correctIdea: "A habitat holding perhaps ~59 % of species",
  },
  {
    id: "M2",
    misconception: "Topsoil regenerates quickly",
    correctIdea: "Centuries per few cm; plough erosion is 10–100× faster",
  },
  {
    id: "M3",
    misconception: "Texture can be fixed by management",
    correctIdea: "Texture is near-permanent; structure is manageable",
  },
  { id: "M4", misconception: "Wet is good", correctIdea: "Water and oxygen trade off" },
  { id: "M5", misconception: "Anaerobic means dead", correctIdea: "Different metabolism (redox ladder)" },
  { id: "M6", misconception: "pH 7 is ideal for all", correctIdea: "Crop- and soil-specific optima" },
  {
    id: "M7",
    misconception: "Humus is a stable special substance",
    correctIdea: "Continuum; POM/MAOM; mineral protection",
  },
  { id: "M8", misconception: "Microbes are germs / good vs bad", correctIdea: "Context-dependent roles" },
  { id: "M9", misconception: "Everything is active", correctIdea: "Mostly dormant; ~0.1–2 % active" },
  {
    id: "M10",
    misconception: "Fungi = mushrooms",
    correctIdea: "Hyphal networks; mushrooms are fruiting bodies",
  },
  { id: "M11", misconception: "Oomycetes are fungi", correctIdea: "Oomycetes are protists (stramenopiles)" },
  { id: "M12", misconception: "Earthworms are always good", correctIdea: "Invasive in some forests" },
  {
    id: "M13",
    misconception: "Trees talk through the wood wide web",
    correctIdea: "Largely unsupported in popular form",
  },
  { id: "M14", misconception: "All crops are mycorrhizal", correctIdea: "Spinach and sugar beet are not" },
  {
    id: "M15",
    misconception: "Adding carbon always stores carbon",
    correctIdea: "Respiration, priming, saturation",
  },
  { id: "M16", misconception: "Total N = available N", correctIdea: "Tiny available pool; immobilisation" },
  {
    id: "M17",
    misconception: "Legumes fertilise the next crop by default",
    correctIdea: "Much N leaves with seed",
  },
  { id: "M18", misconception: "P leaches like nitrate", correctIdea: "P moves with eroded particles" },
  { id: "M19", misconception: "Pathogen detected = disease", correctIdea: "Triangle; detection is a lead" },
  { id: "M20", misconception: "Antibiotics evolved only to kill", correctIdea: "Possible signalling roles" },
  { id: "M21", misconception: "No-till sequesters lots of carbon", correctIdea: "Often redistribution" },
  {
    id: "M22",
    misconception: "A soil health score tells you what to do",
    correctIdea: "Indicators describe, not prescribe",
  },
  { id: "M23", misconception: "DNA = alive and active", correctIdea: "Relic DNA; dormancy" },
  { id: "M24", misconception: "Relative abundance up = organism grew", correctIdea: "Compositionality" },
  {
    id: "M25",
    misconception: "Correlation in microbiome data = cause",
    correctIdea: "Needs mechanism and replication",
  },

  // M26+ added by the Build-phase chapters (world-bible §8.1).
  {
    id: "M26",
    misconception: "Decomposed matter disappears",
    correctIdea: "Matter is conserved: it leaves as CO₂, becomes biomass, or stays on minerals",
  },
  {
    id: "M27",
    misconception: "Energy is recycled like matter",
    correctIdea: "Energy flows one way and ends as heat",
  },
  {
    id: "M28",
    misconception: "45/5/25/25 is a constant",
    correctIdea: "An idealised moist loam; real soils range widely",
  },
];
