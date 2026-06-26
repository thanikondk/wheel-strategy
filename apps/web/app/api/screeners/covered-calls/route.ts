import { NextResponse } from "next/server";
import { MockMarketDataProvider } from "@wheeldesk/core";

export async function GET() {
  const provider = new MockMarketDataProvider();
  return NextResponse.json({ data: await provider.getCoveredCalls() });
}
