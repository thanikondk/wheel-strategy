import { describe, expect, it } from "vitest";
import { calculateWheelScore, rankTrades } from "./index";

const base = {
  ticker: "AAPL",
  fundamentals: {
    qualityScore: 90,
    growthScore: 80,
    valueScore: 70,
    profitabilityScore: 92,
    balanceSheetScore: 85,
    moatScore: 90,
    dividendSafetyScore: 75,
    overallFundamentalScore: 88,
    explanation: []
  },
  technicals: {
    sma20: 1,
    sma50: 1,
    sma100: 1,
    sma200: 1,
    ema20: 1,
    rsi14: 55,
    macd: { line: 1, signal: 0.8, histogram: 0.2 },
    atr14: 2,
    adx14: 20,
    bollingerBands: { upper: 2, middle: 1, lower: 0 },
    vwap: 1,
    week52High: 2,
    week52Low: 0,
    gapPercent: 0,
    support: 1,
    resistance: 2,
    trendDirection: "Bullish" as const,
    returnPercent: 0.2,
    score: 82,
    explanation: []
  },
  options: {
    annualizedReturn: 0.18,
    premiumYield: 0.014,
    capitalRequired: 4000,
    netCostBasis: 38.6,
    breakEven: 38.6,
    distanceOtm: 0.08,
    expectedMove: 2.4,
    probabilityOfAssignment: 0.24,
    extrinsicPercent: 1,
    intrinsicPercent: 0,
    thetaDecayEstimate: 0.5,
    ivPercentile: 40,
    ivRank: 40,
    liquidityScore: 92,
    spreadPercent: 0.03,
    openInterestScore: 90,
    volumeScore: 80,
    riskRewardRatio: 22,
    explanation: []
  },
  risk: {
    riskLevel: 2,
    confidence: "High" as const,
    status: "APPROVED" as const,
    hardBlocks: [],
    reasoning: []
  },
  sectorStrengthScore: 75,
  assignmentReadinessScore: 90,
  positionSizeScore: 80,
  cashReserveScore: 75,
  eventScore: 95
};

describe("scoring engine", () => {
  it("calculates transparent wheel score components", () => {
    const score = calculateWheelScore(base);
    expect(score.wheelScore).toBeGreaterThan(80);
    expect(score.explanation[0]).toContain("fundamentals 30%");
  });

  it("ranks trades by score, risk, and yield", () => {
    const high = calculateWheelScore(base);
    const low = calculateWheelScore({ ...base, ticker: "SOFI", fundamentals: { ...base.fundamentals, overallFundamentalScore: 45 } });
    const ranked = rankTrades([
      { ...low, riskLevel: 6, annualizedYield: 0.3, blocked: false },
      { ...high, riskLevel: 2, annualizedYield: 0.18, blocked: false }
    ]);
    expect(ranked[0].ticker).toBe("AAPL");
  });
});
