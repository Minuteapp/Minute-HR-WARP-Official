import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Download, Eye, MoreVertical } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface DocumentListProps {
  projectId: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ projectId }) => {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['project-documents', companyId, projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_documents')
        .select(`
          *,
          employees:uploaded_by (first_name, last_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId && !!projectId
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'specification':
        return 'bg-blue-100 text-blue-800';
      case 'design':
        return 'bg-purple-100 text-purple-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'report':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'specification':
        return 'Spezifikation';
      case 'design':
        return 'Design';
      case 'contract':
        return 'Vertrag';
      case 'report':
        return 'Bericht';
      default:
        return 'Sonstiges';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Dokumente ({documents.length})</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Dokument hochladen
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Keine Dokumente vorhanden</p>
            <p className="text-sm mt-1">Laden Sie das erste Dokument für dieses Projekt hoch.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {documents.map((document: any) => (
            <Card key={document.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{document.name || document.file_name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(document.file_size || 0)}
                        </span>
                        {document.employees && (
                          <span className="text-sm text-muted-foreground">
                            Hochgeladen von {document.employees.first_name} {document.employees.last_name}
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(document.created_at), 'dd.MM.yyyy', { locale: de })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {document.category && (
                      <Badge className={getCategoryColor(document.category)}>
                        {getCategoryLabel(document.category)}
                      </Badge>
                    )}
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
