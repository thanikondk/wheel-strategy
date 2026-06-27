import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const tradeSchema = z.object({
  date: z.string().min(1),
  ticker: z.string().min(1).max(8),
  strategy: z.enum(["CSP", "Covered Call", "Shares", "Dividend", "Adjustment"]),
  action: z.string().min(1),
  contracts: z.number().int().min(0),
  premium: z.number(),
  fees: z.number().min(0),
  thesis: z.string().min(20),
  exitPlan: z.string().min(20)
});

export async function GET() {
  return NextResponse.json({
    data: [],
    source: "unconfigured",
    message: "No trade journal or broker activity source is connected. Seed trades are not returned as real history."
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = tradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  return NextResponse.json({ data: { id: crypto.randomUUID(), ...parsed.data } }, { status: 201 });
}
