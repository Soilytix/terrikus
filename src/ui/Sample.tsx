/**
 * Chapter 14 benches in the mission panel: the sample's way through the lab
 * (c14-m1) and the squeezing jar (c14-m2) on `src/sim/measure.ts`; sort the
 * statement (c14-m3); the claim budget (c14-m4) and the honest report
 * (c14-m5) on `src/sim/claims.ts`. The report is a teaching mock-up and says so.
 */
import { useMemo, useState } from "react";
import type { Choice, ReportBlock, ResultLayer, Step } from "../content/schema";
import {
  AFTER,
  BEFORE,
  DEFAULT_LAB,
  TAXA_LABELS,
  protocol,
  type LabLevers,
  type TaxonId,
} from "../sim/benches/lab-bench";
import { REPORT_FIELDS, judge, placeable, strongest, type ReportField } from "../sim/claims";
import { extract, labRun, sampleCores, sequence } from "../sim/measure";
import { mulberry32 } from "../sim/rng";
import { lang, t, tl } from "../i18n";
import { Facts } from "./common";

type SampleStep = Extract<Step, { kind: "sample" }>;
type Props = { step: SampleStep; onDone: () => void };

const TAXA = Object.keys(TAXA_LABELS) as TaxonId[];
const SEED = 14;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const pct = (permille: number) => `${(permille / 10).toFixed(1)} %`;
const arrow = (d: number) => (d > 0 ? t("↑ up") : d < 0 ? t("↓ down") : t("→ same"));
/** Module-level option labels are marked with `tl`; translate them at render. */
const opts = <T extends string>(os: readonly { id: T; label: string }[]) =>
  os.map((o) => ({ id: o.id, label: t(o.label) }));

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

function Segmented<T extends string>({
  legend,
  name,
  options,
  value,
  set,
}: {
  legend: string;
  name: string;
  options: readonly { id: T; label: string }[];
  value: T | undefined;
  set: (v: T) => void;
}) {
  return (
    <fieldset className="segmented">
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o.id}>
          <input type="radio" name={name} checked={value === o.id} onChange={() => set(o.id)} />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

const PIPE_LEVERS = {
  cores: [
    { id: "one", label: tl("one core") },
    { id: "five", label: tl("five cores") },
  ],
  relic: [
    { id: "keep", label: tl("amplified too") },
    { id: "remove", label: tl("removed first") },
  ],
  depth: [
    { id: "shallow", label: tl("2,000 reads") },
    { id: "deep", label: tl("20,000 reads") },
  ],
} as const;

interface Run {
  levers: LabLevers;
  stages: { name: string; readout: string }[];
  reads: Record<string, number>;
  richness: number;
}

/** One pass of the lab pipeline, stage by stage; the same draws as `labRun`. */
function pass(levers: LabLevers): Run {
  const p = protocol(levers);
  const rng = mulberry32(SEED);
  const core = sampleCores(BEFORE, p.cores, rng);
  const cells = sum(BEFORE.map((t) => core[t.id]!.cells));
  const relic = sum(BEFORE.map((t) => core[t.id]!.relic));
  const opened = sum(BEFORE.map((t) => core[t.id]!.cells * t.lysis));
  const copies = extract(BEFORE, core, p);
  const reads = sequence(copies, p, rng);
  const richness = TAXA.filter((t) => (reads[t] ?? 0) > 0).length;
  return {
    levers,
    reads,
    richness,
    stages: [
      {
        name: t("Cores"),
        readout: t("{cores}: {cells} living cells and DNA of {relic} dead ones (×10⁶ per g).", {
          cores: p.cores === 1 ? t("One core") : t("{n} cores pooled", { n: p.cores }),
          cells: Math.round(cells),
          relic: Math.round(relic),
        }),
      },
      { name: t("Sieve"), readout: t("Stones and roots stay on the 2 mm mesh; the fine earth goes on.") },
      {
        name: t("Extraction"),
        readout: p.removeRelic
          ? t("{pct} % of living cells broken open. Free DNA removed first.", {
              pct: Math.round((opened / cells) * 100),
            })
          : t("{pct} % of living cells broken open. Free DNA comes along.", {
              pct: Math.round((opened / cells) * 100),
            }),
      },
      {
        name: t("PCR"),
        readout: t("{n} gene copies; one genome gives 1 to 10 of them in this model.", {
          n: Math.round(sum(Object.values(copies))),
        }),
      },
      {
        name: t("Sequencer"),
        readout: t("{n} reads, however much DNA went in. {groups} groups detected.", {
          n: p.depth.toLocaleString(lang()),
          groups: richness,
        }),
      },
    ],
  };
}

/** c14-m1: follow one sample through the lab; run it with and without free DNA. */
function Pipeline({ step, onDone }: Props) {
  const [levers, setLevers] = useState<LabLevers>(DEFAULT_LAB);
  const [runs, setRuns] = useState<Run[]>([]);
  const last = runs.at(-1);
  const done = runs.some((r) => r.levers.relic === "keep") && runs.some((r) => r.levers.relic === "remove");
  return (
    <figure className="ripple sample pipeline-bench">
      <Banner />
      <Segmented
        legend={t("Cores per sample")}
        name="pipe-cores"
        options={opts(PIPE_LEVERS.cores)}
        value={levers.cores}
        set={(cores) => setLevers({ ...levers, cores })}
      />
      <Segmented
        legend={t("Free DNA")}
        name="pipe-relic"
        options={opts(PIPE_LEVERS.relic)}
        value={levers.relic}
        set={(relic) => setLevers({ ...levers, relic })}
      />
      <Segmented
        legend={t("Sequencing depth")}
        name="pipe-depth"
        options={opts(PIPE_LEVERS.depth)}
        value={levers.depth}
        set={(depth) => setLevers({ ...levers, depth })}
      />
      <button type="button" className="btn" onClick={() => setRuns([...runs, pass(levers)])}>
        {t("Run the sample")}
      </button>
      {last && (
        <>
          <ol className="stages" aria-label={t("What happened at each step")}>
            {last.stages.map((s) => (
              <li key={s.name}>
                <b>{s.name}</b> {s.readout}
              </li>
            ))}
          </ol>
          <div className="table-scroll">
            <table>
              <caption className="small">{t("Runs so far (measured: reads per group)")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t("Run")}</th>
                  <th scope="col">{t("Free DNA")}</th>
                  {TAXA.map((x) => (
                    <th key={x} scope="col">
                      {t(TAXA_LABELS[x])}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.map((r, i) => (
                  <tr key={i} data-relic={r.levers.relic}>
                    <th scope="row">{i + 1}</th>
                    <td>{r.levers.relic === "keep" ? t("amplified") : t("removed")}</td>
                    {TAXA.map((x) => (
                      <td key={x} className="mono">
                        {r.reads[x] ? r.reads[x] : t("not detected")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!done && runs.length > 0 && (
        <p className="hint">
          {last?.levers.relic === "keep"
            ? t("Now run it with the free DNA removed first.")
            : t("Now run it with the free DNA amplified too.")}
        </p>
      )}
      {done && <Result step={step} onDone={onDone} />}
    </figure>
  );
}

const JAR_LAB: LabLevers = {
  cores: "five",
  relic: "remove",
  spike: "none",
  depth: "deep",
  correction: "off",
};

function JarBar({ label, permille }: { label: string; permille: Record<string, number> }) {
  const parts = TAXA.filter((x) => permille[x]! > 0);
  return (
    <div className="jar-row">
      <span className="jar-when">{label}</span>
      <span
        className="jar-stack"
        role="img"
        aria-label={`${label}: ${parts.map((x) => `${t(TAXA_LABELS[x])} ${pct(permille[x]!)}`).join(", ")}`}
      >
        {parts.map((x) => (
          <span key={x} className={`jar-seg taxon-${x}`} style={{ width: `${permille[x]! / 10}%` }} />
        ))}
      </span>
    </div>
  );
}

/** c14-m2: shares before and after a drought, then a spike-in for amounts. */
function Jar({ step, onDone }: Props) {
  const [spike, setSpike] = useState<LabLevers["spike"]>("none");
  const [spiked, setSpiked] = useState(false);
  const [before, after] = useMemo(() => {
    const p = protocol({ ...JAR_LAB, spike });
    return [labRun(BEFORE, p, SEED), labRun(AFTER, p, SEED + 1000)];
  }, [spike]);
  return (
    <figure className="ripple sample jar">
      <Banner />
      <Segmented
        legend={t("Spike-in")}
        name="jar-spike"
        options={[
          { id: "none", label: t("none") },
          { id: "added", label: t("known amount added") },
        ]}
        value={spike}
        set={(v) => {
          setSpike(v);
          if (v === "added") setSpiked(true);
        }}
      />
      <section aria-label={t("The jar of reads")}>
        <h4>{t("The jar of reads: always 100 %")}</h4>
        <JarBar label={t("Before the drought")} permille={before.permille} />
        <JarBar label={t("After the drought")} permille={after.permille} />
      </section>
      <table>
        <thead>
          <tr>
            <th scope="col">{t("Group")}</th>
            <th scope="col">{t("Share of reads (measured)")}</th>
            <th scope="col">{t("Amount per gram (derived from the spike)")}</th>
          </tr>
        </thead>
        <tbody>
          {TAXA.map((x) => (
            <tr key={x} data-taxon={x}>
              <th scope="row">
                <span className={`swatch taxon-${x}`} aria-hidden="true" /> {t(TAXA_LABELS[x])}
              </th>
              <td>
                {pct(before.permille[x]!)} → {pct(after.permille[x]!)}{" "}
                {arrow(after.permille[x]! - before.permille[x]!)}
              </td>
              <td>
                {before.absolute && after.absolute
                  ? arrow(Math.round(after.absolute[x]!) - Math.round(before.absolute[x]!))
                  : t("cannot tell without a spike-in")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {before.absolute && (
        <p className="small muted">
          {t("Amount = group reads ÷ spike reads × spike added. The spike has its own bias.")}
        </p>
      )}
      {spiked && <Result step={step} onDone={onDone} />}
    </figure>
  );
}

const LAYERS: { id: ResultLayer; label: string }[] = [
  { id: "measurement", label: tl("Measurement") },
  { id: "derived", label: tl("Derived") },
  { id: "interpretation", label: tl("Interpretation") },
  { id: "prediction", label: tl("Prediction") },
  { id: "recommendation", label: tl("Recommendation") },
];

/** c14-m3: each statement into one of the five layers. */
function Layers({ step, onDone }: Props) {
  const statements = step.statements ?? [];
  const [sorted, setSorted] = useState<Record<string, ResultLayer>>({});
  const right = (id: string, layer: ResultLayer) => sorted[id] === layer;
  return (
    <figure className="claim-sort sample layers">
      {statements.map((s) => (
        <section key={s.id} className="claim" aria-label={s.text}>
          <p>{s.text}</p>
          <Segmented
            legend={t("Which layer?")}
            name={`layer-${s.id}`}
            options={opts(LAYERS)}
            value={sorted[s.id]}
            set={(v) => setSorted({ ...sorted, [s.id]: v })}
          />
          {sorted[s.id] && (
            <p className="hint">
              {right(s.id, s.layer)
                ? s.feedback
                : t(
                    "Read off an instrument, calculated by a formula, a reading of the evidence, a model's output, or something to do?",
                  )}
            </p>
          )}
        </section>
      ))}
      {statements.every((s) => right(s.id, s.layer)) && <Result step={step} onDone={onDone} />}
    </figure>
  );
}

/** c14-m4: for each case, the strongest claim the evidence supports, and no stronger. */
function Budget({ step, onDone }: Props) {
  const ladder = step.ladder ?? [];
  const cases = step.cases ?? [];
  const [at, setAt] = useState(0);
  const [pick, setPick] = useState<string>();
  const here = cases[at];
  if (!here) return <Result step={step} onDone={onDone} />;
  const verdict = pick ? judge(ladder, here.held, pick) : undefined;
  const top = ladder[strongest(ladder, here.held)];
  return (
    <figure className="claim-sort sample budget">
      <p>{here.scenario}</p>
      <ul className="evidence-held" aria-label={t("Evidence in hand")}>
        {ladder.map((r) => (
          <li key={r.id} data-held={here.held.includes(r.id)}>
            {here.held.includes(r.id) ? "✓ " : "— "}
            {r.evidence}
          </li>
        ))}
      </ul>
      <Segmented
        legend={t("The strongest claim this evidence supports")}
        name={`budget-${here.id}`}
        options={ladder.map((r) => ({ id: r.id, label: r.claim }))}
        value={pick}
        set={setPick}
      />
      {verdict?.kind === "over" && (
        <p className="hint overclaim">
          {ladder.find((r) => r.id === pick)!.overclaim}{" "}
          {t("Missing: {list}.", {
            list: verdict.missing
              .map((id) => {
                const e = ladder.find((r) => r.id === id)!.evidence;
                return lang() === "en" ? e.toLowerCase() : e;
              })
              .join("; "),
          })}
        </p>
      )}
      {verdict?.kind === "under" && (
        <p className="hint">{t("True, and the evidence allows a stronger claim.")}</p>
      )}
      {verdict?.kind === "fits" && (
        <>
          <p className="observation">
            {t("The strongest claim this evidence supports: {claim}", { claim: top?.claim ?? "" })}
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setAt(at + 1);
              setPick(undefined);
            }}
          >
            {at + 1 < cases.length ? t("Next case") : t("Done")}
          </button>
        </>
      )}
    </figure>
  );
}

/** c14-m5: the two reports, each with how it was measured. */
function Reports({ step, onDone }: Props) {
  const reports = step.reports ?? [];
  const [open, setOpen] = useState<string[]>([]);
  return (
    <figure className="sample reports">
      <div className="report-pair">
        {reports.map((r) => (
          <section key={r.id} className="lab-report" aria-label={r.title}>
            <h4>{r.title}</h4>
            <p>{r.result}</p>
            <p className="small">{r.benchmark}</p>
            {open.includes(r.id) ? (
              <ul className="small">
                {r.method.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : (
              <button type="button" className="btn" onClick={() => setOpen([...open, r.id])}>
                {t("How was {title} measured?", { title: r.title })}
              </button>
            )}
          </section>
        ))}
      </div>
      {open.length === reports.length && <Result step={step} onDone={onDone} />}
    </figure>
  );
}

const FIELD_LABEL: Record<ReportField, string> = {
  benchmark: tl("Benchmark"),
  confidence: tl("Confidence"),
  provenance: tl("Provenance"),
};
const TIER_LABEL: Record<ReportBlock["tier"], string> = {
  measured: tl("measured"),
  derived: tl("derived"),
  interpreted: tl("interpreted"),
  "would-measure": tl("would measure"),
};

/** c14-m5: the honest report; a block is placed only with a benchmark, a confidence and a provenance. */
function Report({ step, onDone }: Props) {
  const blocks = step.blocks ?? [];
  const [placed, setPlaced] = useState<Record<string, Record<ReportField, Choice>>>({});
  const [picks, setPicks] = useState<Partial<Record<ReportField, string>>>({});
  const here = blocks.find((b) => !placed[b.id]);
  return (
    <figure className="sample report-builder">
      {here && (
        <section className="report-draft" aria-label={t("Block to place")}>
          <p>
            <span className="tier" data-tier={here.tier === "would-measure" ? "would-do" : here.tier}>
              {t(TIER_LABEL[here.tier])}
            </span>{" "}
            {here.text}
          </p>
          {REPORT_FIELDS.map((f) => {
            const chosen = here[f].find((c) => c.id === picks[f]);
            return (
              <div key={f}>
                <Segmented
                  legend={t(FIELD_LABEL[f])}
                  name={`report-${here.id}-${f}`}
                  options={here[f]}
                  value={picks[f]}
                  set={(v) => setPicks({ ...picks, [f]: v })}
                />
                {chosen && <p className="hint">{chosen.feedback}</p>}
              </div>
            );
          })}
          <button
            type="button"
            className="btn btn-primary"
            disabled={!placeable(here, picks)}
            onClick={() => {
              const pick = (f: ReportField) => here[f].find((c) => c.id === picks[f])!;
              setPlaced({
                ...placed,
                [here.id]: {
                  benchmark: pick("benchmark"),
                  confidence: pick("confidence"),
                  provenance: pick("provenance"),
                },
              });
              setPicks({});
            }}
          >
            {t("Place in the report")}
          </button>
          {!placeable(here, picks) && (
            <p className="small muted">
              {t("A block goes in only with a benchmark, a confidence and a provenance.")}
            </p>
          )}
        </section>
      )}
      <article className="report-mock" aria-label={t("Teaching mock-up report")}>
        <p className="report-stamp">
          {t("Teaching mock-up · not a real report, and not any company's product")}
        </p>
        <h4>{t("The field after the drought")}</h4>
        {blocks
          .filter((b) => placed[b.id])
          .map((b) => (
            <section key={b.id} className="report-block" data-tier={b.tier}>
              <p>
                <span className="tier" data-tier={b.tier === "would-measure" ? "would-do" : b.tier}>
                  {t(TIER_LABEL[b.tier])}
                </span>{" "}
                {b.text}
              </p>
              <dl>
                {REPORT_FIELDS.map((f) => (
                  <div key={f}>
                    <dt>{t(FIELD_LABEL[f])}</dt>
                    <dd>{placed[b.id]![f].label}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        {Object.keys(placed).length === 0 && <p className="small muted">{t("No blocks placed yet.")}</p>}
      </article>
      {!here && <Result step={step} onDone={onDone} />}
    </figure>
  );
}

export function Sample({ step, onDone }: Props) {
  const Bench = {
    pipeline: Pipeline,
    jar: Jar,
    layers: Layers,
    budget: Budget,
    reports: Reports,
    report: Report,
  }[step.bench];
  return <Bench step={step} onDone={onDone} />;
}
