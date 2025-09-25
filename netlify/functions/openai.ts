import type { Handler } from "@netlify/functions";

// The full prompt definitions now live securely on the server
const FIN_PROMPTS = (symbol: string) => ({
  'market-conditions': `As a sell-side strategist, analyze ${symbol}. Provide: 1) Market regime (bull/bear/sideways). 2) Key support/resistance levels. 3) Three likely scenarios. 4) Core risks.`,
  'position-logic': `For ${symbol}, create a risk-first trade plan. Detail entry logic, profit targets, and a clear stop-loss strategy.`,
  'news-impact': `What recent news catalysts for ${symbol} are likely priced in? What upcoming news could invalidate the current trend?`,
  'technical-summary': `Provide a consolidated technical summary for ${symbol}, analyzing momentum (RSI), volatility (ATR), and trend.`,
  'sentiment-analysis': `Scan recent news for ${symbol}. Quantify the sentiment as a percentage (e.g., 70% bullish). List the top bullish/bearish keywords.`,
  'correlation-analysis': `Analyze the 30-day correlation of ${symbol} with SPY and QQQ. Is it showing relative strength/weakness?`,
  'volatility-forecast': `For ${symbol}, compare its 30-day historical volatility with its current implied volatility. Is IV elevated or compressed?`,
  'earnings-prep': `For ${symbol}'s upcoming earnings, list: 1) Consensus EPS/revenue estimates. 2) Results from the last 2 quarters. 3) Key topics for the conference call.`
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { promptId, symbol } = JSON.parse(event.body || "{}");
    if (!promptId || !symbol) return { statusCode: 400, body: JSON.stringify({ error: "Missing promptId or symbol" }) };

    // Build the full prompt on the server
    const prompts = FIN_PROMPTS(symbol.toUpperCase());
    const fullPrompt = (prompts as any)[promptId];
    if (!fullPrompt) return { statusCode: 400, body: JSON.stringify({ error: "Invalid promptId" }) };

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
          { role: "user", content: fullPrompt },
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
