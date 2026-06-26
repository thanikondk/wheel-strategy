export type ProviderErrorCode = "RATE_LIMITED" | "UNAUTHORIZED" | "NOT_FOUND" | "NETWORK" | "NORMALIZATION" | "UNAVAILABLE";

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly code: ProviderErrorCode,
    public readonly provider: string,
    public readonly retryable = false,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export async function withRetry<T>(operation: () => Promise<T>, retries = 2, baseDelayMs = 150): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const retryable = error instanceof ProviderError ? error.retryable : true;
      if (!retryable || attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
    }
  }
  throw lastError;
}

export async function withFallback<T>(providers: Array<{ name: string; call: () => Promise<T> }>): Promise<T> {
  const errors: string[] = [];
  for (const provider of providers) {
    try {
      return await provider.call();
    } catch (error) {
      errors.push(`${provider.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new ProviderError(`All providers failed. ${errors.join(" | ")}`, "UNAVAILABLE", "fallback", true);
}
