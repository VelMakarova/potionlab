import { ingredients as englishIngredients } from '@/data/eng.js';
import { ingredients as ukrainianIngredients } from '@/data/ukr.js';
import type { Language } from '@/hooks/language.js';
import type { Element } from '@/types/index.js';

const ingredientsByLanguage = {
  en: englishIngredients,
  ua: ukrainianIngredients,
};

export function getIngredients(language: Language) {
  return ingredientsByLanguage[language];
}

export function getIngredientById(id: string, language: Language) {
  return getIngredients(language).find((ingredient) => ingredient.id === id);
}

export function getIngredientsByElement(element: Element, language: Language) {
  return getIngredients(language).filter(
    (ingredient) => ingredient.element === element
  );
}
