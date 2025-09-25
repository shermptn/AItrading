import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';
import TickerSkeleton from '../common/TickerSkeleton'; // <-- Import

// ... (Keep the SYMBOLS constant and the Quote interface)

// ... (Keep the useWatchlistQuotes custom hook)

export default function Watchlist({ onSymbolSelect }: { onSymbolSelect: (symbol: string) => void }) {
  const { data, isLoading } = useWatchlistQuotes();

  return (
    <div className="bg-neutral-900 rounded-lg p-4 h-full">
      <h2 className="text-lg font-semibold mb-3 text-white">Watchlist</h2>
      <div className="overflow-y-auto h-[480px]">
        {isLoading ? (
          <TickerSkeleton /> // <-- Use skeleton when loading
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
                  <p className="text-xs text-neutral-500">{(quote.name || '').split(' ')[0]}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono">{quote.price > 0 ? `$${quote.price.toFixed(2)}` : 'Error'}</p>
                  <p className={`text-xs ${quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
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
