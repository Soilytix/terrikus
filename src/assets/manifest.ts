/**
 * Every bundled file under src/assets/ (art-direction §7). The content lint fails
 * on a file without an entry; the public profile fails on `publicOk: false`.
 * CC BY-SA files live in cc-by-sa/ and nowhere else.
 */
import type { Asset } from "../content/schema";

const STIPPLE =
  "Soilytix 2025 organism stipple drawing (team vault, marketing assets, 2025 *.png), resized to 640 px WebP on 2026-10-06. Lime dot-stipple on transparent ground.";
const BIOME =
  "Soilytix 2025 brand scene element (team vault, marketing assets, 2025 *.svg), copied unchanged on 2026-10-06.";

export const ASSETS: Asset[] = [
  {
    id: "specimen-bacterium",
    path: "specimens/bacterium.webp",
    source: "img-soilytix-authored",
    licence: "soilytix",
    owner: "Soilytix",
    truthStatus: "decorative",
    publicOk: true,
    attribution: "Stipple drawing © Soilytix",
    provenance: STIPPLE,
  },
  {
    id: "specimen-protozoan",
    path: "specimens/protozoan.webp",
    source: "img-soilytix-authored",
    licence: "soilytix",
    owner: "Soilytix",
    truthStatus: "decorative",
    publicOk: true,
    attribution: "Stipple drawing © Soilytix",
    provenance: STIPPLE,
  },
  {
    id: "specimen-springtail",
    path: "specimens/springtail.webp",
    source: "img-soilytix-authored",
    licence: "soilytix",
    owner: "Soilytix",
    truthStatus: "decorative",
    publicOk: true,
    attribution: "Stipple drawing © Soilytix",
    provenance: STIPPLE,
  },
  {
    id: "specimen-mite",
    path: "specimens/mite.webp",
    source: "img-soilytix-authored",
    licence: "soilytix",
    owner: "Soilytix",
    truthStatus: "decorative",
    publicOk: true,
    attribution: "Stipple drawing © Soilytix",
    provenance: STIPPLE,
  },
  {
    id: "specimen-earthworm",
    path: "specimens/earthworm.webp",
    source: "img-soilytix-authored",
    licence: "soilytix",
    owner: "Soilytix",
    truthStatus: "decorative",
    publicOk: true,
    attribution: "Stipple drawing © Soilytix",
    provenance: STIPPLE,
  },
  ...(["agri", "croprot", "forest", "plant", "rhizosphere", "wetland"] as const).map(
    (b): Asset => ({
      id: `biome-${b}`,
      path: `biomes/${b}.svg`,
      source: "img-soilytix-authored",
      licence: "soilytix",
      owner: "Soilytix",
      truthStatus: "decorative",
      publicOk: true,
      attribution: "Scene element © Soilytix",
      provenance: BIOME,
    }),
  ),
];

/**
 * Designer infographics (designer-infographics/): `internal` profile only until
 * the contract terms are confirmed (spec OD-6). Every entry is `publicOk: false`
 * and never reaches a public bundle.
 */
export const INTERNAL_ASSETS: Asset[] = [];

/** What a profile bundles, and so what the credits list. */
export const bundledAssets = (profile: "internal" | "public"): Asset[] =>
  profile === "public" ? ASSETS : [...ASSETS, ...INTERNAL_ASSETS];
