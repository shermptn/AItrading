export async function handler(event) {
  try {
    const { symbol } = event.queryStringParameters || {};
    if (!symbol) {
      return { statusCode: 400, body: JSON.stringify({ error: "symbol required" }) };
    }

    const tdKey = process.env.TWELVE_DATA_KEY;
    if (!tdKey) {
      // Safe demo fallback
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          price: 100,
          high: 101,
          low: 99,
          volume: 0,
          name: symbol.toUpperCase(),
          change: 0,
          changePercent: 0,
          source: "⚠️ Local Fallback (stale)",
          updated: new Date().toISOString()
        })
      };
    }

    // Twelve Data proxy call
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(tdKey)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`TwelveData ${r.status}`);
    const j = await r.json();
    if (j.status === "error" || j.code) throw new Error(j.message || "Twelve Data error");

    const price = parseFloat(j.close ?? j.price);
    const prev  = parseFloat(j.previous_close ?? j.open ?? price);

    const payload = {
      symbol: symbol.toUpperCase(),
      name: j.name || symbol.toUpperCase(),
      price,
      high: +(j.high ?? price),
      low: +(j.low ?? price),
      volume: +(j.volume ?? 0),
      change: price - prev,
      changePercent: prev ? ((price - prev) / prev) * 100 : 0,
      source: "Twelve Data",
      updated: new Date().toISOString()
    };

    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) };
  } catch (e) {
    return { statusCode: 500, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: String(e) }) };
  }
}
