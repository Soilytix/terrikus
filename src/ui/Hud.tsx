/** Heads-up display: where you are, how big things are, and the way out. */
import { useEffect, useRef, useState } from "react";
import { chapter, sceneChapter } from "../content";
import type { Scale, Scene } from "../content/schema";
import { assetUrl } from "../assets/urls";

/** `bar`: a typical scale-bar length (m) at that rung; a much shorter bar marks a close-up. */
export const LADDER: { scale: Scale; label: string; span: string; bar: number }[] = [
  { scale: "landscape", label: "Landscape", span: "km", bar: 100 },
  { scale: "field", label: "Field", span: "m", bar: 1 },
  { scale: "profile", label: "Profile", span: "cm", bar: 0.01 },
  { scale: "aggregate", label: "Aggregate & pore", span: "µm–mm", bar: 1e-4 },
  { scale: "rhizosphere", label: "Rhizosphere", span: "µm", bar: 1e-5 },
  { scale: "cell", label: "Cell", span: "nm–µm", bar: 1e-7 },
];

interface Props {
  scene: Scene;
  stamps: string[];
  onUp: (() => void) | null;
  onNotebook: () => void;
  onTruth: () => void;
  onSettings: () => void;
  onHelp: () => void;
  notebookDot: boolean;
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICONS = {
  book: "M4 4.5C6 3.5 8 3.5 10 5c2 -1.5 4-1.5 6-.5V16c-2-1-4-1-6 .5C8 15 6 15 4 16z M10 5v11.5",
  info: "M10 18a8 8 0 100-16 8 8 0 000 16z M10 9v5 M10 6.2v.3",
  sliders: "M3.5 6h13 M3.5 14h13 M7.5 3.8v4.4 M12.5 11.8v4.4",
  help: "M7.5 7.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.2 M10 14.5v.3 M10 18a8 8 0 100-16 8 8 0 000 16z",
  up: "M10 15.5v-11 M5.5 9L10 4.5 14.5 9",
};

export function Hud({ scene, stamps, onUp, onNotebook, onTruth, onSettings, onHelp, notebookDot }: Props) {
  const rung = LADDER.findIndex((l) => l.scale === scene.scale);
  const closeUp = scene.scaleBar.metres < (LADDER[rung]?.bar ?? 0) / 5;
  const ch = chapter(sceneChapter(scene.id) ?? "");
  // The ladder lets clicks through (CSS); like a dock, it steps aside while the pointer is over it.
  const ladder = useRef<HTMLElement>(null);
  const [recede, setRecede] = useState(false);
  useEffect(() => {
    // Measured at rest only, so the slid-aside card does not shrink its own hover zone.
    let home: DOMRect | undefined;
    const move = (e: PointerEvent) => {
      const el = ladder.current;
      if (el?.dataset.recede !== "true") home = el?.getBoundingClientRect();
      const r = home;
      const over = !!r && e.clientX <= r.right + 24 && e.clientY >= r.top - 24 && e.clientY <= r.bottom + 24;
      setRecede(over);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <>
      <header className="hud-top">
        <a className="brand" href="#/">
          <span className="brand-names">
            <img className="brand-wordmark" src={assetUrl("brand-wordmark")} alt="Soilytix" />
            <span className="brand-name">Terrikus</span>
          </span>
          <span className="sr-only">, back to the title screen</span>
        </a>
        <div className="scene-names">
          <span className="scene-chapter">{ch ? ch.title : "The valley"}</span>
          <h1 className="scene-title">{scene.title}</h1>
        </div>
        <nav className="hud-scene" aria-label="This scene">
          {onUp && (
            <button
              type="button"
              className="hud-btn up-btn"
              onClick={onUp}
              aria-label="Up a scale"
              aria-keyshortcuts="Escape"
            >
              <Icon d={ICONS.up} />
              <span className="hud-btn-label">Up a scale</span>
            </button>
          )}
          <button
            type="button"
            className="hud-btn icon-only"
            onClick={onTruth}
            aria-label="About this picture"
            title="About this picture: what is drawn from life, and what is not"
          >
            <Icon d={ICONS.info} />
          </button>
        </nav>
        <nav className="hud-actions" aria-label="Tools">
          <button
            type="button"
            className="hud-btn"
            onClick={onNotebook}
            aria-label={notebookDot ? "Notebook, new entries" : "Notebook"}
            aria-keyshortcuts="N"
          >
            <Icon d={ICONS.book} />
            <span className="hud-btn-label">Notebook</span>
            {notebookDot && <span className="new-dot" aria-hidden="true" />}
          </button>
          <button type="button" className="hud-btn icon-only" onClick={onSettings} aria-label="Settings">
            <Icon d={ICONS.sliders} />
          </button>
          <button
            type="button"
            className="hud-btn icon-only"
            onClick={onHelp}
            aria-label="Help and keys"
            aria-keyshortcuts="?"
          >
            <Icon d={ICONS.help} />
          </button>
        </nav>
      </header>

      <nav className="ladder" aria-label="Scale ladder" ref={ladder} data-recede={recede}>
        <ol>
          {LADDER.map((l, i) => (
            <li
              key={l.scale}
              data-here={i === rung}
              data-stamped={stamps.includes(l.scale)}
              aria-current={i === rung ? "location" : undefined}
            >
              <span className="rung" aria-hidden="true" />
              <span className="rung-label">
                {l.label}
                <span className="rung-span">
                  {i === rung && closeUp ? `close-up · ${scene.scaleBar.label}` : l.span}
                </span>
                {i !== rung && stamps.includes(l.scale) && <span className="sr-only"> (visited)</span>}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <p className="scalebar">
        {scene.notToScale && (
          <span
            className="not-to-scale"
            title="Some things are drawn bigger than true size so you can see them."
          >
            Cells drawn ×{scene.notToScale}
          </span>
        )}
        <span className="scalebar-bar" aria-hidden="true" />
        <span className="sr-only">Scale bar: </span>
        <span className="scalebar-label">{scene.scaleBar.label}</span>
      </p>
    </>
  );
}
