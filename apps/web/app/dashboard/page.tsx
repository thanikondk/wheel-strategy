import { accountSnapshot, cspCandidates, stocks, tradeEvents } from "@wheeldesk/core";
import { scoreTrade } from "@wheeldesk/risk-engine";
import { Card, PageHeader, Stat, Badge } from "@/components/ui";
import { currency, percent } from "@/lib/utils";
import { AllocationChart } from "@/components/allocation-chart";

const allocation = cspCandidates.map((candidate) => ({
  ticker: candidate.ticker,
  value: candidate.strike * 100
}));

export default function DashboardPage() {
  const riskResults = cspCandidates.map((candidate) =>
    scoreTrade({
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
  );
  const violations = riskResults.filter((result) => result.status === "BLOCKED");

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A $20,000 account command center for risk-managed, assignment-ready wheel research." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Account value" value={currency(accountSnapshot.accountValue)} detail="Personal learning model" />
        <Stat label="Cash available" value={currency(accountSnapshot.cashAvailable)} detail={`${percent(accountSnapshot.cashReservePercent)} reserve`} />
        <Stat label="Premium MTD / YTD" value={`${currency(accountSnapshot.premiumCollectedMtd)} / ${currency(accountSnapshot.premiumCollectedYtd)}`} />
        <Stat label="Capital at risk" value={currency(accountSnapshot.capitalAtRisk)} detail="CSP collateral plus assigned shares" />
        <Stat label="Open CSPs" value={accountSnapshot.openCsps} />
        <Stat label="Assigned shares" value={accountSnapshot.assignedShares} />
        <Stat label="Covered calls" value={accountSnapshot.coveredCalls} />
        <Stat label="Realized P&L" value={currency(accountSnapshot.realizedPnl)} detail={`Unrealized ${currency(accountSnapshot.unrealizedPnl)}`} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-lg font-semibold">Allocation by Ticker</h2>
          <AllocationChart data={allocation} />
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Risk Violations</h2>
          <div className="mt-4 grid gap-3">
            {violations.length === 0 ? <p className="text-sm text-slate-500">No hard blocks in the current mock slate.</p> : null}
            {violations.map((violation, index) => (
              <div key={index} className="rounded-md border border-border p-3">
                <Badge tone="danger">Blocked</Badge>
                <p className="mt-2 text-sm">{violation.hardBlocks.join(" ")}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Open Wheel Cycles</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-slate-500">
              <tr><th className="py-2">Date</th><th>Ticker</th><th>Action</th><th>Strike</th><th>Premium</th><th>Exit Plan</th></tr>
            </thead>
            <tbody>
              {tradeEvents.map((trade) => (
                <tr key={trade.id} className="border-b border-border">
                  <td className="py-3">{trade.date}</td><td>{trade.ticker}</td><td>{trade.action}</td><td>{trade.strike}</td><td>{currency(trade.premium)}</td><td>{trade.exitPlan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
