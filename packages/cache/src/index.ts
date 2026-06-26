export type CacheTtlPolicy = {
  quoteSeconds: number;
  optionsChainSeconds: number;
  fundamentalsSeconds: number;
  technicalsSeconds: number;
  economicCalendarSeconds: number;
  earningsSeconds: number;
};

export const DEFAULT_CACHE_TTLS: CacheTtlPolicy = {
  quoteSeconds: 5 * 60,
  optionsChainSeconds: 10 * 60,
  fundamentalsSeconds: 24 * 60 * 60,
  technicalsSeconds: 60 * 60,
  economicCalendarSeconds: 24 * 60 * 60,
  earningsSeconds: 24 * 60 * 60
};

export interface CacheStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

export class InMemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, { expiresAt: number; value: unknown }>();

  async get<T>(key: string): Promise<T | undefined> {
    const item = this.store.get(key);
    if (!item) return undefined;
    if (item.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string) {
    this.store.delete(key);
  }
}

export class RedisCacheStore implements CacheStore {
  constructor(private readonly client: { get(key: string): Promise<string | null>; set(key: string, value: string, mode: "EX", ttl: number): Promise<unknown>; del(key: string): Promise<unknown> }) {}

  async get<T>(key: string) {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) as T : undefined;
  }

  async set<T>(key: string, value: T, ttlSeconds: number) {
    await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
