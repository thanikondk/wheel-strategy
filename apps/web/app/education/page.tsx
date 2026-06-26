import { DISCLAIMER } from "@wheeldesk/core";
import { Card, PageHeader } from "@/components/ui";

const lessons = [
  "Wheel strategy basics",
  "Cash-secured puts explained",
  "Covered calls explained",
  "Assignment explained",
  "How to choose tickers",
  "How to choose strike and expiration",
  "Why high premium can be dangerous",
  "How to avoid value traps",
  "Risk management",
  "Rolling rules",
  "Taxes overview",
  "Trading journal guide"
];

export default function EducationPage() {
  return (
    <>
      <PageHeader title="Education" subtitle="Original learning notes focused on risk-managed, capital-preservation-first options research." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lessons.map((lesson) => (
          <Card key={lesson}>
            <h2 className="font-semibold">{lesson}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Study assignment readiness, liquidity, position sizing, exit planning, and maximum loss scenarios before placing any trade.</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
        {DISCLAIMER}
      </Card>
    </>
  );
}
