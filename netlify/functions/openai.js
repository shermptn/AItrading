// netlify/functions/openai.js
export async function handler(event) {
  // --- CORS / preflight ---
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: "",
    };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY missing");
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }) };
    }

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
    }

    const prompt = (body && body.prompt ? String(body.prompt) : "").trim();
    if (!prompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing 'prompt' in request body" }) };
    }

    // Always use a supported model on the server side
    const model = "gpt-4o"; // fast + good for analysis; you can switch to "gpt-4o-mini" to save cost

    // Build chat request
    const reqBody = {
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a cautious trading explainer. Respond in clear Markdown. Add brief risk reminders. Do not give financial advice.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("OpenAI error:", r.status, text);
      return { statusCode: r.status, headers, body: JSON.stringify({ error: "OpenAI error", details: text }) };
    }

    const j = JSON.parse(text);
    const content = j?.choices?.[0]?.message?.content ?? "";
    return { statusCode: 200, headers, body: JSON.stringify({ content }) };
  } catch (err) {
    console.error("Function crash:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error", details: String(err) }) };
  }
}
