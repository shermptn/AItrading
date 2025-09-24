// netlify/functions/options-expirations.js
import fetch from "node-fetch";
const TD = process.env.TWELVE_DATA_KEY;
const mapSym = (s) => (s || "").toUpperCase() === "NAS100" ? "NDX" : s;

function nextFridays(n = 8) {
  const out = [];
  let d = new Date();
  for (let i = 0; i < 120 && out.length < n; i++) {
    d = new Date(Date.now() + i * 86400000);
    if (d.getDay() === 5) { // Fri
      out.push(d.toISOString().slice(0, 10));
    }
  }
  return out;
}

export async function handler(event) {
  try {
    const symbol = mapSym(event.queryStringParameters?.symbol || "AAPL");

    // Try to ensure symbol is valid by fetching a quote (optional)
    if (!TD) {
      // still return dates for demo, but flag vendor
      return { statusCode: 200, body: JSON.stringify({ symbol, vendor: "demo", expirations: nextFridays(8) }) };
    }

    return { statusCode: 200, body: JSON.stringify({ symbol, vendor: "demo", expirations: nextFridays(8) }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
