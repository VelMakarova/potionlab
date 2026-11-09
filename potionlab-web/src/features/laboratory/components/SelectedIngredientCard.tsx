import { assetUrl } from "../../../shared/assets/assetUrl";
import { Picture } from "../../../shared/components/Picture";
import { copy } from "../../../shared/i18n";
import type { Language } from "../../../shared/i18n/types";
import type { Ingredient } from "../../../shared/types/ingredient";
import type { FailedImages } from "../model/types";
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
    <li className="selected-card">
      {item ? (
        <>
          <Picture
            key={item.id}
            src={assetUrl(item.assets.thumb64)}
            size={64}
            alt={item.name}
            failed={failed}
          />
          <span>{item.name}</span>
          <button
            aria-label={`${t.remove}: ${item.name}`}
            disabled={locked}
            onClick={() => remove(item.id)}
          >
            {t.remove}
          </button>
        </>
      ) : id ? (
        <>
          <span>{id}</span>
          <button disabled={locked} onClick={() => remove(id)}>
            {t.remove}
          </button>
        </>
      ) : (
        <span>{t.emptySlot}</span>
      )}
    </li>
  );
}
