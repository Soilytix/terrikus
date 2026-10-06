/**
 * Chapter 1 pore labyrinth: guided amoeba movement on the water-film graph
 * (OD-10: choose a pore, the amoeba follows held films), and the grazer week.
 * Moisture is an experiment on the bench, never something the amoeba does.
 */
import { useEffect, useRef, useState } from "react";
import type { Fact, Step } from "../content/schema";
import { LABYRINTH, MOISTURES, blockedBy, grazerWeek, held, hop, route, type Moisture } from "../sim/films";
import { Facts } from "./common";

type Goal = Extract<Step, { kind: "labyrinth" }>["goals"][number];

const site = (id: string) => LABYRINTH.sites.find((s) => s.id === id)!;
const label = (id: string) => site(id).label.toLowerCase();

function FilmMap({ at, moisture }: { at: string; moisture: Moisture }) {
  const X = (x: number) => x * 100;
  const Y = (y: number) => y * 60;
  const here = site(at);
  return (
    <svg
      className="labyrinth-map"
      viewBox="0 0 100 60"
      role="img"
      aria-label={`Map of the pore network in ${moisture} soil. You are in the ${label(at)}.`}
    >
      {LABYRINTH.necks.map((n) => {
        const a = site(n.a);
        const b = site(n.b);
        return (
          <line
            key={`${n.a}-${n.b}`}
            x1={X(a.x)}
            y1={Y(a.y)}
            x2={X(b.x)}
            y2={Y(b.y)}
            className="film"
            data-held={held(n, moisture)}
          />
        );
      })}
      {LABYRINTH.sites.map((s) => (
        <g key={s.id}>
          <circle
            cx={X(s.x)}
            cy={Y(s.y)}
            r={1.2 + Math.log2(s.width) * 0.6}
            className="pore"
            data-colony={s.cells !== undefined}
          />
          <text x={X(s.x)} y={Y(s.y) + 8} textAnchor="middle" className="pore-label">
            {s.width} µm
          </text>
        </g>
      ))}
      <circle cx={X(here.x)} cy={Y(here.y)} r={2.4} className="amoeba-dot" />
    </svg>
  );
}

export function Labyrinth({
  goals,
  reduced,
  onDone,
}: {
  goals: Goal[];
  reduced: boolean;
  onDone: () => void;
}) {
  const [at, setAt] = useState("entry");
  const [moisture, setMoisture] = useState<Moisture>("moist");
  const [met, setMet] = useState<boolean[]>(() => goals.map(() => false));
  const [status, setStatus] = useState("You are in the entrance pore. Choose where to flow.");
  const [moving, setMoving] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const record = (to: string, outcome: Goal["outcome"]) =>
    setMet((m) =>
      goals.map((g, i) => m[i] || (g.site === to && g.moisture === moisture && g.outcome === outcome)),
    );

  const swim = (to: string) => {
    if (to === at) return setStatus(`You are already in the ${label(to)}.`);
    const path = route(LABYRINTH, at, to, moisture);
    if (!path) {
      const why = blockedBy(LABYRINTH, at, to, moisture);
      record(to, why ?? "no-film");
      setStatus(
        why === "too-narrow"
          ? `Water reaches the ${label(to)}, but its opening is ${site(to).width} µm: narrower than your body.`
          : `No connected water film leads to the ${label(to)} in ${moisture} soil. You stay where you are.`,
      );
      return;
    }
    const arrive = () => {
      record(to, "reach");
      setMoving(false);
      setStatus(
        `You followed the films: ${path.map((p) => site(p).label).join(" → ")}.` +
          (site(to).cells !== undefined ? " Bacteria here: you graze." : ""),
      );
    };
    if (reduced) {
      setAt(to);
      return arrive();
    }
    // One hop per beat; `hop` refuses anything but a held film into a wide-enough pore.
    setMoving(true);
    let k = 1;
    let cur = path[0]!;
    const next = () => {
      cur = hop(LABYRINTH, cur, path[k]!, moisture);
      setAt(cur);
      k++;
      if (k < path.length) timer.current = window.setTimeout(next, 350);
      else arrive();
    };
    timer.current = window.setTimeout(next, 200);
  };

  const done = met.every(Boolean);
  return (
    <div className="labyrinth">
      <FilmMap at={at} moisture={moisture} />
      <fieldset className="segmented" disabled={moving}>
        <legend>Experiment bench: soil moisture (not something the amoeba does)</legend>
        {MOISTURES.map((m) => (
          <label key={m}>
            <input type="radio" name="c1-moisture" checked={moisture === m} onChange={() => setMoisture(m)} />
            <span>{m[0]!.toUpperCase() + m.slice(1)}</span>
          </label>
        ))}
      </fieldset>
      <p className="step-text">Flow to a pore:</p>
      <div className="choices">
        {LABYRINTH.sites
          .filter((s) => s.id !== at)
          .map((s) => (
            <button key={s.id} type="button" className="choice" disabled={moving} onClick={() => swim(s.id)}>
              {s.label}
            </button>
          ))}
      </div>
      <p className="observation" aria-live="polite">
        {status}
      </p>
      <ul className="checklist">
        {goals.map((g, i) => (
          <li key={i} data-done={met[i]}>
            <span className="check" aria-hidden="true" />
            {g.outcome === "reach" ? "Reach" : "Try"} the {label(g.site)} in {g.moisture} soil
            <span className="sr-only">{met[i] ? " (done)" : " (not yet)"}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-primary" disabled={!done || moving} onClick={onDone}>
        Continue
      </button>
    </div>
  );
}

export function GrazerWeek({
  moisture,
  resultText,
  facts,
  onDone,
}: {
  moisture: Moisture;
  resultText: string;
  facts: Fact[];
  onDone: () => void;
}) {
  const [run, setRun] = useState<ReturnType<typeof grazerWeek> | null>(null);
  return (
    <>
      <p className="teaching-banner" role="note">
        <span className="dot" aria-hidden="true" />
        Teaching model: direction, not prediction.
      </p>
      {!run ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setRun(grazerWeek(LABYRINTH, moisture))}
        >
          Run the week
        </button>
      ) : (
        <>
          <table className="run-table">
            <caption className="muted small">Bacterial cells, teaching units, {moisture} soil</caption>
            <thead>
              <tr>
                <th scope="col">Pore</th>
                <th scope="col">Amoeba reaches it</th>
                <th scope="col">Day 0</th>
                <th scope="col">Day 7</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(run.series).map(([id, s]) => (
                <tr key={id}>
                  <th scope="row">{site(id).label}</th>
                  <td>{run.hunted.has(id) ? "Yes" : "No"}</td>
                  <td className="mono">{s[0]}</td>
                  <td className="mono">{s.at(-1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
