import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';

export default function OptionsFlowTab({ symbol }: { symbol: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['optionsFlow', symbol],
    queryFn: () => apiGet('options-flow', { symbol }),
  });

  if (isLoading) return <p>Loading options flow...</p>;
  if (error) return <p className="text-red-400">Error: {error.message}</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Unusual Options Activity</h3>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-neutral-700"><th className="p-2 text-left">Side</th><th className="p-2 text-left">Strike</th><th className="p-2 text-left">Expiry</th><th className="p-2 text-right">Premium</th></tr></thead>
        <tbody>
          {data?.prints.map((p: any, i: number) => (
            <tr key={i} className={p.sentiment === 'bullish' ? 'text-green-300' : 'text-red-300'}>
              <td className="p-2 font-bold">{p.side}</td><td className="p-2">${p.strike}</td><td className="p-2">{p.expiry}</td><td className="p-2 text-right font-mono">${p.premium.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
