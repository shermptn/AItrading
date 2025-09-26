// Simple wrapper around fetch that surfaces 429 quota errors to the frontend code.
// Exports: apiGet, apiPost

export async function apiGet<T = any>(path: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const url = `/api/${path}${qs ? `?${qs}` : ''}`;

  const resp = await fetch(url);
  const text = await resp.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error('Invalid JSON response from server.');
  }

  if (!resp.ok) {
    // Quota-specific handling
    if (resp.status === 429 || (json && json.error === 'quota_exceeded')) {
      const msg = json?.message || 'API quota has been exceeded for today.';
      const err: any = new Error(msg);
      err.code = 'quota_exceeded';
      throw err;
    }
    const msg = json?.message || `Request failed with status ${resp.status}`;
    throw new Error(msg);
  }

  return json as T;
}

export async function apiPost<T = any>(path: string, body: any = {}): Promise<T> {
  const url = `/api/${path}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await resp.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error('Invalid JSON response from server.');
  }

  if (!resp.ok) {
    // Quota-specific handling
    if (resp.status === 429 || (json && json.error === 'quota_exceeded')) {
      const msg = json?.message || 'API quota has been exceeded for today.';
      const err: any = new Error(msg);
      err.code = 'quota_exceeded';
      throw err;
    }
    const msg = json?.message || `Request failed with status ${resp.status}`;
    throw new Error(msg);
  }

  return json as T;
}
