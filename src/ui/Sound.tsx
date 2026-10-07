/** Sound (T32): the settings line and the caption strip that shows every sound as text while it plays. */
import { useEffect, useState } from "react";
import { useGame } from "../app/store";
import { CUES, mixer, type CueId } from "../audio/mixer";
import type { Scale } from "../content/schema";
import type { Save } from "../save/schema";

const CUE_MS = 4000;
const count = (s: Save): Record<CueId, number> => ({
  scan: s.scanned.length,
  card: Object.keys(s.cards).length,
  stamp: s.stamps.length,
  chapter: s.chaptersComplete.length,
});

export function SoundSettings() {
  const sound = useGame((g) => g.save.settings.sound);
  const update = useGame((g) => g.update);
  // The open dialog hides the caption strip behind its backdrop, so captions repeat here.
  const [last, setLast] = useState<string | null>(null);
  useEffect(() => mixer.subscribe((c) => c.kind === "cue" && setLast(c.text)), []);
  return (
    <section aria-labelledby="sound-title">
      <h3 id="sound-title">Sound</h3>
      <label className="ambient-toggle">
        <input
          type="checkbox"
          checked={sound}
          onChange={(e) => {
            const on = e.target.checked;
            // The AudioContext starts here, inside the learner's own click.
            if (on) mixer.enable();
            else mixer.disable();
            update((s) => ({ ...s, settings: { ...s.settings, sound: on } }));
          }}
        />
        <span>Play sounds (each one is shown as a caption)</span>
      </label>
      <table className="keys sound-cues">
        <tbody>
          {(Object.keys(CUES) as CueId[]).map((id) => (
            <tr key={id}>
              <td>{CUES[id].caption}</td>
              <td>
                <button type="button" className="btn" disabled={!sound} onClick={() => mixer.cue(id)}>
                  Play
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small" role="status">
        {sound && last}
      </p>
    </section>
  );
}

/** Mounted once in the shell: follows the scene's scale for ambience, fires event cues, shows captions. */
export function SoundCaptions({ scale, reduced }: { scale: Scale | null; reduced: boolean }) {
  const sound = useGame((g) => g.save.settings.sound);
  const ambient = useGame((g) => g.save.settings.ambient);
  const [bed, setBed] = useState<string | null>(null);
  const [cue, setCue] = useState<string | null>(null);

  useEffect(() => {
    let timer = 0;
    const off = mixer.subscribe((c) => {
      if (c.kind === "ambience") return setBed(c.text);
      setCue(c.text);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCue(null), CUE_MS);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);

  // A saved "on" waits for the first gesture of this visit: nothing autoplays.
  useEffect(() => {
    if (!sound) return mixer.disable();
    if (mixer.enabled()) return;
    const go = () => mixer.enable();
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
    return () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
    };
  }, [sound]);

  // The ambient toggle silences the bed as it stills the backdrop; reduced motion holds its swell still.
  useEffect(() => mixer.ambience(ambient ? scale : null, !reduced), [scale, ambient, reduced]);

  useEffect(
    () =>
      useGame.subscribe((g, prev) => {
        const now = count(g.save);
        const was = count(prev.save);
        const id = (["chapter", "stamp", "card", "scan"] as const).find((k) => now[k] > was[k]);
        if (id) mixer.cue(id);
      }),
    [],
  );

  return (
    <div className="sound-captions" aria-live="polite">
      {bed && <p className="sound-caption muted">{bed}</p>}
      {cue && <p className="sound-caption">{cue}</p>}
    </div>
  );
}
