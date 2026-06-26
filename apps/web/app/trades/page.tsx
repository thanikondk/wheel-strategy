import { tradeEvents } from "@wheeldesk/core";
import { Card, PageHeader, Badge } from "@/components/ui";
import { currency } from "@/lib/utils";

export default function TradesPage() {
  const netPremium = tradeEvents.reduce((sum, trade) => sum + trade.premium - trade.fees, 0);
  return (
    <>
      <PageHeader title="Trade Tracker" subtitle="Track the full wheel lifecycle, required thesis fields, exit plans, mistakes, and lessons learned." />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card><div className="text-sm text-slate-500">Net premium</div><div className="mt-1 text-2xl font-semibold">{currency(netPremium)}</div></Card>
        <Card><div className="text-sm text-slate-500">Assignment rate</div><div className="mt-1 text-2xl font-semibold">0%</div></Card>
        <Card><div className="text-sm text-slate-500">Average delta</div><div className="mt-1 text-2xl font-semibold">0.22</div></Card>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-slate-500">
              <tr>{["Date", "Ticker", "Strategy", "Action", "Expiration", "Strike", "Contracts", "Premium", "DTE", "Delta", "Thesis", "Exit Plan", "Tags"].map((column) => <th key={column} className="whitespace-nowrap px-2 py-2">{column}</th>)}</tr>
            </thead>
            <tbody>
              {tradeEvents.map((trade) => (
                <tr key={trade.id} className="border-b border-border align-top">
                  <td className="px-2 py-3">{trade.date}</td>
                  <td className="px-2 font-semibold">{trade.ticker}</td>
                  <td className="px-2">{trade.strategy}</td>
                  <td className="px-2">{trade.action}</td>
                  <td className="px-2">{trade.expiration}</td>
                  <td className="px-2">{trade.strike}</td>
                  <td className="px-2">{trade.contracts}</td>
                  <td className="px-2">{currency(trade.premium - trade.fees)}</td>
                  <td className="px-2">{trade.dte}</td>
                  <td className="px-2">{trade.delta}</td>
                  <td className="min-w-72 px-2">{trade.thesis}</td>
                  <td className="min-w-72 px-2">{trade.exitPlan}</td>
                  <td className="px-2"><div className="flex flex-wrap gap-1">{trade.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
