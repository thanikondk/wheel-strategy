# WheelDesk

WheelDesk is a personal learning web application for researching, screening, tracking, and journaling a risk-managed wheel strategy in a $20,000 options income account.

It is assignment-ready by design: every cash-secured put assumes assignment can happen, position size is capped, cash reserve is monitored, and trades that violate core rules are blocked.

## Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS
- shadcn-style local UI primitives, TanStack Table-ready tables, Recharts
- React Hook Form and Zod-ready validation
- Prisma ORM and PostgreSQL
- Centralized risk engine and calculator packages
- Docker, CodeBuild, CodeDeploy/ECS Fargate baseline

## Local Setup

```bash
npm install
cp .env.example .env.local
docker compose up -d postgres redis
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Current Phase

Phase 1 is implemented as a production-ready scaffold with mock data:

- Dashboard
- Stock watchlist
- CSP screener
- Covered call screener
- Trade tracker
- Assignment manager
- Calculators
- CSV export
- Risk engine
- Institutional market-data provider interfaces and mock provider
- Technical, fundamental, options, event-risk, scoring, and ranking engines
- Transparent CSP and covered call decision engine
- Wheel cycle state machine
- Daily decision dashboard at `/dashboard/daily`
- Internal REST APIs for quotes, options, fundamentals, technicals, events, risk, screeners, and Wheel Score
- Prisma schema and seed script
- Docker and AWS deployment artifacts

Phase 2 will add auth persistence flows, real market data provider adapters, alerts, and the full ECS pipeline.

## Disclaimer

This application is for education and personal research only. It is not financial advice. Options involve risk and may result in substantial losses.

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/DATA_PROVIDERS.md`
- `docs/RISK_ENGINE.md`
- `docs/SCORING_ENGINE.md`
- `docs/WHEEL_STATE_MACHINE.md`
- `docs/WHEEL_SCORE_RUBRIC.md`
- `docs/IMPLEMENTATION_SEQUENCE.md`
- `docs/DAILY_WORKFLOW.md`
- `docs/OPEN_SOURCE_PATTERN_REVIEW.md`
- `docs/CODEBASE_AUDIT.md`
