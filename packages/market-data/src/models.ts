export type OptionType = "call" | "put";

export type Quote = {
  ticker: string;
  price: number;
  change: number;
  percentChange: number;
  bid: number;
  ask: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  timestamp: string;
};

export type HistoricalBar = {
  ticker: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type NormalizedOptionContract = {
  ticker: string;
  expiration: string;
  strike: number;
  type: OptionType;
  bid: number;
  ask: number;
  last: number;
  mark: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  iv: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  intrinsicValue: number;
  extrinsicValue: number;
  breakEven: number;
  probabilityITM: number;
  probabilityOTM: number;
  timestamp: string;
};

export type CompanyProfile = {
  ticker: string;
  companyName: string;
  sector: string;
  industry: string;
  marketCap: number;
  beta: number;
  dividendYield: number;
  country: string;
  exchange: string;
};

export type FinancialMetrics = {
  ticker: string;
  revenueGrowth: number;
  earningsGrowth: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roic: number;
  roe: number;
  roa: number;
  debtToEquity: number;
  peg: number;
  forwardPE: number;
  trailingPE: number;
  freeCashFlow: number;
  currentRatio: number;
  quickRatio: number;
};

export type TechnicalSnapshot = {
  ticker: string;
  price: number;
  sma20: number;
  sma50: number;
  sma100: number;
  sma200: number;
  rsi14: number;
  macd: number;
  macdSignal: number;
  atr14: number;
  adx14: number;
  bollingerUpper: number;
  bollingerLower: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  support: number;
  resistance: number;
  trendDirection: "Bullish" | "Neutral" | "Bearish";
  volumeTrend: "Rising" | "Stable" | "Falling";
};

export type EarningsEvent = {
  ticker: string;
  date: string;
  time: "before_open" | "after_close" | "unknown";
};

export type DividendEvent = {
  ticker: string;
  exDate: string;
  payDate: string;
  amount: number;
};

export type EconomicEvent = {
  name: string;
  date: string;
  importance: "low" | "medium" | "high";
};

export type NewsItem = {
  ticker: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
};

export type NewsSentiment = {
  ticker: string;
  score: number;
  label: "negative" | "neutral" | "positive";
  reasoning: string[];
};

export type ProviderHealth = {
  provider: string;
  ok: boolean;
  latencyMs: number;
  checkedAt: string;
  error?: string;
};
