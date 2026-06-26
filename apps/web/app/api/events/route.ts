import { NextRequest, NextResponse } from "next/server";
import { evaluateEventRisk } from "@wheeldesk/market-data";
import { getInstitutionalService } from "@/lib/services/institutional-research-service";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker") ?? "AAPL";
  const service = await getInstitutionalService();
  const [earnings, dividends, economicEvents, sentiment] = await Promise.all([
    service.provider.getEarningsCalendar([ticker.toUpperCase()], "2026-01-01", "2026-12-31"),
    service.provider.getDividendCalendar([ticker.toUpperCase()], "2026-01-01", "2026-12-31"),
    service.provider.getEconomicCalendar("2026-01-01", "2026-12-31"),
    service.provider.getSentiment(ticker.toUpperCase())
  ]);
  return NextResponse.json({ data: evaluateEventRisk({ ticker: ticker.toUpperCase(), earnings, dividends, economicEvents, sentiment }) });
}
