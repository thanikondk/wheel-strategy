import { describe, expect, it } from "vitest";
import { getInstitutionalService } from "./institutional-research-service";

describe("institutional research service decision consistency", () => {
  it("uses the same CSP final decision in screener and rankings", async () => {
    const service = await getInstitutionalService();
    const [screened, ranked] = await Promise.all([
      service.screenCspCandidates(["AAPL"]),
      service.rankCspUniverse(["AAPL"])
    ]);

    expect(screened[0].risk.status).toBe(ranked[0].finalDecision);
    expect(screened[0].decision?.finalDecision).toBe(ranked[0].finalDecision);
  });
});
