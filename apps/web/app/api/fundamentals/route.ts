import { NextRequest, NextResponse } from "next/server";
import { analyzeFundamentals } from "@wheeldesk/fundamental-analysis";
import { getInstitutionalService } from "@/lib/services/institutional-research-service";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker") ?? "AAPL";
  const service = await getInstitutionalService();
  const [profile, metrics] = await Promise.all([
    service.provider.getCompanyProfile(ticker.toUpperCase()),
    service.provider.getKeyMetrics(ticker.toUpperCase())
  ]);
  return NextResponse.json({ data: { profile, metrics, analysis: analyzeFundamentals(profile, metrics) } });
}
