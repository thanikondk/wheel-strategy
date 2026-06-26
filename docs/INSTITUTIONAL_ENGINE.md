# Institutional Data and Decision Engine

WheelDesk now follows this flow:

UI -> Application Services -> Business Logic -> Provider Interfaces -> External APIs

The central service is `apps/web/lib/services/institutional-research-service.ts`. It builds a recommendation by combining:

- Quote and option chain normalization.
- Historical bars and technical analysis.
- Company profile and fundamental analysis.
- Event risk analysis.
- Option analytics.
- Institutional hard-rule risk evaluation.
- Wheel Score and trade ranking.

Every recommendation includes transparent calculations and explanations. Scores are weighted as:

- 30% fundamentals.
- 20% technicals.
- 20% options.
- 15% risk.
- 10% liquidity.
- 5% events.

Internal REST endpoints:

- `/api/quotes`
- `/api/options`
- `/api/fundamentals`
- `/api/wheel-score`
- `/api/risk`
- `/api/screeners`
- `/api/technical`
- `/api/events`

The trade ranking engine ranks CSP candidates across the watchlist by Wheel Score, risk level, and annualized yield. This is intended to become the daily workflow centerpiece.
