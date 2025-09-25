import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  try {
    const symbol = new URLSearchParams(event.queryStringParameters as any).get("symbol") || "SPY";
    const key = process.env.TWELVE_DATA_KEY;
    if (!key) throw new Error('TWELVE_DATA_KEY is not set');

    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code >= 400) throw new Error(data.message);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
