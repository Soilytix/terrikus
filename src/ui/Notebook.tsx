/** The field notebook: the only reward. Everything in it is the player's own. */
import { useEffect, useRef } from "react";
import {
  CHAPTERS,
  CODEX,
  DISCOVERIES,
  FIELD_CARDS,
  RUMORS,
  codex as codexById,
  type FieldCard,
} from "../content";
import type { GroupBadge } from "../content/schema";
import type { Save } from "../save/schema";
import { assetUrl } from "../assets/urls";
import { NOTEBOOK_TABS, type NotebookTab } from "../app/router";
import { LADDER } from "./Hud";
import { Dialog, Facts, ReviewBadge, SourceRef } from "./common";

const TAB_LABEL: Record<NotebookTab, string> = {
  rumors: "Rumors",
  cards: "Field cards",
  lab: "Lab book",
  codex: "Codex",
  contents: "Contents",
};

const GROUP_SHAPE: Record<GroupBadge, string> = {
  decomposer: "M8 1l7 7-7 7-7-7z",
  grazer: "M8 1a7 7 0 110 14A7 7 0 018 1z",
  transformer: "M8 1l7 13H1z",
  mutualist: "M1 4h14v8H1z",
  pathogen: "M8 1l2 5h5l-4 3 2 6-5-4-5 4 2-6-4-3h5z",
  engineer: "M4 1h8l3 7-3 7H4L1 8z",
  shredder: "M1 1h14v14H1z",
};

function sizeLabel(m: number): string {
  if (m >= 0.01) return `${+(m * 100).toPrecision(2)} cm`;
  if (m >= 1e-3) return `${+(m * 1000).toPrecision(2)} mm`;
  return `${+(m * 1e6).toPrecision(2)} µm`;
}

function CardView({ card, state }: { card: FieldCard; state: "partial" | "full" }) {
  const item = card.item;
  const art = card.kind === "organism" && item && "art" in item && item.art ? assetUrl(item.art) : undefined;
  return (
    <article className="field-card" data-state={state} id={`card-${item.id}`}>
      <div className="fc-art" aria-hidden="true">
        {art ? <img src={art} alt="" /> : <span className="fc-art-blank">{card.kind}</span>}
      </div>
      <div className="fc-body">
        <p className="eyebrow">
          {card.kind === "organism" ? (
            <span className="group-badge">
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                <path d={GROUP_SHAPE[card.item.group]} />
              </svg>
              {card.item.group}
            </span>
          ) : (
            card.kind
          )}
        </p>
        <h3>{item.name}</h3>
        {card.kind === "organism" && <p className="fc-role">{card.item.role}</p>}
        {card.kind !== "organism" && <p className="fc-role">{card.item.summary}</p>}
        {card.kind === "organism" && (
          <p className="fc-size">
            True size{" "}
            <b className="mono">
              {sizeLabel(card.item.sizeRange[0])}–{sizeLabel(card.item.sizeRange[1])}
            </b>
          </p>
        )}
        {state === "full" ? (
          <>
            {card.kind === "organism" && (
              <dl className="fc-facts">
                <dt>Eats</dt>
                <dd>{card.item.eats.join("; ")}</dd>
                <dt>Eaten by</dt>
                <dd>{card.item.eatenBy.join("; ")}</dd>
                <dt>Needs</dt>
                <dd>{card.item.needs.join("; ")}</dd>
                <dt>How we know</dt>
                <dd>{card.item.howWeKnow.join(", ")}</dd>
              </dl>
            )}
            <Facts facts={item.facts} />
          </>
        ) : (
          <p className="muted small">
            Partly filled in. Finish the mission that features it to complete the card.
          </p>
        )}
        <ReviewBadge status={item.reviewStatus} />
      </div>
    </article>
  );
}

interface Props {
  tab: NotebookTab;
  save: Save;
  focusCard?: string | undefined;
  onTab: (t: NotebookTab) => void;
  onClose: () => void;
}

export function Notebook({ tab, save, focusCard, onTab, onClose }: Props) {
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusCard) document.getElementById(`card-${focusCard}`)?.scrollIntoView({ block: "center" });
  }, [focusCard, tab]);
  // Arrow keys change the tab through the route; focus follows the selection (ARIA tabs pattern).
  useEffect(() => {
    const list = tabs.current;
    if (list?.contains(document.activeElement))
      list.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
  }, [tab]);

  const rumors = RUMORS.filter((r) => save.rumors[r.id]);
  const cards = FIELD_CARDS.filter((c) => save.cards[c.item.id]);
  const locked = FIELD_CARDS.length - cards.length;
  const entries = save.codex.map((id) => codexById(id)).filter((c) => !!c);

  return (
    <Dialog title="Field notebook" onClose={onClose} wide className="notebook">
      <div
        ref={tabs}
        className="tabs"
        role="tablist"
        aria-label="Notebook sections"
        onKeyDown={(e) => {
          const i = NOTEBOOK_TABS.indexOf(tab);
          if (e.key === "ArrowRight") onTab(NOTEBOOK_TABS[(i + 1) % NOTEBOOK_TABS.length]!);
          if (e.key === "ArrowLeft")
            onTab(NOTEBOOK_TABS[(i - 1 + NOTEBOOK_TABS.length) % NOTEBOOK_TABS.length]!);
        }}
      >
        {NOTEBOOK_TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === tab}
            tabIndex={t === tab ? 0 : -1}
            onClick={() => onTab(t)}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="tab-panel" aria-label={TAB_LABEL[tab]}>
        {tab === "rumors" && (
          <>
            <p className="lede">Questions you have met. Some are answered; most lead somewhere new.</p>
            {rumors.length ? (
              <ul className="rumors">
                {rumors.map((r) => (
                  <li key={r.id} data-state={save.rumors[r.id]}>
                    <span className="rumor-state">{save.rumors[r.id]}</span>
                    <p className="rumor-quote">“{r.text}”</p>
                    {r.explainedBy && save.rumors[r.id] === "explained" && (
                      <p className="small">
                        Explained by: {DISCOVERIES.find((d) => d.id === r.explainedBy)?.statement}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">No rumors yet. Look around the valley.</p>
            )}
          </>
        )}
        {tab === "cards" && (
          <>
            <p className="lede">
              {cards.length} of {FIELD_CARDS.length} cards. Organisms are described by what they do here,
              never as good or bad.
            </p>
            <div className="card-grid">
              {cards.map((c) => (
                <CardView key={c.item.id} card={c} state={save.cards[c.item.id]!} />
              ))}
              {Array.from({ length: Math.min(locked, 6) }, (_, i) => (
                <div key={i} className="field-card locked" aria-hidden="true">
                  <span>?</span>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === "lab" && (
          <>
            <p className="lede">Your runs and reasoning, kept apart by evidence tier.</p>
            {save.labBook.length ? (
              <ol className="lab-book">
                {[...save.labBook].reverse().map((e) => (
                  <li key={e.id + e.at} data-tier={e.tier}>
                    <span className="tier" data-tier={e.tier === "would-do" ? "would-do" : "measured"}>
                      {e.tier === "would-do" ? "would measure" : e.tier}
                    </span>
                    <p>{e.result}</p>
                    {e.prediction && <p className="small muted">Predicted: {e.prediction}</p>}
                    <p className="small muted mono">
                      {e.ruleset} · {new Date(e.at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="empty">Nothing run yet. The lab bench opens in chapter 2.</p>
            )}
            {Object.keys(save.chains).length > 0 && (
              <>
                <h3>Cause chains</h3>
                <ul className="lab-chains">
                  {Object.entries(save.chains).map(([id, c]) => (
                    <li key={id}>
                      <span className="mono small">{id}</span> · confidence {c.confidence}/3
                      {c.verdict && (
                        <span className="verdict-tag" data-verdict={c.verdict}>
                          {c.verdict}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
        {tab === "codex" && (
          <>
            <p className="lede">What you have learned, with the sources behind it.</p>
            {entries.length ? (
              entries.map((c) => (
                <article key={c.id} className="codex-entry">
                  <h3>{c.title}</h3>
                  <ReviewBadge status={c.reviewStatus} />
                  {c.body.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                  {c.revised && (
                    <div className="revised">
                      <p>
                        <s>{c.revised.old}</s>
                      </p>
                      <p>
                        Now: {c.revised.now}{" "}
                        {c.revised.sources.map((s) => (
                          <SourceRef key={s} id={s} />
                        ))}
                      </p>
                    </div>
                  )}
                  {c.openQuestion && (
                    <div className="open-question">
                      <p className="eyebrow">Open question</p>
                      <p>
                        <b>{c.openQuestion.claim}</b>
                      </p>
                      <ul>
                        {c.openQuestion.sides.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                      <p className="small">
                        {c.openQuestion.sources.map((s) => (
                          <SourceRef key={s} id={s} />
                        ))}
                      </p>
                    </div>
                  )}
                  <Facts facts={c.facts} />
                  {c.realWorld && (
                    <>
                      <p className="eyebrow">In the real world</p>
                      <Facts facts={c.realWorld} />
                    </>
                  )}
                  {c.simplification && <p className="simplification">Simplified: {c.simplification}</p>}
                </article>
              ))
            ) : (
              <p className="empty">
                The codex fills as you finish missions. {CODEX.length} entries wait in this book.
              </p>
            )}
          </>
        )}
        {tab === "contents" && (
          <>
            <h3>Scale stamps</h3>
            <ol className="stamps">
              {LADDER.map((l) => (
                <li key={l.scale} data-stamped={save.stamps.includes(l.scale)}>
                  <span className="stamp" aria-hidden="true" />
                  {l.label}
                  <span className="sr-only">{save.stamps.includes(l.scale) ? " visited" : " not yet"}</span>
                </li>
              ))}
            </ol>
            <h3>Discoveries</h3>
            <ul className="discoveries">
              {DISCOVERIES.filter((d) => save.discoveries.includes(d.id)).map((d) => (
                <li key={d.id}>
                  <span className="tier" data-tier={d.evidenceTier}>
                    {d.evidenceTier}
                  </span>
                  {d.statement}
                </li>
              ))}
              {!save.discoveries.length && <li className="empty">None yet.</li>}
            </ul>
            <h3>Chapters</h3>
            <ol className="chapters">
              {CHAPTERS.map((c) => (
                <li
                  key={c.id}
                  data-state={
                    save.chaptersComplete.includes(c.id)
                      ? "done"
                      : save.chaptersUnlocked.includes(c.id)
                        ? "open"
                        : "locked"
                  }
                >
                  <span className="mono">{c.number}</span> {c.title}
                  <span className="small muted">
                    {save.chaptersComplete.includes(c.id)
                      ? "complete"
                      : save.chaptersUnlocked.includes(c.id)
                        ? "open"
                        : c.playable
                          ? "locked"
                          : "planned"}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </Dialog>
  );
}
