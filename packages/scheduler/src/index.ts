export type ScheduledJob = {
  name: string;
  cadence: "every-morning" | "market-hours" | "hourly" | "daily";
  run: () => Promise<void>;
};

export class SchedulerRegistry {
  private readonly jobs: ScheduledJob[] = [];

  register(job: ScheduledJob) {
    this.jobs.push(job);
  }

  list() {
    return [...this.jobs];
  }

  async runByCadence(cadence: ScheduledJob["cadence"]) {
    const startedAt = Date.now();
    const results = [];
    for (const job of this.jobs.filter((item) => item.cadence === cadence)) {
      const jobStartedAt = Date.now();
      await job.run();
      results.push({ name: job.name, runtimeMs: Date.now() - jobStartedAt });
    }
    return { cadence, runtimeMs: Date.now() - startedAt, jobs: results };
  }
}

export function createWheelDeskScheduler(tasks: {
  updateFundamentals: () => Promise<void>;
  updateEarnings: () => Promise<void>;
  updateScores: () => Promise<void>;
  refreshQuotes: () => Promise<void>;
  refreshOptionChains: () => Promise<void>;
}) {
  const scheduler = new SchedulerRegistry();
  scheduler.register({ name: "update-fundamentals", cadence: "every-morning", run: tasks.updateFundamentals });
  scheduler.register({ name: "update-earnings", cadence: "every-morning", run: tasks.updateEarnings });
  scheduler.register({ name: "update-wheel-scores", cadence: "every-morning", run: tasks.updateScores });
  scheduler.register({ name: "refresh-quotes", cadence: "market-hours", run: tasks.refreshQuotes });
  scheduler.register({ name: "refresh-options-chains", cadence: "market-hours", run: tasks.refreshOptionChains });
  scheduler.register({ name: "recalculate-wheel-scores", cadence: "market-hours", run: tasks.updateScores });
  return scheduler;
}
