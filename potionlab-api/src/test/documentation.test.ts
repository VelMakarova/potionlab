import assert from 'node:assert/strict';
import { afterEach, test } from '@jest/globals';
import type { FastifyInstance } from 'fastify';
import { createApp } from '../app.js';

const apps: FastifyInstance[] = [];

async function createTestApp() {
  const app = await createApp({ logger: false });
  apps.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

test('OpenAPI exposes the public routes and their critical client contracts', async () => {
  const app = await createTestApp();

  const response = await app.inject('/docs/json');
  assert.equal(response.statusCode, 200);
  const spec = response.json();

  for (const path of [
    '/ingredients',
    '/ingredients/{id}',
    '/ingredients/element/{element}',
    '/brew',
    '/internal/ai/check',
  ]) {
    assert.ok(spec.paths[path], `OpenAPI must include ${path}`);
  }

  const ingredientById = spec.paths['/ingredients/{id}'].get;
  assert.ok(
    ingredientById.parameters.some(
      (parameter: { name: string; in: string; required?: boolean }) =>
        parameter.name === 'id' && parameter.in === 'path' && parameter.required
    )
  );
  assert.ok(ingredientById.responses[200]);
  assert.ok(ingredientById.responses[404]);

  const brew = spec.paths['/brew'].post;
  assert.equal(brew.requestBody.required, true);
  const bodySchema = brew.requestBody.content['application/json'].schema;
  const resolvedBodySchema = bodySchema.$ref
    ? spec.components.schemas[bodySchema.$ref.split('/').at(-1)]
    : bodySchema;
  assert.equal(resolvedBodySchema.properties.ingredientIds.minItems, 3);
  assert.equal(resolvedBodySchema.properties.ingredientIds.maxItems, 3);

  const ai = spec.paths['/internal/ai/check'].post;
  assert.deepEqual(ai.security, [{ serviceToken: [] }]);
  assert.equal(spec.components.securitySchemes.serviceToken.scheme, 'bearer');
  for (const status of [200, 401, 429, 502, 503, 504])
    assert.ok(ai.responses[status]);

  assert.equal((await app.inject('/docs/')).statusCode, 200);
  assert.equal((await app.inject('/docs/yaml')).statusCode, 200);
});

test('the shared app serves catalog and brewing routes without opening a port', async () => {
  const app = await createTestApp();

  assert.equal(app.server.listening, false);
  const ingredient = await app.inject('/ingredients/dragon-scale?lang=ua');
  assert.equal(ingredient.statusCode, 200);
  assert.equal(ingredient.json().name, 'Драконяча луска');

  const ingredientIds = ['dragon-scale', 'ember-root', 'cinder-bloom'];
  const brew = await app.inject({
    method: 'POST',
    url: '/brew',
    payload: { ingredientIds },
  });
  assert.equal(brew.statusCode, 200);
  assert.deepEqual(brew.json(), { status: 'no_magic' });
  assert.equal(app.server.listening, false);
});
