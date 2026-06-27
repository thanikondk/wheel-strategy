import { Card, PageHeader } from "@/components/ui";

export default function AssignmentPage() {
  return (
    <>
      <PageHeader title="Assignment Manager" subtitle="Convert real CSP assignments into shares, adjusted cost basis, break-even, and covered-call planning." />
      <Card>
        <div className="py-10 text-sm text-slate-600 dark:text-slate-300">
          No assignment journal source is connected yet. WheelDesk will not display seeded assignments as real account activity.
        </div>
      </Card>
    </>
  );
}
