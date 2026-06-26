export type ProviderConfig = {
  apiKey?: string;
  baseUrl: string;
  providerName: string;
};

export abstract class BaseHttpAdapter {
  protected constructor(protected readonly config: ProviderConfig) {}

  protected async getJson<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.config.apiKey) {
      throw new Error(`${this.config.providerName} API key is not configured.`);
    }

    const response = await fetch(`${this.config.baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {})
      }
    });

    if (!response.ok) {
      throw new Error(`${this.config.providerName} request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}
