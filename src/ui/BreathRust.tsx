/**
 * Chapter 4 redox benches in the mission panel, on the rules in
 * `src/sim/redox.ts`: the redox elevator (c4-m1), airless pockets in crumbs
 * (c4-m2) and one paddy season flooded or drained in spells (c4-m3). Nothing
 * here animates, so reduced motion needs no branch.
 */
import { useState } from "react";
import type { Step } from "../content/schema";
import {
  AGGREGATE,
  ANOXIC_WATER,
  LADDER,
  PADDY_DAYS,
  anoxicShare,
  nextCard,
  paddySeason,
  type AggregateSize,
  type PaddyDay,
  type RungId,
  type Wetness,
} from "../sim/redox";
import { Facts } from "./common";

type RedoxStep = Extract<Step, { kind: "redox" }>;

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      Teaching model: direction, not prediction.
    </p>
  );
}

function Result({ step, onDone }: { step: RedoxStep; onDone: () => void }) {
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

export function BreathRust({ step, onDone }: { step: RedoxStep; onDone: () => void }) {
  if (step.bench === "elevator") return <Elevator step={step} onDone={onDone} />;
  if (step.bench === "microsites") return <Microsites step={step} onDone={onDone} />;
  return <Drain step={step} onDone={onDone} />;
}

const rung = (id: RungId) => LADDER.find((r) => r.id === id)!;
const mv = (eh: number) => `${eh > 0 ? "+" : eh < 0 ? "−" : ""}${Math.abs(eh)} mV`;
/** The hand, dealt out of order so the order has to be found. */
const HAND: RungId[] = ["Fe", "CO2", "O2", "SO4", "NO3", "Mn"];

/** c4-m1: collect the acceptor cards in ladder order; the elevator goes down a floor per card. */
function Elevator({ step, onDone }: { step: RedoxStep; onDone: () => void }) {
  const [got, setGot] = useState<RungId[]>([]);
  const [miss, setMiss] = useState<RungId | null>(null);
  const want = nextCard(got);
  const pick = (id: RungId) => {
    if (id === want) {
      setGot([...got, id]);
      setMiss(null);
    } else setMiss(id);
  };
  return (
    <>
      <Banner />
      <ol className="elevator" aria-label="Floors visited">
        {got.map((id) => (
          <li key={id}>
            <b>
              {rung(id).acceptor} → {rung(id).product}
            </b>{" "}
            <span className="mono small">≈ {mv(rung(id).eh)}</span>
            <span className="small"> {rung(id).process}. </span>
            {step.floors?.[id] && <span className="small muted">{step.floors[id]}</span>}
          </li>
        ))}
      </ol>
      {want ? (
        <>
          <p className="step-text">
            {got.length === 0
              ? "Top floor. What do the microbes here breathe?"
              : `${rung(got.at(-1)!).acceptor} is used up. What do they breathe next?`}
          </p>
          <div className="choices">
            {HAND.filter((id) => !got.includes(id)).map((id) => (
              <button key={id} type="button" className="choice" onClick={() => pick(id)}>
                {rung(id).acceptor}
              </button>
            ))}
          </div>
          {miss && (
            <p className="hint" aria-live="polite">
              {rung(miss).acceptor} is down here too, but {rung(want).acceptor} is still left and yields more
              energy. {rung(miss).acceptor} waits its turn.
            </p>
          )}
        </>
      ) : (
        <Result step={step} onDone={onDone} />
      )}
    </>
  );
}

const WET: { id: Wetness; label: string }[] = [
  { id: "moist", label: "Moist, drained" },
  { id: "wet", label: "Wet" },
  { id: "flooded", label: "Flooded" },
];
const SIZE: { id: AggregateSize; label: string }[] = [
  { id: "small", label: `Small crumb, ${AGGREGATE.small * 2} mm` },
  { id: "large", label: `Large crumb, ${AGGREGATE.large * 2} mm` },
];

/** c4-m2: an aggregate with its anoxic core, by wetness and size. */
function Microsites({ step, onDone }: { step: RedoxStep; onDone: () => void }) {
  const [water, setWater] = useState<Wetness>("flooded");
  const [size, setSize] = useState<AggregateSize>("small");
  const [tried, setTried] = useState<string[]>([]);
  const set = (w: Wetness, s: AggregateSize) => {
    setWater(w);
    setSize(s);
    setTried((t) => (t.includes(`${w}:${s}`) ? t : [...t, `${w}:${s}`]));
  };
  const share = anoxicShare(water, size);
  const core = 40 * Math.cbrt(share / 100);
  const done = tried.includes("moist:large") && tried.length >= 3;
  return (
    <>
      <Banner />
      <fieldset className="segmented">
        <legend>Soil water</legend>
        {WET.map((w) => (
          <label key={w.id}>
            <input type="radio" name="c4-water" checked={water === w.id} onChange={() => set(w.id, size)} />
            <span>{w.label}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="segmented">
        <legend>Crumb size</legend>
        {SIZE.map((s) => (
          <label key={s.id}>
            <input type="radio" name="c4-size" checked={size === s.id} onChange={() => set(water, s.id)} />
            <span>{s.label}</span>
          </label>
        ))}
      </fieldset>
      <svg className="microsite" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="40" className="crumb" />
        {core > 0 && <circle cx="50" cy="50" r={core} className="core" />}
      </svg>
      <p className="observation" aria-live="polite">
        <span className="tier" data-tier="derived">
          derived
        </span>{" "}
        Oxygen reaches about <b className="mono">{ANOXIC_WATER[water]} mm</b> in;{" "}
        <b className="mono">{share} %</b> of this crumb has none.
      </p>
      {done ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">Try at least three settings, including a large crumb in moist soil.</p>
      )}
    </>
  );
}

let cache: Record<"flooded" | "intermittent", ReturnType<typeof paddySeason>> | undefined;
/** Both seasons, run once on first use rather than at app load. */
const seasons = () =>
  (cache ??= { flooded: paddySeason("flooded"), intermittent: paddySeason("intermittent") });

/** One gas over the season, both regimes, drained spells shaded. */
function Trace({ gas, label, id }: { gas: "ch4" | "n2o"; label: string; id: string }) {
  const all = seasons();
  const top = Math.max(...all.flooded.days.map((d) => d[gas]), ...all.intermittent.days.map((d) => d[gas]));
  const x = (day: number) => ((day - 1) / (PADDY_DAYS - 1)) * 92 + 6;
  const line = (days: PaddyDay[]) => days.map((d) => `${x(d.day)},${52 - (d[gas] / top) * 44}`).join(" ");
  return (
    <figure className="paddy-trace">
      <svg className="co2-trace" viewBox="0 0 100 60" role="img" aria-labelledby={id}>
        {all.intermittent.days
          .filter((d) => !d.flooded)
          .map((d) => (
            <rect key={d.day} x={x(d.day) - 0.5} y="6" width="0.93" height="46" className="drained" />
          ))}
        <line x1="6" y1="52" x2="98" y2="52" className="axis" />
        <polyline points={line(all.flooded.days)} className="moist" />
        <polyline points={line(all.intermittent.days)} className="dried" />
        <text x="6" y="58" className="note">
          day 1
        </text>
        <text x="98" y="58" textAnchor="end" className="note">
          day {PADDY_DAYS}
        </text>
      </svg>
      <figcaption id={id} className="muted small">
        {label} per day, teaching units. Solid: drained in spells (shaded). Dashed: kept flooded.
      </figcaption>
    </figure>
  );
}

const season = (days: PaddyDay[], gas: "ch4" | "n2o") => days.reduce((n, d) => n + d[gas], 0);

/** c4-m3: a paddy season kept flooded against one drained in spells. Two curves, never one number. */
function Drain({ step, onDone }: { step: RedoxStep; onDone: () => void }) {
  const [ran, setRan] = useState(false);
  return (
    <>
      <Banner />
      {!ran ? (
        <button type="button" className="btn btn-primary" onClick={() => setRan(true)}>
          Run the season both ways
        </button>
      ) : (
        <>
          <Trace gas="ch4" label="Methane made" id="c4-ch4-cap" />
          <Trace gas="n2o" label="Nitrous oxide lost" id="c4-n2o-cap" />
          <table className="run-table">
            <caption className="muted small">
              Season totals, teaching units. Each gas in its own units.
            </caption>
            <thead>
              <tr>
                <th scope="col">Season</th>
                <th scope="col">Methane</th>
                <th scope="col">Nitrous oxide</th>
              </tr>
            </thead>
            <tbody>
              {(["flooded", "intermittent"] as const).map((r) => (
                <tr key={r}>
                  <th scope="row">{r === "flooded" ? "Kept flooded" : "Drained in spells"}</th>
                  <td className="mono">{season(seasons()[r].days, "ch4").toLocaleString("en")}</td>
                  <td className="mono">{season(seasons()[r].days, "n2o").toLocaleString("en")}</td>
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
