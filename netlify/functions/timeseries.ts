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

// Validate interval
function isValidInterval(interval: string): boolean {
  const validIntervals = ['1min', '5min', '15min', '30min', '45min', '1h', '2h', '4h', '1day', '1week', '1month'];
  return validIntervals.includes(interval);
}

export const handler: Handler = async (event) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  log('info', 'Timeseries request started', { requestId, method: event.httpMethod });

  try {
    const params = new URLSearchParams(event.queryStringParameters as any);
    const symbol = (params.get("symbol") || "SPY").toUpperCase();
    const interval = params.get("interval") || "1day";
    const outputsize = params.get("limit") || "250";

    // Validate parameters
    if (!isValidSymbol(symbol)) {
      log('warn', 'Invalid symbol format', { requestId, symbol });
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Invalid symbol format. Must be 1-5 uppercase letters." }) 
      };
    }

    if (!isValidInterval(interval)) {
      log('warn', 'Invalid interval', { requestId, interval });
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Invalid interval. Check API documentation for valid intervals." }) 
      };
    }

    const limit = parseInt(outputsize);
    if (isNaN(limit) || limit < 1 || limit > 5000) {
      log('warn', 'Invalid limit', { requestId, outputsize });
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Invalid limit. Must be between 1 and 5000." }) 
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

    log('info', 'Making TwelveData API request', { requestId, symbol, interval, limit });

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${key}`;
    const res = await fetch(url, { signal: controller.signal });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      log('error', 'TwelveData API HTTP error', { requestId, status: res.status, statusText: res.statusText });
      return { 
        statusCode: res.status === 429 ? 429 : 500, 
        body: JSON.stringify({ 
          error: res.status === 429 
            ? "Rate limit exceeded. Please try again later." 
            : "Data service temporarily unavailable"
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
          body: JSON.stringify({ error: "Data service error" }) 
        };
      }
    }

    // Validate response structure
    if (!data.values || !Array.isArray(data.values)) {
      log('warn', 'Invalid API response structure', { requestId, hasValues: !!data.values });
      return { 
        statusCode: 200, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ values: [] }) 
      };
    }

    log('info', 'Timeseries request completed successfully', { 
      requestId, 
      dataPoints: data.values.length,
      symbol,
      interval 
    });

    return { 
      statusCode: 200, 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300" // Cache for 5 minutes
      }, 
      body: JSON.stringify(data) 
    };

  } catch (error: any) {
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;

    if (error.name === 'AbortError') {
      errorMessage = "Request timeout - data service took too long to respond";
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
