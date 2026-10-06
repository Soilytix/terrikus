import { describe, expect, it } from "vitest";
import { SaveError, migrate } from "./migrate";
import { LAB_BOOK_CAP, SAVE_KEY, appendLab, freshSave, type LabEntry } from "./schema";
import { createStore, exportSave, importSave, type StorageLike } from "./storage";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

const entry = (i: number): LabEntry => ({
  id: `e${i}`,
  at: "2026-10-06T00:00:00Z",
  bench: "leaf-jar",
  ruleset: "leaf-jar@1",
  a: { water: "moist", temperature: "mild", residue: "leaf" },
  result: "",
  tier: "observed",
});

describe("save", () => {
  it("round-trips through storage", () => {
    const mem = memoryStorage();
    const store = createStore(() => mem);
    const s = { ...freshSave(), flags: ["p-m1-done"], discoveries: ["d-p-half-space"] };
    store.save(s);
    expect(createStore(() => mem).load()).toEqual(s);
    expect(store.persistent()).toBe(true);
  });

  it("starts fresh on corrupt JSON without throwing, keeping a copy", () => {
    const mem = memoryStorage();
    mem.data.set(SAVE_KEY, "{not json");
    expect(createStore(() => mem).load().schemaVersion).toBe(1);
    expect(mem.data.get(`${SAVE_KEY}.corrupt`)).toBe("{not json");
  });

  it("refuses a save whose known fields have the wrong type", () => {
    expect(() => importSave('{"schemaVersion":1,"cards":null,"scanned":5}')).toThrow(/cards, scanned/);
    expect(() => importSave('{"schemaVersion":1,"settings":{"motion":"fast"}}')).toThrow(SaveError);
  });

  it("refuses unknown and future versions on import", () => {
    expect(() => importSave(JSON.stringify({ schemaVersion: 99 }))).toThrow(SaveError);
    expect(() => importSave(JSON.stringify({ hello: 1 }))).toThrow(SaveError);
    expect(() => importSave("[]")).toThrow(SaveError);
  });

  it("falls back to memory when storage throws, and says so", () => {
    const store = createStore(() => {
      throw new Error("SecurityError");
    });
    const s = { ...freshSave(), flags: ["x"] };
    store.save(s);
    expect(store.persistent()).toBe(false);
    expect(store.load().flags).toEqual(["x"]);
  });

  it("falls back when setItem throws (quota)", () => {
    const store = createStore(() => ({
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    }));
    store.save(freshSave());
    expect(store.persistent()).toBe(false);
  });

  it("caps the lab book at 200, dropping the oldest", () => {
    let book: LabEntry[] = [];
    for (let i = 0; i < LAB_BOOK_CAP + 5; i++) book = appendLab(book, entry(i));
    expect(book).toHaveLength(LAB_BOOK_CAP);
    expect(book[0]?.id).toBe("e5");
  });

  it("exports and imports the same save", () => {
    const s = { ...freshSave(), chaptersUnlocked: ["prologue", "leaf"] };
    expect(importSave(exportSave(s))).toEqual(s);
  });

  it("applies migrations step by step (fixture v0 → v1)", () => {
    // A fixture migration proves the mechanism: a pretend v0 save gains a field.
    const migrated = migrate(
      { schemaVersion: 0, flags: ["old"] },
      { 0: (old) => ({ ...old, schemaVersion: 1, stamps: ["from-v0"] }) },
    );
    expect(migrated.stamps).toEqual(["from-v0"]);
    expect(migrated.flags).toEqual(["old"]);
  });
});
