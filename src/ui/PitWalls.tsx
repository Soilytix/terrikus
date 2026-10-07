/**
 * Chapter 11 pit benches in the mission panel, on the rules in
 * `src/sim/pedogenesis.ts` and `src/sim/catena.ts`: read the wall (c11-m1),
 * the pedogenesis time-lapse and make a podzol (c11-m2), the catena and the
 * detective pit (c11-m3), and formation against erosion (c11-m4). The
 * time-lapse plays baked frames; reduced motion steps through them instead.
 */
import { useEffect, useRef, useState } from "react";
import type { Step, Timelapse } from "../content/schema";
import { CATENA, DETECTIVE, redox, type Redox } from "../sim/catena";
import {
  CLIMATES,
  DEPTH_CM,
  EROSION_FACTORS,
  FORMATION_RATES,
  LITTERS,
  PARENTS,
  TIMELAPSE_YEARS,
  profileAt,
  thickness,
  yearsPerCm,
  type Factors,
  type Horizon,
  type HorizonId,
} from "../sim/pedogenesis";
import { loadManifest, plateUrl } from "../world/baked";
import { Facts } from "./common";

type PitStep = Extract<Step, { kind: "pit" }>;
type Props = { step: PitStep; reduced: boolean; onDone: () => void };

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      Teaching model: direction, not prediction.
    </p>
  );
}

function Result({ step, onDone }: { step: PitStep; onDone: () => void }) {
  return (
    <>
      <p className="observation">{step.resultText}</p>
      <Facts facts={step.facts} />
      <button type="button" className="btn btn-primary" onClick={onDone}>
        Continue
      </button>
    </>
  );
}

const range = (h: { top: number; bottom: number }) => `${h.top}–${h.bottom} cm`;

/** A profile as a column with a depth rail in cm; redox draws grey from `greyFrom` and rust mottles. */
function Column({
  horizons,
  rx = {},
  waterTable,
  label,
  picked,
}: {
  horizons: Horizon[];
  rx?: Redox;
  waterTable?: [number, number];
  label: string;
  picked?: HorizonId | null;
}) {
  const y = (cm: number) => 5 + cm;
  const mottles = rx.mottles
    ? Array.from({ length: Math.round((rx.mottles[1] - rx.mottles[0]) / 3) }, (_, k) => ({
        x: 20 + (((k * 7919) % 97) / 97) * 34,
        y: y(rx.mottles![0] + (((k * 104729) % 89) / 89) * (rx.mottles![1] - rx.mottles![0])),
      }))
    : [];
  return (
    <svg className="pit-column" viewBox="0 0 60 130" role="img" aria-label={label}>
      {horizons.map((h) => (
        <rect
          key={h.id}
          x="18"
          y={y(h.top)}
          width="38"
          height={h.bottom - h.top}
          data-c={h.colour}
          data-picked={picked === h.id}
        />
      ))}
      {rx.greyFrom !== undefined && (
        <rect x="18" y={y(rx.greyFrom)} width="38" height={DEPTH_CM - rx.greyFrom} className="gley" />
      )}
      {mottles.map((m, k) => (
        <circle key={k} cx={m.x} cy={m.y} r="1.6" className="mottle" />
      ))}
      {waterTable
        ?.filter((d) => d < DEPTH_CM)
        .map((d) => (
          <line key={d} x1="16" x2="58" y1={y(d)} y2={y(d)} className="water-table" />
        ))}
      {[0, 20, 40, 60, 80, 100, 120].map((d) => (
        <g key={d} className="rail">
          <line x1="12" x2="16" y1={y(d)} y2={y(d)} />
          <text x="11" y={y(d) + 1.5} textAnchor="end">
            {d}
          </text>
        </g>
      ))}
    </svg>
  );
}

const MASTER: { id: string; label: string }[] = [
  { id: "O", label: "O: litter" },
  { id: "A", label: "A: dark topsoil" },
  { id: "E", label: "E: bleached" },
  { id: "B", label: "B: accumulation or weathering" },
  { id: "C", label: "C: parent material" },
];
const master = (id: HorizonId) => id.charAt(0);

/** c11-m1: tap a layer, guess its horizon, then see its name and the evidence. */
function ReadWall({ step, onDone }: Props) {
  const wall = profileAt(CATENA[0]!.factors);
  const [at, setAt] = useState<HorizonId | null>(null);
  const [guesses, setGuesses] = useState<Partial<Record<HorizonId, string>>>({});
  const all = wall.every((h) => guesses[h.id]);
  const here = wall.find((h) => h.id === at);
  return (
    <>
      <div className="pit-read">
        <Column horizons={wall} label="The woodland pit wall, 0 to 120 cm" picked={at} />
        <div className="choices">
          {wall.map((h) => (
            <button
              key={h.id}
              type="button"
              className="choice"
              aria-pressed={at === h.id}
              onClick={() => setAt(h.id)}
            >
              Layer at {range(h)}
              {guesses[h.id] && <b>: {step.horizons?.[h.id]?.name}</b>}
            </button>
          ))}
        </div>
      </div>
      {here && !guesses[here.id] && (
        <>
          <p className="step-text">What is the layer at {range(here)}?</p>
          <div className="choices">
            {MASTER.map((m) => (
              <button
                key={m.id}
                type="button"
                className="choice"
                onClick={() => setGuesses({ ...guesses, [here.id]: m.id })}
              >
                {m.label}
              </button>
            ))}
          </div>
        </>
      )}
      {here && guesses[here.id] && (
        <p className="observation" aria-live="polite">
          You said {guesses[here.id]}
          {guesses[here.id] === master(here.id) ? ", and it is." : "."}{" "}
          <b>{step.horizons?.[here.id]?.name}.</b> {step.horizons?.[here.id]?.evidence}
        </p>
      )}
      {all ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">Read every layer to continue.</p>
      )}
    </>
  );
}

/** The time-lapse as it stands at `frame`; the compression label is outside every condition. */
export function TimelapseView({
  tl,
  frame,
  srcs,
  playing,
}: {
  tl: Timelapse;
  frame: number;
  srcs: string[];
  playing: boolean;
}) {
  return (
    <figure className="timelapse" data-playing={playing}>
      <p className="timelapse-label">{tl.compression}</p>
      <div className="timelapse-frames">
        {srcs.map((src, i) => (
          <img key={src} src={src} alt="" data-on={i === frame} />
        ))}
      </div>
      <figcaption className="mono" aria-live="polite">
        {tl.frames[frame]!.label}
      </figcaption>
    </figure>
  );
}

const FRAME_MS = 3000;
const [TL_W, TL_H] = [480, 600];

/** c11-m2: watch the woodland pit form; plays on its own, or steps under reduced motion. */
function TimelapseBench({ step, reduced, onDone }: Props) {
  const tl = step.timelapse!;
  const [srcs, setSrcs] = useState<string[]>([]);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [seen, setSeen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const last = tl.frames.length - 1;
  useEffect(() => {
    let live = true;
    void (async () => {
      const baked = (await loadManifest())?.timelapses[tl.id];
      if (baked) return live && setSrcs(baked.frames.map((f) => plateUrl(f.file)));
      const { composeStatic, paint } = await import("../world/painter");
      const urls = tl.frames.map(
        (f) =>
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(composeStatic(paint(f.recipe, f.seed, TL_W, TL_H)))}`,
      );
      if (live) setSrcs(urls);
    })();
    return () => {
      live = false;
    };
  }, [tl]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const show = (k: number) => {
    setFrame(k);
    if (k === last) setSeen(true);
  };
  const play = () => {
    setPlaying(true);
    const tick = (k: number) => {
      show(k);
      timer.current = window.setTimeout(() => (k < last ? tick(k + 1) : setPlaying(false)), FRAME_MS);
    };
    tick(0);
  };
  return (
    <>
      <Banner />
      <TimelapseView tl={tl} frame={frame} srcs={srcs} playing={playing} />
      <div className="pit-row">
        {!reduced && (
          <button type="button" className="btn" onClick={play} disabled={playing}>
            {seen ? "Play again" : "Play"}
          </button>
        )}
        <button
          type="button"
          className="btn"
          onClick={() => show(frame - 1)}
          disabled={playing || frame === 0}
        >
          Earlier
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => show(frame + 1)}
          disabled={playing || frame === last}
        >
          Later
        </button>
      </div>
      {seen && !playing && <Result step={step} onDone={onDone} />}
    </>
  );
}

const CLIMATE_LABEL = { "cold-wet": "Cold and wet", temperate: "Temperate", "warm-dry": "Warm and dry" };
const LITTER_LABEL = { conifer: "Conifer needles", broadleaf: "Broadleaf leaves", grass: "Grass" };
const PARENT_LABEL = { sand: "Sand", loam: "Loam", clay: "Clay" };

function Segmented<T extends string | number>({
  legend,
  name,
  options,
  value,
  label,
  onChange,
}: {
  legend: string;
  name: string;
  options: readonly T[];
  value: T;
  label: (v: T) => string;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="segmented">
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o}>
          <input type="radio" name={name} checked={value === o} onChange={() => onChange(o)} />
          <span>{label(o)}</span>
        </label>
      ))}
    </fieldset>
  );
}

/** c11-m2: choose the factors; a pale E over a rusty B needs all of them. */
function Podzol({ step, onDone }: Props) {
  const [f, setF] = useState<Factors>({
    climate: "temperate",
    litter: "broadleaf",
    parent: "loam",
    years: 1_000,
  });
  const [made, setMade] = useState(false);
  const p = profileAt(f);
  const e = thickness(p, "E");
  const b = thickness(p, "Bs");
  const set = (x: Partial<Factors>) => {
    const next = { ...f, ...x };
    setF(next);
    if (thickness(profileAt(next), "E") > 0) setMade(true);
  };
  return (
    <>
      <Banner />
      <Segmented
        legend="Climate"
        name="c11-climate"
        options={CLIMATES}
        value={f.climate}
        label={(v) => CLIMATE_LABEL[v]}
        onChange={(climate) => set({ climate })}
      />
      <Segmented
        legend="Litter"
        name="c11-litter"
        options={LITTERS}
        value={f.litter}
        label={(v) => LITTER_LABEL[v]}
        onChange={(litter) => set({ litter })}
      />
      <Segmented
        legend="Parent material"
        name="c11-parent"
        options={PARENTS}
        value={f.parent}
        label={(v) => PARENT_LABEL[v]}
        onChange={(parent) => set({ parent })}
      />
      <Segmented
        legend="Time"
        name="c11-years"
        options={TIMELAPSE_YEARS}
        value={f.years as (typeof TIMELAPSE_YEARS)[number]}
        label={(v) => `${v.toLocaleString("en")} years`}
        onChange={(years) => set({ years })}
      />
      <div className="pit-read">
        <Column horizons={p} label={`Profile: ${p.map((h) => `${h.id} ${range(h)}`).join(", ")}`} />
        <p className="observation" aria-live="polite">
          <span className="tier" data-tier="derived">
            derived
          </span>{" "}
          {e > 0
            ? `A pale E ${e} cm thick over a rusty B ${b} cm thick.`
            : `No E: ${p.map((h) => h.id).join(", ")}.`}
        </p>
      </div>
      {made ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">Make a pale E to continue.</p>
      )}
    </>
  );
}

const POSITION = { summit: "Summit, woodland", midslope: "Mid-slope, field", toeslope: "Toeslope, paddy" };

/** c11-m3: three pits down one hill under one climate. */
function Catena({ step, onDone }: Props) {
  return (
    <>
      <Banner />
      <div className="pit-columns">
        {CATENA.map((pit) => {
          const p = profileAt(pit.factors);
          return (
            <figure key={pit.id}>
              <Column
                horizons={p}
                rx={redox(pit)}
                waterTable={pit.waterTable}
                label={`${POSITION[pit.id]}: ${p.map((h) => h.id).join(", ")}`}
              />
              <figcaption>
                <b>{POSITION[pit.id]}</b>
                <br />
                <span className="small">WRB example: {step.examples?.[pit.id]}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <p className="muted small">
        Blue lines: the water table in the wet and the dry season. Soil names are examples of what such pits
        often resemble, not survey results.
      </p>
      <Result step={step} onDone={onDone} />
    </>
  );
}

/** c11-m3: the pit beside the ditch, as measured. */
function Detective({ step, onDone }: Props) {
  return (
    <>
      <div className="pit-read">
        <Column
          horizons={profileAt(CATENA[1]!.factors)}
          rx={DETECTIVE}
          label="The pit beside the ditch: rust mottles from 35 to 70 cm, grey below 70 cm"
        />
        <p className="observation">
          <span className="tier" data-tier="measured">
            measured
          </span>{" "}
          {step.resultText}
        </p>
      </div>
      <Facts facts={step.facts} />
      <button type="button" className="btn btn-primary" onClick={onDone}>
        Continue
      </button>
    </>
  );
}

/** c11-m4: formation from the measured range against plough erosion. */
function Rates({ step, onDone }: Props) {
  const [rate, setRate] = useState<number>(FORMATION_RATES[1]);
  const [factor, setFactor] = useState<number>(EROSION_FACTORS[0]);
  const [ran, setRan] = useState(false);
  const form = yearsPerCm(rate);
  const lose = Math.round(form / factor);
  return (
    <>
      <Banner />
      <Segmented
        legend="Formation, t per hectare a year"
        name="c11-rate"
        options={FORMATION_RATES}
        value={rate as (typeof FORMATION_RATES)[number]}
        label={(v) => `${v}`}
        onChange={setRate}
      />
      <Segmented
        legend="Plough erosion, times faster"
        name="c11-erosion"
        options={EROSION_FACTORS}
        value={factor as (typeof EROSION_FACTORS)[number]}
        label={(v) => `${v}×`}
        onChange={setFactor}
      />
      {!ran ? (
        <button type="button" className="btn btn-primary" onClick={() => setRan(true)}>
          Work it out
        </button>
      ) : (
        <>
          <p className="observation" aria-live="polite">
            <span className="tier" data-tier="derived">
              derived
            </span>{" "}
            One centimetre forms in about <b className="mono">{form.toLocaleString("en")} years</b>, and
            plough erosion removes it in about <b className="mono">{lose.toLocaleString("en")} years</b>.{" "}
            <span className="mono small">100 × 1.3 t ÷ {rate} t/yr</span>
          </p>
          <div className="rate-bars" aria-hidden="true">
            <span style={{ width: `${(form / yearsPerCm(FORMATION_RATES[0])) * 100}%` }} className="form" />
            <span style={{ width: `${(lose / yearsPerCm(FORMATION_RATES[0])) * 100}%` }} className="lose" />
          </div>
          <Result step={step} onDone={onDone} />
        </>
      )}
    </>
  );
}

export function PitWalls(props: Props) {
  switch (props.step.bench) {
    case "read-wall":
      return <ReadWall {...props} />;
    case "timelapse":
      return <TimelapseBench {...props} />;
    case "podzol":
      return <Podzol {...props} />;
    case "catena":
      return <Catena {...props} />;
    case "detective":
      return <Detective {...props} />;
    case "rates":
      return <Rates {...props} />;
  }
}
