import { describe, expect, it } from "vitest";
import { annualizedYield, costBasisAfterAssignment, cspCashRequirement, probabilityOfProfitFromDelta, wheelExpectancy } from "./index";

describe("calculators", () => {
  it("calculates cash-secured put collateral", () => {
    expect(cspCashRequirement(40, 2)).toBe(8000);
  });

  it("calculates assignment-adjusted cost basis", () => {
    expect(costBasisAfterAssignment(50, 1.25, 0.65)).toBeCloseTo(48.7565);
  });

  it("converts delta into probability of profit", () => {
    expect(probabilityOfProfitFromDelta(0.24)).toBeCloseTo(0.76);
  });

  it("annualizes premium yield by DTE", () => {
    expect(annualizedYield(160, 20_000, 29)).toBeCloseTo(0.1007, 3);
  });

  it("calculates expectancy with loss scenario", () => {
    expect(wheelExpectancy(0.76, 160, 550)).toBeCloseTo(-10.4);
  });
});
