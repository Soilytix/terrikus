/**
 * Be the decomposer (chapter 2, first mission): eat the leaf parcel by parcel and send each into
 * your body or out as breath. Body is capped at round(CUE × eaten): building
 * a body costs energy, and the energy comes from burning food.
 */
import { useMemo, useState } from "react";
import { lang, t } from "../i18n";
import { Dialog, tr } from "./common";

const PARCELS = 10;

export function splitTurns(turns: number, total = PARCELS): number[] {
  const base = Math.floor(total / turns);
  return Array.from({ length: turns }, (_, i) => (i === turns - 1 ? total - base * (turns - 1) : base));
}

export function HandDecompose({
  turns,
  cue,
  onDone,
  onClose,
}: {
  turns: number;
  cue: number;
  onDone: () => void;
  onClose: () => void;
}) {
  const plan = useMemo(() => splitTurns(turns), [turns]);
  const [choices, setChoices] = useState<("body" | "breath")[]>([]);
  const [note, setNote] = useState<string>(() => t("Turn 1. Take the first parcel of leaf."));
  const eaten = choices.length;
  const body = choices.filter((c) => c === "body").length;
  const breath = eaten - body;
  const finished = eaten >= PARCELS;
  const ends = plan.reduce<number[]>((a, p) => [...a, (a.at(-1) ?? 0) + p], []);
  const at = ends.findIndex((e) => eaten < e);
  const turn = at < 0 ? plan.length - 1 : at;

  const choose = (c: "body" | "breath") => {
    if (finished) return;
    const cap = Math.round(cue * (eaten + 1));
    if (c === "body" && body + 1 > cap) {
      setNote(
        eaten === 0
          ? t(
              "Not yet. Building a body costs energy, and the energy comes from burning food. Breathe this one out first.",
            )
          : t(
              "Your cells cannot keep more: so far only {cap} of {n} parcels can become body. The rest must be burned for energy.",
              { cap, n: eaten + 1 },
            ),
      );
      return;
    }
    const next = [...choices, c];
    setChoices(next);
    const n = next.length;
    const k = ends.findIndex((e) => e === n);
    if (n >= PARCELS) setNote(t("The leaf is gone. Look at where it went."));
    else if (k >= 0) setNote(t("Turn {turn}. {n} more parcels.", { turn: k + 2, n: plan[k + 1]! }));
    else
      setNote(
        c === "body"
          ? t("Into your body: carbon kept, as you.")
          : t("Breathed out: carbon leaves as CO₂, its energy as heat."),
      );
  };

  return (
    <Dialog title={t("Be the decomposer")} onClose={onClose} wide className="decompose">
      <p className="lede">
        {t(
          "You are a microbe at the edge of a leaf. Each parcel you take up goes one of two ways. Turn {turn} of {n}.",
          {
            turn: Math.min(turn + 1, plan.length),
            n: plan.length,
          },
        )}
      </p>
      <div className="dc-stage">
        <svg
          viewBox="0 0 520 220"
          className="dc-svg"
          role="img"
          aria-label={t("Leaf: {left} parcels left. Your body: {body}. Breathed out: {breath}.", {
            left: PARCELS - eaten,
            body,
            breath,
          })}
        >
          <g transform="translate(20 30)">
            {Array.from({ length: PARCELS }, (_, i) => {
              const col = i % 5;
              const row = Math.floor(i / 5);
              const gone = i < eaten;
              return (
                <path
                  key={i}
                  className="dc-parcel"
                  data-gone={gone}
                  data-next={i === eaten}
                  d={`M${col * 34 + 4} ${row * 64 + 34} q 13 -32 28 -30 q 4 26 -28 30 z`}
                  transform={`rotate(${((i * 37) % 24) - 12} ${col * 34 + 18} ${row * 64 + 24})`}
                />
              );
            })}
            <text x={86} y={160} className="dc-cap" textAnchor="middle">
              {t("Leaf · {n} left", { n: PARCELS - eaten })}
            </text>
          </g>
          <g transform="translate(250 40)">
            <circle cx={60} cy={60} r={18 + body * 7} className="dc-cell" />
            <circle cx={60 - 6} cy={60 - 4} r={5 + body} className="dc-nucleus" />
            <text x={60} y={170} className="dc-cap" textAnchor="middle">
              {t("Your body · {n}", { n: body })}
            </text>
          </g>
          <g transform="translate(400 30)">
            {Array.from({ length: breath }, (_, i) => (
              <circle
                key={i}
                className="dc-bubble"
                cx={30 + (i % 3) * 26}
                cy={130 - Math.floor(i / 3) * 30}
                r={10}
              />
            ))}
            <text x={56} y={180} className="dc-cap" textAnchor="middle">
              {t("Breathed out · {n}", { n: breath })}
            </text>
          </g>
        </svg>
        <div className="dc-heat" aria-label={t("Heat released: {n} units", { n: breath })}>
          <span>{t("Heat released")}</span>
          <div className="meter">
            <i style={{ width: `${(breath / PARCELS) * 100}%` }} />
          </div>
        </div>
      </div>
      <p className="dc-note" aria-live="polite">
        {note}
      </p>
      {!finished ? (
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={() => choose("body")}>
            {t("Into my body")}
          </button>
          <button type="button" className="btn" onClick={() => choose("breath")}>
            {t("Breathe it out")}
          </button>
        </div>
      ) : (
        <div className="dc-result">
          <p>
            {tr("{body} of {n} parcels became you; {breath} left as CO₂.", {
              body: <b className="mono">{body}</b>,
              n: PARCELS,
              breath: <b className="mono">{breath}</b>,
            })}{" "}
            {body === Math.round(cue * PARCELS)
              ? t("That is the most a decomposer with a carbon-use efficiency of {cue} can keep.", {
                  cue: cue.toLocaleString(lang()),
                })
              : t("A decomposer with a carbon-use efficiency of {cue} could have kept {n}.", {
                  cue: cue.toLocaleString(lang()),
                  n: Math.round(cue * PARCELS),
                })}{" "}
            {t("Every parcel is still somewhere: none was destroyed.")}
          </p>
          <button type="button" className="btn btn-primary" onClick={onDone}>
            {t("Now let the world do it")}
          </button>
        </div>
      )}
    </Dialog>
  );
}
