# Watchlist Research Framework

The current watchlist is a mock research seed, not a real researched universe.

How it is generated today:

- `packages/core/src/rules.ts` defines default Tier 1 and Tier 2 tickers.
- `packages/core/src/mock-data.ts` manually seeds AAPL, MSFT, AMD, JPM, and SOFI.
- The remaining tickers are generated with a helper function that derives technicals, support, resistance, market cap, and fundamentals from placeholder assumptions.
- The watchlist page renders those `stocks` rows directly.

Production watchlist generation should be evidence-based:

1. Universe gate
   - Exclude meme stocks, biotech binary-event names, Chinese ADRs, illiquid options, weak balance sheets, and stocks the user would not own long term.
   - Require option chains with tight spreads, usable open interest, and consistent volume.

2. Fundamental research
   - Revenue growth, earnings growth, free cash flow, margins, ROIC, ROE, debt-to-equity, current ratio, quick ratio, PEG, forward P/E, and trailing P/E.
   - Generate quality, growth, value, profitability, balance sheet, moat, dividend safety, and overall fundamental scores.

3. Technical research
   - 20/50/100/200 SMA, EMA, RSI, MACD, ATR, ADX, Bollinger Bands, VWAP, 52-week high/low, support, resistance, gap percent, and trend direction.

4. Options research
   - Expiration quality, delta, IV Rank, IV percentile, bid/ask spread, volume, open interest, expected move, probability of assignment, annualized return, and liquidity score.

5. Event research
   - Earnings window, dividend window, Fed meetings, CPI, jobs reports, and major news sentiment.

6. Wheel promotion rules
   - Tier 1 should mean high ownership quality, high liquidity, manageable event risk, and assignment readiness.
   - Tier 2 should mean research-worthy but less durable, more volatile, lower quality, or requiring smaller sizing.
   - Avoid means blocked by quality, liquidity, event, sizing, or assignment-readiness rules.

The goal is not to display a large stock list. The goal is to answer whether a ticker deserves capital in a $20,000 account before screening any CSP.
