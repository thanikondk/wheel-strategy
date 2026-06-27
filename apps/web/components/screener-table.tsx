"use client";

import { Download, Plus, SlidersHorizontal } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { currency, percent } from "@/lib/utils";
import type { OptionCandidate } from "@wheeldesk/core";
import type { ExplainableDecision } from "@wheeldesk/decision-engine";

type ScreenerRisk = {
  score: number;
  confidence: "Low" | "Medium" | "High";
  status: "APPROVED" | "WATCH" | "AVOID" | "BLOCKED";
  reasons: string[];
  hardBlocks: string[];
  spreadPercent: number;
  capitalRequired: number;
  allocationPercent: number;
};

export function ScreenerTable({ rows }: { rows: Array<OptionCandidate & { risk: ScreenerRisk; decision?: ExplainableDecision }> }) {
  function exportCsv() {
    const header = ["Ticker", "Price", "Expiration", "DTE", "Strike", "Delta", "Premium", "IV Rank", "PoP", "Annualized Yield", "Capital Required", "OI", "Volume", "Spread %", "Earnings Risk", "Score", "Action", "Reason"];
    const body = rows.map((row) => [
      row.ticker,
      row.currentPrice,
      row.expiration,
      row.dte,
      row.strike,
      row.delta,
      row.premium,
      row.ivRank,
      row.probabilityOfProfit,
      row.annualizedYield,
      row.risk.capitalRequired,
      row.openInterest,
      row.volume,
      row.risk.spreadPercent,
      row.earningsBeforeExpiration ? "Yes" : "No",
      row.risk.score,
      row.risk.status,
      row.decision?.summary ?? row.risk.reasons.join(" ")
    ]);
    const csv = [header, ...body].map((line) => line.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "wheeldesk-csp-screener.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button className="bg-slate-800"><SlidersHorizontal className="h-4 w-4" /> Presets</Button>
        <Button onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
      </div>
      {rows.length === 0 ? (
        <div className="py-10 text-sm text-slate-600 dark:text-slate-300">
          No CSP candidates are available. Configure live provider settings, account values, watchlist tickers, and assignment-ready tickers.
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="text-sm">
          <thead className="border-b border-border text-left text-xs uppercase text-slate-500">
            <tr>
              {["Ticker", "Price", "Expiration", "DTE", "Strike", "Delta", "Premium", "IV Rank", "PoP", "Ann Yield", "Capital", "OI", "Volume", "Spread", "Earnings", "Score", "Action", "Reason"].map((column) => <th className="whitespace-nowrap px-2 py-2" key={column}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.ticker}-${row.strike}-${row.expiration}`} className="border-b border-border">
                <td className="px-2 py-3 font-semibold">{row.ticker}</td>
                <td className="px-2">${row.currentPrice.toFixed(2)}</td>
                <td className="px-2">{row.expiration}</td>
                <td className="px-2">{row.dte}</td>
                <td className="px-2">${row.strike}</td>
                <td className="px-2">{row.delta.toFixed(2)}</td>
                <td className="px-2">{currency(row.premium)}</td>
                <td className="px-2">{row.ivRank}</td>
                <td className="px-2">{percent(row.probabilityOfProfit)}</td>
                <td className="px-2">{percent(row.annualizedYield)}</td>
                <td className="px-2">{currency(row.risk.capitalRequired)}</td>
                <td className="px-2">{row.openInterest}</td>
                <td className="px-2">{row.volume}</td>
                <td className="px-2">{percent(row.risk.spreadPercent)}</td>
                <td className="px-2">{row.earningsBeforeExpiration ? <Badge tone="caution">Review</Badge> : <Badge tone="positive">Clear</Badge>}</td>
                <td className="px-2">{row.risk.score}/10</td>
                <td className="px-2"><Badge tone={row.risk.status === "APPROVED" ? "positive" : row.risk.status === "WATCH" ? "caution" : "danger"}>{row.risk.status}</Badge></td>
                <td className="px-2"><button aria-label="Add planned CSP"><Plus className="h-4 w-4" /></button></td>
                <td className="min-w-80 px-2 text-slate-600 dark:text-slate-300">
                  {row.decision?.hardRuleViolations.length ? row.decision.hardRuleViolations.join(" ") : row.decision?.positiveFactors.join(" ") || row.risk.reasons.join(" ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </>
  );
}
