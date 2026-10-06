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
  merged.settings = { ...base.settings, ...(isRecord(data.settings) ? data.settings : {}) };
  check(merged);
  return merged as unknown as Save;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const strings = (v: unknown) => Array.isArray(v) && v.every((x) => typeof x === "string");
const recordOf = (v: unknown, ok: (x: unknown) => boolean) => isRecord(v) && Object.values(v).every(ok);

/** Shape check of a merged save: a wrong-typed field is refused here, not discovered by a render crash. */
function check(d: Record<string, unknown>) {
  const s = d.settings as Record<string, unknown>;
  const fields: [string, boolean][] = [
    ["createdAt", typeof d.createdAt === "string"],
    [
      "settings",
      ["system", "reduced", "full"].includes(s.motion as string) &&
        typeof s.lens === "boolean" &&
        typeof s.ambient === "boolean",
    ],
    ["chaptersUnlocked", strings(d.chaptersUnlocked)],
    ["chaptersComplete", strings(d.chaptersComplete)],
    ["rumors", recordOf(d.rumors, (x) => ["glimpsed", "investigated", "explained"].includes(x as string))],
    ["cards", recordOf(d.cards, (x) => x === "partial" || x === "full")],
    ["codex", strings(d.codex)],
    ["discoveries", strings(d.discoveries)],
    ["stamps", strings(d.stamps)],
    ["labBook", Array.isArray(d.labBook) && d.labBook.every((e) => isRecord(e) && isRecord(e.a))],
    ["chains", recordOf(d.chains, (c) => isRecord(c) && strings(c.cards) && strings(c.connectors))],
    ["predictions", recordOf(d.predictions, (x) => ["string", "number"].includes(typeof x) || strings(x))],
    ["missions", recordOf(d.missions, (m) => isRecord(m) && typeof m.step === "number")],
    ["scanned", strings(d.scanned)],
    ["flags", strings(d.flags)],
    ["rumorViews", recordOf(d.rumorViews, (v) => isRecord(v) && typeof v.n === "number")],
    [
      "lastSession",
      d.lastSession === null || (isRecord(d.lastSession) && typeof d.lastSession.route === "string"),
    ],
  ];
  const bad = fields.filter(([, ok]) => !ok).map(([k]) => k);
  if (bad.length) throw new SaveError(`save has malformed fields: ${bad.join(", ")}`);
}
