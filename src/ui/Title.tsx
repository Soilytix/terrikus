/** The title card over the living valley. */
import { CHAPTERS } from "../content";
import type { Save } from "../save/schema";

export function Title({
  save,
  onStart,
  resumeLabel,
}: {
  save: Save;
  onStart: () => void;
  resumeLabel: string;
}) {
  const begun = save.lastSession !== null;
  return (
    <section className="title-card" aria-labelledby="title">
      <p className="eyebrow">A playable soil science textbook</p>
      <h1 id="title">Soil Worlds</h1>
      <p className="title-lede">
        One valley, six scales. Pick up a handful of soil and follow it down, from the field to a single water
        film, by predicting, running experiments and explaining what you saw.
      </p>
      <div className="btn-row">
        <button type="button" className="btn btn-primary btn-lg" onClick={onStart}>
          {begun ? `Continue: ${resumeLabel}` : "Begin in the spinach field"}
        </button>
        <a className="btn btn-ghost" href="#/notebook/contents">
          Notebook
        </a>
      </div>
      <ol className="title-chapters" aria-label="Chapters">
        {CHAPTERS.filter((c) => c.playable).map((c) => (
          <li
            key={c.id}
            data-state={
              save.chaptersComplete.includes(c.id)
                ? "done"
                : save.chaptersUnlocked.includes(c.id)
                  ? "open"
                  : "locked"
            }
          >
            <span className="mono">{c.number}</span>
            <span>
              {c.title}
              <small>“{c.hook}”</small>
            </span>
          </li>
        ))}
        <li data-state="planned">
          <span className="mono">1–14</span>
          <span>
            Twelve more chapters
            <small>glimpsed in the valley, still being written</small>
          </span>
        </li>
      </ol>
      <p className="title-foot">
        <span className="review-badge">
          <span className="dot" aria-hidden="true" />
          Draft · scientific review pending
        </span>
        A teaching tool. Rates and pictures teach direction, not prediction.
      </p>
    </section>
  );
}
