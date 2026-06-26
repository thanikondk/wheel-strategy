export type WheelState =
  | "WATCHING" | "CSP_PLANNED" | "CSP_OPEN" | "CSP_PROFIT_TAKEN" | "CSP_EXPIRED" | "CSP_ASSIGNED"
  | "SHARES_OWNED" | "CC_PLANNED" | "CC_OPEN" | "CC_PROFIT_TAKEN" | "CC_EXPIRED" | "SHARES_CALLED_AWAY"
  | "WHEEL_COMPLETED" | "PAUSED" | "CLOSED";

export type WheelEvent =
  | "planCsp" | "openCsp" | "closeCsp" | "expireCsp" | "assignShares" | "planCoveredCall" | "openCoveredCall"
  | "closeCoveredCall" | "expireCoveredCall" | "sharesCalledAway" | "pauseCycle" | "closeCycle";

export type WheelCycleContext = {
  ticker: string;
  state: WheelState;
  premiumsCollected: number;
  sharesOwned: number;
  adjustedCostBasis: number;
  realizedPnl: number;
  unrealizedPnl: number;
  journalRequired: boolean;
  nextRecommendedAction: string;
};

const transitions: Record<WheelState, Partial<Record<WheelEvent, WheelState>>> = {
  WATCHING: { planCsp: "CSP_PLANNED", pauseCycle: "PAUSED", closeCycle: "CLOSED" },
  CSP_PLANNED: { openCsp: "CSP_OPEN", closeCycle: "CLOSED", pauseCycle: "PAUSED" },
  CSP_OPEN: { closeCsp: "CSP_PROFIT_TAKEN", expireCsp: "CSP_EXPIRED", assignShares: "CSP_ASSIGNED", pauseCycle: "PAUSED" },
  CSP_PROFIT_TAKEN: { planCsp: "CSP_PLANNED", closeCycle: "CLOSED" },
  CSP_EXPIRED: { planCsp: "CSP_PLANNED", closeCycle: "CLOSED" },
  CSP_ASSIGNED: { assignShares: "SHARES_OWNED", planCoveredCall: "CC_PLANNED" },
  SHARES_OWNED: { planCoveredCall: "CC_PLANNED", closeCycle: "CLOSED", pauseCycle: "PAUSED" },
  CC_PLANNED: { openCoveredCall: "CC_OPEN", pauseCycle: "PAUSED" },
  CC_OPEN: { closeCoveredCall: "CC_PROFIT_TAKEN", expireCoveredCall: "CC_EXPIRED", sharesCalledAway: "SHARES_CALLED_AWAY" },
  CC_PROFIT_TAKEN: { planCoveredCall: "CC_PLANNED", closeCycle: "CLOSED" },
  CC_EXPIRED: { planCoveredCall: "CC_PLANNED", closeCycle: "CLOSED" },
  SHARES_CALLED_AWAY: { closeCycle: "WHEEL_COMPLETED" },
  WHEEL_COMPLETED: {},
  PAUSED: { planCsp: "CSP_PLANNED", planCoveredCall: "CC_PLANNED", closeCycle: "CLOSED" },
  CLOSED: {}
};

export function transitionWheelCycle(context: WheelCycleContext, event: WheelEvent, payload: { premium?: number; shares?: number; strike?: number; marketPrice?: number; fees?: number } = {}): WheelCycleContext {
  const nextState = transitions[context.state][event];
  if (!nextState) throw new Error(`Invalid wheel transition: ${context.state} -> ${event}`);
  const premium = payload.premium ?? 0;
  const fees = payload.fees ?? 0;
  const shares = payload.shares ?? 0;
  const strike = payload.strike ?? context.adjustedCostBasis;
  const marketPrice = payload.marketPrice ?? strike;
  const premiumsCollected = context.premiumsCollected + premium - fees;
  const sharesOwned = event === "assignShares" ? context.sharesOwned + shares : event === "sharesCalledAway" ? 0 : context.sharesOwned;
  const adjustedCostBasis = event === "assignShares" && shares > 0 ? strike - premiumsCollected / shares : context.adjustedCostBasis;
  const realizedPnl = event === "sharesCalledAway" ? context.realizedPnl + (strike - context.adjustedCostBasis) * context.sharesOwned + premium - fees : context.realizedPnl + (event.includes("close") ? premium - fees : 0);
  const unrealizedPnl = sharesOwned > 0 ? (marketPrice - adjustedCostBasis) * sharesOwned : 0;

  return {
    ...context,
    state: nextState,
    premiumsCollected,
    sharesOwned,
    adjustedCostBasis,
    realizedPnl,
    unrealizedPnl,
    journalRequired: true,
    nextRecommendedAction: nextAction(nextState)
  };
}

function nextAction(state: WheelState) {
  switch (state) {
    case "CSP_PLANNED": return "Validate risk rules and journal thesis before opening CSP.";
    case "CSP_OPEN": return "Monitor 50% profit target, 14 DTE, breach risk, and assignment readiness.";
    case "SHARES_OWNED": return "Screen covered calls above adjusted cost basis.";
    case "CC_OPEN": return "Monitor covered call profit target and called-away risk.";
    case "WHEEL_COMPLETED": return "Review journal, realized P&L, and lessons learned.";
    default: return "Review current cycle state and risk rules.";
  }
}
