import { useQuery } from '@tanstack/react-query';
import { apiPost } from '../../api/client';

export default function AISnapshotTab({ symbol }: { symbol: string }) {
  const prompt = `Provide a comprehensive but concise institutional-grade analysis for ${symbol}. Include: 
1.  **Executive Summary:** A 3-sentence overview.
2.  **Bull Case:** 3 bullet points.
3.  **Bear Case:** 3 bullet points.
4.  **Key Levels:** Critical support and resistance.
Format the entire response using markdown.`;

  const { data, isLoading, error } = useQuery({
    queryKey: ['aiSnapshot', symbol],
    queryFn: () => apiPost<{ content: string }>('openai', { prompt }),
    staleTime: Infinity, // Don't refetch automatically
  });

  if (isLoading) return <p>Generating AI snapshot...</p>;
  if (error) return <p className="text-red-400">Error: {error.message}</p>;

  return <div className="prose prose-invert prose-sm whitespace-pre-wrap font-mono">{data?.content}</div>;
}
