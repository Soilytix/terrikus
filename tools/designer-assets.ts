/**
 * Brings Soilytix designer illustrations into the game. The team vault keeps
 * them on its 16 design tokens (assets/soilytix/, restyled by the vault's
 * .bin/restyle-assets.py); here each token is mapped onto the world register,
 * so Lime never reaches a plate and organisms keep their Obsidian outline.
 *
 *   mise exec -- pnpm exec tsx tools/designer-assets.ts <vault>/assets/soilytix
 *
 * writes src/assets/props/*.svg and the swapped src/assets/organisms/*.svg, then
 * regenerates src/world/painter/props.gen.ts (the props as strings the isomorphic
 * painter can embed). Without an argument it only regenerates; run tools/atlas.ts
 * after an organism changes.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { format, resolveConfig } from "prettier";
import { W } from "../src/styles/scene";
import { UI } from "../src/styles/ui";

const PROPS_DIR = "src/assets/props";
const ORG_DIR = "src/assets/organisms";
const PROPS_TS = "src/world/painter/props.gen.ts";

/** Vault token hexes (DESIGN.md base palette) the designer files use. */
const T = {
  lime: "#8ede3d",
  green: "#779e29",
  lightGreen: "#edfcde",
  gold: "#b48240",
  lightGold: "#f4ece2",
  slate: "#3e4742",
  grey: "#a5a9a7",
  white: "#ffffff",
  ink: "#29332e",
} as const;

/** Token hex to world hex; a `fill#hex` key overrides the plain one for fills only. */
type Map = Partial<Record<string, string>>;

/** Scenery: muted foliage for Lime, earth for gold, stone for the darks. */
const SCENERY: Map = {
  [T.lime]: W.foliage,
  [T.green]: W.gley,
  [T.lightGreen]: W.pale,
  [T.gold]: W.subsoil,
  [T.lightGold]: W.pale,
  [T.slate]: W.stone2,
  [T.grey]: W.stone1,
  [T.white]: W.pale,
  [T.ink]: UI.ink,
};

/** Organisms (art-direction §6.2): Lime line work becomes the Obsidian outline, white the body fill. */
const organism = (body: string, extra: Map = {}): Map => ({
  [T.lime]: UI.ink,
  [T.white]: body,
  [T.gold]: W.subsoil,
  ...extra,
});

interface Item {
  src: string;
  out: string;
  title: string;
  map: Map;
}

const PROPS: Item[] = [
  { src: "landscape/house.svg", out: "farmhouse", title: "Farmhouse", map: SCENERY },
  { src: "landscape/cultural-village.svg", out: "village", title: "Village", map: SCENERY },
  { src: "plants/tree-small-rounded.svg", out: "tree-rounded", title: "Rounded tree", map: SCENERY },
  { src: "plants/broadleaf-rounded.svg", out: "tree-broadleaf", title: "Broadleaf tree", map: SCENERY },
  { src: "plants/conifer-tall.svg", out: "conifer", title: "Conifer", map: SCENERY },
  { src: "animals/cow-standing.svg", out: "cow", title: "Cow", map: SCENERY },
  {
    src: "farming/tractor-icon.svg",
    out: "tractor",
    title: "Tractor",
    map: { ...SCENERY, [T.green]: W.oxide, [T.lime]: W.sand },
  },
].map((p) => ({ ...p, out: `${PROPS_DIR}/${p.out}.svg` }));

/** Cast sprites replaced by the designer's drawing; the fill keeps each one's old body colour. */
const ORGANISMS: Item[] = [
  { src: "microbes/amoeba-icon.svg", out: "amoeba", title: "Naked amoeba", map: organism(W.pale) },
  { src: "microbes/ciliate-icon.svg", out: "ciliate", title: "Ciliate", map: organism(W.film) },
  { src: "microbes/flagellate-icon.svg", out: "flagellate", title: "Flagellate", map: organism(W.film) },
  { src: "microbes/amoeba-testate-icon.svg", out: "testate", title: "Testate amoeba", map: organism(W.sand) },
  {
    src: "microbes/actinomycete-icon.svg",
    out: "streptomyces",
    title: "Streptomyces",
    map: organism(W.pale),
  },
  {
    src: "soil-fauna/mite-icon.svg",
    out: "mite",
    title: "Mite",
    map: organism(W.pale, { [`fill${T.lime}`]: W.loam }),
  },
  { src: "soil-fauna/springtail-icon.svg", out: "springtail", title: "Springtail", map: organism(W.pale) },
  { src: "soil-fauna/enchytraeid-icon.svg", out: "enchytraeid", title: "Enchytraeid", map: organism(W.pale) },
].map((o) => ({ ...o, out: `${ORG_DIR}/${o.out}.svg` }));

const HEX = /#[0-9a-fA-F]{6}\b/g;

/** Recolour by the map, and move a non-zero viewBox origin into a translate so the box is `0 0 w h`. */
function restyle(svg: string, it: Item): string {
  const head = svg.match(/<svg[^>]*viewBox="([-\d. ]+)"[^>]*>/);
  if (!head) throw new Error(`${it.src}: no viewBox`);
  const [x, y, w, h] = head[1]!.trim().split(/\s+/).map(Number) as [number, number, number, number];
  const inner = svg
    .slice(head.index! + head[0].length)
    .replace(/<\/svg>\s*$/, "")
    .replace(/(fill|stroke)="(#[0-9a-fA-F]{6})"/g, (_, attr: string, c: string) => {
      const to = it.map[`${attr}${c.toLowerCase()}`] ?? it.map[c.toLowerCase()];
      if (!to) throw new Error(`${it.src}: no mapping for ${c}`);
      return `${attr}="${to}"`;
    })
    .trim();
  const shift = x || y ? ` transform="translate(${-x} ${-y})"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n` +
    `<title>${it.title}</title>\n<g fill="none"${shift}>\n${inner}\n</g>\n</svg>\n`
  );
}

/** Each world hex back to its token name, so the generated module holds no raw hex. */
const NAME = new Map<string, string>([
  ...Object.entries(W).map(([k, v]) => [v, `W.${k}`] as [string, string]),
  [UI.ink, "UI.ink"],
]);

async function genProps() {
  const entries = readdirSync(PROPS_DIR)
    .filter((f) => f.endsWith(".svg"))
    .sort()
    .map((f) => {
      const svg = readFileSync(`${PROPS_DIR}/${f}`, "utf8");
      const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)!;
      const inner = svg
        .replace(/^[\s\S]*?<\/title>\s*/, "")
        .replace(/<\/svg>\s*$/, "")
        .replace(/\s*\n\s*/g, "")
        // Props are drawn a few hundred px tall at most: 0.1 px is plenty, and halves the module.
        .replace(/-?\d+\.\d{2,}/g, (n) => String(Math.round(Number(n) * 10) / 10))
        .replace(HEX, (c) => {
          const n = NAME.get(c.toLowerCase());
          if (!n) throw new Error(`${f}: ${c} is not a world-register colour`);
          return `\${${n}}`;
        });
      return `  "${f.slice(0, -4)}": { w: ${w}, h: ${h}, inner: \`${inner}\` },`;
    });
  const src =
    `// Generated by tools/designer-assets.ts from src/assets/props/. Do not edit.\n` +
    `import { W } from "../../styles/scene";\n` +
    (entries.some((e) => e.includes("UI.ink")) ? `import { UI } from "../../styles/ui";\n` : "") +
    "\n" +
    `export const PROPS = {\n${entries.join("\n")}\n} as const;\n\nexport type PropId = keyof typeof PROPS;\n`;
  writeFileSync(PROPS_TS, await format(src, { ...(await resolveConfig(PROPS_TS)), filepath: PROPS_TS }));
}

const vault = process.argv[2];
if (vault) {
  mkdirSync(PROPS_DIR, { recursive: true });
  for (const it of [...PROPS, ...ORGANISMS])
    writeFileSync(it.out, restyle(readFileSync(`${vault}/${it.src}`, "utf8"), it));
}
await genProps();
