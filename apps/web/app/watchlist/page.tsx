import { getInstitutionalService } from "@/lib/services/institutional-research-service";
import { Badge, Card, PageHeader } from "@/components/ui";
import { currency, percent } from "@/lib/utils";

export const dynamic = "force-dynamic";

function billions(value: number) {
  return value > 0 ? `$${(value / 1_000_000_000).toFixed(1)}B` : "-";
}

export default async function WatchlistPage() {
  const service = await getInstitutionalService();
  const rows = await service.getWatchlistResearchRows().catch(() => []);

  return (
    <>
      <PageHeader title="Stock Watchlist" subtitle="Provider-backed watchlist with technical, fundamental, liquidity, and event-risk inputs." />

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold">1. Universe Gate</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Only tickers configured in `WHEEL_WATCHLIST_TICKERS` are researched.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">2. Research Stack</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Quotes, price history, option-chain liquidity, and available company data come through the provider layer.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">3. Wheel Decision</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Promotion to trade review still requires account config, assignment readiness, liquidity, and event-risk checks.</p>
        </Card>
      </div>

      <Card>
        {rows.length === 0 ? (
          <div className="py-10 text-sm text-slate-600 dark:text-slate-300">
            No live watchlist rows are available. Configure `WHEEL_WATCHLIST_TICKERS` and a market data provider before using this page for research.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="text-sm">
              <thead className="border-b border-border text-left text-xs uppercase text-slate-500">
                <tr>
                  {["Source", "Ticker", "Price", "50DMA", "200DMA", "RSI", "Trend", "Support", "Resistance", "Earnings", "Market Cap", "Rev Growth", "FCF", "D/E", "ROIC", "Margins", "PEG", "Fundamental", "Liquidity", "Event"].map((column) => <th key={column} className="whitespace-nowrap px-2 py-2">{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.ticker} className="border-b border-border">
                    <td className="px-2 py-3"><Badge tone="positive">Provider</Badge></td>
                    <td className="px-2 font-semibold">{row.ticker}</td>
                    <td className="px-2">{currency(row.price)}</td>
                    <td className="px-2">{row.sma50.toFixed(2)}</td>
                    <td className="px-2">{row.sma200.toFixed(2)}</td>
                    <td className="px-2">{row.rsi.toFixed(0)}</td>
                    <td className="px-2">{row.trendDirection}</td>
                    <td className="px-2">{currency(row.support)}</td>
                    <td className="px-2">{currency(row.resistance)}</td>
                    <td className="px-2">{row.earningsDate || "-"}</td>
                    <td className="px-2">{billions(row.marketCap)}</td>
                    <td className="px-2">{percent(row.revenueGrowth)}</td>
                    <td className="px-2">{billions(row.freeCashFlow)}</td>
                    <td className="px-2">{row.debtToEquity || "-"}</td>
                    <td className="px-2">{percent(row.roic)}</td>
                    <td className="px-2">{percent(row.grossMargin)} / {percent(row.operatingMargin)}</td>
                    <td className="px-2">{row.peg || "-"}</td>
                    <td className="px-2">{row.fundamentalScore}</td>
                    <td className="px-2">{row.liquidityScore}</td>
                    <td className="px-2">{row.eventRiskScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
