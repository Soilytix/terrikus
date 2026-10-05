/**
 * World register, TS twin of `scene.css` for the isomorphic painter, which cannot
 * read CSS. Values must match the CSS exactly (tests/tokens.test.ts).
 * gley, oxide, clay, foliage, skyHigh and skyLow are pending CTO sign-off (OD-1).
 */
export const W = {
  humus: "#36250f",
  topsoil: "#423c2d",
  loam: "#64461e",
  subsoil: "#95692d",
  sand: "#bd975f",
  pale: "#f4ece2",
  stone1: "#6d7471",
  stone2: "#47504b",
  dark: "#161c19",
  film: "#d1edf3",
  water: "#44a6bd",
  deep: "#07262d",
  gley: "#5f7470",
  oxide: "#a4572f",
  clay: "#8a6a55",
  foliage: "#4f6b3a",
  skyHigh: "#dce3e0",
  skyLow: "#f1e7d6",
} as const;

export type Pigment = keyof typeof W;
