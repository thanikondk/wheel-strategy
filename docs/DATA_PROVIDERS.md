# Data Providers

`packages/market-data/src/providers.ts` defines institutional provider contracts for stocks, options, fundamentals, events, and news.

Current implementation:

- `MockInstitutionalDataProvider`
- `YahooDevelopmentAdapter` for local research quotes, historical bars, option chains, expirations, expected move, Yahoo-provided earnings/dividend dates, and Yahoo Finance news

Planned adapters:

- Polygon.io
- Tradier
- Alpha Vantage
- Financial Modeling Prep

No proprietary keys are committed. Use environment variables from `.env.example`.

Provider selection:

- `WHEEL_MARKET_DATA_PROVIDER=yahoo-dev` uses public Yahoo Finance endpoints for local research.
- `WHEEL_MARKET_DATA_PROVIDER=mock` is explicit mock mode for tests and demos only.
- `tradier`, `polygon`, `alpha-vantage`, and `fmp` are adapter boundaries until provider-specific normalization is implemented.

Account and portfolio inputs are not market data. Configure them separately with `WHEEL_ACCOUNT_VALUE`, `WHEEL_CASH_AVAILABLE`, `WHEEL_OWNABLE_TICKERS`, and `WHEEL_COVERED_CALL_POSITIONS`, or wire them to a broker/journal store in a later phase.

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
