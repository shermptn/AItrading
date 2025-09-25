// netlify/functions/openai.js
export default async function handler(req, res) {
  // CORS + preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }).end();
  }
  const allow = hdrs => res.set({ 'Access-Control-Allow-Origin': '*', ...hdrs });

  if (req.method === 'GET') {
    return allow().status(200).json({ ok: true, message: 'openai proxy up' });
  }

  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return allow().status(500).json({ error: 'Missing OPENAI_API_KEY env var' });
    }

    let body = {};
    try { body = req.body || JSON.parse(req.rawBody || '{}'); } catch { body = {}; }

    // Accept either {prompt} or full {messages}
    const { prompt, messages, model: rawModel, max_tokens = 600 } = body;

    // Model mapping / fallback so the UI works out of the box
    const modelMap = {
      'gpt-5-thinking': 'gpt-4o-mini',
      'gpt-5': 'gpt-4o-mini',
      'gpt-4.1': 'gpt-4o',
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini'
    };
    const model = modelMap[rawModel] || 'gpt-4o-mini';

    const payload = messages?.length
      ? { model, messages, max_tokens }
      : { model, messages: [{ role: 'user', content: String(prompt || 'Provide a short response.') }], max_tokens };

    // Call OpenAI (no SDK; Node fetch)
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    if (!r.ok) {
      // Bubble useful error text to the browser (so you’ll see it in the UI)
      return allow().status(r.status).json({ error: 'Upstream OpenAI error', detail: text });
    }

    let j;
    try { j = JSON.parse(text); } catch {
      return allow().status(502).json({ error: 'Non-JSON from OpenAI', sample: text.slice(0, 200) });
    }

    const content = j.choices?.[0]?.message?.content ?? '';
    return allow().status(200).json({ text: content, raw: j });
  } catch (e) {
    return allow().status(500).json({ error: e.message || 'Proxy failure' });
  }
}
