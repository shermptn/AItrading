import type { Handler } from '@netlify/functions';

const API_BASE = 'https://api.twelvedata.com';

// Simple in-memory cache (ephemeral, only while function instance is warm)
type CacheEntry = { expiresAt: number; body: any };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export const handler: Handler = async (event) => {
  const { symbol = 'SPY', interval = '1day', limit = '250' } = event.queryStringParameters || {};
  const key = process.env.TWELVEDATA_API_KEY;

  // Log presence for debugging (DO NOT LOG the key itself)
  console.log('TWELVEDATA_API_KEY present:', !!key);

  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'missing_api_key', message: 'TwelveData API key is not configured for this site.' }),
    };
  }

  const cacheKey = `${symbol}:${interval}:${limit}`;
  const now = Date.now();

  // Serve from cache if available
  const cached = cache.get(cacheKey);
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
    let json: any;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      console.error('Failed to parse TwelveData response', parseErr);
      return { statusCode: 502, body: JSON.stringify({ error: 'invalid_response', message: 'Invalid response from data provider.' }) };
    }

    // Provider error detection
    if (json && (json.status === 'error' || json.code)) {
      const message = json.message || JSON.stringify(json);
      if (/run out of API credits|quota|exceeded/i.test(message)) {
        // If we have cached body, return it as a stale fallback
        if (cached && cached.body) {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'x-cache': 'STALE' },
            body: JSON.stringify(cached.body),
          };
        }
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

    // Success -> cache and return
    cache.set(cacheKey, { expiresAt: now + CACHE_TTL, body: json });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'x-cache': 'MISS' },
      body: JSON.stringify(json),
    };
  } catch (err) {
    console.error('Timeseries function error:', err);
    // If fetch failed and cache exists, return cached
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
