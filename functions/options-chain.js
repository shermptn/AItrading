// netlify/functions/options-chain.js
import fetch from "node-fetch";
const TD = process.env.TWELVE_DATA_KEY;
const mapSym = (s) => (s || "").toUpperCase() === "NAS100" ? "NDX" : s;

async function getSpot(symbol) {
  if (!TD) return 100;
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(TD)}`;
  const r = await fetch(url); const j = await r.json();
  const px = parseFloat(j.close ?? j.price ?? j.last) || 100;
  return px;
}

// super-light greeks approximations just for UI demo (not for trading decisions)
function synthChain(spot, exp = "", strikes = 21) {
  const out = [];
  const min = Math.max(1, spot * 0.8), max = spot * 1.2;
  const step = (max - min) / (strikes - 1);
  for (let i = 0; i < strikes; i++) {
    const K = +(min + i * step).toFixed(2);
    const moneyness = (K - spot) / spot; // negative -> ITM call
    const iv = 0.35 - Math.min(Math.abs(moneyness), 0.3) * 0.2; // smile-ish
    const base = Math.max(0, spot - K); // call intrinsic
    const premiumCall = +(base + Math.max(0.2, Math.abs(moneyness) * 2.0)).toFixed(2);
    const premiumPut  = +((Math.max(0, K - spot)) + Math.max(0.2, Math.abs(moneyness) * 2.0)).toFixed(2);

    const mk = (p) => ({
      bid: +(p * 0.98).toFixed(2),
      ask: +(p * 1.02).toFixed(2),
      last: +p.toFixed(2)
    });
    const vol = Math.floor(2000 * (1 - Math.min(Math.abs(moneyness) * 1.6, 0.95)));
    const oi  = Math.floor(500 + Math.random() * 3000);

    const call = {
      type: "call", strike: K, ...mk(premiumCall),
      iv, delta: +(1 / (1 + Math.exp((K - spot) / (spot * 0.06))) ).toFixed(3),
      gamma: +(0.01 * Math.exp(-Math.abs(moneyness) * 4)).toFixed(5),
      theta: +(-0.02 * (1 + Math.abs(moneyness))).toFixed(3),
      vega:  +(0.15 * (1 - Math.min(Math.abs(moneyness) * 1.2, 0.9))).toFixed(3),
      volume: vol, oi
    };
    const put = {
      type: "put", strike: K, ...mk(premiumPut),
      iv, delta: +(-1 * (1 - 1 / (1 + Math.exp((K - spot) / (spot * 0.06)))) ).toFixed(3),
      gamma: call.gamma,
      theta: call.theta,
      vega: call.vega,
      volume: Math.floor(vol * 0.9),
      oi: Math.floor(oi * 0.9)
    };

    out.push(call, put);
  }
  return out;
}

export async function handler(event) {
  try {
    const symbol = mapSym(event.queryStringParameters?.symbol || "AAPL");
    const expiration = event.queryStringParameters?.expiration || "";
    const spot = await getSpot(symbol);

    const options = synthChain(spot, expiration, 25);
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        symbol, expiration, spot,
        vendor: "demo", // swap to "polygon"/"tradier" later
        updated: new Date().toISOString(),
        options
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
