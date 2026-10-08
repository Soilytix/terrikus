/**
 * Chapter 13 benches in the mission panel, on the rules in `src/sim/hillslope.ts`:
 * rain on bare and covered soil (c13-m1), the storm that carries tagged soil
 * and its phosphorus to the river (c13-m2), thirty years of irrigation
 * (c13-m3), and the Sentinel-2 inset probed beside the painted valley (c13-m4).
 * The storm is a darkening wash timed by `src/ui/storm.ts`; reduced motion
 * skips straight to the end state.
 */
import "../styles/c13.css";
import { useEffect, useRef, useState } from "react";
import { assetUrl } from "../assets/urls";
import { C13_SATELLITE } from "../content/chapters/c13";
import type { Step } from "../content/schema";
import {
  COVER,
  CRUMBS,
  SALINE_EC,
  SODIC_ESP,
  TAGGED,
  YEARS,
  bloomed,
  boundShare,
  irrigate,
  splash,
  storm,
  valley,
  weeksLater,
  type Cover,
  type Drainage,
  type Rain,
  type SaltYear,
  type Strip,
  type Valley,
  type Watering,
} from "../sim/hillslope";
import { Facts } from "./common";
import { STORM, STORM_MS, phaseAt, washAt, type StormPhase } from "./storm";

type HillStep = Extract<Step, { kind: "hill" }>;
type Props = { step: HillStep; reduced: boolean; onDone: () => void };

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      Teaching model: direction, not prediction.
    </p>
  );
}

function Result({ step, onDone }: { step: HillStep; onDone: () => void }) {
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

function Segmented<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="segmented">
      <legend>{legend}</legend>
      {(Object.keys(options) as T[]).map((o) => (
        <label key={o}>
          <input type="radio" name={name} checked={value === o} onChange={() => onChange(o)} />
          <span>{options[o]}</span>
        </label>
      ))}
    </fieldset>
  );
}

const Derived = () => (
  <span className="tier" data-tier="derived">
    derived
  </span>
);
const pct = (n: number, of: number) => Math.round((n / of) * 100);

const COVER_LABEL: Record<Cover, string> = {
  bare: "Bare soil",
  thin: "Thin straw, 30 %",
  full: "Full straw, 70 %",
};
const RAIN_LABEL: Record<Rain, string> = { gentle: "Gentle", intense: "Intense" };

/** c13-m1: one storm on a hundred surface crumbs; loose ones jump out of the grid. */
function Splash({ step, onDone }: Props) {
  const [cover, setCover] = useState<Cover>("bare");
  const [rain, setRain] = useState<Rain>("intense");
  const [ran, setRan] = useState<{ cover: Cover; rain: Rain } | null>(null);
  const [tried, setTried] = useState<Set<string>>(new Set());
  const s = ran && splash(ran.cover, ran.rain);
  const done = tried.has("bare:intense") && [...tried].some((k) => !k.startsWith("bare"));
  const run = () => {
    setRan({ cover, rain });
    setTried(new Set([...tried, `${cover}:${rain}`]));
  };
  return (
    <>
      <Banner />
      <Segmented legend="Cover" name="c13-cover" options={COVER_LABEL} value={cover} onChange={setCover} />
      <Segmented legend="Rain" name="c13-rain" options={RAIN_LABEL} value={rain} onChange={setRain} />
      <button type="button" className="btn btn-primary" onClick={run}>
        Let the storm fall
      </button>
      {s && ran && (
        <>
          <svg
            className="c13-crumbs"
            viewBox="0 0 110 70"
            role="img"
            aria-label={`${s.loose} of ${CRUMBS} crumbs broke loose`}
          >
            {Array.from({ length: CRUMBS }, (_, i) => {
              // Seeded order, so the loose crumbs are scattered, not the first row.
              const loose = (i * 37) % CRUMBS < s.loose;
              const x = 10 + (i % 10) * 10;
              const y = 30 + Math.floor(i / 10) * 4;
              return (
                <circle
                  key={i}
                  cx={loose ? x + (((i * 13) % 7) - 3) : x}
                  cy={loose ? y - 8 - ((i * 7) % 14) : y}
                  r={loose ? 0.9 : 1.6}
                  className={loose ? "loose" : "crumb"}
                />
              );
            })}
            {COVER[ran.cover] > 0 &&
              Array.from({ length: Math.round(COVER[ran.cover] * 30) }, (_, k) => (
                <line
                  key={k}
                  x1={5 + ((k * 23) % 95)}
                  x2={13 + ((k * 23) % 95)}
                  y1={28 + ((k * 11) % 40) / 1.1}
                  y2={30 + ((k * 11) % 40) / 1.1}
                  className="straw"
                />
              ))}
          </svg>
          <p className="observation" aria-live="polite">
            <Derived /> {COVER_LABEL[ran.cover]}, {RAIN_LABEL[ran.rain].toLowerCase()} rain:{" "}
            <b className="mono">
              {s.loose} of {CRUMBS}
            </b>{" "}
            crumbs broke loose; about <b className="mono">{s.tPerHa} t per hectare</b> carried off, lowering
            the surface <b className="mono">{s.mm} mm</b>.{" "}
            <span className="mono small">mm = t ÷ (1.3 t/m³ × 10,000 m²) × 1,000</span>
          </p>
        </>
      )}
      {done ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">Run bare soil in intense rain, then a cover, to continue.</p>
      )}
    </>
  );
}

const STRIP_LABEL: Record<Strip, string> = { none: "No grass strip", strip: "Grass strip at the foot" };
const RAIN_LINES = Array.from({ length: 24 }, (_, k) => ({
  x: 8 + ((k * 41) % 190),
  y: 6 + ((k * 17) % 40),
}));

/** The valley in section: sky under the storm wash, the slope, the foot and the river. */
function StormView({
  t,
  phase,
  v,
  later,
  strip,
}: {
  t: number;
  phase: StormPhase;
  v: Valley | null;
  later: Valley | null;
  strip: Strip;
}) {
  // Rain fades in and out over 600 ms at the edges of its phase.
  const [rainFrom, rainTo] = [STORM[0]!.ms, STORM[0]!.ms + STORM[1]!.ms];
  const rain = phase === "raining" ? 0.7 * Math.min(1, (t - rainFrom) / 600, (rainTo - t) / 600) : 0;
  const plume = v ? Math.min(0.85, v.soil.river / 3_000) : 0;
  const deposit = v ? Math.min(0.9, v.soil.foot / 3_000) : 0;
  return (
    <svg
      className="c13-storm"
      viewBox="0 0 200 110"
      role="img"
      aria-label={`The hill in section during the storm: ${phase === "calm" ? "calm" : phase === "after" ? "the storm has passed" : `the sky ${phase}`}`}
    >
      <rect className="sky" x="0" y="0" width="200" height="110" />
      <path className="hill" d="M0,20 C40,22 70,40 100,72 C112,84 120,86 130,88 L200,90 L200,110 L0,110 Z" />
      <path className="fields" d="M30,26 C55,32 80,50 100,72 L104,76 C84,56 58,38 30,32 Z" />
      {strip === "strip" && (
        <path className="grass" d="M104,76 C110,82 118,85 126,87 L126,90 C116,88 108,85 102,80 Z" />
      )}
      <path
        className="deposit"
        style={{ opacity: deposit }}
        d="M106,80 C114,85 122,87 130,88 L130,90 C120,89 112,86 104,82 Z"
      />
      <path className="river" d="M140,89 L200,90 L200,96 L140,95 Z" />
      <path className="plume" style={{ opacity: plume }} d="M140,89 L200,90 L200,96 L140,95 Z" />
      <path
        className="algae"
        style={{ opacity: later && bloomed(later) ? 0.8 : 0 }}
        d="M160,90 L200,90.5 L200,95 L160,94.5 Z"
      />
      <g className="rain" style={{ opacity: rain }}>
        {RAIN_LINES.map((l, k) => (
          <line key={k} x1={l.x} y1={l.y} x2={l.x - 2} y2={l.y + 8} />
        ))}
      </g>
      <rect className="wash" x="0" y="0" width="200" height="110" style={{ opacity: washAt(t) }} />
    </svg>
  );
}

/** c13-m2: summon the storm, follow the tagged soil and its P, then wait weeks for the river. */
function StormBench({ step, reduced, onDone }: Props) {
  const [cover, setCover] = useState<Cover>("bare");
  const [strip, setStrip] = useState<Strip>("none");
  // Milliseconds since the storm was summoned, while it runs; the wash follows `washAt` frame by frame.
  const [t, setT] = useState<number | null>(null);
  const [v, setV] = useState<Valley | null>(null);
  const [later, setLater] = useState<Valley | null>(null);
  const [seen, setSeen] = useState(false);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const summon = () => {
    const after = storm(valley(), cover, strip);
    setLater(null);
    setV(null);
    if (reduced) return setV(after);
    const t0 = performance.now();
    const tick = (now: number) => {
      if (now - t0 >= STORM_MS) {
        setT(null);
        setV(after);
      } else {
        setT(Math.max(0, now - t0));
        frame.current = requestAnimationFrame(tick);
      }
    };
    frame.current = requestAnimationFrame(tick);
  };
  const phase: StormPhase = t === null ? (v ? "after" : "calm") : phaseAt(Math.max(1, t));
  const busy = t !== null;
  return (
    <>
      <Banner />
      <Segmented
        legend="Slope fields"
        name="c13-slope"
        options={COVER_LABEL}
        value={cover}
        onChange={setCover}
      />
      <Segmented
        legend="Foot of the slope"
        name="c13-strip"
        options={STRIP_LABEL}
        value={strip}
        onChange={setStrip}
      />
      <StormView t={t ?? 0} phase={phase} v={v} later={later} strip={strip} />
      <p className="muted small">
        The storm darkens the sky slowly and clears slowly: no lightning, no flashing.
      </p>
      <div className="pit-row">
        <button type="button" className="btn btn-primary" onClick={summon} disabled={busy}>
          {v ? "Summon another storm" : "Summon the storm"}
        </button>
        {v && !later && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setLater(weeksLater(v));
              setSeen(true);
            }}
          >
            Weeks later
          </button>
        )}
      </div>
      <p className="mono small" aria-live="polite">
        {busy ? `The storm: ${phase}` : ""}
      </p>
      {v && (
        <p className="observation" aria-live="polite">
          <Derived /> Of the tagged soil, <b className="mono">{pct(v.soil.slope, TAGGED)} %</b> stayed on the
          slope, <b className="mono">{pct(v.soil.foot, TAGGED)} %</b> stopped at the foot and{" "}
          <b className="mono">{pct(v.soil.river, TAGGED)} %</b> reached the river. Of the phosphorus that left
          the slope, <b className="mono">{boundShare(v)} %</b> rode on particles.
          {later &&
            (bloomed(later)
              ? " Weeks later, algae bloom where the muddy water entered the river."
              : " Weeks later the river is clear: too little phosphorus arrived for a bloom.")}
        </p>
      )}
      {seen && !busy ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">Summon a storm, then look again weeks later, to continue.</p>
      )}
    </>
  );
}

const DRAIN_LABEL: Record<Drainage, string> = { none: "No drains", drains: "Drains" };
const WATER_LABEL: Record<Watering, string> = { normal: "Normal water", extra: "Extra water" };
const EC_MAX = 40;

/** EC over thirty years for every run so far, with the saline line. */
function SaltChart({ runs }: { runs: [string, SaltYear[]][] }) {
  const x = (yr: number) => 30 + (yr / YEARS) * 260;
  const y = (ec: number) => 140 - (Math.min(ec, EC_MAX) / EC_MAX) * 130;
  return (
    <svg
      className="c13-salt-chart"
      viewBox="0 0 300 160"
      role="img"
      aria-label="Root-zone EC over thirty years"
    >
      <line className="axis" x1="30" x2="290" y1="140" y2="140" />
      <line className="axis" x1="30" x2="30" y1="10" y2="140" />
      {[0, 10, 20, 30, 40].map((e) => (
        <text key={e} x="26" y={y(e) + 2} textAnchor="end">
          {e}
        </text>
      ))}
      {[0, 10, 20, 30].map((yr) => (
        <text key={yr} x={x(yr)} y="152" textAnchor="middle">
          {yr}
        </text>
      ))}
      <line className="saline" x1="30" x2="290" y1={y(SALINE_EC)} y2={y(SALINE_EC)} />
      <text className="saline-label" x="288" y={y(SALINE_EC) - 2} textAnchor="end">
        saline above 4 dS/m
      </text>
      {runs.map(([key, run], k) => (
        <polyline
          key={key}
          className="run"
          data-k={k}
          data-drain={key.startsWith("drains")}
          points={run.map((r) => `${x(r.year)},${y(r.ec)}`).join(" ")}
        />
      ))}
    </svg>
  );
}

/** c13-m3: thirty years with and without drains, with normal and extra water. */
function Salt({ step, onDone }: Props) {
  const [drainage, setDrainage] = useState<Drainage>("none");
  const [watering, setWatering] = useState<Watering>("normal");
  const [runs, setRuns] = useState<Map<string, SaltYear[]>>(new Map());
  const [last, setLast] = useState<string | null>(null);
  const run = () => {
    const key = `${drainage}:${watering}`;
    setRuns(new Map(runs).set(key, irrigate(drainage, watering)));
    setLast(key);
  };
  const end = last ? runs.get(last)!.at(-1)! : null;
  const keys = [...runs.keys()];
  const done = keys.some((k) => k.startsWith("none")) && keys.some((k) => k.startsWith("drains"));
  const label = (k: string) => {
    const [d, w] = k.split(":") as [Drainage, Watering];
    return `${DRAIN_LABEL[d]}, ${WATER_LABEL[w].toLowerCase()}`;
  };
  return (
    <>
      <Banner />
      <Segmented
        legend="Drainage"
        name="c13-drain"
        options={DRAIN_LABEL}
        value={drainage}
        onChange={setDrainage}
      />
      <Segmented
        legend="Irrigation"
        name="c13-water"
        options={WATER_LABEL}
        value={watering}
        onChange={setWatering}
      />
      <button type="button" className="btn btn-primary" onClick={run}>
        Irrigate for {YEARS} years
      </button>
      {runs.size > 0 && (
        <>
          <SaltChart runs={[...runs]} />
          <ul className="c13-legend small">
            {keys.map((k, i) => (
              <li key={k} data-k={i} data-drain={k.startsWith("drains")}>
                {label(k)}
              </li>
            ))}
          </ul>
        </>
      )}
      {end && last && (
        <p className="observation" aria-live="polite">
          <Derived /> {label(last)}, year {YEARS}: EC<sub>e</sub> <b className="mono">{end.ec} dS/m</b>
          {end.ec > SALINE_EC ? " (saline)" : ""}, ESP <b className="mono">{end.esp}</b>
          {end.esp > SODIC_ESP ? " (sodic)" : ""}, water table at <b className="mono">{end.table} m</b>, yield{" "}
          <b className="mono">{end.yield} %</b> and infiltration <b className="mono">{end.infiltration} %</b>{" "}
          of the first year.
          {end.esp > SODIC_ESP && " The ditch runs milky: the clay has dispersed."}
        </p>
      )}
      {done ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">Run it with no drains and with drains to continue.</p>
      )}
    </>
  );
}

const share = ([r, g, b]: [number, number, number]) => Math.round((g / (r + g + b)) * 1000) / 1000;

/** c13-m4: the Sentinel-2 inset, a measurement, beside the painted valley, an illustration. */
function Satellite({ step, onDone }: Props) {
  const [painted, setPainted] = useState<string>();
  const [at, setAt] = useState<string | null>(null);
  const [probed, setProbed] = useState<Set<string>>(new Set());
  useEffect(() => {
    let live = true;
    void import("../world/painter").then(({ composeStatic, paint }) => {
      const svg = composeStatic(paint("c13-valley", 131, 480, 300));
      if (live) setPainted(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    });
    return () => {
      live = false;
    };
  }, []);
  const s = C13_SATELLITE;
  const here = s.probes.find((p) => p.id === at);
  const probe = (id: string) => {
    setAt(id);
    setProbed(new Set([...probed, id]));
  };
  return (
    <>
      <div className="c13-pair">
        <figure className="c13-inset">
          <p className="c13-tag" data-kind="measured">
            {s.label}
          </p>
          <div className="c13-image">
            <img
              src={assetUrl(s.asset)}
              alt="Satellite image: green and brown gullied hills, a road along the top."
            />
            {s.probes.map((p) => (
              <button
                key={p.id}
                type="button"
                className="c13-probe"
                aria-pressed={at === p.id}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                onClick={() => probe(p.id)}
              >
                <span className="sr-only">Probe </span>
                {p.id}
              </button>
            ))}
          </div>
          <figcaption className="small">
            {s.caption} <span className="mono">{s.credit}</span>
          </figcaption>
        </figure>
        <figure className="c13-inset">
          <p className="c13-tag" data-kind="illustration">
            Illustration: painted, not measured
          </p>
          <div className="c13-image">{painted && <img src={painted} alt="" />}</div>
          <figcaption className="small">
            The valley of this chapter, drawn to teach. No pixel here was measured.
          </figcaption>
        </figure>
      </div>
      {here && (
        <p className="observation" aria-live="polite">
          <span className="tier" data-tier="measured">
            measured
          </span>{" "}
          Probe {here.id}: red <b className="mono">{here.rgb[0]}</b>, green{" "}
          <b className="mono">{here.rgb[1]}</b>, blue <b className="mono">{here.rgb[2]}</b> (display values,
          0–255). <Derived /> Green share <b className="mono">{share(here.rgb)}</b>{" "}
          <span className="mono small">
            = {here.rgb[1]} ÷ ({here.rgb.join(" + ")})
          </span>
        </p>
      )}
      {probed.size === s.probes.length ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">Probe all four patches to continue.</p>
      )}
    </>
  );
}

export function HillslopeRiver(props: Props) {
  switch (props.step.bench) {
    case "splash":
      return <Splash {...props} />;
    case "storm":
      return <StormBench {...props} />;
    case "salt":
      return <Salt {...props} />;
    case "satellite":
      return <Satellite {...props} />;
  }
}
