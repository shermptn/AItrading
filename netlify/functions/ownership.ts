import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const symbol = new URLSearchParams(event.queryStringParameters as any).get("symbol") || "AAPL";
  // In a real app, you would fetch this from a provider like Finnhub.
  const mockData = {
    symbol,
    institutions: [
      { holder: "Vanguard Group, Inc.", shares: 1350000000, pct: 8.52 },
      { holder: "BlackRock, Inc.", shares: 1050000000, pct: 6.63 },
      { holder: "Berkshire Hathaway, Inc.", shares: 907000000, pct: 5.73 },
    ],
    insiders: [
      { name: "Tim Cook (CEO)", type: "Sell", shares: 50000, date: "2025-08-01" },
      { name: "Luca Maestri (CFO)", type: "Sell", shares: 15000, date: "2025-07-22" },
    ],
    analysts: { consensus: "Strong Buy", priceTarget: 225.50, ratings: { buy: 28, hold: 10, sell: 2 } },
  };
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(mockData) };
};
