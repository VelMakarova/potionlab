import type { Language } from '../i18n/types';
import { apiBaseUrl } from './config';
import { HttpError } from './errors';
import { parseIngredients } from './parsers';
export async function loadIngredients(language: Language, signal: AbortSignal) {
  const response = await fetch(`${apiBaseUrl}/ingredients?lang=${language}`, {
    signal,
  });

  if (!response.ok) throw new HttpError(response.status);

  return parseIngredients(await response.json());
}
