// netlify/functions/openai-proxy.mjs
// OpenAI proxy for your UI (ESM). No Express res.set anywhere.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
};

const j = (status, data) => ({
  statusCode: status,
  headers: { "content-type": "application/json; charset=utf-8", ...CORS },
  body: JSON.stringify(data),
});

export async function handler(event) {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  // Health check
  if (event.httpMethod === "GET") {
    if (event.queryStringParameters?.ping) return j(200, { ok: true });
    return j(405, { error: "Use POST. Tip: add ?ping=1 for health check." });
  }

  if (event.httpMethod !== "POST") return j(405, { error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return j(500, { error: "OPENAI_API_KEY not set in Netlify env vars" });

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return j(400, { error: "Invalid JSON body" }); }

  const prompt = (body.prompt || "").toString();
  if (!prompt) return j(400, { error: "Missing 'prompt' in request body" });

  // Map your UI label to a public model
  let model = body.model || "gpt-4o-mini";
  if (model === "gpt-5-thinking") model = "gpt-4o-mini";
  const max_tokens = Number.isFinite(body.max_tokens) ? body.max_tokens : 600;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens,
      }),
    });

    const raw = await r.text();
    let data; try { data = JSON.parse(raw); } catch { return j(502, { error: "OpenAI non-JSON", detail: raw.slice(0, 300) }); }
    if (!r.ok) return j(r.status, { error: "OpenAI error", detail: data?.error?.message || data });

    const content =
      data.choices?.[0]?.message?.content ??
      data.text ?? "";

    return j(200, { model, text: content, raw: { id: data.id, usage: data.usage } });
  } catch (e) {
    return j(502, { error: "Proxy request failed", detail: e.message });
  }
}
