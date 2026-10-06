/**
 * Build profiles (spec §9). `public` ships only approved content and publicOk
 * assets; `internal` ships everything and badges what is not approved.
 */
import { CHAPTERS, CODEX, MISSIONS, ORGANISMS, PROCESSES, MATERIALS, SCENES } from "../src/content";
import { bundledAssets } from "../src/assets/manifest";

export type Profile = "internal" | "public";

interface Node {
  id: string;
  reviewStatus: string;
}
interface AssetLike {
  id: string;
  publicOk: boolean;
}

export function profileViolations(profile: Profile, nodes: Node[], assets: AssetLike[]): string[] {
  if (profile === "internal") return [];
  return [
    ...nodes
      .filter((n) => n.reviewStatus !== "approved")
      .map((n) => `${n.id}: ${n.reviewStatus}, not approved`),
    ...assets.filter((a) => !a.publicOk).map((a) => `${a.id}: asset not publicOk`),
  ];
}

export const allNodes = (): Node[] => [
  ...CHAPTERS.filter((c) => c.playable),
  ...SCENES,
  ...MISSIONS,
  ...CODEX,
  ...ORGANISMS,
  ...PROCESSES,
  ...MATERIALS,
];

if (process.argv[1]?.endsWith("profile.ts")) {
  const profile: Profile = process.env.SW_PROFILE === "public" ? "public" : "internal";
  const assets = bundledAssets(profile);
  const v = profileViolations(profile, allNodes(), assets);
  if (v.length > 0) {
    console.error(
      `FAIL profile "${profile}": ${v.length} node(s) not shippable\n  ${v.slice(0, 20).join("\n  ")}`,
    );
    process.exit(1);
  }
  console.log(`ok   profile "${profile}": ${allNodes().length} nodes, ${assets.length} assets`);
}
