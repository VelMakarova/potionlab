import { useShallow } from 'zustand/react/shallow';
import { assetUrl } from '../../../shared/assets/assetUrl';
import { Modal } from '../../../shared/components/Modal';
import { Picture } from '../../../shared/components/Picture';
import { useImageResource } from '../../../shared/hooks/useImageResource';
import { copy } from '../../../shared/i18n';
import { label } from '../../../shared/i18n/labels';
import {
  selectCanAddIngredient,
  selectFailedImages,
  selectIngredient,
} from '../model/selectors';
import { useLaboratoryStore } from '../model/useLaboratoryStore';
export function IngredientInfoModal({
  id,
  close,
}: {
  id: string;
  close: () => void;
}) {
  const { item, language, selected, canAdd, add, failed } = useLaboratoryStore(
    useShallow((state) => ({
      item: selectIngredient(state, id),
      language: state.language,
      selected: state.selectedIds.includes(id),
      canAdd: selectCanAddIngredient(state, id),
      add: state.addIngredient,
      failed: selectFailedImages(state),
    }))
  );
  const src = item ? assetUrl(item.assets.full) : '';
  const status = useImageResource(src, 480);
  if (!item) return null;
  const t = copy[language];
  return (
    <Modal
      className="pl-floral-frame"
      title={item.name}
      closeLabel={t.close}
      close={close}
    >
      {status === 'loading' ? (
        <p role="status">{t.loading}</p>
      ) : (
        <div className="ingredient-info">
          <Picture
            key={src}
            src={src}
            size={480}
            alt={item.name}
            failed={status === 'failed' ? { ...failed, [src]: true } : failed}
          />
          <p>{item.description}</p>
          <p>
            {t.element}: {label(item.element, language)}
          </p>
          <p>
            {t.properties}:{' '}
            {item.properties
              .map((property) => label(property, language))
              .join(', ')}
          </p>
          <button
            className="pl-button pl-raged"
            disabled={!canAdd}
            onClick={() => add(id)}
          >
            {selected ? t.selected : t.add}
          </button>
        </div>
      )}
    </Modal>
  );
}
