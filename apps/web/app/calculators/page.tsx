import { annualizedYield, bidAskSpreadPercent, calledAwayReturn, costBasisAfterAssignment, cspCashRequirement, ivRank, positionSizeContracts, premiumYield, probabilityOfProfitFromDelta, thetaDecayEstimate, wheelExpectancy } from "@wheeldesk/calculators";
import { Card, PageHeader } from "@/components/ui";
import { currency, percent } from "@/lib/utils";

const calculators = [
  ["Premium yield", percent(premiumYield(160, 20_000))],
  ["CSP cash requirement", currency(cspCashRequirement(200, 1))],
  ["Assignment probability", percent(1 - probabilityOfProfitFromDelta(0.24))],
  ["Cost basis after assignment", `$${costBasisAfterAssignment(200, 1.6, 0.65).toFixed(2)}`],
  ["IV Rank", `${ivRank(0.34, 0.18, 0.62).toFixed(1)}`],
  ["Delta to PoP", percent(probabilityOfProfitFromDelta(0.24))],
  ["Theta decay estimate", `$${thetaDecayEstimate(2.4, -0.05, 10).toFixed(2)}`],
  ["Position sizing", `${positionSizeContracts(20_000, 0.2, 140)} contract(s)`],
  ["Covered call max return", percent(calledAwayReturn(225, 202.85, 1.46))],
  ["Liquidity spread", percent(bidAskSpreadPercent(1.56, 1.63))],
  ["Wheel expectancy", currency(wheelExpectancy(0.76, 160, 550))]
];

export default function CalculatorsPage() {
  return (
    <>
      <PageHeader title="Calculators" subtitle="Reusable calculators for yield, assignment, cost basis, liquidity, allocation, covered calls, and expectancy." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {calculators.map(([label, value]) => (
          <Card key={label}>
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </Card>
        ))}
      </div>
    </>
  );
}
