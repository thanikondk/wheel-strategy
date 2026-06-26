export type PersistedSnapshotType = "quote" | "fundamentals" | "option-chain" | "wheel-score" | "technical" | "trade-recommendation";

export type PersistedSnapshot = {
  id: string;
  ticker: string;
  type: PersistedSnapshotType;
  asOf: string;
  payload: unknown;
};

export interface AnalyticsRepository {
  saveSnapshot(snapshot: Omit<PersistedSnapshot, "id">): Promise<PersistedSnapshot>;
  getLatestSnapshot<T>(ticker: string, type: PersistedSnapshotType): Promise<(PersistedSnapshot & { payload: T }) | undefined>;
}

export class InMemoryAnalyticsRepository implements AnalyticsRepository {
  private readonly snapshots: PersistedSnapshot[] = [];

  async saveSnapshot(snapshot: Omit<PersistedSnapshot, "id">): Promise<PersistedSnapshot> {
    const saved = { ...snapshot, id: crypto.randomUUID() };
    this.snapshots.push(saved);
    return saved;
  }

  async getLatestSnapshot<T>(ticker: string, type: PersistedSnapshotType) {
    return this.snapshots
      .filter((snapshot) => snapshot.ticker === ticker && snapshot.type === type)
      .sort((a, b) => b.asOf.localeCompare(a.asOf))[0] as (PersistedSnapshot & { payload: T }) | undefined;
  }
}
