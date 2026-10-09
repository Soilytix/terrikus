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
    <Dialog title="What is real here?" onClose={onClose}>
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
  onClose,
}: {
  save: Save;
  persistent: boolean;
  tooSlow: boolean;
  onMotion: (m: Motion) => void;
  onReplace: (s: Save) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportSave(save)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "pedologicus-notebook.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Dialog title="Settings" onClose={onClose}>
      <fieldset className="segmented wide">
        <legend>Motion</legend>
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
      </fieldset>
      <AmbientToggle />
      <SoundSettings />
      {tooSlow && (
        <p className="small muted">
          Still pictures were chosen because this device drew the moving world too slowly.
        </p>
      )}
      <h3>Your notebook</h3>
      <p className="small">
        {persistent
          ? "Progress is saved in this browser only. Export it to move it or keep a copy."
          : "This browser is not keeping progress (private window or blocked storage). Export before you leave."}
      </p>
      <div className="btn-row">
        <button type="button" className="btn" onClick={download}>
          Export notebook
        </button>
        <button type="button" className="btn" onClick={() => file.current?.click()}>
          Import notebook
        </button>
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
              setMsg("That file is not a Pedologicus notebook.");
            }
          }}
        />
      </div>
      {msg && (
        <p className="small" role="status">
          {msg}
        </p>
      )}
      <h3>Start over</h3>
      {!confirm ? (
        <button type="button" className="btn" onClick={() => setConfirm(true)}>
          Erase progress…
        </button>
      ) : (
        <div className="btn-row">
          <span className="small">This clears your notebook in this browser.</span>
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
        </div>
      )}
      <PilotSettings chaptersComplete={save.chaptersComplete.length} />
      <Credits />
    </Dialog>
  );
}
