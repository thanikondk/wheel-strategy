import { annualizedYield, bidAskSpreadPercent, calledAwayReturn, coveredCallMaxProfit, cspCashRequirement } from "@wheeldesk/calculators";
import { DECISION_THRESHOLDS, RISK_LIMITS } from "@wheeldesk/core";
import type { TradeStatus } from "@wheeldesk/core";
import type { NormalizedOptionContract, Quote } from "@wheeldesk/market-data";
import { evaluateInstitutionalRisk } from "@wheeldesk/risk-engine";

export type ExplainableDecision = {
  finalDecision: TradeStatus;
  summary: string;
  supportingCalculations: Record<string, number | string | boolean>;
  positiveFactors: string[];
  negativeFactors: string[];
  hardRuleViolations: string[];
  riskWarnings: string[];
  reasoning: string[];
  whatCouldGoWrong: string[];
  exitPlan: string[];
};

export type CspDecisionInput = {
  quote: Quote;
  contract: NormalizedOptionContract;
  dte: number;
  accountSize: number;
  cashAvailable: number;
  existingTickerExposure: number;
  wheelScore: number;
  riskScore: number;
  earningsRisk: boolean;
  assignmentReady: boolean;
  fundamentalScore: number;
  liquidityScore: number;
  ivRank: number;
  sectorExposure: number;
};

export type CoveredCallDecisionInput = {
  quote: Quote;
  contract: NormalizedOptionContract;
  dte: number;
  currentShares: number;
  adjustedCostBasis: number;
  wheelScore: number;
  riskScore: number;
};

function statusFrom(hardBlocks: string[], riskScore: number, wheelScore: number): TradeStatus {
  if (hardBlocks.length > 0) return "BLOCKED";
  if (riskScore > DECISION_THRESHOLDS.watchMaxRiskScore || wheelScore < DECISION_THRESHOLDS.avoidBelowWheelScore) return "AVOID";
  if (riskScore > DECISION_THRESHOLDS.approvedMaxRiskScore || wheelScore < DECISION_THRESHOLDS.approvedMinWheelScore) return "WATCH";
  return "APPROVED";
}

export function decideCashSecuredPut(input: CspDecisionInput): ExplainableDecision {
  const premiumIncome = input.contract.mark * 100;
  const capitalRequired = cspCashRequirement(input.contract.strike, 1);
  const spreadPercent = bidAskSpreadPercent(input.contract.bid, input.contract.ask);
  const netCostBasis = input.contract.strike - input.contract.mark;
  const annualized = annualizedYield(premiumIncome, capitalRequired, input.dte);
  const allocation = (capitalRequired + input.existingTickerExposure) / input.accountSize;
  const risk = evaluateInstitutionalRisk({
    ticker: input.contract.ticker,
    accountSize: input.accountSize,
    capitalRequired,
    cashReserveAfterTrade: input.cashAvailable - capitalRequired,
    sectorExposure: input.sectorExposure,
    tickerExposure: allocation,
    assignmentRisk: Math.abs(input.contract.delta),
    liquidityScore: input.liquidityScore,
    ivRank: input.ivRank,
    earningsWindow: input.earningsRisk,
    spreadPercent,
    positionSizePercent: capitalRequired / input.accountSize,
    fundamentalScore: input.fundamentalScore,
    userWouldOwn: input.assignmentReady,
    dte: input.dte,
    delta: input.contract.delta,
    openInterest: input.contract.openInterest,
    volume: input.contract.volume
  });
  const hardRuleViolations = risk.hardBlocks;
  const finalDecision = statusFrom(hardRuleViolations, risk.riskLevel, input.wheelScore);

  return {
    finalDecision,
    summary: `${input.contract.ticker} ${input.contract.expiration} ${input.contract.strike}P decision is ${finalDecision}.`,
    supportingCalculations: {
      capitalRequired,
      premiumIncome,
      netCostBasis,
      breakEven: input.contract.breakEven,
      distanceOTM: (input.quote.price - input.contract.strike) / input.quote.price,
      annualizedYield: annualized,
      probabilityOfProfit: input.contract.probabilityOTM,
      probabilityOfAssignment: Math.abs(input.contract.delta),
      spreadPercent,
      liquidityScore: Math.max(0, Math.min(100, input.contract.openInterest / 20 + input.contract.volume / 5)),
      earningsRisk: input.earningsRisk,
      assignmentReadiness: input.assignmentReady,
      riskScore: risk.riskLevel,
      wheelScore: input.wheelScore
    },
    positiveFactors: [
      ...(input.contract.probabilityOTM >= 0.7 ? ["Probability of profit is inside the target range."] : []),
      ...(annualized >= RISK_LIMITS.annualReturnTargetMin && annualized <= RISK_LIMITS.annualReturnTargetMax ? ["Annualized yield is within the research target band."] : []),
      ...(spreadPercent <= RISK_LIMITS.preferredSpreadPercent ? ["Spread is tight."] : [])
    ],
    negativeFactors: [
      ...(annualized > RISK_LIMITS.annualReturnTargetMax ? ["Yield is high enough to require extra skepticism."] : []),
      ...(Math.abs(input.contract.delta) > RISK_LIMITS.cspDeltaMax ? ["Delta is above the preferred CSP range."] : []),
      ...(input.wheelScore < DECISION_THRESHOLDS.approvedMinWheelScore ? ["Wheel Score is below approval threshold."] : [])
    ],
    hardRuleViolations,
    riskWarnings: ["Assignment can happen at any time before expiration.", "Maximum loss approaches the strike less premium if the underlying falls sharply."],
    reasoning: [`Decision combines hard blocks, risk score ${risk.riskLevel}/10, and Wheel Score ${input.wheelScore}/100.`, ...risk.reasoning],
    whatCouldGoWrong: ["Underlying gaps below break-even.", "Volatility expands after entry.", "Liquidity disappears when adjustment is needed.", "Earnings or macro events reprice the stock."],
    exitPlan: ["Consider taking profit near 50% of max premium.", "Reassess at 14 DTE.", "Accept assignment only if allocation and cash reserve remain valid."]
  };
}

export function decideCoveredCall(input: CoveredCallDecisionInput): ExplainableDecision {
  const premiumIncome = input.contract.mark * 100;
  const strikeAboveCostBasis = input.contract.strike >= input.adjustedCostBasis;
  const maxProfit = coveredCallMaxProfit(input.contract.strike, input.adjustedCostBasis, input.contract.mark, 1);
  const annualized = annualizedYield(premiumIncome, input.adjustedCostBasis * 100, input.dte);
  const calledReturn = calledAwayReturn(input.contract.strike, input.adjustedCostBasis, input.contract.mark);
  const hardRuleViolations = [
    ...(input.currentShares < 100 ? ["Covered call requires at least 100 shares."] : []),
    ...(!strikeAboveCostBasis ? ["Strike is below adjusted cost basis."] : [])
  ];
  const finalDecision = statusFrom(hardRuleViolations, input.riskScore, input.wheelScore);

  return {
    finalDecision,
    summary: `${input.contract.ticker} ${input.contract.expiration} ${input.contract.strike}C decision is ${finalDecision}.`,
    supportingCalculations: {
      currentShares: input.currentShares,
      adjustedCostBasis: input.adjustedCostBasis,
      strikeAboveCostBasis,
      premiumIncome,
      maxProfit,
      calledAwayReturn: calledReturn,
      annualizedYield: annualized,
      downsideRisk: Math.max(input.adjustedCostBasis - input.contract.mark, 0),
      upsideGiveaway: Math.max(input.quote.price - input.contract.strike, 0),
      riskScore: input.riskScore,
      wheelScore: input.wheelScore
    },
    positiveFactors: [...(strikeAboveCostBasis ? ["Strike protects adjusted cost basis."] : []), ...(annualized >= 0.08 ? ["Premium is meaningful relative to basis."] : [])],
    negativeFactors: [...(!strikeAboveCostBasis ? ["Call risks locking in a below-basis exit."] : [])],
    hardRuleViolations,
    riskWarnings: ["Shares may be called away if price closes above strike.", "Covered calls cap upside while downside remains stock ownership risk."],
    reasoning: [`Decision combines cost basis protection, risk score ${input.riskScore}/10, and Wheel Score ${input.wheelScore}/100.`],
    whatCouldGoWrong: ["Stock rallies far above strike.", "Stock sells off more than premium collected.", "Early assignment around dividend risk."],
    exitPlan: ["Consider closing near 50% premium capture.", "Roll only if thesis and liquidity remain intact.", "Do not roll into a lower-quality risk profile."]
  };
}
