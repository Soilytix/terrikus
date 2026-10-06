/** The one game store: the save plus a writer. Persists debounced, and on page hide. */
import { create } from "zustand";
import { freshSave, type Save } from "../save/schema";
import { createStore } from "../save/storage";

const disk = createStore(() => window.localStorage);
let timer = 0;

interface Game {
  save: Save;
  persistent: boolean;
  update: (fn: (s: Save) => Save) => void;
  replace: (s: Save) => void;
  reset: () => void;
}

export const useGame = create<Game>((set, get) => {
  const persist = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      disk.save(get().save);
      set({ persistent: disk.persistent() });
    }, 300);
  };
  if (typeof window !== "undefined")
    window.addEventListener("pagehide", () => {
      window.clearTimeout(timer);
      disk.save(get().save);
    });
  return {
    save: disk.load(),
    persistent: disk.persistent(),
    update(fn) {
      const next = fn(get().save);
      if (next === get().save) return;
      set({ save: next });
      persist();
    },
    replace(s) {
      set({ save: s });
      persist();
    },
    reset() {
      set({ save: freshSave() });
      persist();
    },
  };
});

/** System preference merged with the player's own motion setting. */
export function prefersReduced(motion: Save["settings"]["motion"]): boolean {
  if (motion === "reduced") return true;
  if (motion === "full") return false;
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
