import { NextRequest, NextResponse } from "next/server";
import { analyzeTechnicals } from "@wheeldesk/technical-analysis";
import { getInstitutionalService } from "@/lib/services/institutional-research-service";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker") ?? "AAPL";
  const service = await getInstitutionalService();
  const bars = await service.provider.getHistoricalPrices(ticker.toUpperCase(), 1);
  return NextResponse.json({ data: analyzeTechnicals(bars) });
}
