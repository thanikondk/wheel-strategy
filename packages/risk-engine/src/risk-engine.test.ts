import { describe, expect, it } from "vitest";
import { evaluateInstitutionalRisk, type InstitutionalRiskInput } from "./index";

const baseInput: InstitutionalRiskInput = {
  ticker: "AAPL",
  accountSize: 100_000,
  capitalRequired: 9_000,
  cashReserveAfterTrade: 60_000,
  sectorExposure: 0.2,
  tickerExposure: 0.09,
  assignmentRisk: 0.22,
  liquidityScore: 90,
  ivRank: 35,
  earningsWindow: false,
  spreadPercent: 0.04,
  positionSizePercent: 0.09,
  fundamentalScore: 85,
  userWouldOwn: true,
  dte: 30,
  delta: 0.22,
  openInterest: 1_000,
  volume: 250
};

describe("institutional risk engine", () => {
  it("approves candidates that meet hard rules and low-risk profile", () => {
    const result = evaluateInstitutionalRisk(baseInput);
    expect(result.status).toBe("APPROVED");
    expect(result.hardBlocks).toHaveLength(0);
  });

  it("blocks trades over max allocation", () => {
    const result = evaluateInstitutionalRisk({ ...baseInput, capitalRequired: 25_000, positionSizePercent: 0.25, tickerExposure: 0.25 });
    expect(result.status).toBe("BLOCKED");
    expect(result.hardBlocks.join(" ")).toContain("20% account allocation");
  });

  it("blocks trades that are not assignment-ready", () => {
    const result = evaluateInstitutionalRisk({ ...baseInput, userWouldOwn: false });
    expect(result.status).toBe("BLOCKED");
    expect(result.hardBlocks.join(" ")).toContain("would not own");
  });

  it("blocks illiquid option contracts", () => {
    const result = evaluateInstitutionalRisk({ ...baseInput, liquidityScore: 20, openInterest: 10, volume: 1 });
    expect(result.status).toBe("BLOCKED");
    expect(result.hardBlocks.join(" ")).toContain("Low liquidity");
  });
});
