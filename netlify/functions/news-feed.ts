import type { Handler } from "@netlify/functions";

// This is the endpoint for NewsAPI.org
const NEWS_API = "https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=25";

export const handler: Handler = async (event) => {
  // Basic CORS handling
  const origin = event.headers.origin || "";
  const allow = process.env.CORS_ORIGIN || "*";
  if (allow !== "*" && origin !== allow) {
    return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
  }

  try {
    const res = await fetch(NEWS_API, {
      headers: { "X-Api-Key": process.env.NEWS_API_KEY as string },
    });
    const data = await res.json();

    if (res.status !== 200) {
      throw new Error(data.message || 'Failed to fetch news');
    }

    // Normalize the data to a consistent format
    const items = (data.articles || []).map((a: any) => ({
      title: a.title,
      source: a.source?.name,
      url: a.url,
      publishedAt: a.publishedAt,
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin || allow,
      },
      body: JSON.stringify({ items }),
    };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
