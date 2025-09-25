import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';

interface SymbolConfig {
  symbol: string;
  name: string;
}

interface Quote {
  symbol: string;
  price: number;
  change: number;
  percent_change: number;
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

interface Props {
  title: string;
  symbols: SymbolConfig[];
}

export default function MacroDataWidget({ title, symbols }: Props) {
  const { data, isLoading } = useMacroQuotes(symbols);

  return (
    <div className="bg-neutral-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
      <div className="space-y-3">
        {isLoading && <p className="text-sm">Loading...</p>}
        {data?.map((quote) => (
          <div key={quote.symbol} className="flex justify-between items-center">
            <span className="text-sm font-medium">{symbols.find(s => s.symbol === quote.symbol)?.name}</span>
            <div className="text-right">
              <p className="font-mono text-sm">{quote.price > 0 ? quote.price.toFixed(2) : 'N/A'}</p>
              <p className={`text-xs ${quote.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.percent_change.toFixed(2)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
