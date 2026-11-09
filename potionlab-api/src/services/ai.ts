export interface AiConfig {
  apiKey?: string;
  serviceToken?: string;
  model: string;
  timeoutMs?: number;
  limits?: AiLimits;
}

export interface AiLimits {
  requestsPerMinute: number;
  inputTokensPerMinute: number;
  requestsPerDay: number;
}

// Snapshot from this project's AI Studio limits, not a live quota lookup.
export const defaultAiLimits: Readonly<AiLimits> = {
  requestsPerMinute: 15,
  inputTokensPerMinute: 250_000,
  requestsPerDay: 500,
};

function positiveInteger(env: NodeJS.ProcessEnv, name: string, fallback: number) {
  const value = Number(env[name] ?? fallback);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive safe integer`);
  }
  return value;
}

export function readAiConfig(env: NodeJS.ProcessEnv = process.env): AiConfig {
  const model = env.GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite";
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) {
    throw new Error("GEMINI_MODEL must be a model ID without a path");
  }
  const timeoutMs = Number(env.GEMINI_TIMEOUT_MS ?? 45_000);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 120_000) {
    throw new Error("GEMINI_TIMEOUT_MS must be an integer between 1000 and 120000");
  }
  return {
    apiKey: env.GEMINI_API_KEY?.trim() || undefined,
    serviceToken: env.AI_SERVICE_TOKEN?.trim() || undefined,
    model,
    timeoutMs,
    limits: {
      requestsPerMinute: positiveInteger(env, "GEMINI_REQUESTS_PER_MINUTE", defaultAiLimits.requestsPerMinute),
      inputTokensPerMinute: positiveInteger(env, "GEMINI_INPUT_TOKENS_PER_MINUTE", defaultAiLimits.inputTokensPerMinute),
      requestsPerDay: positiveInteger(env, "GEMINI_REQUESTS_PER_DAY", defaultAiLimits.requestsPerDay),
    },
  };
}

export class AiError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    public readonly providerHttpStatus?: number,
    public readonly networkCode?: string,
  ) {
    super(code);
  }
}

interface GenerateResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

function isAbortOrTimeoutError(error: unknown) {
  if (typeof error !== "object" || error === null || !("name" in error)) return false;
  return error.name === "TimeoutError" || error.name === "AbortError";
}

// Uses the REST API so the backend needs no additional runtime dependencies.
export async function checkAi(config: AiConfig, fetcher: typeof fetch = fetch) {
  if (!config.apiKey) throw new AiError("AI_NOT_CONFIGURED", 503);
  const startedAt = Date.now();
  try {
    const response = await fetcher(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": config.apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Reply with only OK." }] }],
          generationConfig: { maxOutputTokens: 16, temperature: 0 },
        }),
        signal: AbortSignal.timeout(config.timeoutMs ?? 45_000),
        redirect: "error",
      },
    );
    if (!response.ok) {
      // Never forward raw provider messages: they may contain sensitive configuration.
      await response.body?.cancel();
      if (response.status === 429) throw new AiError("AI_QUOTA_OR_RATE_LIMIT", 429, response.status);
      if ([400, 401, 403].includes(response.status)) throw new AiError("AI_ACCESS_DENIED", 502, response.status);
      if (response.status === 404) throw new AiError("AI_MODEL_NOT_FOUND", 502, response.status);
      throw new AiError("AI_PROVIDER_UNAVAILABLE", 502, response.status);
    }
    let data: GenerateResponse;
    try {
      data = await response.json() as GenerateResponse;
    } catch (error) {
      if (isAbortOrTimeoutError(error)) throw error;
      throw new AiError("AI_INVALID_RESPONSE", 502, response.status);
    }
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!text) throw new AiError("AI_EMPTY_RESPONSE", 502);
    return {
      ok: true,
      provider: "gemini",
      model: config.model,
      generationAvailable: true,
      latencyMs: Date.now() - startedAt,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount ?? null,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? null,
        totalTokens: data.usageMetadata?.totalTokenCount ?? null,
      },
      quotaRemaining: null,
      quotaDashboard: "https://aistudio.google.com/usage",
    };
  } catch (error) {
    if (error instanceof AiError) throw error;
    if (isAbortOrTimeoutError(error)) {
      throw new AiError("AI_TIMEOUT", 504);
    }
    const cause = error instanceof Error ? error.cause as { code?: unknown } | undefined : undefined;
    const safeCodes = ["ENOTFOUND", "EAI_AGAIN", "ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_SOCKET", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "CERT_HAS_EXPIRED", "DEPTH_ZERO_SELF_SIGNED_CERT"];
    const networkCode = typeof cause?.code === "string" && safeCodes.includes(cause.code) ? cause.code : undefined;
    throw new AiError("AI_NETWORK_ERROR", 502, undefined, networkCode);
  }
}
