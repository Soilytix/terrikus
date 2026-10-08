/** Hash routes (spec §3): shareable, no server needed, work from any path prefix. */
import { sceneChapter } from "../content";
import { isBenchId, type BenchId } from "../sim/benches";

export type NotebookTab = "rumors" | "cards" | "lab" | "codex" | "contents";
export const NOTEBOOK_TABS: NotebookTab[] = ["rumors", "cards", "lab", "codex", "contents"];

export type Route =
  | { name: "title" }
  | { name: "scene"; scene: string }
  | { name: "bench"; bench: BenchId }
  | { name: "notebook"; tab: NotebookTab };

export function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [head, a, b] = parts;
  if (head === "ch" && b && sceneChapter(b)) return { name: "scene", scene: b };
  if (head === "ch" && a === "valley") return { name: "scene", scene: "valley" };
  if (head === "bench" && a && isBenchId(a)) return { name: "bench", bench: a };
  if (head === "notebook") {
    const tab = NOTEBOOK_TABS.find((t) => t === a) ?? "rumors";
    return { name: "notebook", tab };
  }
  return { name: "title" };
}

export function href(r: Route): string {
  switch (r.name) {
    case "title":
      return "#/";
    case "scene": {
      const c = sceneChapter(r.scene);
      return !c || r.scene === "valley" ? "#/ch/valley" : `#/ch/${c}/${r.scene}`;
    }
    case "bench":
      return `#/bench/${r.bench}`;
    case "notebook":
      return `#/notebook/${r.tab}`;
  }
}

/** A portal target is a scene id or a literal route. */
export function targetHref(to: string): string {
  return to.startsWith("#") ? to : href({ name: "scene", scene: to });
}
