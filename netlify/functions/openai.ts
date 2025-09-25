import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { prompt } = JSON.parse(event.body || "{}");
    if (!prompt) return { statusCode: 400, body: JSON.stringify({ error: "Missing prompt" }) };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a concise and insightful financial analyst. Provide actionable information for traders. Use markdown for formatting." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'OpenAI API error');
    
    const content = data.choices?.[0]?.message?.content || "No content returned from AI.";
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
