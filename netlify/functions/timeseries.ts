import type { Handler } from '@netlify/functions';

const API_BASE = 'https://api.twelvedata.com';

// Simple in-memory cache (ephemeral)
type CacheEntry = { expiresAt: number; body: any };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

function getApiKeyFromEnv(): string | undefined {
  // Accept several commonly used env var names to avoid mismatches
  return (
    process.env.TWELVEDATA_API_KEY ||
    process.env.TWELVE_DATA_KEY ||
    process.env.TWELVE_DATAKEY ||
    process.env.TWELVEDATA_KEY
  );
}

export const handler: Handler = async (event) => {
  const { symbol = 'SPY', interval = '1day', limit = '250' } = event.queryStringParameters || {};
  const key = getApiKeyFromEnv();

  // Debug log presence of key (DO NOT log the key itself)
  console.log('TWELVEDATA key present in env:', !!key);

  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'missing_api_key',
        message:
          'TwelveData API key is not configured. Please set TWELVEDATA_API_KEY (or TWELVE_DATA_KEY) in Netlify environment variables and redeploy.',
      }),
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

  const url = `${API_BASE}/time_series?symbol=${encodeURIComponent(
    symbol,
  )}&interval=${encodeURIComponent(interval)}&outputsize=${encodeURIComponent(limit)}&format=json&apikey=${encodeURIComponent(
    key,
  )}`;

  try {
    const resp = await fetch(url);
    const text = await resp.text();
    let json: any;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      console.error('Failed to parse TwelveData response:', parseErr, 'text:', text?.slice?.(0, 100));
      return { statusCode: 502, body: JSON.stringify({ error: 'invalid_response', message: 'Invalid response from data provider.' }) };
    }

    // Provider error detection
    if (json && (json.status === 'error' || json.code)) {
      const message = json.message || JSON.stringify(json);
      console.warn('Provider returned error:', message);
      if (/run out of API credits|quota|exceeded/i.test(message)) {
        // If cached, return stale cached data as fallback
        if (cached && cached.body) {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'x-cache': 'STALE' },
            body: JSON.stringify(cached.body),
          };
        }
        return { statusCode: 429, body: JSON.stringify({ error: 'quota_exceeded', message }) };
      }
      return { statusCode: 502, body: JSON.stringify({ error: 'provider_error', message }) };
    }

    // Success -> cache and return
    cache.set(cacheKey, { expiresAt: now + CACHE_TTL, body: json });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'x-cache': 'MISS' },
      body: JSON.stringify(json),
    };
  } catch (err: any) {
    console.error('Timeseries function fetch error:', err && err.message ? err.message : err);
    // fallback to cache if available
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
