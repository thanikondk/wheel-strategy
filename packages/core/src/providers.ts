import { coveredCallCandidates, cspCandidates, stocks } from "./mock-data";
import type { CoveredCallCandidate, OptionCandidate, StockSnapshot } from "./types";

export interface StockDataProvider {
  getWatchlist(): Promise<StockSnapshot[]>;
  getStock(ticker: string): Promise<StockSnapshot | undefined>;
}

export interface OptionDataProvider {
  getCashSecuredPuts(): Promise<OptionCandidate[]>;
  getCoveredCalls(): Promise<CoveredCallCandidate[]>;
}

export interface FundamentalsProvider {
  getFundamentals(ticker: string): Promise<Pick<StockSnapshot, "revenueGrowth" | "freeCashFlowBillions" | "debtToEquity" | "roic" | "grossMargin" | "operatingMargin" | "peg"> | undefined>;
}

export interface EarningsCalendarProvider {
  getNextEarningsDate(ticker: string): Promise<string | undefined>;
}

export class MockMarketDataProvider implements StockDataProvider, OptionDataProvider, FundamentalsProvider, EarningsCalendarProvider {
  async getWatchlist() {
    return stocks;
  }

  async getStock(ticker: string) {
    return stocks.find((stock) => stock.ticker === ticker.toUpperCase());
  }

  async getCashSecuredPuts() {
    return cspCandidates;
  }

  async getCoveredCalls() {
    return coveredCallCandidates;
  }

  async getFundamentals(ticker: string) {
    const stock = await this.getStock(ticker);
    if (!stock) return undefined;
    return {
      revenueGrowth: stock.revenueGrowth,
      freeCashFlowBillions: stock.freeCashFlowBillions,
      debtToEquity: stock.debtToEquity,
      roic: stock.roic,
      grossMargin: stock.grossMargin,
      operatingMargin: stock.operatingMargin,
      peg: stock.peg
    };
  }

  async getNextEarningsDate(ticker: string) {
    return (await this.getStock(ticker))?.earningsDate;
  }
}
