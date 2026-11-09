import assert from "node:assert/strict";
import { afterEach, test } from "@jest/globals";
import Fastify, { type FastifyInstance } from "fastify";
import { brewRoutes } from "../routes/brew-routes.js";

const validIngredientIds = ["dragon-scale", "ember-root", "cinder-bloom"];
const apps: FastifyInstance[] = [];

function createApp() {
  const app = Fastify();
  apps.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

test("brew returns a normal gameplay outcome for three ingredients of the same element", async () => {
  const app = createApp();
  await app.register(brewRoutes);

  const response = await app.inject({
    method: "POST",
    url: "/brew?lang=ua",
    payload: { ingredientIds: validIngredientIds },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "no_magic" });
});

test("brew rejects unknown catalog IDs as input errors", async () => {
  const app = createApp();
  await app.register(brewRoutes);
  const unknownIds = ["unknown-one", "unknown-two", "unknown-three"];

  const response = await app.inject({ method: "POST", url: "/brew", payload: { ingredientIds: unknownIds } });
  assert.equal(response.statusCode, 400);
  assert.equal(response.json().code, "UNKNOWN_INGREDIENT_ID");
});

test("brew returns canonical strengths and a localized mock description", async () => {
  const app = createApp();
  await app.register(brewRoutes);
  for (const [language, description] of [["ua", "Тут буде текст від ШІ"], ["en", "AI-generated text will appear here"]]) {
    const response = await app.inject({
      method: "POST", url: `/brew?lang=${language}`,
      payload: { ingredientIds: ["dragon-scale", "moonwell-dew", "mandrake-root"] },
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().status, "brewed");
    assert.equal(response.json().description, description);
    assert.ok(Object.keys(response.json().properties).length > 0);
  }
});

test("brew returns elemental catastrophes as successful game responses", async () => {
  const app = createApp();
  await app.register(brewRoutes);
  const response = await app.inject({
    method: "POST", url: "/brew",
    payload: { ingredientIds: ["dragon-scale", "ember-root", "moonwell-dew"] },
  });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "explosion" });
});

test("brew rejects invalid request bodies and content types", async () => {
  const app = createApp();
  await app.register(brewRoutes);

  for (const ingredientIds of [[], ["one"], ["one", "two", "three", "four"], ["one", "", "three"], ["dragon-scale", "dragon-scale", "ember-root"]]) {
    const response = await app.inject({ method: "POST", url: "/brew", payload: { ingredientIds } });
    assert.equal(response.statusCode, 400);
  }
  assert.equal((await app.inject({ method: "POST", url: "/brew", payload: {} })).statusCode, 400);
  assert.equal((await app.inject({
    method: "POST",
    url: "/brew",
    headers: { "content-type": "application/json" },
    payload: "{",
  })).statusCode, 400);
  assert.equal((await app.inject({
    method: "POST",
    url: "/brew",
    headers: { "content-type": "application/xml" },
    payload: "<brew/>",
  })).statusCode, 415);
});
