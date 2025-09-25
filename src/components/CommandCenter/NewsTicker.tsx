import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../api/client';

interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

export default function NewsTicker() {
  const { data, isLoading, error } = useQuery<{ items: NewsItem[] }>({
    queryKey: ['news'],
    queryFn: () => apiGet('news-feed'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="bg-neutral-900 rounded-lg p-4 h-full">
      <h2 className="text-lg font-semibold mb-3 text-white">Live Headlines</h2>
      <div className="space-y-3 overflow-y-auto h-[480px]">
        {isLoading && <p>Loading news...</p>}
        {error && <p className="text-red-400">Error: {error.message}</p>}
        {data?.items.map((item, index) => (
          <a href={item.url} key={index} target="_blank" rel="noopener noreferrer" className="block p-2 rounded-md hover:bg-neutral-800">
            <p className="font-medium text-sm leading-tight">{item.title}</p>
            <p className="text-xs text-neutral-500 mt-1">{item.source} - {new Date(item.publishedAt).toLocaleTimeString()}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
