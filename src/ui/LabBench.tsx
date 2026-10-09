/**
 * The lab bench (world bible ch. 14): one field sampled before and after a
 * drought and read through core → extraction → PCR → sequencer. The jar of
 * reads always fills to the brim; only a spike-in says which way a group moved.
 */
import { useMemo, useState } from "react";
import type { SourceId } from "../content/sources";
import { labRun, type LabReading } from "../sim/measure";
import {
  AFTER,
  BEFORE,
  DEFAULT_LAB,
  LEVERS,
  TAXA_LABELS,
  protocol,
  type LabLevers,
  type TaxonId,
} from "../sim/benches/lab-bench";
import { SourceRef } from "./common";

const TAXA = Object.keys(TAXA_LABELS) as TaxonId[];

const LEVER_TEXT: { [K in keyof LabLevers]: { label: string; options: Record<LabLevers[K], string> } } = {
  cores: { label: "Cores per sample", options: { one: "one core", five: "five cores pooled" } },
  relic: { label: "Free DNA", options: { keep: "amplified too", remove: "removed first" } },
  spike: { label: "Spike-in", options: { none: "none", added: "known amount added" } },
  depth: { label: "Sequencing depth", options: { shallow: "2,000 reads", deep: "20,000 reads" } },
  correction: { label: "Copy-number correction", options: { off: "off", on: "database estimate" } },
};

const STAGES: { name: string; note: string; sources: SourceId[] }[] = [
  { name: "Cores", note: "Where and how many cores you take changes the sample.", sources: ["obrien-2016"] },
  {
    name: "Extraction",
    note: "Some cells resist lysis; DNA from dead cells comes along.",
    sources: ["carini-2016"],
  },
  { name: "PCR", note: "Each genome carries 1 to 15+ copies of the gene read.", sources: ["louca-2018"] },
  {
    name: "Sequencer",
    note: "A fixed number of reads: shares, not amounts. A spike-in has its own bias.",
    sources: ["gloor-2017", "smets-2016"],
  },
];

const pct = (permille: number) => (permille / 10).toFixed(1);
const arrow = (d: number) => (d > 0 ? "↑ up" : d < 0 ? "↓ down" : "→ same");

function ReadsJar({ reading, frame }: { reading: LabReading; frame: "A" | "B" }) {
  const W = 360;
  let x = 0;
  const parts = TAXA.filter((t) => reading.permille[t]! > 0).map((t) => {
    const w = (reading.permille[t]! / 1000) * W;
    const part = { t, x, w };
    x += w;
    return part;
  });
  const label = parts.map((p) => `${TAXA_LABELS[p.t]} ${pct(reading.permille[p.t]!)} %`).join(", ");
  return (
    <svg
      viewBox={`0 0 ${W} 36`}
      preserveAspectRatio="none"
      className="reads-jar"
      data-frame={frame}
      role="img"
      aria-label={`Reads: ${label}.`}
    >
      {parts.map((p) => (
        <rect key={p.t} x={p.x} y={0} width={p.w} height={36} className={`band taxon-${p.t}`} />
      ))}
    </svg>
  );
}

function SampleCard({ title, frame, reading }: { title: string; frame: "A" | "B"; reading: LabReading }) {
  return (
    <section className="jar-card" data-frame={frame} aria-label={title}>
      <header>
        <h2>
          {title}
          <span className="frame-tag">{frame === "A" ? "subject" : "comparison"}</span>
        </h2>
      </header>
      <ReadsJar reading={reading} frame={frame} />
      <dl className="lens">
        <div data-tier="measured">
          <dt>Measured</dt>
          <dd>
            <ul className="legend">
              {TAXA.map((t) => (
                <li key={t}>
                  <span className={`swatch taxon-${t}`} aria-hidden="true" />
                  <span className="legend-label">{TAXA_LABELS[t]}</span>
                  <span className="mono">
                    {reading.permille[t] ? `${pct(reading.permille[t])} %` : "not detected"}
                  </span>
                </li>
              ))}
            </ul>
            <small>
              Share of reads, always 100.0 % in total. <b className="mono">{reading.richness}</b> groups
              detected.
            </small>
          </dd>
        </div>
        <div data-tier="derived">
          <dt>Derived</dt>
          <dd>
            {reading.absolute ? (
              <>
                <ul className="legend">
                  {TAXA.map((t) => (
                    <li key={t}>
                      <span className={`swatch taxon-${t}`} aria-hidden="true" />
                      <span className="legend-label">{TAXA_LABELS[t]}</span>
                      <span className="mono">{Math.round(reading.absolute![t]!)}</span>
                    </li>
                  ))}
                </ul>
                <small>= group reads ÷ spike reads × spike added (teaching units per gram)</small>
              </>
            ) : (
              <small>No amount per gram: without a spike-in the reads only give shares.</small>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function LabBench({ backHref }: { backHref: string }) {
  const [levers, setLevers] = useState<LabLevers>(DEFAULT_LAB);
  const [seed, setSeed] = useState(1);
  const p = useMemo(() => protocol(levers), [levers]);
  const before = useMemo(() => labRun(BEFORE, p, seed), [p, seed]);
  const after = useMemo(() => labRun(AFTER, p, seed + 1000), [p, seed]);
  const truth = (c: typeof BEFORE, t: TaxonId) => c.find((x) => x.id === t)!.cells;

  return (
    <main className="bench" aria-labelledby="bench-title">
      <header className="bench-head">
        <a className="back" href={backHref}>
          ← Back to the field
        </a>
        <div>
          <h1 id="bench-title">From soil to reads</h1>
        </div>
        <p className="teaching-banner" role="note">
          <span className="dot" aria-hidden="true" />
          Teaching model: direction, not prediction.
        </p>
      </header>

      <p className="bench-brief">
        One field, sampled before and after a drought. Change the protocol and watch what each instrument
        loses or adds. The numbers are teaching values and the noise is seeded.
      </p>

      <ol className="pipeline" aria-label="What happens to a sample">
        {STAGES.map((s) => (
          <li key={s.name}>
            <b>{s.name}</b>
            <span>{s.note}</span>
            <span className="small">
              {s.sources.map((id) => (
                <SourceRef key={id} id={id} />
              ))}
            </span>
          </li>
        ))}
      </ol>

      <section className="levers lab-levers" aria-label="Protocol">
        {(Object.keys(LEVER_TEXT) as (keyof LabLevers)[]).map((k) => (
          <fieldset key={k} className="segmented">
            <legend>{LEVER_TEXT[k].label}</legend>
            {Object.keys(LEVERS[k]).map((v) => (
              <label key={v}>
                <input
                  type="radio"
                  name={`lab-${k}`}
                  checked={levers[k] === v}
                  onChange={() => setLevers({ ...levers, [k]: v })}
                />
                <span>{(LEVER_TEXT[k].options as Record<string, string>)[v]}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </section>

      <div className="jars" data-count={2}>
        <SampleCard title="Before the drought" frame="A" reading={before} />
        <SampleCard title="After the drought" frame="B" reading={after} />
      </div>

      <section className="lab-compare" aria-labelledby="compare-title">
        <h2 id="compare-title">Which way did each group move?</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Group</th>
              <th scope="col">Share of reads</th>
              <th scope="col">Amount, from the spike-in</th>
              <th scope="col">Living cells in the teaching model</th>
            </tr>
          </thead>
          <tbody>
            {TAXA.map((t) => (
              <tr key={t}>
                <th scope="row">{TAXA_LABELS[t]}</th>
                <td>{arrow(after.permille[t]! - before.permille[t]!)}</td>
                <td>
                  {before.absolute && after.absolute
                    ? arrow(Math.round(after.absolute[t]!) - Math.round(before.absolute[t]!))
                    : "cannot tell without a spike-in"}
                </td>
                <td>{arrow(truth(AFTER, t) - truth(BEFORE, t))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted small">
          The last column is the model's true state, which no instrument shows. A larger share is not a larger
          amount.
        </p>
      </section>

      <section className="bench-controls" aria-label="Sample">
        <button type="button" className="btn btn-primary" onClick={() => setSeed((s) => s + 1)}>
          Take new samples
        </button>
        <span className="muted small">
          Sample set <b className="mono">{seed}</b>: the same set always gives the same reads.
        </span>
      </section>
    </main>
  );
}
