import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const path = (value: string) => fileURLToPath(new URL(value, import.meta.url));

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts"],
    globals: true
  },
  resolve: {
    alias: {
      "@wheeldesk/core": path("./packages/core/src/index.ts"),
      "@wheeldesk/calculators": path("./packages/calculators/src/index.ts"),
      "@wheeldesk/risk-engine": path("./packages/risk-engine/src/index.ts"),
      "@wheeldesk/market-data": path("./packages/market-data/src/index.ts"),
      "@wheeldesk/technical-analysis": path("./packages/technical-analysis/src/index.ts"),
      "@wheeldesk/fundamental-analysis": path("./packages/fundamental-analysis/src/index.ts"),
      "@wheeldesk/options-engine": path("./packages/options-engine/src/index.ts"),
      "@wheeldesk/scoring-engine": path("./packages/scoring-engine/src/index.ts"),
      "@wheeldesk/market-regime": path("./packages/market-regime/src/index.ts"),
      "@wheeldesk/cache": path("./packages/cache/src/index.ts"),
      "@wheeldesk/decision-engine": path("./packages/decision-engine/src/index.ts"),
      "@wheeldesk/wheel-state-machine": path("./packages/wheel-state-machine/src/index.ts")
    }
  }
});
