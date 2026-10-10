/** Sound (T32): the settings line, and captions that announce every sound to screen readers while it plays. */
import { useEffect, useState } from "react";
import { useGame } from "../app/store";
import { mixer, type BedScene, type CueId } from "../audio/mixer";
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
    <>
      <label className="setting">
        <span className="setting-text">
          <b>Play sounds</b>
          <small>Music and short cues; each one is captioned for screen readers.</small>
        </span>
        <input
          type="checkbox"
          className="switch"
          checked={sound}
          onChange={(e) => {
            const on = e.target.checked;
            // The AudioContext starts here, inside the learner's own click.
            if (on) mixer.enable();
            else mixer.disable();
            update((s) => ({ ...s, settings: { ...s.settings, sound: on } }));
          }}
        />
      </label>
      <p className="small sr-only" role="status">
        {sound && last}
      </p>
    </>
  );
}

/** Mounted once in the shell: plays the scene's music, fires event cues, shows captions. */
export function SoundCaptions({ scene, reduced }: { scene: BedScene; reduced: boolean }) {
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

  // The ambient toggle silences the music as it stills the backdrop; reduced motion holds the tape wobble still.
  const { id, scale } = scene;
  useEffect(() => mixer.ambience(ambient ? { id, scale } : null, !reduced), [id, scale, ambient, reduced]);

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
    <div className="sound-captions sr-only" aria-live="polite">
      {bed && <p className="sound-caption">{bed}</p>}
      {cue && <p className="sound-caption">{cue}</p>}
    </div>
  );
}
