import type { MarketDataProvider } from "./providers";
import { MockInstitutionalDataProvider } from "./adapters/mock";
import { AlphaVantageAdapter, FinancialModelingPrepAdapter, PolygonAdapter, TradierAdapter, YahooDevelopmentAdapter } from "./adapters/stubs";

export type ProviderName = "mock" | "tradier" | "polygon" | "alpha-vantage" | "fmp" | "yahoo-dev";

export function createMarketDataProvider(name: ProviderName = "mock", env: Record<string, string | undefined> = {}): MarketDataProvider {
  switch (name) {
    case "tradier":
      return new TradierAdapter(env.TRADIER_API_KEY);
    case "polygon":
      return new PolygonAdapter(env.POLYGON_API_KEY);
    case "alpha-vantage":
      return new AlphaVantageAdapter(env.ALPHA_VANTAGE_API_KEY);
    case "fmp":
      return new FinancialModelingPrepAdapter(env.FMP_API_KEY);
    case "yahoo-dev":
      return new YahooDevelopmentAdapter();
    case "mock":
    default:
      return new MockInstitutionalDataProvider();
  }
}
