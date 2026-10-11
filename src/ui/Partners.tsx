/**
 * Chapter 8 benches in the mission panel, on the rules in `src/sim/trade.ts`,
 * `sorption.ts` and `nodules.ts`: the root exchange, the partner survey, knock
 * knock, slicing nodules, the nitrate off-switch, reach or release, and the
 * forest-network claim sort. Loaded lazily, off the initial bundle.
 */
import { useMemo, useState } from "react";
import type { Claim, Step } from "../content/schema";
import {
  fixAccount,
  knock,
  NITRATE_STEPS,
  NODULE_PARTNER,
  runFix,
  slice,
  type Knock,
  type Rhizobia,
} from "../sim/nodules";
import { BINDER, PH_STEPS, type Ph } from "../sim/sorption";
import { AM_HOST, CROPS, runTrade, tradeAccount, type Crop, type SoilP, type Strategy } from "../sim/trade";
import { t, tl } from "../i18n";
import { Facts, SourceRef, tr } from "./common";

type PartnersStep = Extract<Step, { kind: "partners" }>;
type ClaimStep = Extract<Step, { kind: "claim-sort" }>;

const DAYS = 20;
const BINDER_NAME = { "iron and aluminium": tl("iron and aluminium"), calcium: tl("calcium") };
const CROP_NAME: Record<Crop, string> = {
  pea: tl("Pea"),
  bean: tl("Bush bean"),
  spinach: tl("Spinach"),
  sugarbeet: tl("Sugar beet"),
};
/** The same names mid-sentence; German keeps its nouns capitalised. */
const CROP_LOWER: Record<Crop, string> = {
  pea: tl("pea"),
  bean: tl("bush bean"),
  spinach: tl("spinach"),
  sugarbeet: tl("sugar beet"),
};
const RHIZOBIA_NAME: Record<Rhizobia, string> = {
  "pea-rhizobia": tl("Pea rhizobia"),
  "bean-rhizobia": tl("Bean rhizobia"),
};
const RHIZOBIA_LOWER: Record<Rhizobia, string> = {
  "pea-rhizobia": tl("pea rhizobia"),
  "bean-rhizobia": tl("bean rhizobia"),
};

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      {t("Teaching model: direction, not prediction.")}
    </p>
  );
}

function Result({
  step,
  onDone,
}: {
  step: { resultText: string; facts: PartnersStep["facts"] };
  onDone: () => void;
}) {
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

function Seg<T extends string | number>({
  legend,
  options,
  value,
  set,
  label,
}: {
  legend: string;
  options: readonly T[];
  value: T;
  set: (v: T) => void;
  label: (v: T) => string;
}) {
  return (
    <fieldset className="segmented">
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o}>
          <input type="radio" name={legend} checked={value === o} onChange={() => set(o)} />
          <span>{label(o)}</span>
        </label>
      ))}
    </fieldset>
  );
}

/** A value with a bar scaled to `max`. */
function Bar({ v, max, text }: { v: number; max: number; text?: string }) {
  return (
    <td>
      <span className="ripple-bar" style={{ width: `${(v / Math.max(1, max)) * 100}%` }} />
      <span className="mono">{text ?? v}</span>
    </td>
  );
}

const SOIL_P: SoilP[] = ["low", "medium", "high"];
const SOIL_P_NAME: Record<SoilP, string> = { low: tl("Low"), medium: tl("Medium"), high: tl("High") };

/** c8-m1: the pea with and without its fungus across soil P. */
function Trade({ step, onDone }: { step: PartnersStep; onDone: () => void }) {
  const [soilP, setSoilP] = useState<SoilP>("low");
  const [tried, setTried] = useState<SoilP[]>(["low"]);
  const runs = useMemo(
    () =>
      SOIL_P.map((p) => {
        const without = runTrade({ crop: "pea", soilP: p, ph: 6.5, strategies: [] }, DAYS);
        const withF = runTrade({ crop: "pea", soilP: p, ph: 6.5, strategies: ["fungus"] }, DAYS);
        return { p, without: without.at(-1)!.P.plant, with: withF.at(-1)!.P.plant, ...tradeAccount(withF) };
      }),
    [],
  );
  const r = runs.find((x) => x.p === soilP)!;
  const maxP = Math.max(...runs.map((x) => x.with));
  const maxC = Math.max(...runs.map((x) => x.cPaid));
  return (
    <figure className="ripple partners">
      <Banner />
      <Seg
        legend={t("Soil P")}
        options={SOIL_P}
        value={soilP}
        set={(p) => {
          setSoilP(p);
          setTried((t) => (t.includes(p) ? t : [...t, p]));
        }}
        label={(p) => t(SOIL_P_NAME[p])}
      />
      <table>
        <thead>
          <tr>
            <th scope="col">{t("After {days} days, pea", { days: DAYS })}</th>
            <th scope="col">{t("No fungus")}</th>
            <th scope="col">{t("With its fungus")}</th>
          </tr>
        </thead>
        <tbody>
          <tr data-key="plant">
            <th scope="row">{t("P taken up by the plant")}</th>
            <Bar v={r.without} max={maxP} />
            <Bar v={r.with} max={maxP} />
          </tr>
          <tr>
            <th scope="row">{t("P handed over by the fungus")}</th>
            <td className="mono">—</td>
            <Bar v={r.pReceived} max={maxP} />
          </tr>
          <tr>
            <th scope="row">{t("C paid to the fungus")}</th>
            <td className="mono">—</td>
            <Bar v={r.cPaid} max={maxC} />
          </tr>
        </tbody>
      </table>
      <p className="ledger-account mono" aria-live="polite">
        {t("Trade ratio (derived): {n} P per 100 C paid", { n: r.perHundredC.toFixed(1) })}
      </p>
      <figcaption>
        {tr(
          "The trade ratio is the bench's derived number: P the fungus handed over divided by the carbon it was paid. {src}",
          { src: <SourceRef id="smith-2003" /> },
        )}
      </figcaption>
      {tried.length === SOIL_P.length ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">{t("Try all three soil P levels.")}</p>
      )}
    </figure>
  );
}

/** c8-m2: look inside each crop's roots. Presence comes from the rules, not the copy. */
function Survey({ step, onDone }: { step: PartnersStep; onDone: () => void }) {
  const [looked, setLooked] = useState<Crop[]>([]);
  return (
    <figure className="ripple partners">
      <table>
        <thead>
          <tr>
            <th scope="col">{t("Crop world")}</th>
            <th scope="col">{t("Arbuscules")}</th>
            <th scope="col">{t("Nodules")}</th>
          </tr>
        </thead>
        <tbody>
          {CROPS.map((c) => {
            const seen = looked.includes(c);
            const nod = NODULE_PARTNER[c];
            return (
              <tr key={c} data-key={c}>
                <th scope="row">{t(CROP_NAME[c])}</th>
                {seen ? (
                  <>
                    <td>{AM_HOST[c] ? t("Found") : t("None found")}</td>
                    <td>
                      {nod ? t("Found ({partner})", { partner: t(RHIZOBIA_LOWER[nod]) }) : t("None found")}
                    </td>
                  </>
                ) : (
                  <td colSpan={2}>
                    <button type="button" className="chip-btn" onClick={() => setLooked([...looked, c])}>
                      {t("Look inside the {crop} root", { crop: t(CROP_LOWER[c]) })}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {looked.length === CROPS.length && <Result step={step} onDone={onDone} />}
    </figure>
  );
}

const KNOCK_TEXT: Record<Knock, string> = {
  nodule: tl("Let in: a nodule forms"),
  refused: tl("Refused: the root does not answer this signal"),
  "no-host": tl("No answer: this root forms no nodules"),
};

/** c8-m3: send rhizobia to roots; only matched partners nodulate. */
function KnockBench({ step, onDone }: { step: PartnersStep; onDone: () => void }) {
  const [r, setR] = useState<Rhizobia>("pea-rhizobia");
  const [crop, setCrop] = useState<Crop>("bean");
  const [log, setLog] = useState<{ r: Rhizobia; crop: Crop; out: Knock }[]>([]);
  const done = log.some((l) => l.out === "nodule") && log.some((l) => l.out === "refused");
  return (
    <figure className="ripple partners">
      <Seg
        legend={t("Rhizobia")}
        options={["pea-rhizobia", "bean-rhizobia"] as const}
        value={r}
        set={setR}
        label={(x) => t(RHIZOBIA_NAME[x])}
      />
      <Seg legend={t("Root")} options={CROPS} value={crop} set={setCrop} label={(c) => t(CROP_NAME[c])} />
      <button
        type="button"
        className="btn"
        onClick={() => setLog([{ r, crop, out: knock(r, crop) }, ...log])}
      >
        {t("Knock")}
      </button>
      {log.length > 0 && (
        <ul className="knock-log" aria-live="polite">
          {log.map((l, i) => (
            <li key={log.length - i} data-out={l.out}>
              {t("{rhizobia} → {crop} root: {result}", {
                rhizobia: t(RHIZOBIA_NAME[l.r]),
                crop: t(CROP_LOWER[l.crop]),
                result: t(KNOCK_TEXT[l.out]),
              })}
            </li>
          ))}
        </ul>
      )}
      {done ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">{t("Find one pairing that is let in and one that is refused.")}</p>
      )}
    </figure>
  );
}

const O2_ZONES = [tl("Soil outside"), tl("Outer cortex"), tl("Nodule centre")];
const COLOUR_NAME = { pink: tl("pink"), white: tl("white") };

/** c8-m4: slice two nodules on the same root; one has leghaemoglobin. */
function Slice({ step, onDone }: { step: PartnersStep; onDone: () => void }) {
  const [cut, setCut] = useState<boolean[]>([]);
  const nodules = useMemo(
    () =>
      [true, false].map((effective) => {
        const snaps = runFix({ crop: "pea", rhizobia: "pea-rhizobia", nitrate: 0, effective }, DAYS);
        return { ...slice(effective), count: snaps[0]!.nodules, fixed: fixAccount(snaps).fixed };
      }),
    [],
  );
  return (
    <figure className="ripple partners">
      <Banner />
      <div className="nodule-slices">
        {nodules.map((n, i) => (
          <section key={n.colour} className="nodule-slice" aria-label={t("Nodule {x}", { x: "AB"[i]! })}>
            {cut[i] ? (
              <>
                <span className="nodule-swatch" data-colour={n.colour} aria-hidden="true" />
                <p>
                  {tr("{nodule} {colour} inside", {
                    nodule: <b>{t("Nodule {x}:", { x: "AB"[i]! })}</b>,
                    colour: t(COLOUR_NAME[n.colour]),
                  })}
                </p>
                <div
                  className="o2-meter"
                  role="img"
                  aria-label={
                    n.oxygen === "low"
                      ? t("Oxygen falls to almost none at the centre")
                      : t("Oxygen stays high to the centre")
                  }
                >
                  {O2_ZONES.map((z, k) => (
                    <span
                      key={z}
                      className="o2-zone"
                      data-level={k === 0 || n.oxygen === "high" ? "high" : k === 1 ? "mid" : "low"}
                    >
                      {t(z)}
                    </span>
                  ))}
                </div>
                <p className="mono small">
                  {t("Plant with {count} nodules like this: {fixed} N fixed in {days} days", {
                    count: n.count,
                    fixed: n.fixed,
                    days: DAYS,
                  })}
                </p>
              </>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => setCut(Object.assign([...cut], { [i]: true }))}
              >
                {t("Slice nodule {x}", { x: "AB"[i]! })}
              </button>
            )}
          </section>
        ))}
      </div>
      {cut[0] && cut[1] && <Result step={step} onDone={onDone} />}
    </figure>
  );
}

/** c8-m5: nitrate from none to plenty. */
function Nitrate({ step, onDone }: { step: PartnersStep; onDone: () => void }) {
  const [k, setK] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const runs = useMemo(
    () =>
      NITRATE_STEPS.map((nitrate) => {
        const snaps = runFix({ crop: "pea", rhizobia: "pea-rhizobia", nitrate }, DAYS);
        return { level: nitrate, nodules: snaps[0]!.nodules, ...fixAccount(snaps) };
      }),
    [],
  );
  const r = runs[k]!;
  const max = (f: (x: (typeof runs)[number]) => number) => Math.max(...runs.map(f));
  const rows = [
    { id: "nodules", label: t("Nodules"), v: r.nodules, m: max((x) => x.nodules) },
    { id: "fixed", label: t("N fixed from the air"), v: r.fixed, m: max((x) => x.fixed + x.nitrate) },
    { id: "nitrate", label: t("N taken up as nitrate"), v: r.nitrate, m: max((x) => x.fixed + x.nitrate) },
    { id: "c", label: t("C spent getting N"), v: r.cFix + r.cUptake, m: max((x) => x.cFix + x.cUptake) },
  ];
  return (
    <figure className="ripple partners">
      <Banner />
      <label className="slider-row">
        <span>{t("Nitrate")}</span>
        <input
          type="range"
          min={0}
          max={NITRATE_STEPS.length - 1}
          value={k}
          aria-label={t("Nitrate in the root zone")}
          aria-valuetext={t("{n} units", { n: r.level })}
          onChange={(e) => {
            const v = Number(e.target.value);
            setK(v);
            setSeen((s) => (s.includes(v) ? s : [...s, v]));
          }}
        />
        <output className="mono">{r.level}</output>
      </label>
      <table>
        <thead>
          <tr>
            <th scope="col">{t("Pea, {days} days", { days: DAYS })}</th>
            <th scope="col">{t("Nitrate {level}", { level: r.level })}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.id} data-key={x.id}>
              <th scope="row">{x.label}</th>
              <Bar v={x.v} max={x.m} />
            </tr>
          ))}
        </tbody>
      </table>
      {seen.includes(NITRATE_STEPS.length - 1) ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">{t("Turn the nitrate all the way up.")}</p>
      )}
    </figure>
  );
}

const WAYS: { id: string; label: string; strategies: Strategy[] }[] = [
  { id: "none", label: tl("Nothing extra"), strategies: [] },
  { id: "hairs", label: tl("Root hairs (reach)"), strategies: ["hairs"] },
  { id: "fungus", label: tl("Mycorrhiza (reach)"), strategies: ["fungus"] },
  { id: "acids", label: tl("Organic acids (release)"), strategies: ["acids"] },
];

/** c8-m6: crop × pH × way of getting P. */
function Reach({ step, onDone }: { step: PartnersStep; onDone: () => void }) {
  const [crop, setCrop] = useState<Crop>("spinach");
  const [ph, setPh] = useState<Ph>(6.5);
  const [tried, setTried] = useState<string[]>([`spinach:6.5`]);
  const rows = useMemo(
    () =>
      WAYS.map((w) => ({
        ...w,
        p: runTrade({ crop, soilP: "low", ph, strategies: w.strategies }, DAYS).at(-1)!.P,
      })),
    [crop, ph],
  );
  const max = Math.max(...rows.map((r) => r.p.plant));
  const pick = (c: Crop, p: Ph) => {
    setCrop(c);
    setPh(p);
    setTried((t) => [...new Set([...t, `${c}:${p}`])]);
  };
  const crops = new Set(tried.map((t) => t.split(":")[0]));
  const done =
    [...crops].some((c) => AM_HOST[c as Crop]) &&
    [...crops].some((c) => !AM_HOST[c as Crop]) &&
    tried.some((t) => !t.endsWith(":6.5"));
  return (
    <figure className="ripple partners">
      <Banner />
      <Seg
        legend={t("Crop")}
        options={CROPS}
        value={crop}
        set={(c) => pick(c, ph)}
        label={(c) => t(CROP_NAME[c])}
      />
      <Seg
        legend={t("Soil pH")}
        options={PH_STEPS}
        value={ph}
        set={(p) => pick(crop, p)}
        label={(p) => p.toFixed(1)}
      />
      <table>
        <thead>
          <tr>
            <th scope="col">
              {t("{crop}, pH {ph}, low P", { crop: t(CROP_NAME[crop]), ph: ph.toFixed(1) })}
            </th>
            <th scope="col">{t("P taken up in {days} days", { days: DAYS })}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} data-key={r.id === "none" ? undefined : "plant"}>
              <th scope="row">{t(r.label)}</th>
              {r.id === "fungus" && !AM_HOST[crop] ? (
                <td>
                  {t("No fungus colonises: {crop} typically forms no mycorrhiza", {
                    crop: t(CROP_LOWER[crop]),
                  })}
                </td>
              ) : (
                <Bar v={r.p.plant} max={max} />
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="ledger-account">
        {BINDER[ph] === "little"
          ? t("Binding P at pH {ph}: little.", { ph: ph.toFixed(1) })
          : t("Binding P at pH {ph}: mostly {binder}.", {
              ph: ph.toFixed(1),
              binder: t(BINDER_NAME[BINDER[ph]]),
            })}
      </p>
      {done ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">
          {t("Try a crop with a fungal partner and one without, and a pH other than 6.5.")}
        </p>
      )}
    </figure>
  );
}

export function Partners({ step, onDone }: { step: PartnersStep; onDone: () => void }) {
  const Bench = {
    trade: Trade,
    survey: Survey,
    knock: KnockBench,
    slice: Slice,
    nitrate: Nitrate,
    reach: Reach,
  }[step.bench];
  return <Bench step={step} onDone={onDone} />;
}

const VERDICTS: { id: Claim["verdict"]; label: string }[] = [
  { id: "supported", label: tl("Supported") },
  { id: "weak", label: tl("Weakly supported") },
  { id: "unsupported", label: tl("Unsupported") },
];

/** c8-m7: sort claims against an open-question evidence card. */
export function ClaimSort({ step, onDone }: { step: ClaimStep; onDone: () => void }) {
  const [sorted, setSorted] = useState<Record<string, Claim["verdict"]>>({});
  const right = (c: Claim) => sorted[c.id] === c.verdict;
  return (
    <figure className="partners claim-sort">
      <div className="open-question flicker">
        <p>
          <b>{t("Open question: {claim}", { claim: step.evidence.claim })}</b>
        </p>
        <ul>
          {step.evidence.sides.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="small">
          {step.evidence.sources.map((s) => (
            <SourceRef key={s} id={s} />
          ))}
        </p>
      </div>
      {step.claims.map((c) => (
        <section key={c.id} className="claim" aria-label={c.text}>
          <p>{c.text}</p>
          <fieldset className="segmented">
            <legend>{t("How well supported?")}</legend>
            {VERDICTS.map((v) => (
              <label key={v.id}>
                <input
                  type="radio"
                  name={`claim-${c.id}`}
                  checked={sorted[c.id] === v.id}
                  onChange={() => setSorted({ ...sorted, [c.id]: v.id })}
                />
                <span>{t(v.label)}</span>
              </label>
            ))}
          </fieldset>
          {sorted[c.id] && (
            <p className="hint">
              {right(c) ? c.feedback : t("Read the evidence card again: what did the field studies find?")}
            </p>
          )}
        </section>
      ))}
      {step.claims.every(right) && (
        <Result step={{ resultText: t("Sorted by the evidence."), facts: step.facts }} onDone={onDone} />
      )}
    </figure>
  );
}
