// BEGIN EDIT: Twelve Data Quote proxy (maps % correctly)
const TD = process.env.TWELVE_DATA_KEY;

const mapSymbol = (s = "") =>
  s.toUpperCase() === "NAS100" ? "NDX" : s.toUpperCase();

export async function handler(event) {
  try {
    const symbol = mapSymbol((event.queryStringParameters || {}).symbol || "");
    if (!symbol) return json(400, { error: "symbol required" });

    if (!TD) return json(200, {
      // Demo fallback if no key set (keeps client UI alive)
      symbol, source: "⚠️ Local Fallback (no TWELVE_DATA_KEY)",
      price: 0, change: 0, changePercent: 0, high: 0, low: 0, volume: 0,
      updated: new Date().toISOString()
    });

    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(TD)}`;
    const r = await fetch(url);
    if (!r.ok) return json(r.status, { error: `Twelve Data ${r.status}` });
    const q = await r.json();

    if (q.status === "error" || q.code) {
      return json(502, { error: q.message || "Twelve Data error", raw: q });
    }

    const price = parseFloat(q.close ?? q.price ?? 0) || 0;
    const prev  = parseFloat(q.previous_close ?? q.open ?? price) || 0;
    const change = price - prev;
    const changePercent = prev ? (change / prev) * 100 : 0;

    return json(200, {
      symbol,
      name: q.name || symbol,
      price,
      change,
      changePercent,
      high: num(q.high, price),
      low: num(q.low, price),
      volume: num(q.volume, 0),
      updated: new Date().toISOString(),
      source: "Twelve Data (Proxy)"
    });
  } catch (e) {
    return json(500, { error: String(e) });
  }
}

function num(v, d=0){ const n = Number(v); return Number.isFinite(n) ? n : d; }
function json(statusCode, body){
  return { statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) };
}
// END EDIT
