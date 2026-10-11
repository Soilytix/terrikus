/**
 * Chapter 5 charged surface in the mission panel: seat cations then add acid
 * (c5-m1), or fertilise then rain (c5-m2). Teaching model from
 * `src/sim/exchange.ts`; the table carries every number, the drawing is aria-hidden.
 */
import { useState } from "react";
import type { Fact } from "../content/schema";
import { CHARGE, add, heldCharge, rain, surface, type Cation, type Ion, type Surface } from "../sim/exchange";
import { t } from "../i18n";
import { Facts } from "./common";

const SITES = 8;
const ION_LABEL: Record<Ion, string> = {
  H: "H⁺",
  Ca: "Ca²⁺",
  Mg: "Mg²⁺",
  K: "K⁺",
  NH4: "NH₄⁺",
  NO3: "NO₃⁻",
};

function Banner() {
  return (
    <p className="teaching-banner" role="note">
      <span className="dot" aria-hidden="true" />
      {t("Teaching model: direction, not prediction.")}
    </p>
  );
}

/** The surface with its charges, the ions sitting on it, the soil water and the drain. */
function Drawing({ s }: { s: Surface }) {
  const slot = 100 / s.sites;
  const seated: { ion: Cation; x: number; w: number }[] = [];
  let at = 0;
  for (const c of ["H", "Ca", "Mg", "K", "NH4"] as const)
    for (let k = 0; k < s.held[c]; k++) {
      seated.push({ ion: c, x: at * slot, w: CHARGE[c] * slot });
      at += CHARGE[c];
    }
  const loose = (counts: Surface["water"], y: number) =>
    (Object.keys(counts) as Ion[])
      .flatMap((i) => Array.from({ length: counts[i] }, () => i))
      .map((i, k) => (
        <circle
          key={`${y}-${k}`}
          cx={6 + ((k * 9) % 90)}
          cy={y + Math.floor((k * 9) / 90) * 7}
          r="3"
          className={`ion ion-${i}`}
        />
      ));
  return (
    <svg viewBox="0 0 100 74" className="exchange-drawing" aria-hidden="true">
      <rect x="0" y="12" width="100" height="6" className="platelet" />
      {Array.from({ length: s.sites }, (_, k) => (
        <text key={k} x={(k + 0.5) * slot} y="16.6" className="charge">
          −
        </text>
      ))}
      {seated.map((p, k) => (
        <circle
          key={k}
          cx={p.x + p.w / 2}
          cy="7"
          r={Math.min(4.5, p.w / 2 - 0.5)}
          className={`ion ion-${p.ion}`}
        />
      ))}
      <rect x="0" y="22" width="100" height="30" className="soil-water" />
      {loose(s.water, 28)}
      <rect x="0" y="56" width="100" height="18" className="drain" />
      {loose(s.drained, 61)}
    </svg>
  );
}

function Table({ s, ions }: { s: Surface; ions: Ion[] }) {
  return (
    <table className="run-table" aria-live="polite">
      <thead>
        <tr>
          <th scope="col">{t("Ion")}</th>
          <th scope="col">{t("On the clay")}</th>
          <th scope="col">{t("In the soil water")}</th>
          <th scope="col">{t("Drained")}</th>
        </tr>
      </thead>
      <tbody>
        {ions.map((i) => (
          <tr key={i}>
            <th scope="row">{ION_LABEL[i]}</th>
            <td className="mono">{s.held[i]}</td>
            <td className="mono">{s.water[i]}</td>
            <td className="mono">{s.drained[i]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const SEATABLE: Cation[] = ["Ca", "Mg", "K"];

export function Exchange({
  mode,
  resultText,
  facts,
  onDone,
}: {
  mode: "chairs" | "leaky";
  resultText: string;
  facts: Fact[];
  onDone: () => void;
}) {
  const [s, setS] = useState(() => surface(SITES));
  const [log, setLog] = useState<string[]>([]);
  const [rains, setRains] = useState(0);
  const free = s.sites - heldCharge(s);
  const left = (from: Surface, to: Surface) =>
    SEATABLE.concat("NH4")
      .filter((c) => to.held[c] < from.held[c])
      .map((c) => `${from.held[c] - to.held[c]} ${ION_LABEL[c]}`)
      .join(", ");

  const acid = () => {
    const next = add(s, "H", 2);
    setLog([...log, t("2 H⁺ in: {out}", { out: left(s, next) || t("nothing knocked off") })]);
    setS(next);
  };
  const shower = () => {
    setS(rain(s, 50));
    setRains(rains + 1);
  };
  const fertilise = () => setS(add(add(s, "NH4", 4), "NO3", 4));

  const knocked = SEATABLE.filter((c) => s.water[c] + s.drained[c] > 0).length;
  const done = mode === "chairs" ? knocked >= 2 : rains >= 2 && s.added.NO3 > 0 && s.drained.NO3 > 0;
  const ions: Ion[] = mode === "chairs" ? ["Ca", "Mg", "K", "H"] : ["NH4", "NO3"];

  return (
    <>
      <Banner />
      <Drawing s={s} />
      <Table s={s} ions={ions} />
      {mode === "chairs" ? (
        <>
          <div className="btn-row" role="group" aria-label={t("Seat a cation")}>
            {SEATABLE.map((c) => (
              <button
                key={c}
                type="button"
                className="btn"
                disabled={s.added.H > 0 || free < CHARGE[c]}
                onClick={() => setS(add(s, c, 1))}
              >
                {t("Seat {ion}", { ion: ION_LABEL[c] })}
              </button>
            ))}
          </div>
          <p className="muted small">
            {free > 0
              ? t("{free} of {sites} negative charges still free. Calcium and magnesium take two each.", {
                  free,
                  sites: s.sites,
                })
              : t("Every charge is taken.")}
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn-primary" disabled={free > 0} onClick={acid}>
              {t("Add acid (2 H⁺)")}
            </button>
            <button type="button" className="btn" disabled={free > 0} onClick={shower}>
              {t("Rain")}
            </button>
          </div>
          {log.length > 0 && (
            <ol className="exchange-log" aria-live="polite">
              {log.map((l, k) => (
                <li key={k}>{l}</li>
              ))}
            </ol>
          )}
          {!done && log.length >= 2 && knocked < 2 && (
            <p className="hint">
              {t("Seat more than one kind of cation to see which leaves first.")}{" "}
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setS(surface(SITES));
                  setLog([]);
                }}
              >
                {t("Start again")}
              </button>
            </p>
          )}
        </>
      ) : (
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={fertilise}>
            {t("Add fertiliser (4 NH₄⁺, 4 NO₃⁻)")}
          </button>
          <button type="button" className="btn" disabled={s.added.NO3 === 0} onClick={shower}>
            {t("Rain")}
          </button>
        </div>
      )}
      {done && (
        <>
          <p className="observation">{resultText}</p>
          <Facts facts={facts} />
          <button type="button" className="btn btn-primary" onClick={onDone}>
            {t("Continue")}
          </button>
        </>
      )}
    </>
  );
}
