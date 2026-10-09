# Pedologicus — working agreement

Pedologicus is a playable soil science textbook: one generic valley, six nested
scales, chapters you play as experiments. This file is the contract for humans
and agents changing it. `CLAUDE.md` is a symlink to it. The plan lives in
`docs/spec.md`; the content authority is `docs/world-bible.md`; the look is
`docs/art-direction.md`; the order of work is `docs/backlog.md`.

## Golden rules

1. **Every fact has a source id.** A `Fact` carries `sources: SourceId[]`
   (non-empty) and a `confidence` (`firm` / `estimate` / `contested`). Ids come
   from `docs/sources.md` and nowhere else; `src/content/sources.ts` is
   generated from it (`mise exec -- pnpm exec tsx tools/gen-sources.ts`). The
   content lint fails on an unknown id, a registry id with no row in the doc, or
   a fact with no sources.
2. **Every content node has a science review status.** New content ships as
   `reviewStatus: "draft"` and the internal build shows a "Scientific review
   pending" badge on it. Only a named reviewer moves a node to `approved`; an
   agent never does. The `public` profile refuses anything not approved.
3. **No customer names, ever.** No customer, variety, field, trial, sample id or
   account framing anywhere in `src/` or `docs/`, `docs/research/` included:
   the repository is public. Crop worlds are generic (spinach, pea, bean, sugar
   beet, rice). `tests/denylist.test.ts` enforces this against the SHA-256
   hashes in `tests/denylist-hashes.json`; the plain list lives outside the
   repo and is never committed, not even in a test.
4. **Measurement is not inference.** Keep the evidence tiers apart on screen
   and in data: _measured_ (numbers with a ± band), _derived_ (formula shown),
   _interpreted_ (player-chosen confidence), _would-measure_ (if … then …
   because …). Indicators describe; models predict. Sequencing-only links use
   _is associated with_, never a causal connector.
5. **The simulation teaches direction, not prediction.** Rates are teaching
   values. Every bench shows the "Teaching model — direction, not prediction"
   banner. The ledger is integer double-entry and conserves every element
   exactly; noise lives only in the measurement layer.
6. **No Soilytix capability, product, maturity, score or result appears as
   real.** No points, scores, currency, streaks or leaderboards; the notebook is
   the only reward. Organisms are never "good" or "bad".
7. **Two colour registers.** UI colours come from the vendored design system
   (`src/design-system/`, read-only). Illustration colours come from the world
   register (`src/styles/scene.css` and its TS twin `src/styles/scene.ts`). Lime
   is the subject only and never appears in the world register; raw hexes
   live only in `src/styles/` and `src/design-system/`. `tests/tokens.test.ts`
   enforces the registers; `tests/vendored.test.ts` holds every vendored file
   to the SHA-256 recorded in `src/design-system/VENDORED.md`.
8. **Text lives in the DOM.** The canvas is `aria-hidden`; every interactive
   object is a real button in the scene outline. Reduced motion and
   `?static=1` must work for every scene.
9. **Open decisions stay open.** `docs/spec.md` §11 lists them. Build around a
   pending decision and raise it; never settle it in code.

## Layout

| Path           | Holds                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| `src/app/`     | Shell, hash router, zustand store, settings                                         |
| `src/content/` | Typed content: schema, sources, misconceptions, organisms, processes, chapters      |
| `src/sim/`     | Ledger, modifiers, engine, benches. No DOM, React or Pixi imports (ESLint enforces) |
| `src/world/`   | Pixi renderer, camera, seeded painter, particles, static fallback                   |
| `src/ui/`      | Notebook, bench, chains, HUD, mission panel                                         |
| `src/save/`    | Save schema, storage with fallback, migrations, export/import                       |
| `src/pilot/`   | Opt-in pilot instrument (T33): local-only log, explicit export, thresholds (OD-13)  |
| `src/styles/`  | World register and app CSS                                                          |
| `src/assets/`  | Bundled art; every file listed in `src/assets/manifest.ts`                          |
| `tools/`       | Budget check, bundle scan, denylist hashing, source registry generator              |
| `tests/`       | Cross-cutting tests: content lint, denylist, tokens, vendored, profile              |
| `e2e/`         | Playwright smoke; writes screenshots to `docs/screens/`                             |

## Naming

- Content ids are kebab-case and permanent: `p-m1`, `c2-hedge-edge`,
  `bacteria-copio`. Chapter prefixes follow the world bible (`p-`, `c2-`).
- Source ids follow `docs/sources.md` (`firstauthor-year[-keyword]`).
- Misconceptions are `M1`… as in `docs/research/curriculum.md` Appendix B.

## Workflow

```sh
mise run setup      # cold start: tools, deps, hooks, check
mise run dev        # Vite dev server
mise run check      # lint + format + typecheck + tests + build + scan + budget
mise run e2e        # Playwright smoke over the build, refreshes docs/screens/
```

## Definition of done

- `mise run check` is green.
- New logic has a direct test; simulation changes keep the conservation and
  direction tests passing for every lever combination.
- New content carries sources, `reviewStatus: "draft"` and a simplification
  note where it simplifies.
- New bundled assets have a manifest entry with source id, licence, truth tag
  and `publicOk`.
- Dependencies are added with `pnpm add`; the lockfile is committed.
- Visual changes are checked with `mise run e2e` and the screenshots looked at.
