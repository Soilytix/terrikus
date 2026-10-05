/** Resolved URLs of bundled assets (Vite glob; browser only — tools import manifest.ts instead). */
import { ASSETS } from "./manifest";

const urls = import.meta.glob("./**/*.{webp,svg,png}", { eager: true, query: "?url", import: "default" });

export function assetUrl(id: string): string | undefined {
  const a = ASSETS.find((x) => x.id === id);
  return a ? (urls[`./${a.path}`] as string | undefined) : undefined;
}
