import { AlertTriangle, BookOpen, CalendarClock, Gauge, ShieldCheck } from "lucide-react";
import { getInstitutionalService } from "@/lib/services/institutional-research-service";
import { Badge, Card, PageHeader } from "@/components/ui";
import { currency, percent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DailyDashboardPage() {
  const service = await getInstitutionalService();
  const [ranked, watchlistRows, cspRows, coveredCallRows] = await Promise.all([
    service.rankCspUniverse().catch(() => []),
    service.getWatchlistResearchRows().catch(() => []),
    service.screenCspCandidates().catch(() => []),
    service.screenCoveredCallCandidates().catch(() => [])
  ]);
  const nearSupport = watchlistRows
    .filter((row) => row.price > 0 && row.support > 0 && row.price <= row.support * 1.05)
    .slice(0, 6);
  const earningsRisk = watchlistRows
    .filter((row) => Boolean(row.earningsDate))
    .slice(0, 8);
  const tradesRequiringAction = cspRows.filter((candidate) => candidate.earningsBeforeExpiration || candidate.dte <= 21);

  return (
    <>
      <PageHeader title="Daily Decision Dashboard" subtitle="A pre-trade review board for market regime, account risk, opportunities, event risk, and journal follow-up." />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <Gauge className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">Market Regime</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Market-regime inputs are provider-driven when configured; do not trade from this view without reviewing trend and volatility context.</p>
        </Card>
        <Card>
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">Account Status</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">CSP ranking requires `WHEEL_ACCOUNT_VALUE`, `WHEEL_CASH_AVAILABLE`, and assignment-ready tickers.</p>
        </Card>
        <Card>
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="mt-3 font-semibold">Open Risk Warnings</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{earningsRisk.length} configured watchlist names have provider-reported upcoming earnings dates.</p>
        </Card>
        <Card>
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="mt-3 font-semibold">Journal Review</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No broker journal is connected yet; trade history remains empty until a real journal source is wired.</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Top CSP Opportunities</h2>
          {ranked.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No ranked CSP candidates are available. Configure account values, ownable tickers, and watchlist tickers.</p>
          ) : (
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
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Top Covered Call Opportunities</h2>
          {coveredCallRows.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No covered-call candidates are available. Configure `WHEEL_COVERED_CALL_POSITIONS` from real holdings.</p>
          ) : (
            <div className="mt-4 grid gap-2">
              {coveredCallRows.slice(0, 5).map((row) => (
                <div key={`${row.ticker}-${row.strike}`} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                  <span className="font-semibold">{row.ticker}</span>
                  <span>{currency(row.premium)} premium, {row.decision.finalDecision}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold">Stocks Near Support</h2>
          <div className="mt-4 grid gap-2">
            {nearSupport.length ? nearSupport.map((row) => (
              <div key={row.ticker} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                <span className="font-semibold">{row.ticker}</span>
                <span>{currency(row.price)} / support {currency(row.support)}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No configured live watchlist stocks are close to support.</p>}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Earnings Risk List</h2>
          <div className="mt-4 grid gap-2">
            {earningsRisk.length ? earningsRisk.map((row) => (
              <div key={row.ticker} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                <span className="font-semibold">{row.ticker}</span>
                <span>{row.earningsDate}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No provider-reported earnings dates are available for the configured watchlist.</p>}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Trades Requiring Action</h2>
          <div className="mt-4 grid gap-2">
            {tradesRequiringAction.length ? tradesRequiringAction.map((trade) => (
              <div key={`${trade.ticker}-${trade.expiration}`} className="rounded-md border border-border p-2 text-sm">
                <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /><span className="font-semibold">{trade.ticker}</span></div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{trade.dte} DTE, earnings risk: {trade.earningsBeforeExpiration ? "yes" : "no"}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No live CSP candidates currently require action.</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
