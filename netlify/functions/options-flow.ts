import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const symbol = new URLSearchParams(event.queryStringParameters as any).get("symbol") || "AAPL";
  // In a real app, you would fetch this from a provider like Polygon.io.
  const mockData = {
    symbol,
    prints: [
      { type: "Sweep", side: "CALL", strike: 220, expiry: "2025-10-17", size: 1500, premium: 450000, sentiment: "bullish" },
      { type: "Block", side: "PUT", strike: 190, expiry: "2025-10-17", size: 2200, premium: 380000, sentiment: "bearish" },
      { type: "Sweep", side: "CALL", strike: 215, expiry: "2025-09-19", size: 3500, premium: 1250000, sentiment: "bullish" },
    ],
  };
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(mockData) };
};
