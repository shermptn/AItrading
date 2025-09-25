exports.handler = async (event) => {
  try {
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

    // Use the correct OpenAI endpoint and payload for chat/completions
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a cautious trading explainer. Format in markdown." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500
      })
    });

    const text = await r.text();
    if (!r.ok) {
      return { statusCode: r.status, body: text || "Upstream error" };
    }
    const j = JSON.parse(text);
    const content =
      j.choices?.[0]?.message?.content ||
      j.output_text ||
      j.text ||
      j.content ||
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
