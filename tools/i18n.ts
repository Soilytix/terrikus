/**
 * Translation coverage. Collects every learner-facing English string, from
 * content (`walkText`) and from `t("…")` / `tr("…")` calls in the code, groups
 * them by area (`ui`, `core`, one per chapter) and reports those with no German
 * in `src/i18n/de/*.json`.
 *
 *   pnpm exec tsx tools/i18n.ts            # counts per area
 *   pnpm exec tsx tools/i18n.ts c4 > x.json  # missing strings of one area, as {"English": ""}
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { CHAPTERS, DISCOVERIES, FIELD_CARDS, RUMORS, VALLEY_SCENES } from "../src/content";
import { CARDS, CHAINS } from "../src/content/chains";
import { GLOSSARY } from "../src/content/glossary";
import { LOADERS } from "../src/content/load";
import { MISCONCEPTIONS } from "../src/content/misconceptions";
import { WORLDS } from "../src/content/worlds";
import { walkText } from "../src/i18n";

const CALL = /\b(?:t|tr|tl)\(\s*(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) ? [p] : [];
  });
}

const unescape = (q: string, s: string) =>
  q === "`" ? s : (JSON.parse(`"${s.replace(/\\'/g, "'")}"`) as string);

export async function collect(): Promise<Record<string, Set<string>>> {
  const areas: Record<string, Set<string>> = { ui: new Set(), core: new Set() };
  for (const f of files("src")) {
    if (f.startsWith(join("src", "i18n")) || f.startsWith(join("src", "content"))) continue;
    for (const m of readFileSync(f, "utf8").matchAll(CALL)) areas.ui!.add(unescape(m[1]!, m[2]!));
  }
  const add = (area: string, v: unknown) => {
    const set = (areas[area] ??= new Set());
    walkText(v, (s) => void set.add(s));
  };
  add("core", [
    CHAPTERS,
    RUMORS,
    DISCOVERIES,
    FIELD_CARDS,
    VALLEY_SCENES,
    CARDS,
    CHAINS,
    GLOSSARY,
    MISCONCEPTIONS,
    WORLDS,
  ]);
  for (const [id, load] of Object.entries(LOADERS)) add(id, await load());
  return areas;
}

export function german(): Record<string, string> {
  const dir = join("src", "i18n", "de");
  return Object.assign(
    {},
    ...readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as Record<string, string>),
  );
}

export async function missing() {
  const de = german();
  const out: Record<string, string[]> = {};
  for (const [area, set] of Object.entries(await collect())) out[area] = [...set].filter((s) => !de[s]);
  return out;
}

if (process.argv[1]?.endsWith("i18n.ts")) {
  const gaps = await missing();
  const area = process.argv[2];
  if (area) console.log(JSON.stringify(Object.fromEntries((gaps[area] ?? []).map((s) => [s, ""])), null, 2));
  else for (const [a, list] of Object.entries(gaps)) console.log(`${a.padEnd(10)} ${list.length} missing`);
}
