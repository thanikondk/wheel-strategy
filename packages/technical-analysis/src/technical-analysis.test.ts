import { describe, expect, it } from "vitest";
import { analyzeTechnicals } from "./index";

describe("technical analysis", () => {
  it("computes indicators with transparent score", () => {
    const bars = Array.from({ length: 252 }, (_, index) => ({
      date: `2026-01-${String((index % 28) + 1).padStart(2, "0")}`,
      open: 100 + index * 0.1,
      high: 101 + index * 0.1,
      low: 99 + index * 0.1,
      close: 100 + index * 0.1,
      volume: 1_000_000
    }));
    const result = analyzeTechnicals(bars);
    expect(result.sma20).toBeGreaterThan(result.sma200);
    expect(result.score).toBeGreaterThan(50);
    expect(result.explanation.length).toBeGreaterThan(0);
  });
});
