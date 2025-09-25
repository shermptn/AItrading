export async function handler(event) {
  const query = event.queryStringParameters?.q || "";
  if (!process.env.X_BEARER_TOKEN) return json(200, { data: [], note: "No X token set" });
  if (!query) return json(400, { error: "q required" });

  const url = "https://api.twitter.com/2/tweets/search/recent"
    + `?query=${encodeURIComponent(query)}`
    + "&max_results=10&tweet.fields=created_at,public_metrics,author_id";

  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` }, timeout: 10000 });
    const data = await r.json();
    return ok(data);
  } catch (e) {
    return json(500, { error: String(e?.message || e) });
  }
}

function ok(body) { return { statusCode: 200, headers: cors(), body: JSON.stringify(body) }; }
function json(code, body) { return { statusCode: code, headers: cors(), body: JSON.stringify(body) }; }
function cors() { return { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }; }
