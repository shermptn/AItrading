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
}

// THIS IS THE MISSING FUNCTION
function useWatchlistQuotes() {
  return useQuery<Quote[]>({
    queryKey: ['watchlistQuotes'],
    queryFn: async () => {
      const promises = SYMBOLS.map(symbol =>
        apiGet<any>('quote', { symbol }).then(data => ({
          symbol: data.symbol,
          name: data.name,
          price: parseFloat(data.price || data.close || '0'),
          change: parseFloat(data.change || '0'),
          percent_change: parseFloat(data.percent_change || '0'),
        })).catch(e => ({ symbol, name: e.message, price: 0, change: 0, percent_change: 0 }))
      );
      return Promise.all(promises);
    },
    refetchInterval: 15000,
  });
}

export default function Watchlist({ onSymbolSelect }: { onSymbolSelect: (symbol: string) => void }) {
  const { data, isLoading } = useWatchlistQuotes();

  return (
    <div className="bg-neutral-900 rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-3 text-white">Watchlist</h2>
      <div className="overflow-y-auto flex-grow">
        {isLoading ? (
          <TickerSkeleton />
        ) : (
          <div className="space-y-2">
            {data?.map((quote) => (
              <div
                key={quote.symbol}
                onClick={() => onSymbolSelect(quote.symbol)}
                className="flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-neutral-800"
              >
                <div>
                  <p className="font-bold">{quote.symbol}</p>
                  <p className="text-xs text-neutral-500">{(quote.name || 'N/A').split(' ')[0]}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono">{quote.price > 0 ? `$${quote.price.toFixed(2)}` : 'Error'}</p>
                  <p className={`text-xs ${quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {quote.change.toFixed(2)} ({quote.percent_change.toFixed(2)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
