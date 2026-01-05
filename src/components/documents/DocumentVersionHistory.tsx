import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RotateCcw, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { documentService } from '@/services/documentService';

interface DocumentVersionHistoryProps {
  documentId: string;
}

interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_path: string;
  file_size: number;
  created_by: string;
  created_at: string;
  change_notes: string | null;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const DocumentVersionHistory = ({ documentId }: DocumentVersionHistoryProps) => {
  const { data: versions = [], isLoading, refetch } = useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_versions')
        .select(`
          *,
          user:profiles!document_versions_created_by_fkey(full_name, avatar_url)
        `)
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as DocumentVersion[];
    },
    enabled: !!documentId
  });

  const handleDownloadVersion = async (version: DocumentVersion) => {
    try {
      const result = await documentService.getDownloadUrl(version.file_path);
      
      if (!result?.data?.signedUrl) {
        toast.error('Download fehlgeschlagen');
        return;
      }

      window.open(result.data.signedUrl, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download fehlgeschlagen');
    }
  };

  const handleRestoreVersion = async (version: DocumentVersion) => {
    if (!confirm(`Version ${version.version_number} wiederherstellen?`)) return;

    try {
      // Aktuelles Dokument aktualisieren
      await supabase
        .from('documents')
        .update({ 
          file_path: version.file_path,
          file_size: version.file_size,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      toast.success(`Version ${version.version_number} wiederhergestellt`);
      refetch();
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Wiederherstellen fehlgeschlagen');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Keine Versionen vorhanden</p>
        <p className="text-xs mt-1">Änderungen werden hier aufgelistet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {versions.map((version, index) => (
        <div 
          key={version.id} 
          className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
        >
          {/* Version Number */}
          <div className="flex-shrink-0">
            <Badge 
              variant={index === 0 ? "default" : "secondary"}
              className="w-12 justify-center"
            >
              v{version.version_number}
            </Badge>
          </div>

          {/* Version Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">
                {version.user?.full_name || 'Unbekannt'}
              </span>
              <span className="text-muted-foreground">•</span>
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {format(new Date(version.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
              </span>
            </div>
            
            {version.change_notes && (
              <p className="text-sm text-muted-foreground mt-1">
                {version.change_notes}
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mt-1">
              {formatFileSize(version.file_size)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDownloadVersion(version)}
              title="Version herunterladen"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            {index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRestoreVersion(version)}
                title="Diese Version wiederherstellen"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentVersionHistory;
