<div align="center">

<img src="docs/banner.jpg" alt="Terrikus, a painted river valley">

<a href="https://github.com/Soilytix/terrikus/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Soilytix/terrikus/ci.yml?branch=main&amp;style=flat-square&amp;labelColor=16211B&amp;label=CI" alt="CI"></a>
<a href="https://github.com/Soilytix/terrikus/actions/workflows/publish.yml"><img src="https://img.shields.io/github/actions/workflow/status/Soilytix/terrikus/publish.yml?branch=main&amp;style=flat-square&amp;labelColor=16211B&amp;label=publish" alt="Publish"></a>
<a href="https://terrikus.com"><img src="https://img.shields.io/website?url=https%3A%2F%2Fterrikus.com&amp;style=flat-square&amp;labelColor=16211B&amp;label=terrikus.com&amp;up_color=1AB172" alt="terrikus.com status"></a>
<img src="https://img.shields.io/badge/chapters-15%20playable-1AB172?style=flat-square&amp;labelColor=16211B" alt="15 playable chapters">
<img src="https://img.shields.io/badge/languages-EN%20%C2%B7%20DE-1AB172?style=flat-square&amp;labelColor=16211B" alt="English and German">

**A playable soil science textbook.** Explore a living river valley across six nested scales and fifteen interactive experiment-driven chapters.

<br>

<a href="https://terrikus.com"><img src="https://img.shields.io/badge/%E2%96%B6%20Play%20now-terrikus.com-8EDE3D?style=for-the-badge&amp;labelColor=16211B" alt="Play now at terrikus.com" height="44"></a>

<br>

</div>

---

## Overview

**Terrikus** is an interactive web application designed to teach soil science through active scientific inquiry and exploration. Set within a single representative river valley, players zoom seamlessly across six nested spatial scales:

$$\text{Landscape} \longrightarrow \text{Field} \longrightarrow \text{Profile} \longrightarrow \text{Aggregate and Pore} \longrightarrow \text{Rhizosphere} \longrightarrow \text{Cell}$$

In each chapter, players formulate predictions, conduct controlled experiments, analyze observations, and build causal explanations, recording their discoveries directly into an interactive field notebook.

### Key Pillars

- **Generative Earth-Pigment Aesthetics:** Canvas backdrops are painted live at runtime using seeded procedural brushwork in natural earth pigments, animated by ambient motion (light drift, wind, Brownian movement). Technical overlays, scale indicators, and organism diagrams remain crisp vector drawings.
- **Honest Spatial Scale:** Every view displays an accurate physical scale bar, prominently highlighting _not-to-scale_ indicators whenever elements are magnified for clarity. Scale shifts are automatically stamped in the player's notebook.
- **Mass-Conserving Simulation Engine:** Lab experiments operate under exact double-entry accounting (e.g., _Carbon accounted for: 100.0%_). Bench comparisons isolate single variables, maintaining strict thermodynamic directionality toward heat dissipation.
- **Evidence-Based Explanations:** Hypotheses and cause-effect chains are evaluated in batches as _supported_, _plausible but untested_, or _contradicted by run data_. Recognizing insufficient evidence ("Cannot tell yet; measure X") is treated as a valid scientific conclusion.
- **Differentiated Data Tiers:** The _Scientist Lens_ categorizes interface data into distinct evidence levels: _Measured_ ($\pm$ uncertainty interval), _Derived_ (explicit formula-based calculation), and _Interpreted_ (player confidence level).
- **Fully Sourced & Peer-Reviewed:** Every scientific statement links to a specific source entry in `docs/sources.md` with explicit confidence ratings and transparent peer-review tracking status.
- **Pure Scientific Focus:** Uncompromising pedagogical integrity: free from gamified points, competitive leaderboards, arbitrary soil scores, or commercial product placements.

## Playable Chapters

Chapters 1 and 2 open following the prologue; chapters 3–14 unlock from the valley map as players discover rumors. All chapters reflect ongoing scientific review guided by `docs/world-bible.md`.

<table>
  <tr>
    <td width="280"><img src="docs/screens/desktop-03-handful-observe.jpg" alt="A Handful of Soil"></td>
    <td><strong>[P] A Handful of Soil</strong><br><em>Is this alive?</em><br><sub>field → aggregate</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c1-04-labyrinth.jpg" alt="The Pore Labyrinth"></td>
    <td><strong>[1] The Pore Labyrinth</strong><br><em>Why is this bacterium starving next to food?</em><br><sub>aggregate</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-10-litter.jpg" alt="Where Did the Leaf Go?"></td>
    <td><strong>[2] Where Did the Leaf Go?</strong><br><em>The leaf vanished, but the soil barely got heavier.</em><br><sub>field → profile → aggregate</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c3-02-stranded.jpg" alt="Water Roads"></td>
    <td><strong>[3] Water Roads</strong><br><em>After the dry spell, the soil breathed out a burst.</em><br><sub>aggregate, profile</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c4-01-paddy.jpg" alt="Breath and Rust"></td>
    <td><strong>[4] Breath and Rust</strong><br><em>The flooded field smells of eggs, and the rice is fine.</em><br><sub>field, profile</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c5-01-platelet.jpg" alt="Charged Surfaces"></td>
    <td><strong>[5] Charged Surfaces</strong><br><em>The fertiliser stayed exactly where the clay was.</em><br><sub>cell</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c6-01-gallery.jpg" alt="Who Eats Whom"></td>
    <td><strong>[6] Who Eats Whom</strong><br><em>Bacteria near the root multiply, then crash.</em><br><sub>aggregate, rhizosphere</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c7-01-root-tip.jpg" alt="The Root's Neighbourhood"></td>
    <td><strong>[7] The Root's Neighbourhood</strong><br><em>The soil touching the root is a different country.</em><br><sub>rhizosphere</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c8-05-arbuscule.jpg" alt="Partners and Traders"></td>
    <td><strong>[8] Partners and Traders</strong><br><em>One plant grows without nitrogen fertiliser; another forms no partnership with root fungi.</em><br><sub>rhizosphere, cell</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c9-01-relay.jpg" alt="The Nitrogen Relay"></td>
    <td><strong>[9] The Nitrogen Relay</strong><br><em>Straw was ploughed in and the next crop turned yellow.</em><br><sub>rhizosphere</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c10-05-shield.jpg" alt="Disease and Defence"></td>
    <td><strong>[10] Disease and Defence</strong><br><em>The pathogen is here, but the plants are healthy.</em><br><sub>rhizosphere</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c11-01-pit.jpg" alt="Pit Walls and Deep Time"></td>
    <td><strong>[11] Pit Walls and Deep Time</strong><br><em>Why are these layers different colours?</em><br><sub>profile, landscape</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c12-01-fields.jpg" alt="Fields and Seasons"></td>
    <td><strong>[12] Fields and Seasons</strong><br><em>Same seed, two fields, different harvests.</em><br><sub>field, aggregate</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c13-01-valley.jpg" alt="Hillslope and River"></td>
    <td><strong>[13] Hillslope and River</strong><br><em>Where does the soil from the hill go?</em><br><sub>landscape, field</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c14-06-reports.jpg" alt="What Does the Sample Tell Us?"></td>
    <td><strong>[14] What Does the Sample Tell Us?</strong><br><em>Two reports about the same field disagree.</em><br><sub>field</sub></td>
  </tr>
</table>

## Controls & Accessibility

| Key                                                 | Function                                          |
| :-------------------------------------------------- | :------------------------------------------------ |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd>  | Navigate scene elements and interactive portals   |
| <kbd>Enter</kbd> / <kbd>Space</kbd>                 | Inspect target object or traverse selected portal |
| <kbd>+</kbd> / <kbd>−</kbd>                         | Adjust zoom level within active scale             |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Pan scene view                                    |
| <kbd>[</kbd> / <kbd>]</kbd>                         | Select previous / next portal                     |
| <kbd>L</kbd>                                        | Toggle Scientist Lens _(unlocked in Chapter 2)_   |
| <kbd>N</kbd>                                        | Open Field Notebook                               |
| <kbd>?</kbd>                                        | Display context help                              |
| <kbd>Esc</kbd>                                      | Close active modal or navigate up one scale level |

- **Static Fallback:** Appending `?static=1` to the URL renders static painted plates while preserving interactive controls.
- **Reduced Motion:** Fully honors system-level `prefers-reduced-motion` settings and includes an explicit in-app motion toggle in Settings.

## Development & Deployment

### Prerequisites & Setup

Terrikus relies on [mise](https://mise.jdx.dev) for toolchain management.

```sh
git clone git@github.com:Soilytix/terrikus.git
cd terrikus

mise run setup # Install tools, dependencies, setup git hooks, and run initial checks
mise run dev # Start local development server (http://localhost:5173)
mise run check # Run the full verification suite
mise run e2e # End-to-end Playwright visual regression and smoke tests

```
