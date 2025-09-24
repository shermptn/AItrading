// netlify/functions/timeseries.js
const TD = process.env.TWELVE_DATA_KEY;
const mapSym = (s) => (s || "").toUpperCase() === "NAS100" ? "NDX" : s;

export async function handler(event) {
  try {
    const q = event.queryStringParameters || {};
    const symbol = mapSym(q.symbol || "AAPL");
    const interval = q.interval || "1min";
    const outputsize = q.outputsize || "200";

    if (!TD) throw new Error("Server missing TWELVE_DATA_KEY");

    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=${encodeURIComponent(outputsize)}&order=desc&apikey=${encodeURIComponent(TD)}`;
    const r = await fetch(url);
    const j = await r.json();

    if (!r.ok || j.status === "error" || j.code) {
      return { statusCode: 502, body: JSON.stringify({ error: j.message || "Twelve Data error" }) };
    }

    const candles = (j.values || j.data || [])
      .map(c => ({
        time: c.datetime || c.time || c.date || c.timestamp,
        open: +c.open, high: +c.high, low: +c.low, close: +c.close,
        volume: +(c.volume || 0)
      }))
      .reverse();

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ symbol, interval, candles, updated: new Date().toISOString(), source: "Twelve Data (Proxy)" })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
