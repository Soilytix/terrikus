/** Living-backdrop toggle (OD-8 interim: ambient motion behind a setting; reduced motion still freezes it). */
import { useGame } from "../app/store";

export function AmbientToggle() {
  const ambient = useGame((g) => g.save.settings.ambient);
  const update = useGame((g) => g.update);
  return (
    <label className="ambient-toggle">
      <input
        type="checkbox"
        checked={ambient}
        onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, ambient: e.target.checked } }))}
      />
      <span>Gentle background motion</span>
    </label>
  );
}
