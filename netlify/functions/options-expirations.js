// BEGIN EDIT: Options expirations (vendor or demo)
const POLY = process.env.POLYGON_API_KEY;

export async function handler(event){
  try{
    const symbol = (event.queryStringParameters || {}).symbol;
    if(!symbol) return json(400, { error: "symbol required" });

    // Demo fallback if no vendor key:
    if(!POLY){
      return json(200, { vendor: "demo", expirations: demoExpirations() });
    }

    // Example Polygon endpoint (adjust if you use a different vendor):
    const url = `https://api.polygon.io/v3/reference/options/contracts?underlying_ticker=${encodeURIComponent(symbol)}&limit=1000&apiKey=${encodeURIComponent(POLY)}`;
    const r = await fetch(url);
    if(!r.ok) return json(r.status, { error: `Polygon ${r.status}`});
    const j = await r.json();

    const exps = Array.from(new Set((j.results || []).map(x => x.expiration_date))).sort();
    return json(200, { vendor: "polygon", expirations: exps });
  }catch(e){
    return json(500, { error: String(e) });
  }
}

function demoExpirations(){
  const today = new Date();
  const pad = n => String(n).padStart(2, "0");
  const add = (d, days) => new Date(d.getTime() + days*86400000);
  return [7, 21, 45, 90].map(dd => {
    const dt = add(today, dd);
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
  });
}

function json(statusCode, body){
  return { statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) };
}
// END EDIT
