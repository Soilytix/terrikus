/**
 * Chapter 6 benches in the mission panel: the food-web mobile (links reveal
 * only by watching a meal happen), the remove-a-node ripple run, and the
 * squeezing-jar preview, whose caption stays on screen whenever the readout does.
 */
import { useMemo, useState } from "react";
import { organism } from "../content/organisms";
import type { Fact } from "../content/schema";
import { assetUrl } from "../assets/urls";
import {
  linkId,
  observedLinks,
  relative,
  runWeb,
  WEB_LINKS,
  WEB_ORGANISMS,
  type WebLedger,
  type WebOrganism,
  type WebSettings,
} from "../sim/food-web";
import { Facts, SourceRef } from "./common";

/** Root sugar pulse, the same in every chapter-6 run. */
const BASE: WebSettings = { water: "moist", pulse: 3000 };
const WATCH_DAYS = 10;
const RIPPLE_DAYS = 20;

const SHORT: Record<WebOrganism | "food", string> = {
  "bacteria-copio": "Bacteria",
  "fungi-sap": "Fungi",
  amoeba: "Amoebae",
  "nematode-bact": "Bacteria-feeding nematodes",
  "nematode-fung": "Fungus-feeding nematodes",
  springtail: "Springtails",
  "nematode-pred": "Predatory nematodes",
  mite: "Predatory mites",
  food: "Root sugars",
};

/** Mobile layout (viewBox units): predators on top, root sugars at the bottom; bacterial channel left, fungal right. */
const AT: Record<WebOrganism | "food", [number, number]> = {
  "nematode-pred": [210, 46],
  mite: [430, 46],
  amoeba: [76, 170],
  "nematode-bact": [236, 206],
  "nematode-fung": [404, 206],
  springtail: [564, 170],
  "bacteria-copio": [170, 330],
  "fungi-sap": [470, 330],
  food: [320, 430],
};

const linkText = (id: string) => {
  const [eater, eaten] = id.split(">") as [WebOrganism, WebOrganism | "food"];
  return `${SHORT[eater]} eat ${SHORT[eaten].toLowerCase()}`;
};

function sizeText(o: WebOrganism): string {
  const [a, b] = organism(o)?.sizeRange ?? [0, 0];
  const fmt = (m: number) =>
    m >= 1e-3 ? `${+(m * 1e3).toPrecision(2)} mm` : `${+(m * 1e6).toPrecision(2)} µm`;
  return `${fmt(a)}–${fmt(b)}`;
}

/** True-size bar: log scale from 0.1 µm, so a bacterium and a mite fit on one mobile. */
const barLength = (o: WebOrganism) =>
  Math.max(2, Math.log10((organism(o)?.sizeRange[1] ?? 1e-7) / 1e-7) * 10);

export function Mobile({ seen, removed = [] }: { seen: string[]; removed?: WebOrganism[] }) {
  const lines = WEB_LINKS.filter((l) => seen.includes(linkId(l)));
  const label = seen.length
    ? `The food-web mobile. Links seen so far: ${seen.map(linkText).join("; ")}.`
    : "The food-web mobile. No feeding has been watched yet, so no links are drawn.";
  return (
    <svg className="mobile" viewBox="0 0 640 480" role="img" aria-label={label}>
      {lines.map((l) => {
        const [x1, y1] = AT[l.eaten];
        const [x2, y2] = AT[l.eater];
        return (
          <line
            key={linkId(l)}
            x1={x1}
            y1={y1 - 26}
            x2={x2}
            y2={y2 + (SHORT[l.eater].includes(" ") ? 96 : 76)}
            className="mobile-link"
            data-channel={l.channel}
          />
        );
      })}
      <g className="mobile-node">
        <circle cx={AT.food[0]} cy={AT.food[1]} r={20} className="mobile-food" />
        <text x={AT.food[0]} y={AT.food[1] + 42} textAnchor="middle">
          {SHORT.food}
        </text>
      </g>
      {WEB_ORGANISMS.map((o) => {
        const [x, y] = AT[o];
        const art = assetUrl(`organism-${o}`);
        // Two-word names break after the first word so neighbours do not collide.
        const [first, ...rest] = SHORT[o].split(" ");
        const dy = rest.length ? 20 : 0;
        return (
          <g key={o} className="mobile-node" data-removed={removed.includes(o)}>
            {art && <image href={art} x={x - 20} y={y - 20} width={40} height={40} />}
            <text x={x} y={y + 38} textAnchor="middle">
              {first}
              {rest.length > 0 && (
                <tspan x={x} dy={20}>
                  {rest.join(" ")}
                </tspan>
              )}
            </text>
            <rect
              x={x - barLength(o) / 2}
              y={y + 46 + dy}
              width={barLength(o)}
              height={3}
              className="mobile-size"
            />
            <text x={x} y={y + 64 + dy} textAnchor="middle" className="mobile-size-label">
              {sizeText(o)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Watch organisms one at a time; the links seen feeding are reported to `onSeen`. */
export function FoodWebWatch({
  watch,
  seen,
  onSeen,
}: {
  watch: WebOrganism[];
  seen: string[];
  onSeen: (links: string[]) => void;
}) {
  const snaps = useMemo(() => runWeb(BASE, WATCH_DAYS), []);
  const [log, setLog] = useState<string[]>([]);
  const look = (o: WebOrganism) => {
    const links = observedLinks(snaps, o);
    const nh4 = snaps
      .flatMap((s) => s.transfers)
      .filter((t) => t.rule === `excretion:${o}`)
      .reduce((a, t) => a + t.amount, 0);
    const meals = links.length ? links.map(linkText).join("; ") : "no meal seen";
    setLog((l) => [
      `${SHORT[o]}, ${WATCH_DAYS} days: ${meals}.${nh4 ? ` Ammonium released: ${nh4} N units.` : ""}`,
      ...l,
    ]);
    onSeen(links);
  };
  return (
    <div className="food-web">
      <Mobile seen={seen} />
      <div className="watch-row" role="group" aria-label="Watch an organism">
        {watch.map((o) => (
          <button key={o} type="button" className="btn" onClick={() => look(o)}>
            Watch: {SHORT[o]}
          </button>
        ))}
      </div>
      {log.length > 0 && (
        <ul className="watch-log" aria-live="polite">
          {log.map((line, i) => (
            <li key={log.length - i}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const ROWS: (WebOrganism | "plant")[] = [...WEB_ORGANISMS, "plant"];
const value = (l: WebLedger, k: WebOrganism | "plant") => (k === "plant" ? l.N.plant : l.C[k]);

/** Full web beside the web without `removed`, after the same pulse and days. */
export function Ripple({ removed }: { removed: WebOrganism[] }) {
  const [full, cut] = useMemo(
    () => [
      runWeb(BASE, RIPPLE_DAYS)[RIPPLE_DAYS]!.ledger,
      runWeb({ ...BASE, removed }, RIPPLE_DAYS)[RIPPLE_DAYS]!.ledger,
    ],
    [removed],
  );
  const max = (k: WebOrganism | "plant") => Math.max(1, value(full, k), value(cut, k));
  return (
    <figure className="ripple">
      <p className="teaching-banner" role="note">
        <span className="dot" aria-hidden="true" />
        Teaching model: direction, not prediction.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">After {RIPPLE_DAYS} days</th>
            <th scope="col">Whole web</th>
            <th scope="col">Without {removed.map((o) => SHORT[o].toLowerCase()).join(" and ")}</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((k) => (
            <tr key={k} data-key={k}>
              <th scope="row">{k === "plant" ? "Nitrogen taken up by the root" : SHORT[k]}</th>
              {[full, cut].map((l, i) => (
                <td key={i}>
                  <span className="ripple-bar" style={{ width: `${(value(l, k) / max(k)) * 100}%` }} />
                  <span className="mono">{value(l, k)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>
        Biomass in carbon units; root uptake in nitrogen units. Same root sugar pulse in both.
      </figcaption>
    </figure>
  );
}

const GROUPS = [
  { id: "bacteria", label: "Bacteria", taxa: ["bacteria-copio"] },
  { id: "fungi", label: "Fungi", taxa: ["fungi-sap"] },
  { id: "protists", label: "Protists", taxa: ["amoeba"] },
  {
    id: "animals",
    label: "Nematodes and arthropods",
    taxa: ["nematode-bact", "nematode-fung", "springtail", "nematode-pred", "mite"],
  },
] as const;
const JAR_DAYS = 6;

/** The squeezing jar: shares before and after a bloom, beside the model's absolute biomass. */
export function SqueezingJar({ facts }: { facts: Fact[] }) {
  const cols = useMemo(() => {
    const snaps = runWeb(BASE, JAR_DAYS);
    return [snaps[0]!, snaps[JAR_DAYS]!].map((s) => {
      const share = relative(s.ledger, WEB_ORGANISMS);
      return GROUPS.map((g) => ({
        ...g,
        share: g.taxa.reduce((a, t) => a + (share[t] ?? 0), 0),
        abs: g.taxa.reduce((a, t) => a + s.ledger.C[t], 0),
      }));
    });
  }, []);
  const maxAbs = Math.max(...cols.flat().map((g) => g.abs));
  const names = ["Before the pulse", `Day ${JAR_DAYS}`];
  return (
    <figure className="jar">
      <div className="jar-panels">
        <section aria-label="Sequencing readout, relative">
          <h4>Sequencing readout (shares of reads)</h4>
          {cols.map((col, i) => (
            <div key={i} className="jar-row">
              <span className="jar-when">{names[i]}</span>
              <span
                className="jar-stack"
                role="img"
                aria-label={`${names[i]}: ${col.map((g) => `${g.label} ${Math.round(g.share * 100)} %`).join(", ")}`}
              >
                {col.map((g) => (
                  <span key={g.id} className={`jar-seg jar-${g.id}`} style={{ width: `${g.share * 100}%` }}>
                    {g.share > 0.12 ? `${Math.round(g.share * 100)} %` : ""}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </section>
        <section aria-label="Teaching model, absolute">
          <h4>Teaching model (absolute biomass; sequencing does not give this)</h4>
          {GROUPS.map((g, k) => (
            <div key={g.id} className="jar-row">
              <span className="jar-when">{g.label}</span>
              <span className="jar-abs">
                {cols.map((col, i) => (
                  <span
                    key={i}
                    className={`jar-seg jar-${g.id}`}
                    data-when={i}
                    style={{ width: `${(col[k]!.abs / maxAbs) * 100}%` }}
                    title={`${names[i]}: ${col[k]!.abs}`}
                  />
                ))}
              </span>
            </div>
          ))}
        </section>
      </div>
      <ul className="jar-key" aria-hidden="true">
        {GROUPS.map((g) => (
          <li key={g.id}>
            <span className={`jar-swatch jar-${g.id}`} />
            {g.label}
          </li>
        ))}
      </ul>
      <figcaption className="jar-caption">
        Relative, not absolute; presence ≠ activity. <SourceRef id="gloor-2017" />
      </figcaption>
      <Facts facts={facts} />
    </figure>
  );
}
