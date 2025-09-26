import { useState, useEffect } from 'react';
import { Time } from 'lightweight-charts';

// Define a type for the data points for better type safety
export type StockDataPoint = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
};

export function useStockData(symbol: string, interval: string) {
  const [data, setData] = useState<StockDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const url = `/api/timeseries?symbol=${symbol}&interval=${interval}&limit=250`;

      try {
        const response = await fetch(url);

        // This is the critical check that was missing.
        // It ensures we only proceed if the response was successful (status 200-299).
        if (!response.ok) {
          // Try to get the error message from the API response body
          const errorBody = await response.json().catch(() => ({ message: 'Failed to load data.' }));
          throw new Error(errorBody.message || `Error: ${response.status} ${response.statusText}`);
        }
        
        const apiResponse = await response.json();

        if (apiResponse.status === 'error') {
            throw new Error(apiResponse.message || 'The data provider returned an error.');
        }

        if (!apiResponse.values) {
            throw new Error('No time series data available in the response.');
        }

        const formattedData: StockDataPoint[] = apiResponse.values
          .map((d: any) => ({
            time: d.datetime as Time,
            open: parseFloat(d.open),
            high: parseFloat(d.high),
            low: parseFloat(d.low),
            close: parseFloat(d.close),
          }))
          .reverse(); // Data from API is newest-first, so reverse it

        setData(formattedData);
      } catch (err) {
        console.error('Failed to fetch stock data:', err);
        setError(err as Error);
        setData([]); // Clear any old data on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, interval]);

  return { data, loading, error };
}
