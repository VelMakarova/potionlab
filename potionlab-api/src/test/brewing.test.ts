import assert from 'node:assert/strict';
import { test } from '@jest/globals';
import {
  BrewInputError,
  evaluateBrew,
  type BrewingIngredient,
} from '../domain/brewing.js';
import type { Element, Property } from '../types/index.js';
import { ingredients as english } from '../data/eng.js';
import { ingredients as ukrainian } from '../data/ukr.js';

function selection(
  properties: readonly (readonly Property[])[] = [[], [], []],
  elements: readonly Element[] = ['fire', 'water', 'earth']
): BrewingIngredient[] {
  return elements.map((element, index) => ({
    id: `ingredient-${index}`,
    element,
    properties: properties[index] ?? [],
  }));
}

const elementCases: [Element[], string][] = [
  [['fire', 'fire', 'fire'], 'no_magic'],
  [['fire', 'fire', 'water'], 'explosion'],
  [['fire', 'water', 'water'], 'explosion'],
  [['earth', 'air', 'earth'], 'cracked'],
  [['light', 'dark', 'dark'], 'runaway'],
  [['fire', 'fire', 'earth'], 'ready_for_generation'],
  [['fire', 'water', 'earth'], 'ready_for_generation'],
  [['air', 'earth', 'dark'], 'ready_for_generation'],
  [['light', 'dark', 'water'], 'ready_for_generation'],
];

for (const [elements, status] of elementCases) {
  test(`elements ${elements.join(',')} yield ${status} in every ordering`, () => {
    const items = selection([['healing'], [], []], elements);
    const expected =
      status === 'ready_for_generation'
        ? { status, properties: { healing: 1 } }
        : { status };
    for (const order of [
      [0, 1, 2],
      [0, 2, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 0, 1],
      [2, 1, 0],
    ]) {
      assert.deepEqual(
        evaluateBrew(order.map((index) => items[index])),
        expected
      );
    }
  });
}

test('wrong counts and duplicate IDs are input errors, not gameplay outcomes', () => {
  const items = selection();
  for (const count of [0, 1, 2, 4]) {
    const input = Array.from({ length: count }, (_, index) => ({
      ...items[0],
      id: `${index}`,
    }));
    assert.throws(
      () => evaluateBrew(input),
      (error: unknown) =>
        error instanceof BrewInputError &&
        error.code === 'INVALID_INGREDIENT_COUNT'
    );
  }
  const duplicates = selection([[], [], []], ['fire', 'fire', 'fire']);
  duplicates[1] = { ...duplicates[1], id: duplicates[0].id };
  assert.throws(
    () => evaluateBrew(duplicates),
    (error: unknown) =>
      error instanceof BrewInputError &&
      error.code === 'DUPLICATE_INGREDIENT_ID'
  );
});

test('element failures return before reading properties', () => {
  for (const [elements, status] of elementCases.filter(
    ([, status]) => status !== 'ready_for_generation'
  )) {
    const items = elements.map((element, index) => ({
      id: `${index}`,
      element,
      get properties(): Property[] {
        throw new Error('Properties must not be evaluated');
      },
    }));
    assert.deepEqual(evaluateBrew(items), { status });
  }
});

const propertyCases: [
  string,
  Property[][],
  Partial<Record<Property, number>>,
][] = [
  [
    'counts occurrences across ingredients',
    [['healing'], ['healing'], ['healing']],
    { healing: 3 },
  ],
  ['equal heat and freezing cancel', [['heat'], ['freezing'], []], {}],
  ['excess heat survives', [['heat'], ['heat'], ['freezing']], { heat: 1 }],
  [
    'excess freezing survives',
    [['heat', 'freezing'], ['freezing'], ['freezing']],
    { freezing: 2 },
  ],
  [
    'both annihilation pairs can empty the brew',
    [['heat', 'transformation'], ['freezing'], ['preservation']],
    {},
  ],
  [
    'excess transformation survives',
    [['transformation'], ['transformation'], ['preservation']],
    { transformation: 1 },
  ],
  [
    'excess preservation survives',
    [['preservation'], ['preservation'], ['transformation']],
    { preservation: 1 },
  ],
  [
    'annihilated sources do not modify',
    [['heat'], ['freezing'], ['lightning']],
    { lightning: 1 },
  ],
  [
    'annihilated targets cannot be recreated',
    [['transformation'], ['preservation'], ['protection']],
    { protection: 1 },
  ],
  [
    'surviving sources still modify',
    [['heat'], ['heat', 'freezing'], ['lightning']],
    { heat: 1, lightning: 2 },
  ],
  [
    'two amplifications and one weakening add up',
    [['poison', 'concealment'], ['divination'], ['mobility']],
    { poison: 1, divination: 1, mobility: 1, concealment: 2 },
  ],
  [
    'weakening removes strength one',
    [['power'], ['concealment'], []],
    { power: 1 },
  ],
  [
    'weakening preserves excess strength',
    [['power'], ['concealment'], ['concealment']],
    { power: 1, concealment: 1 },
  ],
  [
    'strong sources modify only once',
    [['power'], ['power'], ['power', 'protection']],
    { power: 3, protection: 2 },
  ],
  [
    'mutual amplification has no recursion',
    [['preservation'], ['protection'], []],
    { preservation: 2, protection: 2 },
  ],
  // The spec's empty-result example is an arithmetic typo: growth has no incoming weakening.
  [
    'removed sources still act in the same pass',
    [['growth'], ['mobility'], ['concealment']],
    { growth: 1 },
  ],
  [
    'overlapping modifiers use the pre-modifier snapshot',
    [['healing', 'growth'], ['mobility'], ['concealment']],
    { healing: 1, growth: 2 },
  ],
  [
    'no reverse modifier is invented',
    [['growth'], ['healing'], []],
    { growth: 2, healing: 1 },
  ],
  [
    'multiple weakenings remove negative strengths',
    [['mobility'], ['power'], ['transformation', 'concealment']],
    { mobility: 1, power: 1, transformation: 1 },
  ],
];

for (const [name, properties, expected] of propertyCases) {
  test(name, () => {
    assert.deepEqual(
      evaluateBrew(selection(properties)),
      Object.keys(expected).length
        ? { status: 'ready_for_generation', properties: expected }
        : { status: 'useless' }
    );
  });
}

const modifierCases: [Property, Property, number][] = [
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

for (const [source, target, delta] of modifierCases) {
  test(`modifier ${source} → ${target}: ${delta}`, () => {
    const result = evaluateBrew(selection([[source], [target], []]));
    assert.equal(result.status, 'ready_for_generation');
    if (result.status !== 'ready_for_generation')
      assert.fail('Expected generation input');
    assert.equal(result.properties[target], delta > 0 ? 2 : undefined);
  });
}

test('input ingredients and their properties remain unchanged', () => {
  const items = selection([['heat', 'power'], ['freezing'], ['protection']]);
  const before = items.map((item) => ({
    ...item,
    properties: [...item.properties],
  }));
  for (const item of items) {
    Object.freeze(item.properties);
    Object.freeze(item);
  }
  Object.freeze(items);
  const first = evaluateBrew(items);
  assert.deepEqual(evaluateBrew(items), first);
  assert.deepEqual(items, before);
});

test('all real-catalog combinations are order-independent, language-independent and positive', () => {
  const translated = new Map(ukrainian.map((item) => [item.id, item]));
  for (let a = 0; a < english.length - 2; a++) {
    for (let b = a + 1; b < english.length - 1; b++) {
      for (let c = b + 1; c < english.length; c++) {
        const items = [english[a], english[b], english[c]];
        const result = evaluateBrew(items);
        assert.deepEqual(evaluateBrew([...items].reverse()), result);
        const localized = items.map((item) => {
          const translation = translated.get(item.id);
          assert.ok(translation);
          return translation;
        });
        assert.deepEqual(evaluateBrew(localized), result);
        if (result.status === 'ready_for_generation') {
          assert.ok(Object.keys(result.properties).length > 0);
          assert.ok(
            Object.values(result.properties).every(
              (strength) => Number.isInteger(strength) && strength >= 1
            )
          );
        }
      }
    }
  }
});
