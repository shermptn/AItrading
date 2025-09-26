import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';

export default function FinancialsTab({ symbol }: { symbol: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['financials', symbol],
    queryFn: () => apiGet('financials', { symbol }, {
      timeout: 15000,
      maxRetries: 2
    }),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-neutral-400">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400 mb-4">
          <div className="text-lg font-semibold mb-2">Failed to load financials</div>
          <div className="text-sm">{error.message}</div>
        </div>
        <button
          onClick={handleRetry}
          className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Financial Statements</h3>
        <button
          onClick={handleRetry}
          className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Income Statement */}
      <div className="bg-neutral-800 rounded-lg p-4">
        <h4 className="font-semibold mb-3 text-amber-400">Income Statement (in Billions)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-700">
                <th className="text-left p-2 text-white">Year</th>
                <th className="text-right p-2 text-white">Revenue</th>
                <th className="text-right p-2 text-white">Earnings</th>
                <th className="text-right p-2 text-white">EPS</th>
              </tr>
            </thead>
            <tbody>
              {data?.income?.length ? (
                data.income.map((item: any) => (
                  <tr key={item.year} className="border-b border-neutral-700/50">
                    <td className="p-2 text-white">{item.year}</td>
                    <td className="text-right p-2 text-green-400">${item.revenue.toFixed(2)}B</td>
                    <td className="text-right p-2 text-blue-400">${item.earnings.toFixed(2)}B</td>
                    <td className="text-right p-2 text-white">${item.eps.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-neutral-400 p-4">
                    No income statement data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Sheet */}
      {data?.balance?.length > 0 && (
        <div className="bg-neutral-800 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-amber-400">Balance Sheet (in Billions)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left p-2 text-white">Year</th>
                  <th className="text-right p-2 text-white">Assets</th>
                  <th className="text-right p-2 text-white">Liabilities</th>
                </tr>
              </thead>
              <tbody>
                {data.balance.map((item: any) => (
                  <tr key={item.year} className="border-b border-neutral-700/50">
                    <td className="p-2 text-white">{item.year}</td>
                    <td className="text-right p-2 text-green-400">${item.assets.toFixed(2)}B</td>
                    <td className="text-right p-2 text-red-400">${item.liabilities.toFixed(2)}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash Flow */}
      {data?.cashflow?.length > 0 && (
        <div className="bg-neutral-800 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-amber-400">Cash Flow (in Billions)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left p-2 text-white">Year</th>
                  <th className="text-right p-2 text-white">Operating</th>
                  <th className="text-right p-2 text-white">Investing</th>
                  <th className="text-right p-2 text-white">Financing</th>
                </tr>
              </thead>
              <tbody>
                {data.cashflow.map((item: any) => (
                  <tr key={item.year} className="border-b border-neutral-700/50">
                    <td className="p-2 text-white">{item.year}</td>
                    <td className={`text-right p-2 ${item.cfo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${item.cfo.toFixed(2)}B
                    </td>
                    <td className={`text-right p-2 ${item.cfi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${item.cfi.toFixed(2)}B
                    </td>
                    <td className={`text-right p-2 ${item.cff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${item.cff.toFixed(2)}B
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
