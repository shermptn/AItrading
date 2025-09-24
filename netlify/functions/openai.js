export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }
    const { prompt, model = "gpt-5-thinking", max_tokens = 500 } = JSON.parse(event.body || "{}");
    if (!prompt) return { statusCode: 400, body: JSON.stringify({ error: "prompt required" }) };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Demo fallback
      return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ text: `**(demo)** ${prompt.slice(0, 140)}…` }) };
    }

    // Example passthrough; adjust to your actual OpenAI endpoint if different
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens
      })
    });
    if (!r.ok) throw new Error(`OpenAI ${r.status}`);
    const j = await r.json();

    // Normalize to support your client’s flexible parser
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ choices: j.choices ?? [], text: j.choices?.[0]?.message?.content ?? "" })
    };
  } catch (e) {
    return { statusCode: 500, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: String(e) }) };
  }
}
