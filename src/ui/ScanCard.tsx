/** What the naturalist notices when you look at something. */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fieldCard } from "../content";
import type { SceneObject } from "../content/schema";
import { Facts } from "./common";

interface Props {
  object: SceneObject;
  glimpse?: { number: string; title: string; hook: string; open: boolean } | undefined;
  onClose: () => void;
  /** Left out while the card waits in the tray: the tray is the one way in. */
  onOpenCard?: ((id: string) => void) | undefined;
}

export function ScanCard({ object, glimpse, onClose, onOpenCard }: Props) {
  const ref = useRef<HTMLElement>(null);
  // Closing hands the keyboard back to whatever opened the card (its hotspot).
  const [opener] = useState(() => document.activeElement as HTMLElement | null);
  useEffect(() => ref.current?.focus(), [object.id]);
  useEffect(() => {
    return () => {
      if (opener?.isConnected && (!document.activeElement || document.activeElement === document.body))
        opener.focus({ preventScroll: true });
    };
  }, [opener]);
  // Beside its hotspot on a wide screen, following the camera; a phone keeps the bottom sheet.
  useLayoutEffect(() => {
    const wide = window.matchMedia("(min-width: 761px)");
    let raf = 0;
    const place = () => {
      raf = requestAnimationFrame(place);
      const el = ref.current;
      const spot = document.querySelector(`.hotspot[data-object="${object.id}"]`);
      if (!el) return;
      if (!spot || !wide.matches) {
        el.removeAttribute("data-side");
        el.style.left = el.style.top = "";
        return;
      }
      const r = spot.getBoundingClientRect();
      const y = r.top + r.height / 2;
      // Clear of the hotspot's label too, which can be wider than the ring.
      const label = spot.querySelector(".hotspot-label")?.getBoundingClientRect();
      const reach = Math.max(r.width / 2, label?.width ? label.width / 2 : 0) + 12;
      const x = r.left + r.width / 2;
      const { offsetWidth: w, offsetHeight: h } = el;
      const panel = document.querySelector(".mission")?.getBoundingClientRect();
      const limit = (panel ? panel.left : window.innerWidth) - 16;
      const right = x + reach + w <= limit;
      let left = Math.max(16, right ? x + reach : x - reach - w);
      const top = Math.min(Math.max(84, y - 48), window.innerHeight - 16 - h);
      // Beside the ladder card rather than over it.
      const ladder = document.querySelector(".ladder")?.getBoundingClientRect();
      if (ladder && left < ladder.right && top < ladder.bottom && top + h > ladder.top)
        left = ladder.right + 16;
      el.dataset.side = right ? "right" : "left";
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.setProperty("--notch-y", `${Math.min(Math.max(y - top, 20), h - 20)}px`);
    };
    place();
    return () => cancelAnimationFrame(raf);
  }, [object.id]);
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
            {object.label}.{" "}
            {glimpse.open
              ? "The chapter is open: its way in is here on the map."
              : "This part of the valley is planned; the question is kept in your notebook."}
          </p>
        </>
      ) : (
        <p>{object.scan}</p>
      )}
      {object.facts && <Facts facts={object.facts} />}
      {card && onOpenCard && (
        <button type="button" className="link-btn" onClick={() => onOpenCard(card.item.id)}>
          Field card: {card.item.name} →
        </button>
      )}
    </section>
  );
}

/** Cards picked up and not yet opened wait in a stack, bottom right, until the learner reads them. */
export function CardTray({ ids, onOpen }: { ids: string[]; onOpen: (id: string) => void }) {
  const id = ids[ids.length - 1];
  const card = id ? fieldCard(id) : undefined;
  if (!id || !card) return null;
  return (
    <aside className="card-tray" aria-label="New field cards" data-depth={Math.min(ids.length, 3)}>
      <button type="button" className="tray-card" onClick={() => onOpen(id)}>
        <span className="icon-chip" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="18" height="18">
            <path
              d="M4 4.5C6 3.5 8 3.5 10 5c2 -1.5 4-1.5 6-.5V16c-2-1-4-1-6 .5C8 15 6 15 4 16z M10 5v11.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="tray-text">
          <small>{ids.length > 1 ? `New field card · ${ids.length} waiting` : "New field card"}</small>
          <b>{card.item.name}</b>
        </span>
        <span className="go-chip" aria-hidden="true">
          →
        </span>
      </button>
    </aside>
  );
}
