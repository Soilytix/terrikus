/**
 * Chapter 10 benches in the mission panel, on the rules in `src/sim/disease.ts`:
 * the disease triangle, the rotation wheel, the suppressive-soil pots and the
 * evidence ladder. Loaded lazily, off the initial bundle.
 */
import { useState } from "react";
import type { Step } from "../content/schema";
import {
  claimable,
  LADDER,
  nextRung,
  rotate,
  sickSeedlings,
  triangle,
  type Cover,
  type Crop,
  type Pot,
  type Rotation,
  type Rung,
  type Triangle,
} from "../sim/disease";
import { Facts } from "./common";

type DiseaseStep = Extract<Step, { kind: "disease" }>;
type LadderStep = Extract<Step, { kind: "evidence-ladder" }>;

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      Teaching model: direction, not prediction.
    </p>
  );
}

function Result({ step, onDone }: { step: DiseaseStep; onDone: () => void }) {
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

function Seg<T extends string>({
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

function Bar({ v, max, text }: { v: number; max: number; text?: string }) {
  return (
    <td>
      <span className="ripple-bar" style={{ width: `${(v / Math.max(1, max)) * 100}%` }} />
      <span className="mono">{text ?? v}</span>
    </td>
  );
}

const VERTEX: { key: keyof Omit<Triangle, "suppressive">; label: string }[] = [
  { key: "host", label: "Host: peas sown" },
  { key: "pathogen", label: "Pathogen: root rot in the soil" },
  { key: "conducive", label: "Environment: wet spring" },
];

/** c10-m1: switch the vertices; DNA tracks the pathogen, disease needs all three. */
function TriangleBench({ step, onDone }: { step: DiseaseStep; onDone: () => void }) {
  const [t, setT] = useState<Triangle>({ host: true, pathogen: true, conducive: false });
  const [log, setLog] = useState<(Triangle & ReturnType<typeof triangle>)[]>([]);
  const run = () => setLog([{ ...t, ...triangle(t) }, ...log]);
  const presentNotSick = log.some((l) => l.detected && !l.disease);
  const sick = log.some((l) => l.disease);
  return (
    <figure className="ripple disease">
      <Banner />
      <fieldset className="toggles">
        <legend>The three vertices</legend>
        {VERTEX.map((v) => (
          <label key={v.key}>
            <input type="checkbox" checked={t[v.key]} onChange={() => setT({ ...t, [v.key]: !t[v.key] })} />
            <span>{v.label}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" className="btn" onClick={run}>
        Grow a season
      </button>
      {log.length > 0 && (
        <table aria-label="Seasons grown">
          <thead>
            <tr>
              <th scope="col">Host · pathogen · wet</th>
              <th scope="col">Pathogen DNA</th>
              <th scope="col">Disease</th>
            </tr>
          </thead>
          <tbody aria-live="polite">
            {log.map((l, i) => (
              <tr key={log.length - i} data-key={l.disease ? "plant" : undefined}>
                <th scope="row">
                  {[l.host, l.pathogen, l.conducive].map((x) => (x ? "on" : "off")).join(" · ")}
                </th>
                <td>{l.detected ? "detected" : "not detected"}</td>
                <td>{l.disease ? "sick peas" : "healthy peas"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {presentNotSick && sick ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">
          Find a season with the pathogen detected and the peas healthy, and one with sick peas.
        </p>
      )}
    </figure>
  );
}

const CROP_NAME: Record<Crop, string> = {
  pea: "Pea",
  bean: "Bean",
  cereal: "Cereal",
  sugarbeet: "Sugar beet",
};
const ROTATION_NAME: Record<Rotation, string> = { short: "Pea–bean every year", long: "Six-year rotation" };
const COVER_NAME: Record<Cover, string> = { none: "No cover", vetch: "Vetch cover", oat: "Oat cover" };

/** c10-m2: six seasons round the wheel; resting inoculum carried from each to the next. */
function RotationWheel({ step, onDone }: { step: DiseaseStep; onDone: () => void }) {
  const [rotation, setRotation] = useState<Rotation>("short");
  const [cover, setCover] = useState<Cover>("none");
  const [tried, setTried] = useState<string[]>(["short", "none"]);
  const seasons = rotate(rotation, cover);
  const max = Math.max(...rotate("short", "vetch").map((s) => s.inoculum));
  const pick =
    <T extends string>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setTried((t) => (t.includes(v) ? t : [...t, v]));
    };
  const done = ["short", "long", "vetch", "oat"].every((k) => tried.includes(k));
  return (
    <figure className="ripple disease">
      <Banner />
      <Seg
        legend="Rotation"
        options={["short", "long"] as const}
        value={rotation}
        set={pick<Rotation>(setRotation)}
        label={(r) => ROTATION_NAME[r]}
      />
      <Seg
        legend="Winter cover"
        options={["none", "vetch", "oat"] as const}
        value={cover}
        set={pick<Cover>(setCover)}
        label={(c) => COVER_NAME[c]}
      />
      <table aria-label="Six seasons">
        <thead>
          <tr>
            <th scope="col">Season</th>
            <th scope="col">Resting spores at sowing</th>
            <th scope="col">Pathogen DNA · disease</th>
          </tr>
        </thead>
        <tbody aria-live="polite">
          {seasons.map((s) => (
            <tr key={s.season} data-key={s.disease ? "plant" : undefined}>
              <th scope="row">
                {s.season}. {CROP_NAME[s.crop]}, {s.wet ? "wet" : "dry"} spring
              </th>
              <Bar v={s.inoculum} max={max} />
              <td>
                {s.detected ? "detected" : "not detected"} · {s.disease ? "sick" : "healthy"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>
        Resting spores in teaching units per gram. Disease needs a host, enough spores and a wet spring.
      </figcaption>
      {done ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">Run both rotations, and try a vetch and an oat cover.</p>
      )}
    </figure>
  );
}

const POTS: { id: string; label: string; pot: Pot }[] = [
  { id: "conducive", label: "Conducive soil", pot: { soil: "conducive" } },
  { id: "suppressive", label: "Suppressive soil", pot: { soil: "suppressive" } },
  { id: "mix-0.1", label: "Conducive + 0.1 % suppressive", pot: { soil: "mix", percent: 0.1 } },
  { id: "mix-1", label: "Conducive + 1 % suppressive", pot: { soil: "mix", percent: 1 } },
  { id: "mix-10", label: "Conducive + 10 % suppressive", pot: { soil: "mix", percent: 10 } },
  { id: "sterile-s", label: "Suppressive soil, sterilised", pot: { soil: "suppressive", sterilised: true } },
  {
    id: "sterile-mix",
    label: "Conducive + 10 % sterilised suppressive",
    pot: { soil: "mix", percent: 10, sterilised: true },
  },
];

/** c10-m3: beet and the fungus in every pot; what differs is the soil. */
function TransferPots({ step, onDone }: { step: DiseaseStep; onDone: () => void }) {
  const [ran, setRan] = useState<string[]>(["conducive", "suppressive"]);
  const done = ran.some((id) => id === "mix-1" || id === "mix-10") && ran.includes("sterile-s");
  return (
    <figure className="ripple disease">
      <Banner />
      <table aria-label="Pot test">
        <thead>
          <tr>
            <th scope="col">Pot (beet + fungus added)</th>
            <th scope="col">Sick seedlings of 100</th>
          </tr>
        </thead>
        <tbody aria-live="polite">
          {POTS.map((p) => (
            <tr key={p.id}>
              <th scope="row">{p.label}</th>
              {ran.includes(p.id) ? (
                <Bar v={sickSeedlings(p.pot)} max={100} />
              ) : (
                <td>
                  <button type="button" className="chip-btn" onClick={() => setRan([...ran, p.id])}>
                    Run this pot
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>Counts are the bench&apos;s teaching values, one pot per soil.</figcaption>
      {done ? (
        <Result step={step} onDone={onDone} />
      ) : (
        <p className="hint">Run a mix of at least 1 % and the sterilised suppressive soil.</p>
      )}
    </figure>
  );
}

export function DiseaseBench({ step, onDone }: { step: DiseaseStep; onDone: () => void }) {
  const Bench = { triangle: TriangleBench, rotation: RotationWheel, transfer: TransferPots }[step.bench];
  return <Bench step={step} onDone={onDone} />;
}

const RUNG_NAME: Record<Rung, string> = {
  outcome: "Observed disease outcome",
  hypothesis: "Suppression hypothesis",
  candidate: "DNA or pathway candidate",
  assay: "Compound or activity assay",
  "plant-test": "Plant test",
  field: "Field evidence across environments",
};

/** c10-m4: climb rung by rung; each claim opens only with its rung and those below. Overreach never opens. */
export function EvidenceLadder({ step, onDone }: { step: LadderStep; onDone: () => void }) {
  const [held, setHeld] = useState<Rung[]>([]);
  const [tried, setTried] = useState<string[]>([]);
  const up = nextRung(held);
  return (
    <figure className="disease evidence-ladder">
      <ol className="ladder-rungs" reversed>
        {[...LADDER].reverse().map((id) => {
          const r = step.rungs.find((x) => x.id === id)!;
          const open = claimable(id, held);
          return (
            <li key={id} data-held={open} data-tier={id === "field" ? "would-measure" : undefined}>
              <b>{RUNG_NAME[id]}</b>
              {open ? (
                <>
                  <p>{r.evidence}</p>
                  <p className="ladder-claim">
                    <b>Claim unlocked</b> {r.claim}
                  </p>
                  <p className="ladder-not">
                    <b>Not supported yet</b> {r.notYet}
                  </p>
                </>
              ) : id === up ? (
                <button type="button" className="btn" onClick={() => setHeld([...held, id])}>
                  Collect the evidence
                </button>
              ) : (
                <p className="muted small">Locked: climb the rungs below first.</p>
              )}
            </li>
          );
        })}
      </ol>
      <p className="step-text">Some claims no rung opens. Try one:</p>
      <div className="watch-row">
        {step.overreach.map((c) => (
          <button
            key={c.id}
            type="button"
            className="btn"
            aria-pressed={tried.includes(c.id)}
            onClick={() => setTried(tried.includes(c.id) ? tried : [...tried, c.id])}
          >
            {c.label}
          </button>
        ))}
      </div>
      {step.overreach
        .filter((c) => tried.includes(c.id))
        .map((c) => (
          <div key={c.id} className="explain-card" role="note" aria-live="polite">
            <b>Not supported by any rung.</b> {c.feedback}
          </div>
        ))}
      {!up && (
        <>
          <Facts facts={step.facts} />
          <button type="button" className="btn btn-primary" onClick={onDone}>
            Continue
          </button>
        </>
      )}
    </figure>
  );
}
