import { cspCandidates, stocks } from "@wheeldesk/core";
import type { MarketDataProvider } from "../providers";
import type { CompanyProfile, DividendEvent, EarningsEvent, EconomicEvent, FinancialMetrics, HistoricalBar, NewsItem, NewsSentiment, NormalizedOptionContract, Quote } from "../models";

function findStock(ticker: string) {
  const stock = stocks.find((item) => item.ticker === ticker.toUpperCase());
  if (!stock) throw new Error(`No mock stock found for ${ticker}`);
  return stock;
}

export class MockInstitutionalDataProvider implements MarketDataProvider {
  async getQuote(ticker: string): Promise<Quote> {
    const stock = findStock(ticker);
    return {
      ticker: stock.ticker,
      price: stock.price,
      change: Number((stock.price * 0.006).toFixed(2)),
      percentChange: 0.006,
      bid: Number((stock.price - 0.03).toFixed(2)),
      ask: Number((stock.price + 0.03).toFixed(2)),
      volume: 8_500_000,
      marketCap: stock.marketCapBillions * 1_000_000_000,
      timestamp: new Date().toISOString()
    };
  }

  async getHistoricalPrices(ticker: string, years = 1): Promise<HistoricalBar[]> {
    const stock = findStock(ticker);
    const days = Math.max(252 * years, 252);
    return Array.from({ length: days }, (_, index) => {
      const drift = (index - days) / days;
      const close = Number((stock.price * (1 + drift * 0.18 + Math.sin(index / 11) * 0.025)).toFixed(2));
      return {
        date: new Date(Date.now() - (days - index) * 86_400_000).toISOString().slice(0, 10),
        open: Number((close * 0.995).toFixed(2)),
        high: Number((close * 1.015).toFixed(2)),
        low: Number((close * 0.985).toFixed(2)),
        close,
        volume: 4_000_000 + index * 1000
      };
    });
  }

  async getDailyBars(ticker: string, _start: string, _end: string) {
    return this.getHistoricalPrices(ticker, 1);
  }

  async getIntradayBars(ticker: string) {
    return (await this.getHistoricalPrices(ticker, 1)).slice(-78);
  }

  async getTechnicalIndicators(ticker: string) {
    const stock = findStock(ticker);
    return { sma50: stock.movingAverage50, sma200: stock.movingAverage200, rsi: stock.rsi };
  }

  async getExpirations() {
    return ["2026-07-24", "2026-07-31", "2026-08-21"];
  }

  async getOptionChain(ticker: string, expiration: string): Promise<NormalizedOptionContract[]> {
    const quote = await this.getQuote(ticker);
    return cspCandidates
      .filter((candidate) => candidate.ticker === ticker.toUpperCase() || ticker === "ALL")
      .map((candidate) => {
        const intrinsicValue = Math.max(candidate.strike - quote.price, 0);
        const extrinsicValue = Math.max(candidate.mid - intrinsicValue, 0);
        return {
          ticker: candidate.ticker,
          expiration: expiration || candidate.expiration,
          strike: candidate.strike,
          type: "put",
          bid: candidate.bid,
          ask: candidate.ask,
          last: candidate.mid,
          mark: candidate.mid,
          delta: -Math.abs(candidate.delta),
          gamma: 0.03,
          theta: -0.04,
          vega: 0.11,
          rho: -0.02,
          iv: candidate.iv,
          volume: candidate.volume,
          openInterest: candidate.openInterest,
          intrinsicValue,
          extrinsicValue,
          breakEven: candidate.strike - candidate.mid,
          probabilityITM: Math.abs(candidate.delta),
          probabilityOTM: 1 - Math.abs(candidate.delta)
        };
      });
  }

  async getGreeks() {
    return { delta: -0.24, gamma: 0.03, theta: -0.04, vega: 0.11, rho: -0.02 };
  }

  async getOpenInterest() {
    return 1400;
  }

  async getImpliedVolatility() {
    return 0.38;
  }

  async getExpectedMove(ticker: string) {
    const quote = await this.getQuote(ticker);
    return Number((quote.price * 0.055).toFixed(2));
  }

  async getCompanyProfile(ticker: string): Promise<CompanyProfile> {
    const stock = findStock(ticker);
    return {
      ticker: stock.ticker,
      name: stock.name,
      sector: stock.sector,
      industry: stock.sector,
      employees: 100_000,
      country: "US",
      marketCap: stock.marketCapBillions * 1_000_000_000,
      beta: 1.08,
      dividendYield: stock.ticker === "SCHD" ? 0.036 : 0.008,
      ceo: "Mock CEO"
    };
  }

  async getIncomeStatement() {
    return [{ revenue: 100_000_000_000, netIncome: 24_000_000_000 }];
  }

  async getBalanceSheet() {
    return [{ totalAssets: 180_000_000_000, totalDebt: 42_000_000_000, cash: 30_000_000_000 }];
  }

  async getCashFlow() {
    return [{ freeCashFlow: 18_000_000_000, operatingCashFlow: 25_000_000_000 }];
  }

  async getKeyMetrics(ticker: string): Promise<FinancialMetrics> {
    const stock = findStock(ticker);
    return {
      ticker: stock.ticker,
      revenueGrowth: stock.revenueGrowth,
      earningsGrowth: stock.revenueGrowth * 0.9,
      grossMargin: stock.grossMargin,
      operatingMargin: stock.operatingMargin,
      netMargin: stock.operatingMargin * 0.78,
      roic: stock.roic,
      roe: stock.roic * 1.25,
      roa: stock.roic * 0.55,
      debtToEquity: stock.debtToEquity,
      peg: stock.peg,
      forwardPe: 24,
      trailingPe: 29,
      freeCashFlow: stock.freeCashFlowBillions * 1_000_000_000,
      currentRatio: 1.7,
      quickRatio: 1.2
    };
  }

  async getGrowthMetrics(ticker: string) {
    const metrics = await this.getKeyMetrics(ticker);
    return { revenueGrowth: metrics.revenueGrowth, earningsGrowth: metrics.earningsGrowth };
  }

  async getRatios(ticker: string) {
    return this.getKeyMetrics(ticker);
  }

  async getEarningsCalendar(tickers: string[]): Promise<EarningsEvent[]> {
    return tickers.map((ticker) => ({ ticker, date: findStock(ticker).earningsDate, time: "after_close" }));
  }

  async getDividendCalendar(tickers: string[]): Promise<DividendEvent[]> {
    return tickers.map((ticker) => ({ ticker, exDate: "2026-08-05", payDate: "2026-08-22", amount: 0.24 }));
  }

  async getEconomicCalendar(): Promise<EconomicEvent[]> {
    return [
      { name: "Federal Reserve Rate Decision", date: "2026-07-29", importance: "high" },
      { name: "Consumer Price Index", date: "2026-07-14", importance: "high" },
      { name: "Employment Situation", date: "2026-07-03", importance: "high" }
    ];
  }

  async getLatestNews(ticker: string): Promise<NewsItem[]> {
    return [{ ticker, headline: `${ticker} mock institutional news digest`, source: "Mock", url: "https://example.com", publishedAt: new Date().toISOString() }];
  }

  async getSentiment(ticker: string): Promise<NewsSentiment> {
    return { ticker, score: 0.12, label: "neutral", reasoning: ["Mock sentiment is neutral until a real provider is configured."] };
  }
}
