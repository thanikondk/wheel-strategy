import type { MarketDataProvider } from "../providers";
import type {
  CompanyProfile,
  DividendEvent,
  EarningsEvent,
  EconomicEvent,
  FinancialMetrics,
  HistoricalBar,
  NewsItem,
  NewsSentiment,
  NormalizedOptionContract,
  OptionType,
  ProviderHealth,
  Quote
} from "../models";

type YahooQuoteResult = {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  bid?: number;
  ask?: number;
  regularMarketVolume?: number;
  averageDailyVolume3Month?: number;
  marketCap?: number;
  regularMarketTime?: number;
  longName?: string;
  shortName?: string;
  sector?: string;
  industry?: string;
  beta?: number;
  dividendYield?: number;
  exchange?: string;
  earningsTimestamp?: number;
  exDividendDate?: number;
};

type YahooOption = {
  contractSymbol: string;
  strike: number;
  currency?: string;
  lastPrice?: number;
  bid?: number;
  ask?: number;
  change?: number;
  percentChange?: number;
  volume?: number;
  openInterest?: number;
  impliedVolatility?: number;
  inTheMoney?: boolean;
  expiration?: number;
};

type YahooOptionResponse = {
  optionChain: {
    result: Array<{
      expirationDates?: number[];
      quote?: YahooQuoteResult;
      options?: Array<{
        expirationDate: number;
        calls?: YahooOption[];
        puts?: YahooOption[];
      }>;
    }>;
    error?: unknown;
  };
};

const YAHOO_BASE_URL = "https://query1.finance.yahoo.com";
const YAHOO_SEARCH_URL = "https://query2.finance.yahoo.com";
const seconds = (date: string) => Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000);
const isoFromUnix = (value?: number) => value ? new Date(value * 1000).toISOString() : new Date().toISOString();
const round = (value: number, precision = 4) => Number(value.toFixed(precision));
const finite = (value: unknown, fallback = 0) => typeof value === "number" && Number.isFinite(value) ? value : fallback;

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 300 } });
  if (!response.ok) {
    throw new Error(`Yahoo Development request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function midpoint(bid = 0, ask = 0, last = 0) {
  if (bid > 0 && ask > 0) return round((bid + ask) / 2, 2);
  return round(last, 2);
}

function approximateDelta(type: OptionType, stockPrice: number, strike: number, iv: number, dte = 30) {
  const distance = (stockPrice - strike) / Math.max(stockPrice, 1);
  const volatilityWindow = Math.max(iv, 0.05) * Math.sqrt(Math.max(dte, 1) / 365);
  const normalized = distance / Math.max(volatilityWindow, 0.01);
  const probabilityItm = 1 / (1 + Math.exp(normalized * (type === "put" ? 1.7 : -1.7)));
  const capped = Math.min(Math.max(probabilityItm, 0.02), 0.98);
  return type === "put" ? -round(capped, 2) : round(capped, 2);
}

function normalizeContract(option: YahooOption, ticker: string, type: OptionType, stockPrice: number, expiration: string): NormalizedOptionContract {
  const bid = finite(option.bid);
  const ask = finite(option.ask);
  const last = finite(option.lastPrice);
  const mark = midpoint(bid, ask, last);
  const iv = finite(option.impliedVolatility);
  const strike = finite(option.strike);
  const dte = Math.max(1, Math.ceil((new Date(expiration).getTime() - Date.now()) / 86_400_000));
  const intrinsicValue = type === "put" ? Math.max(strike - stockPrice, 0) : Math.max(stockPrice - strike, 0);
  const extrinsicValue = Math.max(mark - intrinsicValue, 0);
  const delta = approximateDelta(type, stockPrice, strike, iv, dte);
  const probabilityITM = Math.abs(delta);
  return {
    ticker,
    expiration,
    strike,
    type,
    bid,
    ask,
    last,
    mark,
    delta,
    gamma: 0,
    theta: 0,
    vega: 0,
    rho: 0,
    iv,
    impliedVolatility: iv,
    volume: finite(option.volume),
    openInterest: finite(option.openInterest),
    intrinsicValue,
    extrinsicValue,
    breakEven: type === "put" ? strike - mark : strike + mark,
    probabilityITM,
    probabilityOTM: round(1 - probabilityITM),
    timestamp: new Date().toISOString()
  };
}

export class YahooDevelopmentAdapter implements MarketDataProvider {
  private async quoteResult(ticker: string): Promise<YahooQuoteResult> {
    const symbol = encodeURIComponent(ticker.toUpperCase());
    const payload = await getJson<{ quoteResponse: { result: YahooQuoteResult[] } }>(`${YAHOO_BASE_URL}/v7/finance/quote?symbols=${symbol}`);
    const quote = payload.quoteResponse.result[0];
    if (!quote) throw new Error(`Yahoo Development returned no quote for ${ticker}`);
    return quote;
  }

  async getQuote(ticker: string): Promise<Quote> {
    const quote = await this.quoteResult(ticker);
    const price = finite(quote.regularMarketPrice);
    return {
      ticker: quote.symbol.toUpperCase(),
      price,
      change: finite(quote.regularMarketChange),
      percentChange: finite(quote.regularMarketChangePercent) / 100,
      bid: finite(quote.bid, price),
      ask: finite(quote.ask, price),
      volume: finite(quote.regularMarketVolume),
      avgVolume: finite(quote.averageDailyVolume3Month),
      marketCap: finite(quote.marketCap),
      timestamp: isoFromUnix(quote.regularMarketTime)
    };
  }

  async getHistoricalPrices(ticker: string, years = 1): Promise<HistoricalBar[]> {
    const symbol = encodeURIComponent(ticker.toUpperCase());
    const range = `${Math.max(1, Math.round(years))}y`;
    const payload = await getJson<{
      chart: {
        result: Array<{
          timestamp: number[];
          indicators: { quote: Array<{ open: number[]; high: number[]; low: number[]; close: number[]; volume: number[] }> };
        }>;
      };
    }>(`${YAHOO_BASE_URL}/v8/finance/chart/${symbol}?range=${range}&interval=1d`);
    const result = payload.chart.result[0];
    if (!result) throw new Error(`Yahoo Development returned no historical prices for ${ticker}`);
    const quote = result.indicators.quote[0];
    return result.timestamp.map((timestamp, index) => ({
      ticker: ticker.toUpperCase(),
      timestamp: isoFromUnix(timestamp),
      open: finite(quote.open[index]),
      high: finite(quote.high[index]),
      low: finite(quote.low[index]),
      close: finite(quote.close[index]),
      volume: finite(quote.volume[index])
    })).filter((bar) => bar.close > 0);
  }

  async getDailyBars(ticker: string, start: string, end: string): Promise<HistoricalBar[]> {
    const symbol = encodeURIComponent(ticker.toUpperCase());
    const payload = await getJson<{
      chart: {
        result: Array<{
          timestamp: number[];
          indicators: { quote: Array<{ open: number[]; high: number[]; low: number[]; close: number[]; volume: number[] }> };
        }>;
      };
    }>(`${YAHOO_BASE_URL}/v8/finance/chart/${symbol}?period1=${seconds(start)}&period2=${seconds(end)}&interval=1d`);
    const result = payload.chart.result[0];
    if (!result) throw new Error(`Yahoo Development returned no daily bars for ${ticker}`);
    const quote = result.indicators.quote[0];
    return result.timestamp.map((timestamp, index) => ({
      ticker: ticker.toUpperCase(),
      timestamp: isoFromUnix(timestamp),
      open: finite(quote.open[index]),
      high: finite(quote.high[index]),
      low: finite(quote.low[index]),
      close: finite(quote.close[index]),
      volume: finite(quote.volume[index])
    })).filter((bar) => bar.close > 0);
  }

  async getIntradayBars(ticker: string, interval: "1m" | "5m" | "15m" | "1h"): Promise<HistoricalBar[]> {
    const yahooInterval = interval === "1h" ? "60m" : interval;
    const symbol = encodeURIComponent(ticker.toUpperCase());
    const payload = await getJson<{
      chart: {
        result: Array<{
          timestamp: number[];
          indicators: { quote: Array<{ open: number[]; high: number[]; low: number[]; close: number[]; volume: number[] }> };
        }>;
      };
    }>(`${YAHOO_BASE_URL}/v8/finance/chart/${symbol}?range=5d&interval=${yahooInterval}`);
    const result = payload.chart.result[0];
    if (!result) throw new Error(`Yahoo Development returned no intraday bars for ${ticker}`);
    const quote = result.indicators.quote[0];
    return result.timestamp.map((timestamp, index) => ({
      ticker: ticker.toUpperCase(),
      timestamp: isoFromUnix(timestamp),
      open: finite(quote.open[index]),
      high: finite(quote.high[index]),
      low: finite(quote.low[index]),
      close: finite(quote.close[index]),
      volume: finite(quote.volume[index])
    })).filter((bar) => bar.close > 0);
  }

  async getTechnicalIndicators(ticker: string): Promise<Record<string, number>> {
    const bars = await this.getHistoricalPrices(ticker, 1);
    const closes = bars.map((bar) => bar.close);
    const average = (period: number) => round(closes.slice(-period).reduce((sum, close) => sum + close, 0) / Math.min(period, closes.length), 2);
    return { sma20: average(20), sma50: average(50), sma100: average(100), sma200: average(200) };
  }

  private async optionPayload(ticker: string, expiration?: string): Promise<YahooOptionResponse["optionChain"]["result"][number]> {
    const symbol = encodeURIComponent(ticker.toUpperCase());
    const suffix = expiration ? `?date=${seconds(expiration)}` : "";
    const payload = await getJson<YahooOptionResponse>(`${YAHOO_BASE_URL}/v7/finance/options/${symbol}${suffix}`);
    const result = payload.optionChain.result[0];
    if (!result) throw new Error(`Yahoo Development returned no option chain for ${ticker}`);
    return result;
  }

  async getExpirations(ticker: string): Promise<string[]> {
    const result = await this.optionPayload(ticker);
    return (result.expirationDates ?? []).map((timestamp) => isoFromUnix(timestamp).slice(0, 10));
  }

  async getOptionChain(ticker: string, expiration: string): Promise<NormalizedOptionContract[]> {
    const [quote, result] = await Promise.all([this.getQuote(ticker), this.optionPayload(ticker, expiration)]);
    const options = result.options?.[0];
    if (!options) return [];
    const normalizedExpiration = expiration || isoFromUnix(options.expirationDate).slice(0, 10);
    return [
      ...(options.puts ?? []).map((option) => normalizeContract(option, ticker.toUpperCase(), "put", quote.price, normalizedExpiration)),
      ...(options.calls ?? []).map((option) => normalizeContract(option, ticker.toUpperCase(), "call", quote.price, normalizedExpiration))
    ].filter((contract) => contract.bid > 0 || contract.ask > 0 || contract.last > 0);
  }

  async getGreeks(contractSymbol: string) {
    const ticker = contractSymbol.replace(/\d.*/, "");
    const expirations = await this.getExpirations(ticker);
    const contract = (await this.getOptionChain(ticker, expirations[0])).find((item) => contractSymbol.includes(String(item.strike))) ?? (await this.getOptionChain(ticker, expirations[0]))[0];
    return { delta: contract?.delta ?? 0, gamma: contract?.gamma ?? 0, theta: contract?.theta ?? 0, vega: contract?.vega ?? 0, rho: contract?.rho ?? 0 };
  }

  async getOpenInterest(contractSymbol: string): Promise<number> {
    const ticker = contractSymbol.replace(/\d.*/, "");
    const expirations = await this.getExpirations(ticker);
    return (await this.getOptionChain(ticker, expirations[0]))[0]?.openInterest ?? 0;
  }

  async getImpliedVolatility(contractSymbol: string): Promise<number> {
    const ticker = contractSymbol.replace(/\d.*/, "");
    const expirations = await this.getExpirations(ticker);
    return (await this.getOptionChain(ticker, expirations[0]))[0]?.impliedVolatility ?? 0;
  }

  async getExpectedMove(ticker: string, expiration: string): Promise<number> {
    const quote = await this.getQuote(ticker);
    const chain = await this.getOptionChain(ticker, expiration);
    const atm = chain.sort((left, right) => Math.abs(left.strike - quote.price) - Math.abs(right.strike - quote.price))[0];
    const dte = Math.max(1, Math.ceil((new Date(expiration).getTime() - Date.now()) / 86_400_000));
    return round(quote.price * (atm?.impliedVolatility ?? 0) * Math.sqrt(dte / 365), 2);
  }

  async getCompanyProfile(ticker: string): Promise<CompanyProfile> {
    const quote = await this.quoteResult(ticker);
    return {
      ticker: quote.symbol.toUpperCase(),
      companyName: quote.longName ?? quote.shortName ?? quote.symbol.toUpperCase(),
      sector: quote.sector ?? "Unknown",
      industry: quote.industry ?? "Unknown",
      marketCap: finite(quote.marketCap),
      beta: finite(quote.beta),
      dividendYield: finite(quote.dividendYield),
      country: "US",
      exchange: quote.exchange ?? "Unknown"
    };
  }

  async getIncomeStatement() {
    return [];
  }

  async getBalanceSheet() {
    return [];
  }

  async getCashFlow() {
    return [];
  }

  async getKeyMetrics(ticker: string): Promise<FinancialMetrics> {
    const quote = await this.quoteResult(ticker);
    return {
      ticker: quote.symbol.toUpperCase(),
      revenueGrowth: 0,
      earningsGrowth: 0,
      grossMargin: 0,
      operatingMargin: 0,
      netMargin: 0,
      roic: 0,
      roe: 0,
      roa: 0,
      debtToEquity: 0,
      peg: 0,
      forwardPE: 0,
      trailingPE: 0,
      freeCashFlow: 0,
      currentRatio: 0,
      quickRatio: 0
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
    const quotes = await Promise.all(tickers.map((ticker) => this.quoteResult(ticker)));
    return quotes
      .filter((quote) => Boolean(quote.earningsTimestamp))
      .map((quote) => ({ ticker: quote.symbol.toUpperCase(), date: isoFromUnix(quote.earningsTimestamp).slice(0, 10), time: "unknown" }));
  }

  async getDividendCalendar(tickers: string[]): Promise<DividendEvent[]> {
    const quotes = await Promise.all(tickers.map((ticker) => this.quoteResult(ticker)));
    return quotes
      .filter((quote) => Boolean(quote.exDividendDate))
      .map((quote) => ({ ticker: quote.symbol.toUpperCase(), exDate: isoFromUnix(quote.exDividendDate).slice(0, 10), payDate: "", amount: 0 }));
  }

  async getEconomicCalendar(): Promise<EconomicEvent[]> {
    return [];
  }

  async getLatestNews(ticker: string): Promise<NewsItem[]> {
    return this.getCompanyNews(ticker);
  }

  async getCompanyNews(ticker: string): Promise<NewsItem[]> {
    const symbol = encodeURIComponent(ticker.toUpperCase());
    const payload = await getJson<{ news?: Array<{ title?: string; publisher?: string; link?: string; providerPublishTime?: number }> }>(`${YAHOO_SEARCH_URL}/v1/finance/search?q=${symbol}&newsCount=8`);
    return (payload.news ?? []).map((item) => ({
      ticker: ticker.toUpperCase(),
      headline: item.title ?? "",
      source: item.publisher ?? "Yahoo Finance",
      url: item.link ?? "",
      publishedAt: isoFromUnix(item.providerPublishTime)
    })).filter((item) => item.headline.length > 0);
  }

  async getMarketNews(): Promise<NewsItem[]> {
    return this.getCompanyNews("SPY");
  }

  async getSentiment(ticker: string): Promise<NewsSentiment> {
    const news = await this.getCompanyNews(ticker);
    const positive = ["beats", "raises", "growth", "record", "upgrade", "surge"];
    const negative = ["misses", "cuts", "downgrade", "lawsuit", "falls", "probe"];
    const score = news.reduce((sum, item) => {
      const headline = item.headline.toLowerCase();
      return sum + positive.filter((word) => headline.includes(word)).length - negative.filter((word) => headline.includes(word)).length;
    }, 0) / Math.max(news.length, 1);
    return {
      ticker: ticker.toUpperCase(),
      score: round(Math.max(-1, Math.min(1, score)), 2),
      label: score > 0.15 ? "positive" : score < -0.15 ? "negative" : "neutral",
      reasoning: [`Sentiment is derived from ${news.length} live Yahoo Finance headlines using transparent keyword scoring.`]
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startedAt = Date.now();
    try {
      await this.getQuote("SPY");
      return { provider: "Yahoo Development", ok: true, latencyMs: Date.now() - startedAt, checkedAt: new Date().toISOString() };
    } catch (error) {
      return { provider: "Yahoo Development", ok: false, latencyMs: Date.now() - startedAt, checkedAt: new Date().toISOString(), error: error instanceof Error ? error.message : String(error) };
    }
  }
}
