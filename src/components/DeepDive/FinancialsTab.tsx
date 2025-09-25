import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';

export default function FinancialsTab({ symbol }: { symbol: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['financials', symbol],
    queryFn: () => apiGet('financials', { symbol }),
  });

  if (isLoading) return <p>Loading financials...</p>;
  if (error) return <p className="text-red-400">Error: {error.message}</p>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Income Statement (in Billions)</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-700">
            <th className="text-left p-2">Year</th>
            <th className="text-right p-2">Revenue</th>
            <th className="text-right p-2">Earnings</th>
            <th className="text-right p-2">EPS</th>
          </tr>
        </thead>
        <tbody>
          {data?.income?.length
            ? data.income.map((item: any) => (
                <tr key={item.year}>
                  <td className="p-2">{item.year}</td>
                  <td className="text-right p-2">${item.revenue.toFixed(2)}B</td>
                  <td className="text-right p-2">${item.earnings.toFixed(2)}B</td>
                  <td className="text-right p-2">${item.eps.toFixed(2)}</td>
                </tr>
              ))
            : (
              <tr>
                <td colSpan={4} className="text-center text-neutral-400">
                  No data available.
                </td>
              </tr>
            )
          }
        </tbody>
      </table>
    </div>
  );
}
