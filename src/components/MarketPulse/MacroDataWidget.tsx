import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';

interface SymbolConfig {
  symbol: string;
  name?: string;
}

interface Quote {
  symbol: string;
  price: number;
  change: number;
  percent_change: number;
}

interface MacroDataWidgetProps {
  title: string;
  symbols: SymbolConfig[];
}

function useMacroQuotes(symbols: SymbolConfig[]) {
  return useQuery<Quote[]>({
    queryKey: ['macroQuotes', symbols.map(s => s.symbol).join(',')],
    queryFn: async () => {
      const promises = symbols.map(s =>
        apiGet<any>('quote', { symbol: s.symbol }).then(data => ({
          symbol: data.symbol,
          price: parseFloat(data.price || data.close || '0'),
          change: parseFloat(data.change || '0'),
          percent_change: parseFloat(data.percent_change || '0'),
        })).catch(() => ({ symbol: s.symbol, price: 0, change: 0, percent_change: 0 }))
      );
      return Promise.all(promises);
    },
    refetchInterval: 60000, // Refetch every 60 seconds instead of 30
  });
}

export default function MacroDataWidget({ title, symbols }: MacroDataWidgetProps) {
  const { data, isLoading, error } = useMacroQuotes(symbols);

  return (
    <div className="bg-neutral-900 rounded-lg p-4 h-full">
      <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
      <div className="space-y-2">
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-400">Error loading data.</p>}
        {!isLoading && !error && data?.map((quote, idx) => (
          <div key={quote.symbol} className="flex justify-between items-center p-2 rounded-md bg-neutral-800">
            <div>
              <p className="font-bold">{symbols[idx]?.name || quote.symbol}</p>
              <p className="text-xs text-neutral-500">{quote.symbol}</p>
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
    </div>
  );
}
