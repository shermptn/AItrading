import type { Handler } from '@netlify/functions';

const API_BASE = 'https://api.twelvedata.com';
type CacheEntry = { expiresAt: number; body: any };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export const handler: Handler = async (event) => {
  const { symbol = 'SPY', interval = '1day', limit = '250' } = event.queryStringParameters || {};
  const key = process.env.TWELVEDATA_API_KEY;

  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'missing_api_key', message: 'TwelveData API key is not configured for this site.' }),
    };
  }

  const cacheKey = `${symbol}:${interval}:${limit}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  // Always serve from cache if available and not expired
  if (cached && cached.expiresAt > now) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'x-cache': 'HIT' },
      body: JSON.stringify(cached.body),
    };
  }

  const url = `${API_BASE}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=${encodeURIComponent(limit)}&format=json&apikey=${encodeURIComponent(key)}`;

  try {
    const resp = await fetch(url);
    const text = await resp.text();

    // New: Check for quota error even in non-JSON or error responses
    if (/run out of API credits|quota|exceeded/i.test(text)) {
      if (cached && cached.body) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'x-cache': 'STALE' },
          body: JSON.stringify(cached.body),
        };
      }
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'quota_exceeded', message: 'API quota exceeded.' }),
      };
    }
    
    let json: any;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      console.error('Failed to parse TwelveData response', text);
      // If parsing fails but we have a stale cache, use it
      if (cached && cached.body) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'x-cache': 'STALE' },
          body: JSON.stringify(cached.body),
        };
      }
      return { statusCode: 502, body: JSON.stringify({ error: 'invalid_response', message: 'Invalid response from data provider.' }) };
    }

    // Provider error detection (for other errors)
    if (json && (json.status === 'error' || json.code)) {
      const message = json.message || JSON.stringify(json);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'provider_error', message }),
      };
    }

    // Success -> cache and return
    cache.set(cacheKey, { expiresAt: now + CACHE_TTL, body: json });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'x-cache': 'MISS' },
      body: JSON.stringify(json),
    };
  } catch (err) {
    console.error('Timeseries function error:', err);
    // If fetch failed and we have a stale cache, use it
    if (cached && cached.body) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'x-cache': 'STALE' },
        body: JSON.stringify(cached.body),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'internal_error', message: 'Failed to fetch timeseries data.' }),
    };
  }
};
