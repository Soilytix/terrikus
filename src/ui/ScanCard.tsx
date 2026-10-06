/** What the naturalist notices when you look at something. */
import { useEffect, useRef } from "react";
import { fieldCard } from "../content";
import type { SceneObject } from "../content/schema";
import { Facts } from "./common";

interface Props {
  object: SceneObject;
  glimpse?: { number: string; title: string; hook: string } | undefined;
  onClose: () => void;
  onOpenCard: (id: string) => void;
}

export function ScanCard({ object, glimpse, onClose, onOpenCard }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => ref.current?.focus(), [object.id]);
  const card = object.card ? fieldCard(object.card) : undefined;
  return (
    <section
      ref={ref}
      className="scan-card"
      tabIndex={-1}
      aria-labelledby="scan-title"
      data-kind={object.kind}
    >
      <header>
        <p className="eyebrow">{glimpse ? `Chapter ${glimpse.number} · not yet open` : "You notice"}</p>
        <h2 id="scan-title">{glimpse ? glimpse.title : object.label}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </header>
      {glimpse ? (
        <>
          <p className="rumor-quote">“{glimpse.hook}”</p>
          <p className="muted">
            {object.label}. This part of the valley is planned; the question is kept in your notebook.
          </p>
        </>
      ) : (
        <p>{object.scan}</p>
      )}
      {object.facts && <Facts facts={object.facts} />}
      {card && (
        <button type="button" className="link-btn" onClick={() => onOpenCard(card.item.id)}>
          Field card: {card.item.name} →
        </button>
      )}
    </section>
  );
}
