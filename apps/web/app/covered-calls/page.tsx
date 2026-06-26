import { coveredCallCandidates } from "@wheeldesk/core";
import { Badge, Card, PageHeader } from "@/components/ui";
import { currency, percent } from "@/lib/utils";

export default function CoveredCallsPage() {
  return (
    <>
      <PageHeader title="Covered Call Screener" subtitle="Screens owned-share calls and blocks below-basis strikes unless defensive recovery mode is intentionally enabled." />
      <Card>
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-slate-500">
              <tr>{["Ticker", "Cost Basis", "Adjusted Basis", "Strike", "Expiration", "DTE", "Delta", "Premium", "Max Profit", "Called-Away Return", "Rule"].map((column) => <th key={column} className="whitespace-nowrap px-2 py-2">{column}</th>)}</tr>
            </thead>
            <tbody>
              {coveredCallCandidates.map((row) => (
                <tr key={`${row.ticker}-${row.strike}`} className="border-b border-border">
                  <td className="px-2 py-3 font-semibold">{row.ticker}</td>
                  <td className="px-2">${row.costBasis}</td>
                  <td className="px-2">${row.adjustedCostBasis}</td>
                  <td className="px-2">${row.strike}</td>
                  <td className="px-2">{row.expiration}</td>
                  <td className="px-2">{row.dte}</td>
                  <td className="px-2">{row.delta.toFixed(2)}</td>
                  <td className="px-2">{currency(row.premium)}</td>
                  <td className="px-2">{currency(row.maxProfit)}</td>
                  <td className="px-2">{percent(row.calledAwayReturn)}</td>
                  <td className="px-2">{row.strike >= row.adjustedCostBasis ? <Badge tone="positive">Above basis</Badge> : <Badge tone="danger">Blocked</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
