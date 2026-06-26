import type { MarketDataProvider } from "../providers";
import { BaseHttpAdapter, type ProviderConfig } from "./base-http";

export abstract class UnimplementedProviderAdapter extends BaseHttpAdapter implements MarketDataProvider {
  protected constructor(config: ProviderConfig) {
    super(config);
  }

  protected unavailable(method: string): never {
    throw new Error(`${this.config.providerName}.${method} is configured as an adapter boundary. Add provider-specific normalization before enabling it.`);
  }

  getQuote() { return Promise.reject(this.unavailable("getQuote")); }
  getHistoricalPrices() { return Promise.reject(this.unavailable("getHistoricalPrices")); }
  getDailyBars() { return Promise.reject(this.unavailable("getDailyBars")); }
  getIntradayBars() { return Promise.reject(this.unavailable("getIntradayBars")); }
  getTechnicalIndicators() { return Promise.reject(this.unavailable("getTechnicalIndicators")); }
  getExpirations() { return Promise.reject(this.unavailable("getExpirations")); }
  getOptionChain() { return Promise.reject(this.unavailable("getOptionChain")); }
  getGreeks() { return Promise.reject(this.unavailable("getGreeks")); }
  getOpenInterest() { return Promise.reject(this.unavailable("getOpenInterest")); }
  getImpliedVolatility() { return Promise.reject(this.unavailable("getImpliedVolatility")); }
  getExpectedMove() { return Promise.reject(this.unavailable("getExpectedMove")); }
  getCompanyProfile() { return Promise.reject(this.unavailable("getCompanyProfile")); }
  getIncomeStatement() { return Promise.reject(this.unavailable("getIncomeStatement")); }
  getBalanceSheet() { return Promise.reject(this.unavailable("getBalanceSheet")); }
  getCashFlow() { return Promise.reject(this.unavailable("getCashFlow")); }
  getKeyMetrics() { return Promise.reject(this.unavailable("getKeyMetrics")); }
  getGrowthMetrics() { return Promise.reject(this.unavailable("getGrowthMetrics")); }
  getRatios() { return Promise.reject(this.unavailable("getRatios")); }
  getEarningsCalendar() { return Promise.reject(this.unavailable("getEarningsCalendar")); }
  getDividendCalendar() { return Promise.reject(this.unavailable("getDividendCalendar")); }
  getEconomicCalendar() { return Promise.reject(this.unavailable("getEconomicCalendar")); }
  getLatestNews() { return Promise.reject(this.unavailable("getLatestNews")); }
  getCompanyNews() { return Promise.reject(this.unavailable("getCompanyNews")); }
  getMarketNews() { return Promise.reject(this.unavailable("getMarketNews")); }
  getSentiment() { return Promise.reject(this.unavailable("getSentiment")); }
}

export class TradierAdapter extends UnimplementedProviderAdapter {
  constructor(apiKey?: string) {
    super({ providerName: "Tradier", baseUrl: "https://api.tradier.com/v1", apiKey });
  }
}

export class PolygonAdapter extends UnimplementedProviderAdapter {
  constructor(apiKey?: string) {
    super({ providerName: "Polygon", baseUrl: "https://api.polygon.io", apiKey });
  }
}

export class AlphaVantageAdapter extends UnimplementedProviderAdapter {
  constructor(apiKey?: string) {
    super({ providerName: "Alpha Vantage", baseUrl: "https://www.alphavantage.co", apiKey });
  }
}

export class FinancialModelingPrepAdapter extends UnimplementedProviderAdapter {
  constructor(apiKey?: string) {
    super({ providerName: "Financial Modeling Prep", baseUrl: "https://financialmodelingprep.com/api", apiKey });
  }
}

export class YahooDevelopmentAdapter extends UnimplementedProviderAdapter {
  constructor() {
    super({ providerName: "Yahoo Development", baseUrl: "https://query1.finance.yahoo.com", apiKey: "development-only" });
  }
}
