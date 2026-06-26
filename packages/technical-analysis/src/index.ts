import type { HistoricalBar } from "@wheeldesk/market-data";

export type TechnicalAnalysis = {
  sma20: number;
  sma50: number;
  sma100: number;
  sma200: number;
  ema20: number;
  rsi14: number;
  macd: { line: number; signal: number; histogram: number };
  atr14: number;
  adx14: number;
  bollingerBands: { upper: number; middle: number; lower: number };
  vwap: number;
  week52High: number;
  week52Low: number;
  gapPercent: number;
  support: number;
  resistance: number;
  trendDirection: "Bullish" | "Neutral" | "Bearish";
  returnPercent: number;
  score: number;
  explanation: string[];
};

const avg = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round = (value: number) => Number(value.toFixed(4));

export function sma(values: number[], period: number) {
  return round(avg(values.slice(-period)));
}

export function ema(values: number[], period: number) {
  const multiplier = 2 / (period + 1);
  return round(values.reduce((prev, value, index) => index === 0 ? value : value * multiplier + prev * (1 - multiplier), values[0] ?? 0));
}

export function rsi(values: number[], period = 14) {
  const changes = values.slice(1).map((value, index) => value - values[index]);
  const recent = changes.slice(-period);
  const gains = recent.filter((value) => value > 0);
  const losses = recent.filter((value) => value < 0).map(Math.abs);
  const avgLoss = avg(losses);
  if (avgLoss === 0) return 100;
  const rs = avg(gains) / avgLoss;
  return round(100 - 100 / (1 + rs));
}

export function macd(values: number[]) {
  const line = ema(values, 12) - ema(values, 26);
  const signal = line * 0.8;
  return { line: round(line), signal: round(signal), histogram: round(line - signal) };
}

export function atr(bars: HistoricalBar[], period = 14) {
  const ranges = bars.slice(-period).map((bar, index, recent) => {
    const previousClose = recent[index - 1]?.close ?? bar.close;
    return Math.max(bar.high - bar.low, Math.abs(bar.high - previousClose), Math.abs(bar.low - previousClose));
  });
  return round(avg(ranges));
}

export function analyzeTechnicals(bars: HistoricalBar[]): TechnicalAnalysis {
  if (bars.length < 20) throw new Error("At least 20 bars are required for technical analysis.");
  const closes = bars.map((bar) => bar.close);
  const latest = bars[bars.length - 1];
  const first = bars[0];
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const sma100 = sma(closes, 100);
  const sma200 = sma(closes, 200);
  const ema20 = ema(closes, 20);
  const rsi14 = rsi(closes, 14);
  const macdValue = macd(closes);
  const atr14 = atr(bars, 14);
  const middle = sma20;
  const std = Math.sqrt(avg(closes.slice(-20).map((close) => (close - middle) ** 2)));
  const week52High = Math.max(...bars.slice(-252).map((bar) => bar.high));
  const week52Low = Math.min(...bars.slice(-252).map((bar) => bar.low));
  const vwap = round(bars.reduce((sum, bar) => sum + ((bar.high + bar.low + bar.close) / 3) * bar.volume, 0) / bars.reduce((sum, bar) => sum + bar.volume, 0));
  const trendDirection = latest.close > sma50 && sma50 > sma200 ? "Bullish" : latest.close < sma50 && sma50 < sma200 ? "Bearish" : "Neutral";
  const explanation: string[] = [];
  let score = 50;

  if (trendDirection === "Bullish") {
    score += 20;
    explanation.push("Price is above the 50 SMA and the 50 SMA is above the 200 SMA.");
  } else if (trendDirection === "Bearish") {
    score -= 20;
    explanation.push("Price is below the 50 SMA and the 50 SMA is below the 200 SMA.");
  } else {
    explanation.push("Trend is mixed, so the technical score stays near neutral.");
  }

  if (rsi14 >= 40 && rsi14 <= 65) {
    score += 10;
    explanation.push("RSI is in a constructive range for premium selling.");
  }

  if (macdValue.histogram > 0) {
    score += 8;
    explanation.push("MACD histogram is positive.");
  }

  return {
    sma20,
    sma50,
    sma100,
    sma200,
    ema20,
    rsi14,
    macd: macdValue,
    atr14,
    adx14: round(Math.min(45, Math.abs(sma50 - sma200) / latest.close * 500)),
    bollingerBands: { upper: round(middle + 2 * std), middle, lower: round(middle - 2 * std) },
    vwap,
    week52High: round(week52High),
    week52Low: round(week52Low),
    gapPercent: round((latest.open - bars[bars.length - 2].close) / bars[bars.length - 2].close),
    support: round(Math.min(...bars.slice(-30).map((bar) => bar.low))),
    resistance: round(Math.max(...bars.slice(-30).map((bar) => bar.high))),
    trendDirection,
    returnPercent: round((latest.close - first.close) / first.close),
    score: Math.min(Math.max(Math.round(score), 0), 100),
    explanation
  };
}
