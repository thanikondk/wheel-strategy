export type TradeStatus = "APPROVED" | "WATCH" | "AVOID" | "BLOCKED";
export type Confidence = "Low" | "Medium" | "High";
export type MarketRegime = "Bull market" | "Correction" | "Bear market" | "Sideways";

export type WatchlistTier = "Tier 1" | "Tier 2";

export type StockSnapshot = {
  ticker: string;
  name: string;
  sector: string;
  tier: WatchlistTier;
  price: number;
  movingAverage50: number;
  movingAverage200: number;
  rsi: number;
  macdTrend: "Bullish" | "Neutral" | "Bearish";
  support: number;
  resistance: number;
  earningsDate: string;
  marketCapBillions: number;
  revenueGrowth: number;
  freeCashFlowBillions: number;
  debtToEquity: number;
  roic: number;
  grossMargin: number;
  operatingMargin: number;
  peg: number;
  moatScore: number;
  wheelQualityScore: number;
  liquidityScore: number;
  eventRiskScore: number;
};

export type OptionCandidate = {
  ticker: string;
  sector: string;
  currentPrice: number;
  expiration: string;
  dte: number;
  strike: number;
  delta: number;
  bid: number;
  ask: number;
  mid: number;
  premium: number;
  iv: number;
  ivRank: number;
  openInterest: number;
  volume: number;
  probabilityOfProfit: number;
  annualizedYield: number;
  earningsBeforeExpiration: boolean;
  userWouldOwn: boolean;
};

export type CoveredCallCandidate = OptionCandidate & {
  contractsOwned: number;
  costBasis: number;
  adjustedCostBasis: number;
  maxProfit: number;
  calledAwayReturn: number;
};

export type TradeEvent = {
  id: string;
  date: string;
  ticker: string;
  strategy: "CSP" | "Covered Call" | "Shares" | "Dividend" | "Adjustment";
  action:
    | "CSP opened"
    | "CSP closed"
    | "CSP expired"
    | "CSP assigned"
    | "Shares acquired"
    | "Covered call opened"
    | "Covered call closed"
    | "Covered call expired"
    | "Shares called away"
    | "Roll up"
    | "Roll out"
    | "Roll down"
    | "Dividend received"
    | "Manual adjustment";
  expiration?: string;
  strike?: number;
  contracts: number;
  premium: number;
  fees: number;
  dte?: number;
  delta?: number;
  ivRank?: number;
  thesis: string;
  exitPlan: string;
  result?: string;
  lesson?: string;
  tags: string[];
};

export type AccountSnapshot = {
  accountValue: number;
  cashAvailable: number;
  cashReservePercent: number;
  premiumCollectedMtd: number;
  premiumCollectedYtd: number;
  openCsps: number;
  assignedShares: number;
  coveredCalls: number;
  realizedPnl: number;
  unrealizedPnl: number;
  capitalAtRisk: number;
};
