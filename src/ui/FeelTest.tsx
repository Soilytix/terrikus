/**
 * Texture by feel (c1-m1): walk the Thien (1979) flow diagram with the sample.
 * Each node: act, feel, then pick the branch your fingers found. The whole
 * diagram stays on screen with the path taken marked.
 */
import { useState } from "react";
import type { Step } from "../content/schema";

type Props = Pick<Extract<Step, { kind: "feel-test" }>, "diagram" | "sample"> & { onClass: () => void };

export function FeelTest({ diagram, sample, onClass }: Props) {
  const [path, setPath] = useState<string[]>([diagram[0]!.id]);
  const [felt, setFelt] = useState(false);
  const [miss, setMiss] = useState<string | null>(null);
  const here = path.at(-1)!;
  const node = diagram.find((n) => n.id === here);
  const result = here.startsWith("=") ? here.slice(1) : null;
  const obs = sample[here];

  const pick = (branch: string, to: string) => {
    if (branch !== obs?.branch) {
      setMiss(`Your fingers found: ${obs?.felt} Which branch matches that?`);
      return;
    }
    setMiss(null);
    setFelt(false);
    setPath([...path, to]);
  };

  return (
    <div className="feel-test">
      {node && (
        <>
          <p className="step-text">
            <b>{node.question}</b>
          </p>
          {!felt ? (
            <button type="button" className="btn btn-primary" onClick={() => setFelt(true)}>
              {node.action}
            </button>
          ) : (
            <>
              <p className="observation" aria-live="polite">
                {obs?.felt}
              </p>
              <div className="choices">
                {node.branches.map((b) => (
                  <button key={b.id} type="button" className="choice" onClick={() => pick(b.id, b.to)}>
                    {b.label}
                  </button>
                ))}
              </div>
              {miss && <p className="hint">{miss}</p>}
            </>
          )}
        </>
      )}
      {result && (
        <>
          <p className="observation" aria-live="polite">
            Texture class: <b>{result}</b>.
          </p>
          <button type="button" className="btn btn-primary" onClick={onClass}>
            Continue
          </button>
        </>
      )}
      <details className="flow-diagram" open={!!result}>
        <summary>The flow diagram</summary>
        <ol>
          {diagram.map((n) => (
            <li key={n.id} data-on={path.includes(n.id)}>
              {n.question}
              <ul>
                {n.branches.map((b) => (
                  <li key={b.id} data-taken={path.includes(n.id) && path[path.indexOf(n.id) + 1] === b.to}>
                    {b.label} → {b.to.startsWith("=") ? <b>{b.to.slice(1)}</b> : "next question"}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
