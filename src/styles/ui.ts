/**
 * The few UI-register colours the canvas needs (subject particles, comparison
 * jar, chart peers). Values mirror the vendored token sheet; tests/tokens.test.ts
 * checks each against `src/design-system/tokens.css` so they cannot drift.
 */
export const UI = {
  ink: "#29332e", // primary-dark-green
  page: "#f5f6f6", // neutral-lightest-green
  lime: "#8ede3d", // primary-green: the subject only
  gold: "#b48240", // primary-gold: the comparison only
  greenText: "#384c10", // functional-dark-green
  peerGold: "#ca8407", // cat-gold
  peerAzure: "#2998ed", // cat-azure
  peerRose: "#d76eb9", // cat-rose
  muted: "#6d7471", // neutral-dark-green
  warmText: "#f0eee1", // text-on-dark-warm
  heroDark: "#161c19", // surface-hero-dark
} as const;

export const UI_TOKEN_NAME: Record<keyof typeof UI, string> = {
  ink: "--color-primary-dark-green",
  page: "--color-neutral-lightest-green",
  lime: "--color-primary-green",
  gold: "--color-primary-gold",
  greenText: "--color-functional-dark-green",
  peerGold: "--color-cat-gold",
  peerAzure: "--color-cat-azure",
  peerRose: "--color-cat-rose",
  muted: "--color-neutral-dark-green",
  warmText: "--color-text-on-dark-warm",
  heroDark: "--color-surface-hero-dark",
};
