export async function handler(event) {
  const date = event.queryStringParameters?.date || new Date().toISOString().slice(0,10);
  if (!process.env.FOREX_PROXY_URL) return json(200, { events: [], note: "FOREX_PROXY_URL not set" });

  try {
    const r = await fetch(`${process.env.FOREX_PROXY_URL}?date=${encodeURIComponent(date)}`, {
      signal: AbortSignal.timeout(10000)
    });
    const data = await r.json();
    // Normalize to { events: [...] }
    const events = Array.isArray(data) ? data : (data?.events || []);
    return ok({ events });
  } catch (e) {
    return json(500, { error: String(e?.message || e) });
  }
}

function ok(body){return{statusCode:200,headers:cors(),body:JSON.stringify(body)}}
function json(code,body){return{statusCode:code,headers:cors(),body:JSON.stringify(body)}}
function cors(){return{"Access-Control-Allow-Origin":"*","Content-Type":"application/json"}}
