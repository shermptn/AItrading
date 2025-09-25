import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../../api/client';

const templates = [
  { id: 'market-conditions', label: 'Market Conditions', make: (s: string) => `Analyze current market conditions for ${s}. Include trend, key support/resistance levels, and immediate risk factors. Format as markdown.` },
  { id: 'trade-logic', label: 'Trade Logic', make: (s: string) => `Propose a short-term trade idea for ${s}. Include a clear entry price, stop-loss, and two profit targets. Justify the logic briefly. Format as markdown.` },
  { id: 'technical-summary', label: 'Technical Summary', make: (s: string) => `Provide a concise technical summary for ${s} on the 1-hour, 4-hour, and Daily timeframes. Mention key MAs and momentum indicators like RSI.` },
  { id: 'news-impact', label: 'News Impact', make: (s: string) => `Summarize recent news that could impact ${s}. Rate the potential impact as low, medium, or high for each news item.` },
];

export default function AILaunchpad({ initialSymbol }: { initialSymbol: string }) {
  const [symbol, setSymbol] = useState(initialSymbol);

  const mutation = useMutation({
    mutationFn: (prompt: string) => apiPost<{ content: string }>("openai", { prompt }),
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
            {t.label}
          </button>
        ))}
      </div>
      
      {mutation.isPending && <p className="mt-4">Generating AI insight...</p>}
      {mutation.isError && <p className="mt-4 text-red-400">Error: {mutation.error.message}</p>}
      {mutation.isSuccess && (
        <div className="mt-4 rounded-lg bg-black/50 p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed border border-neutral-800">
          {mutation.data.content}
        </div>
      )}
    </div>
  );
}
