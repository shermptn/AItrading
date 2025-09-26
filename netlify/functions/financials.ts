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
  log('info', 'Financials request started', { requestId, method: event.httpMethod });

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

    log('info', 'Generating mock financial data', { requestId, symbol });

    // In a real app, you would fetch this from Twelve Data, IEX Cloud, or Finnhub.
    // For now, we'll generate realistic mock data based on the symbol
    const currentYear = new Date().getFullYear();
    const mockData = {
      symbol,
      generated: new Date().toISOString(),
      income: [
        { 
          year: currentYear, 
          revenue: 385.71 + Math.random() * 50, 
          earnings: 99.8 + Math.random() * 20, 
          eps: 6.15 + Math.random() * 2 
        },
        { 
          year: currentYear - 1, 
          revenue: 383.29 + Math.random() * 40, 
          earnings: 97.0 + Math.random() * 15, 
          eps: 5.95 + Math.random() * 1.5 
        },
        { 
          year: currentYear - 2, 
          revenue: 365.82 + Math.random() * 30, 
          earnings: 94.68 + Math.random() * 10, 
          eps: 5.61 + Math.random() * 1 
        },
      ],
      balance: [
        { 
          year: currentYear, 
          assets: 355.2 + Math.random() * 30, 
          liabilities: 295.1 + Math.random() * 20 
        },
        { 
          year: currentYear - 1, 
          assets: 352.6 + Math.random() * 25, 
          liabilities: 300.4 + Math.random() * 18 
        },
        { 
          year: currentYear - 2, 
          assets: 338.5 + Math.random() * 20, 
          liabilities: 287.9 + Math.random() * 15 
        },
      ],
      cashflow: [
        { 
          year: currentYear, 
          cfo: 112.5 + Math.random() * 10, 
          cfi: -5.2 + Math.random() * 4, 
          cff: -108.3 + Math.random() * 15 
        },
        { 
          year: currentYear - 1, 
          cfo: 110.5 + Math.random() * 8, 
          cfi: -3.8 + Math.random() * 3, 
          cff: -105.3 + Math.random() * 12 
        },
        { 
          year: currentYear - 2, 
          cfo: 104.0 + Math.random() * 6, 
          cfi: -7.8 + Math.random() * 2, 
          cff: -90.2 + Math.random() * 10 
        },
      ],
    };

    log('info', 'Financials request completed successfully', { 
      requestId, 
      symbol,
      periods: mockData.income.length 
    });

    return { 
      statusCode: 200, 
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600" // Cache for 1 hour (financial data doesn't change frequently)
      }, 
      body: JSON.stringify(mockData) 
    };

  } catch (error: any) {
    log('error', 'Financials request failed', { 
      requestId, 
      error: error.message,
      stack: error.stack 
    });

    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Could not load financial data" }) 
    };
  }
};
