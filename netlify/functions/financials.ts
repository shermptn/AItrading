import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const symbol = new URLSearchParams(event.queryStringParameters as any).get("symbol") || "AAPL";
  // In a real app, you would fetch this from Twelve Data, IEX Cloud, or Finnhub.
  const mockData = {
    symbol,
    income: [
      { year: 2024, revenue: 385.71, earnings: 99.8, eps: 6.15 },
      { year: 2023, revenue: 383.29, earnings: 97.0, eps: 5.95 },
    ],
    balance: [
      { year: 2024, assets: 355.2, liabilities: 295.1 },
      { year: 2023, assets: 352.6, liabilities: 300.4 },
    ],
    cashflow: [
      { year: 2024, cfo: 112.5, cfi: -5.2, cff: -108.3 },
      { year: 2023, cfo: 110.5, cfi: -3.8, cff: -105.3 },
    ],
  };
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(mockData) };
};
