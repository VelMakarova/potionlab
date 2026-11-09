import { commonResponses, bodyErrorResponses } from "./common.js";

const configuredLimitsSchema = {
  type: "object", required: ["requestsPerMinute", "inputTokensPerMinute", "requestsPerDay", "dailyResetTimeZone", "source"],
  properties: {
    requestsPerMinute: { type: "integer" }, inputTokensPerMinute: { type: "integer" }, requestsPerDay: { type: "integer" },
    dailyResetTimeZone: { type: "string", enum: ["America/Los_Angeles"] },
    source: { type: "string", enum: ["configuration"] },
  },
} as const;

const nullableInteger = { type: "integer", nullable: true } as const;

const diagnostics = {
  provider: { type: "string", enum: ["gemini"] }, model: { type: "string" },
  latencyMs: { type: "integer" }, timeoutMs: { type: "integer" },
  providerHttpStatus: nullableInteger,
  networkCode: { type: "string", nullable: true },
  configuredLimits: configuredLimitsSchema,
} as const;

function aiError(description: string, codes: string[]) {
  return {
    description, type: "object", required: ["ok", "code"],
    properties: {
      ok: { type: "boolean", enum: [false] }, code: { type: "string", enum: codes },
      ...diagnostics,
      retryAfterSeconds: { type: "integer", description: "Present for local cooldown only; also sent as the Retry-After header." },
    },
  };
}

export const aiCheckSchema = {
  tags: ["Internal AI"],
  summary: "Check AI generation availability",
  description: "Makes one real, short Gemini generation request and consumes quota. Requires AI_SERVICE_TOKEN via Authorize. No query parameters or request body are required. Configured limits are configuration snapshots, not remaining quota. Responses include Cache-Control: no-store. Local cooldown responses also include Retry-After in seconds.",
  security: [{ serviceToken: [] }],
  response: {
    ...commonResponses,
    ...bodyErrorResponses,
    200: {
      description: "Generation succeeded.", type: "object",
      required: ["ok", "provider", "model", "generationAvailable", "latencyMs", "usage", "quotaRemaining", "quotaDashboard", "configuredLimits", "checkIntervalMs"],
      properties: {
        ok: { type: "boolean", enum: [true] }, provider: { type: "string", enum: ["gemini"] },
        model: { type: "string" }, generationAvailable: { type: "boolean", enum: [true] },
        latencyMs: { type: "integer" },
        usage: {
          type: "object", required: ["inputTokens", "outputTokens", "totalTokens"],
          properties: { inputTokens: nullableInteger, outputTokens: nullableInteger, totalTokens: nullableInteger },
        },
        quotaRemaining: { type: "integer", nullable: true, enum: [null], description: "Always null: remaining quota is not queried." },
        quotaDashboard: { type: "string", format: "uri" },
        configuredLimits: configuredLimitsSchema,
        checkIntervalMs: { type: "integer" },
      },
    },
    401: aiError("Missing or incorrect service Bearer token.", ["UNAUTHORIZED"]),
    429: aiError("Local cooldown (Retry-After header) or provider quota/rate limit.", ["AI_CHECK_COOLDOWN", "AI_QUOTA_OR_RATE_LIMIT"]),
    502: aiError("Provider, access, model, response or network failure. Diagnostic fields are included.", ["AI_ACCESS_DENIED", "AI_MODEL_NOT_FOUND", "AI_PROVIDER_UNAVAILABLE", "AI_INVALID_RESPONSE", "AI_EMPTY_RESPONSE", "AI_NETWORK_ERROR"]),
    503: aiError("Service token or Gemini API key is not configured.", ["AI_SERVICE_TOKEN_NOT_CONFIGURED", "AI_NOT_CONFIGURED"]),
    504: aiError("Provider request timed out. Diagnostic fields are included.", ["AI_TIMEOUT"]),
  },
};
