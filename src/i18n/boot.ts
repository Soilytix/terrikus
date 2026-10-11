/** Choose the language for this page load and translate the content that ships with the shell. */
import { CHAPTERS, DISCOVERIES, FIELD_CARDS, RUMORS, VALLEY_SCENES } from "../content";
import { CARDS, CHAINS } from "../content/chains";
import { GLOSSARY } from "../content/glossary";
import { MISCONCEPTIONS } from "../content/misconceptions";
import { WORLDS } from "../content/worlds";
import { LANG_KEY, installLanguage, localize, type Lang } from "./index";

/** Every German dictionary file, as a URL: fetched only when German is chosen, outside the JS budget. */
const DE = import.meta.glob<string>("./de/*.json", { query: "?url", import: "default", eager: true });

export function chosenLang(): Lang {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "en" || q === "de") return q;
    const s = localStorage.getItem(LANG_KEY);
    if (s === "en" || s === "de") return s;
  } catch {
    /* storage blocked: fall through to the browser */
  }
  return navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}

/** Remember the choice and reload: content is translated once, at boot. */
export function switchLang(l: Lang) {
  try {
    localStorage.setItem(LANG_KEY, l);
  } catch {
    /* storage blocked: the query string still carries it */
  }
  const url = new URL(location.href);
  url.searchParams.set("lang", l);
  location.replace(url);
}

export async function bootLanguage() {
  const l = chosenLang();
  document.documentElement.lang = l;
  if (l === "en") return installLanguage("en", {});
  const parts = await Promise.all(
    Object.values(DE).map((u) =>
      fetch(u)
        .then((r) => r.json() as Promise<Record<string, string>>)
        .catch(() => ({})),
    ),
  );
  installLanguage(l, Object.assign({}, ...parts));
  for (const v of [
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
  ])
    localize(v);
}
