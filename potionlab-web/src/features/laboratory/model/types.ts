import type {
  Ingredient,
  IngredientId,
} from '../../../shared/types/ingredient';
import type { Language } from '../../../shared/i18n/types';
import type { BrewResult } from '../../../shared/types/brewing';
export type FailedImages = Readonly<Record<string, true>>;
export type CatalogSnapshot = {
  language: Language;
  ids: IngredientId[];
  byId: Record<IngredientId, Ingredient>;
};
export type CatalogState =
  | { status: 'idle' }
  | { status: 'loading'; previous: CatalogSnapshot | null }
  | { status: 'ready'; data: CatalogSnapshot; failedImageUrls: FailedImages }
  | { status: 'error'; previous: CatalogSnapshot | null; error: 'unavailable' };
export type BrewError =
  | 'rate_limit'
  | 'invalid_selection'
  | 'unavailable'
  | 'timeout'
  | 'invalid_response'
  | 'network';
export type BrewAttempt = {
  ingredientIds: [IngredientId, IngredientId, IngredientId];
  language: Language;
};
export type BrewingState =
  | { phase: 'editing'; error: BrewError | null }
  | { phase: 'brewing'; attempt: BrewAttempt }
  | { phase: 'complete'; attempt: BrewAttempt; result: BrewResult };
export type LaboratoryState = {
  language: Language;
  catalog: CatalogState;
  selectedIds: IngredientId[];
  brewing: BrewingState;
};
export type LaboratoryActions = {
  initialize(): Promise<void>;
  retryCatalog(): Promise<void>;
  changeLanguage(language: Language): Promise<void>;
  addIngredient(id: IngredientId): void;
  removeIngredient(id: IngredientId): void;
  brew(): Promise<void>;
  startNewBrew(): void;
};
export type LaboratoryStore = LaboratoryState & LaboratoryActions;
