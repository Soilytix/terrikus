/**
 * Internal review overlay: what is approved, by whom, for the scene in view
 * and for everything. Read-only: a named reviewer changes `reviewStatus` in
 * the content file, never here.
 */
import { useEffect, useState } from "react";
import { CHAPTERS, scene as sceneById, chapter as chapterById } from "../content";
import { loadChapters } from "../content/load";
import { REVIEW_ROWS, REVIEW_STATUSES, refreshReviewRows, type ReviewRow } from "../content/review";
import { Dialog, tr } from "./common";
import { t } from "../i18n";

function Rows({ rows }: { rows: ReviewRow[] }) {
  return (
    <table className="keys credits">
      <thead>
        <tr>
          <th scope="col">{t("Kind")}</th>
          <th scope="col">{t("Node")}</th>
          <th scope="col">{t("Status")}</th>
          <th scope="col">{t("Reviewer")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={`${r.kind}/${r.id}`}>
            <td>{r.kind}</td>
            <td>
              {r.title} <span className="mono muted">{r.id}</span>
            </td>
            <td>{r.reviewStatus}</td>
            <td>{r.reviewer ?? t("none named")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ReviewPanel({ sceneId, onClose }: { sceneId: string; onClose: () => void }) {
  const s = sceneById(sceneId);
  const ch = s && s.chapter !== "valley" ? chapterById(s.chapter) : undefined;
  const inView = new Set([sceneId, ...(ch ? [ch.id, ...ch.missions] : [])]);
  const here = REVIEW_ROWS.filter(
    (r) => ["scene", "chapter", "mission"].includes(r.kind) && inView.has(r.id),
  );
  return (
    <Dialog title={t("Scientific review")} onClose={onClose} wide>
      <p className="small muted">
        {tr(
          "Read-only. A named reviewer approves a node in its content file; nothing here changes a status. Run {cmd} for the full list as Markdown.",
          { cmd: <span className="mono">mise run review-report</span> },
        )}
      </p>
      <h3>{t("In view")}</h3>
      <Rows rows={here} />
      {REVIEW_STATUSES.map((status) => {
        const rows = REVIEW_ROWS.filter((r) => r.reviewStatus === status);
        return (
          <details key={status}>
            <summary>
              {status} ({rows.length})
            </summary>
            {rows.length > 0 && <Rows rows={rows} />}
          </details>
        );
      })}
    </Dialog>
  );
}

export function ReviewOverlay({ sceneId }: { sceneId: string }) {
  const [open, setOpen] = useState(false);
  // The count covers every node, so the overlay brings in every chapter's content, once the page is idle.
  const [, setLoaded] = useState(false);
  useEffect(() => {
    const later = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 1000));
    later(() => {
      void loadChapters(CHAPTERS.map((c) => c.id)).then(() => {
        refreshReviewRows();
        setLoaded(true);
      });
    });
  }, []);
  const approved = REVIEW_ROWS.filter((r) => r.reviewStatus === "approved").length;
  return (
    <>
      <button type="button" className="review-badge review-pill" onClick={() => setOpen(true)}>
        <span className="dot" aria-hidden="true" />
        {t("Review: {n} of {total} approved", { n: approved, total: REVIEW_ROWS.length })}
      </button>
      {open && <ReviewPanel sceneId={sceneId} onClose={() => setOpen(false)} />}
    </>
  );
}
