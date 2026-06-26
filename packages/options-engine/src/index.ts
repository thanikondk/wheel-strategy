import { annualizedYield, bidAskSpreadPercent, cspCashRequirement } from "@wheeldesk/calculators";
import type { NormalizedOptionContract, Quote } from "@wheeldesk/market-data";

export type OptionAnalytics = {
  annualizedReturn: number;
  premiumYield: number;
  capitalRequired: number;
  netCostBasis: number;
  breakEven: number;
  distanceOtm: number;
  expectedMove: number;
  probabilityOfAssignment: number;
  extrinsicPercent: number;
  intrinsicPercent: number;
  thetaDecayEstimate: number;
  ivPercentile: number;
  ivRank: number;
  liquidityScore: number;
  spreadPercent: number;
  openInterestScore: number;
  volumeScore: number;
  riskRewardRatio: number;
  explanation: string[];
};

const clamp = (value: number) => Math.min(Math.max(Math.round(value), 0), 100);

export function analyzeOption(contract: NormalizedOptionContract, quote: Quote, dte: number, expectedMove: number, ivLow = 0.15, ivHigh = 0.8): OptionAnalytics {
  const capitalRequired = cspCashRequirement(contract.strike, 1);
  const premium = contract.mark * 100;
  const spreadPercent = bidAskSpreadPercent(contract.bid, contract.ask);
  const premiumYield = premium / capitalRequired;
  const intrinsicPercent = contract.mark <= 0 ? 0 : contract.intrinsicValue / contract.mark;
  const extrinsicPercent = contract.mark <= 0 ? 0 : contract.extrinsicValue / contract.mark;
  const ivRank = ivHigh <= ivLow ? 0 : ((contract.iv - ivLow) / (ivHigh - ivLow)) * 100;
  const openInterestScore = clamp(contract.openInterest / 20);
  const volumeScore = clamp(contract.volume / 5);
  const liquidityScore = clamp(openInterestScore * 0.45 + volumeScore * 0.35 + (100 - spreadPercent * 500) * 0.2);
  const probabilityOfAssignment = Math.abs(contract.delta);
  const maxLoss = contract.strike * 100 - premium;
  const riskRewardRatio = premium <= 0 ? 0 : maxLoss / premium;

  return {
    annualizedReturn: annualizedYield(premium, capitalRequired, dte),
    premiumYield,
    capitalRequired,
    netCostBasis: contract.strike - contract.mark,
    breakEven: contract.breakEven,
    distanceOtm: (quote.price - contract.strike) / quote.price,
    expectedMove,
    probabilityOfAssignment,
    extrinsicPercent,
    intrinsicPercent,
    thetaDecayEstimate: Math.abs(contract.theta) * Math.min(dte, 14),
    ivPercentile: clamp(contract.iv * 100),
    ivRank: clamp(ivRank),
    liquidityScore,
    spreadPercent,
    openInterestScore,
    volumeScore,
    riskRewardRatio,
    explanation: [
      `Annualized return uses premium ${premium.toFixed(2)}, collateral ${capitalRequired.toFixed(2)}, and ${dte} DTE.`,
      `Liquidity score ${liquidityScore} blends open interest, volume, and bid/ask spread.`,
      `Assignment probability uses absolute delta ${Math.abs(contract.delta).toFixed(2)} as a transparent proxy.`
    ]
  };
}
