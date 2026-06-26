# Data Providers

`packages/market-data/src/providers.ts` defines institutional provider contracts for stocks, options, fundamentals, events, and news.

Current implementation:

- `MockInstitutionalDataProvider`

Planned adapters:

- Polygon.io
- Tradier
- Alpha Vantage
- Financial Modeling Prep
- Yahoo-compatible unofficial provider for local learning only

No proprietary keys are committed. Use environment variables from `.env.example`.

All adapters must translate provider-specific payloads into normalized models before data reaches analytics:

- `Quote`
- `HistoricalBar`
- `NormalizedOptionContract`
- `CompanyProfile`
- `FinancialMetrics`
- `EarningsEvent`
- `DividendEvent`
- `EconomicEvent`
- `NewsItem`
- `NewsSentiment`

UI code must not import adapters directly. Use application services and provider interfaces.
