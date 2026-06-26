import { NextResponse } from "next/server";
import { getInstitutionalService } from "@/lib/services/institutional-research-service";

export async function GET() {
  const service = await getInstitutionalService();
  const ranked = await service.rankCspUniverse();
  return NextResponse.json({
    data: {
      cashSecuredPuts: ranked,
      coveredCalls: [],
      dividendCapture: [],
      highIv: ranked.filter((row) => row.components.options >= 75),
      wheelCandidates: ranked.filter((row) => row.recommendation === "Strong Buy" || row.recommendation === "Buy"),
      recentlyAssigned: [],
      rollCandidates: []
    }
  });
}
