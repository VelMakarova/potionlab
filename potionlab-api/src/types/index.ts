export type Element =
  | "fire"
  | "water"
  | "air"
  | "earth"
  | "dark"
  | "light";

export type Property =
  | "heat"
  | "power"
  | "protection"
  | "transformation"
  | "poison"
  | "purification"
  | "concealment"
  | "freezing"
  | "mobility"
  | "lightning"
  | "growth"
  | "preservation"
  | "healing"
  | "divination"
  | "necromancy";

export type IngredientAssets = {
  full: string;
  thumb128: string;
  thumb64: string;
};

export type Ingredient = {
  id: string;
  assets: IngredientAssets;
  name: string;
  description: string;
  element: Element;
  properties: Property[];
};
