import assert from 'node:assert/strict';
import { afterEach, test } from '@jest/globals';
import Fastify, { type FastifyInstance } from 'fastify';
import { elements } from '../schemas/common.js';
import { ingredientsRoutes } from '../routes/ingredients-routes.js';

const apps: FastifyInstance[] = [];

function createApp() {
  const app = Fastify();
  apps.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

test('ingredient routes return the catalog in the requested language', async () => {
  const app = createApp();
  await app.register(ingredientsRoutes);

  const english = await app.inject('/ingredients/dragon-scale');
  const ukrainian = await app.inject('/ingredients/dragon-scale?lang=ua');
  assert.equal(english.statusCode, 200);
  assert.equal(ukrainian.statusCode, 200);
  assert.equal(english.json().id, 'dragon-scale');
  assert.equal(english.json().name, 'Dragon Scale');
  assert.equal(ukrainian.json().id, 'dragon-scale');
  assert.equal(ukrainian.json().name, 'Драконяча луска');
  assert.equal(english.json().element, ukrainian.json().element);
  assert.deepEqual(Object.keys(english.json().assets).sort(), [
    'full',
    'thumb128',
    'thumb64',
  ]);

  const allIngredients = await app.inject('/ingredients?lang=ua');
  assert.equal(allIngredients.statusCode, 200);
  assert.ok(allIngredients.json().length > 0);
});

test('ingredient routes filter by an allowed element without asserting unavailable catalog content', async () => {
  const app = createApp();
  await app.register(ingredientsRoutes);

  for (const element of elements) {
    const response = await app.inject(`/ingredients/element/${element}`);
    assert.equal(response.statusCode, 200);
    assert.ok(
      response
        .json()
        .every(
          (ingredient: { element: string }) => ingredient.element === element
        )
    );
  }
});

test('ingredient routes reject invalid input and distinguish a missing ingredient', async () => {
  const app = createApp();
  await app.register(ingredientsRoutes);

  assert.equal((await app.inject('/ingredients?lang=de')).statusCode, 400);
  assert.equal(
    (await app.inject('/ingredients/element/unknown')).statusCode,
    400
  );

  const missing = await app.inject('/ingredients/missing');
  assert.equal(missing.statusCode, 404);
  assert.equal(missing.json().message, 'Ingredient not found');
});
