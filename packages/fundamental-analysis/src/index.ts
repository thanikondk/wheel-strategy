import type { CompanyProfile, FinancialMetrics } from "@wheeldesk/market-data";

export type FundamentalAnalysis = {
  qualityScore: number;
  growthScore: number;
  valueScore: number;
  profitabilityScore: number;
  balanceSheetScore: number;
  moatScore: number;
  dividendSafetyScore: number;
  overallFundamentalScore: number;
  explanation: string[];
};

function clamp(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

export function analyzeFundamentals(profile: CompanyProfile, metrics: FinancialMetrics): FundamentalAnalysis {
  const growthScore = clamp((metrics.revenueGrowth * 220) + (metrics.earningsGrowth * 180) + 45);
  const profitabilityScore = clamp(metrics.grossMargin * 45 + metrics.operatingMargin * 120 + metrics.roic * 180 + 20);
  const balanceSheetScore = clamp(90 - metrics.debtToEquity * 22 + metrics.currentRatio * 8 + metrics.quickRatio * 5);
  const valueScore = clamp(85 - metrics.peg * 12 - metrics.forwardPE * 0.6 + metrics.freeCashFlow / 1_000_000_000);
  const moatScore = clamp(profile.marketCap / 25_000_000_000 + profitabilityScore * 0.55 + balanceSheetScore * 0.25);
  const dividendSafetyScore = clamp((profile.dividendYield > 0 ? 55 : 45) + balanceSheetScore * 0.25 + metrics.freeCashFlow / 2_000_000_000);
  const qualityScore = clamp(profitabilityScore * 0.45 + balanceSheetScore * 0.3 + growthScore * 0.15 + moatScore * 0.1);
  const overallFundamentalScore = clamp(qualityScore * 0.35 + profitabilityScore * 0.2 + balanceSheetScore * 0.15 + growthScore * 0.15 + valueScore * 0.1 + moatScore * 0.05);
  const explanation = [
    `Quality score ${qualityScore} blends profitability, balance sheet, growth, and moat.`,
    `Growth score ${growthScore} uses revenue and earnings growth.`,
    `Balance sheet score ${balanceSheetScore} penalizes high debt-to-equity and rewards liquidity.`
  ];

  return { qualityScore, growthScore, valueScore, profitabilityScore, balanceSheetScore, moatScore, dividendSafetyScore, overallFundamentalScore, explanation };
}
