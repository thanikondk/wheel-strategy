import { bidAskSpreadPercent, cspCashRequirement, wheelCapitalAllocation } from "@wheeldesk/calculators";
import { ACCOUNT_RULES } from "@wheeldesk/core";
import type { Confidence, MarketRegime, OptionCandidate, TradeStatus } from "@wheeldesk/core";

export type RiskInput = OptionCandidate & {
  accountSize: number;
  cashAvailable: number;
  cashReserveAfterTrade: number;
  tickerQualityScore: number;
  existingExposure: number;
  sectorConcentration: number;
  assignmentReady: boolean;
  marketRegime: MarketRegime;
  earningsOverride?: boolean;
};

export type RiskResult = {
  score: number;
  confidence: Confidence;
  status: TradeStatus;
  reasons: string[];
  hardBlocks: string[];
  spreadPercent: number;
  capitalRequired: number;
  allocationPercent: number;
};

export type InstitutionalRiskInput = {
  accountSize: number;
  capitalRequired: number;
  cashReserveAfterTrade: number;
  sectorExposure: number;
  tickerExposure: number;
  assignmentRisk: number;
  liquidityScore: number;
  ivRank: number;
  earningsWindow: boolean;
  spreadPercent: number;
  positionSizePercent: number;
  fundamentalScore: number;
  userWouldOwn: boolean;
  earningsOverride?: boolean;
};

export type InstitutionalRiskResult = {
  riskLevel: number;
  confidence: Confidence;
  status: TradeStatus;
  hardBlocks: string[];
  reasoning: string[];
};

export function evaluateInstitutionalRisk(input: InstitutionalRiskInput): InstitutionalRiskResult {
  const hardBlocks: string[] = [];
  const reasoning: string[] = [];
  let riskPoints = 1;

  if (input.capitalRequired / input.accountSize > ACCOUNT_RULES.maxAllocationPerUnderlying) hardBlocks.push("Capital exceeds 20% account allocation.");
  if (input.cashReserveAfterTrade / input.accountSize < ACCOUNT_RULES.minCashReserve) hardBlocks.push("Cash reserve would fall below 15%.");
  if (input.liquidityScore < 45) hardBlocks.push("Low liquidity.");
  if (input.spreadPercent > ACCOUNT_RULES.maxSpreadPercent) hardBlocks.push("Wide bid/ask spread.");
  if (input.fundamentalScore < 50) hardBlocks.push("Poor fundamentals.");
  if (!input.userWouldOwn) hardBlocks.push("User marked stock as would not own.");
  if (input.earningsWindow && !input.earningsOverride) hardBlocks.push("Upcoming earnings inside configured window.");

  riskPoints += input.positionSizePercent > 0.15 ? 2 : 0;
  riskPoints += input.assignmentRisk > 0.3 ? 2 : input.assignmentRisk > 0.2 ? 1 : 0;
  riskPoints += input.sectorExposure > 0.35 ? 1 : 0;
  riskPoints += input.tickerExposure > 0.15 ? 1 : 0;
  riskPoints += input.ivRank > 70 ? 1 : 0;
  riskPoints += input.earningsWindow ? 2 : 0;
  riskPoints += input.liquidityScore < 70 ? 1 : 0;

  reasoning.push(`Risk level starts at 1 and adds points for position size, assignment risk, concentration, IV, events, and liquidity.`);
  reasoning.push(`Position size ${(input.positionSizePercent * 100).toFixed(1)}%, cash reserve after trade ${(input.cashReserveAfterTrade / input.accountSize * 100).toFixed(1)}%.`);

  const riskLevel = Math.min(Math.max(riskPoints, 1), 10);
  return {
    riskLevel,
    confidence: hardBlocks.length ? "High" : riskLevel <= 3 ? "High" : riskLevel <= 6 ? "Medium" : "Low",
    status: hardBlocks.length ? "BLOCKED" : riskLevel <= 3 ? "APPROVED" : riskLevel <= 5 ? "WATCH" : "AVOID",
    hardBlocks,
    reasoning
  };
}

export function scoreTrade(input: RiskInput): RiskResult {
  const spreadPercent = bidAskSpreadPercent(input.bid, input.ask);
  const capitalRequired = cspCashRequirement(input.strike, 1);
  const allocationPercent = wheelCapitalAllocation(capitalRequired + input.existingExposure, input.accountSize);
  const cashReservePercent = input.cashReserveAfterTrade / input.accountSize;
  const hardBlocks: string[] = [];
  const reasons: string[] = [];
  let score = 1;

  if (allocationPercent > ACCOUNT_RULES.maxAllocationPerUnderlying) hardBlocks.push("Capital required exceeds 20% max allocation per underlying.");
  if (cashReservePercent < ACCOUNT_RULES.minCashReserve) hardBlocks.push("Cash reserve after trade would fall below 15%.");
  if (input.earningsBeforeExpiration && !input.earningsOverride) hardBlocks.push("Earnings occur before expiration without override.");
  if (input.delta > ACCOUNT_RULES.maxDelta) hardBlocks.push("Delta is above 0.35 hard limit.");
  if (input.dte > ACCOUNT_RULES.maxDte) hardBlocks.push("DTE is above 60-day hard limit.");
  if (input.openInterest < ACCOUNT_RULES.minOpenInterest) hardBlocks.push("Open interest is too low.");
  if (spreadPercent > ACCOUNT_RULES.maxSpreadPercent) hardBlocks.push("Bid/ask spread is too wide.");
  if ((ACCOUNT_RULES.blockedTickers as readonly string[]).includes(input.ticker)) hardBlocks.push("Ticker is on the blocked list.");
  if (!input.userWouldOwn || !input.assignmentReady) hardBlocks.push("Trade is not assignment-ready.");

  if (input.tickerQualityScore >= 80) score += 2;
  else if (input.tickerQualityScore >= 65) score += 1;
  else reasons.push("Ticker quality score is below preferred range.");

  if (input.ivRank >= ACCOUNT_RULES.minIvRank) score += 1;
  else reasons.push("IV Rank is below 20.");

  if (input.delta >= ACCOUNT_RULES.cspDeltaMin && input.delta <= ACCOUNT_RULES.cspDeltaMax) score += 1;
  else reasons.push("Delta is outside preferred 0.15 to 0.30 CSP range.");

  if (input.dte >= ACCOUNT_RULES.cspDteMin && input.dte <= ACCOUNT_RULES.cspDteMax) score += 1;
  else reasons.push("DTE is outside preferred 20 to 45 day range.");

  if (input.openInterest >= 500 && input.volume >= 100) score += 1;
  if (spreadPercent <= 0.06) score += 1;
  if (input.probabilityOfProfit >= 0.7 && input.probabilityOfProfit <= 0.85) score += 1;
  if (input.sectorConcentration <= 0.3) score += 1;

  if (input.marketRegime === "Bear market" && input.delta > 0.2) {
    score -= 2;
    reasons.push("Bear market regime prefers lower delta and smaller position size.");
  }

  score = Math.min(Math.max(score, 1), 10);

  const status: TradeStatus = hardBlocks.length
    ? "BLOCKED"
    : score >= 8
      ? "APPROVED"
      : score >= 6
        ? "WATCH"
        : score >= 4
          ? "AVOID"
          : "BLOCKED";

  const confidence: Confidence = score >= 8 && hardBlocks.length === 0 ? "High" : score >= 5 ? "Medium" : "Low";

  if (status === "APPROVED") reasons.push("Meets core liquidity, probability, allocation, and assignment readiness rules.");
  if (status === "WATCH") reasons.push("Candidate is usable for research, but one or more preferred rules need review.");

  return {
    score,
    confidence,
    status,
    reasons,
    hardBlocks,
    spreadPercent,
    capitalRequired,
    allocationPercent
  };
}

export function summarizeRecommendation(input: RiskInput) {
  const risk = scoreTrade(input);
  const netCostBasis = input.strike - input.premium / 100;
  return {
    tradeSummary: {
      ticker: input.ticker,
      currentPrice: input.currentPrice,
      marketRegime: input.marketRegime,
      stance: input.marketRegime === "Bear market" ? "Bearish" : input.marketRegime === "Bull market" ? "Bullish" : "Neutral"
    },
    cspCandidate: {
      strike: input.strike,
      expiration: input.expiration,
      delta: input.delta,
      premium: input.premium,
      annualizedYield: input.annualizedYield,
      probabilityOfProfit: input.probabilityOfProfit,
      capitalRequired: risk.capitalRequired,
      riskLevel: risk.score
    },
    assignmentScenario: {
      netCostBasis,
      breakEven: netCostBasis,
      longTermOutlook: input.tickerQualityScore >= 75 ? "Quality profile supports assignment-ready research." : "Quality profile needs deeper review before assignment.",
      coveredCallPlan: "If assigned, screen 20-45 DTE covered calls above adjusted cost basis."
    },
    exitPlan: {
      takeProfit: "Consider closing near 50% of max profit.",
      rollConditions: "Evaluate roll only when thesis remains intact and liquidity is acceptable.",
      assignmentConditions: "Accept assignment only when position size and cash reserve rules remain valid.",
      maximumLossScenario: "Underlying can fall substantially below break-even; cash-secured status does not remove stock ownership risk."
    },
    riskRating: risk.score,
    confidenceScore: risk.confidence,
    finalDecision: risk.status,
    reason: [...risk.hardBlocks, ...risk.reasons].join(" ")
  };
}
