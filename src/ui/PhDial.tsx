/**
 * The pH dial (c5-m3): nutrient availability bars recolour as pH moves,
 * aluminium appears below about pH 5.5, and a schematic community bar shifts
 * in the direction lauber-2009 reported. Teaching values from `src/sim/exchange.ts`.
 */
import { useState } from "react";
import type { Fact } from "../content/schema";
import { AVAILABILITY, aluminium, availability, hRelative, type Nutrient } from "../sim/exchange";
import { Facts } from "./common";

const NAME: Record<Nutrient, string> = {
  N: "Nitrogen",
  P: "Phosphorus",
  K: "Potassium",
  Ca: "Calcium",
  Fe: "Iron",
};

/** H⁺ compared with pH 7, in words: "100× more", "10× less", "the same". */
function hWords(ph: number) {
  const r = hRelative(ph);
  if (Math.abs(Math.log10(r)) < 0.05) return "about the same as at pH 7";
  const n = r >= 1 ? r : 1 / r;
  const shown = n >= 10 ? Math.round(n).toLocaleString("en") : n.toFixed(1);
  return `${shown}× ${r >= 1 ? "more" : "less"} than at pH 7`;
}

/** Share of acid-tolerant groups in the schematic community, per cent (direction only). */
const acidShare = (ph: number) => Math.round(Math.min(80, Math.max(15, 80 - ((ph - 4) / 4.5) * 65)));

export function PhDial({
  resultText,
  facts,
  onDone,
}: {
  resultText: string;
  facts: Fact[];
  onDone: () => void;
}) {
  const [ph, setPh] = useState(6.5);
  const [seen, setSeen] = useState({ acid: false, alkaline: false });
  const al = aluminium(ph);
  const acid = acidShare(ph);
  const move = (v: number) => {
    setPh(v);
    setSeen((s) => ({ acid: s.acid || v < 5.5, alkaline: s.alkaline || v > 7 }));
  };
  return (
    <>
      <p className="teaching-banner" role="note">
        <span className="dot" aria-hidden="true" />
        Teaching model: direction, not prediction.
      </p>
      <label className="ph-dial">
        <span>
          Soil pH <b className="mono">{ph.toFixed(1)}</b>
        </span>
        <input
          type="range"
          min={4}
          max={9}
          step={0.1}
          value={ph}
          aria-valuetext={`pH ${ph.toFixed(1)}`}
          onChange={(e) => move(Number(e.target.value))}
        />
      </label>
      <p className="small" aria-live="polite">
        H⁺ in the soil water: {hWords(ph)}.
      </p>
      <dl className="ph-bars">
        {(Object.keys(AVAILABILITY) as Nutrient[]).map((n) => {
          const v = availability(n, ph);
          return (
            <div key={n} className="ph-bar">
              <dt>{NAME[n]}</dt>
              <dd>
                <span className="bar" data-level={v >= 70 ? "high" : v >= 40 ? "mid" : "low"}>
                  <span style={{ width: `${v}%` }} />
                </span>
                <span className="mono small">{v} %</span>
              </dd>
            </div>
          );
        })}
        {al > 0 && (
          <div className="ph-bar ph-al">
            <dt>Aluminium in solution</dt>
            <dd>
              <span className="bar" data-level="al">
                <span style={{ width: `${al}%` }} />
              </span>
              <span className="small">toxic to many roots</span>
            </dd>
          </div>
        )}
      </dl>
      <figure className="ph-community">
        <div className="community-bar" aria-hidden="true">
          <span className="acid" style={{ width: `${acid}%` }} />
          <span className="neutral" style={{ width: `${100 - acid}%` }} />
        </div>
        <figcaption className="small">
          Bacterial community: acid-tolerant groups such as Acidobacteria {acid >= 50 ? "dominate" : "recede"}
          ; groups such as Actinobacteria and Bacteroidetes are commoner towards neutral.{" "}
          <span className="muted">Schematic of the reported direction, not survey data.</span>
        </figcaption>
      </figure>
      {seen.acid && seen.alkaline ? (
        <>
          <p className="observation">{resultText}</p>
          <Facts facts={facts} />
          <button type="button" className="btn btn-primary" onClick={onDone}>
            Continue
          </button>
        </>
      ) : (
        <p className="hint">Turn the dial below pH 5.5 and above pH 7.</p>
      )}
    </>
  );
}
