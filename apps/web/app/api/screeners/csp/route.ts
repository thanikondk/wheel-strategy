import { NextResponse } from "next/server";
import { accountSnapshot, MockMarketDataProvider } from "@wheeldesk/core";
import { scoreTrade } from "@wheeldesk/risk-engine";

export async function GET() {
  const provider = new MockMarketDataProvider();
  const [candidates, stocks] = await Promise.all([provider.getCashSecuredPuts(), provider.getWatchlist()]);
  const data = candidates.map((candidate) => ({
    ...candidate,
    risk: scoreTrade({
      ...candidate,
      accountSize: 20_000,
      cashAvailable: accountSnapshot.cashAvailable,
      cashReserveAfterTrade: accountSnapshot.cashAvailable - candidate.strike * 100,
      tickerQualityScore: stocks.find((stock) => stock.ticker === candidate.ticker)?.wheelQualityScore ?? 50,
      existingExposure: 0,
      sectorConcentration: 0.24,
      assignmentReady: candidate.userWouldOwn,
      marketRegime: "Sideways"
    })
  }));
  return NextResponse.json({ data });
}
