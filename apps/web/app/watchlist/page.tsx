import { stocks } from "@wheeldesk/core";
import { Badge, Card, PageHeader } from "@/components/ui";
import { percent } from "@/lib/utils";

const manuallySeededTickers = new Set(["AAPL", "MSFT", "AMD", "JPM", "SOFI"]);

function dataSource(ticker: string) {
  return manuallySeededTickers.has(ticker) ? "Manual mock" : "Formula seed";
}

export default function WatchlistPage() {
  return (
    <>
      <PageHeader title="Stock Watchlist" subtitle="Tiered watchlist with quality, liquidity, technical, fundamental, and event-risk inputs." />
      <Card className="mb-4 border-amber-300 bg-amber-50 text-amber-950 dark:bg-amber-950 dark:text-amber-100">
        <h2 className="font-semibold">Current Data Status: Mock Research Seed</h2>
        <p className="mt-2 text-sm">
          This table is not live market research yet. The first few rows are manually seeded examples; the rest are formula-generated placeholders from the mock provider.
          Use this page as the research workflow shell until real quote, fundamentals, options liquidity, and event data providers are connected.
        </p>
      </Card>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold">1. Universe Gate</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Exclude meme stocks, biotech binary-event names, Chinese ADRs, illiquid options, weak balance sheets, and stocks you would not own through assignment.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">2. Research Stack</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Score fundamentals, trend, valuation, option liquidity, IV quality, earnings risk, sector concentration, and assignment readiness independently.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">3. Wheel Decision</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Promote a ticker only when it passes ownership quality first, then liquidity, position size, cash reserve, and event-risk checks.</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge>Tiers: Tier 1, Tier 2</Badge>
          <Badge>Saved preset: Capital preservation</Badge>
          <Badge>Filter: Liquid options</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-slate-500">
              <tr>
                {["Source", "Tier", "Ticker", "Price", "50DMA", "200DMA", "RSI", "MACD", "Support", "Resistance", "Earnings", "Market Cap", "Rev Growth", "FCF", "D/E", "ROIC", "Margins", "PEG", "Moat", "Wheel", "Liquidity", "Event"].map((column) => <th key={column} className="whitespace-nowrap px-2 py-2">{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.ticker} className="border-b border-border">
                  <td className="px-2 py-3"><Badge tone={dataSource(stock.ticker) === "Manual mock" ? "caution" : "neutral"}>{dataSource(stock.ticker)}</Badge></td>
                  <td className="px-2 py-3"><Badge tone={stock.tier === "Tier 1" ? "positive" : "neutral"}>{stock.tier}</Badge></td>
                  <td className="px-2 font-semibold">{stock.ticker}</td>
                  <td className="px-2">${stock.price.toFixed(2)}</td>
                  <td className="px-2">{stock.movingAverage50}</td>
                  <td className="px-2">{stock.movingAverage200}</td>
                  <td className="px-2">{stock.rsi}</td>
                  <td className="px-2">{stock.macdTrend}</td>
                  <td className="px-2">{stock.support}</td>
                  <td className="px-2">{stock.resistance}</td>
                  <td className="px-2">{stock.earningsDate}</td>
                  <td className="px-2">${stock.marketCapBillions}B</td>
                  <td className="px-2">{percent(stock.revenueGrowth)}</td>
                  <td className="px-2">${stock.freeCashFlowBillions}B</td>
                  <td className="px-2">{stock.debtToEquity}</td>
                  <td className="px-2">{percent(stock.roic)}</td>
                  <td className="px-2">{percent(stock.grossMargin)} / {percent(stock.operatingMargin)}</td>
                  <td className="px-2">{stock.peg}</td>
                  <td className="px-2">{stock.moatScore}</td>
                  <td className="px-2">{stock.wheelQualityScore}</td>
                  <td className="px-2">{stock.liquidityScore}</td>
                  <td className="px-2">{stock.eventRiskScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
