export const elements = [
  "fire",
  "water",
  "air",
  "earth",
  "light",
  "dark",
] as const;
export type Element = (typeof elements)[number];
export type IngredientId = string;
export type Ingredient = {
  id: string;
  name: string;
  description: string;
  element: Element;
  properties: string[];
  assets: { full: string; thumb128: string; thumb64: string };
};
