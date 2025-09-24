// BEGIN EDIT: OpenAI proxy (accepts {prompt, model, max_tokens})
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return json(405, { error: "POST only" });
    }
    if (!OPENAI_API_KEY) {
      return json(200, { text: "**AI disabled** — set OPENAI_API_KEY in Netlify." });
    }

    const body = JSON.parse(event.body || "{}");
    const prompt = String(body.prompt || "").trim();
    const model  = body.model || "gpt-4o-mini"; // server can map safely
    const max_tokens = Math.min(1000, body.max_tokens || 500);

    if (!prompt) return json(400, { error: "prompt required" });

    // Use the Chat Completions API but return a flattened {text} for the client.
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a concise trading analyst. Max 250 words." },
          { role: "user", content: prompt }
        ],
        max_tokens
      })
    });

    if (!r.ok) {
      const errTxt = await r.text();
      return json(r.status, { error: `OpenAI ${r.status}`, detail: errTxt.slice(0, 300) });
    }
    const j = await r.json();
    const text =
      j.text ||
      j.content ||
      j.choices?.[0]?.message?.content ||
      "";

    return json(200, { text });
  } catch (e) {
    return json(500, { error: String(e) });
  }
}

function json(statusCode, body){
  return { statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) };
}
// END EDIT
