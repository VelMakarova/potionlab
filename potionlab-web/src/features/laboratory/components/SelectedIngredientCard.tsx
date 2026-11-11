import { assetUrl } from '../../../shared/assets/assetUrl';
import { Picture } from '../../../shared/components/Picture';
import { copy } from '../../../shared/i18n';
import type { Language } from '../../../shared/i18n/types';
import type { Ingredient } from '../../../shared/types/ingredient';
import type { FailedImages } from '../model/types';

export function SelectedIngredientCard({
  id,
  item,
  language,
  locked,
  failed,
  remove,
}: {
  id?: string;
  item?: Ingredient;
  language: Language;
  locked: boolean;
  failed: FailedImages;
  remove: (id: string) => void;
}) {
  const t = copy[language];

  return (
    <li
      className={`selected-ingredient-card pl-floral-frame pl-wood-surface ${item ? 'gap-1' : ''}`}
    >
      {item ? (
        <>
          <Picture
            key={item.id}
            src={assetUrl(item.assets.thumb64)}
            size={64}
            alt={item.name}
            failed={failed}
          />
          <span className="text-center">{item.name}</span>
          <button
            className="icon icon-button icon-close"
            aria-label={`${t.remove}: ${item.name}`}
            disabled={locked}
            onClick={() => remove(item.id)}
          />
        </>
      ) : id ? (
        <div className="missing-ingredient-card pl-floral-frame pl-wood-surface">
          <span>{id}</span>
          <button disabled={locked} onClick={() => remove(id)}>
            {t.remove}
          </button>
        </div>
      ) : (
        <div className="icon icon-info" />
      )}
    </li>
  );
}
