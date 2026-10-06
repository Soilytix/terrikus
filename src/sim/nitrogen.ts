/**
 * Nitrogen engine (T18). `withNitrogen` wraps any carbon bench and adds the N
 * side of the ledger: N follows every organic C transfer at the source pool's
 * start-of-tick N:C (C:N coupling), and the rules below move mineral N.
 * Rates are teaching values: they get direction right, not numbers.
 *
 * Simplifications: one microbial pool at a fixed body C:N; nitrite is skipped
 * (NH₄⁺ → NO₃⁻ in one step); denitrification is gated by O₂ only, not by C
 * supply; no plant uptake; no NH₃ volatilisation.
 */
import type { BenchModel } from "./engine";
import { cloneLedger, transfer, type Element, type Ledger, type PoolOf } from "./ledger";
import { fO2, fT, fW } from "./modifiers";

/** Body C:N. Microbes ≈ 8:1 (`nrcs-cn-ratios`, verify); the rest are teaching values. */
export const CN = { microbe: 8, grazer: 8, mineral: 10 } as const;

/** Residue C:N by residue lever. Leaf and straw from `nrcs-cn-ratios` ranges (verify); wood is a teaching value. */
export const RESIDUE_CN = { leaf: 15, straw: 80, wood: 300 } as const;

/** Rain lever: share of the full leaching rate. */
export const RAIN = { dry: 0, wet: 1 } as const;

/** Denitrification runs only when fO2 is below this (WFPS above ≈ 0.85). */
export const FO2_ANOXIC = 0.5;

/** Per-day teaching rates. */
export const N_RATES = {
  kNit: 0.1, // nitrification of NH₄⁺
  kDen: 0.2, // denitrification of NO₃⁻ at full anoxia
  n2oShare: 0.2, // share of denitrified N leaving as N₂O, the rest as N₂
  kLeach: 0.05, // NO₃⁻ leaching at rain = 1
  kOld: 0.0002, // basal decay of old soil organic matter
  kPrime: 0.02, // most of the old N microbes can mine per day when N-starved
  kGraze: 0.03, // grazing of microbial biomass
  grazerEff: 0.4, // share of eaten C kept as grazer biomass; the rest is respired
  kGResp: 0.01, // grazer maintenance respiration
  kGDeath: 0.02, // grazer death
} as const;

export interface NitrogenSettings {
  wfps: number;
  celsius: number;
  /** 0 (dry) – 1 (wet); see `RAIN`. */
  rain: number;
  residueCN: number;
  mineralN?: { NH4: number; NO3: number };
  /** Old soil organic matter: enables priming (chapter 2 stretch). */
  oldSom?: { C: number; cn: number };
  /** Initial grazer C; grazing is off without grazers. */
  grazers?: number;
}

const ORGANIC = ["L", "D", "B", "M", "O", "G"] as const;
type Organic = (typeof ORGANIC)[number];
const isOrganic = (p: string): p is Organic => (ORGANIC as readonly string[]).includes(p);

type Carries = Record<string, number>;

/** Integer flux with a deterministic rounding carry, so tiny rates never stall. */
function flux(carries: Carries, key: string, amount: number): number {
  const raw = amount + (carries[key] ?? 0);
  const whole = Math.max(0, Math.floor(raw));
  carries[key] = raw - whole;
  return whole;
}

export interface NitrogenState<S> {
  inner: S;
  carries: Carries;
}

export function withNitrogen<S>(
  carbon: BenchModel<S>,
  settings: NitrogenSettings,
): BenchModel<NitrogenState<S>> {
  const f = { fT: fT(settings.celsius), fW: fW(settings.wfps), fO2: fO2(settings.wfps) };
  const anoxia = f.fO2 < FO2_ANOXIC ? (FO2_ANOXIC - f.fO2) / FO2_ANOXIC : 0;
  return {
    initial() {
      const l = carbon.initial();
      l.N.L = Math.round(l.C.L / settings.residueCN);
      l.N.B = Math.round(l.C.B / CN.microbe);
      l.N.M = Math.round(l.C.M / CN.mineral);
      // Dissolved C starts N-free: a sugar pulse carries no N.
      l.C.O = settings.oldSom?.C ?? 0;
      l.N.O = settings.oldSom ? Math.round(settings.oldSom.C / settings.oldSom.cn) : 0;
      l.C.G = settings.grazers ?? 0;
      l.N.G = Math.round(l.C.G / CN.grazer);
      l.N.NH4 = settings.mineralN?.NH4 ?? 0;
      l.N.NO3 = settings.mineralN?.NO3 ?? 0;
      return l;
    },
    initialState: () => ({ inner: carbon.initialState(), carries: {} }),
    energy(l) {
      const e = carbon.energy(l);
      return { organic: e.organic + l.C.O + l.C.G, heat: e.heat + l.C.co2Old };
    },
    step(l, state, day) {
      const start = cloneLedger(l);
      const out = carbon.step(l, state.inner, day);
      const { carries } = state;
      // What each pool may still give this tick (R09: outflow ≤ start-of-tick value).
      const budget = { C: { ...start.C }, N: { ...start.N } } as Record<Element, Record<string, number>>;
      for (const t of out) budget[t.element][t.from]! -= t.amount;
      const move = (element: Element, from: string, to: string, amount: number, rule: string): number => {
        const moved = transfer(
          l,
          element,
          from as PoolOf<Element>,
          to as PoolOf<Element>,
          Math.min(amount, budget[element][from]!),
        );
        budget[element][from]! -= moved;
        if (moved > 0) out.push({ element, from, to, amount: moved, rule });
        return moved;
      };
      const rate = (rule: string, pool: number, k: number) => flux(carries, rule, pool * k);

      // Carbon rules that only exist with N: grazing loop and old organic matter.
      const { B, G, O } = start.C;
      if (G > 0) {
        const eaten = rate("grazing", B, N_RATES.kGraze * f.fW);
        const kept = flux(carries, "grazing-eff", eaten * N_RATES.grazerEff);
        move("C", "B", "G", kept, "grazing");
        move("C", "B", "co2Out", eaten - kept, "grazing");
        move("C", "G", "co2Out", rate("grazer-resp", G, N_RATES.kGResp * f.fT), "grazer-resp");
        move("C", "G", "D", rate("grazer-death", G, N_RATES.kGDeath), "grazer-death");
      }
      move("C", "O", "co2Old", rate("old-decay", O, N_RATES.kOld * f.fT * f.fW * f.fO2), "old-decay");

      // C:N coupling: N follows organic C; N of respired C is mineralised to NH₄⁺.
      for (const t of out.filter((x) => x.element === "C" && isOrganic(x.from))) {
        const ratio =
          start.C[t.from as Organic] > 0 ? start.N[t.from as Organic] / start.C[t.from as Organic] : 0;
        const n = flux(carries, `n:${t.rule}:${t.from}>${t.to}`, t.amount * ratio);
        if (isOrganic(t.to)) move("N", t.from, t.to, n, t.rule);
        else move("N", t.from, "NH4", n, "mineralisation");
      }

      // Microbial stoichiometry: release surplus N, or take mineral N, mine old N, then respire excess C.
      let demand = Math.ceil(l.C.B / CN.microbe) - l.N.B;
      if (demand < 0) move("N", "B", "NH4", -demand, "mineralisation");
      if (demand > 0) demand -= move("N", "NH4", "B", demand, "immobilisation");
      if (demand > 0) demand -= move("N", "NO3", "B", demand, "immobilisation");
      if (demand > 0 && start.N.O > 0) {
        // Priming by N mining (`kuzyakov-2010`, `fontaine-2007`): starved microbes decompose old matter for its N.
        const cap = flux(carries, "priming-cap", start.N.O * N_RATES.kPrime);
        const mined = move("N", "O", "B", Math.min(demand, cap), "priming");
        move("C", "O", "co2Old", Math.floor((mined * start.C.O) / start.N.O), "priming");
        demand -= mined;
      }
      if (demand > 0) move("C", "B", "co2Out", l.C.B - CN.microbe * l.N.B, "overflow-resp");

      // Mineral N rules, from start-of-tick pools.
      move(
        "N",
        "NH4",
        "NO3",
        rate("nitrification", start.N.NH4, N_RATES.kNit * f.fT * f.fW * f.fO2),
        "nitrification",
      );
      const den = rate("denitrification", start.N.NO3, N_RATES.kDen * anoxia * f.fT);
      const n2o = flux(carries, "n2o-split", den * N_RATES.n2oShare);
      move("N", "NO3", "n2oOut", n2o, "denitrification");
      move("N", "NO3", "n2Out", den - n2o, "denitrification");
      move("N", "NO3", "drainage", rate("leaching", start.N.NO3, N_RATES.kLeach * settings.rain), "leaching");
      return out;
    },
  };
}

export const mineralN = (l: Ledger): number => l.N.NH4 + l.N.NO3;
