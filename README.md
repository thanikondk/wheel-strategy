# WheelDesk

WheelDesk is a personal learning web application for researching, screening, tracking, and journaling a risk-managed wheel strategy.

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

## Live Data Configuration

WheelDesk does not display seeded trades as real account activity. Market data is selected through `WHEEL_MARKET_DATA_PROVIDER`.

```bash
WHEEL_MARKET_DATA_PROVIDER="yahoo-dev"
WHEEL_ACCOUNT_VALUE="20000"
WHEEL_CASH_AVAILABLE="15850"
WHEEL_WATCHLIST_TICKERS="AAPL,MSFT,AMD,JPM"
WHEEL_OWNABLE_TICKERS="AAPL,MSFT,AMD,JPM"
WHEEL_COVERED_CALL_POSITIONS='[{"ticker":"AAPL","shares":100,"adjustedCostBasis":202.85}]'
```

`yahoo-dev` uses public Yahoo Finance endpoints for local research only. For production, use a licensed provider such as Tradier, Polygon, Alpha Vantage, or Financial Modeling Prep after implementing that adapter's normalization layer.

## AWS Deployment

Terraform infrastructure lives in `infra/terraform/envs/dev`.

```bash
cd infra/terraform/envs/dev
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
../../../../scripts/deploy-aws.sh
```

The stack creates VPC networking, ALB, ECS Fargate, ECR, RDS PostgreSQL, ElastiCache Redis, Secrets Manager, CloudWatch logs, and an EventBridge Scheduler placeholder for future snapshot jobs.

To quickly destroy the dev stack and stop AWS charges:

```bash
AWS_PROFILE=wheeldesk scripts/destroy-aws.sh --yes
```

## Current Phase

Phase 1 is implemented as a production-ready scaffold with provider abstractions:

- Dashboard
- Stock watchlist
- CSP screener
- Covered call screener
- Trade tracker
- Assignment manager
- Calculators
- CSV export
- Risk engine
- Institutional market-data provider interfaces, mock provider, and Yahoo development provider
- Technical, fundamental, options, event-risk, scoring, and ranking engines
- Transparent CSP and covered call decision engine
- Wheel cycle state machine
- Daily decision dashboard at `/dashboard/daily`
- Internal REST APIs for quotes, options, fundamentals, technicals, events, risk, screeners, and Wheel Score
- Prisma schema and seed script
- Docker and AWS deployment artifacts

Phase 2 will add auth persistence flows, licensed provider adapters, broker/journal ingestion, alerts, and the full ECS pipeline.

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
