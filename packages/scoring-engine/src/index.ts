import type { FundamentalAnalysis } from "@wheeldesk/fundamental-analysis";
import type { OptionAnalytics } from "@wheeldesk/options-engine";
import type { InstitutionalRiskResult } from "@wheeldesk/risk-engine";
import type { TechnicalAnalysis } from "@wheeldesk/technical-analysis";

export type WheelGrade = "A+" | "A" | "B" | "C" | "Avoid";

export type WheelScoreInput = {
  ticker: string;
  fundamentals: FundamentalAnalysis;
  technicals: TechnicalAnalysis;
  options: OptionAnalytics;
  risk: InstitutionalRiskResult;
  sectorStrengthScore: number;
  assignmentReadinessScore: number;
  positionSizeScore: number;
  cashReserveScore: number;
  eventScore: number;
};

export type WheelScoreResult = {
  ticker: string;
  wheelScore: number;
  grade: WheelGrade;
  components: {
    fundamentals: number;
    technicals: number;
    options: number;
    risk: number;
    liquidity: number;
    events: number;
  };
  explanation: string[];
};

export type RankedTrade = WheelScoreResult & {
  rank: number;
  riskLevel: number;
  annualizedYield: number;
  recommendation: "Strong Buy" | "Buy" | "Watch" | "Avoid" | "Blocked";
};

const clamp = (value: number) => Math.min(Math.max(Math.round(value), 0), 100);

function grade(score: number): WheelGrade {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "Avoid";
}

export function calculateWheelScore(input: WheelScoreInput): WheelScoreResult {
  const fundamentals = input.fundamentals.overallFundamentalScore;
  const technicals = input.technicals.score;
  const options = clamp(input.options.annualizedReturn * 180 + input.options.ivRank * 0.35 + input.assignmentReadinessScore * 0.25);
  const risk = clamp(100 - input.risk.riskLevel * 10);
  const liquidity = input.options.liquidityScore;
  const events = input.eventScore;
  const wheelScore = clamp(fundamentals * 0.3 + technicals * 0.2 + options * 0.2 + risk * 0.15 + liquidity * 0.1 + events * 0.05);

  return {
    ticker: input.ticker,
    wheelScore,
    grade: grade(wheelScore),
    components: { fundamentals, technicals, options, risk, liquidity, events },
    explanation: [
      `Wheel Score ${wheelScore} = fundamentals 30%, technicals 20%, options 20%, risk 15%, liquidity 10%, events 5%.`,
      `Fundamentals contributed ${Math.round(fundamentals * 0.3)} points from quality, growth, profitability, balance sheet, value, and moat.`,
      `Risk contributed ${Math.round(risk * 0.15)} points after hard-rule evaluation.`
    ]
  };
}

export function rankTrades(scores: Array<WheelScoreResult & { riskLevel: number; annualizedYield: number; blocked: boolean }>): RankedTrade[] {
  return [...scores]
    .sort((a, b) => b.wheelScore - a.wheelScore || a.riskLevel - b.riskLevel || b.annualizedYield - a.annualizedYield)
    .map((score, index) => ({
      ...score,
      rank: index + 1,
      recommendation: score.blocked ? "Blocked" : score.wheelScore >= 90 ? "Strong Buy" : score.wheelScore >= 80 ? "Buy" : score.wheelScore >= 70 ? "Watch" : "Avoid"
    }));
}
