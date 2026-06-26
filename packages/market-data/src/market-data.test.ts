import { describe, expect, it } from "vitest";
import { MockInstitutionalDataProvider } from "./adapters/mock";
import { evaluateEventRisk } from "./event-risk";

describe("market data provider", () => {
  it("normalizes mock quote and option chain data", async () => {
    const provider = new MockInstitutionalDataProvider();
    const quote = await provider.getQuote("AAPL");
    const chain = await provider.getOptionChain("AAPL", "2026-07-24");
    expect(quote.ticker).toBe("AAPL");
    expect(chain[0].breakEven).toBeLessThan(chain[0].strike);
  });

  it("evaluates event windows", () => {
    const risk = evaluateEventRisk({
      ticker: "AAPL",
      earnings: [{ ticker: "AAPL", date: "2026-07-03", time: "after_close" }],
      dividends: [],
      economicEvents: [],
      now: new Date("2026-06-30")
    });
    expect(risk.insideEarningsWindow).toBe(true);
    expect(risk.score).toBeLessThan(100);
  });
});
