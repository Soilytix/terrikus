/**
 * Cause-chain builder (world-bible §7.2). Cards carry their kind as a shape and
 * a word, never colour alone. Chains are judged in a batch against the
 * player's own runs: supported, plausible but untested, or contradicted.
 */
import { useState } from "react";
import { card } from "../content/chains";
import { chainTemplate } from "../content/chains";
import type { ChainTemplate, Connector } from "../content/schema";
import type { ChainAnswer, Save } from "../save/schema";
import { judge, VERDICT_LABEL, type Judgement } from "../app/verdict";
import { Dialog } from "./common";

const CONNECTOR_LABEL: Record<Connector, string> = {
  increases: "increases",
  decreases: "decreases",
  enables: "enables",
  limits: "limits",
  "only-if": "only if",
  releases: "releases",
  "is-associated-with": "is associated with",
};
const CONFIDENCE = ["", "A hunch", "Fairly sure", "Sure"] as const;

type Draft = { cards: string[]; connectors: (Connector | "")[]; confidence: 0 | 1 | 2 | 3 };

function initial(t: ChainTemplate, prev?: ChainAnswer): Draft {
  if (prev) return { cards: [...prev.cards], connectors: [...prev.connectors], confidence: prev.confidence };
  return {
    cards: t.cards.map((opts) => (opts.length === 1 ? (opts[0] ?? "") : "")),
    connectors: t.connectors.map((opts) => (opts.length === 1 ? (opts[0] ?? "") : "")),
    confidence: 0,
  };
}

const complete = (d: Draft) => d.cards.every(Boolean) && d.connectors.every(Boolean) && d.confidence > 0;

function CardSlot({
  options,
  value,
  onChange,
  index,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  index: number;
}) {
  const c = card(value);
  if (options.length === 1 && c)
    return (
      <span className="cause-card" data-kind={c.kind}>
        <span className="cause-kind">{c.kind}</span>
        {c.label}
      </span>
    );
  return (
    <label className="cause-card blank" data-kind={c?.kind ?? "blank"}>
      <span className="cause-kind">{c?.kind ?? "choose a card"}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={`Card ${index + 1}`}>
        <option value="">…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {card(o)?.label ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}

function ConnectorSlot({
  options,
  value,
  onChange,
  index,
}: {
  options: Connector[];
  value: Connector | "";
  onChange: (v: Connector) => void;
  index: number;
}) {
  if (options.length === 1)
    return (
      <span className="connector connector-fixed">
        {CONNECTOR_LABEL[value || options[0]!]}{" "}
        <span className="arrow" aria-hidden="true">
          →
        </span>
      </span>
    );
  return (
    <label className="connector">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Connector)}
        aria-label={`Link ${index + 1}`}
      >
        <option value="">…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {CONNECTOR_LABEL[o]}
          </option>
        ))}
      </select>
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </label>
  );
}

interface Props {
  chains: string[];
  judgeNow?: boolean;
  save: Save;
  onSave: (answers: Record<string, ChainAnswer>) => void;
  onDone: () => void;
  onClose: () => void;
}

export function ChainBuilder({ chains, judgeNow, save, onSave, onDone, onClose }: Props) {
  const templates = chains.map((id) => chainTemplate(id)).filter((t): t is ChainTemplate => !!t);
  const batch = templates.length > 1 || !!judgeNow;
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(templates.map((t) => [t.id, initial(t, save.chains[t.id])])),
  );
  const [results, setResults] = useState<Record<string, Judgement> | null>(null);
  const ready = templates.every((t) => drafts[t.id] && complete(drafts[t.id]!));

  const set = (id: string, fn: (d: Draft) => Draft) => {
    setResults(null);
    setDrafts((all) => ({ ...all, [id]: fn(all[id]!) }));
  };

  const confirm = () => {
    const answers: Record<string, ChainAnswer> = {};
    const judged: Record<string, Judgement> = {};
    for (const t of templates) {
      const d = drafts[t.id]!;
      const a = { cards: d.cards, connectors: d.connectors as Connector[] };
      const j = judge(t, a, save);
      judged[t.id] = j;
      answers[t.id] = {
        ...a,
        confidence: d.confidence as 1 | 2 | 3,
        ...(batch ? { verdict: j.verdict } : {}),
      };
    }
    onSave(answers);
    if (batch) setResults(judged);
    else onDone();
  };

  const supported = results ? Object.values(results).filter((r) => r.verdict === "supported").length : 0;

  return (
    <Dialog
      title={templates.length > 1 ? "Your cause chains" : (templates[0]?.title ?? "Cause chain")}
      onClose={onClose}
      wide={templates.length > 1}
      className="chains"
    >
      <p className="lede">
        {batch
          ? templates.length > 1
            ? "Confirm your chains. Each is checked against your own runs, not against an answer key."
            : "Pick the link and say how sure you are. It is checked against what you saw, not against an answer key."
          : "Build the chain. It is kept in your notebook and checked with the others later."}
      </p>
      {templates.map((t) => {
        const d = drafts[t.id]!;
        const r = results?.[t.id];
        return (
          <section key={t.id} className="chain" data-verdict={r?.verdict}>
            <h3>{t.title}</h3>
            <div className="chain-row">
              {t.cards.map((opts, i) => (
                <div key={i} className="chain-step">
                  <CardSlot
                    index={i}
                    options={opts}
                    value={d.cards[i] ?? ""}
                    onChange={(v) =>
                      set(t.id, (x) => ({ ...x, cards: x.cards.map((c, j) => (j === i ? v : c)) }))
                    }
                  />
                  {i < t.connectors.length && (
                    <ConnectorSlot
                      index={i}
                      options={t.connectors[i]!}
                      value={d.connectors[i] ?? ""}
                      onChange={(v) =>
                        set(t.id, (x) => ({
                          ...x,
                          connectors: x.connectors.map((c, j) => (j === i ? v : c)),
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <fieldset className="confidence-pick">
              <legend>How sure are you?</legend>
              {([1, 2, 3] as const).map((n) => (
                <label key={n}>
                  <input
                    type="radio"
                    name={`conf-${t.id}`}
                    checked={d.confidence === n}
                    onChange={() => set(t.id, (x) => ({ ...x, confidence: n }))}
                  />
                  {CONFIDENCE[n]}
                </label>
              ))}
            </fieldset>
            {r && (
              <div className="verdict" data-verdict={r.verdict} role="status">
                <span className="verdict-mark" aria-hidden="true" />
                <b>{VERDICT_LABEL[r.verdict]}</b>
                <span className="muted"> · evidence: {r.evidence}</span>
                {r.messages.map((m) => (
                  <p key={m}>{m}</p>
                ))}
                {r.verdict === "plausible" && !r.messages.length && (
                  <p>
                    Not contradicted, but your runs do not back this exact chain yet. Which run would test it?
                  </p>
                )}
              </div>
            )}
          </section>
        );
      })}
      <div className="btn-row">
        {!results ? (
          <button type="button" className="btn btn-primary" disabled={!ready} onClick={confirm}>
            {batch ? (templates.length > 1 ? "Confirm all chains" : "Confirm the chain") : "Keep this chain"}
          </button>
        ) : (
          <>
            <p className="verdict-summary">
              <b className="mono">
                {supported} of {templates.length}
              </b>{" "}
              supported by your runs.
            </p>
            <button type="button" className="btn btn-primary" onClick={onDone}>
              Continue
            </button>
          </>
        )}
      </div>
    </Dialog>
  );
}
