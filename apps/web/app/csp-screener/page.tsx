import { accountSnapshot, cspCandidates, stocks } from "@wheeldesk/core";
import { scoreTrade } from "@wheeldesk/risk-engine";
import { Card, PageHeader } from "@/components/ui";
import { ScreenerTable } from "@/components/screener-table";

export default function CspScreenerPage() {
  const rows = cspCandidates.map((candidate) => ({
    ...candidate,
    risk: scoreTrade({
      ...candidate,
      accountSize: 20_000,
      cashAvailable: accountSnapshot.cashAvailable,
      cashReserveAfterTrade: accountSnapshot.cashAvailable - candidate.strike * 100,
      tickerQualityScore: stocks.find((stock) => stock.ticker === candidate.ticker)?.wheelQualityScore ?? 50,
      existingExposure: 0,
      sectorConcentration: 0.24,
      assignmentReady: candidate.userWouldOwn,
      marketRegime: "Sideways"
    })
  }));

  return (
    <>
      <PageHeader title="Cash-Secured Put Screener" subtitle="Screens 20-45 DTE, 0.15-0.30 delta candidates with allocation, liquidity, earnings, and assignment-readiness checks." />
      <Card><ScreenerTable rows={rows} /></Card>
    </>
  );
}
