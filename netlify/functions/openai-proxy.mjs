import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function handler(event, context) {
  try {
    if (event.queryStringParameters?.ping) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: body.messages || [{ role: "user", content: "Hello AI" }]
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
}
