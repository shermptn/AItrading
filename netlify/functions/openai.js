// netlify/functions/openai.js
import fetch from "node-fetch";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Use POST" };
    }
    if (!OPENAI_API_KEY) throw new Error("Server missing OPENAI_API_KEY");

    const body = JSON.parse(event.body || "{}");
    const prompt = body.prompt || "Give a short market summary.";
    const model = body.model || "gpt-4o-mini";
    const max_tokens = body.max_tokens || 400;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${OPENAI_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a concise trading assistant. Avoid boilerplate." },
          { role: "user", content: prompt }
        ],
        max_tokens
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return { statusCode: r.status, body: JSON.stringify({ error: txt.slice(0, 500) }) };
    }

    const j = await r.json();
    const text = j.choices?.[0]?.message?.content || "";
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, model })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
