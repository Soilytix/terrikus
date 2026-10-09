/** Recall on return (WB§7.4): try to remember first, then see what you found. Never scored. */
import { useEffect, useRef, useState } from "react";
import type { Discovery, RecallCard } from "../content/schema";
import { Dialog } from "./common";

interface Props {
  cards: (RecallCard & { answer: Discovery })[];
  onClose: () => void;
}

export function Recall({ cards, onClose }: Props) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const next = useRef<HTMLButtonElement>(null);
  // After the dialog's own showModal, which focuses its close button.
  useEffect(() => next.current?.focus(), [i, shown]);
  const card = cards[i]!;
  const last = i + 1 >= cards.length;
  return (
    <Dialog title="Before you go on" onClose={onClose} className="recall">
      <h2>{card.prompt}</h2>
      {shown ? (
        <>
          <p className="recall-answer">
            <span className="tier" data-tier={card.answer.evidenceTier}>
              {card.answer.evidenceTier}
            </span>{" "}
            {card.answer.statement}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            ref={next}
            onClick={() => {
              if (last) return onClose();
              setI(i + 1);
              setShown(false);
            }}
          >
            {last ? "Continue" : "Next question"}
          </button>
        </>
      ) : (
        <>
          <p className="muted">Think of your answer first. Nothing is checked or kept.</p>
          <button type="button" className="btn btn-primary" ref={next} onClick={() => setShown(true)}>
            Show what I found
          </button>
        </>
      )}
    </Dialog>
  );
}
