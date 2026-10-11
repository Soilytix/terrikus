/**
 * Languages. English is the source: every German string is looked up by the
 * English it translates (`src/i18n/de/*.json`), so content keeps one shape and
 * an untranslated string falls back to English. The language is chosen once
 * per page load; switching reloads. No DOM or React here: `src/sim` uses `t`.
 */
export type Lang = "en" | "de";
export const LANGS: { id: Lang; name: string }[] = [
  { id: "en", name: "English" },
  { id: "de", name: "Deutsch" },
];
export const LANG_KEY = "terrikus-lang";

let current: Lang = "en";
let dict: Record<string, string> = {};

export const lang = () => current;

let open = () => {};
/** Settles once the page's language is installed; chapter chunks wait on it before they are translated. Open outside a browser. */
export const languageReady: Promise<void> =
  typeof document === "undefined" ? Promise.resolve() : new Promise((r) => (open = r));

/** Install a language and its dictionary (boot, tests). */
export function installLanguage(l: Lang, d: Record<string, string>) {
  current = l;
  dict = d;
  open();
}

/** The current language's text for an English string; `{name}` slots are filled from `vars`. */
export function t(s: string, vars?: Record<string, string | number>): string {
  const out = dict[s] ?? s;
  return vars ? out.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : out;
}

/** Marks an English literal for translation where `t` cannot run yet (module scope); call `t` on it at render. */
export const tl = (s: string) => s;

/**
 * Content fields that hold ids, enums or logic, never prose: left in English.
 * Everything else that is a string in content is shown to the learner.
 */
export const NOT_TEXT = new Set([
  "id",
  "sources",
  "confidence",
  "reviewStatus",
  "chapter",
  "misconception",
  "misconceptions",
  "misconceptionsTargeted",
  "cards",
  "card",
  "to",
  "scene",
  "scenes",
  "evidenceTier",
  "discoveries",
  "discovery",
  "tier",
  "missions",
  "scales",
  "scale",
  "codex",
  "howWeKnow",
  "connectors",
  "connector",
  "objects",
  "object",
  "bench",
  "recipe",
  "tone",
  "up",
  "requires",
  "group",
  "truthTag",
  "after",
  "unlockedBy",
  "number",
  "world",
  "entry",
  "hintsAt",
  "layer",
  "explainedBy",
  "watch",
  "hiddenBy",
  "chains",
  "reveal",
  "rumor",
  "outputs",
  "inputs",
  "water",
  "temperature",
  "residue",
  "held",
  "rootArchitecture",
  "mycorrhizal",
  "art",
  "verdict",
  "ruleId",
  "moisture",
  "branch",
  "site",
  "outcome",
  "flags",
  "flag",
  "mode",
  "remove",
  "prediction",
  "kind",
  "shares",
]);
const ENUM_EVIDENCE = new Set(["measured", "derived", "inferred"]);
/** A chain's evidence is matched as a key by `observed()`: shown through `t`, never rewritten. */
const CHAIN_EVIDENCE = /^(\w+ vs \w+|your .+)$/;

const skip = (key: string, v: string) =>
  NOT_TEXT.has(key) ||
  key.startsWith("r-") ||
  (key === "evidence" && (ENUM_EVIDENCE.has(v) || CHAIN_EVIDENCE.test(v)));

/** Visit every learner-facing string in a content value; `edit` may return a replacement. */
export function walkText(
  v: unknown,
  edit: (s: string) => string | void,
  key = "",
  seen = new Set<unknown>(),
) {
  if (!v || typeof v !== "object" || seen.has(v)) return;
  seen.add(v);
  const entries: [string | number, unknown][] = Array.isArray(v)
    ? v.map((x, i) => [i, x])
    : Object.entries(v as Record<string, unknown>);
  for (const [k, x] of entries) {
    const name = typeof k === "number" ? key : k;
    if (typeof x === "string") {
      if (skip(name, x)) continue;
      const next = edit(x);
      if (typeof next === "string") (v as Record<string | number, unknown>)[k] = next;
    } else walkText(x, edit, name, seen);
  }
}

/** Translate a content value in place (no-op in English). */
export function localize<T>(v: T): T {
  if (current !== "en") walkText(v, (s) => dict[s]);
  return v;
}
