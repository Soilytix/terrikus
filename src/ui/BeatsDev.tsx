/**
 * Dev-only beats surface (`?beats` in the URL): the soil-beats pad overlay and an
 * optional Launchpad Mini MK3 over Web MIDI. Learners never see it; the music
 * itself plays for everyone through the mixer.
 */
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { mixer } from "../audio/mixer";
import type { Bar } from "../audio/music/composer";
import type { Music } from "../audio/music/engine";
import { Launchpad } from "../audio/music/launchpad";
import { frame, press, title, type Press } from "../audio/music/surface";
import { LAUNCHPAD } from "../styles/launchpad";

const PADS: Press[] = [
  ...Array.from({ length: 8 }, (_, col) => ({ kind: "top", col }) as const),
  ...Array.from({ length: 8 }, (_, row) => [
    ...Array.from({ length: 8 }, (_, col) => ({ kind: "grid", row, col }) as const),
    { kind: "side", row } as const,
  ]).flat(),
];

export default function BeatsDev() {
  const [music, setMusic] = useState<Music | null>(mixer.music());
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  const [info, setInfo] = useState<Bar | null>(null);
  const [midi, setMidi] = useState("");
  const [open, setOpen] = useState(true);
  const step = useRef(-1);
  const flash = useRef<{ row: number; col: number } | null>(null);

  useEffect(() => {
    if (music) return;
    const t = window.setInterval(() => setMusic(mixer.music()), 500);
    return () => window.clearInterval(t);
  }, [music]);

  useEffect(() => {
    if (!music) return;
    const offs = [
      music.on("step", (s) => {
        step.current = s;
        redraw();
      }),
      music.on("bar", setInfo),
    ];
    return () => offs.forEach((f) => f());
  }, [music]);

  const onPress = useRef<(p: Press) => void>(() => undefined);
  onPress.current = (p) => {
    if (!music) return;
    const toggle = () =>
      music.playing ? music.stop() : music.setScene(music.scene.id, music.scene.scale, true);
    if (press(music, p, toggle) && p.kind === "grid") {
      flash.current = { row: p.row, col: p.col };
      window.setTimeout(() => ((flash.current = null), redraw()), 150);
    }
    redraw();
  };
  const pad = useMemo(() => new Launchpad((p) => onPress.current(p)), []);
  const f = music && frame(music, step.current, flash.current);
  useEffect(() => {
    if (f) pad.render(f);
  });

  const colour = (p: Press) =>
    !f ? 0 : p.kind === "top" ? f.top[p.col]! : p.kind === "side" ? f.side[p.row]! : f.grid[p.row]![p.col]!;
  const pr = music?.preset;

  return (
    <aside className="beats-dev" aria-label="Beats (dev)">
      <button type="button" className="beats-dev-head" onClick={() => setOpen(!open)}>
        beats · dev {open ? "▾" : "▸"}
      </button>
      {open &&
        (!music ? (
          <p>Music starts with sound: click anywhere, and check Settings → Sound and background motion.</p>
        ) : (
          <>
            <div className="beats-dev-surface">
              {PADS.map((p, i) => [
                <button
                  key={i}
                  type="button"
                  className={p.kind === "grid" ? "pad" : "pad round"}
                  title={title(p)}
                  style={{ background: LAUNCHPAD[colour(p)] }}
                  onPointerDown={() => onPress.current(p)}
                />,
                // The top row has no side button: a gap keeps the 9-column grid square.
                i === 7 && <span key="gap" />,
              ])}
            </div>
            <p className="beats-dev-status">
              {music.scene.id} · {music.scene.scale} · {pr?.time}
              {pr?.rain ? ` · rain ${pr.rain}` : ""} · {pr?.style} · {pr?.shape.mode}/{pr?.shape.groove}
              <br />
              {info
                ? `bar ${info.bar + 1} · ${info.key} · ${info.chord} · ${Math.round(info.bpm)} bpm${info.breakdown ? " · breakdown" : ""}`
                : "waiting for the first bar"}
              {music.over.keys ? ` · keys solo: ${music.over.keys}` : ""} · seed {music.composer.seed}
            </p>
            <pre className="beats-dev-log">{music.composer.log.slice().reverse().join("\n")}</pre>
            <button
              type="button"
              className="btn"
              onClick={() =>
                pad.connect().then(
                  (name) => setMidi(`connected: ${name}`),
                  (e: Error) => setMidi(`MIDI: ${e.message}`),
                )
              }
            >
              Connect Launchpad
            </button>{" "}
            <span className="small">{midi}</span>
          </>
        ))}
    </aside>
  );
}
