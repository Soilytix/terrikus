/**
 * Cause-chain cards and chain templates (world-bible §7.2). Shapes carry the
 * kind (condition, actor, process, outcome), never colour alone.
 */
import type { CauseCard, ChainTemplate } from "./schema";

export const CARDS: CauseCard[] = [
  { id: "c-more-water", kind: "condition", label: "More water" },
  { id: "o-air", kind: "outcome", label: "Air in pores" },
  { id: "c-moisture-up", kind: "condition", label: "Moisture ↑ (dry → moist)" },
  { id: "a-microbial-activity", kind: "actor", label: "Microbial activity" },
  { id: "o-leaf-colour", kind: "outcome", label: "Leaf colour" },
  { id: "p-decomposition", kind: "process", label: "Decomposition" },
  { id: "o-co2", kind: "outcome", label: "CO₂ released" },
  { id: "c-waterlogging", kind: "condition", label: "Waterlogging" },
  { id: "c-o2", kind: "condition", label: "O₂ in pores" },
  { id: "c-water-in-pores", kind: "condition", label: "Water in pores" },
  { id: "c-cn-high", kind: "condition", label: "Straw instead of leaf (high C:N)" },
  { id: "a-microbial-growth", kind: "actor", label: "Microbial growth" },
  { id: "c-more-carbon", kind: "condition", label: "More carbon to eat" },
  { id: "p-decomposition-rate", kind: "process", label: "Decomposition rate" },
];

export const card = (id: string) => CARDS.find((c) => c.id === id);

export const CHAINS: ChainTemplate[] = [
  {
    id: "p-water-air",
    title: "Water and air",
    cards: [["c-more-water"], ["o-air"]],
    connectors: [["increases", "decreases"]],
    accepted: [{ cards: ["c-more-water", "o-air"], connectors: ["decreases"] }],
    diagnostics: [],
    evidence: "your water/air slider",
    observed: -1,
  },
  {
    id: "c2-chain-moisture",
    title: "Moisture and decomposition",
    cards: [["c-moisture-up"], ["a-microbial-activity", "o-leaf-colour"], ["p-decomposition"], ["o-co2"]],
    connectors: [
      ["enables", "increases", "limits", "decreases"],
      ["increases", "decreases"],
      ["increases", "decreases"],
    ],
    accepted: [
      {
        cards: ["c-moisture-up", "a-microbial-activity", "p-decomposition", "o-co2"],
        connectors: ["enables", "increases", "increases"],
      },
      {
        cards: ["c-moisture-up", "a-microbial-activity", "p-decomposition", "o-co2"],
        connectors: ["increases", "increases", "increases"],
      },
    ],
    diagnostics: [
      {
        when: [{ connector: [0, "limits"] }],
        message: "Your dry-versus-moist run went the other way: the moist jar lost mass faster.",
        misconception: "M4",
      },
      {
        when: [{ card: [1, "o-leaf-colour"] }],
        message: "Colour changes as a leaf decays, but it does not do the decaying. Who does the work?",
        misconception: "M1",
      },
    ],
    evidence: "dry vs moist",
    observed: 1,
  },
  {
    id: "c2-chain-waterlogged",
    title: "Waterlogging",
    cards: [["c-waterlogging"], ["c-o2", "c-water-in-pores"], ["a-microbial-activity"], ["p-decomposition"]],
    connectors: [
      ["limits", "increases", "enables"],
      ["limits", "enables", "increases"],
      ["decreases", "increases"],
    ],
    accepted: [
      {
        cards: ["c-waterlogging", "c-o2", "a-microbial-activity", "p-decomposition"],
        connectors: ["limits", "enables", "increases"],
      },
      {
        cards: ["c-waterlogging", "c-o2", "a-microbial-activity", "p-decomposition"],
        connectors: ["limits", "increases", "increases"],
      },
    ],
    diagnostics: [
      {
        when: [{ card: [1, "c-water-in-pores"] }],
        message: "Your run shows waterlogged jars still have plenty of water. What is missing in them?",
        misconception: "M4",
      },
      {
        when: [{ connector: [1, "limits"] }],
        message:
          "If oxygen held microbes back, losing it would speed decay up. Look at the litter curve of jar B.",
        misconception: "M4",
      },
      {
        when: [{ connector: [2, "decreases"] }],
        message:
          "Read each link on its own: when microbes are more active, does a leaf decay faster or slower?",
        misconception: "M4",
      },
    ],
    evidence: "moist vs waterlogged",
    observed: -1,
  },
  {
    id: "c2-chain-quality",
    title: "Residue quality",
    cards: [["c-cn-high", "c-more-carbon"], ["a-microbial-growth"], ["p-decomposition-rate"]],
    connectors: [
      ["limits", "increases", "enables"],
      ["decreases", "increases"],
    ],
    accepted: [
      {
        cards: ["c-cn-high", "a-microbial-growth", "p-decomposition-rate"],
        connectors: ["limits", "increases"],
      },
    ],
    diagnostics: [
      {
        when: [{ card: [0, "c-more-carbon"] }],
        message:
          "Point at the graph: the straw jar started with the same carbon and lost it more slowly. What do microbes need besides carbon?",
        misconception: "M15",
      },
      {
        when: [{ connector: [0, "increases"] }],
        message:
          "Same mass, slower loss in your run. Something about straw held the decomposers back. What do microbes need besides carbon?",
        misconception: "M15",
      },
      {
        when: [{ connector: [1, "decreases"] }],
        message: "Read each link on its own: when microbes grow more, does a residue decay faster or slower?",
        misconception: "M15",
      },
    ],
    evidence: "leaf vs straw",
    observed: -1,
    untested:
      "Your run shows straw losing mass more slowly than leaf. Why (too little nitrogen for microbes to grow) is an interpretation: this teaching model has no nitrogen yet, so the run cannot test it.",
  },
];

export const chainTemplate = (id: string) => CHAINS.find((c) => c.id === id);
