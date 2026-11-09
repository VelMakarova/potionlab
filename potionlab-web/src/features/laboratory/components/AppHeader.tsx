import { copy } from "../../../shared/i18n";
import { useLaboratoryStore } from "../model/useLaboratoryStore";
export function AppHeader({ openSettings }: { openSettings: () => void }) {
  const language = useLaboratoryStore((state) => state.language);
  return (
    <header className="app-header">
      <h1>PotionLab</h1>
      <button onClick={openSettings}>{copy[language].settings}</button>
    </header>
  );
}
