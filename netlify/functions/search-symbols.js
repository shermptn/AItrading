export async function handler(event) {
  const query = event.queryStringParameters?.q || "";
  if (!query) return json(400, { error: "q required" });

  try {
    // Option 1, symbol_search if enabled on your plan
    const url = `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${process.env.TWELVE_DATA_KEY}`;
    const r = await fetch(url, { timeout: 10000 });
    const data = await r.json();
    return ok(data);
  } catch (e) {
    return json(500, { error: String(e?.message || e) });
  }
}

function ok(body) { return { statusCode: 200, headers: cors(), body: JSON.stringify(body) }; }
function json(code, body) { return { statusCode: code, headers: cors(), body: JSON.stringify(body) }; }
function cors() { return { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }; }
