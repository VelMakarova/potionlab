import { copy } from '../../../shared/i18n';
import { useLaboratoryStore } from '../model/useLaboratoryStore';
export function AppHeader({ openSettings }: { openSettings?: () => void }) {
  const language = useLaboratoryStore((state) => state.language);
  return (
    <header className="lab-header">
      <div className="shop-sign pl-sign-background">
        <h1 className="shop-sign-title">PotionLab</h1>
      </div>
      {openSettings && (
        <button
          className="paper-button settings-button pl-paper-ragged"
          onClick={openSettings}
        >
          <div className="icon icon-settings"></div>
          {copy[language].settings}
        </button>
      )}
    </header>
  );
}
