import { describe, expect, it } from "vitest";
import { transitionWheelCycle, type WheelCycleContext } from "./index";

const cycle: WheelCycleContext = {
  ticker: "AAPL",
  state: "WATCHING",
  premiumsCollected: 0,
  sharesOwned: 0,
  adjustedCostBasis: 0,
  realizedPnl: 0,
  unrealizedPnl: 0,
  journalRequired: false,
  nextRecommendedAction: "Review"
};

describe("wheel state machine", () => {
  it("transitions from watching to open CSP", () => {
    const planned = transitionWheelCycle(cycle, "planCsp");
    const open = transitionWheelCycle(planned, "openCsp", { premium: 150 });
    expect(open.state).toBe("CSP_OPEN");
    expect(open.premiumsCollected).toBe(150);
    expect(open.journalRequired).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(() => transitionWheelCycle(cycle, "openCoveredCall")).toThrow("Invalid wheel transition");
  });
});
