import type { Handler } from "@netlify/functions";

// Enhanced logging utility
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, ...(data && { data }) };
  console.log(JSON.stringify(logEntry));
};

// Validate symbol format
function isValidSymbol(symbol: string): boolean {
  return /^[A-Z]{1,5}$/.test(symbol);
}

export const handler: Handler = async (event) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  log('info', 'Quote request started', { requestId, method: event.httpMethod });

  try {
    const symbol = (new URLSearchParams(event.queryStringParameters as any).get("symbol") || "SPY").toUpperCase();
    
    // Validate symbol
    if (!isValidSymbol(symbol)) {
      log('warn', 'Invalid symbol format', { requestId, symbol });
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Invalid symbol format. Must be 1-5 uppercase letters." }) 
      };
    }

    // Check API key
    const key = process.env.TWELVE_DATA_KEY;
    if (!key) {
      log('error', 'TwelveData API key not configured', { requestId });
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Service configuration error" }) 
      };
    }

    log('info', 'Making TwelveData quote request', { requestId, symbol });

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
    const res = await fetch(url, { signal: controller.signal });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      log('error', 'TwelveData API HTTP error', { requestId, status: res.status, statusText: res.statusText });
      return { 
        statusCode: res.status === 429 ? 429 : 500, 
        body: JSON.stringify({ 
          error: res.status === 429 
            ? "Rate limit exceeded. Please try again later." 
            : "Quote service temporarily unavailable"
        }) 
      };
    }

    const data = await res.json();

    // Check for API-level errors
    if (data.code && data.code >= 400) {
      log('error', 'TwelveData API error', { requestId, code: data.code, message: data.message });
      
      // Handle specific error codes
      if (data.code === 400) {
        return { 
          statusCode: 400, 
          body: JSON.stringify({ error: data.message || "Invalid request parameters" }) 
        };
      } else if (data.code === 404) {
        return { 
          statusCode: 404, 
          body: JSON.stringify({ error: `Symbol ${symbol} not found` }) 
        };
      } else if (data.code === 429) {
        return { 
          statusCode: 429, 
          body: JSON.stringify({ error: "Rate limit exceeded. Please try again later." }) 
        };
      } else {
        return { 
          statusCode: 500, 
          body: JSON.stringify({ error: "Quote service error" }) 
        };
      }
    }

    // Validate essential quote data
    if (!data.symbol) {
      log('warn', 'Invalid quote response - missing symbol', { requestId, data });
      return { 
        statusCode: 502, 
        body: JSON.stringify({ error: "Invalid response from quote service" }) 
      };
    }

    log('info', 'Quote request completed successfully', { 
      requestId, 
      symbol: data.symbol,
      price: data.price || data.close 
    });

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60" // Cache for 1 minute
      },
      body: JSON.stringify(data),
    };

  } catch (error: any) {
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;

    if (error.name === 'AbortError') {
      errorMessage = "Request timeout - quote service took too long to respond";
      statusCode = 408;
    } else if (error.message) {
      errorMessage = error.message;
    }

    log('error', 'Quote request failed', { 
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
