/** The title card over the living valley. */
import { CHAPTERS } from "../content";
import { targetHref } from "../app/router";
import type { Save } from "../save/schema";
import { assetUrl } from "../assets/urls";
import { mixer, type BedScene } from "../audio/mixer";
import { useEffect, useState, type CSSProperties } from "react";

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

/** Circles per row of the chapter strip (CSS `.title-chapters`). */
const COLS = 8;
const SPLASH_MS = 1500;
/** Once per visit: coming back to the title skips the logo. */
let splashed = false;
/** Each letter of the title set a little askew, like letters cut out and pinned. */
const TILT = [-4, 3, -2, 5, -3, 2, -5, 3];

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
  // The logo holds the first paint of a visit for a beat, and until the music could play.
  const [held, setHeld] = useState(!splashed);
  useEffect(() => {
    if (!held) return;
    const t = window.setTimeout(() => setHeld(false), SPLASH_MS);
    return () => window.clearTimeout(t);
  }, [held]);
  const splash = held || !ready;
  useEffect(() => {
    if (!splash) splashed = true;
  }, [splash]);
  const chapters = CHAPTERS;
  const state = (id: string) =>
    save.chaptersComplete.includes(id) ? "done" : save.chaptersUnlocked.includes(id) ? "open" : "locked";
  const next =
    chapters.find((c) => state(c.id) === "open") ?? chapters.findLast((c) => state(c.id) !== "locked");
  // The up-next card opens below the row that holds the next chapter's circle and points up at it.
  // A fixed grid keeps every circle in its place, so the row is arithmetic, not measured.
  const nextIndex = chapters.findIndex((c) => c.id === next?.id);
  const slot = {
    after: Math.min(Math.floor(nextIndex / COLS) * COLS + COLS - 1, chapters.length),
    col: nextIndex % COLS,
  };
  const card = next && (
    <li key="next" className="title-next" style={{ "--col": slot.col } as CSSProperties}>
      <p>
        <span className="sr-only">{begun ? "Up next: " : "First chapter: "}</span>
        <span className="mono">{label(next.number)}</span> {next.title}
      </p>
      <p className="hand">“{next.hook}”</p>
    </li>
  );
  return (
    <>
      {birds && <Birds />}
      <img className="title-wordmark" data-splash={splash} src={assetUrl("brand-wordmark")} alt="Soilytix" />
      {splash && sound && (
        <p className="title-splash" role="status">
          <span className="title-splash-hint">
            <span className="spinner" aria-hidden="true" /> Loading the valley’s sound…
          </span>
        </p>
      )}
      {!splash && (
        <section className="title-card" aria-labelledby="title" aria-busy={!ready}>
          <h1 id="title">
            {[..."Terrikus"].map((ch, i) => (
              <span key={i} style={{ "--tilt": `${TILT[i]}deg` } as CSSProperties}>
                {ch}
              </span>
            ))}
          </h1>
          <p className="title-lede">
            Take a handful of soil from one valley and follow it down through <mark>six scales</mark>, from
            the field to a single film of water. At each step you make a guess, run an experiment and explain
            what you saw.
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
            <ol className="title-chapters" aria-label="Chapters">
              {chapters.map((c, i) => [
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
                </li>,
                i === slot.after && card,
              ])}
              <li data-state="planned">
                <span title="Glimpsed in the valley, still being written">
                  +12<span className="sr-only"> chapters still being written</span>
                </span>
              </li>
              {slot.after >= chapters.length && card}
            </ol>
          </div>
        </section>
      )}
    </>
  );
}
