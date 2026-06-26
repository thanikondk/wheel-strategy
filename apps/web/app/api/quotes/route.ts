import { NextRequest, NextResponse } from "next/server";
import { getInstitutionalService } from "@/lib/services/institutional-research-service";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker") ?? "AAPL";
  const service = await getInstitutionalService();
  return NextResponse.json({ data: await service.getQuote(ticker.toUpperCase()) });
}
