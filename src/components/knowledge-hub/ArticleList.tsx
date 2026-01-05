import { Eye, Clock, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Article {
  id: string;
  title: string;
  category: string;
  view_count: number;
  updated_at: string;
}

interface ArticleListProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onCreateArticle?: () => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'HR': 'bg-blue-100 text-blue-700 border-blue-200',
    'IT': 'bg-purple-100 text-purple-700 border-purple-200',
    'Finance': 'bg-green-100 text-green-700 border-green-200',
    'Compliance': 'bg-red-100 text-red-700 border-red-200',
    'Processes': 'bg-orange-100 text-orange-700 border-orange-200',
    'Training': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Richtlinien': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Schulung': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  };
  return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const ArticleList = ({ articles, onSelectArticle, onCreateArticle }: ArticleListProps) => {
  if (articles.length === 0) {
    return (
      <div className="space-y-3">
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">Keine Artikel gefunden</p>
        </div>
        {onCreateArticle && (
          <div className="bg-white rounded-lg border p-4">
            <Button 
              onClick={onCreateArticle}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neuen Artikel erstellen
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <div
          key={article.id}
          onClick={() => onSelectArticle(article)}
          className="bg-white rounded-lg border p-4 cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-200"
        >
          <h3 className="font-semibold text-base mb-2 text-foreground">{article.title}</h3>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline" className={getCategoryColor(article.category)}>
              {article.category}
            </Badge>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.view_count} Views
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Aktualisiert {formatDistanceToNow(new Date(article.updated_at), { addSuffix: false, locale: de })}
            </span>
          </div>
        </div>
      ))}
      
      {onCreateArticle && (
        <div className="bg-white rounded-lg border p-4">
          <Button 
            onClick={onCreateArticle}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuen Artikel erstellen
          </Button>
        </div>
      )}
    </div>
  );
};
