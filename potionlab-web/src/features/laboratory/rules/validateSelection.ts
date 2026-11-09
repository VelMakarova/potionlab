import type {
  Ingredient,
  IngredientId,
} from "../../../shared/types/ingredient";
export function validateSelection(
  ids: IngredientId[],
  byId: Record<IngredientId, Ingredient>,
): [Ingredient, Ingredient, Ingredient] | null {
  if (ids.length !== 3 || new Set(ids).size !== 3) return null;
  const [first, second, third] = ids.map((id) => byId[id]);
  return first && second && third ? [first, second, third] : null;
}
