import { describe, expect, it } from "vitest";
import { DECISION_THRESHOLDS, RISK_LIMITS, WHEEL_SCORE_RUBRIC } from "./rules";

describe("risk and scoring constants", () => {
  it("codifies account hard limits", () => {
    expect(RISK_LIMITS.maxAllocationPerUnderlying).toBe(0.2);
    expect(RISK_LIMITS.minCashReserve).toBe(0.15);
    expect(RISK_LIMITS.maxSpreadPercent).toBe(0.12);
    expect(RISK_LIMITS.hardMaxDelta).toBe(0.35);
  });

  it("codifies decision thresholds", () => {
    expect(DECISION_THRESHOLDS.approvedMinWheelScore).toBe(75);
    expect(DECISION_THRESHOLDS.watchMinScore).toBe(70);
    expect(DECISION_THRESHOLDS.strongBuyMinScore).toBe(90);
  });

  it("keeps wheel score weights normalized", () => {
    const total = Object.values(WHEEL_SCORE_RUBRIC.weights).reduce((sum, weight) => sum + weight, 0);
    expect(total).toBeCloseTo(1);
    expect(WHEEL_SCORE_RUBRIC.probabilityMethod).toContain("Delta proxy");
  });
});
