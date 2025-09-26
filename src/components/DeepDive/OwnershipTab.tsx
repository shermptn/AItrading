import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';

export default function OwnershipTab({ symbol }: { symbol: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ownership', symbol],
    queryFn: () => apiGet('ownership', { symbol }, {
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
          <p className="text-neutral-400">Loading ownership data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400 mb-4">
          <div className="text-lg font-semibold mb-2">Failed to load ownership data</div>
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
        <h3 className="text-lg font-semibold text-white">Ownership & Analysis</h3>
        <button
          onClick={handleRetry}
          className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Institutional Holders */}
        <div className="bg-neutral-800 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-amber-400">Top Institutional Holders</h4>
          <div className="space-y-2">
            {data?.institutions?.length ? (
              data.institutions.map((item: any) => (
                <div key={item.holder} className="flex justify-between items-center p-2 rounded bg-neutral-700/50">
                  <span className="text-sm text-white font-medium truncate mr-2">{item.holder}</span>
                  <div className="text-right">
                    <div className="font-mono text-sm text-green-400">{item.pct.toFixed(2)}%</div>
                    <div className="text-xs text-neutral-400">{item.shares?.toLocaleString() || 'N/A'} shares</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-neutral-400 text-center py-4">No institutional data available.</div>
            )}
          </div>
        </div>

        {/* Insider Transactions */}
        <div className="bg-neutral-800 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-amber-400">Recent Insider Transactions</h4>
          <div className="space-y-2">
            {data?.insiders?.length ? (
              data.insiders.map((item: any, index: number) => (
                <div key={`${item.name}-${index}`} className="p-2 rounded bg-neutral-700/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-2">
                      <div className="text-sm text-white font-medium">{item.name}</div>
                      <div className="text-xs text-neutral-400">{item.date || 'Recent'}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${item.type === 'Sell' ? 'text-red-400' : 'text-green-400'}`}>
                        {item.type}
                      </div>
                      <div className="text-xs text-white font-mono">
                        {item.shares?.toLocaleString() || 'N/A'} shares
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-neutral-400 text-center py-4">No insider transaction data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Analyst Ratings */}
      {data?.analysts && (
        <div className="bg-neutral-800 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-amber-400">Analyst Consensus</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{data.analysts.consensus || 'N/A'}</div>
              <div className="text-sm text-neutral-400">Overall Rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                ${data.analysts.priceTarget?.toFixed(2) || 'N/A'}
              </div>
              <div className="text-sm text-neutral-400">Price Target</div>
            </div>
            <div className="text-center">
              <div className="text-sm space-y-1">
                <div className="text-green-400">Buy: {data.analysts.ratings?.buy || 0}</div>
                <div className="text-yellow-400">Hold: {data.analysts.ratings?.hold || 0}</div>
                <div className="text-red-400">Sell: {data.analysts.ratings?.sell || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
