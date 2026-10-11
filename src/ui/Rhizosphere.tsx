/**
 * Chapter 7 benches in the mission panel: follow the root inputs, bare versus
 * planted, and home or away. The exuded share is contested, so every planted
 * result is a range from the two ends of the band, never one number.
 */
import { useMemo, useState } from "react";
import type { Fact } from "../content/schema";
import { relative, WEB_ORGANISMS, type WebSnapshot } from "../sim/food-web";
import { accounted, activeIndex, EXUDED_SHARE, exudedC, runBand, runRoot } from "../sim/rhizosphere";
import { lang, t, tl } from "../i18n";
import { Facts, SourceRef } from "./common";
import { GROUPS } from "./FoodWeb";

const DAYS = 20;
const COMPARE_DAY = 10;
const pct = (x: number) => `${Math.round(x * 100)} %`;
const fix1 = (n: number) => n.toLocaleString(lang(), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const BAND_TEXT = `${Math.round(EXUDED_SHARE.low * 100)}–${pct(EXUDED_SHARE.high)}`;

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      {t("Teaching model: direction, not prediction.")}
    </p>
  );
}

/** The contested share as a band on a 0–30 % scale. */
export function ShareBand() {
  const at = (x: number) => `${(x / 0.3) * 100}%`;
  return (
    <figure className="share-band">
      <div
        className="share-band-scale"
        role="img"
        aria-label={t("Share of fixed carbon exuded by roots: somewhere in {band}, contested.", {
          band: BAND_TEXT,
        })}
      >
        <span
          className="share-band-fill"
          style={{ left: at(EXUDED_SHARE.low), width: at(EXUDED_SHARE.high - EXUDED_SHARE.low) }}
        />
        {[0, 0.1, 0.2, 0.3].map((t) => (
          <span
            key={t}
            className="share-band-tick"
            data-edge={t === 0 ? "start" : t === 0.3 ? "end" : undefined}
            style={{ left: at(t) }}
          >
            {pct(t)}
          </span>
        ))}
      </div>
      <figcaption>
        {t("Share of fixed carbon a root exudes: {band}, contested and method-dependent.", {
          band: BAND_TEXT,
        })}{" "}
        <SourceRef id="bais-2006" /> <SourceRef id="pausch-kuzyakov-2018" />
      </figcaption>
    </figure>
  );
}

const span = (a: number, b: number) => [Math.min(a, b), Math.max(a, b)] as const;
const rangeText = ([lo, hi]: readonly [number, number]) => (lo === hi ? `${lo}` : `${lo}–${hi}`);

/** A value range drawn as a band on a bar scaled to `max`. */
function RangeCell({ r, max }: { r: readonly [number, number]; max: number }) {
  const m = Math.max(1, max);
  return (
    <td>
      <span className="range-track">
        <span
          className="range-fill"
          style={{ left: `${(r[0] / m) * 100}%`, width: `max(3px, ${((r[1] - r[0]) / m) * 100}%)` }}
        />
      </span>
      <span className="mono">{rangeText(r)}</span>
    </td>
  );
}

type Row = { id: string; label: string; get: (snaps: WebSnapshot[], day: number) => number };
const CHAIN: Row[] = [
  { id: "exudate", label: tl("Exudate released so far (C)"), get: exudedC },
  { id: "food", label: tl("Dissolved food (C)"), get: (s, d) => s[d]!.ledger.C.food },
  { id: "bacteria", label: tl("Bacteria (C)"), get: (s, d) => s[d]!.ledger.C["bacteria-copio"] },
  { id: "amoeba", label: tl("Amoebae (C)"), get: (s, d) => s[d]!.ledger.C.amoeba },
  { id: "nh4", label: tl("Ammonium (N)"), get: (s, d) => s[d]!.ledger.N.nh4 },
  { id: "plant", label: tl("Taken up by the root (N)"), get: (s, d) => s[d]!.ledger.N.plant },
];

/** Day by day along exudate → bloom → grazing → uptake, with the ledger's account. */
export function RootInputs({ facts }: { facts: Fact[] }) {
  const band = useMemo(() => runBand(DAYS), []);
  const [day, setDay] = useState(0);
  const max = (r: Row) => Math.max(...[band.low, band.high].flatMap((s) => s.map((_, d) => r.get(s, d))));
  const acc = (["low", "high"] as const).map((e) => accounted(band[e], day));
  const C = Math.min(...acc.map((a) => a.C));
  const N = Math.min(...acc.map((a) => a.N));
  return (
    <figure className="ripple root-inputs">
      <Banner />
      <ShareBand />
      <label className="slider-row">
        <span>{t("Day")}</span>
        <input
          type="range"
          min={0}
          max={DAYS}
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          aria-label={t("Day")}
        />
        <output className="mono">{day}</output>
      </label>
      <table>
        <thead>
          <tr>
            <th scope="col">{t("Day {day}", { day })}</th>
            <th scope="col">{t("Planted, across the band")}</th>
          </tr>
        </thead>
        <tbody>
          {CHAIN.map((r) => (
            <tr key={r.id} data-key={r.id}>
              <th scope="row">{t(r.label)}</th>
              <RangeCell r={span(r.get(band.low, day), r.get(band.high, day))} max={max(r)} />
            </tr>
          ))}
        </tbody>
      </table>
      <p className="ledger-account mono" aria-live="polite">
        {t("C accounted for: {c} % · N accounted for: {n} %", { c: fix1(C), n: fix1(N) })}
      </p>
      <Facts facts={facts} />
    </figure>
  );
}

const COMPARE: Row[] = [
  { id: "food", label: tl("Dissolved C"), get: (s, d) => s[d]!.ledger.C.food },
  {
    id: "active",
    label: tl("Active-microbe index (C breathed by bacteria and fungi that day)"),
    get: (s, d) => activeIndex(s[d]!),
  },
  { id: "bacteria", label: tl("Bacteria (C)"), get: (s, d) => s[d]!.ledger.C["bacteria-copio"] },
  { id: "plant", label: tl("Taken up by the root (N)"), get: (s, d) => s[d]!.ledger.N.plant },
];

/** The bare plot beside the planted one after the same days. */
export function BarePlanted() {
  const [bare, band] = useMemo(() => [runRoot("bare", "low", COMPARE_DAY), runBand(COMPARE_DAY)], []);
  const d = COMPARE_DAY;
  return (
    <figure className="ripple">
      <Banner />
      <table>
        <thead>
          <tr>
            <th scope="col">{t("After {n} days", { n: d })}</th>
            <th scope="col">{t("Bare plot")}</th>
            <th scope="col">{t("Planted ({band} exuded)", { band: BAND_TEXT })}</th>
          </tr>
        </thead>
        <tbody>
          {COMPARE.map((r) => {
            const b = r.get(bare, d);
            const p = span(r.get(band.low, d), r.get(band.high, d));
            const max = Math.max(b, p[1]);
            return (
              <tr key={r.id} data-key={r.id}>
                <th scope="row">{t(r.label)}</th>
                <RangeCell r={[b, b]} max={max} />
                <RangeCell r={p} max={max} />
              </tr>
            );
          })}
        </tbody>
      </table>
      <figcaption>
        {t(
          "Same soil, same weather. The active-microbe index is derived by the bench: the carbon bacteria and fungi breathed out on day {day}.",
          { day: d },
        )}
      </figcaption>
    </figure>
  );
}

/** Shares near the root (both ends of the band) and in bulk soil; a spike-in adds absolute biomass. */
export function HomeAway({ facts }: { facts: Fact[] }) {
  const rows = useMemo(() => {
    const d = COMPARE_DAY;
    const band = runBand(d);
    return [
      { name: t("Near the root ({pct} exuded)", { pct: pct(EXUDED_SHARE.low) }), l: band.low[d]!.ledger },
      { name: t("Near the root ({pct} exuded)", { pct: pct(EXUDED_SHARE.high) }), l: band.high[d]!.ledger },
      { name: t("Bulk soil"), l: runRoot("bare", "low", d)[d]!.ledger },
    ].map(({ name, l }) => {
      const share = relative(l, WEB_ORGANISMS);
      return {
        name,
        groups: GROUPS.map((g) => ({
          ...g,
          share: g.taxa.reduce((a, t) => a + (share[t] ?? 0), 0),
          abs: g.taxa.reduce((a, t) => a + l.C[t], 0),
        })),
      };
    });
  }, []);
  const [spiked, setSpiked] = useState(false);
  const maxAbs = Math.max(...rows.flatMap((r) => r.groups.map((g) => g.abs)));
  return (
    <figure className="jar">
      <section aria-label={t("Sequencing readout, relative")}>
        <h4>{t("Sequencing readout (shares of reads)")}</h4>
        {rows.map((r) => (
          <div key={r.name} className="jar-row">
            <span className="jar-when">{r.name}</span>
            <span
              className="jar-stack"
              role="img"
              aria-label={`${r.name}: ${r.groups.map((g) => `${t(g.label)} ${pct(g.share)}`).join(", ")}`}
            >
              {r.groups.map((g) => (
                <span key={g.id} className={`jar-seg jar-${g.id}`} style={{ width: `${g.share * 100}%` }}>
                  {g.share > 0.12 ? pct(g.share) : ""}
                </span>
              ))}
            </span>
          </div>
        ))}
      </section>
      {spiked ? (
        <section aria-label={t("With a spike-in, absolute")}>
          <h4>{t("With a spike-in: absolute biomass (teaching model)")}</h4>
          {GROUPS.map((g, k) => (
            <div key={g.id} className="jar-row">
              <span className="jar-when">{t(g.label)}</span>
              <span
                className="jar-abs"
                role="img"
                aria-label={`${t(g.label)}: ${rows.map((r) => `${r.name} ${r.groups[k]!.abs}`).join(", ")}`}
              >
                {rows.map((r, i) => (
                  <span
                    key={r.name}
                    className={`jar-seg jar-${g.id}`}
                    data-row={i}
                    style={{ width: `${(r.groups[k]!.abs / maxAbs) * 100}%` }}
                  />
                ))}
              </span>
            </div>
          ))}
          <p className="small muted">
            {t("Bars per group, top to bottom: {rows}.", {
              rows: rows
                .map((r) =>
                  lang() === "en" ? r.name.toLowerCase() : r.name.charAt(0).toLowerCase() + r.name.slice(1),
                )
                .join("; "),
            })}
          </p>
        </section>
      ) : (
        <button type="button" className="btn" onClick={() => setSpiked(true)}>
          {t("Add a spike-in (absolute count)")}
        </button>
      )}
      <ul className="jar-key" aria-hidden="true">
        {GROUPS.map((g) => (
          <li key={g.id}>
            <span className={`jar-swatch jar-${g.id}`} />
            {t(g.label)}
          </li>
        ))}
      </ul>
      <figcaption className="jar-caption">
        {t("Relative, not absolute; presence ≠ activity.")} <SourceRef id="gloor-2017" />
      </figcaption>
      <Facts facts={facts} />
    </figure>
  );
}
