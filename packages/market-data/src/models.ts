export type OptionType = "call" | "put";

export type Quote = {
  ticker: string;
  price: number;
  change: number;
  percentChange: number;
  bid: number;
  ask: number;
  volume: number;
  marketCap: number;
  timestamp: string;
};

export type HistoricalBar = {
  date: string;
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
  intrinsicValue: number;
  extrinsicValue: number;
  breakEven: number;
  probabilityITM: number;
  probabilityOTM: number;
};

export type CompanyProfile = {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  employees: number;
  country: string;
  marketCap: number;
  beta: number;
  dividendYield: number;
  ceo: string;
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
  forwardPe: number;
  trailingPe: number;
  freeCashFlow: number;
  currentRatio: number;
  quickRatio: number;
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
