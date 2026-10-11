/** The title card over the living valley. */
import { CHAPTERS } from "../content";
import { targetHref } from "../app/router";
import type { Save } from "../save/schema";
import { assetUrl } from "../assets/urls";
import { mixer, type BedScene } from "../audio/mixer";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

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
  // The logo holds the first paint until the music starts (a gesture's job); without sound, it steps aside at once.
  const [started, setStarted] = useState(() => mixer.enabled());
  useEffect(() => mixer.subscribe(() => mixer.enabled() && setStarted(true)), []);
  const splash = !!sound && !(ready && started);
  const chapters = CHAPTERS.filter((c) => c.playable);
  const state = (id: string) =>
    save.chaptersComplete.includes(id) ? "done" : save.chaptersUnlocked.includes(id) ? "open" : "locked";
  const next =
    chapters.find((c) => state(c.id) === "open") ?? chapters.findLast((c) => state(c.id) !== "locked");
  // The up-next card opens below the row that holds the next chapter's circle and points up at it.
  const list = useRef<HTMLOListElement>(null);
  const nextIndex = chapters.findIndex((c) => c.id === next?.id);
  const [slot, setSlot] = useState({ after: nextIndex, caret: 0 });
  useLayoutEffect(() => {
    const ol = list.current;
    if (!ol || nextIndex < 0) return;
    const place = () => {
      // Measure the rows as they wrap without the card, which breaks the row it sits in.
      const card = ol.querySelector<HTMLElement>(":scope > .title-next");
      if (card) card.style.display = "none";
      const dots = [...ol.querySelectorAll<HTMLElement>(":scope > li:not(.title-next)")];
      const dot = dots[nextIndex]!;
      let after = nextIndex;
      while (dots[after + 1]?.offsetTop === dot.offsetTop) after++;
      if (card) card.style.display = "";
      setSlot({ after, caret: dot.offsetLeft + dot.offsetWidth / 2 });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(ol);
    return () => ro.disconnect();
  }, [nextIndex]);
  const card = next && (
    <li key="next" className="title-next" style={{ "--caret": `${slot.caret}px` } as CSSProperties}>
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
      {splash && (
        <button type="button" className="title-splash" autoFocus onClick={() => mixer.enable()}>
          {started ? (
            <>
              <span className="spinner" aria-hidden="true" /> Loading the valley’s sound…
            </>
          ) : (
            "Click or press a key to start, with sound"
          )}
        </button>
      )}
      {!splash && (
        <section className="title-card" aria-labelledby="title" aria-busy={!ready}>
          <h1 id="title">Terrikus</h1>
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
            <ol className="title-chapters" aria-label="Chapters" ref={list}>
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
