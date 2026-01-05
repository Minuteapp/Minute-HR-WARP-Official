import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FavoritesTabProps {
  onSelectArticle: (article: any) => void;
  onCreateArticle?: () => void;
}

// Keine Mock-Daten - echte Favoriten werden aus der Datenbank geladen

export const FavoritesTab = ({ onSelectArticle, onCreateArticle }: FavoritesTabProps) => {
  const { user } = useAuth();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('knowledge_article_favorites')
        .select(`
          created_at,
          article_id,
          knowledge_articles (
            id,
            title,
            category,
            view_count,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map((d: any) => d.knowledge_articles) || [];
    },
    enabled: !!user?.id,
  });

  // Zeige nur echte Daten aus der Datenbank
  const displayData = favorites;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">Lade Favoriten...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Favoriten-Liste */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {displayData.map((article: any) => (
              <div
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="p-4 hover:bg-blue-50 cursor-pointer transition-colors flex items-start gap-3"
              >
                <Star className="h-5 w-5 text-yellow-500 fill-current flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">{article.category}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leerer Zustand */}
      {displayData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Favoriten vorhanden</p>
            <p className="text-sm text-muted-foreground mt-2">
              Markieren Sie Artikel als Favoriten, um sie hier schnell wiederzufinden
            </p>
          </CardContent>
        </Card>
      )}

      {/* Neuen Artikel erstellen Button */}
      <Card>
        <CardContent className="p-4">
          <Button 
            onClick={onCreateArticle} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neuen Artikel erstellen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
