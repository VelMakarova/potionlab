import { requestBrew } from "../../../shared/api/brewingApi";
import { HttpError, InvalidResponseError } from "../../../shared/api/errors";
import type { Ingredient } from "../../../shared/types/ingredient";
import type { BrewResult } from "../../../shared/types/brewing";
import type { BrewAttempt, BrewError } from "../model/types";
import { evaluateElements } from "../rules/evaluateElements";
export async function brewPotion(
  attempt: BrewAttempt,
  items: Ingredient[],
  signal: AbortSignal,
): Promise<BrewResult> {
  const outcome = evaluateElements(items);
  return outcome === "compatible"
    ? requestBrew(attempt.ingredientIds, attempt.language, signal)
    : { status: outcome };
}
export function classifyBrewError(
  error: unknown,
  timedOut: boolean,
): BrewError {
  if (timedOut) return "timeout";
  if (error instanceof InvalidResponseError || error instanceof SyntaxError)
    return "invalid_response";
  if (error instanceof HttpError) {
    if (error.status === 429) return "rate_limit";
    if (error.status === 400) return "invalid_selection";
    if (error.status >= 500) return "unavailable";
  }
  return "network";
}
