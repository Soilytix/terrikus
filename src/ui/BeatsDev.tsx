/**
 * Dev-only beats surface (`?beats` in the URL): the soil-beats pad overlay and an
 * optional Launchpad Mini MK3 over Web MIDI. Learners never see it; the music
 * itself plays for everyone through the mixer.
 */
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { mixer } from "../audio/mixer";
import type { Bar } from "../audio/music/composer";
import type { Music } from "../audio/music/engine";
import { BASSES, KEYS, KITS, LEADS, type Mood } from "../audio/music/presets";
import { Launchpad } from "../audio/music/launchpad";
import { frame, glyph, press, title, type Press } from "../audio/music/surface";
import { LAUNCHPAD } from "../styles/launchpad";
import { t } from "../i18n";

const PADS: Press[] = [
  ...Array.from({ length: 8 }, (_, col) => ({ kind: "top", col }) as const),
  ...Array.from({ length: 8 }, (_, row) => [
    ...Array.from({ length: 8 }, (_, col) => ({ kind: "grid", row, col }) as const),
    { kind: "side", row } as const,
  ]).flat(),
];

type Scalar =
  | "drums"
  | "lead"
  | "birds"
  | "drops"
  | "clicks"
  | "reverb"
  | "crush"
  | "wow"
  | "delay"
  | "muffle"
  | "register";
const SCALARS: [Scalar, number, number, number][] = [
  ["drums", 0, 1, 0.05],
  ["lead", 0, 1, 0.05],
  ["birds", 0, 1, 0.05],
  ["drops", 0, 1, 0.05],
  ["clicks", 0, 1, 0.05],
  ["reverb", 0, 1, 0.02],
  ["crush", 0, 1, 0.05],
  ["wow", 0, 1, 0.05],
  ["delay", 0, 1, 0.05],
  ["muffle", 300, 16000, 100],
  ["register", -12, 12, 1],
];
type Family = "keys" | "leads" | "bass" | "kit";
const FAMILIES: [Family, readonly string[]][] = [
  ["keys", KEYS],
  ["leads", LEADS],
  ["bass", BASSES],
  ["kit", KITS],
];

/** The synth tab: the mood the music is playing now, each field settable over the preset. */
function Synth({ music, redraw }: { music: Music; redraw: () => void }) {
  const now = music.composer.mood;
  const set = (patch: Partial<Mood>) => {
    Object.assign(music.over.mood, patch);
    // The bar scheduler reads overrides once per bar; mirror into the playing mood so sliders track.
    Object.assign(now, patch);
    redraw();
  };
  const row = (
    label: string,
    v: number,
    min: number,
    max: number,
    step: number,
    on: (x: number) => void,
    own: boolean,
  ) => (
    <label key={label} className="beats-dev-slider" data-own={own}>
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => on(Number(e.target.value))}
      />
      <span>{Math.abs(v) >= 100 ? Math.round(v) : v.toFixed(2)}</span>
    </label>
  );
  return (
    <div className="beats-dev-synth">
      {SCALARS.map(([k, min, max, step]) =>
        row(k, now[k], min, max, step, (x) => set({ [k]: x }), k in music.over.mood),
      )}
      {FAMILIES.map(([f, voices]) => (
        <fieldset key={f}>
          <legend>{f}</legend>
          {voices.map((v) => {
            const w = now[f] as Record<string, number>;
            return row(v, w[v] ?? 0, 0, 1, 0.05, (x) => set({ [f]: { ...w, [v]: x } }), f in music.over.mood);
          })}
        </fieldset>
      ))}
      <button
        type="button"
        className="btn"
        onClick={() => {
          music.over.mood = {};
          redraw();
        }}
      >
        {t("Back to the preset")}
      </button>
    </div>
  );
}

export default function BeatsDev() {
  const [music, setMusic] = useState<Music | null>(mixer.music());
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  const [info, setInfo] = useState<Bar | null>(null);
  const [midi, setMidi] = useState("");
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<"pads" | "synth">("pads");
  const [hover, setHover] = useState("");
  const step = useRef(-1);
  const flash = useRef<{ row: number; col: number } | null>(null);

  useEffect(() => {
    if (music) return;
    const timer = window.setInterval(() => setMusic(mixer.music()), 500);
    return () => window.clearInterval(timer);
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
      {open && music && (
        <span className="beats-dev-tabs" role="tablist">
          {(["pads", "synth"] as const).map((id) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
              {id}
            </button>
          ))}
        </span>
      )}
      {open &&
        (!music ? (
          <p>
            {t("Music starts with sound: click anywhere, and check Settings → Sound and background motion.")}
          </p>
        ) : tab === "synth" ? (
          <Synth music={music} redraw={redraw} />
        ) : (
          <>
            <div className="beats-dev-surface" onPointerLeave={() => setHover("")}>
              {PADS.map((p, i) => [
                <button
                  key={i}
                  type="button"
                  className={p.kind === "grid" ? "pad" : "pad round"}
                  title={title(p)}
                  aria-label={title(p)}
                  style={{ background: LAUNCHPAD[colour(p)] }}
                  onPointerDown={() => onPress.current(p)}
                  onPointerEnter={() => setHover(title(p))}
                  onFocus={() => setHover(title(p))}
                >
                  {glyph(p, music.playing)}
                </button>,
                // The top row has no side button: a gap keeps the 9-column grid square.
                i === 7 && <span key="gap" />,
              ])}
            </div>
            <p className="beats-dev-hint">{hover || t("hover a pad")}</p>
            <p className="beats-dev-status">
              {music.scene.id} · {music.scene.scale} · {pr?.time}
              {pr?.rain ? ` · rain ${pr.rain}` : ""} · {pr?.style} · {pr?.shape.mode}/{pr?.shape.groove}
              <br />
              {info
                ? `bar ${info.bar + 1} · ${info.key} · ${info.chord} · ${Math.round(info.bpm)} bpm${info.breakdown ? " · breakdown" : ""}`
                : t("waiting for the first bar")}
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
              {t("Connect Launchpad")}
            </button>{" "}
            <span className="small">{midi}</span>
          </>
        ))}
    </aside>
  );
}
