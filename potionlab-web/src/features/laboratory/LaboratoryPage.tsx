import { useState } from 'react';
import { useLaboratoryStore } from './model/useLaboratoryStore';
import { selectCatalogReady } from './model/selectors';
import { LaboratoryLayout } from './LaboratoryLayout';
import { AppHeader } from './components/AppHeader';
import { StartupScreen } from './components/StartupScreen';
import { IngredientCatalog } from './components/IngredientCatalog';
import { IngredientInfoModal } from './components/IngredientInfoModal';
import { BrewingWorkspace } from './components/BrewingWorkspace';
import { SettingsModal } from './components/SettingsModal';

export function LaboratoryPage() {
  const [infoId, setInfoId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const language = useLaboratoryStore((state) => state.language);
  const ready = useLaboratoryStore(selectCatalogReady);

  return (
    <main className="app-shell pl-frame" lang={language === 'ua' ? 'uk' : 'en'}>
      <AppHeader openSettings={() => setSettingsOpen(true)} />

      {ready ? (
        <LaboratoryLayout
          catalog={<IngredientCatalog openInfo={setInfoId} />}
          workspace={<BrewingWorkspace newCycle={() => setInfoId(null)} />}
        />
      ) : (
        <StartupScreen />
      )}

      {settingsOpen && (
        <SettingsModal
          close={() => setSettingsOpen(false)}
          languageChanged={() => setInfoId(null)}
        />
      )}

      {ready && infoId && (
        <IngredientInfoModal
          key={`${infoId}-${language}`}
          id={infoId}
          close={() => setInfoId(null)}
        />
      )}
    </main>
  );
}
