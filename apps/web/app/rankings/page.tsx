import { getInstitutionalService } from "@/lib/services/institutional-research-service";
import { Card, PageHeader, Badge } from "@/components/ui";
import { percent } from "@/lib/utils";

export default async function RankingsPage() {
  const service = await getInstitutionalService();
  const ranked = await service.rankCspUniverse();

  return (
    <>
      <PageHeader title="Trade Rankings" subtitle="Institutional-style daily ranking of wheel candidates by Wheel Score, risk, annualized yield, and transparent decision logic." />
      <Card>
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-slate-500">
              <tr>
                {["Rank", "Ticker", "Wheel Score", "Grade", "Risk", "Annualized Yield", "Recommendation", "Computation"].map((column) => (
                  <th key={column} className="whitespace-nowrap px-2 py-2">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((row) => (
                <tr key={row.ticker} className="border-b border-border align-top">
                  <td className="px-2 py-3 font-semibold">{row.rank}</td>
                  <td className="px-2 font-semibold">{row.ticker}</td>
                  <td className="px-2">{row.wheelScore}</td>
                  <td className="px-2"><Badge tone={row.grade === "A+" || row.grade === "A" ? "positive" : row.grade === "Avoid" ? "danger" : "caution"}>{row.grade}</Badge></td>
                  <td className="px-2">{row.riskLevel}/10</td>
                  <td className="px-2">{percent(row.annualizedYield)}</td>
                  <td className="px-2"><Badge tone={row.recommendation === "Strong Buy" || row.recommendation === "Buy" ? "positive" : row.recommendation === "Blocked" || row.recommendation === "Avoid" ? "danger" : "caution"}>{row.recommendation}</Badge></td>
                  <td className="min-w-96 px-2 text-slate-600 dark:text-slate-300">{row.explanation.join(" ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
