import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Star, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface FavoriteDocument {
  id: string;
  title: string;
  category: string;
}

export const FavoriteDocuments = () => {
  const navigate = useNavigate();

  const { data: favoriteDocuments = [], isLoading } = useQuery({
    queryKey: ['favorite-documents'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get favorites from document_favorites table
      const { data: favorites, error: favError } = await supabase
        .from('document_favorites')
        .select('document_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (favError) throw favError;
      if (!favorites || favorites.length === 0) return [];

      const docIds = favorites.map(f => f.document_id);

      // Fetch document details
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('id, title, category')
        .in('id', docIds)
        .is('deleted_at', null);

      if (docsError) throw docsError;

      // Map to return format, maintaining order from favorites
      const docMap = new Map(documents?.map(d => [d.id, d]) || []);
      
      return docIds
        .filter(id => docMap.has(id))
        .map(id => {
          const doc = docMap.get(id)!;
          return {
            id: doc.id,
            title: doc.title,
            category: doc.category || 'Sonstiges',
          };
        }) as FavoriteDocument[];
    },
  });

  const handleDocumentClick = (docId: string) => {
    navigate(`/documents?doc=${docId}`);
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'contract': 'Vertrag',
      'policy': 'Richtlinie',
      'certificate': 'Zertifikat',
      'report': 'Bericht',
      'invoice': 'Rechnung',
      'other': 'Sonstiges',
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <Card className="border-primary/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Favoriten
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Favoriten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {favoriteDocuments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Noch keine Favoriten. Klicken Sie auf den Stern bei einem Dokument, um es als Favorit zu markieren.
          </p>
        ) : (
          favoriteDocuments.map((doc) => (
            <div 
              key={doc.id} 
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleDocumentClick(doc.id)}
            >
              <div className="bg-muted p-2 rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{getCategoryLabel(doc.category)}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
