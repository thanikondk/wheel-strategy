export function premiumYield(premium: number, capitalRequired: number) {
  return capitalRequired <= 0 ? 0 : premium / capitalRequired;
}

export function annualizedYield(premium: number, capitalRequired: number, dte: number) {
  return dte <= 0 ? 0 : premiumYield(premium, capitalRequired) * (365 / dte);
}

export function cspCashRequirement(strike: number, contracts: number) {
  return strike * 100 * contracts;
}

export function assignmentProbabilityFromDelta(delta: number) {
  return Math.min(Math.max(Math.abs(delta), 0), 1);
}

export function probabilityOfProfitFromDelta(delta: number) {
  return 1 - assignmentProbabilityFromDelta(delta);
}

export function costBasisAfterAssignment(strike: number, premiumPerShare: number, fees = 0) {
  return strike - premiumPerShare + fees / 100;
}

export function ivRank(currentIv: number, lowIv: number, highIv: number) {
  if (highIv <= lowIv) return 0;
  return ((currentIv - lowIv) / (highIv - lowIv)) * 100;
}

export function thetaDecayEstimate(optionPrice: number, dailyTheta: number, daysHeld: number) {
  return Math.max(optionPrice - Math.abs(dailyTheta) * daysHeld, 0);
}

export function wheelCapitalAllocation(capitalRequired: number, accountSize: number) {
  return accountSize <= 0 ? 0 : capitalRequired / accountSize;
}

export function coveredCallMaxProfit(strike: number, adjustedCostBasis: number, premiumPerShare: number, contracts: number) {
  return (strike - adjustedCostBasis + premiumPerShare) * 100 * contracts;
}

export function calledAwayReturn(strike: number, adjustedCostBasis: number, premiumPerShare: number) {
  return adjustedCostBasis <= 0 ? 0 : (strike - adjustedCostBasis + premiumPerShare) / adjustedCostBasis;
}

export function bidAskSpreadPercent(bid: number, ask: number) {
  const mid = (bid + ask) / 2;
  return mid <= 0 ? 1 : (ask - bid) / mid;
}

export function isLiquidOption(openInterest: number, volume: number, spreadPercent: number) {
  return openInterest >= 100 && volume >= 20 && spreadPercent <= 0.12;
}

export function positionSizeContracts(accountSize: number, maxAllocationPercent: number, strike: number) {
  const maxCapital = accountSize * maxAllocationPercent;
  return Math.floor(maxCapital / (strike * 100));
}

export function coveredCallVsDividend(callPremium: number, dividend: number) {
  return {
    premiumAdvantage: callPremium - dividend,
    premiumToDividendRatio: dividend <= 0 ? Number.POSITIVE_INFINITY : callPremium / dividend
  };
}

export function wheelExpectancy(probabilityProfit: number, averageWin: number, averageLoss: number) {
  return probabilityProfit * averageWin - (1 - probabilityProfit) * averageLoss;
}
