/**
 * Forward migrations, one per version step (spec §7). Unknown or future
 * versions are refused rather than guessed at.
 */
import { SCHEMA_VERSION, freshSave, type Save } from "./schema";

export class SaveError extends Error {}

type Migration = (old: Record<string, unknown>) => Record<string, unknown>;

/** MIGRATIONS[n] upgrades a version-n save to n+1. None yet: v1 is the first shipped version. */
export const MIGRATIONS: Record<number, Migration> = {};

export function migrate(raw: unknown, migrations: Record<number, Migration> = MIGRATIONS): Save {
  if (!raw || typeof raw !== "object") throw new SaveError("save is not an object");
  let data = raw as Record<string, unknown>;
  const v0 = data.schemaVersion;
  if (typeof v0 !== "number" || !Number.isInteger(v0) || v0 < 0)
    throw new SaveError("save has no valid schemaVersion");
  let v: number = v0;
  if (v > SCHEMA_VERSION) throw new SaveError(`save version ${v} is newer than this app (${SCHEMA_VERSION})`);
  while (v < SCHEMA_VERSION) {
    const step = migrations[v];
    if (!step) throw new SaveError(`no migration from version ${v}`);
    data = step(data);
    v = data.schemaVersion as number;
  }
  // Fill any field a hand-edited or partial save lacks, without trusting extra keys.
  const base = freshSave();
  const merged = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(base)) if (key in data) merged[key] = data[key];
  merged.settings = { ...base.settings, ...(data.settings as object) };
  return merged as unknown as Save;
}
