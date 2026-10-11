/** Settings, help and the "what is real here?" panel. */
import { useRef, useState } from "react";
import type { Scene } from "../content/schema";
import { exportSave, importSave } from "../save/storage";
import type { Motion, Save } from "../save/schema";
import { Dialog, Kbd } from "./common";
import { AmbientToggle } from "./Ambient";
import { Credits } from "./Credits";
import { PilotSettings } from "./Pilot";
import { SoundSettings } from "./Sound";

export function Truth({ scene, onClose }: { scene: Scene; onClose: () => void }) {
  const rows: [string, string[]][] = [
    ["Drawn from real things", scene.truth.drawnFrom],
    ["Schematic", scene.truth.schematic],
    ["Invented for the game", scene.truth.invented],
    ["Not simulated here", scene.truth.notSimulated],
  ];
  return (
    <Dialog title="About this picture" onClose={onClose}>
      <p className="lede">{scene.description}</p>
      <dl className="truth">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>
              <ul>
                {v.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
      <p className="small muted">
        Scale bar: {scene.scaleBar.label}.
        {scene.notToScale ? ` Cells are drawn ${scene.notToScale}× true size.` : ""}
      </p>
    </Dialog>
  );
}

export const KEYS: [string, string][] = [
  ["Tab / Shift-Tab", "Move through everything in the scene"],
  ["Enter / Space", "Look at a thing, or take a portal"],
  ["+ / −", "Zoom within the scene"],
  ["Arrow keys", "Pan when zoomed in"],
  ["[ / ]", "Previous / next portal"],
  ["L", "Scientist lens (from chapter 2)"],
  ["N", "Field notebook"],
  ["G", "Glossary"],
  ["?", "This help"],
  ["Esc", "Close the open panel, or go up a scale"],
];

export function Help({ onClose, onGlossary }: { onClose: () => void; onGlossary: () => void }) {
  return (
    <Dialog title="How to explore" onClose={onClose}>
      <p className="lede">
        Every chapter is a place with an experiment. Predict first, then look, then explain. Your notebook
        keeps what you find; there are no points.
      </p>
      <table className="keys">
        <tbody>
          {KEYS.map(([k, v]) => (
            <tr key={k}>
              <th scope="row">
                {k.split(" / ").map((x, i) => (
                  <span key={x}>
                    {i > 0 && " / "}
                    <Kbd>{x}</Kbd>
                  </span>
                ))}
              </th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="btn" onClick={onGlossary}>
        Open the glossary
      </button>
      <p className="small muted">
        Add <span className="mono">?static=1</span> to the address for still pictures with the same buttons.
      </p>
    </Dialog>
  );
}

export function Settings({
  save,
  persistent,
  tooSlow,
  onMotion,
  onReplace,
  onReset,
  onUnlockAll,
  beats,
  onBeats,
  onClose,
}: {
  save: Save;
  persistent: boolean;
  tooSlow: boolean;
  onMotion: (m: Motion) => void;
  onReplace: (s: Save) => void;
  onReset: () => void;
  /** Internal profile only: the in-app twin of `?unlock`. */
  onUnlockAll?: (() => void) | undefined;
  /** Internal profile only: the in-app twin of `?beats`; undefined hides the switch. */
  beats?: boolean | undefined;
  onBeats: (on: boolean) => void;
  onClose: () => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportSave(save)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "terrikus-notebook.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Dialog title="Settings" onClose={onClose}>
      <section className="settings-card" aria-labelledby="settings-progress">
        <h3 id="settings-progress" className="settings-group">
          Progress
        </h3>
        <div className="setting">
          <span className="setting-text">
            <b>Keep a copy</b>
            <small>
              {persistent
                ? "Progress is saved in this browser only. Export it to move it or keep a copy."
                : "This browser is not keeping progress (private window or blocked storage). Export before you leave."}
            </small>
          </span>
          <span className="setting-control">
            <button type="button" className="btn" onClick={download}>
              Export
            </button>
            <button type="button" className="btn" onClick={() => file.current?.click()}>
              Import
            </button>
          </span>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                onReplace(importSave(await f.text()));
                setMsg("Notebook imported.");
              } catch {
                setMsg("That file is not a Terrikus notebook.");
              }
            }}
          />
        </div>
        {onUnlockAll && (
          <div className="setting">
            <span className="setting-text">
              <b>Review</b>
              <small>Open every built chapter, for reviewers.</small>
            </span>
            <button
              type="button"
              className="btn"
              onClick={() => {
                onUnlockAll();
                setMsg("Every built chapter is open.");
              }}
            >
              Open every chapter
            </button>
          </div>
        )}
        <div className="setting">
          <span className="setting-text">
            <b>Start over</b>
            <small>{confirm ? "This clears your notebook in this browser." : "Erase all progress."}</small>
          </span>
          {!confirm ? (
            <button type="button" className="btn" onClick={() => setConfirm(true)}>
              Erase progress…
            </button>
          ) : (
            <span className="setting-control">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onReset();
                  setConfirm(false);
                  setMsg("Progress erased.");
                }}
              >
                Erase
              </button>
              <button type="button" className="btn" onClick={() => setConfirm(false)}>
                Keep it
              </button>
            </span>
          )}
        </div>
        {msg && (
          <p className="small" role="status">
            {msg}
          </p>
        )}
      </section>
      <section className="settings-card" aria-labelledby="settings-motion">
        <h3 id="settings-motion" className="settings-group">
          Motion
        </h3>
        <div className="setting">
          <span className="setting-text">
            <b id="motion-title">Motion</b>
            <small>How much the camera and the world move.</small>
          </span>
          <div className="segmented" role="radiogroup" aria-labelledby="motion-title">
            {(
              [
                ["system", "Follow my system"],
                ["reduced", "Reduced"],
                ["full", "Full"],
              ] as const
            ).map(([v, label]) => (
              <label key={v}>
                <input
                  type="radio"
                  name="motion"
                  checked={save.settings.motion === v}
                  onChange={() => onMotion(v)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <AmbientToggle />
        {tooSlow && (
          <p className="small muted">
            Still pictures were chosen because this device drew the moving world too slowly.
          </p>
        )}
      </section>
      <section className="settings-card" aria-labelledby="settings-audio">
        <h3 id="settings-audio" className="settings-group">
          Audio
        </h3>
        <SoundSettings />
        {beats !== undefined && (
          <label className="setting">
            <span className="setting-text">
              <b>Music pads</b>
              <small>Show the beats overlay and its Launchpad connection.</small>
            </span>
            <input
              type="checkbox"
              className="switch"
              checked={beats}
              onChange={(e) => onBeats(e.target.checked)}
            />
          </label>
        )}
      </section>
      <PilotSettings chaptersComplete={save.chaptersComplete.length} />
      <Credits />
    </Dialog>
  );
}
