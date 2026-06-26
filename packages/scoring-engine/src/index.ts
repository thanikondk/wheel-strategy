import type { FundamentalAnalysis } from "@wheeldesk/fundamental-analysis";
import { DECISION_THRESHOLDS, WHEEL_SCORE_RUBRIC } from "@wheeldesk/core";
import type { TradeStatus } from "@wheeldesk/core";
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
  finalDecision?: TradeStatus;
  recommendation: "Strong Buy" | "Buy" | "Watch" | "Avoid" | "Blocked";
};

const clamp = (value: number) => Math.min(Math.max(Math.round(value), 0), 100);

function grade(score: number): WheelGrade {
  if (score >= WHEEL_SCORE_RUBRIC.grades.aPlus) return "A+";
  if (score >= WHEEL_SCORE_RUBRIC.grades.a) return "A";
  if (score >= WHEEL_SCORE_RUBRIC.grades.b) return "B";
  if (score >= WHEEL_SCORE_RUBRIC.grades.c) return "C";
  return "Avoid";
}

export function calculateWheelScore(input: WheelScoreInput): WheelScoreResult {
  const fundamentals = input.fundamentals.overallFundamentalScore;
  const technicals = input.technicals.score;
  const options = clamp(
    input.options.annualizedReturn * WHEEL_SCORE_RUBRIC.optionScore.annualizedReturnMultiplier +
    input.options.ivRank * WHEEL_SCORE_RUBRIC.optionScore.ivRankMultiplier +
    input.assignmentReadinessScore * WHEEL_SCORE_RUBRIC.optionScore.assignmentReadinessMultiplier
  );
  const risk = clamp(100 - input.risk.riskLevel * 10);
  const liquidity = input.options.liquidityScore;
  const events = input.eventScore;
  const weights = WHEEL_SCORE_RUBRIC.weights;
  const wheelScore = clamp(fundamentals * weights.fundamentals + technicals * weights.technicals + options * weights.options + risk * weights.risk + liquidity * weights.liquidity + events * weights.events);

  return {
    ticker: input.ticker,
    wheelScore,
    grade: grade(wheelScore),
    components: { fundamentals, technicals, options, risk, liquidity, events },
    explanation: [
      `Wheel Score ${wheelScore} = fundamentals 30%, technicals 20%, options 20%, risk 15%, liquidity 10%, events 5%.`,
      `Fundamentals contributed ${Math.round(fundamentals * 0.3)} points from quality, growth, profitability, balance sheet, value, and moat.`,
      `Risk contributed ${Math.round(risk * 0.15)} points after hard-rule evaluation.`,
      WHEEL_SCORE_RUBRIC.probabilityMethod
    ]
  };
}

export function rankTrades(scores: Array<WheelScoreResult & { riskLevel: number; annualizedYield: number; blocked: boolean; finalDecision?: TradeStatus }>): RankedTrade[] {
  return [...scores]
    .sort((a, b) => b.wheelScore - a.wheelScore || a.riskLevel - b.riskLevel || b.annualizedYield - a.annualizedYield)
    .map((score, index) => ({
      ...score,
      rank: index + 1,
      recommendation: score.blocked ? "Blocked" : score.wheelScore >= DECISION_THRESHOLDS.strongBuyMinScore ? "Strong Buy" : score.wheelScore >= DECISION_THRESHOLDS.buyMinScore ? "Buy" : score.wheelScore >= DECISION_THRESHOLDS.watchMinScore ? "Watch" : "Avoid"
    }));
}
