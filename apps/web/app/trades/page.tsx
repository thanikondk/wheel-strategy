import { Card, PageHeader, Badge } from "@/components/ui";
import { currency } from "@/lib/utils";

type TradeEvent = {
  id: string;
  date: string;
  ticker: string;
  strategy: string;
  action: string;
  expiration?: string;
  strike?: number;
  contracts: number;
  premium: number;
  fees: number;
  dte?: number;
  delta?: number;
  thesis: string;
  exitPlan: string;
  tags?: string[];
};

async function getTradeEvents(): Promise<TradeEvent[]> {
  return [];
}

export default async function TradesPage() {
  const tradeEvents = await getTradeEvents();
  const netPremium = tradeEvents.reduce((sum, trade) => sum + trade.premium - trade.fees, 0);
  const assignedTrades = tradeEvents.filter((trade) => trade.action.toLowerCase().includes("assigned")).length;
  const assignmentRate = tradeEvents.length === 0 ? 0 : assignedTrades / tradeEvents.length;
  const deltaTrades = tradeEvents.filter((trade) => typeof trade.delta === "number");
  const averageDelta = deltaTrades.length === 0 ? 0 : deltaTrades.reduce((sum, trade) => sum + Math.abs(trade.delta ?? 0), 0) / deltaTrades.length;
  return (
    <>
      <PageHeader title="Trade Tracker" subtitle="Track the full wheel lifecycle, required thesis fields, exit plans, mistakes, and lessons learned." />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card><div className="text-sm text-slate-500">Net premium</div><div className="mt-1 text-2xl font-semibold">{currency(netPremium)}</div></Card>
        <Card><div className="text-sm text-slate-500">Assignment rate</div><div className="mt-1 text-2xl font-semibold">{(assignmentRate * 100).toFixed(0)}%</div></Card>
        <Card><div className="text-sm text-slate-500">Average delta</div><div className="mt-1 text-2xl font-semibold">{averageDelta.toFixed(2)}</div></Card>
      </div>
      <Card>
        {tradeEvents.length === 0 ? (
          <div className="py-10 text-sm text-slate-600 dark:text-slate-300">
            No trade journal source is connected yet. WheelDesk will not display seeded trade history as real account activity.
          </div>
        ) : (
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
                  <td className="px-2">{trade.expiration ?? "-"}</td>
                  <td className="px-2">{trade.strike ?? "-"}</td>
                  <td className="px-2">{trade.contracts}</td>
                  <td className="px-2">{currency(trade.premium - trade.fees)}</td>
                  <td className="px-2">{trade.dte ?? "-"}</td>
                  <td className="px-2">{trade.delta ?? "-"}</td>
                  <td className="min-w-72 px-2">{trade.thesis}</td>
                  <td className="min-w-72 px-2">{trade.exitPlan}</td>
                  <td className="px-2"><div className="flex flex-wrap gap-1">{(trade.tags ?? []).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div></td>
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
