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
    <li className={`pl-card ${item ? 'selected-card-gap' : 'selected-card'}`}>
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
            className="pl-icon pl-close"
            aria-label={`${t.remove}: ${item.name}`}
            disabled={locked}
            onClick={() => remove(item.id)}
          />
        </>
      ) : id ? (
        <div className={'pl-card'}>
          <span>{id}</span>
          <button disabled={locked} onClick={() => remove(id)}>
            {t.remove}
          </button>
        </div>
      ) : (
        <div className="pl-icon pl-info" />
      )}
    </li>
  );
}
