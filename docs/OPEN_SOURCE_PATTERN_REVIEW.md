# Open Source Pattern Review

No external code, UI, styling, branding, assets, or proprietary logic was copied into WheelDesk. Public repositories were reviewed only for architectural inspiration.

## Repository / Category: OpenBB

Useful Pattern: provider-oriented financial data platform that connects data once and exposes it to multiple surfaces.

Why It Matters: WheelDesk needs quotes, fundamentals, events, options chains, and AI-ready explanations without tying UI to any one vendor.

WheelDesk Implementation: keep UI behind application services, use normalized provider interfaces, and expose internal REST endpoints.

Risk / Caveat: OpenBB is AGPLv3. Do not copy code. Treat it only as architectural inspiration. Source reviewed: https://github.com/OpenBB-finance/OpenBB

## Repository / Category: QuantConnect Lean

Useful Pattern: separation of data, algorithm logic, portfolio/risk models, and backtesting-ready history.

Why It Matters: WheelDesk needs historical recommendation snapshots so future trade outcomes can be analyzed.

WheelDesk Implementation: persist quote, option chain, technical, fundamental, wheel score, recommendation, user decision, and outcome snapshots.

Risk / Caveat: Lean is a broad algorithmic trading engine. WheelDesk must remain research and decision support only. Source reviewed: https://github.com/QuantConnect/Lean

## Repository / Category: StockSharp

Useful Pattern: adapter-style platform architecture for market data, strategies, risk, and trading systems.

Why It Matters: WheelDesk should keep provider, broker, data, scoring, and decision concerns separate.

WheelDesk Implementation: provider adapters normalize data, domain engines score trades, and no order execution is implemented.

Risk / Caveat: avoid importing trading-execution patterns until explicitly requested. Source reviewed: https://github.com/StockSharp/StockSharp

## Repository / Category: FinRL / Quant Research Frameworks

Useful Pattern: modular research pipeline with data, environment, strategy, risk, and evaluation boundaries.

Why It Matters: WheelDesk needs reproducible ranking and future backtesting.

WheelDesk Implementation: separate market-data, technical-analysis, fundamental-analysis, options-engine, risk-engine, scoring-engine, decision-engine, and scheduler packages.

Risk / Caveat: ML-driven recommendations can become black boxes. WheelDesk scores must remain transparent. Source reviewed: https://github.com/AI4Finance-Foundation/FinRL-Trading

## Repository / Category: Wheel Strategy Tools

Useful Pattern: model the wheel as a lifecycle, not isolated trades.

Why It Matters: CSP, assignment, shares, covered calls, rolls, and called-away exits must affect cost basis and journal requirements.

WheelDesk Implementation: add a wheel state machine with explicit states, events, cost-basis updates, journal requirements, and next recommended action.

Risk / Caveat: do not copy tool-specific state names or implementation. WheelDesk uses original state/event modeling.

## Patterns To Avoid

- Direct API calls from UI components.
- Unexplained composite scores.
- Automated order execution.
- Treating premium yield as sufficient evidence.
- Recommending trades without assignment readiness.
- Copying repo UI layouts or proprietary logic.
