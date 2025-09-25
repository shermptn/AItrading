export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const { symbol, prompt, context } = JSON.parse(event.body || "{}");
    const userPrompt = `${prompt || "Analyze the asset."}\nSymbol: ${symbol || "AAPL"}\n${context ? context : ""}`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: "You are a trading assistant. Be concise, structured, and avoid financial advice." },
          { role: "user", content: userPrompt }
        ]
      })
    });
    if (!r.ok) {
      const err = await r.text();
      return { statusCode: r.status, body: JSON.stringify({ error: err }) };
    }
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || "No response";
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e?.message || e) }) };
  }
}
