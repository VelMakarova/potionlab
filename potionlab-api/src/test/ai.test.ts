import assert from "node:assert/strict";
import { afterEach, test } from "@jest/globals";
import Fastify, { type FastifyInstance } from "fastify";
import { aiRoutes } from "../routes/ai-routes.js";
import { AiError, checkAi, readAiConfig, type AiConfig } from "../services/ai.js";

const serviceToken = "test-service-secret";
const apiKey = "test-potionlab-api-secret";
const config: AiConfig = {
  apiKey,
  serviceToken,
  model: "gemini-3.1-flash-lite",
};

const authorizedHeaders = { authorization: `Bearer ${serviceToken}` };
const aiCheckRequest = {
  method: "POST" as const,
  url: "/internal/ai/check",
  headers: authorizedHeaders,
};

const apps: FastifyInstance[] = [];

function createApp() {
  const app = Fastify();
  apps.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

function success() {
  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: "OK" }] } }],
    usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 1, totalTokenCount: 6 },
  }));
}

test("AI check rejects missing, malformed, and incorrect credentials before contacting Google", async () => {
  const app = createApp();
  let calls = 0;
  await app.register(aiRoutes, {
    config,
    fetcher: async () => {
      calls++;
      return success();
    },
  });

  for (const headers of [
    undefined,
    { authorization: "Basic ignored" },
    { authorization: "Bearer wrong-token" },
  ]) {
    const response = await app.inject({ method: "POST", url: "/internal/ai/check", headers });
    assert.equal(response.statusCode, 401);
    assert.equal(response.json().code, "UNAUTHORIZED");
  }
  assert.equal(calls, 0);
});

test("AI check sends a bounded documented request and returns a sanitized success response", async () => {
  const app = createApp();
  let calls = 0;
  await app.register(aiRoutes, {
    config,
    fetcher: async (url, init) => {
      calls++;
      assert.equal(String(url), "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent");
      assert.equal(init?.method, "POST");
      assert.deepEqual(init?.headers, {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      });
      if (typeof init?.body !== "string") throw new Error("AI request body must be JSON text");
      assert.deepEqual(JSON.parse(init.body), {
        contents: [{ role: "user", parts: [{ text: "Reply with only OK." }] }],
        generationConfig: { maxOutputTokens: 16, temperature: 0 },
      });
      return success();
    },
  });

  const response = await app.inject(aiCheckRequest);
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["cache-control"], "no-store");
  assert.deepEqual(response.json().usage, { inputTokens: 5, outputTokens: 1, totalTokens: 6 });
  assert.equal(response.json().quotaRemaining, null);
  assert.ok(!response.body.includes(apiKey));
  assert.equal(calls, 1);
});

for (const [name, settings, expected] of [
  ["service token", { ...config, serviceToken: undefined }, "AI_SERVICE_TOKEN_NOT_CONFIGURED"],
  ["API key", { ...config, apiKey: undefined }, "AI_NOT_CONFIGURED"],
] as const) {
  test(`missing ${name} returns 503 without contacting Google`, async () => {
    const app = createApp();
    let calls = 0;
    await app.register(aiRoutes, {
      config: settings,
      fetcher: async () => {
        calls++;
        return success();
      },
    });

    const response = await app.inject(aiCheckRequest);
    assert.equal(response.statusCode, 503);
    assert.equal(response.json().code, expected);
    assert.equal(calls, 0);
  });
}

test("AI check enforces the configured request interval without invoking Google while cooling down", async () => {
  const app = createApp();
  let time = 100_000;
  let calls = 0;
  await app.register(aiRoutes, {
    config,
    now: () => time,
    fetcher: async () => {
      calls++;
      return success();
    },
  });

  const first = await app.inject(aiCheckRequest);
  assert.equal(first.statusCode, 200);
  assert.equal(first.json().checkIntervalMs, 4000);
  assert.equal(first.json().configuredLimits.requestsPerDay, 500);
  assert.equal(first.json().configuredLimits.source, "configuration");
  assert.equal(first.json().quotaRemaining, null);

  time += 3999;
  const blocked = await app.inject(aiCheckRequest);
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.json().code, "AI_CHECK_COOLDOWN");
  assert.equal(blocked.headers["retry-after"], "1");
  assert.equal(calls, 1);

  time++;
  const allowed = await app.inject(aiCheckRequest);
  assert.equal(allowed.statusCode, 200);
  assert.equal(calls, 2);
});

for (const [status, code, mappedStatus] of [
  [429, "AI_QUOTA_OR_RATE_LIMIT", 429],
  [400, "AI_ACCESS_DENIED", 502],
  [401, "AI_ACCESS_DENIED", 502],
  [403, "AI_ACCESS_DENIED", 502],
  [404, "AI_MODEL_NOT_FOUND", 502],
  [503, "AI_PROVIDER_UNAVAILABLE", 502],
] as const) {
  test(`provider HTTP ${status} maps to a stable AI error`, async () => {
    await assert.rejects(
      checkAi(config, async () => new Response(apiKey, { status })),
      (error: unknown) => error instanceof AiError && error.code === code && error.statusCode === mappedStatus,
    );
  });
}

test("AI check aborts an overdue provider request and reports a timeout", async () => {
  let signalSeen: AbortSignal | undefined;
  const neverRespondingFetcher: typeof fetch = async (_url, init) => {
    const signal = init?.signal;
    if (!signal) throw new Error("AI request must include an abort signal");
    signalSeen = signal;
    return new Promise<Response>((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason), { once: true });
    });
  };

  await assert.rejects(
    checkAi({ ...config, timeoutMs: 25 }, neverRespondingFetcher),
    (error: unknown) => error instanceof AiError && error.code === "AI_TIMEOUT" && error.statusCode === 504,
  );
  assert.equal(signalSeen?.aborted, true);
});

test("malformed or semantically empty provider responses fail without pretending generation succeeded", async () => {
  await assert.rejects(
    checkAi(config, async () => new Response("{}")),
    (error: unknown) => error instanceof AiError && error.code === "AI_EMPTY_RESPONSE",
  );
  await assert.rejects(
    checkAi(config, async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "   " }] } }] }))),
    (error: unknown) => error instanceof AiError && error.code === "AI_EMPTY_RESPONSE",
  );
  await assert.rejects(
    checkAi(config, async () => new Response("not json")),
    (error: unknown) => error instanceof AiError && error.code === "AI_INVALID_RESPONSE",
  );
});

test("AI configuration supplies safe defaults and rejects invalid values", () => {
  assert.equal(readAiConfig({}).model, config.model);
  assert.equal(readAiConfig({}).timeoutMs, 45_000);
  assert.deepEqual(readAiConfig({}).limits, {
    requestsPerMinute: 15,
    inputTokensPerMinute: 250_000,
    requestsPerDay: 500,
  });
  assert.equal(readAiConfig({ GEMINI_REQUESTS_PER_MINUTE: "10" }).limits?.requestsPerMinute, 10);

  for (const [name, value] of [
    ["GEMINI_MODEL", "../other"],
    ["GEMINI_REQUESTS_PER_MINUTE", "0"],
    ["GEMINI_REQUESTS_PER_MINUTE", "1.5"],
    ["GEMINI_REQUESTS_PER_MINUTE", "NaN"],
    ["GEMINI_TIMEOUT_MS", "0"],
    ["GEMINI_TIMEOUT_MS", "120001"],
  ] as const) {
    assert.throws(() => readAiConfig({ [name]: value }));
  }
});

test("network diagnostics preserve only allowlisted network codes", async () => {
  await assert.rejects(
    checkAi(config, async () => {
      throw new TypeError("secret", { cause: { code: "ENOTFOUND" } });
    }),
    (error: unknown) => error instanceof AiError && error.code === "AI_NETWORK_ERROR" && error.networkCode === "ENOTFOUND",
  );
  await assert.rejects(
    checkAi(config, async () => {
      throw new TypeError("secret", { cause: { code: apiKey } });
    }),
    (error: unknown) => error instanceof AiError && error.networkCode === undefined,
  );
});

test("route exposes safe provider diagnostics without forwarding the provider body", async () => {
  const app = createApp();
  const providerBody = `provider secret: ${apiKey}`;
  await app.register(aiRoutes, {
    config,
    fetcher: async () => new Response(providerBody, { status: 503 }),
  });

  const response = await app.inject(aiCheckRequest);
  assert.equal(response.statusCode, 502);
  assert.equal(response.json().code, "AI_PROVIDER_UNAVAILABLE");
  assert.equal(response.json().providerHttpStatus, 503);
  assert.equal(response.json().timeoutMs, 45_000);
  assert.ok(!response.body.includes(providerBody));
  assert.ok(!response.body.includes(apiKey));
});
