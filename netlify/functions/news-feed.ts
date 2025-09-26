import type { Handler } from "@netlify/functions";

// Enhanced logging utility
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, ...(data && { data }) };
  console.log(JSON.stringify(logEntry));
};

// This is the endpoint for NewsAPI.org
const NEWS_API = "https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=25";

export const handler: Handler = async (event) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  log('info', 'News feed request started', { requestId, method: event.httpMethod });

  // Basic CORS handling
  const origin = event.headers.origin || "";
  const allow = process.env.CORS_ORIGIN || "*";
  
  if (allow !== "*" && origin !== allow) {
    log('warn', 'CORS check failed', { requestId, origin, allowed: allow });
    return { 
      statusCode: 403, 
      body: JSON.stringify({ error: "Forbidden" }) 
    };
  }

  try {
    // Check API key
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      log('error', 'News API key not configured', { requestId });
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "Service configuration error" }) 
      };
    }

    log('info', 'Making NewsAPI request', { requestId });

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const res = await fetch(NEWS_API, {
      headers: { "X-Api-Key": apiKey },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      log('error', 'NewsAPI HTTP error', { requestId, status: res.status, statusText: res.statusText });
      
      if (res.status === 429) {
        return { 
          statusCode: 429, 
          body: JSON.stringify({ error: "News service rate limit exceeded. Please try again later." }) 
        };
      } else if (res.status === 401) {
        return { 
          statusCode: 500, 
          body: JSON.stringify({ error: "News service authentication error" }) 
        };
      } else {
        return { 
          statusCode: 500, 
          body: JSON.stringify({ error: "News service temporarily unavailable" }) 
        };
      }
    }

    const data = await res.json();

    // Check for API-level errors
    if (res.status !== 200 || data.status === 'error') {
      const errorMessage = data.message || 'Failed to fetch news';
      log('error', 'NewsAPI error', { requestId, status: data.status, message: errorMessage });
      
      if (data.code === 'rateLimited') {
        return { 
          statusCode: 429, 
          body: JSON.stringify({ error: "News service rate limit exceeded. Please try again later." }) 
        };
      } else {
        return { 
          statusCode: 500, 
          body: JSON.stringify({ error: "Failed to fetch news data" }) 
        };
      }
    }

    // Normalize and validate the data
    const articles = data.articles || [];
    const items = articles
      .filter((a: any) => a && a.title && a.url) // Filter out invalid articles
      .map((a: any) => ({
        title: a.title || 'Untitled',
        source: a.source?.name || 'Unknown Source',
        url: a.url,
        publishedAt: a.publishedAt || new Date().toISOString(),
      }))
      .slice(0, 25); // Limit to 25 items

    log('info', 'News feed request completed successfully', { 
      requestId, 
      totalArticles: articles.length,
      validItems: items.length 
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin || allow,
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
      body: JSON.stringify({ items }),
    };

  } catch (error: any) {
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;

    if (error.name === 'AbortError') {
      errorMessage = "Request timeout - news service took too long to respond";
      statusCode = 408;
    } else if (error.message) {
      errorMessage = error.message;
    }

    log('error', 'News feed request failed', { 
      requestId, 
      error: errorMessage,
      stack: error.stack 
    });

    return { 
      statusCode, 
      headers: {
        "Access-Control-Allow-Origin": origin || allow,
      },
      body: JSON.stringify({ error: errorMessage }) 
    };
  }
};
