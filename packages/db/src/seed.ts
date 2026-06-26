import { PrismaClient } from "@prisma/client";
import { stocks } from "@wheeldesk/core";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "learning@example.com" },
    update: {},
    create: {
      email: "learning@example.com",
      name: "WheelDesk Learner",
      accounts: {
        create: {
          name: "$20k Learning Account",
          accountValue: 20000,
          cashAvailable: 15850,
          cashReservePercent: 0.7925
        }
      },
      watchlist: { create: {} }
    },
    include: { watchlist: true }
  });

  for (const stock of stocks) {
    await prisma.stock.upsert({
      where: { ticker: stock.ticker },
      update: {
        currentPrice: stock.price,
        wheelQualityScore: stock.wheelQualityScore,
        liquidityScore: stock.liquidityScore,
        eventRiskScore: stock.eventRiskScore
      },
      create: {
        watchlistId: user.watchlist?.id,
        ticker: stock.ticker,
        name: stock.name,
        sector: stock.sector,
        tier: stock.tier,
        currentPrice: stock.price,
        movingAverage50: stock.movingAverage50,
        movingAverage200: stock.movingAverage200,
        rsi: stock.rsi,
        macdTrend: stock.macdTrend,
        support: stock.support,
        resistance: stock.resistance,
        earningsDate: new Date(stock.earningsDate),
        marketCapBillions: stock.marketCapBillions,
        revenueGrowth: stock.revenueGrowth,
        freeCashFlowBillions: stock.freeCashFlowBillions,
        debtToEquity: stock.debtToEquity,
        roic: stock.roic,
        grossMargin: stock.grossMargin,
        operatingMargin: stock.operatingMargin,
        peg: stock.peg,
        moatScore: stock.moatScore,
        wheelQualityScore: stock.wheelQualityScore,
        liquidityScore: stock.liquidityScore,
        eventRiskScore: stock.eventRiskScore
      }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
