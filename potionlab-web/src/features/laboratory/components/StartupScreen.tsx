import { copy } from '../../../shared/i18n';
import { useLaboratoryStore } from '../model/useLaboratoryStore';
export function StartupScreen() {
  const language = useLaboratoryStore((state) => state.language);
  const failed = useLaboratoryStore(
    (state) => state.catalog.status === 'error'
  );
  const retry = useLaboratoryStore((state) => state.retryCatalog);
  const t = copy[language];
  return (
    <section className="startup pl-frame" aria-label={t.ingredients}>
      {failed ? (
        <div role="alert">
          <p>{t.catalogError}</p>
          <button onClick={() => void retry()}>{t.retry}</button>
        </div>
      ) : (
        <p role="status">{t.loading}</p>
      )}
    </section>
  );
}
