import { cspCandidates } from "@wheeldesk/core";
import { costBasisAfterAssignment } from "@wheeldesk/calculators";
import { Badge, Card, PageHeader } from "@/components/ui";
import { currency } from "@/lib/utils";

export default function AssignmentPage() {
  const assigned = cspCandidates[1];
  const basis = costBasisAfterAssignment(assigned.strike, assigned.premium / 100);
  return (
    <>
      <PageHeader title="Assignment Manager" subtitle="Convert CSP assignment into shares, adjusted cost basis, break-even, and covered-call planning." />
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><div className="text-sm text-slate-500">Ticker</div><div className="text-2xl font-semibold">{assigned.ticker}</div></div>
          <div><div className="text-sm text-slate-500">Assigned capital</div><div className="text-2xl font-semibold">{currency(assigned.strike * 100)}</div></div>
          <div><div className="text-sm text-slate-500">Adjusted basis</div><div className="text-2xl font-semibold">${basis.toFixed(2)}</div></div>
          <div><div className="text-sm text-slate-500">Status</div><div className="mt-2"><Badge tone="positive">Assignment-ready</Badge></div></div>
        </div>
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Covered call plan: screen 20-45 DTE calls above ${basis.toFixed(2)} and avoid strikes below adjusted basis unless defensive recovery mode is explicitly enabled.</p>
      </Card>
    </>
  );
}
