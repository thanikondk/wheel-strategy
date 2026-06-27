import { createMarketDataProvider, type ProviderName } from "@wheeldesk/market-data";
import { evaluateEventRisk } from "@wheeldesk/market-data";
import type { NormalizedOptionContract } from "@wheeldesk/market-data";
import { analyzeFundamentals } from "@wheeldesk/fundamental-analysis";
import { analyzeOption } from "@wheeldesk/options-engine";
import { decideCashSecuredPut, decideCoveredCall } from "@wheeldesk/decision-engine";
import { evaluateInstitutionalRisk } from "@wheeldesk/risk-engine";
import { calculateWheelScore, rankTrades } from "@wheeldesk/scoring-engine";
import { analyzeTechnicals } from "@wheeldesk/technical-analysis";
import { InMemoryCacheStore, DEFAULT_CACHE_TTLS } from "@wheeldesk/cache";
import { CloudWatchCompatibleLogger } from "@wheeldesk/notifications";

const cache = new InMemoryCacheStore();
const logger = new CloudWatchCompatibleLogger();

type AccountConfig = {
  accountValue: number;
  cashAvailable: number;
};

type OwnedPosition = {
  ticker: string;
  shares: number;
  adjustedCostBasis: number;
};

function dte(expiration: string) {
  return Math.max(1, Math.ceil((new Date(expiration).getTime() - Date.now()) / 86_400_000));
}

function accountAwareEventWindow() {
  return Number(process.env.WHEEL_EVENT_WINDOW_DAYS ?? 7);
}

function configuredProviderName(): ProviderName {
  const provider = process.env.WHEEL_MARKET_DATA_PROVIDER ?? process.env.MARKET_DATA_PROVIDER ?? "yahoo-dev";
  if (["mock", "tradier", "polygon", "alpha-vantage", "fmp", "yahoo-dev"].includes(provider)) {
    return provider as ProviderName;
  }
  throw new Error(`Unsupported market data provider: ${provider}`);
}

function configuredAccount(): AccountConfig {
  const accountValue = Number(process.env.WHEEL_ACCOUNT_VALUE);
  const cashAvailable = Number(process.env.WHEEL_CASH_AVAILABLE);
  if (!Number.isFinite(accountValue) || accountValue <= 0 || !Number.isFinite(cashAvailable) || cashAvailable < 0) {
    throw new Error("Configure WHEEL_ACCOUNT_VALUE and WHEEL_CASH_AVAILABLE before generating trade decisions.");
  }
  return { accountValue, cashAvailable };
}

function configuredWatchlist(defaultTickers: string[] = []) {
  const raw = process.env.WHEEL_WATCHLIST_TICKERS;
  if (!raw) return defaultTickers;
  return raw.split(",").map((ticker) => ticker.trim().toUpperCase()).filter(Boolean);
}

function configuredOwnableTickers() {
  return new Set((process.env.WHEEL_OWNABLE_TICKERS ?? "").split(",").map((ticker) => ticker.trim().toUpperCase()).filter(Boolean));
}

function configuredCoveredCallPositions(): OwnedPosition[] {
  const raw = process.env.WHEEL_COVERED_CALL_POSITIONS;
  if (!raw) return [];
  const parsed = JSON.parse(raw) as OwnedPosition[];
  return parsed
    .map((position) => ({
      ticker: position.ticker.toUpperCase(),
      shares: Number(position.shares),
      adjustedCostBasis: Number(position.adjustedCostBasis)
    }))
    .filter((position) => position.ticker && position.shares >= 100 && position.adjustedCostBasis > 0);
}

function tickerExposureFromPositions(ticker: string, account: AccountConfig, positions: OwnedPosition[]) {
  const exposure = positions
    .filter((position) => position.ticker === ticker.toUpperCase())
    .reduce((sum, position) => sum + position.shares * position.adjustedCostBasis, 0);
  return exposure / account.accountValue;
}

export async function getInstitutionalService() {
  const provider = createMarketDataProvider(configuredProviderName(), process.env);

  async function getQuote(ticker: string) {
    const key = `quote:${ticker}`;
    const cached = await cache.get<Awaited<ReturnType<typeof provider.getQuote>>>(key);
    if (cached) {
      logger.metric("cache.hit", 1, { key });
      return cached;
    }
    const quote = await provider.getQuote(ticker);
    await cache.set(key, quote, DEFAULT_CACHE_TTLS.quoteSeconds);
    logger.metric("cache.miss", 1, { key });
    return quote;
  }

  async function buildRecommendation(ticker: string, contract?: NormalizedOptionContract) {
    const account = configuredAccount();
    const ownableTickers = configuredOwnableTickers();
    const ownedPositions = configuredCoveredCallPositions();
    const quote = await getQuote(ticker);
    const [bars, profile, metrics, earnings, dividends, economicEvents, sentiment] = await Promise.all([
      provider.getHistoricalPrices(ticker, 1),
      provider.getCompanyProfile(ticker),
      provider.getKeyMetrics(ticker),
      provider.getEarningsCalendar([ticker], "2026-01-01", "2026-12-31"),
      provider.getDividendCalendar([ticker], "2026-01-01", "2026-12-31"),
      provider.getEconomicCalendar("2026-01-01", "2026-12-31"),
      provider.getSentiment(ticker)
    ]);
    const expirations = await provider.getExpirations(ticker);
    if (!expirations[0]) {
      throw new Error(`No option expirations available for ${ticker}`);
    }
    const option = contract ?? (await provider.getOptionChain(ticker, expirations[0]))[0];
    if (!option) {
      throw new Error(`No option chain contracts available for ${ticker} ${expirations[0]}`);
    }
    const optionDte = dte(option.expiration);
    const [expectedMove, technicals] = await Promise.all([
      provider.getExpectedMove(ticker, option.expiration),
      Promise.resolve(analyzeTechnicals(bars))
    ]);
    const fundamentals = analyzeFundamentals(profile, metrics);
    const events = evaluateEventRisk({ ticker, earnings, dividends, economicEvents, sentiment, windowDays: accountAwareEventWindow() });
    const options = analyzeOption(option, quote, optionDte, expectedMove);
    const cashReserveAfterTrade = account.cashAvailable - options.capitalRequired;
    const tickerExposure = tickerExposureFromPositions(ticker, account, ownedPositions) + options.capitalRequired / account.accountValue;
    const assignmentReady = ownableTickers.has(ticker.toUpperCase());
    const risk = evaluateInstitutionalRisk({
      ticker,
      accountSize: account.accountValue,
      capitalRequired: options.capitalRequired,
      cashReserveAfterTrade,
      sectorExposure: tickerExposure,
      tickerExposure,
      assignmentRisk: options.probabilityOfAssignment,
      liquidityScore: options.liquidityScore,
      ivRank: options.ivRank,
      earningsWindow: events.insideEarningsWindow,
      spreadPercent: options.spreadPercent,
      positionSizePercent: options.capitalRequired / account.accountValue,
      fundamentalScore: fundamentals.overallFundamentalScore,
      userWouldOwn: assignmentReady,
      dte: optionDte,
      delta: option.delta,
      openInterest: option.openInterest,
      volume: option.volume
    });
    const wheelScore = calculateWheelScore({
      ticker,
      fundamentals,
      technicals,
      options,
      risk,
      sectorStrengthScore: 75,
      assignmentReadinessScore: assignmentReady ? 100 : 0,
      positionSizeScore: Math.max(0, 100 - (options.capitalRequired / account.accountValue) * 300),
      cashReserveScore: Math.max(0, (cashReserveAfterTrade / account.accountValue) * 100),
      eventScore: events.score
    });

    const cspDecision = decideCashSecuredPut({
      quote,
      contract: option,
      dte: optionDte,
      accountSize: account.accountValue,
      cashAvailable: account.cashAvailable,
      existingTickerExposure: tickerExposureFromPositions(ticker, account, ownedPositions),
      wheelScore: wheelScore.wheelScore,
      riskScore: risk.riskLevel,
      earningsRisk: events.insideEarningsWindow,
      assignmentReady,
      fundamentalScore: fundamentals.overallFundamentalScore,
      liquidityScore: options.liquidityScore,
      ivRank: options.ivRank,
      sectorExposure: tickerExposure
    });

    return {
      ticker,
      quote,
      option,
      fundamentals,
      technicals,
      options,
      events,
      risk,
      wheelScore,
      cspDecision,
      decision: {
        shouldSellCsp: cspDecision.finalDecision === "APPROVED",
        recommendation: cspDecision.finalDecision,
        reasoning: [...cspDecision.reasoning, ...cspDecision.hardRuleViolations, ...wheelScore.explanation, ...options.explanation, ...events.explanation]
      }
    };
  }

  async function screenCspCandidates(tickers: string[] = []) {
    const universe = configuredWatchlist(tickers);
    const recommendations = await Promise.all(universe.map((ticker) => buildRecommendation(ticker).catch(() => undefined)));
    return recommendations.filter((item): item is Awaited<ReturnType<typeof buildRecommendation>> => Boolean(item)).map((item) => ({
      ticker: item.ticker,
      currentPrice: item.quote.price,
      expiration: item.option.expiration,
      dte: dte(item.option.expiration),
      strike: item.option.strike,
      delta: Math.abs(item.option.delta),
      bid: item.option.bid,
      ask: item.option.ask,
      mid: item.option.mark,
      premium: item.option.mark * 100,
      iv: item.option.impliedVolatility,
      ivRank: item.options.ivRank,
      openInterest: item.option.openInterest,
      volume: item.option.volume,
      probabilityOfProfit: item.option.probabilityOTM,
      annualizedYield: item.options.annualizedReturn,
      earningsBeforeExpiration: item.events.insideEarningsWindow,
      sector: "Research",
      userWouldOwn: item.cspDecision.supportingCalculations.assignmentReadiness === true,
      risk: {
        score: item.risk.riskLevel,
        confidence: item.risk.confidence,
        status: item.cspDecision.finalDecision,
        reasons: item.cspDecision.reasoning,
        hardBlocks: item.cspDecision.hardRuleViolations,
        spreadPercent: item.options.spreadPercent,
        capitalRequired: item.options.capitalRequired,
        allocationPercent: item.options.capitalRequired / configuredAccount().accountValue
      },
      decision: item.cspDecision,
      wheelScore: item.wheelScore
    }));
  }

  async function screenCoveredCallCandidates() {
    const ownedPositions = configuredCoveredCallPositions();

    const recommendations = await Promise.all(ownedPositions.map(async (position) => {
      const quote = await getQuote(position.ticker);
      const expirations = await provider.getExpirations(position.ticker);
      if (!expirations[0]) return undefined;
      const chain = await provider.getOptionChain(position.ticker, expirations[0]);
      const call = chain.find((contract) => contract.type === "call");
      if (!call) return undefined;
      const syntheticCall = {
        ...call,
        ticker: position.ticker,
        type: "call" as const,
        strike: Math.max(Math.ceil(position.adjustedCostBasis * 1.05), Math.ceil(quote.price * 1.05)),
        delta: 0.24,
        breakEven: Math.max(Math.ceil(position.adjustedCostBasis * 1.05), Math.ceil(quote.price * 1.05)) + 1.45
      };
      const optionDte = dte(syntheticCall.expiration);
      const optionAnalytics = analyzeOption(syntheticCall, quote, optionDte, await provider.getExpectedMove(position.ticker, syntheticCall.expiration));
      const decision = decideCoveredCall({
        quote,
        contract: syntheticCall,
        dte: optionDte,
        currentShares: position.shares,
        adjustedCostBasis: position.adjustedCostBasis,
        wheelScore: 80,
        riskScore: 3,
        liquidityScore: optionAnalytics.liquidityScore,
        ivRank: optionAnalytics.ivRank,
        earningsRisk: false,
        fundamentalScore: 75,
        sectorExposure: 0.24
      });

      return {
        ticker: position.ticker,
        contractsOwned: Math.floor(position.shares / 100),
        costBasis: position.adjustedCostBasis,
        adjustedCostBasis: position.adjustedCostBasis,
        strike: syntheticCall.strike,
        expiration: syntheticCall.expiration,
        dte: optionDte,
        delta: Math.abs(syntheticCall.delta),
        premium: syntheticCall.mark * 100,
        maxProfit: Number(decision.supportingCalculations.maxProfit),
        calledAwayReturn: Number(decision.supportingCalculations.calledAwayReturn),
        decision,
        optionAnalytics
      };
    }));

    return recommendations.filter((item): item is NonNullable<typeof item> => Boolean(item));
  }

  async function getWatchlistResearchRows(tickers: string[] = []) {
    const universe = configuredWatchlist(tickers);
    const rows = await Promise.all(universe.map(async (ticker) => {
      const [quote, bars, profile, metrics, earnings] = await Promise.all([
        getQuote(ticker),
        provider.getHistoricalPrices(ticker, 1),
        provider.getCompanyProfile(ticker),
        provider.getKeyMetrics(ticker),
        provider.getEarningsCalendar([ticker], new Date().toISOString().slice(0, 10), new Date(Date.now() + 120 * 86_400_000).toISOString().slice(0, 10))
      ]);
      const technicals = analyzeTechnicals(bars);
      const fundamentals = analyzeFundamentals(profile, metrics);
      const expirations = await provider.getExpirations(ticker).catch(() => []);
      const chain = expirations[0] ? await provider.getOptionChain(ticker, expirations[0]).catch(() => []) : [];
      const liquidityScore = chain.length
        ? Math.round(chain.reduce((sum, option) => sum + Math.min(100, option.openInterest / 20 + option.volume / 5), 0) / chain.length)
        : 0;
      const nextEarnings = earnings[0]?.date ?? "";

      return {
        ticker: ticker.toUpperCase(),
        companyName: profile.companyName,
        sector: profile.sector,
        price: quote.price,
        sma50: technicals.sma50,
        sma200: technicals.sma200,
        rsi: technicals.rsi14,
        trendDirection: technicals.trendDirection,
        support: technicals.support,
        resistance: technicals.resistance,
        earningsDate: nextEarnings,
        marketCap: profile.marketCap,
        revenueGrowth: metrics.revenueGrowth,
        freeCashFlow: metrics.freeCashFlow,
        debtToEquity: metrics.debtToEquity,
        roic: metrics.roic,
        grossMargin: metrics.grossMargin,
        operatingMargin: metrics.operatingMargin,
        peg: metrics.peg,
        fundamentalScore: fundamentals.overallFundamentalScore,
        liquidityScore,
        eventRiskScore: nextEarnings ? 50 : 0
      };
    }));
    return rows;
  }

  async function rankCspUniverse(tickers: string[] = []) {
    const universe = configuredWatchlist(tickers);
    const recommendations = await Promise.all(universe.map((ticker) => buildRecommendation(ticker).catch(() => undefined)));
    return rankTrades(recommendations.filter((item): item is Awaited<ReturnType<typeof buildRecommendation>> => Boolean(item)).map((item) => ({
      ...item.wheelScore,
      riskLevel: item.risk.riskLevel,
      annualizedYield: item.options.annualizedReturn,
      blocked: item.cspDecision.finalDecision === "BLOCKED",
      finalDecision: item.cspDecision.finalDecision
    })));
  }

  return {
    provider,
    getQuote,
    buildRecommendation,
    screenCspCandidates,
    screenCoveredCallCandidates,
    getWatchlistResearchRows,
    rankCspUniverse
  };
}
