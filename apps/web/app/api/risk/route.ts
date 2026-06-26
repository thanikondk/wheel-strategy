import { NextRequest, NextResponse } from "next/server";
import { getInstitutionalService } from "@/lib/services/institutional-research-service";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker") ?? "AAPL";
  const service = await getInstitutionalService();
  const recommendation = await service.buildRecommendation(ticker.toUpperCase());
  return NextResponse.json({ data: recommendation.risk });
}
