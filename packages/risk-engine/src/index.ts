import { RISK_LIMITS } from "@wheeldesk/core";
import type { Confidence, TradeStatus } from "@wheeldesk/core";

export type InstitutionalRiskInput = {
  ticker: string;
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
  dte?: number;
  delta?: number;
  openInterest?: number;
  volume?: number;
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

  if (input.capitalRequired / input.accountSize > RISK_LIMITS.maxAllocationPerUnderlying) hardBlocks.push("Capital exceeds 20% account allocation.");
  if (input.cashReserveAfterTrade / input.accountSize < RISK_LIMITS.minCashReserve) hardBlocks.push("Cash reserve would fall below 15%.");
  if (input.liquidityScore < RISK_LIMITS.lowLiquidityScore) hardBlocks.push("Low liquidity.");
  if (input.spreadPercent > RISK_LIMITS.maxSpreadPercent) hardBlocks.push("Wide bid/ask spread.");
  if (input.fundamentalScore < RISK_LIMITS.poorFundamentalScore) hardBlocks.push("Poor fundamentals.");
  if (!input.userWouldOwn) hardBlocks.push("User marked stock as would not own.");
  if (input.earningsWindow && !input.earningsOverride) hardBlocks.push("Upcoming earnings inside configured window.");
  if ((RISK_LIMITS.blockedTickers as readonly string[]).includes(input.ticker)) hardBlocks.push("Ticker is on the blocked list.");
  if (input.delta !== undefined && Math.abs(input.delta) > RISK_LIMITS.hardMaxDelta) hardBlocks.push("Delta exceeds hard maximum.");
  if (input.dte !== undefined && input.dte > RISK_LIMITS.hardMaxDte) hardBlocks.push("DTE exceeds hard maximum.");
  if (input.openInterest !== undefined && input.openInterest < RISK_LIMITS.minOpenInterest) hardBlocks.push("Open interest is below minimum.");
  if (input.volume !== undefined && input.volume < RISK_LIMITS.minVolume) hardBlocks.push("Volume is below minimum.");
  if (input.ivRank < RISK_LIMITS.minIvRank) hardBlocks.push("IV Rank is below minimum.");

  riskPoints += input.positionSizePercent > 0.15 ? 2 : 0;
  riskPoints += input.assignmentRisk > 0.3 ? 2 : input.assignmentRisk > 0.2 ? 1 : 0;
  riskPoints += input.sectorExposure > 0.35 ? 1 : 0;
  riskPoints += input.tickerExposure > 0.15 ? 1 : 0;
  riskPoints += input.ivRank > 70 ? 1 : 0;
  riskPoints += input.earningsWindow ? 2 : 0;
  riskPoints += input.liquidityScore < RISK_LIMITS.softLiquidityScore ? 1 : 0;

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
