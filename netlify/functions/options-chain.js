// BEGIN EDIT: Options chain (vendor or normalized demo)
const POLY = process.env.POLYGON_API_KEY;
const TD = process.env.TWELVE_DATA_KEY;

const mapSym = (s="") => s.toUpperCase()==="NAS100" ? "NDX" : s.toUpperCase();

export async function handler(event){
  try{
    const qs = event.queryStringParameters || {};
    const symbol = mapSym(qs.symbol || "");
    const expiration = qs.expiration || "";
    if(!symbol) return json(400, { error: "symbol required" });

    // --- Demo fallback (no vendor key) ---
    if(!POLY){
      const spot = await getSpot(symbol);
      return json(200, { vendor: "demo", updated: new Date().toISOString(), ...synthChain(spot, 25) });
    }

    // Example Polygon call (normalize into standard shape):
    // NOTE: You may need to call multiple endpoints to get greeks/iv.
    const url = `https://api.polygon.io/v3/snapshot/options/${encodeURIComponent(symbol)}?apiKey=${encodeURIComponent(POLY)}`; // placeholder
    const r = await fetch(url);
    if(!r.ok) return json(r.status, { error: `Polygon ${r.status}`});
    const j = await r.json();

    const options = normalizePolygon(j); // you’d shape greeks/iv into the normalized format here

    return json(200, {
      vendor: "polygon",
      underlying: symbol,
      expiration: expiration || options[0]?.expiration,
      options,
      updated: new Date().toISOString()
    });
  }catch(e){
    return json(500, { error: String(e) });
  }
}

function normalizePolygon(_j){
  // This is a stub — adapt to the exact payload you choose.
  // Standardized row:
  // { type:"call"|"put", strike, bid, ask, last, iv, delta, gamma, theta, vega, volume, oi }
  return [];
}

async function getSpot(symbol){
  if(!TD) return 100;
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(TD)}`;
  const r = await fetch(url);
  const j = await r.json();
  return parseFloat(j.close ?? j.price ?? 100) || 100;
}

function synthChain(spot, strikes = 25){
  const out = { underlying: "demo", options: [] };
  const min = Math.max(1, spot * 0.8), max = spot * 1.2;
  const step = (max - min) / (strikes - 1);
  for(let i=0;i<strikes;i++){
    const K = +(min + i*step).toFixed(2);
    const m = K/spot;
    const iv = Math.max(0.2, 0.35 - Math.min(Math.abs(m-1), 0.3)*0.2);
    const base = Math.max(0, spot - K) * 0.5;
    const pCall = +(base + Math.max(0.2, Math.abs(m-1)*2.0)).toFixed(2);
    const pPut  = +(Math.max(0, K-spot) * 0.5 + Math.max(0.2, Math.abs(m-1)*2.0)).toFixed(2);

    out.options.push({
      type: "call", strike: K, bid: +(pCall*0.95).toFixed(2), ask: +(pCall*1.05).toFixed(2),
      last: pCall, iv, delta: +(1/(1+Math.exp(-2*(spot-K)/spot))).toFixed(3),
      gamma: +(0.001 + Math.random()*0.004).toFixed(5),
      theta: +(-0.02 - Math.random()*0.02).toFixed(3),
      vega: +(0.08 + Math.random()*0.1).toFixed(3),
      volume: Math.floor(500 + Math.random()*2000),
      oi: Math.floor(1000 + Math.random()*5000)
    });

    out.options.push({
      type: "put", strike: K, bid: +(pPut*0.95).toFixed(2), ask: +(pPut*1.05).toFixed(2),
      last: pPut, iv, delta: +(-1/(1+Math.exp(-2*(K-spot)/spot))).toFixed(3),
      gamma: +(0.001 + Math.random()*0.004).toFixed(5),
      theta: +(-0.02 - Math.random()*0.02).toFixed(3),
      vega: +(0.08 + Math.random()*0.1).toFixed(3),
      volume: Math.floor(500 + Math.random()*2000),
      oi: Math.floor(1000 + Math.random()*5000)
    });
  }
  return out;
}

function json(statusCode, body){
  return { statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) };
}
// END EDIT
