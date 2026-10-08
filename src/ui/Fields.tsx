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
import { Facts } from "./common";

type FieldsStep = Extract<Step, { kind: "fields" }>;
type Props = { step: FieldsStep; onDone: () => void };

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      Teaching model: direction, not prediction.
    </p>
  );
}

function Result({ step, onDone }: Props) {
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
          <span>{o}</span>
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
        aria-label={`Season wheel: ${here.label}`}
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
        <p className="eyebrow">
          {at + 1} of {n} · {here.label}
        </p>
        <p>
          <b>Below:</b> {here.below}
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
          Next: {events[(at + 1) % n]!.label}
        </button>
      ) : (
        <Result step={step} onDone={onDone} />
      )}
    </figure>
  );
}

const READOUTS: { id: keyof Year; label: string; unit: string; get: (y: Year) => number }[] = [
  { id: "aggregates", label: "Aggregate index", unit: "0–100", get: (y) => y.aggregates },
  { id: "nitrate", label: "Nitrate leached", unit: "kg N/ha this year", get: (y) => y.nitrate },
  { id: "shallow", label: "Carbon, top 10 cm", unit: "t C/ha", get: (y) => y.shallow / 1000 },
  {
    id: "deep",
    label: "Carbon, whole profile to 60 cm",
    unit: "t C/ha",
    get: (y) => (y.shallow + y.deep) / 1000,
  },
  { id: "disease", label: "Disease pressure index", unit: "0–100", get: (y) => y.disease },
  { id: "yield", label: "Yield index", unit: "plough = 100", get: (y) => y.yield },
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
        <section className="field-subject" aria-label="Subject field">
          <h4>
            <span className="swatch" aria-hidden="true" /> Subject field
          </h4>
          {(Object.keys(PRACTICES) as (keyof Practices)[]).map((k) => (
            <Segmented
              key={k}
              legend={k}
              name={`twin-${k}`}
              options={PRACTICES[k]}
              value={mine[k]}
              set={(v) => setMine({ ...mine, [k]: v })}
            />
          ))}
        </section>
        <section className="field-comparison" aria-label="Comparison field">
          <h4>
            <span className="swatch" aria-hidden="true" /> Comparison field
          </h4>
          <p className="small">
            {Object.values(DEFAULT_PRACTICES).join(" · ")}
            <br />
            Context: humid climate, clay, well drained.
          </p>
        </section>
      </div>
      {changed.length !== 1 && (
        <p className="hint">
          {changed.length ? `${changed.length} practices differ: change only one.` : "Change one practice."}
        </p>
      )}
      <button type="button" className="btn" disabled={changed.length !== 1} onClick={() => setRan(mine)}>
        Run ten years
      </button>
      {runs && (
        <>
          <label className="slider-row">
            <span>Year</span>
            <input
              type="range"
              min={1}
              max={YEARS}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label="Year"
            />
            <output className="mono">{year}</output>
          </label>
          <table>
            <thead>
              <tr>
                <th scope="col">Year {year}</th>
                <th scope="col" className="field-subject">
                  Subject
                </th>
                <th scope="col" className="field-comparison">
                  Comparison
                </th>
                <th scope="col">Difference</th>
              </tr>
            </thead>
            <tbody>
              {READOUTS.map((r) => {
                const [a, b] = [r.get(runs[0]![year - 1]!), r.get(runs[1]![year - 1]!)];
                return (
                  <tr key={r.id}>
                    <th scope="row">
                      {r.label} <span className="muted small">({r.unit})</span>
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
  { label: "Dry, sand", ctx: { climate: "dry", texture: "sand", drainage: "good" } },
  { label: "Dry, clay", ctx: { climate: "dry", texture: "clay", drainage: "good" } },
  { label: "Humid, sand", ctx: { climate: "humid", texture: "sand", drainage: "good" } },
  { label: "Humid, clay", ctx: { climate: "humid", texture: "clay", drainage: "good" } },
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
            {c.label}
          </button>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th scope="col">Plough → reduced tillage</th>
            <th scope="col">Yield change, 10-year mean (index points)</th>
          </tr>
        </thead>
        <tbody>
          {FLIP_CONTEXTS.map((c, k) => (
            <tr key={c.label} data-sign={tried.includes(c.label) ? Math.sign(effects[k]!) : undefined}>
              <th scope="row">{c.label}</th>
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
        <p className="hint">Try fields at both ends: a dry climate and a humid one.</p>
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
        legend="Sample to"
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
              <th scope="col">
                Year {YEARS}, {depth}
              </th>
              <th scope="col">t C/ha</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Ploughed</th>
              <td className="mono">{c(plough).toFixed(1)}</td>
            </tr>
            <tr>
              <th scope="row">Reduced tillage</th>
              <td className="mono">{c(reduced).toFixed(1)}</td>
            </tr>
            <tr>
              <th scope="row">Reduced − ploughed</th>
              <td className="mono">{signed(Math.round((c(reduced) - c(plough)) * 10) / 10)}</td>
            </tr>
          </tbody>
        </table>
      )}
      {seen.length === 2 ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">Sample at both depths.</p>
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
        legend="Soil when the wheel crosses"
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
        Drive the wheel
      </button>
      {pass && wet && (
        <>
          <table>
            <thead>
              <tr>
                <th scope="col">{wet === "wet" ? "Wet" : "Dry"} soil</th>
                <th scope="col">Before</th>
                <th scope="col">After the wheel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Big pores (% of volume)</th>
                <td className="mono">{BEFORE.macropores}</td>
                <td className="mono">{pass.macropores}</td>
              </tr>
              <tr data-over={pass.rootsBend}>
                <th scope="row">Resistance in the pan (MPa; roots restricted above {ROOT_LIMIT_MPA})</th>
                <td className="mono">{BEFORE.resistance}</td>
                <td className="mono">{pass.resistance}</td>
              </tr>
              <tr>
                <th scope="row">Water taken in (mm/h)</th>
                <td className="mono">{BEFORE.infiltration}</td>
                <td className="mono">{pass.infiltration}</td>
              </tr>
            </tbody>
          </table>
          {rained.includes(wet) ? (
            <p className="observation" aria-live="polite">
              A storm of {STORM_MM_H} mm/h:{" "}
              {pass.ponds ? "the soil cannot take it in, and water ponds in the track." : "it soaks in."}{" "}
              {pass.rootsBend ? "Roots reaching the pan turn sideways." : "Roots grow on down."} Recovery:
              topsoil {pass.recovery.topsoil} years, subsoil{" "}
              {pass.recovery.subsoil ? `about ${pass.recovery.subsoil} years` : "no damage"}.
            </p>
          ) : (
            <button type="button" className="btn" onClick={() => setRained([...rained, wet])}>
              Let it rain
            </button>
          )}
        </>
      )}
      {rained.length === 2 ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">Drive and rain on both the dry soil and the wet.</p>
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
        aria-label="Zones: microbial signal against yield"
      >
        <line x1="10" y1="90" x2="98" y2="90" className="axis" />
        <line x1="10" y1="90" x2="10" y2="4" className="axis" />
        <text x="54" y="99" textAnchor="middle">
          signal (% of reads)
        </text>
        <text x="3" y="47" textAnchor="middle" transform="rotate(-90 3 47)">
          yield (t/ha)
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
        <span className="swatch field-subject" aria-hidden="true" /> North (ploughed, circles) ·{" "}
        <span className="swatch field-comparison" aria-hidden="true" /> South (reduced tillage, squares).
        Measured: signal ± {SIGNAL_BAND} points, yield ± {YIELD_BAND} t/ha.
      </p>
      <table>
        <tbody>
          <tr>
            <th scope="row">All zones: signal vs yield, r</th>
            <td className="mono">{r(zones)}</td>
          </tr>
          <tr>
            <th scope="row">Mean yield, North / South (t/ha)</th>
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
                    {d === "good" ? "Well" : "Poorly"} drained ({zs.length} zones): r, North / South yield
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
        {grouped ? "Show all zones together" : "Group the zones by drainage"}
      </button>
      {looked ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">Each zone also has a drainage record.</p>
      )}
    </figure>
  );
}

const BENCHES = { season: Season, twin: Twin, flip: Flip, depth: Depth, wheel: Wheel, "same-seed": SameSeed };

export function Fields(props: Props) {
  const Bench = BENCHES[props.step.bench];
  return <Bench {...props} />;
}
