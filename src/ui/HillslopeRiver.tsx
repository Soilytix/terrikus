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
import { lang, t, tl } from "../i18n";
import { Facts, tr } from "./common";
import { STORM, STORM_MS, phaseAt, washAt, type StormPhase } from "./storm";

type HillStep = Extract<Step, { kind: "hill" }>;
type Props = { step: HillStep; reduced: boolean; onDone: () => void };

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      {t("Teaching model: direction, not prediction.")}
    </p>
  );
}

function Result({ step, onDone }: { step: HillStep; onDone: () => void }) {
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
          <span>{t(options[o])}</span>
        </label>
      ))}
    </fieldset>
  );
}

const Derived = () => (
  <span className="tier" data-tier="derived">
    {t("derived")}
  </span>
);
const pct = (n: number, of: number) => Math.round((n / of) * 100);
const num = (n: number) => n.toLocaleString(lang());
/** A label inside a sentence: lower case in English; in German only the first letter, so nouns keep their capital. */
const lower = (s: string) =>
  lang() === "en" ? s.toLowerCase() : t(s).charAt(0).toLowerCase() + t(s).slice(1);

const COVER_LABEL: Record<Cover, string> = {
  bare: tl("Bare soil"),
  thin: tl("Thin straw, 30 %"),
  full: tl("Full straw, 70 %"),
};
const RAIN_LABEL: Record<Rain, string> = { gentle: tl("Gentle"), intense: tl("Intense") };
const RAIN_PHRASE: Record<Rain, string> = { gentle: tl("gentle rain"), intense: tl("intense rain") };

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
      <Segmented
        legend={t("Cover")}
        name="c13-cover"
        options={COVER_LABEL}
        value={cover}
        onChange={setCover}
      />
      <Segmented legend={t("Rain")} name="c13-rain" options={RAIN_LABEL} value={rain} onChange={setRain} />
      <button type="button" className="btn btn-primary" onClick={run}>
        {t("Let the storm fall")}
      </button>
      {s && ran && (
        <>
          <svg
            className="c13-crumbs"
            viewBox="0 0 110 70"
            role="img"
            aria-label={t("{loose} of {all} crumbs broke loose", { loose: s.loose, all: CRUMBS })}
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
            <Derived />{" "}
            {tr(
              "{cover}, {rain}: {count} crumbs broke loose; about {mass} carried off, lowering the surface {mm}.",
              {
                cover: t(COVER_LABEL[ran.cover]),
                rain: t(RAIN_PHRASE[ran.rain]),
                count: <b className="mono">{t("{loose} of {all}", { loose: s.loose, all: CRUMBS })}</b>,
                mass: <b className="mono">{t("{n} t per hectare", { n: num(s.tPerHa) })}</b>,
                mm: <b className="mono">{num(s.mm)} mm</b>,
              },
            )}{" "}
            <span className="mono small">mm = t ÷ (1.3 t/m³ × 10,000 m²) × 1,000</span>
          </p>
        </>
      )}
      {done ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">{t("Run bare soil in intense rain, then a cover, to continue.")}</p>
      )}
    </>
  );
}

const STRIP_LABEL: Record<Strip, string> = {
  none: tl("No grass strip"),
  strip: tl("Grass strip at the foot"),
};
const PHASE: Record<StormPhase, string> = {
  calm: tl("calm"),
  darkening: tl("darkening"),
  raining: tl("raining"),
  clearing: tl("clearing"),
  after: tl("after"),
};
const SKY: Record<StormPhase, string> = {
  calm: tl("calm"),
  darkening: tl("the sky darkening"),
  raining: tl("the sky raining"),
  clearing: tl("the sky clearing"),
  after: tl("the storm has passed"),
};
const RAIN_LINES = Array.from({ length: 24 }, (_, k) => ({
  x: 8 + ((k * 41) % 190),
  y: 6 + ((k * 17) % 40),
}));

/** The valley in section: sky under the storm wash, the slope, the foot and the river. */
function StormView({
  t: ms,
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
  const rain = phase === "raining" ? 0.7 * Math.min(1, (ms - rainFrom) / 600, (rainTo - ms) / 600) : 0;
  const plume = v ? Math.min(0.85, v.soil.river / 3_000) : 0;
  const deposit = v ? Math.min(0.9, v.soil.foot / 3_000) : 0;
  return (
    <svg
      className="c13-storm"
      viewBox="0 0 200 110"
      role="img"
      aria-label={t("The hill in section during the storm: {state}", { state: t(SKY[phase]) })}
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
      <rect className="wash" x="0" y="0" width="200" height="110" style={{ opacity: washAt(ms) }} />
    </svg>
  );
}

/** c13-m2: summon the storm, follow the tagged soil and its P, then wait weeks for the river. */
function StormBench({ step, reduced, onDone }: Props) {
  const [cover, setCover] = useState<Cover>("bare");
  const [strip, setStrip] = useState<Strip>("none");
  // Milliseconds since the storm was summoned, while it runs; the wash follows `washAt` frame by frame.
  const [ms, setMs] = useState<number | null>(null);
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
        setMs(null);
        setV(after);
      } else {
        setMs(Math.max(0, now - t0));
        frame.current = requestAnimationFrame(tick);
      }
    };
    frame.current = requestAnimationFrame(tick);
  };
  const phase: StormPhase = ms === null ? (v ? "after" : "calm") : phaseAt(Math.max(1, ms));
  const busy = ms !== null;
  return (
    <>
      <Banner />
      <Segmented
        legend={t("Slope fields")}
        name="c13-slope"
        options={COVER_LABEL}
        value={cover}
        onChange={setCover}
      />
      <Segmented
        legend={t("Foot of the slope")}
        name="c13-strip"
        options={STRIP_LABEL}
        value={strip}
        onChange={setStrip}
      />
      <StormView t={ms ?? 0} phase={phase} v={v} later={later} strip={strip} />
      <p className="muted small">
        {t("The storm darkens the sky slowly and clears slowly: no lightning, no flashing.")}
      </p>
      <div className="pit-row">
        <button type="button" className="btn btn-primary" onClick={summon} disabled={busy}>
          {v ? t("Summon another storm") : t("Summon the storm")}
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
            {t("Weeks later")}
          </button>
        )}
      </div>
      <p className="mono small" aria-live="polite">
        {busy ? t("The storm: {phase}", { phase: t(PHASE[phase]) }) : ""}
      </p>
      {v && (
        <p className="observation" aria-live="polite">
          <Derived />{" "}
          {tr(
            "Of the tagged soil, {slope} stayed on the slope, {foot} stopped at the foot and {river} reached the river. Of the phosphorus that left the slope, {bound} rode on particles.",
            {
              slope: <b className="mono">{pct(v.soil.slope, TAGGED)} %</b>,
              foot: <b className="mono">{pct(v.soil.foot, TAGGED)} %</b>,
              river: <b className="mono">{pct(v.soil.river, TAGGED)} %</b>,
              bound: <b className="mono">{boundShare(v)} %</b>,
            },
          )}
          {later &&
            ` ${
              bloomed(later)
                ? t("Weeks later, algae bloom where the muddy water entered the river.")
                : t("Weeks later the river is clear: too little phosphorus arrived for a bloom.")
            }`}
        </p>
      )}
      {seen && !busy ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">{t("Summon a storm, then look again weeks later, to continue.")}</p>
      )}
    </>
  );
}

const DRAIN_LABEL: Record<Drainage, string> = { none: tl("No drains"), drains: tl("Drains") };
const WATER_LABEL: Record<Watering, string> = { normal: tl("Normal water"), extra: tl("Extra water") };
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
      aria-label={t("Root-zone EC over thirty years")}
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
        {t("saline above {ec} dS/m", { ec: SALINE_EC })}
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
    return `${t(DRAIN_LABEL[d])}, ${lower(WATER_LABEL[w])}`;
  };
  return (
    <>
      <Banner />
      <Segmented
        legend={t("Drainage")}
        name="c13-drain"
        options={DRAIN_LABEL}
        value={drainage}
        onChange={setDrainage}
      />
      <Segmented
        legend={t("Irrigation")}
        name="c13-water"
        options={WATER_LABEL}
        value={watering}
        onChange={setWatering}
      />
      <button type="button" className="btn btn-primary" onClick={run}>
        {t("Irrigate for {n} years", { n: YEARS })}
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
          <Derived />{" "}
          {tr(
            "{run}, year {years}: EC{e} {ec}{saline}, ESP {esp}{sodic}, water table at {table}, yield {yield} and infiltration {infiltration} of the first year.",
            {
              run: label(last),
              years: YEARS,
              e: <sub>e</sub>,
              ec: <b className="mono">{num(end.ec)} dS/m</b>,
              saline: end.ec > SALINE_EC ? ` (${t("saline")})` : "",
              esp: <b className="mono">{end.esp}</b>,
              sodic: end.esp > SODIC_ESP ? ` (${t("sodic")})` : "",
              table: <b className="mono">{num(end.table)} m</b>,
              yield: <b className="mono">{end.yield} %</b>,
              infiltration: <b className="mono">{end.infiltration} %</b>,
            },
          )}
          {end.esp > SODIC_ESP && ` ${t("The ditch runs milky: the clay has dispersed.")}`}
        </p>
      )}
      {done ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">{t("Run it with no drains and with drains to continue.")}</p>
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
              alt={t("Satellite image: green and brown gullied hills, a road along the top.")}
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
                <span className="sr-only">{t("Probe")} </span>
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
            {t("Illustration: painted, not measured")}
          </p>
          <div className="c13-image">{painted && <img src={painted} alt="" />}</div>
          <figcaption className="small">
            {t("The valley of this chapter, drawn to teach. No pixel here was measured.")}
          </figcaption>
        </figure>
      </div>
      {here && (
        <p className="observation" aria-live="polite">
          <span className="tier" data-tier="measured">
            {t("measured")}
          </span>{" "}
          {tr("Probe {id}: red {r}, green {g}, blue {b} (display values, 0–255).", {
            id: here.id,
            r: <b className="mono">{here.rgb[0]}</b>,
            g: <b className="mono">{here.rgb[1]}</b>,
            b: <b className="mono">{here.rgb[2]}</b>,
          })}{" "}
          <Derived /> {t("Green share")} <b className="mono">{num(share(here.rgb))}</b>{" "}
          <span className="mono small">
            = {here.rgb[1]} ÷ ({here.rgb.join(" + ")})
          </span>
        </p>
      )}
      {probed.size === s.probes.length ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="muted small">{t("Probe all four patches to continue.")}</p>
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
