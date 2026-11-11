import type { Element, Ingredient, Property } from '../types/index.js';

// Catalog lookup and HTTP validation belong to the caller. The rules need no localized text or assets.
export type BrewingIngredient = Readonly<Pick<Ingredient, 'id' | 'element'>> & {
  readonly properties: readonly Property[];
};

export type PropertyStrengths = Partial<Record<Property, number>>;

export type ElementOutcome =
  'compatible' | 'no_magic' | 'explosion' | 'cracked' | 'runaway';

export type RuleEngineResult =
  | { status: Exclude<ElementOutcome, 'compatible'> }
  | { status: 'useless' }
  | { status: 'ready_for_generation'; properties: PropertyStrengths };

export class BrewInputError extends Error {
  constructor(
    public readonly code: 'INVALID_INGREDIENT_COUNT' | 'DUPLICATE_INGREDIENT_ID'
  ) {
    super(
      code === 'INVALID_INGREDIENT_COUNT'
        ? 'A brew requires exactly three ingredients.'
        : 'A brew requires three distinct ingredient IDs.'
    );
    this.name = 'BrewInputError';
  }
}

const elementConflicts: ReadonlyArray<
  readonly [Element, Element, 'explosion' | 'cracked' | 'runaway']
> = [
  ['fire', 'water', 'explosion'],
  ['earth', 'air', 'cracked'],
  ['light', 'dark', 'runaway'],
];

const annihilationPairs: ReadonlyArray<readonly [Property, Property]> = [
  ['heat', 'freezing'],
  ['transformation', 'preservation'],
];

const modifiers: ReadonlyArray<readonly [Property, Property, 1 | -1]> = [
  ['healing', 'growth', 1],
  ['necromancy', 'healing', 1],
  ['freezing', 'protection', 1],
  ['poison', 'purification', 1],
  ['poison', 'concealment', 1],
  ['power', 'protection', 1],
  ['divination', 'concealment', 1],
  ['preservation', 'protection', 1],
  ['protection', 'preservation', 1],
  ['freezing', 'lightning', 1],
  ['heat', 'lightning', 1],
  ['mobility', 'concealment', -1],
  ['power', 'concealment', -1],
  ['growth', 'mobility', -1],
  ['transformation', 'concealment', -1],
];

function evaluateElements(
  ingredients: readonly BrewingIngredient[]
): ElementOutcome {
  const elements = new Set(ingredients.map((ingredient) => ingredient.element));
  if (elements.size === 1) return 'no_magic';

  // Opposing pairs are relevant only when exactly two distinct elements are present.
  if (elements.size === 2) {
    for (const [first, second, outcome] of elementConflicts) {
      if (elements.has(first) && elements.has(second)) return outcome;
    }
  }

  return 'compatible';
}

function calculateProperties(
  ingredients: readonly BrewingIngredient[]
): PropertyStrengths {
  const strengths = new Map<Property, number>();
  for (const ingredient of ingredients) {
    for (const property of ingredient.properties) {
      strengths.set(property, (strengths.get(property) ?? 0) + 1);
    }
  }

  for (const [first, second] of annihilationPairs) {
    const cancel = Math.min(
      strengths.get(first) ?? 0,
      strengths.get(second) ?? 0
    );
    if (cancel === 0) continue;
    for (const property of [first, second]) {
      const remaining = (strengths.get(property) ?? 0) - cancel;
      if (remaining > 0) strengths.set(property, remaining);
      else strengths.delete(property);
    }
  }

  // Keep the post-annihilation snapshot unchanged while collecting all deltas.
  // A source removed by this pass still triggers its outgoing modifier once.
  const snapshot: ReadonlyMap<Property, number> = strengths;
  const deltas = new Map<Property, number>();
  for (const [source, target, delta] of modifiers) {
    if (snapshot.has(source) && snapshot.has(target)) {
      deltas.set(target, (deltas.get(target) ?? 0) + delta);
    }
  }

  const result: PropertyStrengths = {};
  for (const [property, strength] of snapshot) {
    const finalStrength = strength + (deltas.get(property) ?? 0);
    if (finalStrength > 0) result[property] = finalStrength;
  }
  return result;
}

/** Evaluate three resolved catalog ingredients without I/O or input mutation. */
export function evaluateBrew(
  ingredients: readonly BrewingIngredient[]
): RuleEngineResult {
  if (ingredients.length !== 3)
    throw new BrewInputError('INVALID_INGREDIENT_COUNT');
  if (new Set(ingredients.map((ingredient) => ingredient.id)).size !== 3) {
    throw new BrewInputError('DUPLICATE_INGREDIENT_ID');
  }

  const outcome = evaluateElements(ingredients);
  if (outcome !== 'compatible') return { status: outcome };

  const properties = calculateProperties(ingredients);
  return Object.keys(properties).length === 0
    ? { status: 'useless' }
    : { status: 'ready_for_generation', properties };
}
