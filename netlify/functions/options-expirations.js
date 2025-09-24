// netlify/functions/options-expirations.js
const mapSym = (s) => (s || "").toUpperCase() === "NAS100" ? "NDX" : s;

function nextFridays(n = 8) {
  const out = [];
  for (let i = 0; out.length < n && i < 180; i++) {
    const d = new Date(Date.now() + i * 86400000);
    if (d.getDay() === 5) out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function handler(event) {
  const symbol = mapSym(event.queryStringParameters?.symbol || "AAPL");
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ symbol, vendor: "demo", expirations: nextFridays(8) })
  };
}
