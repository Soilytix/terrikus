/** Heads-up display: where you are, how big things are, and the way out. */
import type { Scale, Scene } from "../content/schema";
import { chapter } from "../content";
import { ReviewBadge } from "./common";

export const LADDER: { scale: Scale; label: string; span: string }[] = [
  { scale: "landscape", label: "Landscape", span: "km" },
  { scale: "field", label: "Field", span: "m" },
  { scale: "profile", label: "Profile", span: "cm" },
  { scale: "aggregate", label: "Aggregate & pore", span: "µm–mm" },
  { scale: "rhizosphere", label: "Rhizosphere", span: "µm" },
  { scale: "cell", label: "Cell", span: "nm–µm" },
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
  book: "M4 4.5C6 3.5 8 3.5 10 5c2-1.5 4-1.5 6-.5V16c-2-1-4-1-6 .5C8 15 6 15 4 16z M10 5v11.5",
  eye: "M2.5 10s3-5.5 7.5-5.5 7.5 5.5 7.5 5.5-3 5.5-7.5 5.5S2.5 10 2.5 10z M10 12.3a2.3 2.3 0 100-4.6 2.3 2.3 0 000 4.6z",
  gear: "M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z M10 2.5v2 M10 15.5v2 M2.5 10h2 M15.5 10h2 M4.7 4.7l1.4 1.4 M13.9 13.9l1.4 1.4 M4.7 15.3l1.4-1.4 M13.9 6.1l1.4-1.4",
  help: "M7.5 7.5a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.2 M10 14.5v.3 M10 18a8 8 0 100-16 8 8 0 000 16z",
  up: "M10 15.5v-11 M5.5 9L10 4.5 14.5 9",
};

export function Hud({ scene, stamps, onUp, onNotebook, onTruth, onSettings, onHelp, notebookDot }: Props) {
  const ch = scene.chapter === "valley" ? undefined : chapter(scene.chapter);
  const rung = LADDER.findIndex((l) => l.scale === scene.scale);
  return (
    <>
      <header className="hud-top">
        <a className="brand" href="#/" aria-label="Soil Worlds, title screen">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Soil Worlds</span>
        </a>
        <div className="hud-where">
          {ch ? (
            <span className="chip">
              <span className="chip-num">{ch.number === "P" ? "P" : ch.number}</span>
              {ch.title}
            </span>
          ) : (
            <span className="chip">
              <span className="chip-num">◇</span>The valley
            </span>
          )}
          <h1 className="scene-title">{scene.title}</h1>
          <ReviewBadge status={scene.reviewStatus} />
        </div>
        <nav className="hud-actions" aria-label="Tools">
          <button type="button" className="hud-btn" onClick={onNotebook} aria-keyshortcuts="N">
            <Icon d={ICONS.book} />
            <span className="hud-btn-label">Notebook</span>
            {notebookDot && <span className="new-dot" aria-label="new entries" />}
          </button>
          <button type="button" className="hud-btn" onClick={onTruth}>
            <Icon d={ICONS.eye} />
            <span className="hud-btn-label">What is real?</span>
          </button>
          <button type="button" className="hud-btn icon-only" onClick={onSettings} aria-label="Settings">
            <Icon d={ICONS.gear} />
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

      <nav className="ladder" aria-label="Scale ladder">
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
                <span className="rung-span">{l.span}</span>
              </span>
            </li>
          ))}
        </ol>
        {onUp && (
          <button type="button" className="up-btn" onClick={onUp} aria-keyshortcuts="Escape">
            <Icon d={ICONS.up} />
            Up a scale
          </button>
        )}
      </nav>

      <div className="scalebar" aria-label={`Scale bar: ${scene.scaleBar.label}`}>
        <span className="scalebar-bar" aria-hidden="true" />
        <span className="scalebar-label">{scene.scaleBar.label}</span>
        {scene.notToScale && (
          <span
            className="not-to-scale"
            title="Some things are drawn bigger than true size so you can see them."
          >
            Cells drawn ×{scene.notToScale}
          </span>
        )}
      </div>
    </>
  );
}
