import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';

export default function OptionsFlowTab({ symbol }: { symbol: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['optionsFlow', symbol],
    queryFn: () => apiGet('options-flow', { symbol }, {
      timeout: 15000,
      maxRetries: 2
    }),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes (options data changes frequently)
  });

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-neutral-400">Loading options flow data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400 mb-4">
          <div className="text-lg font-semibold mb-2">Failed to load options data</div>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Unusual Options Activity</h3>
        <button
          onClick={handleRetry}
          className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div className="bg-neutral-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-700">
              <tr>
                <th className="p-3 text-left text-white">Type</th>
                <th className="p-3 text-left text-white">Side</th>
                <th className="p-3 text-left text-white">Strike</th>
                <th className="p-3 text-left text-white">Expiry</th>
                <th className="p-3 text-right text-white">Size</th>
                <th className="p-3 text-right text-white">Premium</th>
                <th className="p-3 text-center text-white">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {data?.prints?.length ? (
                data.prints.map((p: any, i: number) => (
                  <tr 
                    key={i} 
                    className={`border-b border-neutral-600 ${
                      p.sentiment === 'bullish' ? 'bg-green-900/20' : 'bg-red-900/20'
                    }`}
                  >
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        p.type === 'Sweep' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${
                        p.side === 'CALL' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {p.side}
                      </span>
                    </td>
                    <td className="p-3 text-white font-mono">${p.strike}</td>
                    <td className="p-3 text-neutral-300">{p.expiry}</td>
                    <td className="p-3 text-right text-white font-mono">
                      {p.size?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="p-3 text-right font-mono">
                      <span className="text-amber-400">
                        ${p.premium?.toLocaleString() || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        p.sentiment === 'bullish' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}>
                        {p.sentiment?.toUpperCase() || 'NEUTRAL'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-neutral-400 p-8">
                    <div className="space-y-2">
                      <div>No unusual options activity detected.</div>
                      <div className="text-xs">Check back later for new flow data.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary stats if available */}
      {data?.prints?.length > 0 && (
        <div className="bg-neutral-800 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-amber-400">Flow Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">
                {data.prints.length}
              </div>
              <div className="text-xs text-neutral-400">Total Prints</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">
                {data.prints.filter((p: any) => p.side === 'CALL').length}
              </div>
              <div className="text-xs text-neutral-400">Calls</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">
                {data.prints.filter((p: any) => p.side === 'PUT').length}
              </div>
              <div className="text-xs text-neutral-400">Puts</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-400">
                ${data.prints.reduce((sum: number, p: any) => sum + (p.premium || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-neutral-400">Total Premium</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
