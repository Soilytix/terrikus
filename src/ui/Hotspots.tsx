/** The scene outline: every object is a real button, placed over the plate. */
import { useEffect, useState, type CSSProperties } from "react";
import type { SceneObject } from "../content/schema";

interface Props {
  objects: SceneObject[];
  scanned: (id: string) => boolean;
  highlight: Set<string>;
  onActivate: (o: SceneObject) => void;
  /** No scan in this scene yet: labels stay visible as a cue. */
  fresh: boolean;
  reduced: boolean;
}

const IDLE_MS = 6000;

const VERB: Record<SceneObject["kind"], string> = {
  portal: "Go",
  scan: "Look at",
  action: "Use",
  glimpse: "Glimpse",
};

export function Hotspots({ objects, scanned, highlight, onActivate, fresh, reduced }: Props) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (reduced) return;
    let timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    };
    const events = ["pointerdown", "keydown", "wheel"] as const;
    for (const e of events) window.addEventListener(e, wake);
    return () => {
      window.clearTimeout(timer);
      for (const e of events) window.removeEventListener(e, wake);
    };
  }, [reduced]);
  return (
    <ul
      className="scene-outline"
      aria-label="Things in this scene"
      data-fresh={fresh}
      data-idle={idle && !reduced}
    >
      {objects.map((o) => {
        const done = o.kind === "scan" && scanned(o.id);
        return (
          <li
            key={o.id}
            style={
              {
                "--x": o.anchor.x,
                "--y": o.anchor.y,
                "--px": o.portrait?.x ?? o.anchor.x,
                "--py": o.portrait?.y ?? o.anchor.y,
              } as CSSProperties
            }
          >
            <button
              type="button"
              className="hotspot"
              data-kind={o.kind}
              data-done={done}
              data-hot={highlight.has(o.id)}
              data-object={o.id}
              onClick={() => onActivate(o)}
              aria-label={`${VERB[o.kind]}: ${o.label}${done ? " (looked at)" : ""}`}
            >
              <span className="hotspot-ring" aria-hidden="true" />
              <span className="hotspot-label" aria-hidden="true">
                {o.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
