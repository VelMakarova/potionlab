import type { Language } from "../i18n/types";
import type { IngredientId } from "../types/ingredient";
import { apiBaseUrl } from "./config";
import { HttpError } from "./errors";
import { parseBrewResult } from "./parsers";

export async function requestBrew(
  ids: IngredientId[],
  language: Language,
  signal: AbortSignal,
) {
  const response = await fetch(`${apiBaseUrl}/brew?lang=${language}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredientIds: ids }),
    signal,
  });

  if (!response.ok) throw new HttpError(response.status);

  return parseBrewResult(await response.json());
}
