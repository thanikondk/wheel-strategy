import { NextResponse } from "next/server";
import { getInstitutionalService } from "@/lib/services/institutional-research-service";

export async function GET() {
  const service = await getInstitutionalService();
  return NextResponse.json({ data: await service.screenCoveredCallCandidates() });
}
