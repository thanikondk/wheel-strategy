# Architecture

WheelDesk is a TypeScript monorepo.

- `apps/web`: Next.js App Router UI and API routes.
- `packages/core`: account rules, types, mock data, and market data provider interfaces.
- `packages/market-data`: normalized market models, provider interfaces, mock provider, and provider adapter boundaries.
- `packages/technical-analysis`: SMA, EMA, RSI, MACD, ATR, Bollinger Bands, support/resistance, trend, and technical scoring.
- `packages/fundamental-analysis`: quality, growth, value, profitability, balance sheet, moat, dividend safety, and overall fundamental scoring.
- `packages/options-engine`: option-level analytics including annualized return, collateral, break-even, IV Rank, liquidity, and assignment probability.
- `packages/scoring-engine`: transparent Wheel Score, grade, and daily trade ranking engine.
- `packages/market-regime`: automatic or manually overridden market regime classification.
- `packages/cache`: Redis-compatible cache interface with institutional TTL policy.
- `packages/scheduler`: background job registry for morning and market-hours refreshes.
- `packages/database`: analytics repository abstraction for snapshots and recommendations.
- `packages/notifications`: structured CloudWatch-compatible logging and metrics.
- `packages/risk-engine`: centralized trade scoring and recommendation summaries.
- `packages/calculators`: pure financial calculators with unit tests.
- `packages/db`: Prisma schema and seed script.
- `infra/aws`: CloudFormation baseline for ECS Fargate, RDS, Secrets Manager, S3 artifacts, IAM, and CloudWatch.

Data providers use interfaces first:

- `StockDataProvider`
- `OptionDataProvider`
- `FundamentalsProvider`
- `EarningsCalendarProvider`

The mock provider is active for local learning. Polygon, Tradier, Alpha Vantage, Financial Modeling Prep, and Yahoo-compatible local adapters can be added behind the same interfaces without changing UI pages.

The UI calls internal application services only. Services compose cache, providers, analytics engines, scoring, risk, and persistence. External provider payloads never cross into UI or business scoring contracts.
