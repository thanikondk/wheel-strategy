export const ACCOUNT_RULES = {
  accountSize: 20_000,
  monthlyPremiumTargetMin: 0.01,
  monthlyPremiumTargetMax: 0.02,
  annualReturnTargetMin: 0.12,
  annualReturnTargetMax: 0.25,
  maxAllocationPerUnderlying: 0.2,
  preferredAllocationMin: 0.1,
  preferredAllocationMax: 0.15,
  minCashReserve: 0.15,
  preferredCashReserveMax: 0.3,
  cspDteMin: 20,
  cspDteMax: 45,
  cspDeltaMin: 0.15,
  cspDeltaMax: 0.3,
  maxDelta: 0.35,
  maxDte: 60,
  minIvRank: 20,
  minOpenInterest: 100,
  minVolume: 20,
  maxSpreadPercent: 0.12,
  earningsAvoidanceDays: 7,
  blockedTickers: ["GME", "AMC", "BBBY", "NKLA", "BILI", "NIO", "XPEV", "LI"]
} as const;

export const RISK_LIMITS = {
  accountSize: 20_000,
  annualReturnTargetMin: 0.12,
  annualReturnTargetMax: 0.25,
  maxAllocationPerUnderlying: 0.2,
  preferredAllocationMin: 0.1,
  preferredAllocationMax: 0.15,
  minCashReserve: 0.15,
  targetCashReserveMin: 0.15,
  targetCashReserveMax: 0.3,
  cspDteMin: 20,
  cspDteMax: 45,
  cspDeltaMin: 0.15,
  cspDeltaMax: 0.3,
  hardMaxDelta: 0.35,
  hardMaxDte: 60,
  minIvRank: 20,
  minOpenInterest: 100,
  preferredOpenInterest: 500,
  minVolume: 20,
  preferredVolume: 100,
  maxSpreadPercent: 0.12,
  preferredSpreadPercent: 0.06,
  earningsAvoidanceDays: 7,
  poorFundamentalScore: 50,
  lowLiquidityScore: 45,
  softLiquidityScore: 70,
  blockedTickers: ["GME", "AMC", "BBBY", "NKLA", "BILI", "NIO", "XPEV", "LI"]
} as const;

export const DECISION_THRESHOLDS = {
  approvedMinWheelScore: 75,
  approvedMaxRiskScore: 4,
  watchMinWheelScore: 60,
  watchMaxRiskScore: 6,
  avoidBelowWheelScore: 60,
  strongBuyMinScore: 90,
  buyMinScore: 80,
  watchMinScore: 70
} as const;

export const WHEEL_SCORE_RUBRIC = {
  weights: {
    fundamentals: 0.3,
    technicals: 0.2,
    options: 0.2,
    risk: 0.15,
    liquidity: 0.1,
    events: 0.05
  },
  optionScore: {
    annualizedReturnMultiplier: 180,
    ivRankMultiplier: 0.35,
    assignmentReadinessMultiplier: 0.25
  },
  grades: {
    aPlus: 95,
    a: 85,
    b: 75,
    c: 60
  },
  probabilityMethod: "Delta proxy: PoP = 1 - abs(delta); assignment probability = abs(delta). This is transparent and intentionally conservative until full IV/lognormal modeling is implemented."
} as const;

export const DISCLAIMER =
  "This application is for education and personal research only. It is not financial advice. Options involve risk and may result in substantial losses.";

export const APPROVED_LANGUAGE = [
  "risk-managed",
  "assignment-ready",
  "capital-preservation-first",
  "high-probability income strategy",
  "educational use only"
] as const;

export const DEFAULT_WATCHLIST_TIERS = {
  tier1: ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "AVGO", "AMD", "QCOM", "JPM", "BAC", "COST", "HD", "UNH", "JNJ", "PEP", "KO", "MCD", "SBUX", "O", "SCHD"],
  tier2: ["PLTR", "SOFI", "INTC", "MU", "PANW", "CRWD", "ORCL", "ADBE", "NFLX", "UBER", "TTD"]
} as const;
