/** Every content node a reviewer signs off, in one list: the review report and the internal overlay read it. */
import { CHAPTERS, CODEX, MATERIALS, MISSIONS, ORGANISMS, PROCESSES, SCENES } from ".";
import { GLOSSARY } from "./glossary";
import type { ReviewStatus } from "./schema";

export interface ReviewRow {
  kind: "chapter" | "scene" | "mission" | "codex" | "organism" | "process" | "material" | "glossary";
  id: string;
  title: string;
  reviewStatus: ReviewStatus;
  reviewer?: string | undefined;
}

export const REVIEW_ROWS: ReviewRow[] = [
  ...CHAPTERS.map((n) => ({ kind: "chapter" as const, ...n })),
  ...SCENES.map((n) => ({ kind: "scene" as const, ...n })),
  ...MISSIONS.map((n) => ({ kind: "mission" as const, ...n })),
  ...CODEX.map((n) => ({ kind: "codex" as const, ...n })),
  ...ORGANISMS.map((n) => ({ kind: "organism" as const, ...n, title: n.name })),
  ...PROCESSES.map((n) => ({ kind: "process" as const, ...n, title: n.name })),
  ...MATERIALS.map((n) => ({ kind: "material" as const, ...n, title: n.name })),
  ...GLOSSARY.map((n) => ({ kind: "glossary" as const, ...n, title: n.term })),
].map(({ kind, id, title, reviewStatus, reviewer }) => ({ kind, id, title, reviewStatus, reviewer }));

export const REVIEW_STATUSES: ReviewStatus[] = ["draft", "in-review", "needs-changes", "approved"];
