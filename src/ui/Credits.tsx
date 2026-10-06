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
  "internal-only": "Internal only",
};

// Fonts ship from @fontsource, outside src/assets/, so they are listed here.
const FONTS: [string, string][] = [
  ["Inter", "Rasmus Andersson, via @fontsource-variable/inter"],
  ["IBM Plex Mono", "IBM, via @fontsource/ibm-plex-mono"],
];

export function Credits() {
  return (
    <section aria-labelledby="credits-title">
      <h3 id="credits-title">Credits</h3>
      <table className="keys credits">
        <tbody>
          {bundledAssets(__SW_PROFILE__).map((a) => (
            <tr key={a.id}>
              <th scope="row" className="mono small">
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
              <td className="small muted">{LICENCE[a.licence]}</td>
            </tr>
          ))}
          {FONTS.map(([name, by]) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td>{by}</td>
              <td className="small muted">{LICENCE.ofl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
