import { AlertTriangle, BookOpen, CalendarClock, Gauge, ShieldCheck } from "lucide-react";
import { cspCandidates, stocks } from "@wheeldesk/core";
import { getInstitutionalService } from "@/lib/services/institutional-research-service";
import { Badge, Card, PageHeader } from "@/components/ui";
import { currency, percent } from "@/lib/utils";

export default async function DailyDashboardPage() {
  const service = await getInstitutionalService();
  const ranked = await service.rankCspUniverse();
  const nearSupport = stocks
    .filter((stock) => stock.price <= stock.support * 1.05)
    .slice(0, 6);
  const earningsRisk = stocks
    .filter((stock) => stock.eventRiskScore >= 6)
    .slice(0, 8);
  const tradesRequiringAction = cspCandidates.filter((candidate) => candidate.earningsBeforeExpiration || candidate.dte <= 21);

  return (
    <>
      <PageHeader title="Daily Decision Dashboard" subtitle="A pre-trade review board for market regime, account risk, opportunities, event risk, and journal follow-up." />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <Gauge className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">Market Regime</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sideways mock regime. Prefer 0.15-0.25 delta CSPs until live breadth and volatility inputs are connected.</p>
        </Card>
        <Card>
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">Account Status</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Review dashboard entries for cash reserve, open CSP collateral, covered calls, and concentration before screening trades.</p>
        </Card>
        <Card>
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="mt-3 font-semibold">Open Risk Warnings</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{earningsRisk.length} watchlist names have elevated event-risk scores in mock data.</p>
        </Card>
        <Card>
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">Journal Review</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Do not open a trade without thesis, assignment plan, exit plan, and maximum-loss scenario.</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Top CSP Opportunities</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="text-sm">
              <thead className="border-b border-border text-left text-xs uppercase text-slate-500">
                <tr><th className="py-2">Rank</th><th>Ticker</th><th>Score</th><th>Risk</th><th>Yield</th><th>Decision</th></tr>
              </thead>
              <tbody>
                {ranked.slice(0, 5).map((row) => (
                  <tr key={row.ticker} className="border-b border-border">
                    <td className="py-3">{row.rank}</td><td className="font-semibold">{row.ticker}</td><td>{row.wheelScore}</td><td>{row.riskLevel}/10</td><td>{percent(row.annualizedYield)}</td><td><Badge>{row.recommendation}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Top Covered Call Opportunities</h2>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Covered call ranking activates when dashboard share positions are persisted to the database. Until then, use the covered call screener and never sell below adjusted basis.</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold">Stocks Near Support</h2>
          <div className="mt-4 grid gap-2">
            {nearSupport.length ? nearSupport.map((stock) => (
              <div key={stock.ticker} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                <span className="font-semibold">{stock.ticker}</span>
                <span>{currency(stock.price)} / support {currency(stock.support)}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No mock watchlist stocks are close to support.</p>}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Earnings Risk List</h2>
          <div className="mt-4 grid gap-2">
            {earningsRisk.map((stock) => (
              <div key={stock.ticker} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                <span className="font-semibold">{stock.ticker}</span>
                <span>{stock.earningsDate}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Trades Requiring Action</h2>
          <div className="mt-4 grid gap-2">
            {tradesRequiringAction.map((trade) => (
              <div key={`${trade.ticker}-${trade.expiration}`} className="rounded-md border border-border p-2 text-sm">
                <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /><span className="font-semibold">{trade.ticker}</span></div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{trade.dte} DTE, earnings risk: {trade.earningsBeforeExpiration ? "yes" : "no"}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
