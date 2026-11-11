import { useShallow } from 'zustand/react/shallow';
import { Modal } from '../../../shared/components/Modal';
import { copy } from '../../../shared/i18n';
import type { Language } from '../../../shared/i18n/types';
import { selectEditingAllowed } from '../model/selectors';
import { useLaboratoryStore } from '../model/useLaboratoryStore';

export function SettingsModal({
  close,
  languageChanged,
}: {
  close: () => void;
  languageChanged: () => void;
}) {
  const { language, editable, changeLanguage } = useLaboratoryStore(
    useShallow((state) => ({
      language: state.language,
      editable: selectEditingAllowed(state),
      changeLanguage: state.changeLanguage,
    }))
  );
  const t = copy[language];

  function change(value: Language) {
    if (!editable) return;
    languageChanged();
    void changeLanguage(value);
  }

  return (
    <Modal
      title={t.settings}
      closeLabel={t.close}
      close={close}
      className={'pl-floral-frame'}
    >
      <label className="flex flex-wrap items-center gap-3">
        {t.language}{' '}
        <select
          className="paper-select pl-paper-ragged"
          disabled={!editable}
          value={language}
          onChange={(event) => change(event.target.value as Language)}
        >
          <option value="ua">Українська</option>
          <option value="en">English</option>
        </select>
      </label>
      {!editable && <p>{t.locked}</p>}
    </Modal>
  );
}
