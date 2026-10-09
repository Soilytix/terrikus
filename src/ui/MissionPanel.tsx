/**
 * The mission panel: one step at a time, predict → observe → explain. Feedback
 * is an observation or a question, never a score.
 */
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { CHAPTERS, DISCOVERIES, chapter, scene as sceneById, SCENES } from "../content";
import type { Choice, Mission, Step } from "../content/schema";
import type { Save } from "../save/schema";
import { advance, currentStep, isScanned, setFlag, stepIndex, visibleObjects } from "../app/progress";
import { appendLab } from "../save/schema";
import { RULESET_VERSION, DEFAULT_LEVERS } from "../sim/benches/leaf-jar";
import { seededOrder } from "../sim/rng";
import { href, targetHref } from "../app/router";
import { ChainBuilder } from "./ChainBuilder";
import { Composition } from "./Composition";
import { FeelTest } from "./FeelTest";
import { HandDecompose } from "./HandDecompose";
import { WaterAir } from "./WaterAir";
import { Facts } from "./common";
import type { SceneEvent } from "../world/stage";

// Chapter benches load on demand, off the initial bundle (spec §8.2); StepBody sits in one Suspense.
const BuildCrumb = lazy(() => import("./Aggregates").then((m) => ({ default: m.BuildCrumb })));
const Slake = lazy(() => import("./Aggregates").then((m) => ({ default: m.Slake })));
const BreathRust = lazy(() => import("./BreathRust").then((m) => ({ default: m.BreathRust })));
const Exchange = lazy(() => import("./Exchange").then((m) => ({ default: m.Exchange })));
const FoodWebWatch = lazy(() => import("./FoodWeb").then((m) => ({ default: m.FoodWebWatch })));
const Mobile = lazy(() => import("./FoodWeb").then((m) => ({ default: m.Mobile })));
const Ripple = lazy(() => import("./FoodWeb").then((m) => ({ default: m.Ripple })));
const SqueezingJar = lazy(() => import("./FoodWeb").then((m) => ({ default: m.SqueezingJar })));
const GrazerWeek = lazy(() => import("./Labyrinth").then((m) => ({ default: m.GrazerWeek })));
const Labyrinth = lazy(() => import("./Labyrinth").then((m) => ({ default: m.Labyrinth })));
const PhDial = lazy(() => import("./PhDial").then((m) => ({ default: m.PhDial })));
const BarePlanted = lazy(() => import("./Rhizosphere").then((m) => ({ default: m.BarePlanted })));
const HomeAway = lazy(() => import("./Rhizosphere").then((m) => ({ default: m.HomeAway })));
const RootInputs = lazy(() => import("./Rhizosphere").then((m) => ({ default: m.RootInputs })));
const WaterRoads = lazy(() => import("./WaterRoads").then((m) => ({ default: m.WaterRoads })));
const Partners = lazy(() => import("./Partners").then((m) => ({ default: m.Partners })));
const ClaimSort = lazy(() => import("./Partners").then((m) => ({ default: m.ClaimSort })));
const AmoaReading = lazy(() => import("./NitrogenRelay").then((m) => ({ default: m.AmoaReading })));
const IncubationReading = lazy(() =>
  import("./NitrogenRelay").then((m) => ({ default: m.IncubationReading })),
);
const LeakTable = lazy(() => import("./NitrogenRelay").then((m) => ({ default: m.LeakTable })));
const RelaySeason = lazy(() => import("./NitrogenRelay").then((m) => ({ default: m.RelaySeason })));
const StrawRun = lazy(() => import("./NitrogenRelay").then((m) => ({ default: m.StrawRun })));
const PitWalls = lazy(() => import("./PitWalls").then((m) => ({ default: m.PitWalls })));
const DiseaseBench = lazy(() => import("./Disease").then((m) => ({ default: m.DiseaseBench })));
const EvidenceLadder = lazy(() => import("./Disease").then((m) => ({ default: m.EvidenceLadder })));
const Fields = lazy(() => import("./Fields").then((m) => ({ default: m.Fields })));
const HillslopeRiver = lazy(() => import("./HillslopeRiver").then((m) => ({ default: m.HillslopeRiver })));
const Sample = lazy(() => import("./Sample").then((m) => ({ default: m.Sample })));

interface Props {
  mission: Mission | undefined;
  chapterId: string;
  sceneId: string;
  save: Save;
  update: (fn: (s: Save) => Save) => void;
  go: (href: string) => void;
  narrate: (text: string) => void;
  reduced: boolean;
  /** Tell the world an experiment step changed it (R02). */
  sceneEvent?: ((name: SceneEvent, value: number) => void) | undefined;
}

function Choices({
  choices: authored,
  multi,
  picked,
  setPicked,
  locked,
}: {
  choices: Choice[];
  multi?: boolean | undefined;
  picked: string[];
  setPicked: (p: string[]) => void;
  locked?: boolean | undefined;
}) {
  const choices = seededOrder(authored);
  // A radio group is one tab stop; arrows move and select (WAI-ARIA radio pattern).
  const current = Math.max(
    0,
    choices.findIndex((c) => picked.includes(c.id)),
  );
  const onArrow = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (multi || locked) return;
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const n = (current + d + choices.length) % choices.length;
    setPicked([choices[n]!.id]);
    (e.currentTarget.children[n] as HTMLElement | undefined)?.focus();
  };
  return (
    <div className="choices" role={multi ? "group" : "radiogroup"} onKeyDown={onArrow}>
      {choices.map((c, k) => {
        const on = picked.includes(c.id);
        return (
          <button
            key={c.id}
            type="button"
            className="choice"
            role={multi ? "checkbox" : "radio"}
            aria-checked={on}
            tabIndex={multi || k === current ? 0 : -1}
            disabled={locked}
            onClick={() =>
              setPicked(multi ? (on ? picked.filter((x) => x !== c.id) : [...picked, c.id]) : [c.id])
            }
          >
            <span className="choice-box" aria-hidden="true" />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function Feedback({ choices, picked }: { choices: Choice[]; picked: string[] }) {
  return (
    <ul className="feedback" aria-live="polite">
      {choices
        .filter((c) => picked.includes(c.id))
        .map((c) => (
          <li key={c.id} data-ok={c.ok}>
            <b>{c.label}.</b> {c.feedback}
          </li>
        ))}
    </ul>
  );
}

/** Where a `go` step's portal lives. */
function portalScene(step: Extract<Step, { kind: "go" }>) {
  return SCENES.find((s) =>
    s.objects.some((o) => o.to === step.scene && (!step.object || o.id === step.object)),
  );
}

function StepBody({
  mission: m,
  step,
  save,
  update,
  go,
  narrate,
  sceneId,
  reduced,
  sceneEvent,
}: Props & { mission: Mission; step: Step }) {
  const next = () => update((s) => advance(s, m.id));
  const [picked, setPicked] = useState<string[]>([]);
  const [committed, setCommitted] = useState(false);
  const [value, setValue] = useState(50);
  const [overlay, setOverlay] = useState(false);
  const [measure, setMeasure] = useState<string[]>([]);
  const key = `${m.id}:${stepIndex(save, m.id)}`;
  useEffect(() => {
    setPicked([]);
    setCommitted(false);
    setOverlay(false);
    setMeasure([]);
  }, [key]);

  switch (step.kind) {
    case "notice":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <button type="button" className="btn btn-primary" onClick={next}>
            {step.cta ?? "Continue"}
          </button>
        </>
      );
    case "go": {
      const at = portalScene(step);
      const here = at?.id === sceneId;
      return (
        <>
          <p className="step-text">{step.text}</p>
          {here ? (
            <p className="hint">The portal is pulsing in the scene.</p>
          ) : (
            at && (
              <button type="button" className="btn" onClick={() => go(targetHref(at.id))}>
                Go to {at.title}
              </button>
            )
          )}
        </>
      );
    }
    case "scan":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <ul className="checklist">
            {step.objects.map((id) => {
              const o = sceneById(m.scene)?.objects.find((x) => x.id === id);
              const done = isScanned(save, m.scene, id);
              return (
                <li key={id} data-done={done}>
                  <span className="check" aria-hidden="true" />
                  {o?.label ?? id}
                  <span className="sr-only">{done ? " (done)" : " (not yet)"}</span>
                </li>
              );
            })}
          </ul>
        </>
      );
    case "predict-slider":
      return (
        <>
          <p className="step-text">{step.question}</p>
          <p className="prediction-tag">Your prediction</p>
          <label className="slider-row big">
            <input
              type="range"
              min={step.min}
              max={step.max}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              aria-label={step.question}
              aria-valuetext={`${value} ${step.unit}`}
            />
            <output className="mono">
              {value} {step.unit}
            </output>
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              update((s) => advance({ ...s, predictions: { ...s.predictions, [step.id]: value } }, m.id));
              narrate(`Prediction committed: ${value} ${step.unit}.`);
            }}
          >
            Commit my prediction
          </button>
        </>
      );
    case "predict-choice":
      return (
        <>
          <p className="step-text">{step.question}</p>
          <p className="prediction-tag">Your prediction</p>
          <Choices
            choices={step.choices}
            multi={step.multi}
            picked={picked}
            setPicked={setPicked}
            locked={committed}
          />
          {committed && <Feedback choices={step.choices} picked={picked} />}
          {!committed ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!picked.length}
              onClick={() => {
                setCommitted(true);
                update((s) => ({ ...s, predictions: { ...s.predictions, [step.id]: picked } }));
              }}
            >
              Commit my prediction
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={next}>
              Continue
            </button>
          )}
        </>
      );
    case "observe-composition": {
      const guess = Object.entries(save.predictions).find(([k]) => k === "p-m1-solid")?.[1];
      return (
        <>
          <p className="step-text">{step.text}</p>
          {!overlay ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setOverlay(true);
                sceneEvent?.("separate", 1);
              }}
            >
              Separate the handful
            </button>
          ) : (
            <>
              <Composition guess={typeof guess === "number" ? guess : undefined} reveal />
              <p className="observation">
                {typeof guess === "number" && <>You guessed {guess} % solid. </>}
                {step.resultText}
              </p>
              <Facts facts={step.facts} />
              <button type="button" className="btn btn-primary" onClick={next}>
                Continue
              </button>
            </>
          )}
        </>
      );
    }
    case "explain-choice": {
      const pick = step.choices.find((c) => c.id === picked[0]);
      return (
        <>
          <p className="step-text">{step.question}</p>
          <Choices choices={step.choices} picked={picked} setPicked={(p) => setPicked(p)} locked={pick?.ok} />
          {pick && <Feedback choices={step.choices} picked={picked} />}
          {pick?.ok && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                update((s) => advance({ ...s, predictions: { ...s.predictions, [step.id]: pick.id } }, m.id))
              }
            >
              Continue
            </button>
          )}
          {pick && !pick.ok && <p className="hint">Look again, then choose another.</p>}
        </>
      );
    }
    case "reactive-water-air": {
      const moved = save.flags.includes(step.flag);
      return (
        <>
          <p className="step-text">{step.text}</p>
          <WaterAir
            onMoved={(water) => {
              sceneEvent?.("water", water);
              if (!moved) update((s) => setFlag(s, step.flag));
            }}
          />
          {!moved && <p className="muted small">Move the slider to continue.</p>}
          <button type="button" className="btn btn-primary" disabled={!moved} onClick={next}>
            Continue
          </button>
        </>
      );
    }
    case "hand-decompose":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <button type="button" className="btn btn-primary" onClick={() => setOverlay(true)}>
            Start eating
          </button>
          {overlay && (
            <HandDecompose
              turns={step.turns}
              cue={step.cue}
              onClose={() => setOverlay(false)}
              onDone={next}
            />
          )}
        </>
      );
    case "bench":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => go(href({ name: "bench", bench: step.bench }))}
          >
            Open the lab bench
          </button>
        </>
      );
    case "chains": {
      const done = step.chains.filter((id) => save.chains[id]).length;
      return (
        <>
          <p className="step-text">{step.text}</p>
          <button type="button" className="btn btn-primary" onClick={() => setOverlay(true)}>
            {done ? "Revisit the chain" : step.chains.length > 1 ? "Open your chains" : "Build the chain"}
          </button>
          {overlay && (
            <ChainBuilder
              chains={step.chains}
              judgeNow={!!step.judgeNow}
              save={save}
              onClose={() => setOverlay(false)}
              onSave={(answers) => update((s) => ({ ...s, chains: { ...s.chains, ...answers } }))}
              onDone={() => {
                setOverlay(false);
                next();
              }}
            />
          )}
        </>
      );
    }
    case "transfer": {
      const ok = picked.length === 1 && measure.length > 0;
      return (
        <>
          <p className="scenario">{step.scenario}</p>
          <p className="step-text">{step.question}</p>
          <Choices choices={step.choices} picked={picked} setPicked={setPicked} locked={committed} />
          <p className="step-text">What would you measure to find out?</p>
          <Choices choices={step.measure} multi picked={measure} setPicked={setMeasure} locked={committed} />
          {committed && (
            <>
              <Feedback choices={step.choices} picked={picked} />
              <Feedback choices={step.measure} picked={measure} />
            </>
          )}
          {!committed ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!ok}
              onClick={() => {
                setCommitted(true);
                const choice = step.choices.find((c) => c.id === picked[0]);
                update((s) => ({
                  ...s,
                  predictions: { ...s.predictions, [step.id]: picked, [`${step.id}-measure`]: measure },
                  labBook: appendLab(s.labBook, {
                    id: `${step.id}-${s.labBook.length + 1}`,
                    at: new Date().toISOString(),
                    bench: "leaf-jar",
                    ruleset: RULESET_VERSION,
                    mission: m.id,
                    prediction: choice?.label ?? "",
                    a: DEFAULT_LEVERS,
                    result: `If I measured ${measure
                      .map((id) => step.measure.find((c) => c.id === id)?.label.toLowerCase())
                      .join(
                        " and ",
                      )}, then I could tell whether the woody residue follows the leaf's chain, because each brake shows up in how fast mass and CO₂ change.`,
                    tier: "would-do",
                  }),
                }));
              }}
            >
              Commit my reasoning
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={next}>
              Continue
            </button>
          )}
        </>
      );
    }
    case "discover": {
      const guess = step.recall && save.predictions[step.recall.prediction];
      return (
        <>
          {step.recall && guess !== undefined && (
            <p className="observation">
              You predicted{" "}
              <b className="mono">
                {Array.isArray(guess) ? guess.join(", ") : guess} {step.recall.unit}
              </b>
              ; {step.recall.observed}.
            </p>
          )}
          <ul className="discoveries">
            {step.discoveries.map((id) => {
              const d = DISCOVERIES.find((x) => x.id === id);
              return (
                <li key={id}>
                  <span className="tier" data-tier={d?.evidenceTier}>
                    {d?.evidenceTier}
                  </span>
                  {d?.statement}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              next();
              narrate("Added to your notebook.");
            }}
          >
            Add to my notebook
          </button>
        </>
      );
    }
    case "feel-test":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <FeelTest diagram={step.diagram} sample={step.sample} onClass={next} />
          <Facts facts={step.facts} />
        </>
      );
    case "labyrinth":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <Labyrinth goals={step.goals} reduced={reduced} onDone={next} />
        </>
      );
    case "grazer-week":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <GrazerWeek
            moisture={step.moisture}
            resultText={step.resultText}
            facts={step.facts}
            onDone={next}
          />
        </>
      );
    case "slake":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <Slake reduced={reduced} resultText={step.resultText} facts={step.facts} onDone={next} />
        </>
      );
    case "build-crumb":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <BuildCrumb resultText={step.resultText} facts={step.facts} onDone={next} />
        </>
      );
    case "water":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <WaterRoads step={step} reduced={reduced} onDone={next} />
        </>
      );
    case "exchange":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <Exchange mode={step.mode} resultText={step.resultText} facts={step.facts} onDone={next} />
        </>
      );
    case "ph-dial":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <PhDial resultText={step.resultText} facts={step.facts} onDone={next} />
        </>
      );
    case "redox":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <BreathRust step={step} onDone={next} />
        </>
      );
    case "pit":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <Suspense fallback={<p className="muted small">Loading…</p>}>
            <PitWalls step={step} reduced={reduced} onDone={next} />
          </Suspense>
        </>
      );
    case "fields":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <Suspense fallback={<p className="muted small">Loading…</p>}>
            <Fields step={step} onDone={next} />
          </Suspense>
        </>
      );
    case "hill":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <Suspense fallback={<p className="muted small">Loading…</p>}>
            <HillslopeRiver step={step} reduced={reduced} onDone={next} />
          </Suspense>
        </>
      );
    case "sample":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <Suspense fallback={<p className="muted small">Loading…</p>}>
            <Sample step={step} onDone={next} />
          </Suspense>
        </>
      );
    case "food-web": {
      const seen = save.flags.filter((f) => f.startsWith("seen:")).map((f) => f.slice(5));
      const missing = step.reveal.filter((id) => !seen.includes(id));
      return (
        <>
          <p className="step-text">{step.text}</p>
          <FoodWebWatch
            watch={step.watch}
            seen={seen}
            onSeen={(links) => update((s) => links.reduce((acc, id) => setFlag(acc, `seen:${id}`), s))}
          />
          {missing.length > 0 && (
            <p className="muted small">
              {missing.length} link{missing.length > 1 ? "s" : ""} still to see.
            </p>
          )}
          <button type="button" className="btn btn-primary" disabled={missing.length > 0} onClick={next}>
            Continue
          </button>
        </>
      );
    }
    case "food-web-remove": {
      const seen = save.flags.filter((f) => f.startsWith("seen:")).map((f) => f.slice(5));
      return (
        <>
          <p className="step-text">{step.text}</p>
          <Mobile seen={seen} removed={step.remove} />
          <p className="step-text">{step.question}</p>
          <p className="prediction-tag">Your prediction</p>
          <Choices choices={step.choices} picked={picked} setPicked={setPicked} locked={committed} />
          {committed && <Feedback choices={step.choices} picked={picked} />}
          {!committed ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!picked.length}
              onClick={() => {
                setCommitted(true);
                update((s) => ({ ...s, predictions: { ...s.predictions, [step.id]: picked } }));
              }}
            >
              Commit my prediction
            </button>
          ) : !overlay ? (
            <button type="button" className="btn btn-primary" onClick={() => setOverlay(true)}>
              Run both webs
            </button>
          ) : (
            <>
              <Ripple removed={step.remove} />
              <button type="button" className="btn btn-primary" onClick={next}>
                Continue
              </button>
            </>
          )}
        </>
      );
    }
    case "squeezing-jar": {
      const pick = step.choices.find((c) => c.id === picked[0]);
      return (
        <>
          <p className="step-text">{step.text}</p>
          <SqueezingJar facts={step.facts} />
          <p className="step-text">{step.question}</p>
          <Choices choices={step.choices} picked={picked} setPicked={setPicked} locked={pick?.ok} />
          {pick && <Feedback choices={step.choices} picked={picked} />}
          {pick?.ok && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                update((s) => advance({ ...s, predictions: { ...s.predictions, [step.id]: pick.id } }, m.id))
              }
            >
              Continue
            </button>
          )}
          {pick && !pick.ok && <p className="hint">Look again, then choose another.</p>}
        </>
      );
    }
    case "root-inputs":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <RootInputs facts={step.facts} />
          <button type="button" className="btn btn-primary" onClick={next}>
            Continue
          </button>
        </>
      );
    case "bare-planted":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <p className="step-text">{step.question}</p>
          <p className="prediction-tag">Your prediction</p>
          <Choices choices={step.choices} picked={picked} setPicked={setPicked} locked={committed} />
          {committed && <Feedback choices={step.choices} picked={picked} />}
          {!committed ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!picked.length}
              onClick={() => {
                setCommitted(true);
                update((s) => ({ ...s, predictions: { ...s.predictions, [step.id]: picked } }));
              }}
            >
              Commit my prediction
            </button>
          ) : !overlay ? (
            <button type="button" className="btn btn-primary" onClick={() => setOverlay(true)}>
              Run both plots
            </button>
          ) : (
            <>
              <BarePlanted />
              <button type="button" className="btn btn-primary" onClick={next}>
                Continue
              </button>
            </>
          )}
        </>
      );
    case "home-away": {
      const pick = step.choices.find((c) => c.id === picked[0]);
      return (
        <>
          <p className="step-text">{step.text}</p>
          <HomeAway facts={step.facts} />
          <p className="step-text">{step.question}</p>
          <Choices choices={step.choices} picked={picked} setPicked={setPicked} locked={pick?.ok} />
          {pick && <Feedback choices={step.choices} picked={picked} />}
          {pick?.ok && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                update((s) => advance({ ...s, predictions: { ...s.predictions, [step.id]: pick.id } }, m.id))
              }
            >
              Continue
            </button>
          )}
          {pick && !pick.ok && <p className="hint">Look again, then choose another.</p>}
        </>
      );
    }
    case "disease":
    case "evidence-ladder":
      return (
        <>
          <p className="step-text">{step.text}</p>
          {step.kind === "disease" ? (
            <DiseaseBench step={step} onDone={next} />
          ) : (
            <EvidenceLadder step={step} onDone={next} />
          )}
        </>
      );
    case "partners":
    case "claim-sort":
      return (
        <>
          <p className="step-text">{step.text}</p>
          {step.kind === "partners" ? (
            <Partners step={step} onDone={next} />
          ) : (
            <ClaimSort step={step} onDone={next} />
          )}
        </>
      );
    case "relay": {
      // `measure` holds the legs handed on so far.
      const leg = step.legs[measure.length];
      const pick = leg?.choices.find((c) => c.id === picked[0]);
      return (
        <>
          <p className="step-text">{step.text}</p>
          {measure.length > 0 && (
            <ol className="baton" aria-label="Handoffs so far">
              {step.legs.slice(0, measure.length).map((l) => (
                <li key={l.id}>
                  {l.from} → {l.to}: <b>{l.choices.find((c) => c.ok)?.label}</b>
                </li>
              ))}
            </ol>
          )}
          {leg ? (
            <>
              <p className="step-text">
                Who carries the baton from <b>{leg.from}</b> to <b>{leg.to}</b>?
              </p>
              <Choices choices={leg.choices} picked={picked} setPicked={setPicked} locked={pick?.ok} />
              {pick && !pick.ok && (
                <div className="explain-card" role="note" aria-live="polite">
                  <b>Misplaced handoff.</b> {pick.feedback}
                </div>
              )}
              {pick?.ok && (
                <>
                  <Feedback choices={leg.choices} picked={picked} />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setMeasure([...measure, leg.id]);
                      setPicked([]);
                    }}
                  >
                    Hand on the baton
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <RelaySeason />
              <Facts facts={step.facts} />
              <button type="button" className="btn btn-primary" onClick={next}>
                Continue
              </button>
            </>
          )}
        </>
      );
    }
    case "straw-run":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <StrawRun facts={step.facts} />
          <button type="button" className="btn btn-primary" onClick={next}>
            Continue
          </button>
        </>
      );
    case "leak-hunt": {
      const leaks = step.spots.filter((s) => s.ok);
      const found = leaks.filter((s) => picked.includes(s.id));
      return (
        <>
          <p className="step-text">{step.text}</p>
          <Choices
            choices={step.spots}
            multi
            picked={picked}
            setPicked={(p) => setPicked([...new Set([...picked, ...p])])}
          />
          <Feedback choices={step.spots} picked={picked} />
          <p className="hint" aria-live="polite">
            Leaks found: {found.length} of {leaks.length}
          </p>
          {found.length === leaks.length && (
            <>
              <LeakTable found={found} />
              <Facts facts={step.facts} />
              <button type="button" className="btn btn-primary" onClick={next}>
                Continue
              </button>
            </>
          )}
        </>
      );
    }
    case "gene-rate": {
      // `measure` holds the second measurements tried; a claim unlocks only after a rate.
      const rate = step.measurements.some((c) => c.ok && measure.includes(c.id));
      const pick = step.claims.find((c) => c.id === picked[0]);
      return (
        <>
          <p className="step-text">{step.text}</p>
          <AmoaReading />
          <Facts facts={step.facts} />
          <p className="step-text">Choose a second measurement before you make a claim.</p>
          <div className="watch-row">
            {step.measurements.map((c) => (
              <button
                key={c.id}
                type="button"
                className="btn"
                disabled={measure.includes(c.id)}
                onClick={() => setMeasure([...measure, c.id])}
              >
                {c.label}
              </button>
            ))}
          </div>
          <Feedback choices={step.measurements} picked={measure} />
          {rate && <IncubationReading />}
          <p className="step-text">{step.question}</p>
          {!rate && <p className="hint">No claim yet: a gene count alone cannot say how fast.</p>}
          <Choices choices={step.claims} picked={picked} setPicked={setPicked} locked={!rate || pick?.ok} />
          {pick && <Feedback choices={step.claims} picked={picked} />}
          {pick?.ok && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                update((s) =>
                  advance(
                    { ...s, predictions: { ...s.predictions, [step.id]: [pick.id, ...measure] } },
                    m.id,
                  ),
                )
              }
            >
              Continue
            </button>
          )}
          {pick && !pick.ok && <p className="hint">Look again, then choose another.</p>}
        </>
      );
    }
    case "rumor":
      return (
        <>
          <p className="step-text">{step.text}</p>
          <button type="button" className="btn btn-primary" onClick={next}>
            Keep the question
          </button>
        </>
      );
  }
}

export function MissionPanel(props: Props) {
  const { mission: m, save, chapterId, sceneId, go } = props;
  const pending = m && currentStep(save, m);
  // On a phone the sheet would cover the scene: steps played in the world start folded.
  const [open, setOpen] = useState(
    () =>
      !(
        window.matchMedia("(max-width: 760px)").matches &&
        (!pending || pending.kind === "go" || pending.kind === "scan" || (m && m.scene !== sceneId))
      ),
  );
  const body = useRef<HTMLDivElement>(null);
  const focusedStep = useRef<number | null>(null);
  const idx = m ? stepIndex(save, m.id) : -1;
  const idxRef = useRef(idx);
  idxRef.current = idx;
  // A step's controls replace each other as it advances; when the focused one vanished or was
  // disabled, keep the keyboard here: a new step starts at its first control, a running step
  // continues at its primary button. Step-local state re-renders only StepBody, so a
  // MutationObserver on the body (not this component's render) triggers the restore, after the
  // new controls are in the DOM.
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const restore = () => {
      const a = document.activeElement;
      if (a && a !== document.body && !(el.contains(a) && a.matches(":disabled"))) return;
      const fresh = focusedStep.current !== idxRef.current;
      focusedStep.current = idxRef.current;
      const control = ":is(button, input, select, [tabindex='0']):not([disabled])";
      const target =
        (!fresh && el.querySelector<HTMLElement>(`.btn-primary${control}`)) ||
        el.querySelector<HTMLElement>(control) ||
        el;
      target.focus({ preventScroll: true });
    };
    restore();
    const watch = new MutationObserver(restore);
    watch.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });
    return () => watch.disconnect();
  }, [open, m?.id]);
  const ch = chapter(chapterId);
  if (!ch) return null;

  if (!m) {
    const next = CHAPTERS.find((c) => c.after.includes(ch.id) && save.chaptersUnlocked.includes(c.id));
    const entry = next && sceneById(next.entry);
    return (
      <aside className="mission" aria-label="Chapter" data-open={open}>
        <header className="mission-head">
          <h2>{ch.title} · complete</h2>
        </header>
        <div className="mission-body">
          {next && entry ? (
            <>
              <p className="step-text">
                A new question waits in the valley: “{next.hook}” Find {entry.title.toLowerCase()}.
              </p>
              <button type="button" className="btn btn-primary" onClick={() => go(targetHref("valley"))}>
                Back to the valley
              </button>
            </>
          ) : (
            <p className="step-text">
              Everything in this chapter is in your notebook. The rest of the valley is still being written:
              its questions wait as rumors.
            </p>
          )}
        </div>
      </aside>
    );
  }

  const step = currentStep(save, m);
  const i = stepIndex(save, m.id);
  const away = m.scene !== sceneId && step && step.kind !== "go" && step.kind !== "bench" && i === 0;
  const where = sceneById(m.scene);
  const here = sceneById(sceneId);
  const portalInView =
    !!here && visibleObjects(here, save).some((o) => o.kind === "portal" && o.to === m.scene);
  return (
    <aside className="mission" aria-label={`Mission: ${m.title}`} data-open={open}>
      <header className="mission-head">
        <button type="button" className="mission-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
          <h2>{m.title}</h2>
          <span className="chev" aria-hidden="true" />
        </button>
        <ol className="steps-dots" aria-label={`Step ${i + 1} of ${m.steps.length}`}>
          {m.steps.map((s, k) => (
            <li key={k} data-state={k < i ? "done" : k === i ? "now" : "todo"} title={s.kind} />
          ))}
        </ol>
      </header>
      {open && (
        <div className="mission-body" ref={body} tabIndex={-1}>
          {away && where ? (
            <>
              <p className="step-text">This mission starts at {where.title.toLowerCase()}.</p>
              {portalInView ? (
                <p className="hint">The portal is pulsing in the scene.</p>
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => go(targetHref(where.id))}>
                  Go there
                </button>
              )}
            </>
          ) : (
            step && (
              <Suspense fallback={<p className="hint">Setting up the bench…</p>}>
                <StepBody {...props} mission={m} step={step} />
              </Suspense>
            )
          )}
        </div>
      )}
    </aside>
  );
}
