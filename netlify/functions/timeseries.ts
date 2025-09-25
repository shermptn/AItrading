import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  try {
    const p = new URLSearchParams(event.queryStringParameters as any);
    const symbol = p.get("symbol") || "SPY";
    const interval = p.get("interval") || "1day";
    const outputsize = p.get("limit") || "250";
    const key = process.env.TWELVE_DATA_KEY;
    if (!key) throw new Error('TWELVE_DATA_KEY is not set');

    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code >= 400) throw new Error(data.message);

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
