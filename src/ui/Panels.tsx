/** Settings, help and the "what is real here?" panel. */
import { useRef, useState } from "react";
import type { Scene } from "../content/schema";
import { exportSave, importSave } from "../save/storage";
import type { Motion, Save } from "../save/schema";
import { Dialog, Kbd, LangToggle, tr } from "./common";
import { AmbientToggle } from "./Ambient";
import { Credits } from "./Credits";
import { PilotSettings } from "./Pilot";
import { t, tl } from "../i18n";
import { SoundSettings } from "./Sound";

export function Truth({ scene, onClose }: { scene: Scene; onClose: () => void }) {
  const rows: [string, string[]][] = [
    [t("Drawn from real things"), scene.truth.drawnFrom],
    [t("Schematic"), scene.truth.schematic],
    [t("Invented for the game"), scene.truth.invented],
    [t("Not simulated here"), scene.truth.notSimulated],
  ];
  return (
    <Dialog title={t("About this picture")} onClose={onClose}>
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
        {t("Scale bar: {label}.", { label: scene.scaleBar.label })}
        {scene.notToScale ? t(" Cells are drawn {n}× true size.", { n: scene.notToScale }) : ""}
      </p>
    </Dialog>
  );
}

export const KEYS: [string, string][] = [
  ["Tab / Shift-Tab", tl("Move through everything in the scene")],
  ["Enter / Space", tl("Look at a thing, or take a portal")],
  ["+ / −", tl("Zoom within the scene")],
  ["Arrow keys", tl("Pan when zoomed in")],
  ["[ / ]", tl("Previous / next portal")],
  ["L", tl("Scientist lens (from chapter 2)")],
  ["N", tl("Field notebook")],
  ["G", tl("Glossary")],
  ["?", tl("This help")],
  ["Esc", tl("Close the open panel, or go up a scale")],
];

export function Help({ onClose, onGlossary }: { onClose: () => void; onGlossary: () => void }) {
  return (
    <Dialog title={t("How to explore")} onClose={onClose}>
      <p className="lede">
        {t(
          "Every chapter is a place with an experiment. Predict first, then look, then explain. Your notebook keeps what you find; there are no points.",
        )}
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
              <td>{t(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="btn" onClick={onGlossary}>
        {t("Open the glossary")}
      </button>
      <p className="small muted">
        {tr("Add {code} to the address for still pictures with the same buttons.", {
          code: <span className="mono">?static=1</span>,
        })}
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
    <Dialog title={t("Settings")} onClose={onClose}>
      <section className="settings-card" aria-labelledby="settings-language">
        <h3 id="settings-language" className="settings-group">
          {t("Language")}
        </h3>
        <div className="setting">
          <span className="setting-text">
            <b>{t("Language")}</b>
            <small>{t("Switching reloads the page. Your notebook stays.")}</small>
          </span>
          <LangToggle />
        </div>
      </section>
      <section className="settings-card" aria-labelledby="settings-progress">
        <h3 id="settings-progress" className="settings-group">
          {t("Progress")}
        </h3>
        <div className="setting">
          <span className="setting-text">
            <b>{t("Keep a copy")}</b>
            <small>
              {persistent
                ? t("Progress is saved in this browser only. Export it to move it or keep a copy.")
                : t(
                    "This browser is not keeping progress (private window or blocked storage). Export before you leave.",
                  )}
            </small>
          </span>
          <span className="setting-control">
            <button type="button" className="btn" onClick={download}>
              {t("Export")}
            </button>
            <button type="button" className="btn" onClick={() => file.current?.click()}>
              {t("Import")}
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
                setMsg(t("Notebook imported."));
              } catch {
                setMsg(t("That file is not a Terrikus notebook."));
              }
            }}
          />
        </div>
        {onUnlockAll && (
          <div className="setting">
            <span className="setting-text">
              <b>{t("Review")}</b>
              <small>{t("Open every built chapter, for reviewers.")}</small>
            </span>
            <button
              type="button"
              className="btn"
              onClick={() => {
                onUnlockAll();
                setMsg(t("Every built chapter is open."));
              }}
            >
              {t("Open every chapter")}
            </button>
          </div>
        )}
        <div className="setting">
          <span className="setting-text">
            <b>{t("Start over")}</b>
            <small>
              {confirm ? t("This clears your notebook in this browser.") : t("Erase all progress.")}
            </small>
          </span>
          {!confirm ? (
            <button type="button" className="btn" onClick={() => setConfirm(true)}>
              {t("Erase progress…")}
            </button>
          ) : (
            <span className="setting-control">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onReset();
                  setConfirm(false);
                  setMsg(t("Progress erased."));
                }}
              >
                {t("Erase")}
              </button>
              <button type="button" className="btn" onClick={() => setConfirm(false)}>
                {t("Keep it")}
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
          {t("Motion")}
        </h3>
        <div className="setting">
          <span className="setting-text">
            <b id="motion-title">{t("Motion")}</b>
            <small>{t("How much the camera and the world move.")}</small>
          </span>
          <div className="segmented" role="radiogroup" aria-labelledby="motion-title">
            {(
              [
                ["system", t("Follow my system")],
                ["reduced", t("Reduced")],
                ["full", t("Full")],
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
            {t("Still pictures were chosen because this device drew the moving world too slowly.")}
          </p>
        )}
      </section>
      <section className="settings-card" aria-labelledby="settings-audio">
        <h3 id="settings-audio" className="settings-group">
          {t("Audio")}
        </h3>
        <SoundSettings />
        {beats !== undefined && (
          <label className="setting">
            <span className="setting-text">
              <b>{t("Music pads")}</b>
              <small>{t("Show the beats overlay and its Launchpad connection.")}</small>
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
