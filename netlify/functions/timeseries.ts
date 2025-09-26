import fetch from 'node-fetch';
import { Handler } from '@netlify/functions';

const API_BASE = 'https://api.twelvedata.com';

const handler: Handler = async (event) => {
  const { symbol = 'SPY', interval = '1day', limit = '250' } = event.queryStringParameters || {};
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'missing_api_key', message: 'TwelveData API key is not configured.' }),
    };
  }

  const url = `${API_BASE}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=${encodeURIComponent(limit)}&format=json&apikey=${encodeURIComponent(key)}`;

  try {
    const resp = await fetch(url);
    const text = await resp.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch (parseErr) {
      console.error('Failed to parse TwelveData response', parseErr);
      return { statusCode: 502, body: JSON.stringify({ error: 'invalid_response', message: 'Invalid response from data provider.' }) };
    }

    // Detect quota/exhausted message (TwelveData returns error objects in body)
    if (json && json.status === 'error') {
      const message = json.message || JSON.stringify(json);
      if (/run out of API credits|quota/i.test(message)) {
        return {
          statusCode: 429,
          body: JSON.stringify({ error: 'quota_exceeded', message }),
        };
      }
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'provider_error', message }),
      };
    }

    // Success path: return the JSON as-is
    return {
      statusCode: 200,
      body: JSON.stringify(json),
    };
  } catch (err) {
    console.error('Timeseries function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'internal_error', message: 'Failed to fetch timeseries data.' }),
    };
  }
};

export { handler };
