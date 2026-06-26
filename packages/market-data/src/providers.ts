import type { CompanyProfile, DividendEvent, EarningsEvent, EconomicEvent, FinancialMetrics, HistoricalBar, NewsItem, NewsSentiment, NormalizedOptionContract, Quote } from "./models";

export interface StockDataProvider {
  getQuote(ticker: string): Promise<Quote>;
  getHistoricalPrices(ticker: string, years?: number): Promise<HistoricalBar[]>;
  getDailyBars(ticker: string, start: string, end: string): Promise<HistoricalBar[]>;
  getIntradayBars(ticker: string, interval: "1m" | "5m" | "15m" | "1h"): Promise<HistoricalBar[]>;
  getTechnicalIndicators(ticker: string): Promise<Record<string, number>>;
}

export interface OptionsDataProvider {
  getExpirations(ticker: string): Promise<string[]>;
  getOptionChain(ticker: string, expiration: string): Promise<NormalizedOptionContract[]>;
  getGreeks(contractSymbol: string): Promise<Pick<NormalizedOptionContract, "delta" | "gamma" | "theta" | "vega" | "rho">>;
  getOpenInterest(contractSymbol: string): Promise<number>;
  getImpliedVolatility(contractSymbol: string): Promise<number>;
  getExpectedMove(ticker: string, expiration: string): Promise<number>;
}

export interface FundamentalProvider {
  getCompanyProfile(ticker: string): Promise<CompanyProfile>;
  getIncomeStatement(ticker: string): Promise<Record<string, number>[]>;
  getBalanceSheet(ticker: string): Promise<Record<string, number>[]>;
  getCashFlow(ticker: string): Promise<Record<string, number>[]>;
  getKeyMetrics(ticker: string): Promise<FinancialMetrics>;
  getGrowthMetrics(ticker: string): Promise<Pick<FinancialMetrics, "revenueGrowth" | "earningsGrowth">>;
  getRatios(ticker: string): Promise<Partial<FinancialMetrics>>;
}

export interface EventProvider {
  getEarningsCalendar(tickers: string[], from: string, to: string): Promise<EarningsEvent[]>;
  getDividendCalendar(tickers: string[], from: string, to: string): Promise<DividendEvent[]>;
  getEconomicCalendar(from: string, to: string): Promise<EconomicEvent[]>;
}

export interface NewsProvider {
  getLatestNews(ticker: string): Promise<NewsItem[]>;
  getSentiment(ticker: string): Promise<NewsSentiment>;
}

export type MarketDataProvider = StockDataProvider & OptionsDataProvider & FundamentalProvider & EventProvider & NewsProvider;
