/**
 * Sprite data for the world-bible §4 cast (backlog T12): one in-house SVG per
 * organism in this folder, its true size, its group badge and the public page
 * its morphology was checked against. Badge text and size text are the world
 * bible's words, verbatim; `size` is their reading in metres, null where the
 * bible gives no number.
 */
import type { TruthTag } from "../../content/schema";

/** Art-direction §6.2: shape plus text, never colour alone. */
export type BadgeShape = "circle" | "triangle" | "diamond" | "hexagon" | "square" | "star";

export const BADGE_SHAPE: Record<string, BadgeShape> = {
  decomposer: "circle",
  grazer: "triangle",
  transformer: "diamond",
  mutualist: "hexagon",
  pathogen: "square",
  engineer: "star",
};

export const BADGE_SHAPES = Object.values(BADGE_SHAPE);

export interface CastSprite {
  /** World-bible §4 id; the sprite is `organisms/<id>.svg`. */
  id: string;
  /** World-bible "Group badge" cell. */
  badge: string;
  /** World-bible "Size (true)" cell. */
  sizeText: string;
  /** [min, max] in metres; min null for an upper bound only. */
  size: readonly [number | null, number] | null;
  truth: TruthTag;
  referenceUrl: string;
}

/**
 * The shape for a badge text: the first group word art-direction §6.2 gives a
 * shape. Undefined for groups it does not (shredder, predator, producer, virus,
 * antagonist, chemist): those show text only until a shape is decided.
 */
export function badgeShape(badge: string): BadgeShape | undefined {
  for (const word of badge.split(/[^a-z]+/)) if (BADGE_SHAPE[word]) return BADGE_SHAPE[word];
  return undefined;
}

const WP = "https://en.wikipedia.org/wiki/";
const µm = 1e-6;
const mm = 1e-3;
const cm = 1e-2;

export const CAST: CastSprite[] = [
  { id: "phage", badge: "virus", sizeText: "50–200 nm", size: [50e-9, 200e-9], truth: "schematic", referenceUrl: `${WP}Bacteriophage` },
  { id: "bacteria-copio", badge: "decomposer", sizeText: "0.5–2 µm", size: [0.5 * µm, 2 * µm], truth: "schematic", referenceUrl: `${WP}Copiotroph` },
  { id: "bacteria-dormant", badge: "decomposer", sizeText: "0.5–2 µm", size: [0.5 * µm, 2 * µm], truth: "schematic", referenceUrl: `${WP}Dormancy` },
  { id: "streptomyces", badge: "decomposer / chemist", sizeText: "hyphae ~1 µm", size: [1 * µm, 1 * µm], truth: "schematic", referenceUrl: `${WP}Streptomyces` },
  { id: "nitrifier-aob", badge: "transformer", sizeText: "~1 µm", size: [1 * µm, 1 * µm], truth: "schematic", referenceUrl: `${WP}Nitrosomonas` },
  { id: "nitrifier-aoa", badge: "transformer", sizeText: "<1 µm", size: [null, 1 * µm], truth: "schematic", referenceUrl: `${WP}Nitrososphaera` },
  { id: "comammox", badge: "transformer", sizeText: "~1 µm", size: [1 * µm, 1 * µm], truth: "schematic", referenceUrl: `${WP}Comammox` },
  { id: "denitrifier", badge: "transformer", sizeText: "~1 µm", size: [1 * µm, 1 * µm], truth: "schematic", referenceUrl: `${WP}Denitrifying_bacteria` },
  { id: "methanogen", badge: "transformer", sizeText: "~1 µm", size: [1 * µm, 1 * µm], truth: "schematic", referenceUrl: `${WP}Methanogen` },
  { id: "rhizobia", badge: "mutualist", sizeText: "~1–2 µm; bacteroids inside nodules", size: [1 * µm, 2 * µm], truth: "schematic", referenceUrl: `${WP}Rhizobia` },
  { id: "pseudomonas-protector", badge: "antagonist (context)", sizeText: "~1 µm", size: [1 * µm, 1 * µm], truth: "schematic", referenceUrl: `${WP}Pseudomonas_fluorescens` },
  { id: "bacillus", badge: "antagonist / chemist (context)", sizeText: "1–3 µm; spores", size: [1 * µm, 3 * µm], truth: "schematic", referenceUrl: `${WP}Bacillus_subtilis` },
  { id: "fungi-sap", badge: "decomposer", sizeText: "hyphae 2–10 µm", size: [2 * µm, 10 * µm], truth: "schematic", referenceUrl: `${WP}Saprotrophic_nutrition` },
  { id: "amf", badge: "mutualist (context)", sizeText: "hyphae 2–10 µm", size: [2 * µm, 10 * µm], truth: "schematic", referenceUrl: `${WP}Arbuscular_mycorrhiza` },
  { id: "ecm", badge: "mutualist (context)", sizeText: "sheath + Hartig net", size: null, truth: "schematic", referenceUrl: `${WP}Ectomycorrhiza` },
  { id: "fungi-path", badge: "pathogen (context)", sizeText: "hyphae", size: null, truth: "schematic", referenceUrl: `${WP}Fusarium` },
  { id: "oomycete", badge: "pathogen (context)", sizeText: "hyphae-like; oospores", size: null, truth: "schematic", referenceUrl: `${WP}Pythium` },
  { id: "amoeba", badge: "grazer", sizeText: "10–50 µm", size: [10 * µm, 50 * µm], truth: "schematic", referenceUrl: `${WP}Amoeba` },
  { id: "flagellate", badge: "grazer", sizeText: "2–20 µm", size: [2 * µm, 20 * µm], truth: "schematic", referenceUrl: `${WP}Flagellate` },
  { id: "ciliate", badge: "grazer", sizeText: "20–200 µm", size: [20 * µm, 200 * µm], truth: "schematic", referenceUrl: `${WP}Ciliate` },
  { id: "testate", badge: "grazer", sizeText: "20–200 µm, shell", size: [20 * µm, 200 * µm], truth: "schematic", referenceUrl: `${WP}Testate_amoebae` },
  { id: "nematode-bact", badge: "grazer", sizeText: "0.3–1 mm", size: [0.3 * mm, 1 * mm], truth: "schematic", referenceUrl: `${WP}Caenorhabditis_elegans` },
  { id: "nematode-fung", badge: "grazer", sizeText: "0.3–1 mm", size: [0.3 * mm, 1 * mm], truth: "schematic", referenceUrl: `${WP}Aphelenchoides` },
  { id: "nematode-pred", badge: "predator", sizeText: "~1–2 mm", size: [1 * mm, 2 * mm], truth: "schematic", referenceUrl: `${WP}Mononchida` },
  { id: "nematode-plant", badge: "pathogen (context)", sizeText: "0.3–1 mm", size: [0.3 * mm, 1 * mm], truth: "schematic", referenceUrl: `${WP}Root-knot_nematode` },
  { id: "mite", badge: "shredder / predator", sizeText: "0.1–2 mm", size: [0.1 * mm, 2 * mm], truth: "schematic", referenceUrl: `${WP}Oribatida` },
  { id: "springtail", badge: "grazer", sizeText: "0.2–2 mm", size: [0.2 * mm, 2 * mm], truth: "schematic", referenceUrl: `${WP}Springtail` },
  { id: "enchytraeid", badge: "shredder", sizeText: "1–50 mm", size: [1 * mm, 50 * mm], truth: "schematic", referenceUrl: `${WP}Enchytraeidae` },
  { id: "earthworm-epi", badge: "shredder", sizeText: "2–10 cm", size: [2 * cm, 10 * cm], truth: "schematic", referenceUrl: `${WP}Eisenia_fetida` },
  { id: "earthworm-endo", badge: "engineer", sizeText: "5–15 cm", size: [5 * cm, 15 * cm], truth: "schematic", referenceUrl: `${WP}Aporrectodea_caliginosa` },
  { id: "earthworm-anecic", badge: "engineer", sizeText: "10–30 cm", size: [10 * cm, 30 * cm], truth: "schematic", referenceUrl: `${WP}Lumbricus_terrestris` },
  { id: "ant", badge: "engineer", sizeText: "mm", size: null, truth: "schematic", referenceUrl: `${WP}Ant` },
  { id: "mole", badge: "predator", sizeText: "15 cm", size: [15 * cm, 15 * cm], truth: "decorative", referenceUrl: `${WP}European_mole` },
  { id: "root-tap", badge: "producer", sizeText: "mm–cm", size: null, truth: "schematic", referenceUrl: `${WP}Taproot` },
  { id: "root-fibrous", badge: "producer", sizeText: "0.1–1 mm", size: [0.1 * mm, 1 * mm], truth: "schematic", referenceUrl: `${WP}Fibrous_root_system` },
  { id: "root-legume", badge: "producer + host", sizeText: "mm", size: null, truth: "schematic", referenceUrl: `${WP}Root_nodule` },
];
