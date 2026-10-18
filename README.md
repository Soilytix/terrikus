<div align="center">

<img src="docs/banner.jpg" alt="Terrikus, a painted river valley">

<br>
<br>

<a href="https://terrikus.com"><img src="https://img.shields.io/badge/%E2%96%B6%20Play%20now-terrikus.com-8EDE3D?style=for-the-badge&amp;labelColor=16211B" alt="Play now at terrikus.com" height="44"></a>

<br>
<br>

**A playable soil science textbook.** One river valley, six nested scales, fifteen chapters you play as experiments.

<a href="https://github.com/Soilytix/terrikus/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Soilytix/terrikus/ci.yml?branch=main&amp;style=flat-square&amp;labelColor=16211B&amp;label=CI" alt="CI"></a>
<a href="https://github.com/Soilytix/terrikus/actions/workflows/publish.yml"><img src="https://img.shields.io/github/actions/workflow/status/Soilytix/terrikus/publish.yml?branch=main&amp;style=flat-square&amp;labelColor=16211B&amp;label=publish" alt="Publish"></a>
<a href="https://terrikus.com"><img src="https://img.shields.io/website?url=https%3A%2F%2Fterrikus.com&amp;style=flat-square&amp;labelColor=16211B&amp;label=terrikus.com&amp;up_color=1AB172" alt="terrikus.com status"></a>
<img src="https://img.shields.io/badge/chapters-15%20playable-1AB172?style=flat-square&amp;labelColor=16211B" alt="15 playable chapters">
<img src="https://img.shields.io/badge/science%20review-pending-E8B04B?style=flat-square&amp;labelColor=16211B" alt="Scientific review pending">
<img src="https://img.shields.io/badge/languages-EN%20%C2%B7%20DE-1AB172?style=flat-square&amp;labelColor=16211B" alt="English and German">
<a href="https://github.com/Soilytix/terrikus/commits/main"><img src="https://img.shields.io/github/last-commit/Soilytix/terrikus?style=flat-square&amp;labelColor=16211B&amp;color=1AB172" alt="Last commit"></a>

</div>

---

## What it does

Terrikus is a web app that teaches soil science through exploration. The
player stands in one generic river valley and zooms down a ladder of scales:
landscape, field, profile, aggregate and pore, rhizosphere, cell. Each chapter
is a place with experiments. The player predicts, runs, observes and explains,
and keeps what they learn as their own entries in a field notebook.

- **Painted, living world.** Every backdrop is painted at runtime by a seeded
  brush painter in earth pigments and moves gently (wind, drifting light,
  Brownian shimmer). Knowledge stays crisp: organisms, scale bars and labels
  are drawn, never painted.
- **Honest scale.** Every scene carries a true scale bar and a _not to scale_
  badge when anything is enlarged; crossing a rung stamps the notebook.
- **A mass-conserving teaching simulation.** The leaf-in-a-jar bench runs an
  integer double-entry carbon ledger: "Carbon accounted for: 100.0 %", always.
  Two jars compare one change at a time, and an energy bar only ever grows
  toward heat.
- **Explanations, not scores.** Cause-chain cards are confirmed in a batch and
  answered with _supported_, _plausible but untested_ or _contradicted by your
  run_. "Cannot tell yet; measure X" is a correct answer.
- **Measurement versus inference.** The Scientist lens re-skins readouts into
  measured (± band), derived (formula), interpreted (your confidence) tiers.
- **Sourced and reviewable.** Every fact cites an id from `docs/sources.md` and
  carries a confidence; every node shows its scientific review status.

It never shows a Soilytix product, capability or result, never names a
customer, and has no points, leaderboards or soil-health score.

## Chapters

The prologue opens chapters 1 and 2; chapters 3–13 open from the
valley map once their rumour has been met. Every chapter is a draft awaiting
scientific review; `docs/world-bible.md` is the content authority.

<table>
  <tr>
    <td width="280"><img src="docs/screens/desktop-03-handful-observe.jpg" alt="A Handful of Soil"></td>
    <td><strong>P · A Handful of Soil</strong><br><em>Is this alive?</em><br><sub>field → aggregate</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c1-04-labyrinth.jpg" alt="The Pore Labyrinth"></td>
    <td><strong>1 · The Pore Labyrinth</strong><br><em>Why is this bacterium starving next to food?</em><br><sub>aggregate</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-10-litter.jpg" alt="Where Did the Leaf Go?"></td>
    <td><strong>2 · Where Did the Leaf Go?</strong><br><em>The leaf vanished, but the soil barely got heavier.</em><br><sub>field → profile → aggregate</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c3-02-stranded.jpg" alt="Water Roads"></td>
    <td><strong>3 · Water Roads</strong><br><em>After the dry spell, the soil breathed out a burst.</em><br><sub>aggregate, profile</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c4-01-paddy.jpg" alt="Breath and Rust"></td>
    <td><strong>4 · Breath and Rust</strong><br><em>The flooded field smells of eggs, and the rice is fine.</em><br><sub>field, profile</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c5-01-platelet.jpg" alt="Charged Surfaces"></td>
    <td><strong>5 · Charged Surfaces</strong><br><em>The fertiliser stayed exactly where the clay was.</em><br><sub>cell</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c6-01-gallery.jpg" alt="Who Eats Whom"></td>
    <td><strong>6 · Who Eats Whom</strong><br><em>Bacteria near the root multiply, then crash.</em><br><sub>aggregate, rhizosphere</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c7-01-root-tip.jpg" alt="The Root's Neighbourhood"></td>
    <td><strong>7 · The Root's Neighbourhood</strong><br><em>The soil touching the root is a different country.</em><br><sub>rhizosphere</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c8-05-arbuscule.jpg" alt="Partners and Traders"></td>
    <td><strong>8 · Partners and Traders</strong><br><em>One plant grows without nitrogen fertiliser; another forms no partnership with root fungi.</em><br><sub>rhizosphere, cell</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c9-01-relay.jpg" alt="The Nitrogen Relay"></td>
    <td><strong>9 · The Nitrogen Relay</strong><br><em>Straw was ploughed in and the next crop turned yellow.</em><br><sub>rhizosphere</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c10-05-shield.jpg" alt="Disease and Defence"></td>
    <td><strong>10 · Disease and Defence</strong><br><em>The pathogen is here, but the plants are healthy.</em><br><sub>rhizosphere</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c11-01-pit.jpg" alt="Pit Walls and Deep Time"></td>
    <td><strong>11 · Pit Walls and Deep Time</strong><br><em>Why are these layers different colours?</em><br><sub>profile, landscape</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c12-01-fields.jpg" alt="Fields and Seasons"></td>
    <td><strong>12 · Fields and Seasons</strong><br><em>Same seed, two fields, different harvests.</em><br><sub>field, aggregate</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c13-01-valley.jpg" alt="Hillslope and River"></td>
    <td><strong>13 · Hillslope and River</strong><br><em>Where does the soil from the hill go?</em><br><sub>landscape, field</sub></td>
  </tr>
  <tr>
    <td width="280"><img src="docs/screens/desktop-c14-06-reports.jpg" alt="What Does the Sample Tell Us?"></td>
    <td><strong>14 · What Does the Sample Tell Us?</strong><br><em>Two reports about the same field disagree.</em><br><sub>field</sub></td>
  </tr>
</table>

## Controls

| Key             | Does                                                     |
| --------------- | -------------------------------------------------------- |
| Tab / Shift-Tab | Move through the scene outline (every object and portal) |
| Enter / Space   | Scan an object or take a portal                          |
| `+` / `−`       | Zoom within the current scale                            |
| Arrow keys      | Pan                                                      |
| `[` / `]`       | Previous / next portal                                   |
| `L`             | Scientist lens (after chapter 2 unlocks it)              |
| `N`             | Field notebook                                           |
| `?`             | Help                                                     |
| Esc             | Close the open panel, or go up one scale                 |

`?static=1` renders every scene as a static painted plate with the same
buttons. The app follows `prefers-reduced-motion`, and Settings has its own
motion switch.

## Development

Needs [mise](https://mise.jdx.dev); everything else comes from `mise.toml`.

```sh
git clone git@github.com:Soilytix/terrikus.git
cd terrikus
mise run setup      # tools, dependencies, git hooks, full check
mise run dev        # http://localhost:5173
```

`mise run build` writes a static site to `dist/` with relative paths, no
backend and no network calls; progress lives in the browser's `localStorage`
(`terrikus:v1`) and exports as JSON from Settings. Every merge to main deploys
to <https://terrikus.com> on Vercel and to the internal hub
(`.github/workflows/publish.yml`). `SW_PROFILE=public` builds only approved
content and public assets (default `internal`); `.env.example` lists the rest.

`mise run check` is the definition of done: ESLint, Prettier, TypeScript,
vitest, the build, the bundle scan and the size budget. The gates run on their
own as `mise run lint`, `fmt-check`, `typecheck`, `test` and `build`.
`mise run e2e` runs the Playwright smoke over the build and refreshes the
screenshots in `docs/screens/`.

`AGENTS.md` is the working agreement: content rules, colour registers, layout
and the definition of done.
