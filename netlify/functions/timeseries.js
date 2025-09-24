// netlify/functions/timeseries.js
import fetch from "node-fetch";

export async function handler(event) {
  try {
    const symbol = event.queryStringParameters.symbol || "AAPL";
    const interval = event.queryStringParameters.interval || "1d"; // 1d, 1h, etc.
    const range = event.queryStringParameters.range || "5d"; // 5d, 1mo, etc.

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }
    const data = await response.json();

    if (!data.chart || !data.chart.result) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No chart data found" }),
      };
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const ohlc = result.indicators.quote[0];

    const candles = timestamps.map((t, i) => ({
      time: new Date(t * 1000).toISOString(),
      open: ohlc.open[i],
      high: ohlc.high[i],
      low: ohlc.low[i],
      close: ohlc.close[i],
      volume: ohlc.volume[i],
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        symbol,
        candles,
        updated: new Date().toISOString(),
        source: "Yahoo Finance",
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
