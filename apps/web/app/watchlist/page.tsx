import { stocks } from "@wheeldesk/core";
import { Badge, Card, PageHeader } from "@/components/ui";
import { percent } from "@/lib/utils";

export default function WatchlistPage() {
  return (
    <>
      <PageHeader title="Stock Watchlist" subtitle="Tiered watchlist with quality, liquidity, technical, fundamental, and event-risk inputs." />
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
                {["Tier", "Ticker", "Price", "50DMA", "200DMA", "RSI", "MACD", "Support", "Resistance", "Earnings", "Market Cap", "Rev Growth", "FCF", "D/E", "ROIC", "Margins", "PEG", "Moat", "Wheel", "Liquidity", "Event"].map((column) => <th key={column} className="whitespace-nowrap px-2 py-2">{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.ticker} className="border-b border-border">
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
