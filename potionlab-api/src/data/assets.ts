import manifest from "./assets-manifest.json" with { type: "json" };
import type { IngredientAssets } from "@/types/index.js";

export const ingredientAssets = manifest satisfies Record<string, IngredientAssets>;
