import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

type DocumentType = 'gehalt' | 'vertrag' | 'urlaub' | 'zertifikat' | 'sonstiges';

export const MyDocumentsWidget: React.FC = () => {
  const { companyId } = useCompanyId();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['employee-documents', companyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) return [];

      // Finde Employee-ID für den aktuellen User
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (!employee) return [];

      // Lade Dokumente des Mitarbeiters
      const { data: docs } = await supabase
        .from('employee_documents')
        .select('id, file_name, created_at, document_type, file_path')
        .eq('employee_id', employee.id)
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .limit(5);

      return docs || [];
    },
    enabled: !!companyId
  });

  const getTypeBadge = (type: string | null) => {
    const docType = (type?.toLowerCase() || 'sonstiges') as DocumentType;
    switch (docType) {
      case 'gehalt':
        return <Badge variant="outline" className="text-[9px] bg-green-100 text-green-700 border-green-300 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800">Gehalt</Badge>;
      case 'vertrag':
        return <Badge variant="outline" className="text-[9px] bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800">Vertrag</Badge>;
      case 'urlaub':
        return <Badge variant="outline" className="text-[9px] bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800">Urlaub</Badge>;
      case 'zertifikat':
        return <Badge variant="outline" className="text-[9px] bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800">Zertifikat</Badge>;
      default:
        return <Badge variant="outline" className="text-[9px]">Dokument</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .download(filePath);

      if (error || !data) {
        console.error('Download fehlgeschlagen:', error);
        return;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download fehlgeschlagen:', err);
    }
  };

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-600" />
          Meine Dokumente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-xs">Keine Dokumente vorhanden</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{doc.file_name}</p>
                <p className="text-[10px] text-muted-foreground">{formatDate(doc.created_at)}</p>
              </div>
              {getTypeBadge(doc.document_type)}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDownload(doc.file_path, doc.file_name)}
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
