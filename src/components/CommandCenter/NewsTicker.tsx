import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';
import TickerSkeleton from '../common/TickerSkeleton';

interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

export default function NewsTicker() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery<{ items: NewsItem[] }>({
    queryKey: ['news'],
    queryFn: () => apiGet('news-feed', undefined, { 
      timeout: 15000,
      maxRetries: 2 
    }),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchInterval: 1000 * 60 * 10, // Auto-refresh every 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on API key issues or rate limits
      if (error.message.includes('API key') || error.message.includes('429')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const handleRetry = () => {
    refetch();
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">Live Headlines</h2>
        {isRefetching && (
          <div className="w-4 h-4 border border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
      
      <div className="overflow-y-auto h-[480px]">
        {isLoading ? (
          <div className="space-y-3">
            <TickerSkeleton />
            <div className="text-center text-xs text-neutral-500 mt-4">
              Loading latest financial news...
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-6">
            <div className="text-red-400 mb-4">
              <div className="text-lg font-semibold mb-2">Failed to load news</div>
              <div className="text-sm">{error.message}</div>
            </div>
            <button
              onClick={handleRetry}
              className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors text-sm"
            >
              Retry Loading News
            </button>
          </div>
        ) : !data?.items || data.items.length === 0 ? (
          <div className="text-center p-6">
            <div className="text-neutral-400 mb-4">
              <div className="text-lg mb-2">No news available</div>
              <div className="text-sm">Unable to fetch financial news at this time</div>
            </div>
            <button
              onClick={handleRetry}
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded transition-colors text-sm"
            >
              Refresh News
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map((item, index) => (
              <a 
                href={item.url} 
                key={`${item.url}-${index}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-3 rounded-md hover:bg-neutral-800 transition-colors border border-neutral-700/50"
              >
                <p className="font-medium text-sm leading-tight text-white mb-1 line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-medium">{item.source}</span>
                  <span>{formatTimeAgo(item.publishedAt)}</span>
                </div>
              </a>
            ))}
            
            {/* Refresh indicator */}
            <div className="text-center pt-4 border-t border-neutral-700">
              <button
                onClick={handleRetry}
                disabled={isRefetching}
                className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors disabled:opacity-50"
              >
                {isRefetching ? 'Refreshing...' : 'Refresh News'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
