import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';

export default function OwnershipTab({ symbol }: { symbol: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ownership', symbol],
    queryFn: () => apiGet('ownership', { symbol }),
  });

  if (isLoading) return <p>Loading ownership data...</p>;
  if (error) return <p className="text-red-400">Error: {error.message}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Top Institutional Holders</h3>
        <ul className="space-y-2">{data?.institutions.map((item: any) => (<li key={item.holder} className="flex justify-between text-sm"><span>{item.holder}</span><span className="font-mono">{item.pct.toFixed(2)}%</span></li>))}</ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Recent Insider Transactions</h3>
        <ul className="space-y-2">{data?.insiders.map((item: any) => (<li key={item.name} className="flex justify-between text-sm"><span className={item.type === 'Sell' ? 'text-red-400' : 'text-green-400'}>{item.type}</span><span>{item.name}</span><span className="font-mono">{item.shares.toLocaleString()} Shares</span></li>))}</ul>
      </div>
    </div>
  );
}
