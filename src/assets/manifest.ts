/**
 * Every bundled file under src/assets/ (art-direction §7). The content lint fails
 * on a file without an entry; the public profile fails on `publicOk: false`.
 */
import type { Asset } from "../content/schema";

const STIPPLE =
  "Soilytix 2025 organism stipple drawing ([customer]/marketing/assets/2025 *.png), resized to 640 px WebP on 2026-10-06. Lime dot-stipple on transparent ground.";
const BIOME =
  "Soilytix 2025 brand scene element ([customer]/marketing/assets/2025 *.svg), copied unchanged on 2026-10-06.";

export const ASSETS: Asset[] = [
  {
    id: "specimen-bacterium",
    path: "specimens/bacterium.webp",
    source: "img-soilytix-authored",
    licence: "soilytix",
    owner: "Soilytix",
    truthStatus: "decorative",
    publicOk: true,
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
      provenance: BIOME,
    }),
  ),
];
