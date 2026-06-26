import type { MarketRegime } from "@wheeldesk/core";

export type MarketRegimeInput = {
  indexPrice: number;
  indexSma50: number;
  indexSma200: number;
  breadthPercentAbove50: number;
  volatilityIndex: number;
  manualOverride?: MarketRegime;
};

export type MarketRegimeResult = {
  regime: MarketRegime;
  confidence: "Low" | "Medium" | "High";
  explanation: string[];
};

export function determineMarketRegime(input: MarketRegimeInput): MarketRegimeResult {
  if (input.manualOverride) {
    return { regime: input.manualOverride, confidence: "High", explanation: ["Manual override is active."] };
  }

  const explanation: string[] = [];
  let score = 0;
  if (input.indexPrice > input.indexSma50) score += 1;
  if (input.indexSma50 > input.indexSma200) score += 1;
  if (input.breadthPercentAbove50 > 0.55) score += 1;
  if (input.volatilityIndex < 20) score += 1;
  if (input.volatilityIndex > 28) score -= 2;

  explanation.push(`Regime score ${score} uses index trend, market breadth, and volatility.`);
  const regime: MarketRegime = score >= 3 ? "Bull market" : score <= -1 ? "Bear market" : input.indexPrice < input.indexSma200 ? "Correction" : "Sideways";
  return { regime, confidence: Math.abs(score) >= 3 ? "High" : "Medium", explanation };
}
