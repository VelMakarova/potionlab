import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { elements, type Element } from '../../../shared/types/ingredient';
import { copy } from '../../../shared/i18n';
import { label } from '../../../shared/i18n/labels';
import { selectVisibleIngredientIds } from '../model/selectors';
import { useLaboratoryStore } from '../model/useLaboratoryStore';
import { IngredientCard } from './IngredientCard';
export function IngredientCatalog({
  openInfo,
}: {
  openInfo: (id: string) => void;
}) {
  const [filter, setFilter] = useState<Element | 'all'>('all');
  const language = useLaboratoryStore((state) => state.language);
  const ids = useLaboratoryStore(
    useShallow((state) => selectVisibleIngredientIds(state, filter))
  );
  const t = copy[language];
  return (
    <section
      className="catalog pl-frame pl-panel-background"
      aria-labelledby="catalog-title"
    >
      <div className="flex justify-between">
        <h2 id="catalog-title">{t.ingredients}</h2>
        <select
          aria-label={t.filterElement}
          name={'elements-select'}
          className="paper-select pl-paper-ragged"
          value={filter}
          onChange={(event) => setFilter(event.target.value as Element | 'all')}
        >
          <option value="all">{t.all}</option>
          {elements.map((element) => (
            <option key={element} value={element}>
              {label(element, language)}
            </option>
          ))}
        </select>
      </div>
      <ul className="ingredient-grid">
        {ids.map((id) => (
          <IngredientCard key={id} id={id} openInfo={openInfo} />
        ))}
      </ul>
    </section>
  );
}
