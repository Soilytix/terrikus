/**
 * Leaf-in-a-jar ruleset (spec §6.4). Pools: L litter, D dissolved C,
 * B microbial biomass, M mineral-associated C, co2Out. Rates are teaching
 * values: they get direction right, not numbers.
 */
import { emptyLedger, transfer, type Ledger, type PoolOf, type Transfer } from "../ledger";
import type { BenchModel } from "../engine";
import type { BenchDef } from ".";
import { fO2, fT, fW, RESIDUE, TEMPERATURE, WATER } from "../modifiers";

export interface LeverSettings {
  water: keyof typeof WATER;
  temperature: keyof typeof TEMPERATURE;
  residue: keyof typeof RESIDUE;
}

/** Registry entry (benches/index.ts): the levers a content step may set. */
export const LEAF_JAR: BenchDef = {
  levers: { water: Object.keys(WATER), temperature: Object.keys(TEMPERATURE), residue: Object.keys(RESIDUE) },
};

export const DEFAULT_LEVERS: LeverSettings = { water: "moist", temperature: "mild", residue: "leaf" };
export const INITIAL_LITTER = 10_000;
export const DAYS = 365;
export const RULESET_VERSION = "leaf-jar@1";

/** Per-day teaching rates. */
export const RATES = {
  kL: 0.005, // depolymerisation of litter
  kU: 0.25, // uptake of dissolved C
  kM: 0.004, // maintenance respiration of biomass
  kD: 0.01, // death of biomass
  phi: 0.25, // share of necromass that lands on mineral surfaces
  kMD: 0.0003, // desorption from minerals (very slow)
} as const;

export type Carries = Record<string, number>;

/** Integer flux with a deterministic rounding carry, so tiny rates never stall. */
function flux(carries: Carries, rule: string, pool: number, rate: number): number {
  const raw = pool * rate + (carries[rule] ?? 0);
  const whole = Math.min(pool, Math.floor(raw));
  carries[rule] = raw - whole;
  return whole;
}

/** Integer share of an integer flux, with its own carry: partitions stay exact and unbiased. */
function share(carries: Carries, key: string, amount: number, fraction: number): number {
  const raw = amount * fraction + (carries[key] ?? 0);
  const whole = Math.min(amount, Math.floor(raw));
  carries[key] = raw - whole;
  return whole;
}

export interface Factors {
  fT: number;
  fW: number;
  fO2: number;
  quality: number;
  cue: number;
}

export function factors(levers: LeverSettings): Factors {
  const wfps = WATER[levers.water].wfps;
  return {
    fT: fT(TEMPERATURE[levers.temperature].celsius),
    fW: fW(wfps),
    fO2: fO2(wfps),
    quality: RESIDUE[levers.residue].quality,
    cue: RESIDUE[levers.residue].cue,
  };
}

export function leafJar(levers: LeverSettings): BenchModel<Carries> {
  const f = factors(levers);
  return {
    initial(): Ledger {
      const l = emptyLedger();
      l.C.L = INITIAL_LITTER;
      return l;
    },
    initialState: () => ({}),
    energy(l) {
      // One energy unit per organic C unit: organic matter holds it, CO₂ released it as heat.
      return { organic: l.C.L + l.C.D + l.C.B + l.C.M, heat: l.C.co2Out };
    },
    step(l, carries) {
      const out: Transfer[] = [];
      const move = (from: PoolOf<"C">, to: PoolOf<"C">, amount: number, rule: string) => {
        const moved = transfer(l, "C", from, to, amount);
        if (moved > 0) out.push({ element: "C", from, to, amount: moved, rule });
      };
      // Rates read the pools at the start of the tick (explicit Euler).
      const { L, D, B, M } = l.C;
      const depoly = flux(carries, "depolymerisation", L, RATES.kL * f.fT * f.fW * f.fO2 * f.quality);
      const uptake = flux(carries, "uptake-cue", D, RATES.kU * f.fW);
      const maint = flux(carries, "maintenance-resp", B, RATES.kM * f.fT);
      const death = flux(carries, "necromass-formation", B, RATES.kD);
      const desorb = flux(carries, "maom-desorption", M, RATES.kMD);

      move("L", "D", depoly, "depolymerisation");
      // Integer partition by carbon-use efficiency: conservation is exact.
      const toBiomass = share(carries, "cue-split", uptake, f.cue);
      move("D", "B", toBiomass, "uptake-cue");
      move("D", "co2Out", uptake - toBiomass, "uptake-cue");
      move("B", "co2Out", maint, "maintenance-resp");
      const toMineral = share(carries, "phi-split", death, RATES.phi);
      move("B", "M", toMineral, "necromass-formation");
      move("B", "D", death - toMineral, "necromass-formation");
      move("M", "D", desorb, "maom-desorption");
      return out;
    },
  };
}
