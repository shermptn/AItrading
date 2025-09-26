import type { Handler } from "@netlify/functions";

// Enhanced logging utility
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, ...(data && { data }) };
  console.log(JSON.stringify(logEntry));
};

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

// Validate request data
function validateRequest(body: string): { promptId: string; symbol: string } | null {
  try {
    const { promptId, symbol } = JSON.parse(body || "{}");
    
    if (!promptId || typeof promptId !== 'string') {
      throw new Error('Missing or invalid promptId');
    }
    
    if (!symbol || typeof symbol !== 'string' || !/^[A-Z]{1,5}$/.test(symbol)) {
      throw new Error('Missing or invalid symbol (must be 1-5 uppercase letters)');
    }
    
    return { promptId, symbol };
  } catch (error) {
    log('error', 'Request validation failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
}

export const handler: Handler = async (event) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  log('info', 'OpenAI request started', { requestId, method: event.httpMethod });

  // Method validation
  if (event.httpMethod !== "POST") {
    log('warn', 'Invalid method', { requestId, method: event.httpMethod });
    return { 
      statusCode: 405, 
      headers: { "Allow": "POST" },
      body: JSON.stringify({ error: "Method Not Allowed" }) 
    };
  }

  try {
    // Validate request body
    const validation = validateRequest(event.body || "");
    if (!validation) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Missing or invalid promptId or symbol" }) 
      };
    }

    const { promptId, symbol } = validation;
    log('info', 'Request validated', { requestId, promptId, symbol });

    // Check API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      log('error', 'OpenAI API key not configured', { requestId });
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Service configuration error" }) 
      };
    }

    // Build the full prompt on the server
    const prompts = FIN_PROMPTS(symbol.toUpperCase());
    const fullPrompt = (prompts as any)[promptId];
    if (!fullPrompt) {
      log('warn', 'Invalid promptId', { requestId, promptId });
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Invalid promptId" }) 
      };
    }

    log('info', 'Making OpenAI API request', { requestId, promptLength: fullPrompt.length });

    // Make OpenAI API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000); // 40 second timeout

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
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
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `OpenAI API error: ${res.status}`;
      
      log('error', 'OpenAI API error', { 
        requestId, 
        status: res.status, 
        error: errorMessage,
        type: errorData.error?.type 
      });

      // Return appropriate error based on status code
      if (res.status === 429) {
        return { 
          statusCode: 429, 
          body: JSON.stringify({ error: "AI service is currently busy. Please try again in a moment." }) 
        };
      } else if (res.status === 401) {
        return { 
          statusCode: 500, 
          body: JSON.stringify({ error: "Service authentication error" }) 
        };
      } else {
        return { 
          statusCode: 500, 
          body: JSON.stringify({ error: "AI analysis service temporarily unavailable" }) 
        };
      }
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "No content returned from AI.";
    
    log('info', 'OpenAI request completed successfully', { 
      requestId, 
      responseLength: content.length,
      tokensUsed: data.usage?.total_tokens 
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    };

  } catch (error: any) {
    // Handle different types of errors
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;

    if (error.name === 'AbortError') {
      errorMessage = "Request timeout - AI analysis took too long";
      statusCode = 408;
    } else if (error.message) {
      errorMessage = error.message;
    }

    log('error', 'Request failed', { 
      requestId, 
      error: errorMessage,
      stack: error.stack 
    });

    return { 
      statusCode, 
      body: JSON.stringify({ error: errorMessage }) 
    };
  }
};
