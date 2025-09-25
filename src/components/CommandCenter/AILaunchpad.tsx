import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../api/client';

const templates = [
  { id: 'market-conditions', label: 'Market Conditions', make: (s: string) => `Analyze current market conditions for ${s}. Include trend, key support/resistance levels, and immediate risk factors. Format as markdown.` },
  { id: 'trade-logic', label: 'Trade Logic', make: (s: string) => `Propose a short-term trade idea for ${s}. Include a clear entry price, stop-loss, and two profit targets. Justify the logic briefly. Format as markdown.` },
  // ... add other templates if you wish
];

interface Props {
  initialSymbol: string;
  onAnalyze: (symbol: string) => void; // <-- New prop to trigger the modal
}

export default function AILaunchpad({ initialSymbol, onAnalyze }: Props) {
  const [symbol, setSymbol] = useState(initialSymbol);

  // When the chart symbol changes, update the launchpad's symbol
  useEffect(() => {
    setSymbol(initialSymbol);
  }, [initialSymbol]);

  const mutation = useMutation({
    mutationFn: (prompt: string) => apiPost<{ content: string }>("openai", { prompt }),
    onSuccess: () => {
      onAnalyze(symbol); // <-- Trigger the modal on success
    },
  });

  const runAnalysis = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      const prompt = template.make(symbol);
      mutation.mutate(prompt);
    }
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
    </div>
  );
}
