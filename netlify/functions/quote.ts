import type { Handler } from '@netlify/functions';

function getApiKeyFromEnv(): string | undefined {
  return (
    process.env.TWELVEDATA_API_KEY ||
    process.env.TWELVE_DATA_KEY ||
    process.env.TWELVE_DATAKEY ||
    process.env.TWELVEDATA_KEY
  );
}

export const handler: Handler = async (event) => {
  try {
    const symbol = new URLSearchParams(event.queryStringParameters as any).get('symbol') || 'SPY';
    const key = getApiKeyFromEnv();

    console.log('quote handler - TWELVEDATA key present:', !!key);

    if (!key) {
      return { statusCode: 500, body: JSON.stringify({ error: 'missing_api_key', message: 'TwelveData API key is not configured.' }) };
    }

    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('Invalid JSON from quote provider:', e, 'text:', text?.slice?.(0, 200));
      return { statusCode: 502, body: JSON.stringify({ error: 'invalid_response', message: 'Invalid response from provider.' }) };
    }

    if (data && (data.status === 'error' || data.code)) {
      const message = data.message || JSON.stringify(data);
      console.warn('Quote provider error:', message);
      if (/quota|credits|limit/i.test(message)) {
        return { statusCode: 429, body: JSON.stringify({ error: 'quota_exceeded', message }) };
      }
      return { statusCode: 502, body: JSON.stringify({ error: 'provider_error', message }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (e: any) {
    console.error('Quote function error:', e && e.message ? e.message : e);
    return { statusCode: 500, body: JSON.stringify({ error: 'internal_error', message: e.message || 'Unknown error' }) };
  }
};
