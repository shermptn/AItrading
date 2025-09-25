import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { apiGet } from '../../api/client';

interface Article {
  title: string;
  date: string;
  author: string;
  category: string;
  content: string;
}

interface Props {
  slug: string;
  onBack: () => void;
}

export default function ArticleDetailView({ slug, onBack }: Props) {
  const { data, isLoading, error } = useQuery<Article>({
    queryKey: ['article', slug],
    queryFn: () => apiGet('content', { slug }),
  });

  return (
    <div>
      <button onClick={onBack} className="mb-6 text-sm text-amber-400 hover:underline">
        &larr; Back to all articles
      </button>

      {isLoading && <p>Loading article...</p>}
      {error && <p className="text-red-400">Error: {error.message}</p>}
      
      {data && (
        <article className="bg-neutral-900 p-8 rounded-lg">
          <p className="font-semibold text-amber-400">{data.category}</p>
          <h1 className="text-4xl font-bold mt-2 text-white">{data.title}</h1>
          <p className="text-sm text-neutral-500 mt-4">
            By {data.author} on {new Date(data.date).toLocaleDateString()}
          </p>
          <div className="mt-8 prose prose-invert max-w-none prose-h3:text-amber-400">
            <ReactMarkdown>{data.content}</ReactMarkdown>
          </div>
        </article>
      )}
    </div>
  );
}
