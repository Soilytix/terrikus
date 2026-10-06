/**
 * localStorage with an in-memory fallback (spec §7). Every access is wrapped:
 * private windows, blocked storage and quota errors all degrade to "progress
 * will not be kept", never to a crash.
 */
import { migrate } from "./migrate";
import { SAVE_KEY, freshSave, type Save } from "./schema";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface Store {
  load(): Save;
  save(s: Save): void;
  /** False once storage failed: the UI shows the "progress will not be kept" note. */
  persistent(): boolean;
}

export function createStore(getStorage: () => StorageLike | undefined): Store {
  let persistent = true;
  let memory: Save | null = null;
  const storage = (): StorageLike | undefined => {
    try {
      return getStorage();
    } catch {
      persistent = false;
      return undefined;
    }
  };
  return {
    load() {
      const s = storage();
      if (!s) {
        persistent = false;
        return memory ?? freshSave();
      }
      let raw: string | null = null;
      try {
        raw = s.getItem(SAVE_KEY);
        return raw ? migrate(JSON.parse(raw)) : freshSave();
      } catch {
        // Corrupt or foreign data: keep a copy beside it, then start fresh (the next save overwrites it).
        try {
          if (raw) s.setItem(`${SAVE_KEY}.corrupt`, raw);
        } catch {
          /* storage full or blocked: nothing more to keep */
        }
        return freshSave();
      }
    },
    save(save) {
      memory = save;
      const s = storage();
      if (!s) {
        persistent = false;
        return;
      }
      try {
        s.setItem(SAVE_KEY, JSON.stringify(save));
        persistent = true;
      } catch {
        persistent = false;
      }
    },
    persistent: () => persistent,
  };
}

export function exportSave(save: Save): string {
  return JSON.stringify(save, null, 2);
}

/** Validates and migrates; throws SaveError on anything it cannot read. */
export function importSave(json: string): Save {
  return migrate(JSON.parse(json));
}
