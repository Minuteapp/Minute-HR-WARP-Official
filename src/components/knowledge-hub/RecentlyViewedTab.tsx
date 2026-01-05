import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RecentlyViewedTabProps {
  onSelectArticle: (article: any) => void;
  onCreateArticle?: () => void;
}


export const RecentlyViewedTab = ({ onSelectArticle, onCreateArticle }: RecentlyViewedTabProps) => {
  const { user } = useAuth();

  const { data: recentlyViewed = [], isLoading } = useQuery({
    queryKey: ['recently-viewed', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('knowledge_article_views')
        .select(`
          viewed_at,
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
        .order('viewed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data?.map((d: any) => ({
        ...d.knowledge_articles,
        viewed_at: d.viewed_at,
      })) || [];
    },
    enabled: !!user?.id,
  });

  // Nur echte Daten aus der Datenbank
  const displayData = recentlyViewed;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">Lade zuletzt angesehene Artikel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Artikel-Liste */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {displayData.map((article: any) => (
              <div
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="p-4 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <h3 className="font-semibold mb-1">{article.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Zuletzt angesehen {article.viewed_at || 'vor kurzem'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leerer Zustand */}
      {displayData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Artikel angesehen</p>
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
