/**
 * Organism atlas (backlog T12). Every organism sprite and group badge is a frame
 * of one texture source, so Pixi batches a scene layer of organisms into a
 * single draw call. Sheet and frame table come from tools/atlas.ts.
 */
import { ImageSource, Rectangle, Texture, type TextureSource } from "pixi.js";
import { assetUrl } from "../assets/urls";
import { ATLAS, type AtlasFrameId } from "./atlas-frames";

/** WebGL 2 guarantees textures of at least 2048 px a side. */
export const MAX_TEXTURE_PX = 2048;
/** Raster scale of the sheet: as sharp as fits one guaranteed texture. */
export const ATLAS_RESOLUTION = Math.floor(MAX_TEXTURE_PX / Math.max(ATLAS.w, ATLAS.h));

export type AtlasTextures = Record<AtlasFrameId, Texture>;

/** One texture per frame, all on `source`. */
export function sliceAtlas(source: TextureSource): AtlasTextures {
  const out = {} as AtlasTextures;
  for (const [id, f] of Object.entries(ATLAS.frames) as [AtlasFrameId, (typeof ATLAS.frames)[AtlasFrameId]][])
    out[id] = new Texture({ source, frame: new Rectangle(f.x, f.y, f.w, f.h) });
  return out;
}

/** Rasterise the sheet once, then slice it. Frames stay in sheet units at any resolution. */
export async function loadOrganismAtlas(resolution = ATLAS_RESOLUTION): Promise<AtlasTextures> {
  const url = assetUrl("organism-atlas");
  if (!url) throw new Error("organism atlas is not in this bundle");
  const img = new Image();
  img.src = url;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS.w * resolution;
  canvas.height = ATLAS.h * resolution;
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
  return sliceAtlas(new ImageSource({ resource: canvas, resolution }));
}
