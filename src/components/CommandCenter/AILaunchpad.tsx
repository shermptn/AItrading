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

  useEffect(() => {
    setSymbol(initialSymbol);
  }, [initialSymbol]);

  const mutation = useMutation({
    mutationFn: (variables: { promptId: string; symbol: string }) =>
      apiPost<{ content: string }>("openai", variables),
    onSuccess: () => {
      onAnalyze(symbol);
    },
  });

  const runAnalysis = (promptId: string) => {
    mutation.mutate({ promptId, symbol });
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3 text-white">AI Insights Launchpad</h2>
      <div className="flex gap-2 mb-3">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="flex-1 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Enter Symbol (e.g. AAPL)"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => runAnalysis(t.id)}
            className="rounded-lg bg-neutral-800 px-3 py-3 text-sm text-center hover:bg-neutral-700 transition-colors disabled:opacity-50"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Analyzing...' : t.label}
          </button>
        ))}
      </div>
      {/* Show error if OpenAI call fails */}
      {mutation.error && (
        <div className="text-red-400 mt-2 text-sm">
          Error: {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong'}
        </div>
      )}
    </div>
  );
}
