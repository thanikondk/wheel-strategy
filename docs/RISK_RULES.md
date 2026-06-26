# Risk Rules

The app never treats the wheel strategy as risk-free. It uses risk-managed and assignment-ready language.

Hard blocks:

- Capital required greater than 20% of the $20,000 account.
- Cash reserve after trade below 15%.
- Earnings before expiration without explicit override.
- Delta above 0.35.
- DTE above 60.
- Very low open interest.
- Wide bid/ask spread.
- Ticker on blocked list.
- User would not own the stock long term.

Preferred CSP range:

- 20-45 DTE.
- Delta 0.15-0.30.
- IV Rank above 20.
- Probability of profit 70-85%.
- Annualized yield 15-30% after risk review.
