import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface RecentDocumentsProps {
  title?: string;
  compact?: boolean;
}

interface RecentDocument {
  id: string;
  title: string;
  viewedAt: string;
}

const RecentDocuments = ({ title = "Zuletzt angesehen", compact = false }: RecentDocumentsProps) => {
  const navigate = useNavigate();

  const { data: recentDocuments = [], isLoading } = useQuery({
    queryKey: ['recent-documents'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get recent document views from access logs
      const { data: logs, error: logsError } = await supabase
        .from('document_access_logs')
        .select('document_id, performed_at')
        .eq('user_id', user.id)
        .eq('action', 'view')
        .order('performed_at', { ascending: false })
        .limit(20);

      if (logsError) throw logsError;
      if (!logs || logs.length === 0) return [];

      // Get unique document IDs (keep first occurrence = most recent)
      const uniqueDocIds = [...new Set(logs.map(l => l.document_id))].slice(0, 5);
      
      // Fetch document details
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('id, title')
        .in('id', uniqueDocIds)
        .is('deleted_at', null);

      if (docsError) throw docsError;

      // Map with viewed times
      const docMap = new Map(documents?.map(d => [d.id, d.title]) || []);
      const viewedMap = new Map<string, string>();
      logs.forEach(l => {
        if (!viewedMap.has(l.document_id)) {
          viewedMap.set(l.document_id, l.performed_at);
        }
      });

      return uniqueDocIds
        .filter(id => docMap.has(id))
        .map(id => ({
          id,
          title: docMap.get(id) || 'Unbekanntes Dokument',
          viewedAt: viewedMap.get(id) || new Date().toISOString(),
        })) as RecentDocument[];
    },
  });

  const handleDocumentClick = (docId: string) => {
    navigate(`/documents?doc=${docId}`);
  };

  if (isLoading) {
    return (
      <Card className="border-primary/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentDocuments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Noch keine Dokumente angesehen
          </p>
        ) : (
          recentDocuments.map((doc) => (
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
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(doc.viewedAt), { addSuffix: true, locale: de })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentDocuments;
