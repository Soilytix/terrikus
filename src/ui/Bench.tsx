/**
 * The lab bench: leaf in a jar (spec §6.4). Two jars, one change, a ledger
 * that always reads 100.0 %. Teaching model: direction, not prediction.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Choice, Step } from "../content/schema";
import { advance, benchMission, currentStep, lensAvailable } from "../app/progress";
import { appendLab, type Save } from "../save/schema";
import { run, type Snapshot } from "../sim/engine";
import { ConservationError } from "../sim/ledger";
import {
  DAYS,
  DEFAULT_LEVERS,
  INITIAL_LITTER,
  RULESET_VERSION,
  leafJar,
  type LeverSettings,
} from "../sim/benches/leaf-jar";
import { decompositionRate, measureCo2Flux } from "../sim/measure";
import { RESIDUE, TEMPERATURE, WATER } from "../sim/modifiers";
import { seededOrder } from "../sim/rng";
import { Kbd } from "./common";

type BenchStep = Extract<Step, { kind: "bench" }>;
const DAYS_PER_SECOND = 60;

const LEVERS = {
  water: { label: "Water", options: WATER },
  temperature: { label: "Temperature", options: TEMPERATURE },
  residue: { label: "Residue", options: RESIDUE },
} as const;

const POOLS = [
  { key: "L", label: "Litter", cls: "pool-L", note: "the leaf itself" },
  { key: "D", label: "Dissolved C", cls: "pool-D", note: "cut free by enzymes" },
  { key: "B", label: "Microbes", cls: "pool-B", note: "living biomass" },
  { key: "M", label: "On minerals", cls: "pool-M", note: "held on clay" },
  { key: "co2Out", label: "CO₂ out", cls: "pool-co2", note: "left the jar" },
] as const;

// Content lint checks a step's settings against the bench's levers (tests/content-lint.test.ts).
const full = (l: Record<string, string>) => ({ ...DEFAULT_LEVERS, ...l }) as LeverSettings;
const same = (a: LeverSettings, b: LeverSettings) =>
  a.water === b.water && a.temperature === b.temperature && a.residue === b.residue;
const pct = (n: number) => (n / INITIAL_LITTER) * 100;
const describe = (l: LeverSettings) =>
  `${WATER[l.water].label}, ${TEMPERATURE[l.temperature].label}, ${RESIDUE[l.residue].label}`;

function Chart({ snaps, day, frame }: { snaps: Snapshot[]; day: number; frame: "A" | "B" }) {
  const W = 360;
  const H = 170;
  const x = (d: number) => (d / DAYS) * W;
  const y = (p: number) => H - (p / 100) * H;
  const upto = snaps.slice(0, day + 1);
  const step = Math.max(1, Math.floor(upto.length / 120));
  const pts = upto.filter((_, i) => i % step === 0 || i === upto.length - 1);
  const bands = POOLS.map((p, k) => {
    const lo = (s: Snapshot) => POOLS.slice(0, k).reduce((a, q) => a + pct(s.ledger.C[q.key]), 0);
    const hi = (s: Snapshot) => lo(s) + pct(s.ledger.C[p.key]);
    const top = pts.map((s) => `${x(s.day).toFixed(1)},${y(hi(s)).toFixed(1)}`);
    const bottom = [...pts].reverse().map((s) => `${x(s.day).toFixed(1)},${y(lo(s)).toFixed(1)}`);
    return { ...p, d: pts.length > 1 ? `M${top.join("L")}L${bottom.join("L")}Z` : "" };
  });
  return (
    <svg
      viewBox={`-34 -8 ${W + 44} ${H + 32}`}
      className="chart"
      data-frame={frame}
      role="img"
      aria-label={`Jar ${frame}: carbon pools over ${DAYS} days, now at day ${day}.`}
    >
      <defs>
        <pattern
          id={`hatch-${frame}`}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="5" height="5" className="hatch-bg" />
          <line x1="0" y1="0" x2="0" y2="5" className="hatch-line" />
        </pattern>
      </defs>
      {[0, 25, 50, 75, 100].map((p) => (
        <g key={p}>
          <line x1={0} x2={W} y1={y(p)} y2={y(p)} className="gridline" />
          <text x={-6} y={y(p) + 3} textAnchor="end" className="tick">
            {p}
          </text>
        </g>
      ))}
      {[0, 90, 180, 270, 365].map((d) => (
        <text key={d} x={x(d)} y={H + 16} textAnchor="middle" className="tick">
          {d}
        </text>
      ))}
      {bands.map((b) => (
        <path
          key={b.key}
          d={b.d}
          className={`band ${b.cls}`}
          fill={b.key === "co2Out" ? `url(#hatch-${frame})` : undefined}
        />
      ))}
      <line x1={x(day)} x2={x(day)} y1={0} y2={H} className="cursor" />
    </svg>
  );
}

function Jar({ snap, frame, running }: { snap: Snapshot; frame: "A" | "B"; running: boolean }) {
  const left = snap.ledger.C.L / INITIAL_LITTER;
  const s = Math.sqrt(Math.max(left, 0.02));
  return (
    <svg viewBox="0 0 120 150" className="jar" data-frame={frame} aria-hidden="true">
      <path
        d="M30 14h60v10c10 6 14 14 14 26v82a10 10 0 01-10 10H26a10 10 0 01-10-10V50c0-12 4-20 14-26z"
        className="jar-glass"
      />
      <path d="M18 92h84v40a8 8 0 01-8 8H26a8 8 0 01-8-8z" className="jar-soil" />
      <g
        transform={`translate(60 84) scale(${s}) rotate(-14)`}
        className="jar-leaf"
        opacity={0.35 + 0.65 * s}
      >
        <path d="M-34 0C-18-18 18-18 34 0 18 16-18 16-34 0z" />
        <path d="M-30 0H30" className="vein" />
      </g>
      {running &&
        [0, 1, 2].map((i) => (
          <circle
            key={i}
            className="jar-bubble"
            cx={44 + i * 16}
            cy={88}
            r={2.5}
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      <rect x="26" y="6" width="68" height="10" rx="3" className="jar-lid" />
      <text x="60" y="64" textAnchor="middle" className="jar-tag">
        {frame}
      </text>
    </svg>
  );
}

function LeverRow({
  jar,
  levers,
  set,
  locked,
}: {
  jar: "A" | "B";
  levers: LeverSettings;
  set: (l: LeverSettings) => void;
  locked: boolean;
}) {
  return (
    <div className="levers">
      {(Object.keys(LEVERS) as (keyof typeof LEVERS)[]).map((k) => (
        <fieldset key={k} className="segmented" disabled={locked}>
          <legend>{LEVERS[k].label}</legend>
          {Object.entries(LEVERS[k].options).map(([v, o]) => (
            <label key={v}>
              <input
                type="radio"
                name={`${jar}-${k}`}
                checked={levers[k] === v}
                onChange={() => set({ ...levers, [k]: v } as LeverSettings)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </fieldset>
      ))}
    </div>
  );
}

function Readout({
  snaps,
  day,
  lens,
  seed,
  frame,
}: {
  snaps: Snapshot[];
  day: number;
  lens: boolean;
  seed: number;
  frame: "A" | "B";
}) {
  const s = snaps[day]!;
  const total = POOLS.reduce((a, p) => a + s.ledger.C[p.key], 0);
  const heat = s.energy.heat / (s.energy.heat + s.energy.organic);
  const flux = measureCo2Flux(snaps, day, seed);
  const rate = decompositionRate(snaps, day);
  return (
    <div className="readout">
      <ul className="legend">
        {POOLS.map((p) => (
          <li key={p.key}>
            <span className={`swatch ${p.cls}`} aria-hidden="true" />
            <span className="legend-label">{p.label}</span>
            <span className="mono">{pct(s.ledger.C[p.key]).toFixed(1)} %</span>
          </li>
        ))}
      </ul>
      <p className="ledger" data-frame={frame}>
        Carbon accounted for: <b className="mono">{((total / INITIAL_LITTER) * 100).toFixed(1)} %</b>
      </p>
      <div className="energy" aria-label={`Energy released as heat: ${(heat * 100).toFixed(0)} %`}>
        <span>Energy released as heat</span>
        <div className="meter">
          <i style={{ width: `${heat * 100}%` }} />
        </div>
        <span className="mono">{(heat * 100).toFixed(0)} %</span>
      </div>
      {lens && (
        <dl className="lens">
          <div data-tier="measured">
            <dt>Measured</dt>
            <dd>
              CO₂ flux{" "}
              {flux ? (
                <>
                  <b className="mono">
                    {flux.value.toFixed(1)} ± {flux.band.toFixed(1)}
                  </b>{" "}
                  units/day
                </>
              ) : (
                <>first reading at day 7</>
              )}
              <small>weekly chamber reading, instrument noise ±10 %</small>
            </dd>
          </div>
          <div data-tier="derived">
            <dt>Derived</dt>
            <dd>
              Decomposition rate <b className="mono">{rate.toFixed(1)}</b> units/day
              <small>
                = (litter at day 0 − litter at day {day}) ÷ {Math.max(1, day)} days
              </small>
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}

interface Props {
  bench: "leaf-jar";
  save: Save;
  update: (fn: (s: Save) => Save) => void;
  go: (href: string) => void;
  reduced: boolean;
  backHref: string;
}

/** A conservation failure halts the bench on screen rather than unmounting the app (engine.ts). */
function safeRun(l: LeverSettings): Snapshot[] | ConservationError {
  try {
    return run(leafJar(l), DAYS);
  } catch (e) {
    if (e instanceof ConservationError) return e;
    throw e;
  }
}

export function Bench({ bench, save, update, go, reduced, backHref }: Props) {
  const m = benchMission(bench, save);
  const st = m && currentStep(save, m);
  const step: BenchStep | undefined = st?.kind === "bench" ? st : undefined;
  const [a, setA] = useState<LeverSettings>(full(step?.a ?? {}));
  const [b, setB] = useState<LeverSettings | null>(
    step ? (step.b ? full(step.b) : null) : full({ water: "dry" }),
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);
  const [day, setDay] = useState(0);
  const [running, setRunning] = useState(false);
  const [logged, setLogged] = useState(false);
  const lens = lensAvailable(save);
  const lensOn = save.settings.lens && lens;
  const resA = useMemo(() => safeRun(a), [a]);
  const resB = useMemo(() => (b ? safeRun(b) : null), [b]);
  const halted = resA instanceof ConservationError ? resA : resB instanceof ConservationError ? resB : null;
  const snapsA = useMemo(() => (resA instanceof ConservationError ? [] : resA), [resA]);
  const snapsB = resB instanceof ConservationError ? null : resB;
  const raf = useRef(0);

  const matches = !!step && same(a, full(step.a)) && (step.b ? !!b && same(b, full(step.b)) : !b);
  const needPrediction = !!step?.predict && !committed;

  // Changing a lever restarts the year.
  useEffect(() => {
    setDay(0);
    setRunning(false);
    setLogged(false);
  }, [a, b]);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const tick = (t: number) => {
      const dd = ((t - last) / 1000) * DAYS_PER_SECOND;
      if (dd >= 1) {
        last = t;
        setDay((d) => {
          const n = Math.min(DAYS, d + Math.floor(dd));
          if (n >= DAYS) setRunning(false);
          return n;
        });
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  const finished = day >= DAYS;

  // A finished year goes into the lab book once.
  useEffect(() => {
    if (!finished || logged || halted) return;
    setLogged(true);
    const end = (s: Snapshot[]) => s[DAYS]!.ledger.C;
    const line = (n: string, s: Snapshot[]) =>
      `Jar ${n}: ${pct(end(s).L).toFixed(0)} % of the litter left, ${pct(end(s).co2Out).toFixed(0)} % out as CO₂`;
    const choice = step?.predict?.choices.find((c: Choice) => c.id === picked);
    update((s) => ({
      ...s,
      labBook: appendLab(s.labBook, {
        id: `run-${s.labBook.length + 1}`,
        at: new Date().toISOString(),
        bench,
        ruleset: RULESET_VERSION,
        ...(matches && m ? { mission: m.id } : {}),
        ...(choice ? { prediction: choice.label } : {}),
        a,
        ...(b ? { b } : {}),
        result:
          [line("A", snapsA), ...(b && snapsB ? [line("B", snapsB)] : [])].join("; ") +
          ` after ${DAYS} days.`,
        tier: "observed",
      }),
    }));
  }, [finished, logged, halted, a, b, snapsA, snapsB, update, matches, m, picked, step, bench]);

  const start = () => {
    setDay(0);
    setLogged(false);
    if (reduced) setDay(DAYS);
    else setRunning(true);
  };

  const returnTo = () => {
    if (m) update((s) => advance(s, m.id));
    go(backHref);
  };

  const jars: ["A" | "B", LeverSettings, Snapshot[], (l: LeverSettings) => void][] = [
    ["A", a, snapsA, setA],
    ...(b && snapsB
      ? [
          ["B", b, snapsB, (l: LeverSettings) => setB(l)] as [
            "B",
            LeverSettings,
            Snapshot[],
            (l: LeverSettings) => void,
          ],
        ]
      : []),
  ];

  if (halted)
    return (
      <main className="bench" aria-labelledby="bench-title">
        <h1 id="bench-title">The bench stopped</h1>
        <p>
          The teaching model lost track of its carbon, so it halted instead of showing a wrong year. Nothing
          was logged. This is a bug in the model, not in your experiment.
        </p>
        <p className="muted small mono">{halted.message}</p>
        <a className="btn" href={backHref}>
          Back to the field
        </a>
      </main>
    );

  return (
    <main className="bench" aria-labelledby="bench-title">
      <header className="bench-head">
        <a className="back" href={backHref}>
          ← Back to the field
        </a>
        <div>
          <h1 id="bench-title">Leaf in a jar</h1>
        </div>
        <p className="teaching-banner" role="note">
          <span className="dot" aria-hidden="true" />
          Teaching model: direction, not prediction.
        </p>
      </header>

      {step && <p className="bench-brief">{step.text}</p>}
      {step && !matches && (
        <p className="hint">
          This experiment asks for jar A {describe(full(step.a))}
          {step.b ? ` and jar B ${describe(full(step.b))}` : ""}. Other settings run, but are not logged for
          the mission.
        </p>
      )}

      {step?.predict && (
        <section className="bench-predict" aria-label="Your prediction">
          <p className="step-text">{step.predict.question}</p>
          <div className="choices row" role="radiogroup">
            {seededOrder(step.predict.choices).map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                className="choice"
                aria-checked={picked === c.id}
                disabled={committed}
                onClick={() => setPicked(c.id)}
              >
                <span className="choice-box" aria-hidden="true" />
                {c.label}
              </button>
            ))}
          </div>
          {!committed ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!picked}
              onClick={() => {
                setCommitted(true);
                if (step.predict && picked)
                  update((s) => ({ ...s, predictions: { ...s.predictions, [step.predict!.id]: picked } }));
              }}
            >
              Commit my prediction
            </button>
          ) : (
            <p className="prediction-tag">
              Committed: {step.predict.choices.find((c) => c.id === picked)?.label}
            </p>
          )}
        </section>
      )}

      <div className="jars" data-count={jars.length}>
        {jars.map(([name, levers, snaps, set]) => (
          <section key={name} className="jar-card" data-frame={name} aria-label={`Jar ${name}`}>
            <header>
              <h2>
                Jar {name}
                <span className="frame-tag">{name === "A" ? "subject" : "comparison"}</span>
              </h2>
              <p className="muted small">{describe(levers)}</p>
            </header>
            <div className="jar-row">
              <Jar snap={snaps[day]!} frame={name} running={running} />
              <Chart snaps={snaps} day={day} frame={name} />
            </div>
            <LeverRow jar={name} levers={levers} set={set} locked={running} />
            <Readout snaps={snaps} day={day} lens={lensOn} seed={name === "A" ? 11 : 13} frame={name} />
          </section>
        ))}
      </div>

      <section className="bench-controls" aria-label="Run">
        <button
          type="button"
          className="btn btn-primary"
          onClick={start}
          disabled={running || needPrediction}
        >
          {finished ? "Run the year again" : "Run one year"}
        </button>
        <label className="scrub">
          <span>
            Day <b className="mono">{day}</b> / {DAYS}
          </span>
          <input
            type="range"
            min={0}
            max={DAYS}
            value={day}
            disabled={running}
            onChange={(e) => setDay(Number(e.target.value))}
            aria-label="Scrub through the year"
          />
        </label>
        {reduced && (
          <div className="day-steps" role="group" aria-label="Jump to day">
            {[0, 30, 90, 180, 365].map((d) => (
              <button key={d} type="button" className="chip-btn" onClick={() => setDay(d)}>
                {d}
              </button>
            ))}
          </div>
        )}
        <span className="muted small">{reduced ? "Steps instead of animation." : "1 s ≈ 60 days."}</span>
        {!step && (
          <button type="button" className="btn" onClick={() => setB(b ? null : full({ water: "dry" }))}>
            {b ? "Use one jar" : "Add a comparison jar"}
          </button>
        )}
        {lens && (
          <button
            type="button"
            className="btn"
            aria-pressed={lensOn}
            onClick={() => update((s) => ({ ...s, settings: { ...s.settings, lens: !s.settings.lens } }))}
          >
            Scientist lens <Kbd>L</Kbd>
          </button>
        )}
      </section>

      {finished && (
        <section className="bench-done" role="status">
          <p>
            <span className="tier" data-tier="measured">
              logged
            </span>{" "}
            The year is in your lab book.
            {snapsB
              ? " Compare the litter bands of the two jars."
              : " Follow each band: the carbon moved, it did not vanish."}
          </p>
          {matches && step && (
            <button type="button" className="btn btn-primary" onClick={returnTo}>
              Take the result back to the field
            </button>
          )}
        </section>
      )}
    </main>
  );
}
