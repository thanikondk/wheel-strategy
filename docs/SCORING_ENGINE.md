# Scoring Engine

Wheel Score is transparent and component-based.

Canonical scoring details live in `docs/WHEEL_SCORE_RUBRIC.md` and `packages/core/src/rules.ts`.

Current weights:

- Fundamentals: 30%.
- Technicals: 20%.
- Options quality: 20%.
- Risk: 15%.
- Liquidity: 10%.
- Events: 5%.

Every score should expose:

- Component scores.
- Component weights.
- Positive factors.
- Negative factors.
- Hard rule violations.
- Final decision reasoning.

Scores are decision support, not financial advice.
