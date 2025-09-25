// netlify/functions/openai.js
exports.handler = async (event) => {
  try {
    // Quick health check
    if (event.queryStringParameters?.ping) {
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true })
      };
    }

    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { prompt } = JSON.parse(event.body || "{}");
    if (!prompt) {
      return { statusCode: 400, body: "Missing prompt" };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: "Missing OPENAI_API_KEY" };
    }

    // Call OpenAI Responses API (JSON mode)
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",          // safe, widely available
        input: `You are a cautious trading explainer. Format in markdown.\n\nUser prompt: ${prompt}`,
        max_output_tokens: 500
      })
    });

    const text = await r.text();
    if (!r.ok) {
      return { statusCode: r.status, body: text || "Upstream error" };
    }
    const j = JSON.parse(text);
    const content =
      j.output_text ||
      j.text ||
      j.content ||
      j.choices?.[0]?.message?.content ||
      "(no content)";

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: content })
    };
  } catch (e) {
    return { statusCode: 500, body: e.message || "Server error" };
  }
};
