// netlify/functions/options-chain.js
const TD = process.env.TWELVE_DATA_KEY;
const mapSym = (s) => (s || "").toUpperCase() === "NAS100" ? "NDX" : s;

async function getSpot(symbol) {
  if (!TD) return 100;
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(TD)}`;
  const r = await fetch(url); const j = await r.json();
  return parseFloat(j.close ?? j.price ?? j.last) || 100;
}

function synthChain(spot, strikes = 25) {
  const out = [];
  const min = Math.max(1, spot * 0.8), max = spot * 1.2;
  const step = (max - min) / (strikes - 1);
  for (let i = 0; i < strikes; i++) {
    const K = +(min + i * step).toFixed(2);
    const m = (K - spot) / spot;
    const iv = 0.35 - Math.min(Math.abs(m), 0.3) * 0.2;
    const baseC = Math.max(0, spot - K);
    const premC = +(baseC + Math.max(0.2, Math.abs(m) * 2.0)).toFixed(2);
    const premP = +((Math.max(0, K - spot)) + Math.max(0.2, Math.abs(m) * 2.0)).toFixed(2);
    const mk = (p) => ({ bid: +(p * 0.98).toFixed(2), ask: +(p * 1.02).toFixed(2), last: +p.toFixed(2) });
    const vol = Math.floor(2000 * (1 - Math.min(Math.abs(m) * 1.6, 0.95)));
    const oi  = Math.floor(500 + Math.random() * 3000);
    const gamma = +(0.01 * Math.exp(-Math.abs(m) * 4)).toFixed(5);
    const theta = +(-0.02 * (1 + Math.abs(m))).toFixed(3);
    const vega  = +(0.15 * (1 - Math.min(Math.abs(m) * 1.2, 0.9))).toFixed(3);

    out.push(
      { type:"call", strike:K, ...mk(premC), iv, delta:+(1/(1+Math.exp((K-spot)/(spot*0.06)))).toFixed(3), gamma, theta, vega, volume:vol, oi },
      { type:"put",  strike:K, ...mk(premP), iv, delta:+(-1*(1-1/(1+Math.exp((K-spot)/(spot*0.06))))).toFixed(3), gamma, theta, vega, volume:Math.floor(vol*0.9), oi:Math.floor(oi*0.9) }
    );
  }
  return out;
}

export async function handler(event) {
  try {
    const symbol = mapSym(event.queryStringParameters?.symbol || "AAPL");
    const expiration = event.queryStringParameters?.expiration || "";
    const spot = await getSpot(symbol);
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ symbol, expiration, spot, vendor:"demo", updated:new Date().toISOString(), options: synthChain(spot) })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
