import { NextRequest, NextResponse } from "next/server";
import { getInstitutionalService } from "@/lib/services/institutional-research-service";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker") ?? "AAPL";
  const service = await getInstitutionalService();
  const expirations = await service.provider.getExpirations(ticker);
  const expiration = request.nextUrl.searchParams.get("expiration") ?? expirations[0];
  return NextResponse.json({ data: await service.provider.getOptionChain(ticker.toUpperCase(), expiration) });
}
