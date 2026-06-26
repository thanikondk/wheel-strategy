# Wheel Score Rubric

This rubric is the source of truth for WheelDesk scoring. Codex should implement this spec, not invent scoring behavior.

## Decision Semantics

- `BLOCKED`: hard rule violation. This is not a low score; it is a rule failure. Examples: over allocation cap, cash reserve below floor, illiquid chain, wide spread, earnings inside blocked window, ticker not assignment-ready.
- `AVOID`: no hard block, but score/risk profile is poor.
- `WATCH`: borderline candidate; revisit only if price, volatility, liquidity, or account exposure improves.
- `APPROVED`: passes hard rules and clears score/risk thresholds.

## Hard Limits

Defined in `RISK_LIMITS`:

- Max allocation per underlying: 20%.
- Preferred allocation: 10-15%.
- Minimum cash reserve: 15%.
- Target cash reserve: 15-30%.
- CSP DTE preferred range: 20-45.
- CSP delta preferred range: 0.15-0.30.
- Hard max delta: 0.35.
- Hard max DTE: 60.
- Minimum IV Rank: 20.
- Minimum open interest: 100.
- Preferred open interest: 500.
- Minimum volume: 20.
- Preferred volume: 100.
- Max bid/ask spread: 12%.
- Preferred bid/ask spread: 6%.
- Earnings avoidance window: 7 days.
- Poor fundamental hard-block threshold: below 50.
- Low liquidity hard-block threshold: below 45.

## Probability Method

Initial implementation uses a transparent delta proxy:

- Probability of assignment = `abs(delta)`.
- Probability of profit = `1 - abs(delta)`.

This is intentionally simple and auditable. A later model can add lognormal or Black-Scholes probability estimates, but the UI must show which method is active.

## Wheel Score Weights

- Fundamentals: 30%.
- Technicals: 20%.
- Options quality: 20%.
- Risk: 15%.
- Liquidity: 10%.
- Events: 5%.

## Option Score Inputs

The option component is derived from:

- Annualized return.
- IV Rank.
- Assignment readiness.

High yield should not automatically produce approval. Hard blocks and risk score still control final eligibility.

## Grades

- A+: 95+
- A: 85-94
- B: 75-84
- C: 60-74
- Avoid: below 60

## Ranking

Ranking order:

1. Higher Wheel Score.
2. Lower risk level.
3. Higher annualized yield.

Blocked trades can still appear for explainability, but they must be labeled `Blocked`.
