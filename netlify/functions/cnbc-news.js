export async function handler(event) {
  const symbol = event.queryStringParameters?.symbol || "";
  const q = symbol ? symbol : "markets";
  if (!process.env.NEWSAPI_KEY) return json(200, { articles: [], note: "No NewsAPI key set" });

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=10&sortBy=publishedAt&apiKey=${process.env.NEWSAPI_KEY}`;

  try {
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
