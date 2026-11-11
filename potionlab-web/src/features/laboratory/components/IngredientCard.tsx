import { useShallow } from 'zustand/react/shallow';
import { assetUrl } from '../../../shared/assets/assetUrl';
import { Picture } from '../../../shared/components/Picture';
import { copy } from '../../../shared/i18n';
import {
  selectCanAddIngredient,
  selectFailedImages,
  selectIngredient,
} from '../model/selectors';
import { useLaboratoryStore } from '../model/useLaboratoryStore';

export function IngredientCard({
  id,
  openInfo,
}: {
  id: string;
  openInfo: (id: string) => void;
}) {
  const { item, selected, canAdd, language, failed, add } = useLaboratoryStore(
    useShallow((state) => ({
      item: selectIngredient(state, id),
      selected: state.selectedIds.includes(id),
      canAdd: selectCanAddIngredient(state, id),
      language: state.language,
      failed: selectFailedImages(state),
      add: state.addIngredient,
    }))
  );

  if (!item) return null;
  const t = copy[language];

  return (
    <li
      className={`ingredient-card pl-floral-frame pl-wood-surface ${selected ? 'ingredient-card-selected' : ''}`}
    >
      <Picture
        src={assetUrl(item.assets.thumb128)}
        size={128}
        alt={item.name}
        failed={failed}
      />
      <span className="ingredient-name pl-paper-ragged">{item.name}</span>
      <div className="card-actions">
        <button
          className="icon icon-button icon-info"
          aria-label={`${t.info}: ${item.name}`}
          onClick={() => openInfo(id)}
        ></button>
        <button
          aria-label={`${t.add}: ${item.name}`}
          disabled={!canAdd}
          onClick={() => add(id)}
          className={`icon icon-button ${selected ? 'icon-check' : 'icon-add'}`}
        />
      </div>
    </li>
  );
}
