import { accountSnapshot, stocks } from "@wheeldesk/core";
import { createMarketDataProvider } from "@wheeldesk/market-data";
import { evaluateEventRisk } from "@wheeldesk/market-data";
import type { NormalizedOptionContract } from "@wheeldesk/market-data";
import { analyzeFundamentals } from "@wheeldesk/fundamental-analysis";
import { analyzeOption } from "@wheeldesk/options-engine";
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
      userWouldOwn: Boolean(stock && stock.wheelQualityScore >= 60)
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
      decision: {
        shouldSellCsp: risk.status !== "BLOCKED" && wheelScore.wheelScore >= 75,
        recommendation: risk.status === "BLOCKED" ? "Blocked" : wheelScore.wheelScore >= 90 ? "Strong Buy" : wheelScore.wheelScore >= 80 ? "Buy" : wheelScore.wheelScore >= 70 ? "Watch" : "Avoid",
        reasoning: [...wheelScore.explanation, ...risk.reasoning, ...risk.hardBlocks, ...options.explanation, ...events.explanation]
      }
    };
  }

  async function rankCspUniverse(tickers = ["AAPL", "MSFT", "AMD", "JPM", "SOFI"]) {
    const recommendations = await Promise.all(tickers.map((ticker) => buildRecommendation(ticker).catch(() => undefined)));
    return rankTrades(recommendations.filter((item): item is Awaited<ReturnType<typeof buildRecommendation>> => Boolean(item)).map((item) => ({
      ...item.wheelScore,
      riskLevel: item.risk.riskLevel,
      annualizedYield: item.options.annualizedReturn,
      blocked: item.risk.status === "BLOCKED"
    })));
  }

  return {
    provider,
    getQuote,
    buildRecommendation,
    rankCspUniverse
  };
}
