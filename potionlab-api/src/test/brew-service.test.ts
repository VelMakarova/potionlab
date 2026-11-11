import assert from 'node:assert/strict';
import { test, jest } from '@jest/globals';
import {
  BrewInputError,
  evaluateBrew,
  type BrewingIngredient,
} from '../domain/brewing.js';
import { brewPotion, UnknownIngredientError } from '../services/brew.js';
import { getIngredientById } from '../services/ingredients.js';

const compatibleIds = ['dragon-scale', 'moonwell-dew', 'mandrake-root'];

test('default generator is a localized mock and never calls fetch', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => {
    throw new Error('Unexpected AI call');
  });
  try {
    const result = await brewPotion(compatibleIds, 'ua');
    assert.equal(result.status, 'brewed');
    if (result.status !== 'brewed') assert.fail('Expected a brewed potion');
    assert.equal(result.description, 'Тут буде текст від ШІ');
    const ingredients = compatibleIds.map((id) => {
      const item = getIngredientById(id, 'ua');
      assert.ok(item);
      return item;
    });
    const rules = evaluateBrew(ingredients);
    assert.equal(rules.status, 'ready_for_generation');
    if (rules.status !== 'ready_for_generation')
      assert.fail('Expected generation input');
    assert.deepEqual(result.properties, rules.properties);
    assert.equal(fetch.mock.calls.length, 0);
  } finally {
    fetch.mockRestore();
  }
});

test('generation receives resolved ingredients, language and final canonical strengths once', async () => {
  let calls = 0;
  const result = await brewPotion(compatibleIds, 'en', {
    generateDescription: async ({ ingredients, properties, language }) => {
      calls++;
      assert.deepEqual(
        ingredients.map((item) => item.id),
        compatibleIds
      );
      assert.equal(language, 'en');
      assert.ok(Object.values(properties).every((value) => value > 0));
      return 'Mock potion description';
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.status, 'brewed');
  if (result.status !== 'brewed') assert.fail('Expected a brewed potion');
  assert.equal(result.description, 'Mock potion description');
});

test('gameplay failures and useless brews skip generation', async () => {
  const generateDescription = async () => {
    assert.fail('Generation must be skipped');
  };
  const cases: [BrewingIngredient[], string][] = [
    [
      [
        { id: 'a', element: 'fire', properties: ['heat'] },
        { id: 'b', element: 'water', properties: ['freezing'] },
        { id: 'c', element: 'earth', properties: [] },
      ],
      'useless',
    ],
    [
      [
        { id: 'a', element: 'fire', properties: [] },
        { id: 'b', element: 'fire', properties: [] },
        { id: 'c', element: 'fire', properties: [] },
      ],
      'no_magic',
    ],
    [
      [
        { id: 'a', element: 'fire', properties: [] },
        { id: 'b', element: 'fire', properties: [] },
        { id: 'c', element: 'water', properties: [] },
      ],
      'explosion',
    ],
    [
      [
        { id: 'a', element: 'earth', properties: [] },
        { id: 'b', element: 'air', properties: [] },
        { id: 'c', element: 'earth', properties: [] },
      ],
      'cracked',
    ],
    [
      [
        { id: 'a', element: 'light', properties: [] },
        { id: 'b', element: 'dark', properties: [] },
        { id: 'c', element: 'dark', properties: [] },
      ],
      'runaway',
    ],
  ];
  for (const [catalog, status] of cases) {
    assert.deepEqual(
      await brewPotion(['a', 'b', 'c'], 'en', {
        findIngredient: (id) => catalog.find((item) => item.id === id),
        generateDescription,
      }),
      { status }
    );
  }
});

test('unknown, repeated and wrong-count selections fail before generation', async () => {
  const dependencies = {
    generateDescription: async () => {
      assert.fail('Generation must be skipped');
    },
  };
  await assert.rejects(
    () =>
      brewPotion(['missing', ...compatibleIds.slice(1)], 'en', dependencies),
    UnknownIngredientError
  );
  await assert.rejects(
    () =>
      brewPotion(
        ['dragon-scale', 'dragon-scale', 'ember-root'],
        'en',
        dependencies
      ),
    BrewInputError
  );
  await assert.rejects(
    () => brewPotion(compatibleIds.slice(0, 2), 'en', dependencies),
    BrewInputError
  );
});

test('generation errors remain technical failures', async () => {
  const error = new Error('Generator failed');
  await assert.rejects(
    () =>
      brewPotion(compatibleIds, 'en', {
        generateDescription: async () => {
          throw error;
        },
      }),
    (actual: unknown) => actual === error
  );
});
