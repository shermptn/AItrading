// Netlify Function: OpenAI Proxy (ESM)
// Path: netlify/functions/openai.mjs

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
};

function json(status, data) {
  return {
    statusCode: status,
    headers: { "content-type": "application/json; charset=utf-8", ...cors },
    body: JSON.stringify(data),
  };
}

export async function handler(event) {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  // Health check
  if (event.httpMethod === "GET") {
    if (event.queryStringParameters && event.queryStringParameters.ping) {
      return json(200, { ok: true });
    }
    return json(405, { error: "Use POST for analysis. Append ?ping=1 for health check." });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json(500, { error: "Missing OPENAI_API_KEY environment variable" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { error: "Invalid JSON body" });
  }

  const prompt = (body.prompt || "").toString();
  if (!prompt) {
    return json(400, { error: "Missing 'prompt' in request body" });
  }

  // Accept any model but remap the non-public label used in the UI
  let model = body.model || "gpt-4o-mini";
  if (model === "gpt-5-thinking") model = "gpt-4o-mini";

  const max_tokens = Number.isFinite(body.max_tokens) ? body.max_tokens : 600;

  try {
    // Using Chat Completions for broad compatibility
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens,
      }),
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch {
      return json(502, { error: "OpenAI returned non-JSON", detail: text.slice(0, 300) });
    }

    if (!r.ok) {
      // Bubble up OpenAI’s error message
      const detail = data?.error?.message || data?.error || data;
      return json(r.status, { error: "OpenAI error", detail });
    }

    const content =
      data.choices?.[0]?.message?.content ??
      data.text ??
      "";

    return json(200, {
      model,
      text: content,
      raw: { id: data.id, usage: data.usage }, // small useful bits
    });

  } catch (e) {
    return json(502, { error: "Proxy request failed", detail: e.message });
  }
}
