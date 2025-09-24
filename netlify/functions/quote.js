// netlify/functions/quote.js
import fetch from "node-fetch";

export async function handler(event) {
  try {
    const symbol = event.queryStringParameters.symbol || "AAPL";

    // Yahoo Finance API (unofficial but free)
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }
    const data = await response.json();

    if (!data.quoteResponse.result || data.quoteResponse.result.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No data found" }),
      };
    }

    const q = data.quoteResponse.result[0];

    return {
      statusCode: 200,
      body: JSON.stringify({
        symbol: q.symbol,
        name: q.shortName,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        percent: q.regularMarketChangePercent,
        high: q.regularMarketDayHigh,
        low: q.regularMarketDayLow,
        volume: q.regularMarketVolume,
        previousClose: q.regularMarketPreviousClose,
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
