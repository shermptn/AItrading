export async function handler(event) {
  try {
    const { symbol, interval = "1day" } = event.queryStringParameters || {};
    if (!symbol) return { statusCode: 400, body: JSON.stringify({ error: "symbol required" }) };

    const tdKey = process.env.TWELVE_DATA_KEY;
    if (!tdKey) {
      // Minimal demo series
      const now = Date.now();
      const candles = Array.from({ length: 30 }, (_, i) => {
        const t = new Date(now - (29 - i) * 86400000).toISOString().slice(0, 10);
        const o = 100 + i * 0.2;
        const h = o + 1;
        const l = o - 1;
        const c = o + 0.5;
        return { time: t, open: o, high: h, low: l, close: c, volume: 1000000 };
      });
      return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ symbol, interval, candles, vendor: "demo" }) };
    }

    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=5000&apikey=${encodeURIComponent(tdKey)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`TwelveData ${r.status}`);
    const j = await r.json();
    if (j.status === "error" || j.code) throw new Error(j.message || "Twelve Data error");

    const candles = (j.values || []).map(v => ({
      time: v.datetime, open: +v.open, high: +v.high, low: +v.low, close: +v.close, volume: +(v.volume || 0)
    }));

    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ symbol, interval, candles, vendor: "twelvedata" }) };
  } catch (e) {
    return { statusCode: 500, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: String(e) }) };
  }
}
