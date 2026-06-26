import type { DividendEvent, EarningsEvent, EconomicEvent, NewsSentiment } from "./models";

export type EventRisk = {
  ticker: string;
  daysUntilEarnings?: number;
  insideEarningsWindow: boolean;
  insideDividendWindow: boolean;
  upcomingFedMeeting: boolean;
  upcomingCpi: boolean;
  upcomingJobsReport: boolean;
  majorNews: boolean;
  score: number;
  explanation: string[];
};

function daysUntil(date: string, now = new Date()) {
  return Math.ceil((new Date(date).getTime() - now.getTime()) / 86_400_000);
}

export function evaluateEventRisk(input: {
  ticker: string;
  earnings: EarningsEvent[];
  dividends: DividendEvent[];
  economicEvents: EconomicEvent[];
  sentiment?: NewsSentiment;
  windowDays?: number;
  now?: Date;
}): EventRisk {
  const windowDays = input.windowDays ?? 7;
  const earnings = input.earnings.find((event) => event.ticker === input.ticker);
  const dividend = input.dividends.find((event) => event.ticker === input.ticker);
  const daysUntilEarnings = earnings ? daysUntil(earnings.date, input.now) : undefined;
  const daysUntilDividend = dividend ? daysUntil(dividend.exDate, input.now) : undefined;
  const upcomingFedMeeting = input.economicEvents.some((event) => /fed|federal reserve/i.test(event.name) && daysUntil(event.date, input.now) <= windowDays);
  const upcomingCpi = input.economicEvents.some((event) => /cpi|consumer price/i.test(event.name) && daysUntil(event.date, input.now) <= windowDays);
  const upcomingJobsReport = input.economicEvents.some((event) => /employment|jobs/i.test(event.name) && daysUntil(event.date, input.now) <= windowDays);
  const majorNews = input.sentiment ? input.sentiment.score < -0.35 : false;
  const insideEarningsWindow = daysUntilEarnings !== undefined && daysUntilEarnings >= 0 && daysUntilEarnings <= windowDays;
  const insideDividendWindow = daysUntilDividend !== undefined && daysUntilDividend >= 0 && daysUntilDividend <= windowDays;
  let score = 100;
  if (insideEarningsWindow) score -= 40;
  if (insideDividendWindow) score -= 10;
  if (upcomingFedMeeting) score -= 15;
  if (upcomingCpi) score -= 10;
  if (upcomingJobsReport) score -= 10;
  if (majorNews) score -= 20;

  return {
    ticker: input.ticker,
    daysUntilEarnings,
    insideEarningsWindow,
    insideDividendWindow,
    upcomingFedMeeting,
    upcomingCpi,
    upcomingJobsReport,
    majorNews,
    score: Math.min(Math.max(score, 0), 100),
    explanation: [
      `Event score starts at 100 and subtracts for earnings, dividends, macro events, and major negative news.`,
      insideEarningsWindow ? `Earnings are inside the ${windowDays}-day window.` : `No earnings event inside the ${windowDays}-day window.`
    ]
  };
}
