/** Credits: every bundled asset in this profile with its attribution and licence (art-direction §7). */
import type { Licence } from "../content/schema";
import { bundledAssets } from "../assets/manifest";

const LICENCE: Record<Licence, string> = {
  soilytix: "Soilytix",
  pd: "Public domain",
  cc0: "CC0",
  "cc-by": "CC BY",
  "cc-by-sa": "CC BY-SA",
  ofl: "SIL OFL",
  copernicus: "Copernicus free and open data",
  "internal-only": "Internal only",
};

// Fonts ship from @fontsource, outside src/assets/, so they are listed here.
const FONTS: [string, string][] = [
  ["Inter", "Rasmus Andersson, via @fontsource-variable/inter"],
  ["IBM Plex Mono", "IBM, via @fontsource/ibm-plex-mono"],
  ["Source Serif 4", "Adobe, via @fontsource-variable/source-serif-4"],
  ["Kalam", "Indian Type Foundry, via @fontsource/kalam"],
];

export function Credits() {
  return (
    <section className="credits-section" aria-labelledby="credits-title">
      <h3 id="credits-title" className="settings-group">
        Credits
      </h3>
      <table className="keys credits">
        <tbody>
          {bundledAssets(__SW_PROFILE__).map((a) => (
            <tr key={a.id}>
              <th scope="row" className="mono" title={a.path}>
                {a.path}
              </th>
              <td>
                {a.referenceUrl ? (
                  <a href={a.referenceUrl} target="_blank" rel="noreferrer">
                    {a.attribution}
                  </a>
                ) : (
                  a.attribution
                )}
              </td>
              <td>{LICENCE[a.licence]}</td>
            </tr>
          ))}
          {FONTS.map(([name, by]) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td>{by}</td>
              <td>{LICENCE.ofl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
