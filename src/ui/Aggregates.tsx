/**
 * Chapter 1 aggregate benches in the mission panel: the slake test (c1-m3) and
 * building a crumb from binding agents (c1-m4). Teaching models from
 * `src/sim/aggregates.ts`; reduced motion shows the end state at once.
 */
import { useEffect, useRef, useState } from "react";
import type { Fact } from "../content/schema";
import { AGENTS, SLAKE_TIMES, crumb, slake, type Agent, type Plot } from "../sim/aggregates";
import { Facts } from "./common";

const PLOTS: { id: Plot; label: string }[] = [
  { id: "grassland", label: "Grassland" },
  { id: "ploughed", label: "Ploughed every year" },
];

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      Teaching model: direction, not prediction.
    </p>
  );
}

function Beaker({ intact }: { intact: number }) {
  const r = 22 * Math.sqrt(intact / 100);
  const heap = (100 - intact) * 0.16;
  return (
    <svg viewBox="0 0 80 90" className="beaker" aria-hidden="true">
      <rect x="6" y="14" width="68" height="70" className="beaker-water" />
      <path d={`M10 84 Q40 ${84 - heap * 2} 70 84 Z`} className="beaker-heap" />
      <circle cx="40" cy="46" r={r} className="beaker-crumb" />
      <path d="M6 6 V84 H74 V6" className="beaker-glass" />
    </svg>
  );
}

export function Slake({
  reduced,
  resultText,
  facts,
  onDone,
}: {
  reduced: boolean;
  resultText: string;
  facts: Fact[];
  onDone: () => void;
}) {
  const [k, setK] = useState(-1);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const last = SLAKE_TIMES.length - 1;
  const start = () => {
    if (reduced) return setK(last);
    setK(0);
    const tick = (i: number) => {
      if (i > last) return;
      setK(i);
      timer.current = window.setTimeout(() => tick(i + 1), 600);
    };
    tick(0);
  };
  const t = SLAKE_TIMES[Math.max(k, 0)]!;
  return (
    <>
      <Banner />
      <div className="slake-row">
        {PLOTS.map((p) => (
          <figure key={p.id} className="slake">
            <Beaker intact={k < 0 ? 100 : slake(p.id, t)} />
            <figcaption>
              {p.label}
              {k >= 0 && (
                <>
                  : <b className="mono">{slake(p.id, t)} %</b> still holding
                </>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      {k < 0 ? (
        <button type="button" className="btn btn-primary" onClick={start}>
          Lower both into water
        </button>
      ) : (
        <p className="muted small" aria-live="polite">
          {t < 60 ? `${t} s` : `${t / 60} min`} in water
        </p>
      )}
      {k === last && (
        <>
          <p className="observation">{resultText}</p>
          <Facts facts={facts} />
          <button type="button" className="btn btn-primary" onClick={onDone}>
            Continue
          </button>
        </>
      )}
    </>
  );
}

const AGENT_LABEL: Record<Agent, string> = {
  roots: "Fine roots",
  hyphae: "Fungal hyphae",
  glue: "Microbial glue",
  "clay-om": "Clay–organic bonds",
};
const ALL = Object.keys(AGENTS) as Agent[];

export function BuildCrumb({
  resultText,
  facts,
  onDone,
}: {
  resultText: string;
  facts: Fact[];
  onDone: () => void;
}) {
  const [agents, setAgents] = useState<Agent[]>(ALL);
  const [stage, setStage] = useState<"choose" | "built" | "tilled">("choose");
  const [learnt, setLearnt] = useState(false);
  const state = crumb(agents, stage === "tilled", stage === "tilled" ? 12 : 0);
  const holds = (b: boolean) => (b ? "holds together" : "falls apart");
  return (
    <>
      <Banner />
      <fieldset className="crumb-agents" disabled={stage !== "choose"}>
        <legend>Binders in your crumb</legend>
        {ALL.map((a) => (
          <label key={a}>
            <input
              type="checkbox"
              checked={agents.includes(a)}
              onChange={() => setAgents(agents.includes(a) ? agents.filter((x) => x !== a) : [...agents, a])}
            />
            {AGENT_LABEL[a]} <span className="muted small">({AGENTS[a].lasts})</span>
          </label>
        ))}
      </fieldset>
      {stage !== "choose" && (
        <dl className="crumb-state" aria-live="polite">
          <dt>Large crumb</dt>
          <dd data-ok={state.macro}>{holds(state.macro)}</dd>
          <dt>Small clusters inside</dt>
          <dd data-ok={state.micro}>{holds(state.micro)}</dd>
          <dt>Still binding</dt>
          <dd>{state.holding.map((a) => AGENT_LABEL[a]).join(", ") || "nothing"}</dd>
        </dl>
      )}
      <div className="btn-row">
        {stage === "choose" && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!agents.length}
            onClick={() => setStage("built")}
          >
            Build the crumb
          </button>
        )}
        {stage === "built" && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setStage("tilled");
              if (agents.length === ALL.length) setLearnt(true);
            }}
          >
            Till, then wait a season
          </button>
        )}
        {stage === "tilled" && (
          <button type="button" className="btn" onClick={() => setStage("choose")}>
            Build another
          </button>
        )}
      </div>
      {!learnt && stage === "tilled" && (
        <p className="hint">Now try it with all four binders, to see which one lasts.</p>
      )}
      {learnt && (
        <>
          <p className="observation">{resultText}</p>
          <Facts facts={facts} />
          <button type="button" className="btn btn-primary" onClick={onDone}>
            Continue
          </button>
        </>
      )}
    </>
  );
}
