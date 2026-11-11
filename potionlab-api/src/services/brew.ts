import {
  evaluateBrew,
  type BrewingIngredient,
  type PropertyStrengths,
  type RuleEngineResult,
} from '../domain/brewing.js';
import type { Language } from '../hooks/language.js';
import { getIngredientById } from './ingredients.js';

export type BrewResult =
  | Exclude<RuleEngineResult, { status: 'ready_for_generation' }>
  | { status: 'brewed'; properties: PropertyStrengths; description: string };

interface GenerationInput {
  ingredients: readonly BrewingIngredient[];
  properties: Readonly<PropertyStrengths>;
  language: Language;
}

interface BrewDependencies {
  findIngredient: (
    id: string,
    language: Language
  ) => BrewingIngredient | undefined;
  generateDescription: (input: GenerationInput) => Promise<string>;
}

export class UnknownIngredientError extends Error {
  readonly code = 'UNKNOWN_INGREDIENT_ID';

  constructor(public readonly ingredientId: string) {
    super(`Unknown ingredient ID: ${ingredientId}`);
    this.name = 'UnknownIngredientError';
  }
}

// TODO: Replace this stub with AI generation. It makes no network requests.
async function mockGenerateDescription({
  language,
}: GenerationInput): Promise<string> {
  return language === 'ua'
    ? 'Тут буде текст від ШІ'
    : 'AI-generated text will appear here';
}

export async function brewPotion(
  ingredientIds: readonly string[],
  language: Language = 'en',
  dependencies: Partial<BrewDependencies> = {}
): Promise<BrewResult> {
  const findIngredient = dependencies.findIngredient ?? getIngredientById;
  const ingredients = ingredientIds.map((id) => {
    const ingredient = findIngredient(id, language);
    if (!ingredient) throw new UnknownIngredientError(id);
    return ingredient;
  });

  const result = evaluateBrew(ingredients);
  if (result.status !== 'ready_for_generation') return result;

  const generateDescription =
    dependencies.generateDescription ?? mockGenerateDescription;
  const description = await generateDescription({
    ingredients,
    // The service retains its canonical calculation even if a generator changes its input.
    properties: { ...result.properties },
    language,
  });

  return { status: 'brewed', properties: result.properties, description };
}
