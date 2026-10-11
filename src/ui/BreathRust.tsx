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
import { lang, t, tl } from "../i18n";
import { Facts, tr } from "./common";

type RedoxStep = Extract<Step, { kind: "redox" }>;

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      {t("Teaching model: direction, not prediction.")}
    </p>
  );
}

function Result({ step, onDone }: { step: RedoxStep; onDone: () => void }) {
  return (
    <>
      <p className="observation">{step.resultText}</p>
      <Facts facts={step.facts} />
      <button type="button" className="btn btn-primary" onClick={onDone}>
        {t("Continue")}
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
      <ol className="elevator" aria-label={t("Floors visited")}>
        {got.map((id) => (
          <li key={id}>
            <b>
              {rung(id).acceptor} → {t(rung(id).product)}
            </b>{" "}
            <span className="mono small">≈ {mv(rung(id).eh)}</span>
            <span className="small"> {t(rung(id).process)}. </span>
            {step.floors?.[id] && <span className="small muted">{step.floors[id]}</span>}
          </li>
        ))}
      </ol>
      {want ? (
        <>
          <p className="step-text">
            {got.length === 0
              ? t("Top floor. What do the microbes here breathe?")
              : t("{acceptor} is used up. What do they breathe next?", {
                  acceptor: rung(got.at(-1)!).acceptor,
                })}
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
              {t(
                "{miss} is down here too, but {want} is still left and yields more energy. {miss} waits its turn.",
                {
                  miss: rung(miss).acceptor,
                  want: rung(want).acceptor,
                },
              )}
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
  { id: "moist", label: tl("Moist, drained") },
  { id: "wet", label: tl("Wet") },
  { id: "flooded", label: tl("Flooded") },
];
const SIZE: { id: AggregateSize; label: string; mm: number }[] = [
  { id: "small", label: tl("Small crumb, {mm} mm"), mm: AGGREGATE.small * 2 },
  { id: "large", label: tl("Large crumb, {mm} mm"), mm: AGGREGATE.large * 2 },
];

/** c4-m2: an aggregate with its anoxic core, by wetness and size. */
function Microsites({ step, onDone }: { step: RedoxStep; onDone: () => void }) {
  const [water, setWater] = useState<Wetness>("flooded");
  const [size, setSize] = useState<AggregateSize>("small");
  const [tried, setTried] = useState<string[]>([]);
  const set = (w: Wetness, s: AggregateSize) => {
    setWater(w);
    setSize(s);
    setTried((x) => (x.includes(`${w}:${s}`) ? x : [...x, `${w}:${s}`]));
  };
  const share = anoxicShare(water, size);
  const core = 40 * Math.cbrt(share / 100);
  const done = tried.includes("moist:large") && tried.length >= 3;
  return (
    <>
      <Banner />
      <fieldset className="segmented">
        <legend>{t("Soil water")}</legend>
        {WET.map((w) => (
          <label key={w.id}>
            <input type="radio" name="c4-water" checked={water === w.id} onChange={() => set(w.id, size)} />
            <span>{t(w.label)}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="segmented">
        <legend>{t("Crumb size")}</legend>
        {SIZE.map((s) => (
          <label key={s.id}>
            <input type="radio" name="c4-size" checked={size === s.id} onChange={() => set(water, s.id)} />
            <span>{t(s.label, { mm: s.mm.toLocaleString(lang()) })}</span>
          </label>
        ))}
      </fieldset>
      <svg className="microsite" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="40" className="crumb" />
        {core > 0 && <circle cx="50" cy="50" r={core} className="core" />}
      </svg>
      <p className="observation" aria-live="polite">
        <span className="tier" data-tier="derived">
          {t("derived")}
        </span>{" "}
        {tr("Oxygen reaches about {depth} in; {share} of this crumb has none.", {
          depth: <b className="mono">{ANOXIC_WATER[water].toLocaleString(lang())} mm</b>,
          share: <b className="mono">{share.toLocaleString(lang())} %</b>,
        })}
      </p>
      {done ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">
          {t("Try at least three settings, including a large crumb in moist soil.")}
        </p>
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
          {t("day {n}", { n: 1 })}
        </text>
        <text x="98" y="58" textAnchor="end" className="note">
          {t("day {n}", { n: PADDY_DAYS })}
        </text>
      </svg>
      <figcaption id={id} className="muted small">
        {t("{gas} per day, teaching units. Solid: drained in spells (shaded). Dashed: kept flooded.", {
          gas: label,
        })}
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
          {t("Run the season both ways")}
        </button>
      ) : (
        <>
          <Trace gas="ch4" label={t("Methane made")} id="c4-ch4-cap" />
          <Trace gas="n2o" label={t("Nitrous oxide lost")} id="c4-n2o-cap" />
          <table className="run-table">
            <caption className="muted small">
              {t("Season totals, teaching units. Each gas in its own units.")}
            </caption>
            <thead>
              <tr>
                <th scope="col">{t("Season")}</th>
                <th scope="col">{t("Methane")}</th>
                <th scope="col">{t("Nitrous oxide")}</th>
              </tr>
            </thead>
            <tbody>
              {(["flooded", "intermittent"] as const).map((r) => (
                <tr key={r}>
                  <th scope="row">{r === "flooded" ? t("Kept flooded") : t("Drained in spells")}</th>
                  <td className="mono">{season(seasons()[r].days, "ch4").toLocaleString(lang())}</td>
                  <td className="mono">{season(seasons()[r].days, "n2o").toLocaleString(lang())}</td>
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
