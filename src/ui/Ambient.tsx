/** Living-backdrop toggle (OD-8 interim: ambient motion behind a setting; reduced motion still freezes it). */
import { useGame } from "../app/store";
import { t } from "../i18n";

export function AmbientToggle() {
  const ambient = useGame((g) => g.save.settings.ambient);
  const update = useGame((g) => g.update);
  return (
    <label className="setting">
      <span className="setting-text">
        <b>{t("Gentle background motion")}</b>
        <small>{t("Clouds, water and birds drift; the scene’s music plays with it.")}</small>
      </span>
      <input
        type="checkbox"
        className="switch"
        checked={ambient}
        onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, ambient: e.target.checked } }))}
      />
    </label>
  );
}
