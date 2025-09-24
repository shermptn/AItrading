// BEGIN EDIT: netlify/functions/quote.js — Yahoo Finance proxy (no key needed)
import yahooFinance from 'yahoo-finance2';

const json = (code, body) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

// Map your NAS100 → Yahoo symbol
function mapSymbol(s = '') {
  const x = s.toUpperCase();
  if (x === 'NAS100') return '^NDX';
  return x;
}

export async function handler(event) {
  try {
    const raw = (event.queryStringParameters || {}).symbol || '';
    if (!raw) return json(400, { error: 'symbol required' });
    const symbol = mapSymbol(raw);

    // 1) Quote object
    const q = await yahooFinance.quote(symbol);
    // yahoo fields
    const price = num(q.regularMarketPrice);
    const change = num(q.regularMarketChange);
    const changePercent = num(q.regularMarketChangePercent);
    const high = num(q.regularMarketDayHigh, price);
    const low = num(q.regularMarketDayLow, price);
    const volume = num(q.regularMarketVolume, 0);
    const updated = q.regularMarketTime ? new Date(q.regularMarketTime * 1000).toISOString() : new Date().toISOString();

    // 2) Try to get a *very* fresh last trade via chart 1m
    // (If the market is open, this often reflects the most recent minute)
    let latestPrice = null, latestTs = null;
    try {
      const chart = await yahooFinance.chart(symbol, { range: '1d', interval: '1m' });
      const series = chart?.quotes || (chart?.result?.[0]?.indicators?.quote?.[0]?.close ? chart.result[0] : null);
      if (chart?.quotes?.length) {
        const last = chart.quotes[chart.quotes.length - 1];
        if (isFinite(last?.close)) {
          latestPrice = Number(last.close);
          latestTs = last.date ? new Date(last.date).toISOString() : updated;
        }
      } else if (series) {
        const close = series.indicators.quote[0].close;
        const ts = series.timestamp;
        const i = close.length - 1;
        if (i >= 0 && isFinite(close[i])) {
          latestPrice = Number(close[i]);
          latestTs = ts?.[i] ? new Date(ts[i] * 1000).toISOString() : updated;
        }
      }
    } catch (_) { /* chart can fail OOH; ignore */ }

    const finalPrice = isFinite(latestPrice) ? latestPrice : price;
    const finalUpdated = latestTs || updated;

    return json(200, {
      symbol: raw.toUpperCase(),
      name: q.shortName || q.longName || raw.toUpperCase(),
      price: finalPrice,
      change: isFinite(change) ? change : 0,
      changePercent: isFinite(changePercent) ? changePercent : 0,
      high,
      low,
      volume,
      updated: finalUpdated,
      source: isFinite(latestPrice) ? 'Yahoo (1m)' : 'Yahoo (Quote)'
    });
  } catch (e) {
    return json(500, { error: String(e) });
  }
}

function num(v, d = 0) { const n = Number(v); return Number.isFinite(n) ? n : d; }
// END EDIT
