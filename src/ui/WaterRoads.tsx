/**
 * Chapter 3 water benches in the mission panel, on the rules in
 * `src/sim/water.ts`: draining the cave (c3-m1), stranded on drying films
 * (c3-m2), the Birch pulse (c3-m3) and rain with and without burrows (c3-m4).
 * Reduced motion shows the end of a run at once.
 */
import { useEffect, useRef, useState } from "react";
import type { Attribution, Step } from "../content/schema";
import { held, neighbours } from "../sim/films";
import {
  BURROWS,
  DRAIN_PORES,
  FIELD_CAPACITY,
  PROFILE_CM,
  PSI_STEPS,
  STRANDED,
  WILTING_POINT,
  birch,
  drained,
  drainedAbove,
  infiltrate,
  moistureAt,
  psiAtTick,
  strandedHop,
  type Kpa,
} from "../sim/water";
import { Facts, SourceRef } from "./common";

type WaterStep = Extract<Step, { kind: "water" }>;

const kpa = (psi: Kpa) => `${psi < 0 ? "−" : ""}${Math.abs(psi).toLocaleString("en")} kPa`;
const um = (d: number) => (d >= 1 ? `${Math.round(d)} µm` : `${d.toFixed(1)} µm`);

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      Teaching model: direction, not prediction.
    </p>
  );
}

function Result({ step, onDone }: { step: WaterStep; onDone: () => void }) {
  return (
    <>
      <p className="observation">{step.resultText}</p>
      {step.attribution && <AttributionNote a={step.attribution} />}
      <Facts facts={step.facts} />
      <button type="button" className="btn btn-primary" onClick={onDone}>
        Continue
      </button>
    </>
  );
}

function AttributionNote({ a }: { a: Attribution }) {
  return (
    <div className="attribution">
      <p>
        <b>{a.effect}: candidate sources</b>
      </p>
      <ul>
        {a.candidates.map((c) => (
          <li key={c.id}>
            {c.label}
            {a.shares !== "unresolved" && <b className="mono"> {a.shares[c.id] ?? 0} %</b>}
          </li>
        ))}
      </ul>
      {a.shares === "unresolved" && (
        <p className="small">
          Relative contribution: <b>unresolved</b>.{" "}
          {a.sources.map((s) => (
            <SourceRef key={s} id={s} />
          ))}
        </p>
      )}
    </div>
  );
}

/** c3-m1: the slider pulls on the water; pores empty widest first. */
function Drain({ step, onDone }: { step: WaterStep; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [bottom, setBottom] = useState(false);
  const psi = PSI_STEPS[i]!;
  const gone = new Set(drained(DRAIN_PORES, psi));
  const convention =
    psi === FIELD_CAPACITY
      ? " This is field capacity: a convention, not a constant."
      : psi === WILTING_POINT
        ? " This is the wilting point: a convention, not a constant."
        : "";
  const sentence =
    psi === 0
      ? "At 0 kPa the soil is soaked: every pore is full."
      : `At ${kpa(psi)}, pores wider than about ${um(drainedAbove(psi))} have drained.${convention}`;
  return (
    <>
      <Banner />
      <svg
        className="labyrinth-map"
        viewBox="0 0 100 60"
        role="img"
        aria-label={`Pores at ${kpa(psi)}: ${gone.size} of ${DRAIN_PORES.length} have drained.`}
      >
        {DRAIN_PORES.map((p) => (
          <g key={p.id}>
            <circle
              cx={p.x * 100}
              cy={p.y * 60}
              r={1.2 + Math.log10(p.width * 10) * 1.6}
              className="pore"
              data-full={!gone.has(p.id)}
            />
            <text x={p.x * 100} y={p.y * 60 + 9} textAnchor="middle" className="pore-label">
              {um(p.width)}
            </text>
          </g>
        ))}
      </svg>
      <label className="slider-row big">
        <span>Matric potential</span>
        <input
          type="range"
          min={0}
          max={PSI_STEPS.length - 1}
          value={i}
          onChange={(e) => {
            const n = Number(e.target.value);
            setI(n);
            if (n === PSI_STEPS.length - 1) setBottom(true);
          }}
          aria-valuetext={kpa(psi)}
        />
        <output className="mono">{kpa(psi)}</output>
      </label>
      <p className="observation" aria-live="polite">
        <span className="tier" data-tier="derived">
          derived
        </span>{" "}
        {sentence} <span className="mono small">d ≈ 300 / |ψ|</span>
      </p>
      {bottom ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">Pull all the way to {kpa(WILTING_POINT)} to continue.</p>
      )}
    </>
  );
}

const sSite = (id: string) => STRANDED.sites.find((s) => s.id === id)!;

/** c3-m2: every hop the soil dries a step; films break widest first. */
function Stranded({ step, onDone }: { step: WaterStep; onDone: () => void }) {
  const [at, setAt] = useState("start");
  const [tick, setTick] = useState(0);
  const [reached, setReached] = useState(false);
  const [status, setStatus] = useState("You are where you start. The soil is wet, for now.");
  const psi = psiAtTick(tick);
  const m = moistureAt(psi);
  const stuck = !reached && neighbours(STRANDED, at, m).length === 0;
  const flow = (to: string) => {
    const next = strandedHop(at, to, tick);
    if (next === at) {
      const adjacent = STRANDED.necks.some((n) => (n.a === at && n.b === to) || (n.b === at && n.a === to));
      setStatus(
        adjacent
          ? `The film to the ${sSite(to).label.toLowerCase()} has broken at ${kpa(psi)}. You stay where you are.`
          : `The ${sSite(to).label.toLowerCase()} is not next to you. Flow one pore at a time.`,
      );
      return;
    }
    setAt(next);
    setTick(tick + 1);
    if (next === "food") {
      setReached(true);
      setStatus("You reached the bacteria before the films broke.");
    } else setStatus(`You flowed to the ${sSite(next).label.toLowerCase()}. The soil dries a step.`);
  };
  const reset = () => {
    setAt("start");
    setTick(0);
    setStatus("Rain wetted the soil again. You are back where you start.");
  };
  const here = sSite(at);
  return (
    <>
      <Banner />
      <svg
        className="labyrinth-map"
        viewBox="0 0 100 60"
        role="img"
        aria-label={`Film map at ${kpa(psi)}. You are at the ${here.label.toLowerCase()}.`}
      >
        {STRANDED.necks.map((n) => {
          const a = sSite(n.a);
          const b = sSite(n.b);
          return (
            <line
              key={`${n.a}-${n.b}`}
              x1={a.x * 100}
              y1={a.y * 60}
              x2={b.x * 100}
              y2={b.y * 60}
              className="film"
              data-held={held(n, m)}
            />
          );
        })}
        {STRANDED.sites.map((s) => (
          <circle
            key={s.id}
            cx={s.x * 100}
            cy={s.y * 60}
            r={1.2 + Math.log2(s.width) * 0.6}
            className="pore"
            data-colony={s.cells !== undefined}
          />
        ))}
        <circle cx={here.x * 100} cy={here.y * 60} r={2.4} className="amoeba-dot" />
      </svg>
      <p className="mono small">Soil now: {kpa(psi)}</p>
      {!reached && (
        <>
          <p className="step-text">Flow to a pore:</p>
          <div className="choices">
            {STRANDED.sites
              .filter((s) => s.id !== at)
              .map((s) => (
                <button key={s.id} type="button" className="choice" onClick={() => flow(s.id)}>
                  {s.label}
                </button>
              ))}
          </div>
        </>
      )}
      <p className="observation" aria-live="polite">
        {status}
        {stuck && " No film connects you to anything: you are stranded."}
      </p>
      {stuck && (
        <button type="button" className="btn" onClick={reset}>
          Rewet and start again
        </button>
      )}
      {reached && <Result step={step} onDone={onDone} />}
    </>
  );
}

const DROUGHTS = [3, 7, 14] as const;

/** c3-m3: a dried soil and its moist twin, then rewetting. */
function Birch({ step, onDone }: { step: WaterStep; onDone: () => void }) {
  const [days, setDays] = useState<number>(7);
  const [ran, setRan] = useState(false);
  const dry = birch({ dryDays: days, rewet: true });
  const moist = birch({ dryDays: 0, rewet: true });
  const shown = 21;
  const top = Math.max(...birch({ dryDays: 14, rewet: true }).co2);
  const line = (co2: number[]) =>
    co2
      .slice(0, shown)
      .map((v, d) => `${(d / (shown - 1)) * 92 + 6},${52 - (v / top) * 44}`)
      .join(" ");
  return (
    <>
      <Banner />
      <fieldset className="segmented">
        <legend>Days without water before wetting</legend>
        {DROUGHTS.map((d) => (
          <label key={d}>
            <input type="radio" name="c3-drought" checked={days === d} onChange={() => setDays(d)} />
            <span>{d} days</span>
          </label>
        ))}
      </fieldset>
      {!ran ? (
        <button type="button" className="btn btn-primary" onClick={() => setRan(true)}>
          Dry it, then wet it
        </button>
      ) : (
        <>
          <svg className="co2-trace" viewBox="0 0 100 60" role="img" aria-labelledby="c3-trace-cap">
            <line x1="6" y1="52" x2="98" y2="52" className="axis" />
            <line
              x1={(days / (shown - 1)) * 92 + 6}
              y1="6"
              x2={(days / (shown - 1)) * 92 + 6}
              y2="52"
              className="rewet"
            />
            <text x={(days / (shown - 1)) * 92 + 7} y="10" className="note">
              wetted
            </text>
            <polyline points={line(moist.co2)} className="moist" />
            <polyline points={line(dry.co2)} className="dried" />
            <text x="6" y="58" className="note">
              day 0
            </text>
            <text x="98" y="58" textAnchor="end" className="note">
              day {shown - 1}
            </text>
          </svg>
          <p id="c3-trace-cap" className="muted small">
            CO₂ per day, teaching units. Solid: dried for {days} days, then wetted. Dashed: kept moist.
          </p>
          <table className="run-table">
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Dried, then wetted</th>
                <th scope="col">Kept moist</th>
              </tr>
            </thead>
            <tbody>
              {[days - 1, days, days + 1, days + 3].map((d) => (
                <tr key={d}>
                  <th scope="row">
                    {d}
                    {d === days ? " (wetted)" : ""}
                  </th>
                  <td className="mono">{dry.co2[d]}</td>
                  <td className="mono">{moist.co2[d]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Result step={step} onDone={onDone} />
        </>
      )}
    </>
  );
}

/** c3-m4: rain on two patches; one has worm burrows. */
function FastLanes({ step, reduced, onDone }: { step: WaterStep; reduced: boolean; onDone: () => void }) {
  const runs = { burrows: infiltrate(BURROWS), none: infiltrate(0) };
  const last = runs.none.length - 1;
  const [t, setT] = useState(-1);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const rain = () => {
    if (reduced) return setT(last);
    const tick = (k: number) => {
      setT(k);
      if (k < last) timer.current = window.setTimeout(() => tick(k + 1), 450);
    };
    tick(0);
  };
  const at = Math.max(t, 0);
  const patches = [
    { id: "burrows", label: "With burrows", s: runs.burrows[at]!, n: BURROWS },
    { id: "none", label: "Without burrows", s: runs.none[at]!, n: 0 },
  ];
  const y = (cm: number) => 4 + (cm / PROFILE_CM) * 52;
  return (
    <>
      <Banner />
      <div className="slake-row">
        {patches.map((p) => (
          <figure key={p.id} className="slake">
            <svg viewBox="0 0 40 60" className="rain-column" aria-hidden="true">
              <rect x="2" y="4" width="36" height="52" className="soil" />
              <rect x="2" y="4" width="36" height={y(p.s.front) - 4} className="wet" />
              {Array.from({ length: p.n }, (_, k) => {
                const x = 8 + k * 12;
                return (
                  <g key={k}>
                    <line x1={x} y1="4" x2={x} y2={y(100)} className="burrow" />
                    <rect x={x - 1.6} y="4" width="3.2" height={y(p.s.deepest) - 4} className="wet" />
                  </g>
                );
              })}
            </svg>
            <figcaption>
              {p.label}
              {t >= 0 && (
                <>
                  : front <b className="mono">{p.s.front} cm</b>, deepest wet{" "}
                  <b className="mono">{p.s.deepest} cm</b>
                </>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      {t < 0 ? (
        <button type="button" className="btn btn-primary" onClick={rain}>
          Rain for an hour
        </button>
      ) : (
        <p className="mono small" aria-live="polite">
          {runs.none[at]!.minutes} min of rain
        </p>
      )}
      {t === last && <Result step={step} onDone={onDone} />}
    </>
  );
}

export function WaterRoads({
  step,
  reduced,
  onDone,
}: {
  step: WaterStep;
  reduced: boolean;
  onDone: () => void;
}) {
  switch (step.bench) {
    case "drain":
      return <Drain step={step} onDone={onDone} />;
    case "stranded":
      return <Stranded step={step} onDone={onDone} />;
    case "birch":
      return <Birch step={step} onDone={onDone} />;
    case "fast-lanes":
      return <FastLanes step={step} reduced={reduced} onDone={onDone} />;
  }
}
