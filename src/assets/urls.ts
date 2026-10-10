/** Resolved URLs of bundled assets (Vite glob; browser only — tools import manifest.ts instead). */
import { bundledAssets } from "./manifest";

const urls = import.meta.glob("./**/*.{webp,svg,png,mp3}", { eager: true, query: "?url", import: "default" });

export function assetUrl(id: string): string | undefined {
  const a = bundledAssets(__SW_PROFILE__).find((x) => x.id === id);
  return a ? (urls[`./${a.path}`] as string | undefined) : undefined;
}
