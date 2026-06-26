import { describe, expect, it } from "vitest";
import { decideCashSecuredPut, decideCoveredCall } from "./index";

const quote = { ticker: "AAPL", price: 100, change: 1, percentChange: 0.01, bid: 99.95, ask: 100.05, volume: 1_000_000, avgVolume: 1_200_000, marketCap: 1_000_000_000, timestamp: "2026-01-01" };
const put = { ticker: "AAPL", expiration: "2026-07-17", strike: 90, type: "put" as const, bid: 1.4, ask: 1.5, last: 1.45, mark: 1.45, volume: 500, openInterest: 2000, impliedVolatility: 0.32, delta: -0.22, gamma: 0.02, theta: -0.04, vega: 0.1, rho: -0.01, iv: 0.32, intrinsicValue: 0, extrinsicValue: 1.45, breakEven: 88.55, probabilityITM: 0.22, probabilityOTM: 0.78, timestamp: "2026-01-01" };
const call = { ...put, type: "call" as const, strike: 110, delta: 0.24, breakEven: 111.45 };

describe("decision engine", () => {
  it("approves a qualified CSP with transparent calculations", () => {
    const decision = decideCashSecuredPut({ quote, contract: put, dte: 30, accountSize: 50_000, cashAvailable: 30_000, existingTickerExposure: 0, wheelScore: 86, riskScore: 3, earningsRisk: false, assignmentReady: true });
    expect(decision.finalDecision).toBe("APPROVED");
    expect(decision.supportingCalculations.capitalRequired).toBe(9000);
    expect(decision.whatCouldGoWrong.length).toBeGreaterThan(0);
  });

  it("blocks below-basis covered calls", () => {
    const decision = decideCoveredCall({ quote, contract: { ...call, strike: 95 }, dte: 30, currentShares: 100, adjustedCostBasis: 100, wheelScore: 80, riskScore: 3 });
    expect(decision.finalDecision).toBe("BLOCKED");
    expect(decision.hardRuleViolations.join(" ")).toContain("below adjusted cost basis");
  });
});
