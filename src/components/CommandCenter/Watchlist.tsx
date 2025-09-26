import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';
import TickerSkeleton from '../common/TickerSkeleton';

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META'];

interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent_change: number;
  error?: string;
}

function useWatchlistQuotes() {
  return useQuery<Quote[]>({
    queryKey: ['watchlistQuotes'],
    queryFn: async () => {
      const promises = SYMBOLS.map(async symbol => {
        try {
          const data = await apiGet<any>('quote', { symbol }, { 
            timeout: 10000,
            maxRetries: 1 
          });
          return {
            symbol: data.symbol || symbol,
            name: data.name || symbol,
            price: parseFloat(data.price || data.close || '0'),
            change: parseFloat(data.change || '0'),
            percent_change: parseFloat(data.percent_change || '0'),
          };
        } catch (e) {
          console.warn(`Failed to fetch quote for ${symbol}:`, e);
          return { 
            symbol, 
            name: 'Data unavailable', 
            price: 0, 
            change: 0, 
            percent_change: 0,
            error: e instanceof Error ? e.message : 'Unknown error'
          };
        }
      });
      return Promise.all(promises);
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2,
  });
}

export default function Watchlist({ onSymbolSelect }: { onSymbolSelect: (symbol: string) => void }) {
  const { data, isLoading, error, refetch, isRefetching } = useWatchlistQuotes();

  const handleRetry = () => {
    refetch();
  };

  const successfulQuotes = data?.filter(quote => !quote.error) || [];
  const failedQuotes = data?.filter(quote => quote.error) || [];

  return (
    <div className="bg-neutral-900 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">Watchlist</h2>
        {isRefetching && (
          <div className="w-4 h-4 border border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {isLoading ? (
          <div className="space-y-2">
            <TickerSkeleton />
            <div className="text-center text-xs text-neutral-500 mt-4">
              Loading market data...
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <div className="text-red-400 mb-3">
              <div className="font-semibold mb-1">Failed to load watchlist</div>
              <div className="text-sm">{error.message}</div>
            </div>
            <button
              onClick={handleRetry}
              className="bg-red-700 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Successful quotes */}
            {successfulQuotes.map((quote) => (
              <div
                key={quote.symbol}
                onClick={() => onSymbolSelect(quote.symbol)}
                className="flex justify-between items-center p-3 rounded-md cursor-pointer hover:bg-neutral-800 transition-colors border border-neutral-700/30"
              >
                <div>
                  <p className="font-bold text-white">{quote.symbol}</p>
                  <p className="text-xs text-neutral-500 truncate max-w-20">
                    {quote.name === quote.symbol ? 'N/A' : quote.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-white">
                    {quote.price > 0 ? `$${quote.price.toFixed(2)}` : 'N/A'}
                  </p>
                  <p className={`text-xs ${quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {quote.price > 0 ? (
                      <>
                        {quote.change >= 0 ? '+' : ''}
                        {quote.change.toFixed(2)} ({quote.percent_change.toFixed(2)}%)
                      </>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
              </div>
            ))}

            {/* Failed quotes */}
            {failedQuotes.map((quote) => (
              <div
                key={quote.symbol}
                className="flex justify-between items-center p-3 rounded-md border border-red-700/30 bg-red-900/10"
              >
                <div>
                  <p className="font-bold text-white">{quote.symbol}</p>
                  <p className="text-xs text-red-400">Data unavailable</p>
                </div>
                <div className="text-right text-neutral-500">
                  <p className="font-mono text-sm">Error</p>
                </div>
              </div>
            ))}

            {/* Refresh controls */}
            <div className="pt-3 border-t border-neutral-700 mt-4">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>
                  {successfulQuotes.length} of {SYMBOLS.length} loaded
                </span>
                <button
                  onClick={handleRetry}
                  disabled={isRefetching}
                  className="hover:text-neutral-400 transition-colors disabled:opacity-50"
                >
                  {isRefetching ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              {failedQuotes.length > 0 && (
                <div className="text-xs text-amber-400 mt-1">
                  {failedQuotes.length} symbols failed to load
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
