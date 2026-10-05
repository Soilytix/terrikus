# The vendored design system tokens

`tokens.css` and `fonts.css` are byte-for-byte copies of the token sheet in the
platform monorepo. Only the tokens are vendored: Soil Worlds builds its own
components (bench, notebook, chains) because the system has none of them.

|               |                                                                                    |
| ------------- | ---------------------------------------------------------------------------------- |
| Source repo   | `Soilytix/platform`                                                                |
| Source commit | `7441225df5006c9d85e00906741d26801720ba22` (2026-10-05, last change to the tokens) |
| Source path   | `packages/design-system/src/tokens/{tokens,fonts}.css` (package v0.2.0)            |
| Vendored on   | 2026-10-06                                                                         |

**Why platform and not the hub copy (spec D-6, OD-15).** The platform package is
the canonical system; the hub carries an older generated copy. This is a
deliberate deviation from the original task text and is flagged for the CTO.

**Treat both files as read-only.** Re-copy them from platform to update. Colours
the illustration needs that the system does not carry live in
`src/styles/scene.css` (the world register, art-direction §2), never here.
