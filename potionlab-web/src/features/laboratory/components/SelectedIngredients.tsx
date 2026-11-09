import { useShallow } from "zustand/react/shallow";
import { copy } from "../../../shared/i18n";
import {
  selectEditingAllowed,
  selectFailedImages,
  selectIngredient,
} from "../model/selectors";
import { useLaboratoryStore } from "../model/useLaboratoryStore";
import { SelectedIngredientCard } from "./SelectedIngredientCard";
export function SelectedIngredients() {
  const { ids, language, locked, failed, remove } = useLaboratoryStore(
    useShallow((state) => ({
      ids: state.selectedIds,
      language: state.language,
      locked: !selectEditingAllowed(state),
      failed: selectFailedImages(state),
      remove: state.removeIngredient,
    })),
  );
  const items = useLaboratoryStore(
    useShallow((state) =>
      state.selectedIds.map((id) => selectIngredient(state, id)),
    ),
  );
  return (
    <section className="selection" aria-labelledby="selection-title">
      <h2 id="selection-title">
        {copy[language].selection} ({ids.length}/3)
      </h2>
      <ul className="selected-list">
        {[0, 1, 2].map((index) => (
          <SelectedIngredientCard
            key={index}
            id={ids[index]}
            item={items[index]}
            language={language}
            locked={locked}
            failed={failed}
            remove={remove}
          />
        ))}
      </ul>
    </section>
  );
}
