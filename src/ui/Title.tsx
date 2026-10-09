/** The title card over the living valley. */
import { CHAPTERS } from "../content";
import { targetHref } from "../app/router";
import type { Save } from "../save/schema";
import { assetUrl } from "../assets/urls";

/** A few far birds crossing the sky: CSS only, and not rendered at all under reduced motion. */
function Birds() {
  return (
    <div className="title-birds" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((k) => (
        <svg key={k} viewBox="0 0 24 10" className="title-bird">
          <path d="M1,4Q7,-1 12,6Q17,-1 23,4" />
        </svg>
      ))}
    </div>
  );
}

export function Title({
  save,
  onStart,
  resumeLabel,
  birds,
}: {
  save: Save;
  onStart: () => void;
  resumeLabel: string;
  birds: boolean;
}) {
  const begun = save.lastSession !== null;
  return (
    <>
      {birds && <Birds />}
      <section className="title-card" aria-labelledby="title">
        <img className="title-wordmark" src={assetUrl("brand-wordmark")} alt="Soilytix" />
        <h1 id="title">Pedologicus</h1>
        <p className="title-lede">
          One valley, six scales. Pick up a handful of soil and follow it down, from the field to a single
          water film, by predicting, running experiments and explaining what you saw.
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
              <span className="mono">{c.number === "P" ? "Prologue" : `Chapter ${c.number}`}</span>
              <span>
                {save.chaptersUnlocked.includes(c.id) ? (
                  <a href={targetHref(c.scenes[0]!)}>{c.title}</a>
                ) : (
                  c.title
                )}
                <small>“{c.hook}”</small>
              </span>
            </li>
          ))}
          <li data-state="planned">
            <span className="mono">Twelve more</span>
            <span>
              Coming
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
    </>
  );
}
