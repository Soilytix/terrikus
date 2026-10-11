/** Small shared pieces: facts with their sources, review badges, dialogs. */
import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { LANGS, lang, t, tl } from "../i18n";
import { switchLang } from "../i18n/boot";
import type { Confidence, Fact, ReviewStatus } from "../content/schema";
import { SOURCES, type SourceId } from "../content/sources";

const CONFIDENCE: Record<Confidence, string> = {
  firm: tl("Firm"),
  estimate: tl("Estimate"),
  contested: tl("Contested"),
};

const TIER: Record<string, string> = {
  measured: tl("measured"),
  derived: tl("derived"),
  inferred: tl("inferred"),
  observed: tl("observed"),
  interpreted: tl("interpreted"),
  reference: tl("reference"),
  "would-do": tl("would-do"),
  "would measure": tl("would measure"),
};

/** An evidence tier's word on screen; the tier itself stays English in data. */
export const tierLabel = (tier: string) => (TIER[tier] ? t(TIER[tier]) : tier);

/** Markdown-ish citation to plain text. */
const plain = (s: string) => s.replace(/\*/g, "");

export function SourceRef({ id }: { id: SourceId }) {
  const s = SOURCES[id];
  return (
    <a className="source" href={s.link} target="_blank" rel="noreferrer" title={plain(s.citation)}>
      {s.short}
    </a>
  );
}

export function FactItem({ fact }: { fact: Fact }) {
  return (
    <li className="fact">
      <p className="hand">{fact.text}</p>
      <div className="fact-meta">
        <span className="sr-only">{t(CONFIDENCE[fact.confidence])}</span>
        {fact.evidence && (
          <span className="tier" data-tier={fact.evidence}>
            {tierLabel(fact.evidence)}
          </span>
        )}
        {fact.sources.map((s) => (
          <SourceRef key={s} id={s} />
        ))}
      </div>
      {fact.simplification && (
        <p className="simplification">
          {t("Simplified:")} {fact.simplification}
        </p>
      )}
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
    <span className="review-badge" title={t("Content is a draft until a named scientist approves it.")}>
      <span className="dot" aria-hidden="true" />
      <span className="review-badge-text">{t("Scientific review pending")}</span>
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
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t("Close")}>
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

/** `t` with React parts: `{name}` slots in the translated string are filled with nodes. */
export function tr(s: string, parts: Record<string, ReactNode>): ReactNode {
  return t(s)
    .split(/\{(\w+)\}/)
    .map((piece, i) => <Fragment key={i}>{i % 2 ? (parts[piece] ?? `{${piece}}`) : piece}</Fragment>);
}

/** English / Deutsch. Each language is named in itself; choosing one reloads the page. */
export function LangToggle({ className }: { className?: string }) {
  return (
    <div className={`lang-toggle${className ? ` ${className}` : ""}`} role="group" aria-label={t("Language")}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          aria-pressed={lang() === l.id}
          onClick={() => lang() !== l.id && switchLang(l.id)}
        >
          {l.name}
        </button>
      ))}
    </div>
  );
}
