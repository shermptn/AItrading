// netlify/functions/quote.js
import fetch from "node-fetch";

const TD = process.env.TWELVE_DATA_KEY;

// allow NAS100 alias
const mapSym = (s) => (s || "").toUpperCase() === "NAS100" ? "NDX" : s;

export async function handler(event) {
  try {
    const symbol = mapSym(event.queryStringParameters?.symbol || "AAPL");
    if (!TD) throw new Error("Server missing TWELVE_DATA_KEY");

    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(TD)}`;
    const r = await fetch(url);
    const j = await r.json();

    if (j.status === "error" || j.code) {
      return { statusCode: 502, body: JSON.stringify({ error: j.message || "Twelve Data error" }) };
    }

    const price = parseFloat(j.close ?? j.price);
    const prev  = parseFloat(j.previous_close ?? j.open ?? price);
    const body = {
      symbol,
      name: j.name || symbol,
      price,
      change: price - prev,
      changePercent: prev ? ((price - prev) / prev) * 100 : 0,
      high: +(j.high ?? price),
      low: +(j.low ?? price),
      volume: +(j.volume || 0),
      lastUpdate: new Date().toISOString(),
      source: "Twelve Data (Proxy)"
    };

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
