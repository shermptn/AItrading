// Netlify Function: OpenAI relay (CommonJS style to avoid res.set issues)
const fetch = global.fetch;

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const ok = (data, extra = {}) => ({
  statusCode: 200,
  headers: { ...JSON_HEADERS, ...extra },
  body: JSON.stringify(data)
});

const err = (status, message, extra = {}) => ({
  statusCode: status,
  headers: { ...JSON_HEADERS, ...extra },
  body: JSON.stringify({ error: message, status })
});

exports.handler = async (event) => {
  try {
    // Health check
    if (event.httpMethod === "GET" && (event.queryStringParameters?.ping || "") !== "") {
      return ok({ ok: true, message: "openai function alive" });
    }

    if (event.httpMethod !== "POST") {
      return err(405, "Method not allowed. Use POST.");
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_TOKEN;
    if (!apiKey) {
      // This tells you the env var isn't being read in the runtime
      return err(500, "Missing OPENAI_API_KEY in Netlify env.");
    }

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return err(400, "Invalid JSON body.");
    }

    const prompt = (body.prompt || "").toString().trim();
    if (!prompt) return err(400, "Missing 'prompt'.");

    // Use a *real* model that exists on OpenAI. Fallback is gpt-4o-mini.
    // (If you have access to a different model, you can pass it from the client.)
    const model = (body.model || "gpt-4o-mini").toString().trim();
    const max_tokens = Number.isFinite(body.max_tokens) ? body.max_tokens : 500;

    // Call OpenAI Chat Completions
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens
      })
    });

    // If OpenAI returns non-2xx, surface it so the UI can show a helpful message
    if (!r.ok) {
      let detail = "";
      try {
        const j = await r.json();
        detail = j?.error?.message || JSON.stringify(j);
      } catch {
        detail = await r.text();
      }
      // Typical messages you'll see: 401/403 (auth), 404 (bad model), 429/402 (quota), 500 (server)
      return err(502, `OpenAI request failed (${r.status}): ${detail}`);
    }

    const j = await r.json();
    const content = j?.choices?.[0]?.message?.content || "";

    return ok({
      text: content,
      model,
      usage: j?.usage || null
    });

  } catch (e) {
    return err(500, e?.message || "Server error");
  }
};
