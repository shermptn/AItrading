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

// Generate realistic mock options flow data
function generateOptionsFlow(symbol: string) {
  const types = ['Sweep', 'Block', 'Split'];
  const sides = ['CALL', 'PUT'];
  const sentiments = ['bullish', 'bearish'];
  const expiryDates = [
    '2025-01-17', '2025-02-21', '2025-03-21', '2025-04-18', 
    '2025-06-20', '2025-09-19', '2025-12-19'
  ];

  const basePrice = 200 + Math.random() * 100; // Simulate a stock price around $200-300
  const prints = [];

  // Generate 3-8 random prints
  const numPrints = 3 + Math.floor(Math.random() * 6);
  
  for (let i = 0; i < numPrints; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const side = sides[Math.floor(Math.random() * sides.length)];
    const sentiment = side === 'CALL' ? 
      (Math.random() > 0.3 ? 'bullish' : 'bearish') : 
      (Math.random() > 0.3 ? 'bearish' : 'bullish');
    
    const strike = Math.round((basePrice + (Math.random() - 0.5) * 60) / 5) * 5; // Strike prices in $5 increments
    const expiry = expiryDates[Math.floor(Math.random() * expiryDates.length)];
    const size = Math.floor(Math.random() * 5000) + 500; // 500-5500 contracts
    const premium = Math.floor(Math.random() * 2000000) + 100000; // $100k - $2.1M premium

    prints.push({
      type,
      side,
      strike,
      expiry,
      size,
      premium,
      sentiment,
    });
  }

  return prints.sort((a, b) => b.premium - a.premium); // Sort by premium descending
}

export const handler: Handler = async (event) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  log('info', 'Options flow request started', { requestId, method: event.httpMethod });

  try {
    const symbol = (new URLSearchParams(event.queryStringParameters as any).get("symbol") || "AAPL").toUpperCase();
    
    // Validate symbol
    if (!isValidSymbol(symbol)) {
      log('warn', 'Invalid symbol format', { requestId, symbol });
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Invalid symbol format. Must be 1-5 uppercase letters." }) 
      };
    }

    log('info', 'Generating mock options flow data', { requestId, symbol });

    // In a real app, you would fetch this from a provider like Polygon.io, Tradier, or FlowAlgo
    const prints = generateOptionsFlow(symbol);
    
    const mockData = {
      symbol,
      generated: new Date().toISOString(),
      prints,
      summary: {
        totalPrints: prints.length,
        totalPremium: prints.reduce((sum, p) => sum + p.premium, 0),
        callsCount: prints.filter(p => p.side === 'CALL').length,
        putsCount: prints.filter(p => p.side === 'PUT').length,
        bullishCount: prints.filter(p => p.sentiment === 'bullish').length,
        bearishCount: prints.filter(p => p.sentiment === 'bearish').length,
      }
    };

    log('info', 'Options flow request completed successfully', { 
      requestId, 
      symbol,
      printsCount: prints.length,
      totalPremium: mockData.summary.totalPremium 
    });

    return { 
      statusCode: 200, 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300" // Cache for 5 minutes (options flow data is more dynamic)
      }, 
      body: JSON.stringify(mockData) 
    };

  } catch (error: any) {
    log('error', 'Options flow request failed', { 
      requestId, 
      error: error.message,
      stack: error.stack 
    });

    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Could not load options flow data" }) 
    };
  }
};
