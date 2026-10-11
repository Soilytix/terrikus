/** The title card over the living valley. */
import { CHAPTERS } from "../content";
import { targetHref } from "../app/router";
import type { Save } from "../save/schema";
import { assetUrl } from "../assets/urls";
import { mixer, type BedScene } from "../audio/mixer";
import { useEffect, useState } from "react";

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

const label = (n: string) => (n === "P" ? "Prologue" : `Chapter ${n}`);

export function Title({
  save,
  onStart,
  resumeLabel,
  birds,
  sound,
}: {
  save: Save;
  onStart: () => void;
  resumeLabel: string;
  birds: boolean;
  /** The first scene's music to fetch before the learner may begin; `null` with sound off. */
  sound: BedScene | null;
}) {
  const begun = save.lastSession !== null;
  const [ready, setReady] = useState(!sound);
  const want = sound && `${sound.id}:${sound.scale}`;
  useEffect(() => {
    if (!sound) return setReady(true);
    let live = true;
    setReady(false);
    void mixer.preload(sound).finally(() => live && setReady(true));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by the scene
  }, [want]);
  const chapters = CHAPTERS.filter((c) => c.playable);
  const state = (id: string) =>
    save.chaptersComplete.includes(id) ? "done" : save.chaptersUnlocked.includes(id) ? "open" : "locked";
  const next =
    chapters.find((c) => state(c.id) === "open") ?? chapters.findLast((c) => state(c.id) !== "locked");
  return (
    <>
      {birds && <Birds />}
      <img className="title-wordmark" src={assetUrl("brand-wordmark")} alt="Soilytix" />
      <section className="title-card" aria-labelledby="title" aria-busy={!ready}>
        <h1 id="title">Terrikus</h1>
        <p className="title-lede">
          One valley, <mark>six scales</mark>. Pick up a handful of soil and follow it down, from the field to
          a single water film, by predicting, running experiments and explaining what you saw.
        </p>
        <div className="title-actions" inert={!ready}>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-primary btn-lg btn-go"
              onClick={onStart}
              disabled={!ready}
            >
              {begun ? `Continue: ${resumeLabel}` : "Begin in the spinach field"}
              <span className="go-chip" aria-hidden="true">
                →
              </span>
            </button>
          </div>
          <p className="title-loading" role="status">
            {!ready && (
              <>
                <span className="spinner" aria-hidden="true" /> Loading the valley’s sound…
              </>
            )}
          </p>
          {next && (
            <div className="title-next">
              <span className="pill-eyebrow">{begun ? "Up next" : "First chapter"}</span>
              <p>
                <span className="mono">{label(next.number)}</span> {next.title}
              </p>
              <p className="hand">“{next.hook}”</p>
            </div>
          )}
          <ol className="title-chapters" aria-label="Chapters">
            {chapters.map((c) => (
              <li key={c.id} data-state={state(c.id)} data-next={c.id === next?.id}>
                {state(c.id) === "locked" ? (
                  <span title={c.title}>
                    {c.number}
                    <span className="sr-only">
                      {" "}
                      {label(c.number)}: {c.title} (locked)
                    </span>
                  </span>
                ) : (
                  <a href={targetHref(c.scenes[0]!)} title={c.title}>
                    {c.number}
                    <span className="sr-only">
                      {" "}
                      {label(c.number)}: {c.title}
                      {state(c.id) === "done" ? " (done)" : ""}
                    </span>
                  </a>
                )}
              </li>
            ))}
            <li data-state="planned">
              <span title="Glimpsed in the valley, still being written">
                +12<span className="sr-only"> chapters still being written</span>
              </span>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
