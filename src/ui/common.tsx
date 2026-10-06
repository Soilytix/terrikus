/** Small shared pieces: facts with their sources, review badges, dialogs. */
import { useEffect, useRef, type ReactNode } from "react";
import type { Confidence, Fact, ReviewStatus } from "../content/schema";
import { SOURCES, type SourceId } from "../content/sources";

const CONFIDENCE: Record<Confidence, string> = {
  firm: "Firm",
  estimate: "Estimate",
  contested: "Contested",
};

/** Markdown-ish citation to plain text. */
const plain = (s: string) => s.replace(/\*/g, "");

export function SourceRef({ id }: { id: SourceId }) {
  const s = SOURCES[id];
  return (
    <a className="source" href={s.link} target="_blank" rel="noreferrer" title={plain(s.citation)}>
      {id}
    </a>
  );
}

export function FactItem({ fact }: { fact: Fact }) {
  return (
    <li className="fact">
      <p>{fact.text}</p>
      <div className="fact-meta">
        <span className="confidence" data-c={fact.confidence}>
          {CONFIDENCE[fact.confidence]}
        </span>
        {fact.evidence && (
          <span className="tier" data-tier={fact.evidence}>
            {fact.evidence}
          </span>
        )}
        {fact.sources.map((s) => (
          <SourceRef key={s} id={s} />
        ))}
      </div>
      {fact.simplification && <p className="simplification">Simplified: {fact.simplification}</p>}
    </li>
  );
}

export function Facts({ facts }: { facts: Fact[] }) {
  if (!facts.length) return null;
  return (
    <ul className="facts">
      {facts.map((f) => (
        <FactItem key={f.id} fact={f} />
      ))}
    </ul>
  );
}

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  if (status === "approved") return null;
  return (
    <span className="review-badge" title="Content is a draft until a named scientist approves it.">
      <span className="dot" aria-hidden="true" />
      <span className="review-badge-text">Scientific review pending</span>
    </span>
  );
}

/** A modal dialog on the native <dialog>: focus trap, Esc and backdrop for free. */
export function Dialog({
  title,
  onClose,
  children,
  wide,
  className,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog${wide ? " dialog-wide" : ""}${className ? ` ${className}` : ""}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <header className="dialog-head">
        <h2>{title}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </header>
      <div className="dialog-body">{children}</div>
    </dialog>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}
