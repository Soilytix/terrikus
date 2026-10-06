/** Opt-in learning-study section of Settings (T33). Answers stay in this browser until the player exports them. */
import { useState } from "react";
import type { MisconceptionId } from "../content/schema";
import { MISCONCEPTIONS } from "../content/misconceptions";
import { PILOT } from "../pilot/config";
import {
  exportLog,
  loadLog,
  phaseDone,
  postOpen,
  recordPhase,
  saveLog,
  setOptIn,
  type Answer,
  type Phase,
  type PilotLog,
} from "../pilot/log";
import { ReviewBadge } from "./common";

const storage = () => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

const ANSWERS: [Answer, string][] = [
  ["true", "True"],
  ["false", "False"],
  ["not-sure", "Not sure"],
];
const CONFIDENCE: [1 | 2 | 3, string][] = [
  [1, "Guess"],
  [2, "Fairly sure"],
  [3, "Sure"],
];

type Answers = Partial<Record<MisconceptionId, { answer?: Answer; confidence?: 1 | 2 | 3 }>>;

function PilotQuestions({
  phase,
  onDone,
  onCancel,
}: {
  phase: Phase;
  onDone: (a: Record<MisconceptionId, { answer: Answer; confidence: 1 | 2 | 3 }>) => void;
  onCancel: () => void;
}) {
  const [a, setA] = useState<Answers>({});
  const set = (id: MisconceptionId, patch: Answers[MisconceptionId]) =>
    setA((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  const complete = PILOT.items.every((id) => a[id]?.answer && a[id]?.confidence);
  return (
    <form
      className="pilot-questions"
      onSubmit={(e) => {
        e.preventDefault();
        if (complete) onDone(a as Record<MisconceptionId, { answer: Answer; confidence: 1 | 2 | 3 }>);
      }}
    >
      <p className="small">
        {phase === "pre" ? "Before you play" : "After you played"}: is each statement true or false? There are
        no right answers shown and nothing is scored.
      </p>
      {PILOT.items.map((id, n) => (
        <fieldset key={id} className="pilot-item">
          <legend>
            {n + 1}. “{MISCONCEPTIONS.find((m) => m.id === id)?.misconception}”
          </legend>
          <div className="segmented">
            {ANSWERS.map(([v, label]) => (
              <label key={v}>
                <input
                  type="radio"
                  name={`${phase}-${id}-answer`}
                  checked={a[id]?.answer === v}
                  onChange={() => set(id, { answer: v })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className="segmented" aria-label="How sure are you?">
            {CONFIDENCE.map(([v, label]) => (
              <label key={v}>
                <input
                  type="radio"
                  name={`${phase}-${id}-confidence`}
                  checked={a[id]?.confidence === v}
                  onChange={() => set(id, { confidence: v })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="btn-row">
        <button type="submit" className="btn btn-primary" disabled={!complete}>
          Keep my answers
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Not now
        </button>
      </div>
    </form>
  );
}

export function PilotSettings({ chaptersComplete }: { chaptersComplete: number }) {
  const [log, setLog] = useState<PilotLog>(() => loadLog(storage(), PILOT));
  const [asking, setAsking] = useState<Phase | null>(null);
  const [confirm, setConfirm] = useState(false);
  const commit = (next: PilotLog) => {
    saveLog(storage(), next);
    setLog(next);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([exportLog(log, PILOT)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "soil-worlds-study-answers.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const after = PILOT.thresholds.postAfterChapters;
  return (
    <section className="pilot" aria-label="Learning study">
      <h3>Learning study</h3>
      <label className="pilot-toggle">
        <input
          type="checkbox"
          checked={log.optedIn}
          onChange={(e) => {
            setAsking(null);
            commit(setOptIn(log, e.target.checked));
          }}
        />
        <span>Take part in a learning study on this device</span>
      </label>
      <p className="small muted">
        A few true-or-false statements before and after you play. Answers stay in this browser and are never
        sent anywhere; you decide whether to export them.
      </p>
      {log.optedIn && (
        <>
          <ReviewBadge status={PILOT.reviewStatus} />
          {asking ? (
            <PilotQuestions
              phase={asking}
              onCancel={() => setAsking(null)}
              onDone={(a) => {
                commit(recordPhase(log, PILOT, asking, a));
                setAsking(null);
              }}
            />
          ) : !phaseDone(log, "pre") ? (
            <button type="button" className="btn" onClick={() => setAsking("pre")}>
              Answer the opening questions
            </button>
          ) : phaseDone(log, "post") ? (
            <p className="small">Both sets are in. Thank you.</p>
          ) : postOpen(log, PILOT, chaptersComplete) ? (
            <button type="button" className="btn" onClick={() => setAsking("post")}>
              Answer the closing questions
            </button>
          ) : (
            <p className="small">The closing questions open after {after} finished chapters.</p>
          )}
        </>
      )}
      {log.responses.length > 0 && !asking && (
        <div className="btn-row">
          <button type="button" className="btn" onClick={download}>
            Export study answers
          </button>
          {!confirm ? (
            <button type="button" className="btn" onClick={() => setConfirm(true)}>
              Erase study answers…
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  commit({ ...log, responses: [] });
                  setConfirm(false);
                }}
              >
                Erase
              </button>
              <button type="button" className="btn" onClick={() => setConfirm(false)}>
                Keep them
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
