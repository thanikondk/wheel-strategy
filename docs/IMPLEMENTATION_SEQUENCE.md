# Implementation Sequence

WheelDesk should be developed in review-gated phases. Avoid bundling audit, providers, scoring, state machines, dashboards, persistence, and deployment in one pass.

## Phase 1: Audit Only

Output: `docs/CODEBASE_AUDIT.md`

No code changes. Review findings before implementation.

## Phase 2: Pattern Review Only

Output: `docs/OPEN_SOURCE_PATTERN_REVIEW.md`

Use public projects only as architectural inspiration. Do not copy code, UI, styling, text, or assets.

## Phase 3: Data Architecture

Implement provider interfaces, normalized models, mock provider, provider errors, retry, fallback, and health checks.

Review gate: no decision logic until provider contracts are stable.

## Phase 4: Risk And Decision Rubric

Implement `RISK_LIMITS`, `DECISION_THRESHOLDS`, and `WHEEL_SCORE_RUBRIC`.

Review gate: thresholds must be understandable before being wired into recommendations.

## Phase 5: Decision Engine

Implement CSP and covered call decisions with transparent calculations, hard blocks, reasoning, what-could-go-wrong, and exit plans.

## Phase 6: Ranking Engine

Rank CSP and covered call candidates across the watchlist using the approved rubric.

## Phase 7: Wheel State Machine

Track lifecycle transitions, premiums, shares, adjusted cost basis, P&L, journal requirements, and next actions.

## Phase 8: Daily Dashboard

Build the daily review workflow only after rankings and risk semantics are stable.

## Phase 9: Persistence And Backtesting Snapshots

Persist quote, option chain, technical, fundamental, score, recommendation, user decision, and outcome snapshots.

## Phase 10: Explainability Wiring

Render score components, weights, positive factors, negative factors, hard blocks, and final decision reasoning throughout the UI.

## Phase 11: AWS Deployment Hardening

Use EventBridge scheduled jobs for daily snapshot runs, ECS Fargate or Lambda for workers depending on runtime needs, Secrets Manager for provider keys, RDS PostgreSQL for portfolio/journal/snapshots, CloudWatch for logs/metrics, and least-privilege IAM.
