// BEGIN EDIT: netlify/functions/timeseries.js — Yahoo Finance time series
import yahooFinance from 'yahoo-finance2';

const json = (code, body) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

function mapSymbol(s = '') { return s.toUpperCase() === 'NAS100' ? '^NDX' : s.toUpperCase(); }

export async function handler(event) {
  try {
    const { symbol: raw, interval = '1m', range } = event.queryStringParameters || {};
    if (!raw) return json(400, { error: 'symbol required' });
    const symbol = mapSymbol(raw);

    // Choose sane default ranges
    const i = (interval || '1m').toLowerCase();
    let rng = range;
    if (!rng) rng = i === '1m' || i === '5m' ? '1d' : (i === '1d' ? '1y' : '1mo');

    // Fetch Yahoo chart
    const chart = await yahooFinance.chart(symbol, { interval: i, range: rng });
    // yahoo-finance2 gives a normalized shape under "quotes"
    let rows = [];
    if (chart?.quotes?.length) {
      rows = chart.quotes.map(q => ({
        datetime: new Date(q.date).toISOString(),
        open: +q.open,
        high: +q.high,
        low: +q.low,
        close: +q.close,
        volume: +q.volume
      }));
    } else {
      // fallback for older shapes, just in case
      const r = chart?.result?.[0];
      const t = r?.timestamp || [];
      const o = r?.indicators?.quote?.[0]?.open || [];
      const h = r?.indicators?.quote?.[0]?.high || [];
      const l = r?.indicators?.quote?.[0]?.low || [];
      const c = r?.indicators?.quote?.[0]?.close || [];
      const v = r?.indicators?.quote?.[0]?.volume || [];
      rows = t.map((ts, idx) => ({
        datetime: new Date(ts * 1000).toISOString(),
        open: +o[idx],
        high: +h[idx],
        low: +l[idx],
        close: +c[idx],
        volume: +v[idx]
      })).filter(rw => Number.isFinite(rw.close));
    }

    return json(200, {
      symbol: raw.toUpperCase(),
      interval: i,
      range: rng,
      candles: rows,
      source: 'Yahoo (Chart)'
    });
  } catch (e) {
    return json(500, { error: String(e) });
  }
}
// END EDIT
