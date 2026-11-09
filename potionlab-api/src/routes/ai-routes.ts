import { timingSafeEqual } from "node:crypto";
import type { FastifyPluginAsync } from "fastify";
import {type AiConfig, defaultAiLimits, readAiConfig, checkAi, AiError } from "@/services/ai.js";
import { aiCheckSchema } from "@/schemas/ai.js";

interface AiRouteOptions {
  config?: AiConfig;
  fetcher?: typeof fetch;
  now?: () => number;
}

export const aiRoutes: FastifyPluginAsync<AiRouteOptions> = async (fastify, options) => {
  const config = options.config ?? readAiConfig();
  const limits = config.limits ?? defaultAiLimits;
  const checkIntervalMs = Math.ceil(60_000 / limits.requestsPerMinute);
  const now = options.now ?? Date.now;
  const configuredLimits = {
    ...limits,
    dailyResetTimeZone: "America/Los_Angeles",
    source: "configuration",
  };
  let inFlight = false;
  let nextCheckAt = 0;

  fastify.post("/internal/ai/check", {
    schema: aiCheckSchema,
    onRequest: async (request, reply) => {
      reply.header("Cache-Control", "no-store");
      if (!config.serviceToken) {
        return reply.code(503).send({ ok: false, code: "AI_SERVICE_TOKEN_NOT_CONFIGURED" });
      }
      const expected = Buffer.from(`Bearer ${config.serviceToken}`);
      const actual = Buffer.from(request.headers.authorization ?? "");
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        return reply.code(401).send({ ok: false, code: "UNAUTHORIZED" });
      }
    },
  }, async (request, reply) => {
    if (!config.apiKey) return reply.code(503).send({ ok: false, code: "AI_NOT_CONFIGURED" });

    const retryAfter = Math.max(1, Math.ceil((nextCheckAt - now()) / 1000));

    if (inFlight || now() < nextCheckAt) {
      return reply.header("Retry-After", retryAfter).code(429)
        .send({ ok: false, code: "AI_CHECK_COOLDOWN", retryAfterSeconds: retryAfter, configuredLimits });
    }

    inFlight = true;
    nextCheckAt = now() + checkIntervalMs;
    const startedAt = Date.now();

    try {
      return { ...await checkAi(config, options.fetcher), configuredLimits, checkIntervalMs };
    } catch (error) {
      if (!(error instanceof AiError)) throw error;
      const diagnostics = {
        model: config.model,
        latencyMs: Date.now() - startedAt,
        timeoutMs: config.timeoutMs ?? 45_000,
        providerHttpStatus: error.providerHttpStatus ?? null,
        networkCode: error.networkCode ?? null,
      };
      request.log.warn({ code: error.code, ...diagnostics }, "AI check failed");
      return reply.code(error.statusCode).send({ ok: false, provider: "gemini", code: error.code, ...diagnostics, configuredLimits });
    } finally {
      inFlight = false;
    }
  });
};
