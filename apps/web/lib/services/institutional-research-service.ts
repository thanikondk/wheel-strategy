import { accountSnapshot, stocks } from "@wheeldesk/core";
import { createMarketDataProvider } from "@wheeldesk/market-data";
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

function dte(expiration: string) {
  return Math.max(1, Math.ceil((new Date(expiration).getTime() - Date.now()) / 86_400_000));
}

function accountAwareEventWindow() {
  return 7;
}

export async function getInstitutionalService() {
  const provider = createMarketDataProvider("mock");

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
    const option = contract ?? (await provider.getOptionChain(ticker, expirations[0]))[0];
    const optionDte = dte(option.expiration);
    const [expectedMove, technicals] = await Promise.all([
      provider.getExpectedMove(ticker, option.expiration),
      Promise.resolve(analyzeTechnicals(bars))
    ]);
    const fundamentals = analyzeFundamentals(profile, metrics);
    const events = evaluateEventRisk({ ticker, earnings, dividends, economicEvents, sentiment, windowDays: accountAwareEventWindow() });
    const options = analyzeOption(option, quote, optionDte, expectedMove);
    const stock = stocks.find((item) => item.ticker === ticker);
    const cashReserveAfterTrade = accountSnapshot.cashAvailable - options.capitalRequired;
    const risk = evaluateInstitutionalRisk({
      ticker,
      accountSize: accountSnapshot.accountValue,
      capitalRequired: options.capitalRequired,
      cashReserveAfterTrade,
      sectorExposure: 0.24,
      tickerExposure: options.capitalRequired / accountSnapshot.accountValue,
      assignmentRisk: options.probabilityOfAssignment,
      liquidityScore: options.liquidityScore,
      ivRank: options.ivRank,
      earningsWindow: events.insideEarningsWindow,
      spreadPercent: options.spreadPercent,
      positionSizePercent: options.capitalRequired / accountSnapshot.accountValue,
      fundamentalScore: fundamentals.overallFundamentalScore,
      userWouldOwn: Boolean(stock && stock.wheelQualityScore >= 60),
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
      assignmentReadinessScore: stock?.wheelQualityScore ?? 50,
      positionSizeScore: Math.max(0, 100 - (options.capitalRequired / accountSnapshot.accountValue) * 300),
      cashReserveScore: Math.max(0, (cashReserveAfterTrade / accountSnapshot.accountValue) * 100),
      eventScore: events.score
    });

    const cspDecision = decideCashSecuredPut({
      quote,
      contract: option,
      dte: optionDte,
      accountSize: accountSnapshot.accountValue,
      cashAvailable: accountSnapshot.cashAvailable,
      existingTickerExposure: 0,
      wheelScore: wheelScore.wheelScore,
      riskScore: risk.riskLevel,
      earningsRisk: events.insideEarningsWindow,
      assignmentReady: Boolean(stock && stock.wheelQualityScore >= 60),
      fundamentalScore: fundamentals.overallFundamentalScore,
      liquidityScore: options.liquidityScore,
      ivRank: options.ivRank,
      sectorExposure: 0.24
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

  async function screenCspCandidates(tickers = ["AAPL", "AMD", "SOFI"]) {
    const recommendations = await Promise.all(tickers.map((ticker) => buildRecommendation(ticker).catch(() => undefined)));
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
        allocationPercent: item.options.capitalRequired / accountSnapshot.accountValue
      },
      decision: item.cspDecision,
      wheelScore: item.wheelScore
    }));
  }

  async function screenCoveredCallCandidates() {
    const ownedPositions = [
      { ticker: "AAPL", shares: 100, adjustedCostBasis: 202.85 },
      { ticker: "AMD", shares: 100, adjustedCostBasis: 145.7 }
    ];

    const recommendations = await Promise.all(ownedPositions.map(async (position) => {
      const quote = await getQuote(position.ticker);
      const expirations = await provider.getExpirations(position.ticker);
      const chain = await provider.getOptionChain(position.ticker, expirations[0]);
      const syntheticCall = {
        ...(chain[0] ?? (await provider.getOptionChain("AAPL", expirations[0]))[0]),
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

    return recommendations;
  }

  async function rankCspUniverse(tickers = ["AAPL", "MSFT", "AMD", "JPM", "SOFI"]) {
    const recommendations = await Promise.all(tickers.map((ticker) => buildRecommendation(ticker).catch(() => undefined)));
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
    rankCspUniverse
  };
}
