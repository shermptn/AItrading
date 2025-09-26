import { useQuery } from '@tanstack/react-query';
import { apiPost } from '../../api/client';

export default function AISnapshotTab({ symbol }: { symbol: string }) {
  // Use the default promptId that matches one of your backend FIN_PROMPTS keys.
  const promptId = 'market-conditions';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['aiSnapshot', symbol],
    queryFn: () => apiPost<{ content: string }>('openai', { promptId, symbol }, {
      timeout: 45000, // Longer timeout for AI requests
      maxRetries: 1
    }),
    staleTime: Infinity, // Don't refetch automatically
    retry: (failureCount, error) => {
      // Don't retry on client errors or rate limits
      if (error.message.includes('400') || error.message.includes('429') || error.message.includes('API key')) {
        return false;
      }
      return failureCount < 1;
    },
  });

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-neutral-400">Generating AI market analysis...</p>
          <p className="text-xs text-neutral-500 mt-1">This may take up to 30 seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400 mb-4">
          <div className="text-lg font-semibold mb-2">Analysis Failed</div>
          <div className="text-sm">{error.message}</div>
        </div>
        <button
          onClick={handleRetry}
          className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!data?.content) {
    return (
      <div className="p-6 text-center text-neutral-400">
        <div className="text-lg mb-2">No analysis available</div>
        <button
          onClick={handleRetry}
          className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded transition-colors text-sm"
        >
          Generate Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">AI Market Analysis</h3>
        <button
          onClick={handleRetry}
          className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors"
        >
          Regenerate
        </button>
      </div>
      <div className="prose prose-invert prose-sm max-w-none">
        <div className="whitespace-pre-wrap font-mono text-sm bg-neutral-800 p-4 rounded-lg border border-neutral-700">
          {data.content}
        </div>
      </div>
    </div>
  );
}
