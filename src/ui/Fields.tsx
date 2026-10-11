/**
 * Chapter 12 benches in the mission panel, on the rules in
 * `src/sim/twin-fields.ts` and `src/sim/compaction.ts`: the season wheel and
 * twin fields (c12-m1), the context flip (c12-m2), sampling depth (c12-m3),
 * heavy wheels (c12-m4) and same seed, two fields (c12-m5). The subject field
 * is drawn in lime and the comparison in gold.
 */
import { useMemo, useState } from "react";
import type { Step } from "../content/schema";
import { BEFORE, ROOT_LIMIT_MPA, STORM_MM_H, wheel, type Wetness } from "../sim/compaction";
import {
  DEFAULT_PRACTICES,
  PRACTICES,
  SIGNAL_BAND,
  YEARS,
  YIELD_BAND,
  correlation,
  differ,
  noTillEffect,
  runField,
  sameSeed,
  type Context,
  type Practices,
  type Year,
} from "../sim/twin-fields";
import { t, tl } from "../i18n";
import { Facts, tr } from "./common";

type FieldsStep = Extract<Step, { kind: "fields" }>;
type Props = { step: FieldsStep; onDone: () => void };

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      {t("Teaching model: direction, not prediction.")}
    </p>
  );
}

function Result({ step, onDone }: Props) {
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

/** Learner-facing names for the levers and option values, which are ids in the sim. */
const OPTION_NAME: Record<string, string> = {
  tillage: tl("tillage"),
  cover: tl("cover"),
  rotation: tl("rotation"),
  traffic: tl("traffic"),
  plough: tl("plough"),
  reduced: tl("reduced"),
  none: tl("none"),
  legume: tl("legume"),
  grass: tl("grass"),
  "2-year": tl("2-year"),
  "4-year": tl("4-year"),
  "dry-season": tl("dry-season"),
  "wet-season": tl("wet-season"),
  "top 10 cm": tl("top 10 cm"),
  "whole profile to 60 cm": tl("whole profile to 60 cm"),
  dry: tl("dry"),
  wet: tl("wet"),
};

function Segmented<T extends string>({
  legend,
  name,
  options,
  value,
  set,
}: {
  legend: string;
  name: string;
  options: readonly T[];
  value: T | undefined;
  set: (v: T) => void;
}) {
  return (
    <fieldset className="segmented">
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o}>
          <input type="radio" name={name} checked={value === o} onChange={() => set(o)} />
          <span>{t(OPTION_NAME[o] ?? o)}</span>
        </label>
      ))}
    </fieldset>
  );
}

/** c12-m1: one turn of the year; each event and what it does below ground. */
function Season({ step, onDone }: Props) {
  const events = step.events ?? [];
  const [at, setAt] = useState(0);
  const [seen, setSeen] = useState(1);
  const here = events[at]!;
  const n = events.length;
  return (
    <figure className="ripple fields season">
      <svg
        className="season-wheel"
        viewBox="-50 -50 100 100"
        role="img"
        aria-label={t("Season wheel: {label}", { label: here.label })}
      >
        <g style={{ transform: `rotate(${(-360 * at) / n}deg)` }} className="season-turn">
          {events.map((e, k) => {
            const a = (2 * Math.PI * k) / n - Math.PI / 2;
            return (
              <g key={e.id} data-on={k === at}>
                <line x1="0" y1="0" x2={40 * Math.cos(a)} y2={40 * Math.sin(a)} />
                <circle cx={40 * Math.cos(a)} cy={40 * Math.sin(a)} r="6" />
              </g>
            );
          })}
        </g>
        <circle r="44" className="rim" />
        <path d="M0,-49 l-3,-0 l3,6 l3,-6 Z" className="pointer" />
      </svg>
      <div aria-live="polite">
        <p>
          <b>{here.label}</b>
        </p>
        <p>
          <b>{t("Below:")}</b> {here.below}
        </p>
      </div>
      {seen < n ? (
        <button
          type="button"
          className="btn"
          onClick={() => {
            setAt((at + 1) % n);
            setSeen(seen + 1);
          }}
        >
          {t("Next: {label}", { label: events[(at + 1) % n]!.label })}
        </button>
      ) : (
        <Result step={step} onDone={onDone} />
      )}
    </figure>
  );
}

const READOUTS: { id: keyof Year; label: string; unit: string; get: (y: Year) => number }[] = [
  { id: "aggregates", label: tl("Aggregate index"), unit: tl("0–100"), get: (y) => y.aggregates },
  { id: "nitrate", label: tl("Nitrate leached"), unit: tl("kg N/ha this year"), get: (y) => y.nitrate },
  { id: "shallow", label: tl("Carbon, top 10 cm"), unit: tl("t C/ha"), get: (y) => y.shallow / 1000 },
  {
    id: "deep",
    label: tl("Carbon, whole profile to 60 cm"),
    unit: tl("t C/ha"),
    get: (y) => (y.shallow + y.deep) / 1000,
  },
  { id: "disease", label: tl("Disease pressure index"), unit: tl("0–100"), get: (y) => y.disease },
  { id: "yield", label: tl("Yield index"), unit: tl("plough = 100"), get: (y) => y.yield },
];
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const signed = (v: number) => (v > 0 ? `+${fmt(v)}` : v < 0 ? `−${fmt(-v)}` : "0");

/** c12-m1: change one practice on the subject field, keep the comparison, run ten years. */
function Twin({ step, onDone }: Props) {
  const [mine, setMine] = useState<Practices>(DEFAULT_PRACTICES);
  const [ran, setRan] = useState<Practices | null>(null);
  const [year, setYear] = useState(YEARS);
  const changed = differ(mine, DEFAULT_PRACTICES);
  const runs = useMemo(() => ran && [runField(ran), runField(DEFAULT_PRACTICES)], [ran]);
  return (
    <figure className="ripple fields twin">
      <Banner />
      <div className="twin-levers">
        <section className="field-subject" aria-label={t("Subject field")}>
          <h4>
            <span className="swatch" aria-hidden="true" /> {t("Subject field")}
          </h4>
          {(Object.keys(PRACTICES) as (keyof Practices)[]).map((k) => (
            <Segmented
              key={k}
              legend={t(OPTION_NAME[k]!)}
              name={`twin-${k}`}
              options={PRACTICES[k]}
              value={mine[k]}
              set={(v) => setMine({ ...mine, [k]: v })}
            />
          ))}
        </section>
        <section className="field-comparison" aria-label={t("Comparison field")}>
          <h4>
            <span className="swatch" aria-hidden="true" /> {t("Comparison field")}
          </h4>
          <p className="small">
            {Object.values(DEFAULT_PRACTICES)
              .map((v) => t(OPTION_NAME[v]!))
              .join(" · ")}
            <br />
            {t("Context: humid climate, clay, well drained.")}
          </p>
        </section>
      </div>
      {changed.length !== 1 && (
        <p className="hint">
          {changed.length
            ? t("{n} practices differ: change only one.", { n: changed.length })
            : t("Change one practice.")}
        </p>
      )}
      <button type="button" className="btn" disabled={changed.length !== 1} onClick={() => setRan(mine)}>
        {t("Run ten years")}
      </button>
      {runs && (
        <>
          <label className="slider-row">
            <span>{t("Year")}</span>
            <input
              type="range"
              min={1}
              max={YEARS}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label={t("Year")}
            />
            <output className="mono">{year}</output>
          </label>
          <table>
            <thead>
              <tr>
                <th scope="col">{t("Year {year}", { year })}</th>
                <th scope="col" className="field-subject">
                  {t("Subject")}
                </th>
                <th scope="col" className="field-comparison">
                  {t("Comparison")}
                </th>
                <th scope="col">{t("Difference")}</th>
              </tr>
            </thead>
            <tbody>
              {READOUTS.map((r) => {
                const [a, b] = [r.get(runs[0]![year - 1]!), r.get(runs[1]![year - 1]!)];
                return (
                  <tr key={r.id}>
                    <th scope="row">
                      {t(r.label)} <span className="muted small">({t(r.unit)})</span>
                    </th>
                    <td className="mono">{fmt(a)}</td>
                    <td className="mono">{fmt(b)}</td>
                    <td className="mono">{signed(Math.round((a - b) * 10) / 10)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Result step={step} onDone={onDone} />
        </>
      )}
    </figure>
  );
}

const FLIP_CONTEXTS: { label: string; ctx: Context }[] = [
  { label: tl("Dry, sand"), ctx: { climate: "dry", texture: "sand", drainage: "good" } },
  { label: tl("Dry, clay"), ctx: { climate: "dry", texture: "clay", drainage: "good" } },
  { label: tl("Humid, sand"), ctx: { climate: "humid", texture: "sand", drainage: "good" } },
  { label: tl("Humid, clay"), ctx: { climate: "humid", texture: "clay", drainage: "good" } },
];

/** c12-m2: plough → reduced tillage in four contexts; done once both signs have been seen. */
function Flip({ step, onDone }: Props) {
  const [tried, setTried] = useState<string[]>([]);
  const effects = useMemo(() => FLIP_CONTEXTS.map((c) => noTillEffect(c.ctx)), []);
  const seen = FLIP_CONTEXTS.map((c, k) => (tried.includes(c.label) ? effects[k]! : 0));
  return (
    <figure className="ripple fields flip">
      <Banner />
      <div className="watch-row">
        {FLIP_CONTEXTS.map((c) => (
          <button
            key={c.label}
            type="button"
            className="btn"
            aria-pressed={tried.includes(c.label)}
            onClick={() => setTried(tried.includes(c.label) ? tried : [...tried, c.label])}
          >
            {t(c.label)}
          </button>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th scope="col">{t("Plough → reduced tillage")}</th>
            <th scope="col">{t("Yield change, 10-year mean (index points)")}</th>
          </tr>
        </thead>
        <tbody>
          {FLIP_CONTEXTS.map((c, k) => (
            <tr key={c.label} data-sign={tried.includes(c.label) ? Math.sign(effects[k]!) : undefined}>
              <th scope="row">{t(c.label)}</th>
              <td className="mono">
                {tried.includes(c.label) ? signed(Math.round(effects[k]! * 10) / 10) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {seen.some((e) => e > 0) && seen.some((e) => e < 0) ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">{t("Try fields at both ends: a dry climate and a humid one.")}</p>
      )}
    </figure>
  );
}

/** c12-m3: the same two fields, sampled shallow and then to depth. */
function Depth({ step, onDone }: Props) {
  const [plough, reduced] = useMemo(
    () => [
      runField(DEFAULT_PRACTICES).at(-1)!,
      runField({ ...DEFAULT_PRACTICES, tillage: "reduced" }).at(-1)!,
    ],
    [],
  );
  const [depth, setDepth] = useState<"top 10 cm" | "whole profile to 60 cm">();
  const [seen, setSeen] = useState<string[]>([]);
  const c = (y: Year) => (depth === "top 10 cm" ? y.shallow : y.shallow + y.deep) / 1000;
  return (
    <figure className="ripple fields depth">
      <Banner />
      <Segmented
        legend={t("Sample to")}
        name="depth"
        options={["top 10 cm", "whole profile to 60 cm"] as const}
        value={depth}
        set={(d) => {
          setDepth(d);
          setSeen(seen.includes(d) ? seen : [...seen, d]);
        }}
      />
      {depth && (
        <table>
          <thead>
            <tr>
              <th scope="col">{t("Year {year}, {depth}", { year: YEARS, depth: t(OPTION_NAME[depth]!) })}</th>
              <th scope="col">t C/ha</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{t("Ploughed")}</th>
              <td className="mono">{c(plough).toFixed(1)}</td>
            </tr>
            <tr>
              <th scope="row">{t("Reduced tillage")}</th>
              <td className="mono">{c(reduced).toFixed(1)}</td>
            </tr>
            <tr>
              <th scope="row">{t("Reduced − ploughed")}</th>
              <td className="mono">{signed(Math.round((c(reduced) - c(plough)) * 10) / 10)}</td>
            </tr>
          </tbody>
        </table>
      )}
      {seen.length === 2 ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">{t("Sample at both depths.")}</p>
      )}
    </figure>
  );
}

/** c12-m4: one pass on dry and on wet soil, then the storm. */
function Wheel({ step, onDone }: Props) {
  const [wet, setWet] = useState<Wetness>();
  const [rained, setRained] = useState<Wetness[]>([]);
  const [driven, setDriven] = useState<Wetness[]>([]);
  const pass = wet && driven.includes(wet) ? wheel(wet) : null;
  return (
    <figure className="ripple fields wheel">
      <Banner />
      <Segmented
        legend={t("Soil when the wheel crosses")}
        name="wet"
        options={["dry", "wet"] as const}
        value={wet}
        set={setWet}
      />
      <button
        type="button"
        className="btn"
        disabled={!wet || driven.includes(wet)}
        onClick={() => wet && setDriven([...driven, wet])}
      >
        {t("Drive the wheel")}
      </button>
      {pass && wet && (
        <>
          <table>
            <thead>
              <tr>
                <th scope="col">{wet === "wet" ? t("Wet soil") : t("Dry soil")}</th>
                <th scope="col">{t("Before")}</th>
                <th scope="col">{t("After the wheel")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{t("Big pores (% of volume)")}</th>
                <td className="mono">{BEFORE.macropores}</td>
                <td className="mono">{pass.macropores}</td>
              </tr>
              <tr data-over={pass.rootsBend}>
                <th scope="row">
                  {t("Resistance in the pan (MPa; roots restricted above {limit})", {
                    limit: ROOT_LIMIT_MPA,
                  })}
                </th>
                <td className="mono">{BEFORE.resistance}</td>
                <td className="mono">{pass.resistance}</td>
              </tr>
              <tr>
                <th scope="row">{t("Water taken in (mm/h)")}</th>
                <td className="mono">{BEFORE.infiltration}</td>
                <td className="mono">{pass.infiltration}</td>
              </tr>
            </tbody>
          </table>
          {rained.includes(wet) ? (
            <p className="observation" aria-live="polite">
              {t("A storm of {mm} mm/h:", { mm: STORM_MM_H })}{" "}
              {pass.ponds
                ? t("the soil cannot take it in, and water ponds in the track.")
                : t("it soaks in.")}{" "}
              {pass.rootsBend ? t("Roots reaching the pan turn sideways.") : t("Roots grow on down.")}{" "}
              {t("Recovery: topsoil {topsoil} years, subsoil {subsoil}.", {
                topsoil: pass.recovery.topsoil,
                subsoil: pass.recovery.subsoil
                  ? t("about {n} years", { n: pass.recovery.subsoil })
                  : t("no damage"),
              })}
            </p>
          ) : (
            <button type="button" className="btn" onClick={() => setRained([...rained, wet])}>
              {t("Let it rain")}
            </button>
          )}
        </>
      )}
      {rained.length === 2 ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">{t("Drive and rain on both the dry soil and the wet.")}</p>
      )}
    </figure>
  );
}

/** c12-m5: the zones as a scatter; grouping by drainage separates the shared cause. */
function SameSeed({ step, onDone }: Props) {
  const zones = useMemo(() => sameSeed(), []);
  const [grouped, setGrouped] = useState(false);
  const [looked, setLooked] = useState(false);
  const x = (s: number) => 10 + (s / 12) * 85;
  const y = (t: number) => 90 - ((t - 18) / 16) * 80;
  const mean = (zs: typeof zones) => zs.reduce((a, z) => a + z.yield, 0) / zs.length;
  const r = (zs: typeof zones) => correlation(zs).toFixed(2);
  return (
    <figure className="ripple fields same-seed">
      <svg
        viewBox="0 0 100 100"
        className="zone-plot"
        role="img"
        aria-label={t("Zones: microbial signal against yield")}
      >
        <line x1="10" y1="90" x2="98" y2="90" className="axis" />
        <line x1="10" y1="90" x2="10" y2="4" className="axis" />
        <text x="54" y="99" textAnchor="middle">
          {t("signal (% of reads)")}
        </text>
        <text x="3" y="47" textAnchor="middle" transform="rotate(-90 3 47)">
          {t("yield (t/ha)")}
        </text>
        {zones.map((z) =>
          z.field === "north" ? (
            <circle
              key={z.id}
              cx={x(z.signal)}
              cy={y(z.yield)}
              r="2.4"
              className="field-subject"
              data-poor={grouped && z.drainage === "poor"}
            />
          ) : (
            <rect
              key={z.id}
              x={x(z.signal) - 2.2}
              y={y(z.yield) - 2.2}
              width="4.4"
              height="4.4"
              className="field-comparison"
              data-poor={grouped && z.drainage === "poor"}
            />
          ),
        )}
      </svg>
      <p className="small">
        {tr(
          "{north} North (ploughed, circles) · {south} South (reduced tillage, squares). Measured: signal ± {sb} points, yield ± {yb} t/ha.",
          {
            north: <span className="swatch field-subject" aria-hidden="true" />,
            south: <span className="swatch field-comparison" aria-hidden="true" />,
            sb: SIGNAL_BAND,
            yb: YIELD_BAND,
          },
        )}
      </p>
      <table>
        <tbody>
          <tr>
            <th scope="row">{t("All zones: signal vs yield, r")}</th>
            <td className="mono">{r(zones)}</td>
          </tr>
          <tr>
            <th scope="row">{t("Mean yield, North / South (t/ha)")}</th>
            <td className="mono">
              {mean(zones.filter((z) => z.field === "north")).toFixed(1)} /{" "}
              {mean(zones.filter((z) => z.field === "south")).toFixed(1)}
            </td>
          </tr>
          {grouped &&
            (["good", "poor"] as const).map((d) => {
              const zs = zones.filter((z) => z.drainage === d);
              const nf = zs.filter((z) => z.field === "north");
              const sf = zs.filter((z) => z.field === "south");
              return (
                <tr key={d}>
                  <th scope="row">
                    {d === "good"
                      ? t("Well drained ({n} zones): r, North / South yield", { n: zs.length })
                      : t("Poorly drained ({n} zones): r, North / South yield", { n: zs.length })}
                  </th>
                  <td className="mono">
                    {r(zs)}; {mean(nf).toFixed(1)} / {mean(sf).toFixed(1)}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <button
        type="button"
        className="btn"
        aria-pressed={grouped}
        onClick={() => {
          setGrouped(!grouped);
          setLooked(true);
        }}
      >
        {grouped ? t("Show all zones together") : t("Group the zones by drainage")}
      </button>
      {looked ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">{t("Each zone also has a drainage record.")}</p>
      )}
    </figure>
  );
}

const BENCHES = { season: Season, twin: Twin, flip: Flip, depth: Depth, wheel: Wheel, "same-seed": SameSeed };

export function Fields(props: Props) {
  const Bench = BENCHES[props.step.bench];
  return <Bench {...props} />;
}
