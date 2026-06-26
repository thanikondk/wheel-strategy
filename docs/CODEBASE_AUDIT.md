# Codebase Audit

## What Exists

- Next.js App Router web app with dashboard, watchlist, CSP screener, covered call screener, rankings, trades, calculators, assignment, education, and daily dashboard pages.
- Modular packages for core rules/data, market data, technical analysis, fundamental analysis, options analytics, scoring, risk, cache, scheduler, notifications, decision engine, and wheel state machine.
- Mock provider mode for local development.
- Internal API routes for quotes, options, fundamentals, risk, technicals, events, screeners, trades, and wheel score.
- Prisma schema with account, watchlist, stock, option, trade, cycle, position, assignment, covered call, journal, alerts, and snapshot tables.
- Tests for calculators, risk hard blocks, market-data normalization, scoring, cache, decision engine, technical analysis, and state transitions.

## Missing Or Incomplete

### P0

- Real provider adapters are boundaries only. Tradier, Polygon, Alpha Vantage, FMP, and Yahoo development adapters still need response normalization.
- Dashboard portfolio data is localStorage-only; it is not persisted through Prisma yet.
- Watchlist data is mock seeded. It must not be treated as researched live data.
- Covered call ranking is not fully integrated with user share positions.
- Decision engine is pure domain logic, but it is not yet wired into every screener row.

Risk of change: medium-high. These areas affect trade decision correctness and user trust.

### P1

- Provider fallback strategy exists as a utility but is not deeply integrated into application services.
- Scheduler registry exists, but no real cron/queue worker is wired.
- Snapshot models exist, but API/service persistence is not implemented.
- Explainability is present in score/decision objects but not uniformly rendered across UI.
- Security is basic. Auth and rate limiting are not implemented.

Risk of change: medium. These are architectural integrations rather than isolated calculations.

### P2

- UI tables are simple HTML tables rather than fully TanStack-managed advanced filters.
- Alerting is documented but not operational.
- AWS template is baseline only and not yet complete production infrastructure.
- E2E tests exist only as a smoke scaffold.
- Audit logging for trade changes is not implemented.

Risk of change: low-medium. These improve operational quality and user experience.

## Hardcoded Assumptions

- Default account rule set assumes a $20,000 account.
- Mock market data uses formula-generated placeholder metrics.
- Daily dashboard uses mock market regime text.
- Sector concentration and existing exposure are placeholders in some service calculations.

## Provider Coupling

The UI does not directly call external providers. The current issue is not UI coupling; it is incomplete provider adapter implementation behind the provider interfaces.

## Calculation Weaknesses

- Probability of assignment uses delta as a transparent proxy, not a full options model.
- IV Rank can use simplified high/low assumptions until historical IV data is persisted.
- Support/resistance from mock data is placeholder logic.
- Covered call downside/upside measures need better portfolio-aware treatment.

## Priority Ranking

- P0: Replace mock watchlist decisions with provider-backed research snapshots.
- P0: Persist portfolio, trades, and recommendations.
- P0: Wire decision engine into CSP and covered call screeners.
- P1: Add provider fallback/retry/health to all service calls.
- P1: Render explainability panels for every recommendation.
- P1: Implement covered call ranking from actual owned shares.
- P2: Expand E2E tests, alerts, and AWS deployment polish.
