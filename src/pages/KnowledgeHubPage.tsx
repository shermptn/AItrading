import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api/client';
import ArticleDetailView from '../components/KnowledgeHub/ArticleDetailView';

interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  category: string;
}

export default function KnowledgeHubPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<{ articles: ArticleMeta[] }>({
    queryKey: ['articleList'],
    queryFn: () => apiGet('content'),
  });

  if (selectedSlug) {
    return <ArticleDetailView slug={selectedSlug} onBack={() => setSelectedSlug(null)} />;
  }

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Knowledge Hub</h1>
        <p className="text-neutral-400">Daily market briefs and trading concepts to sharpen your edge.</p>
      </header>
      
      {isLoading && <p>Loading articles...</p>}
      {error && <p className="text-red-400">Error: {error.message}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.articles.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(article => (
          <div 
            key={article.slug} 
            className="bg-neutral-900 p-6 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors"
            onClick={() => setSelectedSlug(article.slug)}
          >
            <p className="text-sm text-amber-400 font-semibold">{article.category}</p>
            <h3 className="text-lg font-bold mt-2 text-white">{article.title}</h3>
            <p className="text-xs text-neutral-500 mt-2">{new Date(article.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
