/**
 * Chapter 9: the `straw-n` bench page and the pieces the mission panel shows.
 * Every view reads the ledger: the relay's handoffs are sums of transfers, and
 * "N accounted for" is the ledger's total against day 0.
 */
import { useMemo, useState } from "react";
import type { Fact } from "../content/schema";
import type { Snapshot } from "../sim/engine";
import { measureNitrateProduction } from "../sim/measure";
import {
  accountedN,
  AMOA_READING,
  DAYS,
  DEFAULT_STRAW,
  handoffs,
  incubation,
  INCUBATION_DAY,
  LEVERS,
  lostN,
  organicN,
  strawN,
  type Handoff,
  type StrawLevers,
} from "../sim/benches/straw-n";
import { run } from "../sim/engine";
import { lang, t, tl } from "../i18n";
import { Facts, SourceRef, tr } from "./common";

const fix1 = (n: number) => n.toLocaleString(lang(), { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const LEVER_TEXT: { [K in keyof StrawLevers]: { label: string; options: Record<StrawLevers[K], string> } } = {
  residue: {
    label: tl("Residue ploughed in"),
    options: { "beet-tops": tl("beet tops (C:N ≈ 15)"), straw: tl("cereal straw (C:N ≈ 80)") },
  },
  mineral: { label: tl("Mineral N added"), options: { none: tl("none"), some: tl("some ammonium") } },
  rain: { label: tl("Rain"), options: { dry: tl("none (moist soil)"), wet: tl("heavy (waterlogged)") } },
  cover: { label: tl("Crop"), options: { crop: tl("sugar beet"), bare: tl("bare soil") } },
};

export const runStraw = (levers: Partial<StrawLevers>) => run(strawN({ ...DEFAULT_STRAW, ...levers }), DAYS);

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      {t("Teaching model: direction, not prediction.")}
    </p>
  );
}

/** The ledger's account, to one decimal. */
export function Account({ snaps, day }: { snaps: Snapshot[]; day: number }) {
  const n = accountedN(snaps[0]!.ledger, snaps[day]!.ledger);
  return (
    <p className="ledger-account mono" aria-live="polite">
      {t("N accounted for: {n} %", { n: fix1(n) })}
    </p>
  );
}

function DaySlider({ day, setDay, max = DAYS }: { day: number; setDay: (d: number) => void; max?: number }) {
  return (
    <label className="slider-row">
      <span>{t("Day")}</span>
      <input
        type="range"
        min={0}
        max={max}
        value={day}
        onChange={(e) => setDay(Number(e.target.value))}
        aria-label={t("Day")}
      />
      <output className="mono">{day}</output>
    </label>
  );
}

const sumTo = (snaps: Snapshot[], day: number) => handoffs(snaps.slice(1, day + 1).map((s) => s.transfers));

/** The relay as stations and handoffs, with what each handoff carried so far. */
export function RelayStrip({ snaps, day }: { snaps: Snapshot[]; day: number }) {
  const l = snaps[day]!.ledger;
  const h = sumTo(snaps, day);
  const legs: { pool: string; amount: number; handoff?: Handoff; runner?: string }[] = [
    { pool: t("Organic N"), amount: organicN(l) - l.N.B },
    { pool: t("Ammonium, NH₄⁺"), amount: l.N.NH4, handoff: "mineralisation", runner: t("decomposers") },
    {
      pool: t("Nitrate, NO₃⁻"),
      amount: l.N.NO3,
      handoff: "nitrification",
      runner: t("nitrifiers (via NO₂⁻)"),
    },
    { pool: t("Sugar beet"), amount: l.N.plant, handoff: "plant-uptake", runner: t("roots") },
  ];
  const exits: { label: string; amount: number; handoff: Handoff }[] = [
    { label: t("N₂O and N₂ from a wet crumb"), amount: l.N.n2oOut + l.N.n2Out, handoff: "denitrification" },
    { label: t("Nitrate to the drain"), amount: l.N.drainage, handoff: "leaching" },
    { label: t("NH₃ from the surface"), amount: l.N.nh3Out, handoff: "volatilisation" },
  ];
  return (
    <div className="relay">
      <ol className="relay-legs" aria-label={t("The nitrogen relay on day {day}", { day })}>
        {legs.map((g) => (
          <li key={g.pool} className="relay-leg">
            {g.handoff && (
              <span className="relay-handoff">
                <span aria-hidden="true">→</span>{" "}
                {tr("{runner}: {n} so far", { runner: g.runner, n: <b className="mono">{h[g.handoff]}</b> })}
              </span>
            )}
            <span className="relay-pool">
              {g.pool} <b className="mono">{g.amount}</b>
            </span>
          </li>
        ))}
      </ol>
      <p className="relay-borrowed small">
        {tr("Held by microbes (borrowed): {held} · taken in so far {taken}", {
          held: <b className="mono">{l.N.B}</b>,
          taken: <b className="mono">{h.immobilisation}</b>,
        })}
      </p>
      <ul className="relay-exits" aria-label={t("Exits")}>
        {exits.map((x) => (
          <li key={x.handoff}>
            {x.label}: <b className="mono">{x.amount}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SERIES = [
  { id: "nh4", label: "NH₄⁺", get: (s: Snapshot) => s.ledger.N.NH4 },
  { id: "no3", label: "NO₃⁻", get: (s: Snapshot) => s.ledger.N.NO3 },
  { id: "microbes", label: tl("Microbial N"), get: (s: Snapshot) => s.ledger.N.B },
  { id: "plant", label: tl("Beet N"), get: (s: Snapshot) => s.ledger.N.plant },
  { id: "lost", label: tl("Lost"), get: (s: Snapshot) => lostN(s.ledger) },
] as const;

/** NH₄⁺, NO₃⁻, microbial N, plant N and losses over the season, up to `day`. */
export function NGraph({ snaps, day, title }: { snaps: Snapshot[]; day: number; title: string }) {
  const W = 360;
  const H = 150;
  const max = Math.max(10, ...snaps.flatMap((s) => SERIES.map((x) => x.get(s))));
  const x = (d: number) => (d / DAYS) * W;
  const y = (v: number) => H - (v / max) * H;
  const upto = snaps.slice(0, day + 1);
  const now = snaps[day]!;
  return (
    <figure className="n-graph">
      <svg
        viewBox={`-30 -8 ${W + 40} ${H + 30}`}
        className="chart"
        role="img"
        aria-label={t("{title}, day {day}: {values}.", {
          title,
          day,
          values: SERIES.map((s) => `${t(s.label)} ${s.get(now)}`).join(", "),
        })}
      >
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={0} x2={W} y1={y(max * t)} y2={y(max * t)} className="gridline" />
            <text x={-6} y={y(max * t) + 3} textAnchor="end" className="tick">
              {Math.round(max * t)}
            </text>
          </g>
        ))}
        {[0, 60, 120, 180].map((d) => (
          <text key={d} x={x(d)} y={H + 16} textAnchor="middle" className="tick">
            {d}
          </text>
        ))}
        {SERIES.map((s) => (
          <polyline
            key={s.id}
            className={`n-line n-${s.id}`}
            points={upto.map((p) => `${x(p.day).toFixed(1)},${y(s.get(p)).toFixed(1)}`).join(" ")}
          />
        ))}
        <line x1={x(day)} x2={x(day)} y1={0} y2={H} className="cursor" />
      </svg>
      <figcaption>
        <b>{title}</b>
        <ul className="legend n-legend">
          {SERIES.map((s) => (
            <li key={s.id}>
              <svg width="22" height="8" aria-hidden="true">
                <line x1="1" x2="21" y1="4" y2="4" className={`n-line n-${s.id}`} />
              </svg>
              <span className="legend-label">{t(s.label)}</span>
              <span className="mono">{s.get(now)}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

/** Mission c9-m1: after the baton, a season of the relay on the default bench. */
export function RelaySeason() {
  const snaps = useMemo(() => runStraw({ residue: "beet-tops" }), []);
  const [day, setDay] = useState(60);
  return (
    <figure className="ripple relay-season">
      <Banner />
      <DaySlider day={day} setDay={setDay} />
      <RelayStrip snaps={snaps} day={day} />
      <Account snaps={snaps} day={day} />
    </figure>
  );
}

const COMPARE = [
  {
    id: "mineral",
    label: tl("Mineral N (NH₄⁺ + NO₃⁻)"),
    get: (s: Snapshot) => s.ledger.N.NH4 + s.ledger.N.NO3,
  },
  { id: "microbes", label: tl("Microbial N"), get: (s: Snapshot) => s.ledger.N.B },
  { id: "plant", label: tl("Taken up by the beet"), get: (s: Snapshot) => s.ledger.N.plant },
  { id: "lost", label: tl("Lost to air and water"), get: (s: Snapshot) => lostN(s.ledger) },
];

/** Mission c9-m2: straw beside beet tops over the season. */
export function StrawRun({ facts }: { facts: Fact[] }) {
  const [straw, tops] = useMemo(
    () => [runStraw({ residue: "straw" }), runStraw({ residue: "beet-tops" })],
    [],
  );
  const [day, setDay] = useState(0);
  return (
    <figure className="ripple straw-run">
      <Banner />
      <DaySlider day={day} setDay={setDay} />
      <NGraph snaps={straw} day={day} title={t("Straw ploughed in")} />
      <table>
        <thead>
          <tr>
            <th scope="col">{t("Day {day}", { day })}</th>
            <th scope="col">{t("Straw")}</th>
            <th scope="col">{t("Beet tops")}</th>
          </tr>
        </thead>
        <tbody>
          {COMPARE.map((r) => (
            <tr key={r.id} data-key={r.id}>
              <th scope="row">{t(r.label)}</th>
              <td className="mono">{r.get(straw[day]!)}</td>
              <td className="mono">{r.get(tops[day]!)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Account snaps={straw} day={day} />
      <Facts facts={facts} />
    </figure>
  );
}

/** Mission c9-m3: what each found spot carried, on bare soil and under the crop. */
export function LeakTable({ found }: { found: { id: string; label: string }[] }) {
  const [bare, crop] = useMemo(
    () => [
      runStraw({ rain: "wet", mineral: "some", cover: "bare" }),
      runStraw({ rain: "wet", mineral: "some", cover: "crop" }),
    ],
    [],
  );
  const [hb, hc] = [sumTo(bare, DAYS), sumTo(crop, DAYS)];
  return (
    <figure className="ripple leak-table">
      <Banner />
      <table>
        <thead>
          <tr>
            <th scope="col">{t("After {n} days of heavy rain", { n: DAYS })}</th>
            <th scope="col">{t("Bare soil")}</th>
            <th scope="col">{t("Under beet")}</th>
          </tr>
        </thead>
        <tbody>
          {found.map((f) => (
            <tr key={f.id} data-key={f.id}>
              <th scope="row">{f.label}</th>
              <td className="mono">{hb[f.id as Handoff] ?? "—"}</td>
              <td className="mono">{hc[f.id as Handoff] ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Account snaps={bare} day={DAYS} />
    </figure>
  );
}

const sci = (v: number) => {
  const e = Math.floor(Math.log10(v));
  return `${fix1(v / 10 ** e)} × 10${String(e)
    .split("")
    .map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)])
    .join("")}`;
};
const PLOTS = [
  { id: "straw", label: tl("Straw plot") },
  { id: "beet-tops", label: tl("Beet-tops plot") },
] as const;

/** Mission c9-m4: the qPCR reading (measured, gene copies per gram). */
export function AmoaReading() {
  return (
    <table className="gene-table" aria-label={t("amoA qPCR, gene copies per gram of dry soil")}>
      <thead>
        <tr>
          <th scope="col">{t("amoA copies per g soil")}</th>
          <th scope="col">{t("Archaeal")}</th>
          <th scope="col">{t("Bacterial")}</th>
        </tr>
      </thead>
      <tbody>
        {PLOTS.map((p) => (
          <tr key={p.id}>
            <th scope="row">{t(p.label)}</th>
            {(["archaeal", "bacterial"] as const).map((k) => (
              <td key={k} className="mono">
                {sci(AMOA_READING[p.id][k].value)} ± {sci(AMOA_READING[p.id][k].band)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <caption className="small muted">
        {t("Measured: gene copies, not cells and not activity. Teaching values.")}{" "}
        <SourceRef id="leininger-2006" />
      </caption>
    </table>
  );
}

/** Mission c9-m4: net nitrate made in a 7-day jar of each plot's soil (measured, seeded noise). */
export function IncubationReading() {
  const rows = useMemo(
    () =>
      PLOTS.map((p) => ({
        ...p,
        m: measureNitrateProduction(run(strawN(incubation(p.id)), INCUBATION_DAY + 7), INCUBATION_DAY, 9),
      })),
    [],
  );
  return (
    <table className="gene-table" aria-label={t("Nitrate production in a 7-day incubation")}>
      <thead>
        <tr>
          <th scope="col">{t("7-day incubation")}</th>
          <th scope="col">{t("Net nitrate made, N per day")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <th scope="row">{t(r.label)}</th>
            <td className="mono">
              {fix1(r.m.value)} ± {fix1(r.m.band)}
            </td>
          </tr>
        ))}
      </tbody>
      <caption className="small muted">
        {t("Measured on day {day}: soil in a jar, no crop, no rain; instrument noise ±10 %.", {
          day: INCUBATION_DAY,
        })}
      </caption>
    </table>
  );
}

/** `#/bench/straw-n`: free play with all four levers. */
export function StrawBench({ backHref }: { backHref: string }) {
  const [levers, setLevers] = useState<StrawLevers>(DEFAULT_STRAW);
  const snaps = useMemo(() => run(strawN(levers), DAYS), [levers]);
  const [day, setDay] = useState(60);
  return (
    <main className="bench" aria-labelledby="bench-title">
      <header className="bench-head">
        <a className="back" href={backHref}>
          {t("← Back to the field")}
        </a>
        <div>
          <h1 id="bench-title">{t("The nitrogen relay")}</h1>
        </div>
        <Banner />
      </header>
      <p className="bench-brief">
        {t(
          "A sugar beet field after a residue is ploughed in, over {n} days. Change the levers and follow the nitrogen. Rates are teaching values; the ledger keeps every unit.",
          { n: DAYS },
        )}
      </p>
      <section className="levers lab-levers" aria-label={t("Levers")}>
        {(Object.keys(LEVER_TEXT) as (keyof StrawLevers)[]).map((k) => (
          <fieldset key={k} className="segmented">
            <legend>{t(LEVER_TEXT[k].label)}</legend>
            {Object.keys(LEVERS[k]).map((v) => (
              <label key={v}>
                <input
                  type="radio"
                  name={`straw-${k}`}
                  checked={levers[k] === v}
                  onChange={() => setLevers({ ...levers, [k]: v })}
                />
                <span>{t((LEVER_TEXT[k].options as Record<string, string>)[v]!)}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </section>
      <DaySlider day={day} setDay={setDay} />
      <div className="straw-bench">
        <RelayStrip snaps={snaps} day={day} />
        <NGraph snaps={snaps} day={day} title={t("Nitrogen pools")} />
      </div>
      <Account snaps={snaps} day={day} />
      <p className="muted small">
        {tr(
          "Residue C:N from {source} (to be checked by hand). The bench skips nitrite and runs one well-mixed field.",
          {
            source: <SourceRef id="nrcs-cn-ratios" />,
          },
        )}
      </p>
    </main>
  );
}
