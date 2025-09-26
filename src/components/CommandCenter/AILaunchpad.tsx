import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../api/client';

const templates = [
  { id: 'market-conditions', label: 'Market Conditions' },
  { id: 'position-logic', label: 'Trade Logic' },
  { id: 'news-impact', label: 'News Impact' },
  { id: 'technical-summary', label: 'Technical Summary' },
  { id: 'sentiment-analysis', label: 'Sentiment Analysis' },
  { id: 'correlation-analysis', label: 'Correlation Matrix' },
  { id: 'volatility-forecast', label: 'Volatility Forecast' },
  { id: 'earnings-prep', label: 'Earnings Prep' },
];

interface Props {
  initialSymbol: string;
  onAnalyze: (symbol: string) => void;
}

export default function AILaunchpad({ initialSymbol, onAnalyze }: Props) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setSymbol(initialSymbol);
  }, [initialSymbol]);

  const mutation = useMutation({
    mutationFn: (variables: { promptId: string; symbol: string }) =>
      apiPost<{ content: string }>("openai", variables, { 
        maxRetries: 2,
        timeout: 45000 // Longer timeout for AI requests
      }),
    onSuccess: () => {
      onAnalyze(symbol);
      setRetryCount(0);
    },
    onError: (error) => {
      console.error('AI analysis failed:', error);
      setRetryCount(prev => prev + 1);
    },
  });

  const runAnalysis = (promptId: string) => {
    if (!symbol.trim()) {
      return;
    }
    setRetryCount(0);
    mutation.mutate({ promptId, symbol: symbol.trim().toUpperCase() });
  };

  const handleRetry = () => {
    if (mutation.variables) {
      mutation.mutate(mutation.variables);
    }
  };

  const isValidSymbol = symbol.trim().length > 0 && /^[A-Z]{1,5}$/.test(symbol.trim().toUpperCase());

  return (
    <div className="bg-neutral-900 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3 text-white">AI Insights Launchpad</h2>
      
      <div className="flex gap-2 mb-3">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="flex-1 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Enter Symbol (e.g. AAPL)"
          maxLength={5}
        />
        {!isValidSymbol && symbol.trim().length > 0 && (
          <div className="text-amber-400 text-xs mt-1">
            Enter a valid stock symbol (1-5 letters)
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => runAnalysis(t.id)}
            className="rounded-lg bg-neutral-800 px-3 py-3 text-sm text-center hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={mutation.isPending || !isValidSymbol}
            title={!isValidSymbol ? 'Enter a valid symbol first' : ''}
          >
            {mutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </div>
            ) : (
              t.label
            )}
          </button>
        ))}
      </div>

      {/* Enhanced error display with retry option */}
      {mutation.error && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
          <div className="text-red-400 text-sm mb-2">
            <strong>Analysis Failed:</strong> {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong'}
          </div>
          {retryCount < 3 && (
            <button
              onClick={handleRetry}
              className="text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
              disabled={mutation.isPending}
            >
              Retry Analysis
            </button>
          )}
          {retryCount >= 3 && (
            <div className="text-xs text-red-300 mt-1">
              Multiple attempts failed. Please try again later or contact support.
            </div>
          )}
        </div>
      )}

      {/* Success feedback */}
      {mutation.isSuccess && !mutation.error && (
        <div className="mt-3 p-2 bg-green-900/20 border border-green-700/30 rounded-lg text-green-400 text-sm">
          ✓ Analysis completed successfully
        </div>
      )}
    </div>
  );
}
