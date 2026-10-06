/** Reactive figure (p-m1): solids stay put; water and air trade the pore space. */
import { useState } from "react";

export function WaterAir({ onMoved }: { onMoved: () => void }) {
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
        {seg("Solids", 50, "wa-solid")}
        {seg("Water", water, "wa-water")}
        {seg("Air", air, "wa-air")}
      </div>
      <label className="slider-row">
        <span>Water share of the volume</span>
        <input
          type="range"
          min={0}
          max={50}
          value={water}
          aria-valuetext={`Water ${water} %, air ${air} %, solids 50 %`}
          onChange={(e) => {
            setWater(Number(e.target.value));
            onMoved();
          }}
        />
        <output className="mono">{water} %</output>
      </label>
      <p className="muted small">
        {water >= 45
          ? "Almost no air left: the pores are flooded."
          : water <= 5
            ? "Bone dry: the pores are all air."
            : `Every percent of water you add is a percent of air gone.`}
      </p>
    </div>
  );
}
