# Risk Engine

WheelDesk risk evaluation is capital-preservation-first.

Canonical hard limits live in `RISK_LIMITS` in `packages/core/src/rules.ts`.

Hard blocks:

- Capital required exceeds 20% of account.
- Cash reserve after trade falls below 15%.
- Low option liquidity.
- Wide bid/ask spread.
- Poor fundamentals.
- Stock is not marked would-own-long-term.
- Earnings are inside the configured risk window without override.

Risk outputs include:

- Risk level.
- Confidence.
- Final trade status.
- Hard block list.
- Human-readable reasoning.

The engine does not claim the wheel strategy is risk-free. Assignment is assumed possible for every CSP.
