import { copy } from '../../../shared/i18n';
import { useLaboratoryStore } from '../model/useLaboratoryStore';
export function AppHeader({ openSettings }: { openSettings: () => void }) {
  const language = useLaboratoryStore((state) => state.language);
  return (
    <header className="pl-header">
      <div className="pl-sign">
        <h1 className="pl-sign__title">PotionLab</h1>
      </div>
      <button
        className="pl-button pl-button--settings pl-raged"
        onClick={openSettings}
      >
        <div className="pl-settings-gear"></div>
        {copy[language].settings}
      </button>
    </header>
  );
}
