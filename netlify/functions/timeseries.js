// BEGIN EDIT: Twelve Data time_series proxy (intraday + daily)
const TD = process.env.TWELVE_DATA_KEY;
const mapSymbol = (s = "") =>
  s.toUpperCase() === "NAS100" ? "NDX" : s.toUpperCase();

export async function handler(event) {
  try {
    const qs = event.queryStringParameters || {};
    const symbol = mapSymbol(qs.symbol || "");
    const interval = (qs.interval || "5min").toLowerCase(); // "1min","5min","1day"
    const outputsize = qs.outputsize || "200"; // 30/60/200/5000

    if (!symbol) return json(400, { error: "symbol required" });

    if (!TD) {
      return json(200, {                  // demo fallback
        symbol, interval, source: "⚠️ Local Fallback (no TWELVE_DATA_KEY)",
        candles: [], updated: new Date().toISOString()
      });
    }

    // Twelve Data: https://api.twelvedata.com/time_series
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=${encodeURIComponent(outputsize)}&order=ASC&apikey=${encodeURIComponent(TD)}`;
    const r = await fetch(url);
    if (!r.ok) return json(r.status, { error: `Twelve Data ${r.status}` });
    const j = await r.json();

    if (j.status === "error" || j.code) {
      return json(502, { error: j.message || "Twelve Data error", raw: j });
    }

    const candles = (j.values || []).map(v => ({
      time: v.datetime,                // ISO string
      open: +v.open, high: +v.high, low: +v.low, close: +v.close,
      volume: v.volume ? +v.volume : null,
    }));

    return json(200, {
      symbol, interval, candles,
      updated: new Date().toISOString(),
      source: "Twelve Data (Proxy)"
    });
  } catch (e) {
    return json(500, { error: String(e) });
  }
}
function json(statusCode, body){
  return { statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) };
}
// END EDIT
