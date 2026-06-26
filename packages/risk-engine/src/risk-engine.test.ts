import { describe, expect, it } from "vitest";
import { cspCandidates } from "@wheeldesk/core";
import { scoreTrade, summarizeRecommendation } from "./index";

const baseInput = {
  ...cspCandidates[1],
  ticker: "TEST",
  currentPrice: 42,
  strike: 35,
  bid: 0.6,
  ask: 0.65,
  mid: 0.625,
  premium: 62.5,
  accountSize: 20_000,
  cashAvailable: 15_850,
  cashReserveAfterTrade: 15_850 - 35 * 100,
  tickerQualityScore: 88,
  existingExposure: 0,
  sectorConcentration: 0.2,
  assignmentReady: true,
  marketRegime: "Sideways" as const
};

describe("risk engine", () => {
  it("approves or watches candidates that meet core rules", () => {
    const result = scoreTrade(baseInput);
    expect(["APPROVED", "WATCH"]).toContain(result.status);
    expect(result.hardBlocks).toHaveLength(0);
  });

  it("blocks trades over max allocation", () => {
    const result = scoreTrade({ ...baseInput, strike: 1000 });
    expect(result.status).toBe("BLOCKED");
    expect(result.hardBlocks.join(" ")).toContain("20% max allocation");
  });

  it("blocks trades that are not assignment-ready", () => {
    const result = scoreTrade({ ...baseInput, userWouldOwn: false, assignmentReady: false });
    expect(result.status).toBe("BLOCKED");
    expect(result.hardBlocks.join(" ")).toContain("assignment-ready");
  });

  it("produces a recommendation with maximum loss language", () => {
    const recommendation = summarizeRecommendation(baseInput);
    expect(recommendation.exitPlan.maximumLossScenario).toContain("fall substantially");
  });
});
