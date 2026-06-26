import { Card, PageHeader } from "@/components/ui";
import { ScreenerTable } from "@/components/screener-table";
import { getInstitutionalService } from "@/lib/services/institutional-research-service";

export default async function CspScreenerPage() {
  const service = await getInstitutionalService();
  const rows = await service.screenCspCandidates();

  return (
    <>
      <PageHeader title="Cash-Secured Put Screener" subtitle="Screens 20-45 DTE, 0.15-0.30 delta candidates with allocation, liquidity, earnings, and assignment-readiness checks." />
      <Card><ScreenerTable rows={rows} /></Card>
    </>
  );
}
