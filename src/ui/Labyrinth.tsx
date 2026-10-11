/**
 * Chapter 1 pore labyrinth: guided amoeba movement on the water-film graph
 * (OD-10: choose a pore, the amoeba follows held films), and the grazer week.
 * Moisture is an experiment on the bench, never something the amoeba does.
 */
import { useEffect, useRef, useState } from "react";
import type { Fact, Step } from "../content/schema";
import { LABYRINTH, MOISTURES, blockedBy, grazerWeek, held, hop, route, type Moisture } from "../sim/films";
import { lang, t, tl } from "../i18n";
import { Facts } from "./common";

type Goal = Extract<Step, { kind: "labyrinth" }>["goals"][number];

const site = (id: string) => LABYRINTH.sites.find((s) => s.id === id)!;
const name = (id: string) => t(site(id).label);
/** Mid-sentence pore name: English lowercases it, German keeps its nouns capitalised. */
const label = (id: string) => (lang() === "en" ? name(id).toLowerCase() : name(id));
const MOISTURE_TEXT: Record<Moisture, string> = { dry: tl("dry"), moist: tl("moist"), wet: tl("wet") };
const wetness = (m: Moisture) => t(MOISTURE_TEXT[m]);

function FilmMap({ at, moisture }: { at: string; moisture: Moisture }) {
  const X = (x: number) => x * 100;
  const Y = (y: number) => y * 60;
  const here = site(at);
  return (
    <svg
      className="labyrinth-map"
      viewBox="0 0 100 60"
      role="img"
      aria-label={t("Map of the pore network in {moisture} soil. You are in the {pore}.", {
        moisture: wetness(moisture),
        pore: label(at),
      })}
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
  const [status, setStatus] = useState(() => t("You are in the entrance pore. Choose where to flow."));
  const [moving, setMoving] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const record = (to: string, outcome: Goal["outcome"]) =>
    setMet((m) =>
      goals.map((g, i) => m[i] || (g.site === to && g.moisture === moisture && g.outcome === outcome)),
    );

  const swim = (to: string) => {
    if (to === at) return setStatus(t("You are already in the {pore}.", { pore: label(to) }));
    const path = route(LABYRINTH, at, to, moisture);
    if (!path) {
      const why = blockedBy(LABYRINTH, at, to, moisture);
      record(to, why ?? "no-film");
      setStatus(
        why === "too-narrow"
          ? t("Water reaches the {pore}, but its opening is {width} µm: narrower than your body.", {
              pore: label(to),
              width: site(to).width,
            })
          : t("No connected water film leads to the {pore} in {moisture} soil. You stay where you are.", {
              pore: label(to),
              moisture: wetness(moisture),
            }),
      );
      return;
    }
    const arrive = () => {
      record(to, "reach");
      setMoving(false);
      setStatus(
        t("You followed the films: {path}.", { path: path.map(name).join(" → ") }) +
          (site(to).cells !== undefined ? t(" Bacteria here: you graze.") : ""),
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
        <legend>{t("Experiment bench: soil moisture (not something the amoeba does)")}</legend>
        {MOISTURES.map((m) => (
          <label key={m}>
            <input type="radio" name="c1-moisture" checked={moisture === m} onChange={() => setMoisture(m)} />
            <span>{wetness(m)[0]!.toUpperCase() + wetness(m).slice(1)}</span>
          </label>
        ))}
      </fieldset>
      <p className="step-text">{t("Flow to a pore:")}</p>
      <div className="choices">
        {LABYRINTH.sites
          .filter((s) => s.id !== at)
          .map((s) => (
            <button key={s.id} type="button" className="choice" disabled={moving} onClick={() => swim(s.id)}>
              {t(s.label)}
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
            {g.outcome === "reach"
              ? t("Reach the {pore} in {moisture} soil", {
                  pore: label(g.site),
                  moisture: wetness(g.moisture),
                })
              : t("Try the {pore} in {moisture} soil", {
                  pore: label(g.site),
                  moisture: wetness(g.moisture),
                })}
            <span className="sr-only">{met[i] ? t(" (done)") : t(" (not yet)")}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-primary" disabled={!done || moving} onClick={onDone}>
        {t("Continue")}
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
        {t("Teaching model: direction, not prediction.")}
      </p>
      {!run ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setRun(grazerWeek(LABYRINTH, moisture))}
        >
          {t("Run the week")}
        </button>
      ) : (
        <>
          <table className="run-table">
            <caption className="muted small">
              {t("Bacterial cells, teaching units, {moisture} soil", { moisture: wetness(moisture) })}
            </caption>
            <thead>
              <tr>
                <th scope="col">{t("Pore")}</th>
                <th scope="col">{t("Amoeba reaches it")}</th>
                <th scope="col">{t("Day 0")}</th>
                <th scope="col">{t("Day 7")}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(run.series).map(([id, s]) => (
                <tr key={id}>
                  <th scope="row">{name(id)}</th>
                  <td>{run.hunted.has(id) ? t("Yes") : t("No")}</td>
                  <td className="mono">{s[0]}</td>
                  <td className="mono">{s.at(-1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="observation">{resultText}</p>
          <Facts facts={facts} />
          <button type="button" className="btn btn-primary" onClick={onDone}>
            {t("Continue")}
          </button>
        </>
      )}
    </>
  );
}
