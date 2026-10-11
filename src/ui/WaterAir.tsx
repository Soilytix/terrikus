/** Reactive figure (p-m1): solids stay put; water and air trade the pore space. */
import { useState } from "react";
import { t } from "../i18n";

export function WaterAir({ onMoved }: { onMoved: (water: number) => void }) {
  const [water, setWater] = useState(25);
  const air = 50 - water;
  const seg = (label: string, pct: number, cls: string) => (
    <div className={`wa-seg ${cls}`} style={{ flexGrow: pct }} aria-hidden="true">
      {pct >= 6 && (
        <span>
          {label} <b className="mono">{pct} %</b>
        </span>
      )}
    </div>
  );
  return (
    <div className="water-air">
      <div className="wa-bar">
        {seg(t("Solids"), 50, "wa-solid")}
        {seg(t("Water"), water, "wa-water")}
        {seg(t("Air"), air, "wa-air")}
      </div>
      <label className="slider-row">
        <span>{t("Water share of the volume")}</span>
        <input
          type="range"
          min={0}
          max={50}
          value={water}
          aria-valuetext={t("Water {water} %, air {air} %, solids 50 %", { water, air })}
          onChange={(e) => {
            setWater(Number(e.target.value));
            onMoved(Number(e.target.value));
          }}
        />
        <output className="mono">{water} %</output>
      </label>
      <p className="muted small">
        {water >= 45
          ? t("Almost no air left: the pores are flooded.")
          : water <= 5
            ? t("Bone dry: the pores are all air.")
            : t("Every percent of water you add is a percent of air gone.")}
      </p>
    </div>
  );
}
